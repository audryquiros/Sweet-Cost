import { supabase, insumoFromDb, insumoToDb, requireNegocioId, throwSupabaseError, createId } from "../lib/supabaseData";

export const getInsumos = async () => {
  const negocioId = requireNegocioId();
  const { data, error } = await supabase.from("insumos").select("*").eq("negocio_id", negocioId).order("nombre");
  throwSupabaseError(error, "Error al obtener los insumos");
  return (data || []).map(insumoFromDb);
};

export const getInsumo = async (id) => {
  const negocioId = requireNegocioId();
  const { data, error } = await supabase.from("insumos").select("*").eq("id", id).eq("negocio_id", negocioId).maybeSingle();
  throwSupabaseError(error, "Error al obtener el insumo");
  if (!data) throw new Error("El insumo no pertenece al negocio activo o no existe.");
  return insumoFromDb(data);
};

export const createInsumo = async (insumo) => {
  const row = insumoToDb({ ...insumo, id: createId() });
  const { data, error } = await supabase.from("insumos").insert(row).select("*").single();
  throwSupabaseError(error, "Error al crear el insumo");
  return insumoFromDb(data);
};

export const updateInsumo = async (id, insumo) => {
  const negocioId = requireNegocioId();
  const row = insumoToDb({ ...insumo, id }, negocioId);
  const { data, error } = await supabase.from("insumos").update(row).eq("id", id).eq("negocio_id", negocioId).select("*").single();
  throwSupabaseError(error, "Error al actualizar el insumo");
  return insumoFromDb(data);
};

export const getRelacionesInsumo = async (id) => {
  const negocioId = requireNegocioId();

  const [cotizacionesResult, pedidosResult] = await Promise.all([
    supabase
      .from("cotizacion_insumos")
      .select("cotizacion_id")
      .eq("insumo_id", id),
    supabase
      .from("pedido_insumos")
      .select("pedido_id")
      .eq("insumo_id", id),
  ]);

  throwSupabaseError(cotizacionesResult.error, "Error al comprobar las cotizaciones relacionadas");
  throwSupabaseError(pedidosResult.error, "Error al comprobar los pedidos relacionados");

  const cotizacionIds = [...new Set(
    (cotizacionesResult.data || [])
      .map((item) => item.cotizacion_id)
      .filter(Boolean)
  )];
  const pedidoIds = [...new Set(
    (pedidosResult.data || [])
      .map((item) => item.pedido_id)
      .filter(Boolean)
  )];

  const [cotizacionesData, pedidosData] = await Promise.all([
    cotizacionIds.length
      ? supabase
          .from("cotizaciones")
          .select("id, nombre")
          .in("id", cotizacionIds)
          .eq("negocio_id", negocioId)
      : Promise.resolve({ data: [], error: null }),
    pedidoIds.length
      ? supabase
          .from("pedidos")
          .select("id, cliente, cotizacion_nombre")
          .in("id", pedidoIds)
          .eq("negocio_id", negocioId)
      : Promise.resolve({ data: [], error: null }),
  ]);

  throwSupabaseError(cotizacionesData.error, "Error al obtener las cotizaciones relacionadas");
  throwSupabaseError(pedidosData.error, "Error al obtener los pedidos relacionados");

  return {
    cotizaciones: cotizacionesData.data || [],
    pedidos: pedidosData.data || [],
  };
};

export const deleteInsumo = async (id) => {
  const negocioId = requireNegocioId();
  const { error } = await supabase
    .from("insumos")
    .delete()
    .eq("id", id)
    .eq("negocio_id", negocioId);

  throwSupabaseError(error, "Error al eliminar el insumo");
  return true;
};
