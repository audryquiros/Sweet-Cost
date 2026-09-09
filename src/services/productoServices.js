const API_URL = "http://localhost:3001/productos";

export const getProductos = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Error al obtener los productos");
  }

  return response.json();
};

export const getProducto = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);

  if (!response.ok) {
    throw new Error("Error al obtener el producto");
  }

  return response.json();
};

export const createProducto = async (producto) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(producto),
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
    body: JSON.stringify(producto),
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