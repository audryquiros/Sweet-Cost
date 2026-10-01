import { conNegocio, filtrarPorNegocio, getNegocioActivoId } from "../context/negocioContext";

const API_URL = "http://localhost:3001/insumos";

export const getInsumos = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Error al obtener los insumos");
  }

  return filtrarPorNegocio(await response.json());
};

export const getInsumo = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);

  if (!response.ok) {
    throw new Error("Error al obtener el insumo");
  }

  const dato = await response.json();
  if (dato.negocioId && dato.negocioId !== getNegocioActivoId()) {
    throw new Error("El registro no pertenece al negocio activo");
  }
  return dato;
};

export const createInsumo = async (insumo) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(conNegocio(insumo)),
  });

  if (!response.ok) {
    throw new Error("Error al crear el insumo");
  }

  return response.json();
};

export const updateInsumo = async (id, insumo) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(conNegocio(insumo)),
  });

  if (!response.ok) {
    throw new Error("Error al actualizar el insumo");
  }

  return response.json();
};

export const deleteInsumo = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Error al eliminar el insumo");
  }

  return true;
};