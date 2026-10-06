import { supabase } from "./supabase";
import { getNegocioActivoId } from "../context/negocioContext";

export function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function requireNegocioId() {
  const id = getNegocioActivoId();
  if (!id) throw new Error("No hay un negocio activo autorizado para esta sesión.");
  return id;
}

export function throwSupabaseError(error, fallback) {
  if (error) {
    console.error(fallback, error);
    throw new Error(error.message || fallback);
  }
}

export function productoFromDb(row) {
  if (!row) return row;
  return {
    ...row,
    cantidadPresentaciones: row.cantidad_presentaciones,
    cantidadPorPresentacion: row.cantidad_por_presentacion,
    precioPorPresentacion: row.precio_por_presentacion,
    cantidadPorPorcion: row.cantidad_por_porcion,
    unidadPorPorcion: row.unidad_por_porcion,
    negocioId: row.negocio_id,
  };
}

export function productoToDb(item, negocioId = requireNegocioId()) {
  return {
    id: item.id || createId(),
    negocio_id: negocioId,
    nombre: item.nombre,
    marca: item.marca ?? null,
    tipo: item.tipo ?? null,
    cantidad_presentaciones: item.cantidadPresentaciones ?? null,
    cantidad_por_presentacion: item.cantidadPorPresentacion ?? null,
    unidad: item.unidad ?? null,
    precio_por_presentacion: item.precioPorPresentacion ?? null,
    densidad: item.densidad ?? null,
    cantidad_por_porcion: item.cantidadPorPorcion ?? null,
    unidad_por_porcion: item.unidadPorPorcion ?? null,
  };
}

export function insumoFromDb(row) {
  if (!row) return row;
  return {
    ...row,
    negocioId: row.negocio_id,
  };
}

export function insumoToDb(item, negocioId = requireNegocioId()) {
  return {
    id: item.id || createId(),
    negocio_id: negocioId,
    nombre: item.nombre,
    presentacion: item.presentacion ?? null,
    cantidad: item.cantidad ?? null,
    unidad: item.unidad ?? null,
    precio: item.precio ?? null,
  };
}

export function recetaFromDb(row, ingredientes = []) {
  if (!row) return row;
  return {
    ...row,
    negocioId: row.negocio_id,
    unidadRendimiento: row.unidad_rendimiento,
    ingredientes: ingredientes.map((item) => ({
      productoId: item.producto_id,
      cantidad: item.cantidad,
      unidad: item.unidad,
    })),
  };
}

export function recetaToDb(item, negocioId = requireNegocioId()) {
  return {
    id: item.id || createId(),
    negocio_id: negocioId,
    nombre: item.nombre,
    descripcion: item.descripcion ?? null,
    rendimiento: item.rendimiento ?? null,
    unidad_rendimiento: item.unidadRendimiento ?? null,
  };
}

export function cotizacionFromDb(row, insumos = []) {
  if (!row) return row;
  return {
    ...row,
    negocioId: row.negocio_id,
    empleadoId: row.empleado_id,
    pedidoId: row.pedido_id,
    recetaId: row.receta_id,
    recetaNombre: row.receta_nombre,
    cantidadAVender: row.cantidad_a_vender,
    unidadesIncluidas: row.unidades_incluidas,
    cantidadTotalProductos: row.cantidad_total_productos,
    extrasModo: row.extras_modo,
    toppingsEstandar: row.toppings_estandar,
    salsasEstandar: row.salsas_estandar,
    toppingsPorEnvase: row.toppings_por_envase,
    salsasPorEnvase: row.salsas_por_envase,
    manoObra: row.mano_obra,
    costoReceta: row.costo_receta,
    costoToppings: row.costo_toppings,
    costoToppingsPorEnvase: row.costo_toppings_por_envase,
    costoSalsas: row.costo_salsas,
    costoSalsasPorEnvase: row.costo_salsas_por_envase,
    costoExtras: row.costo_extras,
    costoExtrasPorEnvase: row.costo_extras_por_envase,
    costoInsumos: row.costo_insumos,
    costoInsumosPorEnvase: row.costo_insumos_por_envase,
    costoProduccion: row.costo_produccion,
    costoTotal: row.costo_total,
    precioSugerido: row.precio_sugerido,
    precioPorUnidadVenta: row.precio_por_unidad_venta,
    empleadoNombre: row.empleado_nombre,
    insumos: insumos.map((item) => ({
      insumoId: item.insumo_id,
      cantidadPorEnvase: item.cantidad_por_envase,
      cantidadTotal: item.cantidad_total,
    })),
  };
}

export function cotizacionToDb(item, negocioId = requireNegocioId()) {
  const db = {
    id: item.id || createId(),
    negocio_id: negocioId,
    empleado_id: item.empleadoId ?? null,
    pedido_id: item.pedidoId ?? null,
    nombre: item.nombre ?? null,
    receta_id: item.recetaId ?? null,
    receta_nombre: item.recetaNombre ?? null,
    cantidad_a_vender: item.cantidadAVender ?? null,
    unidades_incluidas: item.unidadesIncluidas ?? null,
    cantidad_total_productos: item.cantidadTotalProductos ?? null,
    extras_modo: item.extrasModo ?? null,
    toppings: item.toppings ?? [],
    salsas: item.salsas ?? [],
    toppings_estandar: item.toppingsEstandar ?? null,
    salsas_estandar: item.salsasEstandar ?? null,
    toppings_por_envase: item.toppingsPorEnvase ?? null,
    salsas_por_envase: item.salsasPorEnvase ?? null,
    extras: item.extras ?? [],
    mano_obra: item.manoObra ?? null,
    margen: item.margen ?? null,
    costo_receta: item.costoReceta ?? null,
    costo_toppings: item.costoToppings ?? null,
    costo_toppings_por_envase: item.costoToppingsPorEnvase ?? null,
    costo_salsas: item.costoSalsas ?? null,
    costo_salsas_por_envase: item.costoSalsasPorEnvase ?? null,
    costo_extras: item.costoExtras ?? null,
    costo_extras_por_envase: item.costoExtrasPorEnvase ?? null,
    costo_insumos: item.costoInsumos ?? null,
    costo_insumos_por_envase: item.costoInsumosPorEnvase ?? null,
    costo_produccion: item.costoProduccion ?? null,
    costo_total: item.costoTotal ?? null,
    precio_sugerido: item.precioSugerido ?? null,
    precio_por_unidad_venta: item.precioPorUnidadVenta ?? null,
    fecha: item.fecha ?? new Date().toISOString(),
    estado: item.estado ?? "Pendiente",
    cliente: item.cliente ?? null,
    telefono: item.telefono ?? null,
    empleado_nombre: item.empleadoNombre ?? null,
  };
  return db;
}

export function pedidoFromDb(row, insumos = []) {
  if (!row) return row;
  return {
    ...row,
    negocioId: row.negocio_id,
    empleadoId: row.empleado_id,
    cotizacionId: row.cotizacion_id,
    cotizacionNombre: row.cotizacion_nombre,
    recetaId: row.receta_id,
    recetaNombre: row.receta_nombre,
    cantidadAVender: row.cantidad_a_vender,
    unidadesIncluidas: row.unidades_incluidas,
    cantidadTotalProductos: row.cantidad_total_productos,
    extrasModo: row.extras_modo,
    costoTotal: row.costo_total,
    precioSugerido: row.precio_sugerido,
    depositoPorcentaje: row.deposito_porcentaje,
    fechaPedido: row.fecha_pedido,
    fechaEntrega: row.fecha_entrega,
    horaEntrega: row.hora_entrega,
    metodoPago: row.metodo_pago,
    empleadoNombre: row.empleado_nombre,
    cotizacionEmpleadoId: row.cotizacion_empleado_id,
    cotizacionEmpleadoNombre: row.cotizacion_empleado_nombre,
    insumos: insumos.map((item) => ({
      insumoId: item.insumo_id,
      cantidadPorEnvase: item.cantidad_por_envase,
      cantidadTotal: item.cantidad_total,
    })),
  };
}

export function pedidoToDb(item, negocioId = requireNegocioId()) {
  return {
    id: item.id || createId(),
    negocio_id: negocioId,
    empleado_id: item.empleadoId ?? null,
    cotizacion_id: item.cotizacionId ?? null,
    cotizacion_nombre: item.cotizacionNombre ?? null,
    cliente: item.cliente ?? null,
    telefono: item.telefono ?? null,
    receta_id: item.recetaId ?? null,
    receta_nombre: item.recetaNombre ?? null,
    cantidad_a_vender: item.cantidadAVender ?? null,
    unidades_incluidas: item.unidadesIncluidas ?? null,
    cantidad_total_productos: item.cantidadTotalProductos ?? null,
    extras_modo: item.extrasModo ?? null,
    toppings: item.toppings ?? [],
    salsas: item.salsas ?? [],
    extras: item.extras ?? [],
    costo_total: item.costoTotal ?? null,
    precio_sugerido: item.precioSugerido ?? null,
    deposito: item.deposito ?? null,
    deposito_porcentaje: item.depositoPorcentaje ?? null,
    saldo: item.saldo ?? null,
    fecha_pedido: item.fechaPedido ?? new Date().toISOString(),
    fecha_entrega: item.fechaEntrega || null,
    hora_entrega: item.horaEntrega || null,
    metodo_pago: item.metodoPago ?? null,
    estado: item.estado ?? "Pendiente",
    observaciones: item.observaciones ?? null,
    empleado_nombre: item.empleadoNombre ?? null,
    cotizacion_empleado_id: item.cotizacionEmpleadoId ?? null,
    cotizacion_empleado_nombre: item.cotizacionEmpleadoNombre ?? null,
  };
}

export function asistenciaFromDb(row) {
  if (!row) return row;
  const combinarFechaHora = (fecha, hora) => {
    if (!fecha || !hora) return null;
    const value = new Date(`${fecha}T${hora}`);
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  };
  return {
    ...row,
    negocioId: row.negocio_id,
    empleadoId: row.empleado_id,
    empleadoNombre: row.empleado_nombre,
    ingreso: combinarFechaHora(row.fecha, row.ingreso),
    salida: combinarFechaHora(row.fecha, row.salida),
  };
}

export function asistenciaToDb(item, negocioId = requireNegocioId()) {
  return {
    id: item.id || createId(),
    empleado_id: item.empleadoId,
    negocio_id: negocioId,
    empleado_nombre: item.empleadoNombre ?? null,
    fecha: item.fecha,
    ingreso: item.ingreso,
    salida: item.salida ?? null,
  };
}

export function negocioFromDb(row) {
  if (!row) return row;
  return {
    ...row,
    margenGanancia: row.margen_ganancia,
    administradorId: row.administrador_id,
  };
}

export function negocioToDb(item) {
  return {
    id: item.id || createId(),
    nombre: item.nombre,
    tipo: item.tipo ?? null,
    telefono: item.telefono ?? null,
    correo: item.correo ?? null,
    margen_ganancia: item.margenGanancia ?? 30,
    administrador_id: item.administradorId ?? null,
  };
}

export function empleadoFromDb(row, negocioIds = []) {
  if (!row) return row;
  return {
    ...row,
    negocioId: row.negocio_id,
    negocioIds,
    authUserId: row.auth_user_id,
  };
}

export function facturaFromDb(row) {
  if (!row) return row;
  return {
    ...row,
    negocioId: row.negocio_id,
    numeroFactura: row.numero_factura,
    registradoPorId: row.registrado_por_id,
    registradoPorNombre: row.registrado_por_nombre,
    fechaRegistro: row.fecha_registro,
  };
}

export function facturaToDb(item, negocioId = requireNegocioId()) {
  return {
    id: item.id || createId(),
    negocio_id: negocioId,
    proveedor: item.proveedor ?? null,
    numero_factura: item.numeroFactura ?? null,
    fecha: item.fecha ?? null,
    moneda: item.moneda ?? null,
    subtotal: item.subtotal ?? null,
    descuento: item.descuento ?? null,
    impuesto: item.impuesto ?? null,
    total: item.total ?? null,
    productos: Array.isArray(item.productos) ? item.productos : [],
    registrado_por_id: item.registradoPorId ?? null,
    registrado_por_nombre: item.registradoPorNombre ?? null,
    fecha_registro: item.fechaRegistro ?? new Date().toISOString(),
    origen: item.origen ?? "facturas-ia",
  };
}

export { supabase };
