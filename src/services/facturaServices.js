import { supabase, facturaFromDb, facturaToDb, requireNegocioId, throwSupabaseError, createId } from "../lib/supabaseData";

export async function getFacturas() {
  const negocioId = requireNegocioId();
  const { data, error } = await supabase.from("facturas").select("*").eq("negocio_id", negocioId).order("fecha", { ascending: false });
  throwSupabaseError(error, "Error al obtener las facturas");
  return (data || []).map(facturaFromDb);
}

export async function buscarFacturaPorNumero(numeroFactura, negocioId = requireNegocioId()) {
  if (!numeroFactura) return null;
  const { data, error } = await supabase.from("facturas").select("*").eq("negocio_id", negocioId).eq("numero_factura", numeroFactura).maybeSingle();
  throwSupabaseError(error, "No se pudo comprobar si la factura ya existe");
  return facturaFromDb(data);
}

export async function createFactura(factura, { negocioId = requireNegocioId(), usuario } = {}) {
  if (!factura?.proveedor) throw new Error("La factura no tiene un proveedor identificado.");
  if (!factura?.numeroFactura) throw new Error("La factura no tiene un número identificado.");
  if (factura?.total == null) throw new Error("La factura no tiene un total identificado.");
  if (await buscarFacturaPorNumero(factura.numeroFactura, negocioId)) throw new Error("Esta factura ya fue registrada en el negocio activo.");

  const row = facturaToDb({ ...factura, id: createId(), registradoPorId: usuario?.id ?? null, registradoPorNombre: usuario?.nombre ?? null }, negocioId);
  const { data, error } = await supabase.from("facturas").insert(row).select("*").single();
  throwSupabaseError(error, "No se pudo registrar la factura en Sweet Cost.");
  return facturaFromDb(data);
}

export async function deleteFactura(id) {
  if (!id) return false;
  const negocioId = requireNegocioId();
  const { error } = await supabase.from("facturas").delete().eq("id", id).eq("negocio_id", negocioId);
  throwSupabaseError(error, "No se pudo revertir el registro de la factura.");
  return true;
}
