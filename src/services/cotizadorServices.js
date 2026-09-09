const API_URL = "http://localhost:3001/cotizaciones";

export const getCotizaciones = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Error al obtener las cotizaciones");
  }

  return response.json();
};

export const getCotizacion = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);

  if (!response.ok) {
    throw new Error("Error al obtener la cotización");
  }

  return response.json();
};

export const createCotizacion = async (cotizacion) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cotizacion),
  });

  if (!response.ok) {
    throw new Error("Error al crear la cotización");
  }

  return response.json();
};

export const deleteCotizacion = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Error al eliminar la cotización");
  }

  return true;
};