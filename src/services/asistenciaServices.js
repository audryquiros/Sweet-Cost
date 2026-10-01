import { conNegocio, filtrarPorNegocio, getNegocioActivoId } from "../context/negocioContext";

const API_URL = "http://localhost:3001/asistencias";

const respuestaJson = async (response, mensaje) => {
  if (!response.ok) {
    let detalle = "";
    try {
      const data = await response.json();
      detalle = data?.message || data?.error || "";
    } catch {
      // La respuesta puede no tener JSON.
    }
    throw new Error(detalle ? `${mensaje}: ${detalle}` : mensaje);
  }
  return response.json();
};

export const getAsistencias = async () => {
  const response = await fetch(API_URL);
  const datos = await respuestaJson(response, "Error al obtener los registros de asistencia");
  return filtrarPorNegocio(datos);
};

export const registrarIngreso = async ({ empleadoId, empleadoNombre }) => {
  if (!empleadoId) throw new Error("No se encontró el empleado que realizará el registro.");

  const negocioId = getNegocioActivoId();
  const fecha = new Date();
  const fechaDia = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;

  // Evita crear dos jornadas para la misma persona en el mismo día.
  const existentesResponse = await fetch(`${API_URL}?empleadoId=${encodeURIComponent(empleadoId)}`);
  const existentes = await respuestaJson(existentesResponse, "No se pudo comprobar la jornada actual");
  const existente = Array.isArray(existentes)
    ? existentes.find((item) => item.empleadoId === empleadoId && item.fecha === fechaDia && item.negocioId === negocioId)
    : null;

  if (existente) return existente;

  const registro = conNegocio({
    empleadoId,
    empleadoNombre: empleadoNombre || "Empleado",
    fecha: fechaDia,
    ingreso: fecha.toISOString(),
    salida: null,
    negocioId,
  });

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(registro),
  });

  const guardado = await respuestaJson(response, "No se pudo registrar el ingreso en el servidor");
  if (!guardado?.id) throw new Error("El servidor no devolvió el registro de asistencia guardado.");
  return guardado;
};

export const registrarSalida = async (id) => {
  if (!id) throw new Error("No se encontró el registro de asistencia.");
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ salida: new Date().toISOString() }),
  });
  return respuestaJson(response, "No se pudo registrar la salida");
};

export const eliminarAsistencia = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("No se pudo eliminar el registro");
  return true;
};

export const actualizarHorario = async (id, { ingreso, salida }) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ingreso, salida: salida || null }),
  });
  return respuestaJson(response, "No se pudo actualizar el horario");
};
