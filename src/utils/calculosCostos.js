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
  if (unidad === "kg") return "g";
  if (unidad === "l") return "ml";
  if (unidad === "docena") return "unidad";

  return unidad;
};

export const convertirCantidadAUnidadBase = (
  cantidad,
  unidadActual,
  unidadBase
) => {
  const valor = Number(cantidad);

  if (!Number.isFinite(valor)) return 0;

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

/* PRODUCTOS */

export const calcularCantidadTotalProducto = (producto) => {
  const cantidadPresentaciones = Number(
    producto?.cantidadPresentaciones
  );

  const cantidadPorPresentacion = Number(
    producto?.cantidadPorPresentacion
  );

  if (
    !Number.isFinite(cantidadPresentaciones) ||
    cantidadPresentaciones <= 0 ||
    !Number.isFinite(cantidadPorPresentacion) ||
    cantidadPorPresentacion <= 0
  ) {
    return 0;
  }

  return (
    cantidadPresentaciones *
    cantidadPorPresentacion
  );
};

export const calcularTotalCompraProducto = (producto) => {
  const cantidadPresentaciones = Number(
    producto?.cantidadPresentaciones
  );

  const precioPorPresentacion = Number(
    producto?.precioPorPresentacion
  );

  if (
    !Number.isFinite(cantidadPresentaciones) ||
    cantidadPresentaciones <= 0 ||
    !Number.isFinite(precioPorPresentacion) ||
    precioPorPresentacion < 0
  ) {
    return 0;
  }

  return (
    cantidadPresentaciones *
    precioPorPresentacion
  );
};

export const calcularCantidadTotalBase = (producto) => {
  const cantidadTotal =
    calcularCantidadTotalProducto(producto);

  if (cantidadTotal <= 0) return 0;

  const unidadBase = obtenerUnidadBase(
    producto?.unidad
  );

  return convertirCantidadAUnidadBase(
    cantidadTotal,
    producto?.unidad,
    unidadBase
  );
};

export const calcularCostoUnitario = (producto) => {
  const cantidadBase =
    calcularCantidadTotalBase(producto);

  const totalCompra =
    calcularTotalCompraProducto(producto);

  if (
    cantidadBase <= 0 ||
    totalCompra < 0
  ) {
    return 0;
  }

  return totalCompra / cantidadBase;
};

export const obtenerUnidadCosto = (unidad) => {
  if (unidad === "kg") return "g";
  if (unidad === "l") return "ml";
  if (unidad === "docena") return "unidad";

  return unidad;
};

export const calcularCostoCantidadProducto = (
  producto,
  cantidad,
  unidad
) => {
  if (!producto) return 0;

  const cantidadNumero = Number(cantidad);

  if (
    !Number.isFinite(cantidadNumero) ||
    cantidadNumero <= 0
  ) {
    return 0;
  }

  const unidadBase = obtenerUnidadBase(
    producto.unidad
  );

  const cantidadBase =
    convertirCantidadAUnidadBase(
      cantidadNumero,
      unidad,
      unidadBase
    );

  const costoUnitario =
    calcularCostoUnitario(producto);

  return cantidadBase * costoUnitario;
};

/* PORCIONES */

export const calcularCantidadPorciones = (
  producto,
  cantidadPorciones
) => {
  const cantidad =
    Number(cantidadPorciones);

  const cantidadPorPorcion =
    Number(producto?.cantidadPorPorcion);

  if (
    !Number.isFinite(cantidad) ||
    cantidad <= 0 ||
    !Number.isFinite(cantidadPorPorcion) ||
    cantidadPorPorcion <= 0
  ) {
    return 0;
  }

  return cantidad * cantidadPorPorcion;
};

export const calcularCostoPorciones = (
  producto,
  cantidadPorciones
) => {
  const cantidadTotal =
    calcularCantidadPorciones(
      producto,
      cantidadPorciones
    );

  if (cantidadTotal <= 0) return 0;

  return calcularCostoCantidadProducto(
    producto,
    cantidadTotal,
    producto.unidadPorPorcion || producto.unidad
  );
};

/* RECETAS */

export const calcularCostoIngrediente = (
  ingrediente,
  productos
) => {
  const producto = productos.find(
    (productoActual) =>
      String(productoActual.id) ===
      String(ingrediente?.productoId)
  );

  if (!producto) return 0;

  return calcularCostoCantidadProducto(
    producto,
    ingrediente.cantidad,
    ingrediente.unidad
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
    (total, ingrediente) =>
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
  const rendimiento =
    Number(receta?.rendimiento);

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

/* INSUMOS */

export const obtenerCostoUnitarioInsumo = (
  insumo
) => {
  const cantidad = Number(
    insumo?.cantidad
  );

  const precio = Number(
    insumo?.precio
  );

  if (
    !Number.isFinite(cantidad) ||
    cantidad <= 0 ||
    !Number.isFinite(precio) ||
    precio < 0
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
  if (unidad === "docena") return "unidad";
  if (unidad === "kg") return "g";
  if (unidad === "l") return "ml";

  return unidad;
};

/* NOMBRES DE UNIDADES */

export const obtenerNombreUnidad = (
  unidad
) => {
  const unidades = {
    mg: "miligramos",
    g: "gramos",
    kg: "kilogramos",
    ml: "mililitros",
    l: "litros",
    unidad: "unidades",
    docena: "docenas",
    oz: "onzas",
    lb: "libras",
    taza: "tazas",
    cda: "cucharadas",
    cdta: "cucharaditas",
    oz_liquida: "onzas líquidas",
  };

  return unidades[unidad] || unidad;
};