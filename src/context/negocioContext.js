const NEGOCIO_KEY = "sweetcost-negocio-activo";
const LEGACY_NEGOCIO_KEY = NEGOCIO_KEY;

function getNegocioKey(usuarioId) {
  return usuarioId ? `${NEGOCIO_KEY}:${usuarioId}` : NEGOCIO_KEY;
}
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

function getUsuarioSesion() {
  try {
    const guardado = sessionStorage.getItem("sweetcost-auth-user");
    return guardado ? JSON.parse(guardado) : null;
  } catch {
    return null;
  }
}

function obtenerIdsAutorizados(usuario) {
  if (!usuario) return [];

  const ids = new Set(
    Array.isArray(usuario.negocioIds)
      ? usuario.negocioIds.filter(Boolean)
      : []
  );

  if (usuario.negocioId) ids.add(usuario.negocioId);
  return [...ids];
}

/**
 * Devuelve únicamente un negocio al que el usuario autenticado tiene acceso.
 * El localStorage nunca se considera una fuente de autorización: solo puede
 * reutilizarse si el ID pertenece al usuario actual.
 */
export function getNegocioActivoId() {
  const usuario = getUsuarioSesion();
  if (!usuario) return null;

  const idsAutorizados = obtenerIdsAutorizados(usuario);
  if (!idsAutorizados.length) return null;

  // Cada usuario tiene su propia clave. Esto evita que una cuenta herede
  // el negocio activo de otra cuenta en el mismo navegador.
  const usuarioKey = getNegocioKey(usuario.id);
  const guardado = localStorage.getItem(usuarioKey);
  if (guardado && idsAutorizados.includes(guardado)) return guardado;

  if (usuario.negocioId && idsAutorizados.includes(usuario.negocioId)) {
    localStorage.setItem(usuarioKey, usuario.negocioId);
    return usuario.negocioId;
  }

  const primerNegocio = idsAutorizados[0];
  localStorage.setItem(usuarioKey, primerNegocio);
  return primerNegocio;
}

export function setNegocioActivoId(id) {
  if (!id) return false;

  const usuario = getUsuarioSesion();
  const autorizado = obtenerIdsAutorizados(usuario).includes(id);
  const existe = NEGOCIOS.some((negocio) => negocio.id === id);

  if (!autorizado || !existe) return false;

  localStorage.setItem(getNegocioKey(usuario.id), id);
  // Se elimina la clave global antigua para que nunca vuelva a contaminar
  // una sesión posterior.
  localStorage.removeItem(LEGACY_NEGOCIO_KEY);
  window.dispatchEvent(
    new CustomEvent("sweetcost-negocio-cambio", { detail: getNegocioActivo() })
  );
  return true;
}

export function getNegocioActivo() {
  const id = getNegocioActivoId();
  if (!id) return null;

  return (
    NEGOCIOS.find((negocio) => negocio.id === id) || {
      id,
      nombre: "Cargando negocio…",
      tipo: "",
      imagen: "",
    }
  );
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

  // No asignamos automáticamente el primer negocio del servidor.
  // El negocio activo siempre debe provenir de la sesión del usuario.
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

  // El negocio activo se valida contra la sesión actual. Nunca elegimos
  // NEGOCIOS[0] porque podría pertenecer a otro usuario.
  const negocioActivoId = getNegocioActivoId();
  const negocioActivo = negocioActivoId
    ? NEGOCIOS.find((negocio) => negocio.id === negocioActivoId)
    : null;

  window.dispatchEvent(
    new CustomEvent("sweetcost-negocios-cargados", { detail: [...NEGOCIOS] })
  );

  if (negocioActivo) {
    window.dispatchEvent(
      new CustomEvent("sweetcost-negocio-cambio", { detail: { ...negocioActivo } })
    );
  }
  return NEGOCIOS;
}

export function conNegocio(data) {
  const negocioId = getNegocioActivoId();
  if (!negocioId) throw new Error("No hay un negocio activo autorizado para esta sesión.");
  return { ...data, negocioId };
}

export function filtrarPorNegocio(items) {
  const negocioId = getNegocioActivoId();
  if (!negocioId) return [];

  return (Array.isArray(items) ? items : []).filter((item) => {
    if (Array.isArray(item?.negocioIds) && item.negocioIds.length) {
      return item.negocioIds.includes(negocioId);
    }

    // Los registros deben tener negocioId para pertenecer a un negocio.
    // No mostramos registros sin asociación porque podrían provenir de otro
    // negocio o de una versión anterior de los datos.
    return item?.negocioId === negocioId;
  });
}

export { NEGOCIO_KEY };
