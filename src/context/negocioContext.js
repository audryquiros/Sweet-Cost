const NEGOCIO_KEY = "sweetcost-negocio-activo";

export const NEGOCIOS = [
  {
    id: "dulces-momentos",
    nombre: "Dulces Momentos",
    tipo: "Repostería",
  },
];

export function getNegocioActivoId() {
  return localStorage.getItem(NEGOCIO_KEY) || NEGOCIOS[0].id;
}

export function setNegocioActivoId(id) {
  const existe = NEGOCIOS.some((negocio) => negocio.id === id);
  if (!existe) return;
  localStorage.setItem(NEGOCIO_KEY, id);
  window.dispatchEvent(new CustomEvent("sweetcost-negocio-cambio", { detail: id }));
}

export function getNegocioActivo() {
  const id = getNegocioActivoId();
  return NEGOCIOS.find((negocio) => negocio.id === id) || NEGOCIOS[0];
}

export function conNegocio(data) {
  return { ...data, negocioId: getNegocioActivoId() };
}

export function filtrarPorNegocio(items) {
  const negocioId = getNegocioActivoId();
  return (Array.isArray(items) ? items : []).filter(
    (item) => !item.negocioId || item.negocioId === negocioId
  );
}

export { NEGOCIO_KEY };
