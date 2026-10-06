import { supabase } from "../lib/supabase";
import { getNegociosAdministrador } from "./negocioServices";

async function invokeManager(body) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("La sesión de administrador no está disponible.");
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-employee`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "No se pudo completar la operación.");
  return payload;
}

export async function eliminarNegocioComoAdministrador({ negocioId, administradorId }) {
  if (!negocioId || !administradorId) throw new Error("No se pudo identificar el negocio o la cuenta administradora.");
  const negocios = await getNegociosAdministrador(administradorId);
  if (!negocios.some((item) => item.id === negocioId)) throw new Error("El negocio no existe o no pertenece a tu cuenta.");
  return invokeManager({ action: "delete_business", negocioId });
}

export async function eliminarCuentaAdministrador(administradorId) {
  if (!administradorId) throw new Error("No se pudo identificar la cuenta.");
  const negocios = await getNegociosAdministrador(administradorId);
  for (const negocio of negocios) {
    const result = await invokeManager({ action: "delete_business", negocioId: negocio.id });
    if (result.cuentaEliminada) return { cuentaEliminada: true, negociosEliminados: negocios.map((item) => item.id) };
  }
  return { cuentaEliminada: true, negociosEliminados: negocios.map((item) => item.id) };
}
