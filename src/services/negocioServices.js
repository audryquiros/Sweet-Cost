import { supabase, negocioFromDb, negocioToDb, requireNegocioId, throwSupabaseError, createId } from "../lib/supabaseData";

export const getNegocioActivoDesdeServidor = async () => {
  const id = requireNegocioId();
  const { data, error } = await supabase.from("negocios").select("*").eq("id", id).maybeSingle();
  throwSupabaseError(error, "Error al obtener los datos del negocio");
  if (!data) throw new Error("No se encontró el negocio activo.");
  return negocioFromDb(data);
};

export const getNegociosAdministrador = async (administradorId) => {
  const { data, error } = await supabase.from("negocios").select("*").eq("administrador_id", administradorId).order("nombre");
  throwSupabaseError(error, "Error al obtener los negocios");
  return (data || []).map(negocioFromDb);
};

export const createNegocio = async (negocio) => {
  const row = negocioToDb({ ...negocio, id: createId() });
  const { data, error } = await supabase.from("negocios").insert(row).select("*").single();
  throwSupabaseError(error, "Error al registrar el negocio");
  return negocioFromDb(data);
};

export const updateNegocio = async (id, cambios) => {
  const row = {};
  if ("nombre" in cambios) row.nombre = cambios.nombre;
  if ("tipo" in cambios) row.tipo = cambios.tipo;
  if ("telefono" in cambios) row.telefono = cambios.telefono || null;
  if ("correo" in cambios) row.correo = cambios.correo || null;
  if ("margenGanancia" in cambios) row.margen_ganancia = cambios.margenGanancia;
  const { data, error } = await supabase.from("negocios").update(row).eq("id", id).select("*").single();
  throwSupabaseError(error, "Error al actualizar los datos del negocio");
  return negocioFromDb(data);
};

export const deleteNegocio = async (id) => {
  const { error } = await supabase.from("negocios").delete().eq("id", id);
  throwSupabaseError(error, "Error al eliminar el negocio");
  return true;
};
