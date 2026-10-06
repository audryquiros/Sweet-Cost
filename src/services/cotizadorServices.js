import { supabase, cotizacionFromDb, cotizacionToDb, requireNegocioId, throwSupabaseError, createId } from "../lib/supabaseData";

async function obtenerInsumosDetalle(ids) {
  if (!ids.length) return [];
  const { data, error } = await supabase.from("cotizacion_insumos").select("*").in("cotizacion_id", ids);
  throwSupabaseError(error, "Error al obtener los insumos de las cotizaciones");
  return data || [];
}

function ensamblar(rows, details) {
  return rows.map((row) => cotizacionFromDb(row, details.filter((d) => d.cotizacion_id === row.id)));
}

export const getCotizaciones = async () => {
  const negocioId = requireNegocioId();
  const { data, error } = await supabase.from("cotizaciones").select("*").eq("negocio_id", negocioId).order("fecha", { ascending: false });
  throwSupabaseError(error, "Error al obtener las cotizaciones");
  const rows = data || [];
  return ensamblar(rows, await obtenerInsumosDetalle(rows.map((r) => r.id)));
};

export const getCotizacion = async (id) => {
  const negocioId = requireNegocioId();
  const { data, error } = await supabase.from("cotizaciones").select("*").eq("id", id).eq("negocio_id", negocioId).maybeSingle();
  throwSupabaseError(error, "Error al obtener la cotización");
  if (!data) throw new Error("La cotización no pertenece al negocio activo o no existe.");
  return cotizacionFromDb(data, await obtenerInsumosDetalle([id]));
};

async function guardarInsumos(cotizacionId, insumos = []) {
  const { error: delError } = await supabase.from("cotizacion_insumos").delete().eq("cotizacion_id", cotizacionId);
  throwSupabaseError(delError, "No se pudieron actualizar los insumos de la cotización");
  const rows = insumos.filter((i) => i?.insumoId).map((i) => ({ cotizacion_id: cotizacionId, insumo_id: i.insumoId, cantidad_por_envase: i.cantidadPorEnvase ?? null, cantidad_total: i.cantidadTotal ?? null }));
  if (!rows.length) return;
  const { error } = await supabase.from("cotizacion_insumos").insert(rows);
  throwSupabaseError(error, "No se pudieron guardar los insumos de la cotización");
}

export const createCotizacion = async (cotizacion) => {
  const row = cotizacionToDb({ ...cotizacion, id: createId() });
  const { data, error } = await supabase.from("cotizaciones").insert(row).select("*").single();
  throwSupabaseError(error, "Error al crear la cotización");
  try {
    await guardarInsumos(data.id, cotizacion.insumos);
  } catch (e) {
    await supabase.from("cotizaciones").delete().eq("id", data.id);
    throw e;
  }
  return getCotizacion(data.id);
};

export const updateCotizacion = async (id, cotizacion) => {
  const negocioId = requireNegocioId();
  const row = cotizacionToDb({ ...cotizacion, id }, negocioId);
  const { data, error } = await supabase.from("cotizaciones").update(row).eq("id", id).eq("negocio_id", negocioId).select("*").single();
  throwSupabaseError(error, "Error al actualizar la cotización");
  await guardarInsumos(id, cotizacion.insumos);
  return getCotizacion(data.id);
};

export const deleteCotizacion = async (id) => {
  const negocioId = requireNegocioId();
  const { error } = await supabase.from("cotizaciones").delete().eq("id", id).eq("negocio_id", negocioId);
  throwSupabaseError(error, "Error al eliminar la cotización");
  return true;
};
