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

  const unidadBase = obtenerUnidadBase(
    producto.unidad
  );

  let cantidadBase = cantidad;

  if (
    masaEnGramos[producto.unidad] !== undefined &&
    unidadBase === "g"
  ) {
    cantidadBase =
      cantidad *
      masaEnGramos[producto.unidad];
  }

  if (
    volumenEnMl[producto.unidad] !== undefined &&
    unidadBase === "ml"
  ) {
    cantidadBase =
      cantidad *
      volumenEnMl[producto.unidad];
  }

  if (producto.unidad === "docena") {
    cantidadBase = cantidad * 12;
  }

  return precio / cantidadBase;
};

export const obtenerCostoUnitarioInsumo = (
  insumo
) => {
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

  if (insumo.unidad === "kg") {
    return precio / (cantidad * 1000);
  }

  if (insumo.unidad === "l") {
    return precio / (cantidad * 1000);
  }

  return precio / cantidad;
};

export const obtenerUnidadCostoInsumo = (
  unidad
) => {
  if (unidad === "docena") {
    return "unidad";
  }

  if (unidad === "kg") {
    return "g";
  }

  if (unidad === "l") {
    return "ml";
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
    return (
      valor *
      masaEnGramos[unidadActual]
    );
  }

  if (
    volumenEnMl[unidadActual] !== undefined &&
    unidadBase === "ml"
  ) {
    return (
      valor *
      volumenEnMl[unidadActual]
    );
  }

  if (
    unidadActual === "docena" &&
    unidadBase === "unidad"
  ) {
    return valor * 12;
  }

  return valor;
};

export const obtenerCantidadPorUso = (
  producto
) => {
  if (!producto) {
    return 0;
  }

  const cantidadPorUso = Number(
    producto.cantidadPorUso
  );

  if (
    !Number.isFinite(cantidadPorUso) ||
    cantidadPorUso <= 0
  ) {
    return 0;
  }

  const unidadBase = obtenerUnidadBase(
    producto.unidad
  );

  return convertirCantidadAUnidadBase(
    cantidadPorUso,
    producto.unidadPorUso ||
      unidadBase,
    unidadBase
  );
};

export const calcularCostoPorUso = (
  producto,
  cantidadUsos = 1
) => {
  if (!producto) {
    return 0;
  }

  const usos = Number(cantidadUsos);

  if (!Number.isFinite(usos) || usos <= 0) {
    return 0;
  }

  const costoUnitario =
    obtenerCostoUnitario(producto);

  const cantidadPorUso =
    obtenerCantidadPorUso(producto);

  if (
    costoUnitario <= 0 ||
    cantidadPorUso <= 0
  ) {
    return 0;
  }

  return (
    costoUnitario *
    cantidadPorUso *
    usos
  );
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

  const unidadBase = obtenerUnidadBase(
    producto.unidad
  );

  const cantidadBase =
    convertirCantidadAUnidadBase(
      ingrediente.cantidad,
      ingrediente.unidad,
      unidadBase
    );

  const costoUnitario =
    obtenerCostoUnitario(producto);

  return (
    cantidadBase *
    costoUnitario
  );
};

export const calcularCostoReceta = (
  receta,
  productos
) => {
  if (!receta?.ingredientes?.length) {
    return 0;
  }

  return receta.ingredientes.reduce(
    (
      total,
      ingrediente
    ) =>
      total +
      calcularCostoIngrediente(
        ingrediente,
        productos
      ),
    0
  );
};

export const calcularCostoPorRendimiento = (
  receta,
  productos
) => {
  const rendimiento = Number(
    receta?.rendimiento
  );

  if (
    !Number.isFinite(rendimiento) ||
    rendimiento <= 0
  ) {
    return 0;
  }

  return (
    calcularCostoReceta(
      receta,
      productos
    ) / rendimiento
  );
};