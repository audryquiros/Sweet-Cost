export const masaEnGramos = {
  mg: 0.001,
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,
};

export const volumenEnMl = {
  ml: 1,
  l: 1000,
  taza: 240,
  cda: 15,
  cdta: 5,
  oz_liquida: 29.5735,
};

export const obtenerUnidadBase = (unidad) => {
  if (unidad === "kg") {
    return "g";
  }

  if (unidad === "l") {
    return "ml";
  }

  if (unidad === "docena") {
    return "unidad";
  }

  return unidad;
};

export const obtenerCostoUnitario = (producto) => {
  const cantidad = Number(producto?.cantidad);
  const precio = Number(producto?.precio);

  if (
    !Number.isFinite(cantidad) ||
    cantidad <= 0 ||
    !Number.isFinite(precio)
  ) {
    return 0;
  }

  if (producto.unidad === "kg" || producto.unidad === "l") {
    return precio / (cantidad * 1000);
  }

  if (producto.unidad === "docena") {
    return precio / (cantidad * 12);
  }

  return precio / cantidad;
};

export const obtenerCostoUnitarioInsumo = (insumo) => {
  const cantidad = Number(insumo?.cantidad);
  const precio = Number(insumo?.precio);

  if (
    !Number.isFinite(cantidad) ||
    cantidad <= 0 ||
    !Number.isFinite(precio)
  ) {
    return 0;
  }

  if (insumo.unidad === "docena") {
    return precio / (cantidad * 12);
  }

  return precio / cantidad;
};

export const obtenerUnidadCostoInsumo = (unidad) => {
  if (unidad === "docena") {
    return "unidad";
  }

  return unidad;
};

export const convertirCantidadAUnidadBase = (
  cantidad,
  unidadActual,
  unidadBase
) => {
  const valor = Number(cantidad);

  if (!Number.isFinite(valor)) {
    return 0;
  }

  if (unidadActual === unidadBase) {
    return valor;
  }

  if (
    masaEnGramos[unidadActual] !== undefined &&
    unidadBase === "g"
  ) {
    return valor * masaEnGramos[unidadActual];
  }

  if (
    volumenEnMl[unidadActual] !== undefined &&
    unidadBase === "ml"
  ) {
    return valor * volumenEnMl[unidadActual];
  }

  if (
    unidadActual === "docena" &&
    unidadBase === "unidad"
  ) {
    return valor * 12;
  }

  return valor;
};

export const calcularCostoIngrediente = (
  ingrediente,
  productos
) => {
  const producto = productos.find(
    (productoActual) =>
      String(productoActual.id) ===
      String(ingrediente?.productoId)
  );

  if (!producto) {
    return 0;
  }

  const unidadBase = obtenerUnidadBase(producto.unidad);
  const cantidadBase = convertirCantidadAUnidadBase(
    ingrediente.cantidad,
    ingrediente.unidad,
    unidadBase
  );
  const costoUnitario = obtenerCostoUnitario(producto);

  return cantidadBase * costoUnitario;
};

export const calcularCostoReceta = (receta, productos) => {
  if (!receta?.ingredientes?.length) {
    return 0;
  }

  return receta.ingredientes.reduce(
    (total, ingrediente) =>
      total + calcularCostoIngrediente(ingrediente, productos),
    0
  );
};

export const calcularCostoPorRendimiento = (
  receta,
  productos
) => {
  const rendimiento = Number(receta?.rendimiento);

  if (!Number.isFinite(rendimiento) || rendimiento <= 0) {
    return 0;
  }

  return calcularCostoReceta(receta, productos) / rendimiento;
};
