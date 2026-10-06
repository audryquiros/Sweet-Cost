import { supabase, asistenciaFromDb, asistenciaToDb, requireNegocioId, throwSupabaseError, createId } from "../lib/supabaseData";

export const getAsistencias = async () => {
  const negocioId = requireNegocioId();
  const { data, error } = await supabase.from("asistencias").select("*").eq("negocio_id", negocioId).order("fecha", { ascending: false });
  throwSupabaseError(error, "Error al obtener los registros de asistencia");
  return (data || []).map(asistenciaFromDb);
};

export const registrarIngreso = async ({ empleadoId, empleadoNombre }) => {
  if (!empleadoId) throw new Error("No se encontró el empleado que realizará el registro.");
  const negocioId = requireNegocioId();
  const ahora = new Date();
  const fecha = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-${String(ahora.getDate()).padStart(2, "0")}`;
  const { data: existentes, error: existingError } = await supabase.from("asistencias").select("*").eq("empleado_id", empleadoId).eq("negocio_id", negocioId).eq("fecha", fecha).limit(1);
  throwSupabaseError(existingError, "No se pudo comprobar la jornada actual");
  if (existentes?.[0]) return asistenciaFromDb(existentes[0]);

  const row = asistenciaToDb({ id: createId(), empleadoId, empleadoNombre: empleadoNombre || "Empleado", fecha, ingreso: ahora.toTimeString().slice(0, 8), salida: null });
  const { data, error } = await supabase.from("asistencias").insert(row).select("*").single();
  throwSupabaseError(error, "No se pudo registrar el ingreso");
  return asistenciaFromDb(data);
};

export const registrarSalida = async (id) => {
  const now = new Date();
  const negocioId = requireNegocioId();
  const { data, error } = await supabase.from("asistencias").update({ salida: now.toTimeString().slice(0, 8) }).eq("id", id).eq("negocio_id", negocioId).select("*").single();
  throwSupabaseError(error, "No se pudo registrar la salida");
  return asistenciaFromDb(data);
};

export const eliminarAsistencia = async (id) => {
  const negocioId = requireNegocioId();
  const { error } = await supabase.from("asistencias").delete().eq("id", id).eq("negocio_id", negocioId);
  throwSupabaseError(error, "No se pudo eliminar el registro");
  return true;
};

export const actualizarHorario = async (id, { ingreso, salida }) => {
  const negocioId = requireNegocioId();
  const toTime = (value) => value ? new Date(value).toTimeString().slice(0, 8) : null;
  const { data, error } = await supabase.from("asistencias").update({ ingreso: toTime(ingreso), salida: toTime(salida) }).eq("id", id).eq("negocio_id", negocioId).select("*").single();
  throwSupabaseError(error, "No se pudo actualizar el horario");
  return asistenciaFromDb(data);
};
