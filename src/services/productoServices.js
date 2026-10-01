import { conNegocio, filtrarPorNegocio, getNegocioActivoId } from "../context/negocioContext";

const API_URL = "http://localhost:3001/productos";

export const getProductos = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Error al obtener los productos");
  }

  return filtrarPorNegocio(await response.json());
};

export const getProducto = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);

  if (!response.ok) {
    throw new Error("Error al obtener el producto");
  }

  const dato = await response.json();
  if (dato.negocioId && dato.negocioId !== getNegocioActivoId()) {
    throw new Error("El registro no pertenece al negocio activo");
  }
  return dato;
};

export const createProducto = async (producto) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(conNegocio(producto)),
  });

  if (!response.ok) {
    throw new Error("Error al crear el producto");
  }

  return response.json();
};

export const updateProducto = async (id, producto) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(conNegocio(producto)),
  });

  if (!response.ok) {
    throw new Error("Error al actualizar el producto");
  }

  return response.json();
};

export const deleteProducto = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Error al eliminar el producto");
  }

  return true;
};