import { supabase, recetaFromDb, recetaToDb, requireNegocioId, throwSupabaseError, createId } from "../lib/supabaseData";

async function obtenerIngredientes(recetaIds) {
  if (!recetaIds.length) return [];
  const { data, error } = await supabase.from("receta_ingredientes").select("*").in("receta_id", recetaIds);
  throwSupabaseError(error, "Error al obtener los ingredientes de las recetas");
  return data || [];
}

function ensamblar(recetas, ingredientes) {
  return recetas.map((receta) => recetaFromDb(receta, ingredientes.filter((i) => i.receta_id === receta.id)));
}

export const getRecetas = async () => {
  const negocioId = requireNegocioId();
  const { data, error } = await supabase.from("recetas").select("*").eq("negocio_id", negocioId).order("nombre");
  throwSupabaseError(error, "Error al obtener las recetas");
  const recetas = data || [];
  const ingredientes = await obtenerIngredientes(recetas.map((r) => r.id));
  return ensamblar(recetas, ingredientes);
};

export const getReceta = async (id) => {
  const negocioId = requireNegocioId();
  const { data, error } = await supabase.from("recetas").select("*").eq("id", id).eq("negocio_id", negocioId).maybeSingle();
  throwSupabaseError(error, "Error al obtener la receta");
  if (!data) throw new Error("La receta no pertenece al negocio activo o no existe.");
  const ingredientes = await obtenerIngredientes([id]);
  return recetaFromDb(data, ingredientes);
};

async function guardarIngredientes(recetaId, ingredientes = []) {
  const { error: deleteError } = await supabase.from("receta_ingredientes").delete().eq("receta_id", recetaId);
  throwSupabaseError(deleteError, "No se pudieron actualizar los ingredientes de la receta");
  const rows = ingredientes
    .filter((item) => item?.productoId && item?.cantidad != null)
    .map((item) => ({ receta_id: recetaId, producto_id: item.productoId, cantidad: item.cantidad, unidad: item.unidad ?? null }));
  if (!rows.length) return;
  const { error } = await supabase.from("receta_ingredientes").insert(rows);
  throwSupabaseError(error, "No se pudieron guardar los ingredientes de la receta");
}

export const createReceta = async (receta) => {
  const row = recetaToDb({ ...receta, id: createId() });
  const { data, error } = await supabase.from("recetas").insert(row).select("*").single();
  throwSupabaseError(error, "Error al crear la receta");
  try {
    await guardarIngredientes(data.id, receta.ingredientes);
  } catch (e) {
    await supabase.from("recetas").delete().eq("id", data.id);
    throw e;
  }
  return getReceta(data.id);
};

export const updateReceta = async (id, receta) => {
  const negocioId = requireNegocioId();
  const row = recetaToDb({ ...receta, id }, negocioId);
  const { data, error } = await supabase.from("recetas").update(row).eq("id", id).eq("negocio_id", negocioId).select("*").single();
  throwSupabaseError(error, "Error al actualizar la receta");
  await guardarIngredientes(id, receta.ingredientes);
  return recetaFromDb(data, await obtenerIngredientes([id]));
};

export const deleteReceta = async (id) => {
  const negocioId = requireNegocioId();
  const { error } = await supabase.from("recetas").delete().eq("id", id).eq("negocio_id", negocioId);
  throwSupabaseError(error, "Error al eliminar la receta");
  return true;
};
