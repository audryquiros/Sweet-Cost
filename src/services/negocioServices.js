import { getNegocioActivoId } from "../context/negocioContext";

const API_URL = "http://localhost:3001/negocios";

export const getNegocioActivoDesdeServidor = async () => {
  const id = getNegocioActivoId();
  const response = await fetch(`${API_URL}/${id}`);

  if (!response.ok) {
    throw new Error("Error al obtener los datos del negocio");
  }

  return response.json();
};

export const updateNegocio = async (id, cambios) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cambios),
  });

  if (!response.ok) {
    throw new Error("Error al actualizar los datos del negocio");
  }

  return response.json();
};
