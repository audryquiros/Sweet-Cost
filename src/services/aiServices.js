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

  let response;

  try {
    response = await fetch(PROYECCION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      "No se pudo conectar con n8n. Verifica que n8n esté ejecutándose en el puerto 5678 y que el workflow de proyecciones esté activo."
    );
  }

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

const DENSIDAD_IA_URL = import.meta.env.VITE_N8N_DENSIDAD_URL || "";

export async function estimarDensidadIA({ producto }) {
  if (!DENSIDAD_IA_URL) {
    throw new Error(
      "Configura VITE_N8N_DENSIDAD_URL para estimar densidades con IA."
    );
  }

  let response;

  try {
    response = await fetch(DENSIDAD_IA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accion: "estimar_densidad",
        producto,
      }),
    });
  } catch {
    throw new Error(
      "No se pudo conectar con el servicio de densidad IA."
    );
  }

  return parseResponse(response);
}
