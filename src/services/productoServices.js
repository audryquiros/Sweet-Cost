import { supabase, productoFromDb, productoToDb, requireNegocioId, throwSupabaseError, createId } from "../lib/supabaseData";

export const getProductos = async () => {
  const negocioId = requireNegocioId();
  const { data, error } = await supabase.from("productos").select("*").eq("negocio_id", negocioId).order("nombre");
  throwSupabaseError(error, "Error al obtener los productos");
  return (data || []).map(productoFromDb);
};

export const getProducto = async (id) => {
  const negocioId = requireNegocioId();
  const { data, error } = await supabase.from("productos").select("*").eq("id", id).eq("negocio_id", negocioId).maybeSingle();
  throwSupabaseError(error, "Error al obtener el producto");
  if (!data) throw new Error("El producto no pertenece al negocio activo o no existe.");
  return productoFromDb(data);
};

export const createProducto = async (producto) => {
  const row = productoToDb({ ...producto, id: createId() });
  const { data, error } = await supabase.from("productos").insert(row).select("*").single();
  throwSupabaseError(error, "Error al crear el producto");
  return productoFromDb(data);
};

export const updateProducto = async (id, producto) => {
  const negocioId = requireNegocioId();
  const row = productoToDb({ ...producto, id }, negocioId);
  const { data, error } = await supabase.from("productos").update(row).eq("id", id).eq("negocio_id", negocioId).select("*").single();
  throwSupabaseError(error, "Error al actualizar el producto");
  return productoFromDb(data);
};

export const getRecetasQueUsanProducto = async (id) => {
  const negocioId = requireNegocioId();

  const { data: relaciones, error: relacionesError } = await supabase
    .from("receta_ingredientes")
    .select("receta_id")
    .eq("producto_id", id);
  throwSupabaseError(relacionesError, "Error al comprobar el uso del producto");

  const recetaIds = [...new Set((relaciones || []).map((item) => item.receta_id).filter(Boolean))];
  if (!recetaIds.length) return [];

  const { data: recetas, error: recetasError } = await supabase
    .from("recetas")
    .select("id, nombre")
    .in("id", recetaIds)
    .eq("negocio_id", negocioId)
    .order("nombre");
  throwSupabaseError(recetasError, "Error al comprobar las recetas relacionadas");

  return recetas || [];
};

export const deleteProducto = async (id) => {
  const negocioId = requireNegocioId();
  const { error } = await supabase.from("productos").delete().eq("id", id).eq("negocio_id", negocioId);
  throwSupabaseError(error, "Error al eliminar el producto");
  return true;
};
