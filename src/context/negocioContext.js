import { supabase } from "../lib/supabase";

const NEGOCIO_KEY = "sweetcost-negocio-activo";
const LEGACY_NEGOCIO_KEY = NEGOCIO_KEY;
const NEGOCIOS_KEY = "sweetcost-negocios-autorizados";

function getNegocioKey(usuarioId) {
  return usuarioId ? `${NEGOCIO_KEY}:${usuarioId}` : NEGOCIO_KEY;
}

function getUsuarioSesion() {
  try {
    const guardado = sessionStorage.getItem("sweetcost-auth-user");
    return guardado ? JSON.parse(guardado) : null;
  } catch {
    return null;
  }
}

function negocioFromDb(row) {
  if (!row) return row;
  return {
    ...row,
    margenGanancia: row.margen_ganancia,
    administradorId: row.administrador_id,
  };
}

function leerNegociosAutorizados() {
  try {
    const datos = JSON.parse(sessionStorage.getItem(NEGOCIOS_KEY) || "[]");
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

export const NEGOCIOS = [];

export function hidratarNegocios(negocios = []) {
  NEGOCIOS.splice(0, NEGOCIOS.length, ...negocios.map(negocioFromDb));
  try {
    sessionStorage.setItem(NEGOCIOS_KEY, JSON.stringify(NEGOCIOS));
  } catch {}
  return NEGOCIOS;
}

// Inicializa el cache en caso de que el módulo se cargue después del login.
hidratarNegocios(leerNegociosAutorizados());

function obtenerIdsAutorizados(usuario) {
  if (!usuario) return [];
  const ids = new Set(Array.isArray(usuario.negocioIds) ? usuario.negocioIds.filter(Boolean) : []);
  if (usuario.negocioId) ids.add(usuario.negocioId);
  return [...ids];
}

export function getNegocioActivoId() {
  const usuario = getUsuarioSesion();
  if (!usuario) return null;
  const idsAutorizados = obtenerIdsAutorizados(usuario);
  if (!idsAutorizados.length) return null;

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
  if (!usuario || !obtenerIdsAutorizados(usuario).includes(id)) return false;

  localStorage.setItem(getNegocioKey(usuario.id), id);
  localStorage.removeItem(LEGACY_NEGOCIO_KEY);
  const negocio = NEGOCIOS.find((item) => item.id === id);
  if (negocio) window.dispatchEvent(new CustomEvent("sweetcost-negocio-cambio", { detail: negocio }));
  return Boolean(negocio);
}

export function getNegocioActivo() {
  const id = getNegocioActivoId();
  if (!id) return null;
  return NEGOCIOS.find((negocio) => negocio.id === id) || {
    id,
    nombre: "Cargando negocio…",
    tipo: "",
    imagen: "",
  };
}

export function sincronizarNegocioActivo(datos) {
  if (!datos?.id) return;
  const indice = NEGOCIOS.findIndex((negocio) => negocio.id === datos.id);
  if (indice >= 0) NEGOCIOS[indice] = { ...NEGOCIOS[indice], ...negocioFromDb(datos) };
  else NEGOCIOS.push(negocioFromDb(datos));
  try { sessionStorage.setItem(NEGOCIOS_KEY, JSON.stringify(NEGOCIOS)); } catch {}
  if (getNegocioActivoId() === datos.id) window.dispatchEvent(new CustomEvent("sweetcost-negocio-cambio", { detail: getNegocioActivo() }));
}

export async function cargarNegociosDesdeServidor() {
  const usuario = getUsuarioSesion();
  if (!usuario) return [];
  const ids = obtenerIdsAutorizados(usuario);
  if (!ids.length) return [];
  const { data, error } = await supabase.from("negocios").select("*").in("id", ids).order("nombre");
  if (error) throw new Error(error.message || "No se pudieron cargar los negocios");
  hidratarNegocios(data || []);
  window.dispatchEvent(new CustomEvent("sweetcost-negocios-cargados", { detail: [...NEGOCIOS] }));
  const activo = getNegocioActivo();
  if (activo) window.dispatchEvent(new CustomEvent("sweetcost-negocio-cambio", { detail: activo }));
  return NEGOCIOS;
}

export async function getNegociosAutorizados() {
  return cargarNegociosDesdeServidor();
}

export function conNegocio(data) {
  const negocioId = getNegocioActivoId();
  if (!negocioId) throw new Error("No hay un negocio activo autorizado para esta sesión.");
  return { ...data, negocioId };
}

export function filtrarPorNegocio(items) {
  const negocioId = getNegocioActivoId();
  if (!negocioId) return [];
  return (Array.isArray(items) ? items : []).filter((item) => item?.negocioId === negocioId);
}

export { NEGOCIO_KEY, NEGOCIOS_KEY };
