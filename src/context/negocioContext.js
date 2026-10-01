const NEGOCIO_KEY = "sweetcost-negocio-activo";
const API_URL = "http://localhost:3001/negocios";

async function hidratarImagenNegocio(negocio) {
  if (!negocio?.id) return negocio;
  try {
    const modulo = await import("../utils/imagenStorage");
    const url = await modulo.obtenerImagenNegocio(negocio.id);
    return url ? { ...negocio, imagen: url } : { ...negocio, imagen: "" };
  } catch {
    return negocio;
  }
}

// Fallback inicial. Los datos reales se sincronizan desde db.json al iniciar la app.
export const NEGOCIOS = [
  {
    id: "dulces-momentos",
    nombre: "Dulces Momentos",
    tipo: "Repostería",
    imagen: "",
  },
];

export function getNegocioActivoId() {
  return localStorage.getItem(NEGOCIO_KEY) || NEGOCIOS[0]?.id || "dulces-momentos";
}

export function setNegocioActivoId(id) {
  const existe = NEGOCIOS.some((negocio) => negocio.id === id);
  if (!existe) return false;
  localStorage.setItem(NEGOCIO_KEY, id);
  window.dispatchEvent(new CustomEvent("sweetcost-negocio-cambio", { detail: getNegocioActivo() }));
  return true;
}

export function getNegocioActivo() {
  const id = getNegocioActivoId();
  return NEGOCIOS.find((negocio) => negocio.id === id) || NEGOCIOS[0];
}

/** Sincroniza un negocio que acaba de venir de JSON Server. */
export function sincronizarNegocioActivo(datos) {
  if (!datos?.id) return;

  const indice = NEGOCIOS.findIndex((negocio) => negocio.id === datos.id);
  if (indice >= 0) {
    NEGOCIOS[indice] = { ...NEGOCIOS[indice], ...datos };
  } else {
    NEGOCIOS.push(datos);
  }

  if (!localStorage.getItem(NEGOCIO_KEY)) {
    localStorage.setItem(NEGOCIO_KEY, datos.id);
  }

  if (getNegocioActivoId() === datos.id) {
    window.dispatchEvent(new CustomEvent("sweetcost-negocio-cambio", { detail: { ...getNegocioActivo() } }));
  }
}

/** Carga todos los negocios desde db.json para que el contexto no dependa de datos hardcodeados. */
export async function cargarNegociosDesdeServidor() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("No se pudieron cargar los negocios");

  const datos = await response.json();
  if (!Array.isArray(datos) || datos.length === 0) return [];

  const datosHidratados = await Promise.all(datos.map(hidratarImagenNegocio));
  NEGOCIOS.splice(0, NEGOCIOS.length, ...datosHidratados);

  const idGuardado = localStorage.getItem(NEGOCIO_KEY);
  const existeGuardado = NEGOCIOS.some((negocio) => negocio.id === idGuardado);
  if (!existeGuardado) {
    localStorage.setItem(NEGOCIO_KEY, NEGOCIOS[0].id);
  }

  window.dispatchEvent(new CustomEvent("sweetcost-negocios-cargados", { detail: [...NEGOCIOS] }));
  window.dispatchEvent(new CustomEvent("sweetcost-negocio-cambio", { detail: { ...getNegocioActivo() } }));
  return NEGOCIOS;
}

export function conNegocio(data) {
  return { ...data, negocioId: getNegocioActivoId() };
}

export function filtrarPorNegocio(items) {
  const negocioId = getNegocioActivoId();
  return (Array.isArray(items) ? items : []).filter((item) => {
    if (Array.isArray(item?.negocioIds) && item.negocioIds.length) {
      return item.negocioIds.includes(negocioId);
    }
    return !item?.negocioId || item.negocioId === negocioId;
  });
}

export { NEGOCIO_KEY };
