    const API_URL = "http://localhost:3001/recetas";

export const getRecetas = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Error al obtener las recetas");
  }

  return response.json();
};

export const getReceta = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);

  if (!response.ok) {
    throw new Error("Error al obtener la receta");
  }

  return response.json();
};

export const createReceta = async (receta) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(receta),
  });

  if (!response.ok) {
    throw new Error("Error al crear la receta");
  }

  return response.json();
};

export const updateReceta = async (id, receta) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(receta),
  });

  if (!response.ok) {
    throw new Error("Error al actualizar la receta");
  }

  return response.json();
};

export const deleteReceta = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Error al eliminar la receta");
  }

  return true;
};