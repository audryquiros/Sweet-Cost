import { getNegocioActivoId } from "../context/negocioContext";

const API_URL = "http://localhost:3001/facturas";

export async function getFacturas() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Error al obtener las facturas");
  }

  const facturas = await response.json();
  const negocioId = getNegocioActivoId();

  return (Array.isArray(facturas) ? facturas : []).filter(
    (factura) => factura?.negocioId === negocioId
  );
}

export async function buscarFacturaPorNumero(numeroFactura, negocioId = getNegocioActivoId()) {
  if (!numeroFactura) return null;

  const response = await fetch(
    `${API_URL}?negocioId=${encodeURIComponent(negocioId)}&numeroFactura=${encodeURIComponent(numeroFactura)}`
  );

  if (!response.ok) {
    throw new Error("No se pudo comprobar si la factura ya existe");
  }

  const facturas = await response.json();
  return Array.isArray(facturas) && facturas.length ? facturas[0] : null;
}

export async function createFactura(factura, { negocioId = getNegocioActivoId(), usuario } = {}) {
  if (!factura?.proveedor) {
    throw new Error("La factura no tiene un proveedor identificado.");
  }

  if (!factura?.numeroFactura) {
    throw new Error("La factura no tiene un número identificado.");
  }

  if (factura?.total == null) {
    throw new Error("La factura no tiene un total identificado.");
  }

  const existente = await buscarFacturaPorNumero(factura.numeroFactura, negocioId);
  if (existente) {
    throw new Error("Esta factura ya fue registrada en el negocio activo.");
  }

  const registro = {
    negocioId,
    proveedor: factura.proveedor ?? null,
    numeroFactura: factura.numeroFactura ?? null,
    fecha: factura.fecha ?? null,
    moneda: factura.moneda ?? null,
    subtotal: factura.subtotal ?? null,
    descuento: factura.descuento ?? null,
    impuesto: factura.impuesto ?? null,
    total: factura.total ?? null,
    productos: Array.isArray(factura.productos) ? factura.productos : [],
    registradoPorId: usuario?.id ?? null,
    registradoPorNombre: usuario?.nombre ?? null,
    fechaRegistro: new Date().toISOString(),
    origen: "facturas-ia",
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(registro),
  });

  if (!response.ok) {
    throw new Error("No se pudo registrar la factura en Sweet Cost.");
  }

  return response.json();
}


export async function deleteFactura(id) {
  if (!id) return false;

  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("No se pudo revertir el registro de la factura.");
  }

  return true;
}
