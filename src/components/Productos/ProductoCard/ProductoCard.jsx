import {
  calcularCantidadTotalProducto,
  calcularTotalCompraProducto,
  calcularCostoUnitario,
  obtenerUnidadCosto,
  obtenerNombreUnidad,
} from "../../../utils/calculosCostos";

import "./ProductoCard.css";

function ProductoCard({
  producto,
  onEditar,
  onEliminar,
}) {
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

  const densidad =
    Number(producto.densidad);

  const esPorcion =
    producto.tipo === "topping" ||
    producto.tipo === "salsa";

  const nombrePorcion =
    producto.tipo === "topping"
      ? "topping"
      : "salsa";

  const unidadPorcion =
    producto.unidadPorPorcion
      ? obtenerNombreUnidad(
          producto.unidadPorPorcion
        )
      : "";

  const cantidadPorPorcion =
    Number(producto.cantidadPorPorcion);

  const formatearNumero = (valor) => {
    return Number(valor).toLocaleString(
      "es-CR",
      {
        maximumFractionDigits: 2,
      }
    );
  };

  const formatearMoneda = (valor) => {
    return Number(valor).toLocaleString(
      "es-CR",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  const obtenerNombreCategoria = () => {
    if (producto.categoria === "reposteria") {
      return "Repostería";
    }

    if (producto.categoria === "comida") {
      return "Comida";
    }

    if (producto.categoria === "bebidas") {
      return "Bebidas";
    }

    return "";
  };

  const nombreCategoria =
    obtenerNombreCategoria();

  return (
    <article className="producto-card">
      <div className="producto-card-header">
        <div>
          <h3>{producto.nombre}</h3>

          {producto.marca && (
            <p className="producto-marca">
              {producto.marca}
            </p>
          )}
        </div>

        <div className="producto-card-etiquetas">
          <span
            className={`producto-tipo tipo-${producto.tipo}`}
          >
            {producto.tipo}
          </span>

          {nombreCategoria && (
            <span className="producto-categoria">
              {nombreCategoria}
            </span>
          )}
        </div>
      </div>

      <div className="producto-card-info">
        <div className="producto-info-item">
          <span>
            Presentaciones compradas
          </span>

          <strong>
            {formatearNumero(
              producto.cantidadPresentaciones
            )}{" "}
            {producto.cantidadPresentaciones === 1
              ? "presentación"
              : "presentaciones"}
          </strong>
        </div>

        <div className="producto-info-item">
          <span>
            Contenido por presentación
          </span>

          <strong>
            {formatearNumero(
              producto.cantidadPorPresentacion
            )}{" "}
            {obtenerNombreUnidad(
              producto.unidad
            )}
          </strong>
        </div>

        <div className="producto-info-item">
          <span>
            Total disponible
          </span>

          <strong>
            {formatearNumero(
              cantidadTotal
            )}{" "}
            {obtenerNombreUnidad(
              producto.unidad
            )}
          </strong>
        </div>

        <div className="producto-info-item">
          <span>
            Precio por presentación
          </span>

          <strong>
            ₡
            {formatearMoneda(
              producto.precioPorPresentacion
            )}
          </strong>
        </div>

        <div className="producto-info-item">
          <span>
            Total de compra
          </span>

          <strong>
            ₡
            {formatearMoneda(
              totalCompra
            )}
          </strong>
        </div>

        <div className="producto-costo">
          <span>
            Costo por {nombreUnidadCosto}
          </span>

          <strong>
            ₡
            {formatearMoneda(
              costoUnitario
            )}

            <small>
              / {nombreUnidadCosto}
            </small>
          </strong>
        </div>

        {esPorcion &&
          Number.isFinite(
            cantidadPorPorcion
          ) &&
          cantidadPorPorcion > 0 && (
            <div className="producto-porcion">
              <span>
                Cantidad por {nombrePorcion}
              </span>

              <strong>
                {formatearNumero(
                  cantidadPorPorcion
                )}{" "}
                {unidadPorcion}
              </strong>
            </div>
          )}

        {producto.densidad !== null &&
          producto.densidad !== undefined &&
          producto.densidad !== "" &&
          densidad > 0 && (
            <div className="producto-densidad">
              <span>
                Densidad
              </span>

              <strong>
                {formatearNumero(
                  densidad
                )} g/ml
              </strong>
            </div>
          )}
      </div>

      <div className="producto-card-actions">
        <button
          type="button"
          className="btn-editar"
          onClick={() =>
            onEditar(producto)
          }
        >
          Editar
        </button>

        <button
          type="button"
          className="btn-eliminar"
          onClick={() =>
            onEliminar(producto)
          }
        >
          Eliminar
        </button>
      </div>
    </article>
  );
}

export default ProductoCard;