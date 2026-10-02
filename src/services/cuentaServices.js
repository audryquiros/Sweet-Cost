const API_BASE = "http://localhost:3001";

const COLECCIONES_POR_NEGOCIO = [
  "productos",
  "insumos",
  "recetas",
  "cotizaciones",
  "pedidos",
  "asistencias",
];

const API = {
  empleados: `${API_BASE}/empleados`,
  negocios: `${API_BASE}/negocios`,
  recuperaciones: `${API_BASE}/recuperaciones`,
};

async function obtenerColeccion(nombre) {
  const response = await fetch(`${API_BASE}/${nombre}`);
  if (!response.ok) {
    if (response.status === 404) return [];
    throw new Error(`No se pudo consultar ${nombre}.`);
  }
  return response.json();
}

async function eliminarRegistro(nombre, id) {
  const response = await fetch(`${API_BASE}/${nombre}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (!response.ok && response.status !== 404) {
    throw new Error(`No se pudo eliminar un registro de ${nombre}.`);
  }
}

async function actualizarRegistro(nombre, id, cambios) {
  const response = await fetch(`${API_BASE}/${nombre}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cambios),
  });

  if (!response.ok) {
    throw new Error(`No se pudo actualizar un registro de ${nombre}.`);
  }

  return response.json();
}

async function eliminarImagenNegocio(negocioId) {
  try {
    const modulo = await import("../utils/imagenStorage");
    await modulo.eliminarImagenNegocio(negocioId);
  } catch {
    // La imagen es almacenamiento local; no debe impedir el borrado de los datos.
  }
}

/**
 * Elimina todos los datos que pertenecen exclusivamente a un negocio.
 * También actualiza o elimina empleados asociados al negocio.
 */
async function eliminarDatosDelNegocio(negocioId) {
  const empleados = await obtenerColeccion("empleados");

  const empleadosAfectados = empleados.filter((empleado) => {
    const ids = Array.isArray(empleado.negocioIds) && empleado.negocioIds.length
      ? empleado.negocioIds
      : empleado.negocioId
        ? [empleado.negocioId]
        : [];

    return ids.includes(negocioId);
  });

  // Primero eliminamos la información operativa del negocio.
  await Promise.all(
    COLECCIONES_POR_NEGOCIO.map(async (coleccion) => {
      const registros = await obtenerColeccion(coleccion);
      const propios = registros.filter((registro) => registro?.negocioId === negocioId);
      await Promise.all(propios.map((registro) => eliminarRegistro(coleccion, registro.id)));
    })
  );

  // Las recuperaciones están vinculadas al empleado, no necesariamente al negocio.
  const recuperaciones = await obtenerColeccion("recuperaciones");
  const idsEmpleadosAfectados = new Set(empleadosAfectados.map((empleado) => empleado.id));
  const recuperacionesAfectadas = recuperaciones.filter((item) => idsEmpleadosAfectados.has(item.empleadoId));
  await Promise.all(
    recuperacionesAfectadas.map((item) => eliminarRegistro("recuperaciones", item.id))
  );

  // Un empleado puede pertenecer a varios negocios. Si conserva alguno, solo se
  // elimina la asociación; si no conserva ninguno, se elimina su cuenta.
  await Promise.all(
    empleadosAfectados.map(async (empleado) => {
      const idsActuales = Array.isArray(empleado.negocioIds) && empleado.negocioIds.length
        ? empleado.negocioIds
        : empleado.negocioId
          ? [empleado.negocioId]
          : [];

      const restantes = idsActuales.filter((id) => id !== negocioId);

      if (restantes.length) {
        const negocioIdActivo = restantes.includes(empleado.negocioId)
          ? empleado.negocioId
          : restantes[0];

        await actualizarRegistro("empleados", empleado.id, {
          negocioId: negocioIdActivo,
          negocioIds: restantes,
        });
      } else {
        await eliminarRegistro("empleados", empleado.id);
      }
    })
  );

  await eliminarRegistro("negocios", negocioId);
  await eliminarImagenNegocio(negocioId);

  return empleadosAfectados;
}

export async function eliminarNegocioComoAdministrador({ negocioId, administradorId }) {
  if (!negocioId || !administradorId) {
    throw new Error("No se pudo identificar el negocio o la cuenta administradora.");
  }

  const negocios = await obtenerColeccion("negocios");
  const negocio = negocios.find((item) => item.id === negocioId);

  if (!negocio) throw new Error("El negocio ya no existe.");
  if (negocio.administradorId !== administradorId) {
    throw new Error("No tienes permiso para eliminar este negocio.");
  }

  const negociosDelAdministrador = negocios.filter(
    (item) => item.administradorId === administradorId
  );

  const eliminaCuenta = negociosDelAdministrador.length === 1;

  await eliminarDatosDelNegocio(negocioId);

  if (eliminaCuenta) {
    // Si era el último negocio, la cuenta del administrador también debe desaparecer.
    const empleado = await fetch(`${API.empleados}/${encodeURIComponent(administradorId)}`);
    if (empleado.ok) {
      const datos = await empleado.json();
      const recuperaciones = await obtenerColeccion("recuperaciones");
      const propias = recuperaciones.filter((item) => item.empleadoId === administradorId);
      await Promise.all(propias.map((item) => eliminarRegistro("recuperaciones", item.id)));
      await eliminarRegistro("empleados", datos.id);
    }
  } else {
    const restantes = negociosDelAdministrador.filter((item) => item.id !== negocioId);
    const empleadoResponse = await fetch(`${API.empleados}/${encodeURIComponent(administradorId)}`);
    if (empleadoResponse.ok) {
      const empleado = await empleadoResponse.json();
      const idsActuales = Array.isArray(empleado.negocioIds) ? empleado.negocioIds : [];
      const idsRestantes = [...new Set([
        ...idsActuales.filter((id) => id !== negocioId),
        ...restantes.map((item) => item.id),
      ])];
      const negocioActivo = idsRestantes.includes(empleado.negocioId)
        ? empleado.negocioId
        : idsRestantes[0] || null;

      await actualizarRegistro("empleados", administradorId, {
        negocioId: negocioActivo,
        negocioIds: idsRestantes,
      });
    }
  }

  return {
    cuentaEliminada: eliminaCuenta,
    negociosRestantes: negociosDelAdministrador.filter((item) => item.id !== negocioId),
  };
}

export async function eliminarCuentaAdministrador(administradorId) {
  if (!administradorId) {
    throw new Error("No se pudo identificar la cuenta.");
  }

  const negocios = await obtenerColeccion("negocios");
  const propios = negocios.filter((item) => item.administradorId === administradorId);

  for (const negocio of propios) {
    await eliminarDatosDelNegocio(negocio.id);
  }

  // Elimina cualquier recuperación restante de la cuenta administradora.
  const recuperaciones = await obtenerColeccion("recuperaciones");
  const propiasRecuperaciones = recuperaciones.filter((item) => item.empleadoId === administradorId);
  await Promise.all(
    propiasRecuperaciones.map((item) => eliminarRegistro("recuperaciones", item.id))
  );

  await eliminarRegistro("empleados", administradorId);

  return { cuentaEliminada: true, negociosEliminados: propios.map((item) => item.id) };
}
