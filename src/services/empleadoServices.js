import { supabase, empleadoFromDb, requireNegocioId, throwSupabaseError, createId } from "../lib/supabaseData";

async function relacionesParaEmpleados(ids) {
  if (!ids.length) return [];
  const { data, error } = await supabase.from("empleado_negocios").select("empleado_id, negocio_id").in("empleado_id", ids);
  throwSupabaseError(error, "Error al obtener las asociaciones de empleados");
  return data || [];
}

function ensamblar(rows, relaciones) {
  return rows.map((row) => empleadoFromDb(row, relaciones.filter((r) => r.empleado_id === row.id).map((r) => r.negocio_id)));
}

export const getEmpleados = async () => {
  const negocioId = requireNegocioId();
  const { data: rel, error: relError } = await supabase.from("empleado_negocios").select("empleado_id, negocio_id").eq("negocio_id", negocioId);
  throwSupabaseError(relError, "Error al obtener los empleados");
  const ids = [...new Set((rel || []).map((r) => r.empleado_id))];
  if (!ids.length) return [];
  const { data, error } = await supabase.from("empleados").select("*").in("id", ids).order("nombre");
  throwSupabaseError(error, "Error al obtener los empleados");
  return ensamblar(data || [], await relacionesParaEmpleados(ids));
};

export const createEmpleado = async (empleado, negocioIds = null) => {
  const negocioActivo = requireNegocioId();
  const ids = [...new Set((Array.isArray(negocioIds) && negocioIds.length ? negocioIds : [negocioActivo]).filter(Boolean))];
  const password = empleado.clave;
  if (!password || password.length < 6) throw new Error("La contraseña del empleado debe tener al menos 6 caracteres.");

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("La sesión de administrador no está disponible.");

  const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-employee`;
  const response = await fetch(functionUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({
      action: "create",
      password,
      negocioIds: ids,
      empleado: {
        id: createId(),
        nombre: empleado.nombre,
        correo: empleado.correo,
        telefono: empleado.telefono,
        rol: empleado.rol || "empleado",
        estado: empleado.estado || "activo",
        foto: empleado.foto || "/illustrations/perfil.png",
      },
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "No se pudo crear la cuenta del empleado.");
  return empleadoFromDb(payload, payload.negocioIds || ids);
};

export const updateEmpleado = async (id, empleado) => {
  const negocioId = requireNegocioId();
  const row = {
    nombre: empleado.nombre,
    correo: empleado.correo,
    telefono: empleado.telefono || null,
    rol: empleado.rol,
    estado: empleado.estado,
    foto: empleado.foto || null,
    negocio_id: empleado.negocioId || negocioId,
  };
  const { data, error } = await supabase.from("empleados").update(row).eq("id", id).select("*").single();
  throwSupabaseError(error, "Error al actualizar el empleado");

  if (Array.isArray(empleado.negocioIds) && empleado.negocioIds.length) {
    const { error: deleteError } = await supabase.from("empleado_negocios").delete().eq("empleado_id", id);
    throwSupabaseError(deleteError, "No se pudieron actualizar los negocios del empleado");
    const { error: insertError } = await supabase.from("empleado_negocios").insert(
      [...new Set(empleado.negocioIds)].map((businessId) => ({ empleado_id: id, negocio_id: businessId }))
    );
    throwSupabaseError(insertError, "No se pudieron actualizar los negocios del empleado");
  }

  if (empleado.clave) {
    await actualizarContrasenaEmpleado(id, empleado.clave);
  }
  const rel = await relacionesParaEmpleados([id]);
  return empleadoFromDb(data, rel.map((r) => r.negocio_id));
};

async function actualizarContrasenaEmpleado(empleadoId, password) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("La sesión de administrador no está disponible.");
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-employee`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ action: "update_password", empleadoId, password }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "No se pudo actualizar la contraseña del empleado.");
}

export const updateEmpleadoParcial = async (id, cambios) => {
  const row = {};
  if ("nombre" in cambios) row.nombre = cambios.nombre;
  if ("correo" in cambios) row.correo = cambios.correo;
  if ("telefono" in cambios) row.telefono = cambios.telefono || null;
  if ("rol" in cambios) row.rol = cambios.rol;
  if ("estado" in cambios) row.estado = cambios.estado;
  if ("foto" in cambios) row.foto = cambios.foto || null;
  if ("negocioId" in cambios) row.negocio_id = cambios.negocioId;

  const { data, error } = await supabase.from("empleados").update(row).eq("id", id).select("*").single();
  throwSupabaseError(error, "Error al actualizar el empleado");
  const rel = await relacionesParaEmpleados([id]);
  return empleadoFromDb(data, rel.map((r) => r.negocio_id));
};

export const deleteEmpleado = async (id) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("La sesión de administrador no está disponible.");
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-employee`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ action: "delete", empleadoId: id }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Error al eliminar el empleado");
  return true;
};
