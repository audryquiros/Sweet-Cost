const API_URL = "http://localhost:3001/pedidos";

export const getPedidos = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Error al obtener los pedidos");
  return response.json();
};

export const getPedido = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) throw new Error("Error al obtener el pedido");
  return response.json();
};

export const createPedido = async (pedido) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pedido),
  });
  if (!response.ok) throw new Error("Error al crear el pedido");
  return response.json();
};

export const updatePedido = async (id, pedido) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pedido),
  });
  if (!response.ok) throw new Error("Error al actualizar el pedido");
  return response.json();
};

export const deletePedido = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Error al eliminar el pedido");
  return true;
};
