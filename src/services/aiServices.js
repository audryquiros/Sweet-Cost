const PROYECCION_URL = import.meta.env.VITE_N8N_PROYECCION_URL || "";
const FACTURAS_IA_URL = import.meta.env.VITE_N8N_FACTURAS_IA_URL || "";

async function parseResponse(response) {
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { mensaje: text };
  }
  if (!response.ok) {
    throw new Error(data.mensaje || data.message || "El servicio de IA no respondió correctamente.");
  }
  return data;
}

export async function obtenerProyeccionIA(payload) {
  if (!PROYECCION_URL) {
    throw new Error("Configura VITE_N8N_PROYECCION_URL para activar las proyecciones con IA.");
  }

  const response = await fetch(PROYECCION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function consultarFacturasIA({ mensaje, archivo, negocio, usuario, factura = null }) {
  if (!FACTURAS_IA_URL) {
    throw new Error("Configura VITE_N8N_FACTURAS_IA_URL para activar el asistente de facturas.");
  }

  if (archivo) {
    const formData = new FormData();
    formData.append("mensaje", mensaje || "Analiza esta factura y extrae sus datos.");
    formData.append("negocioId", negocio?.id || "");
    formData.append("negocioNombre", negocio?.nombre || "");
    formData.append("empleadoId", usuario?.id || "");
    formData.append("empleadoNombre", usuario?.nombre || "");
    formData.append("accion", "analizar_factura");
    formData.append("factura", archivo, archivo.name);

    const response = await fetch(FACTURAS_IA_URL, {
      method: "POST",
      body: formData,
    });

    return parseResponse(response);
  }

  const response = await fetch(FACTURAS_IA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mensaje: mensaje || "",
      negocioId: negocio?.id || "",
      negocioNombre: negocio?.nombre || "",
      empleadoId: usuario?.id || "",
      empleadoNombre: usuario?.nombre || "",
      accion: factura ? "confirmar_factura" : "chat",
      factura,
    }),
  });

  return parseResponse(response);
}
