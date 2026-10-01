import { conNegocio, filtrarPorNegocio, getNegocioActivoId } from "../context/negocioContext";

const API_URL = "http://localhost:3001/empleados";

export const getEmpleados = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Error al obtener los empleados");
  return filtrarPorNegocio(await response.json());
};

export const createEmpleado = async (empleado) => {
  const negocioId = getNegocioActivoId();
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(conNegocio({
      ...empleado,
      clave: empleado.clave || "empleado123",
      negocioIds: [negocioId],
    })),
  });
  if (!response.ok) throw new Error("Error al crear el empleado");
  return response.json();
};

export const updateEmpleado = async (id, empleado) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(empleado),
  });
  if (!response.ok) throw new Error("Error al actualizar el empleado");
  return response.json();
};

export const updateEmpleadoParcial = async (id, cambios) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cambios),
  });
  if (!response.ok) throw new Error("Error al actualizar el empleado");
  return response.json();
};

export const deleteEmpleado = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Error al eliminar el empleado");
  return true;
};
