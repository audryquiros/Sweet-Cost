import { useState } from "react";
import "./RecetaCard.css";

function RecetaCard({
  receta,
  productos,
  onEditar,
  onEliminar,
}) {
  const [mostrarIngredientes, setMostrarIngredientes] =
    useState(false);

  const obtenerCostoUnitario = (producto) => {
    const cantidad = Number(producto.cantidad);
    const precio = Number(producto.precio);

    if (cantidad <= 0) {
      return 0;
    }

    if (producto.unidad === "kg") {
      return precio / (cantidad * 1000);
    }

    if (producto.unidad === "l") {
      return precio / (cantidad * 1000);
    }

    return precio / cantidad;
  };

  const convertirCantidadAUnidadBase = (
    ingrediente,
    producto
  ) => {
    const cantidad = Number(ingrediente.cantidad);

    if (!Number.isFinite(cantidad)) {
      return 0;
    }

    if (producto.unidad === "kg") {
      if (ingrediente.unidad === "kg") {
        return cantidad * 1000;
      }

      if (ingrediente.unidad === "g") {
        return cantidad;
      }

      if (ingrediente.unidad === "mg") {
        return cantidad / 1000;
      }

      if (ingrediente.unidad === "oz") {
        return cantidad * 28.3495;
      }

      if (ingrediente.unidad === "lb") {
        return cantidad * 453.592;
      }
    }

    if (producto.unidad === "l") {
      if (ingrediente.unidad === "l") {
        return cantidad * 1000;
      }

      if (ingrediente.unidad === "ml") {
        return cantidad;
      }
    }

    if (producto.unidad === "unidad") {
      if (ingrediente.unidad === "docena") {
        return cantidad * 12;
      }

      return cantidad;
    }

    return cantidad;
  };

  const calcularCostoIngrediente = (ingrediente) => {
    const producto = productos.find(
      (producto) =>
        String(producto.id) ===
        String(ingrediente.productoId)
    );

    if (!producto) {
      return 0;
    }

    const costoUnitario =
      obtenerCostoUnitario(producto);

    const cantidadBase =
      convertirCantidadAUnidadBase(
        ingrediente,
        producto
      );

    return cantidadBase * costoUnitario;
  };

  const costoTotal = receta.ingredientes.reduce(
    (total, ingrediente) =>
      total +
      calcularCostoIngrediente(ingrediente),
    0
  );

  const rendimiento = Number(receta.rendimiento);

  const costoPorRendimiento =
    rendimiento > 0
      ? costoTotal / rendimiento
      : 0;

  const obtenerNombreRendimiento = () => {
    if (receta.unidadRendimiento === "docena") {
      return "docena";
    }

    if (receta.unidadRendimiento === "porciones") {
      return "porción";
    }

    return "unidad";
  };

  return (
    <>
      <article className="receta-card">
        <div className="receta-card-header">
          <div className="receta-card-title">
            <h3>{receta.nombre}</h3>

            {receta.descripcion && (
              <p className="receta-descripcion">
                {receta.descripcion}
              </p>
            )}
          </div>

          <span className="receta-rendimiento">
            {receta.rendimiento}{" "}
            {receta.unidadRendimiento}
          </span>
        </div>

        <div className="receta-ingredientes-resumen">
          <div>
            <h4>Ingredientes</h4>

            <p>
              {receta.ingredientes.length}{" "}
              {receta.ingredientes.length === 1
                ? "ingrediente"
                : "ingredientes"}
            </p>
          </div>

          <button
            type="button"
            className="btn-ver-ingredientes"
            onClick={() =>
              setMostrarIngredientes(true)
            }
          >
            Ver ingredientes
          </button>
        </div>

        <div className="receta-costos">
          <div className="receta-costo-item">
            <span>Costo total</span>

            <strong>
              ₡{costoTotal.toFixed(2)}
            </strong>
          </div>

          <div className="receta-costo-item destacado">
            <span>
              Costo por{" "}
              {obtenerNombreRendimiento()}
            </span>

            <strong>
              ₡{costoPorRendimiento.toFixed(2)}
            </strong>
          </div>
        </div>

        <div className="receta-card-actions">
          <button
            type="button"
            className="receta-btn-editar"
            onClick={() => onEditar(receta)}
          >
            Editar
          </button>

          <button
            type="button"
            className="receta-btn-eliminar"
            onClick={() => onEliminar(receta.id)}
          >
            Eliminar
          </button>
        </div>
      </article>

      {mostrarIngredientes && (
        <div
          className="ingredientes-modal-overlay"
          onClick={() =>
            setMostrarIngredientes(false)
          }
        >
          <div
            className="ingredientes-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="ingredientes-modal-header">
              <div>
                <h3>Ingredientes</h3>

                <p>{receta.nombre}</p>
              </div>

              <button
                type="button"
                className="ingredientes-modal-cerrar"
                onClick={() =>
                  setMostrarIngredientes(false)
                }
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="ingredientes-modal-lista">
              {receta.ingredientes.length === 0 ? (
                <div className="modal-sin-ingredientes">
                  No hay ingredientes registrados.
                </div>
              ) : (
                receta.ingredientes.map(
                  (ingrediente, indice) => {
                    const producto =
                      productos.find(
                        (producto) =>
                          String(
                            producto.id
                          ) ===
                          String(
                            ingrediente.productoId
                          )
                      );

                    const costo =
                      calcularCostoIngrediente(
                        ingrediente
                      );

                    return (
                      <div
                        className="modal-ingrediente"
                        key={indice}
                      >
                        <div className="modal-ingrediente-info">
                          <strong>
                            {producto
                              ? producto.nombre
                              : "Producto no encontrado"}
                          </strong>

                          <span>
                            {ingrediente.cantidad}{" "}
                            {ingrediente.unidad}
                          </span>
                        </div>

                        <strong className="modal-ingrediente-costo">
                          ₡{costo.toFixed(2)}
                        </strong>
                      </div>
                    );
                  }
                )
              )}
            </div>

            <div className="ingredientes-modal-footer">
              <div>
                <span>
                  Costo total de ingredientes
                </span>

                <strong>
                  ₡{costoTotal.toFixed(2)}
                </strong>
              </div>

              <button
                type="button"
                className="modal-btn-cerrar"
                onClick={() =>
                  setMostrarIngredientes(false)
                }
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default RecetaCard;