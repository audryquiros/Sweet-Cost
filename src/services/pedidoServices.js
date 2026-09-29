const API_URL = "http://localhost:3001/pedidos";
const CACHE_KEY = "sweetcost-pedidos-cache-v1";

function leerCache() {
  try {
    const valor = localStorage.getItem(CACHE_KEY);
    const datos = valor ? JSON.parse(valor) : [];
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

function guardarCache(pedidos) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(pedidos));
  } catch {
    // La API sigue siendo la fuente principal si el almacenamiento local no está disponible.
  }
}

function fusionarPedidos(pedidosServidor, pedidosLocales) {
  const mapa = new Map();

  pedidosServidor.forEach((pedido) => mapa.set(String(pedido.id), pedido));
  pedidosLocales.forEach((pedido) => {
    const id = String(pedido.id);
    if (!mapa.has(id)) mapa.set(id, pedido);
  });

  return Array.from(mapa.values());
}

async function sincronizarCacheConServidor(pedidosServidor) {
  const locales = leerCache();
  if (!locales.length) {
    guardarCache(pedidosServidor);
    return pedidosServidor;
  }

  const idsServidor = new Set(pedidosServidor.map((pedido) => String(pedido.id)));
  const pendientesDeSincronizar = locales.filter(
    (pedido) => !idsServidor.has(String(pedido.id))
  );

  // Si el proyecto se reemplazó o json-server perdió el contenido, intentamos
  // reconstruir en el servidor los pedidos que ya estaban guardados localmente.
  if (pendientesDeSincronizar.length) {
    const resultados = await Promise.allSettled(
      pendientesDeSincronizar.map(async (pedido) => {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pedido),
        });
        if (!response.ok) throw new Error("No se pudo sincronizar el pedido");
        return response.json();
      })
    );

    resultados.forEach((resultado, index) => {
      if (resultado.status === "fulfilled") {
        const original = pendientesDeSincronizar[index];
        const actualizado = resultado.value;
        const posicion = locales.findIndex(
          (pedido) => String(pedido.id) === String(original.id)
        );
        if (posicion !== -1) locales[posicion] = actualizado;
      }
    });
  }

  const fusionados = fusionarPedidos(pedidosServidor, locales);
  guardarCache(fusionados);
  return fusionados;
}

export const getPedidos = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Error al obtener los pedidos");
    const pedidosServidor = await response.json();
    return sincronizarCacheConServidor(pedidosServidor);
  } catch (error) {
    const locales = leerCache();
    if (locales.length) return locales;
    throw error;
  }
};

export const getPedido = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (response.ok) {
      const pedido = await response.json();
      const locales = leerCache();
      const fusionados = fusionarPedidos([pedido], locales);
      guardarCache(fusionados);
      return pedido;
    }

    if (response.status !== 404) {
      throw new Error("Error al obtener el pedido");
    }
  } catch (error) {
    const local = leerCache().find((pedido) => String(pedido.id) === String(id));
    if (local) return local;
    throw error;
  }

  const local = leerCache().find((pedido) => String(pedido.id) === String(id));
  if (local) return local;
  throw new Error("Error al obtener el pedido");
};

export const createPedido = async (pedido) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pedido),
    });
    if (!response.ok) throw new Error("Error al crear el pedido");

    const creado = await response.json();
    const locales = leerCache().filter(
      (item) => String(item.id) !== String(creado.id)
    );
    guardarCache([...locales, creado]);
    return creado;
  } catch (error) {
    // Fallback para que el pedido no se pierda si json-server está apagado.
    const pedidoLocal = {
      ...pedido,
      id: pedido.id || `local-${Date.now()}`,
    };
    const locales = leerCache().filter(
      (item) => String(item.id) !== String(pedidoLocal.id)
    );
    guardarCache([...locales, pedidoLocal]);
    return pedidoLocal;
  }
};

export const updatePedido = async (id, pedido) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pedido),
    });

    if (!response.ok && response.status !== 404) {
      throw new Error("Error al actualizar el pedido");
    }

    if (response.ok) {
      const actualizado = await response.json();
      const locales = leerCache().filter(
        (item) => String(item.id) !== String(actualizado.id)
      );
      guardarCache([...locales, actualizado]);
      return actualizado;
    }
  } catch (error) {
    const local = leerCache().some((item) => String(item.id) === String(id));
    if (!local) throw error;
  }

  const actualizadoLocal = { ...pedido, id };
  const locales = leerCache().filter((item) => String(item.id) !== String(id));
  guardarCache([...locales, actualizadoLocal]);
  return actualizadoLocal;
};

export const deletePedido = async (id) => {
  const locales = leerCache();
  const existeLocal = locales.some((pedido) => String(pedido.id) === String(id));

  try {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!response.ok && response.status !== 404) {
      throw new Error("Error al eliminar el pedido");
    }
  } catch (error) {
    if (!existeLocal) throw error;
  }

  guardarCache(locales.filter((pedido) => String(pedido.id) !== String(id)));
  return true;
};
