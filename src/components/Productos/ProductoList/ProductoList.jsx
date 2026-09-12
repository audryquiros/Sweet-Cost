import ProductoCard from "../ProductoCard/ProductoCard";

import {
  calcularCantidadTotalProducto,
  calcularTotalCompraProducto,
  calcularCostoUnitario,
  obtenerUnidadCosto,
  obtenerNombreUnidad,
} from "../../../utils/calculosCostos";

import "./ProductoList.css";

function ProductoList({
  productos,
  onEditar,
  onEliminar,
  vista = "cards",
}) {
  const formatearNumero = (valor) => {
    return Number(valor).toLocaleString("es-CR", {
      maximumFractionDigits: 2,
    });
  };

  const formatearMoneda = (valor) => {
    return Number(valor).toLocaleString("es-CR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const obtenerNombreCategoria = (categoria) => {
    if (categoria === "reposteria") {
      return "Repostería";
    }

    if (categoria === "comida") {
      return "Comida";
    }

    if (categoria === "bebidas") {
      return "Bebidas";
    }

    return "";
  };

  if (productos.length === 0) {
    return (
      <div className="productos-vacio">
        <h3>No hay productos registrados</h3>

        <p>
          Agrega tu primer producto para comenzar a
          gestionar tus costos.
        </p>
      </div>
    );
  }

  /*
   * =====================================================
   * VISTA DE TARJETAS
   * =====================================================
   */

  if (vista === "cards") {
    return (
      <div className="productos-grid">
        {productos.map((producto) => (
          <ProductoCard
            key={producto.id}
            producto={producto}
            onEditar={onEditar}
            onEliminar={onEliminar}
          />
        ))}
      </div>
    );
  }

  /*
   * =====================================================
   * VISTA DE LISTA
   * =====================================================
   */

  return (
    <div className="productos-lista-vista">
      {/* ENCABEZADO DE LA LISTA */}

      <div className="productos-lista-header">
        <div>Producto</div>
        <div>Tipo</div>
        <div>Disponible</div>
        <div>Precio compra</div>
        <div>Costo unitario</div>
        <div>Porción</div>
        <div>Acciones</div>
      </div>

      {/* PRODUCTOS */}

      {productos.map((producto) => {
        const cantidadTotal =
          calcularCantidadTotalProducto(producto);

        const totalCompra =
          calcularTotalCompraProducto(producto);

        const costoUnitario =
          calcularCostoUnitario(producto);

        const unidadCosto =
          obtenerUnidadCosto(producto.unidad);

        const nombreUnidadCosto =
          obtenerNombreUnidad(unidadCosto);

        const nombreCategoria =
          obtenerNombreCategoria(producto.categoria);

        const esPorcion =
          producto.tipo === "topping" ||
          producto.tipo === "salsa";

        const unidadPorcion =
          producto.unidadPorPorcion
            ? obtenerNombreUnidad(
                producto.unidadPorPorcion
              )
            : "";

        return (
          <article
            className="producto-lista-item"
            key={producto.id}
          >
            {/* PRODUCTO */}

            <div className="producto-lista-producto">
              <div className="producto-lista-nombre">
                {producto.nombre}
              </div>

              {producto.marca && (
                <div className="producto-lista-marca">
                  {producto.marca}
                </div>
              )}

              <div className="producto-lista-etiquetas">
                {producto.tipo && (
                  <span
                    className={`producto-lista-tipo tipo-${producto.tipo}`}
                  >
                    {producto.tipo}
                  </span>
                )}

                {nombreCategoria && (
                  <span className="producto-lista-categoria">
                    {nombreCategoria}
                  </span>
                )}
              </div>
            </div>

            {/* TIPO */}

            <div className="producto-lista-dato producto-lista-tipo-columna">
              <span className="producto-lista-label">
                Tipo
              </span>

              <strong>
                {producto.tipo}
              </strong>
            </div>

            {/* DISPONIBLE */}

            <div className="producto-lista-dato">
              <span className="producto-lista-label">
                Disponible
              </span>

              <strong>
                {formatearNumero(cantidadTotal)}{" "}
                {obtenerNombreUnidad(producto.unidad)}
              </strong>
            </div>

            {/* PRECIO DE COMPRA */}

            <div className="producto-lista-dato">
              <span className="producto-lista-label">
                Compra
              </span>

              <strong>
                ₡{formatearMoneda(totalCompra)}
              </strong>
            </div>

            {/* COSTO UNITARIO */}

            <div className="producto-lista-costo">
              <span className="producto-lista-label">
                Costo por {nombreUnidadCosto}
              </span>

              <strong>
                ₡{formatearMoneda(costoUnitario)}
              </strong>
            </div>

            {/* PORCIÓN */}

            <div className="producto-lista-dato">
              <span className="producto-lista-label">
                {producto.tipo === "topping"
                  ? "Topping"
                  : producto.tipo === "salsa"
                    ? "Salsa"
                    : "Porción"}
              </span>

              {esPorcion &&
              Number(producto.cantidadPorPorcion) > 0 ? (
                <strong>
                  {formatearNumero(
                    producto.cantidadPorPorcion
                  )}{" "}
                  {unidadPorcion}
                </strong>
              ) : (
                <span className="producto-lista-sin-dato">
                  —
                </span>
              )}
            </div>

            {/* ACCIONES */}

            <div className="producto-lista-acciones">
              <button
                type="button"
                className="btn-editar"
                onClick={() => onEditar(producto)}
              >
                Editar
              </button>

              <button
                type="button"
                className="btn-eliminar"
                onClick={() => onEliminar(producto)}
              >
                Eliminar
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default ProductoList;