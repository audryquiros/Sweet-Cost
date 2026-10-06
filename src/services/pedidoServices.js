import { supabase, pedidoFromDb, pedidoToDb, requireNegocioId, throwSupabaseError, createId } from "../lib/supabaseData";

const CACHE_KEY = "sweetcost-pedidos-cache-v1";

function leerCache() {
  try {
    const data = JSON.parse(localStorage.getItem(CACHE_KEY) || "[]");
    const negocioId = getNegocioActivoIdSafe();
    return data.filter((item) => item?.negocioId === negocioId);
  } catch { return []; }
}
function getNegocioActivoIdSafe() { try { return requireNegocioId(); } catch { return null; } }
function guardarCache(pedidos) { try { localStorage.setItem(CACHE_KEY, JSON.stringify(pedidos)); } catch {} }

async function obtenerDetalles(ids) {
  if (!ids.length) return [];
  const { data, error } = await supabase.from("pedido_insumos").select("*").in("pedido_id", ids);
  throwSupabaseError(error, "Error al obtener los insumos de los pedidos");
  return data || [];
}
function ensamblar(rows, details) { return rows.map((r) => pedidoFromDb(r, details.filter((d) => d.pedido_id === r.id))); }

export const getPedidos = async () => {
  const negocioId = requireNegocioId();
  const { data, error } = await supabase.from("pedidos").select("*").eq("negocio_id", negocioId).order("fecha_entrega", { ascending: true });
  throwSupabaseError(error, "Error al obtener los pedidos");
  const pedidos = ensamblar(data || [], await obtenerDetalles((data || []).map((p) => p.id)));
  guardarCache(pedidos);
  return pedidos;
};

export const getPedido = async (id) => {
  const negocioId = requireNegocioId();
  const { data, error } = await supabase.from("pedidos").select("*").eq("id", id).eq("negocio_id", negocioId).maybeSingle();
  throwSupabaseError(error, "Error al obtener el pedido");
  if (!data) throw new Error("El pedido no pertenece al negocio activo o no existe.");
  return pedidoFromDb(data, await obtenerDetalles([id]));
};

async function guardarDetalles(pedidoId, insumos = []) {
  const { error: delError } = await supabase.from("pedido_insumos").delete().eq("pedido_id", pedidoId);
  throwSupabaseError(delError, "No se pudieron actualizar los insumos del pedido");
  const rows = insumos.filter((i) => i?.insumoId).map((i) => ({ pedido_id: pedidoId, insumo_id: i.insumoId, cantidad_por_envase: i.cantidadPorEnvase ?? null, cantidad_total: i.cantidadTotal ?? null }));
  if (!rows.length) return;
  const { error } = await supabase.from("pedido_insumos").insert(rows);
  throwSupabaseError(error, "No se pudieron guardar los insumos del pedido");
}

export const createPedido = async (pedido) => {
  const row = pedidoToDb({ ...pedido, id: createId() });
  const { data, error } = await supabase.from("pedidos").insert(row).select("*").single();
  throwSupabaseError(error, "Error al crear el pedido");
  try { await guardarDetalles(data.id, pedido.insumos); } catch (e) { await supabase.from("pedidos").delete().eq("id", data.id); throw e; }
  const creado = await getPedido(data.id);
  const actuales = leerCache().filter((p) => String(p.id) !== String(creado.id));
  guardarCache([...actuales, creado]);
  return creado;
};

export const updatePedido = async (id, pedido) => {
  const negocioId = requireNegocioId();
  const row = pedidoToDb({ ...pedido, id }, negocioId);
  const { data, error } = await supabase.from("pedidos").update(row).eq("id", id).eq("negocio_id", negocioId).select("*").single();
  throwSupabaseError(error, "Error al actualizar el pedido");
  await guardarDetalles(id, pedido.insumos);
  const actualizado = await getPedido(data.id);
  const actuales = leerCache().filter((p) => String(p.id) !== String(id));
  guardarCache([...actuales, actualizado]);
  return actualizado;
};

export const deletePedido = async (id) => {
  const negocioId = requireNegocioId();
  const { error } = await supabase.from("pedidos").delete().eq("id", id).eq("negocio_id", negocioId);
  throwSupabaseError(error, "Error al eliminar el pedido");
  guardarCache(leerCache().filter((p) => String(p.id) !== String(id)));
  return true;
};
