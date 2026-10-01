import { conNegocio, filtrarPorNegocio, getNegocioActivoId } from "../context/negocioContext";

const API_URL = "http://localhost:3001/asistencias";

export const getAsistencias = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Error al obtener los registros de asistencia");
  return filtrarPorNegocio(await response.json());
};

export const registrarIngreso = async ({ empleadoId, empleadoNombre }) => {
  const negocioId = getNegocioActivoId();
  const fecha = new Date();
  const fechaDia = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;

  const registro = conNegocio({
    empleadoId,
    empleadoNombre,
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
  if (!response.ok) throw new Error("No se pudo registrar el ingreso");
  return response.json();
};

export const registrarSalida = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ salida: new Date().toISOString() }),
  });
  if (!response.ok) throw new Error("No se pudo registrar la salida");
  return response.json();
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
  if (!response.ok) throw new Error("No se pudo actualizar el horario");
  return response.json();
};
