import { useState } from "react";

import {
  calcularCostoIngrediente,
  calcularCostoPorRendimiento,
  calcularCostoReceta,
} from "../../../utils/calculosCostos";

import "./RecetaCard.css";

function RecetaCard({
  receta,
  productos,
  onEditar,
  onEliminar,
}) {
  const [mostrarIngredientes, setMostrarIngredientes] =
    useState(false);

  const costoTotal = calcularCostoReceta(
    receta,
    productos
  );

  const costoPorRendimiento =
    calcularCostoPorRendimiento(
      receta,
      productos
    );

  const obtenerNombreRendimiento = () => {
    if (receta.unidadRendimiento === "docena") {
      return "docena";
    }

    if (receta.unidadRendimiento === "porciones") {
      return "porción";
    }

    return "unidad";
  };

  const obtenerNombreCategoria = () => {
    if (receta.categoria === "reposteria") {
      return "Repostería";
    }

    if (receta.categoria === "comida") {
      return "Comida";
    }

    if (receta.categoria === "bebidas") {
      return "Bebidas";
    }

    return "General";
  };

  return (
    <>
      <article className="receta-card">
        <div className="receta-card-header">
          <div className="receta-card-title">
            <h3>{receta.nombre}</h3>

            <span className="receta-categoria">
              {obtenerNombreCategoria()}
            </span>

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
            onClick={() => onEliminar(receta)}
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

                <span className="modal-receta-categoria">
                  {obtenerNombreCategoria()}
                </span>
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
                        (productoActual) =>
                          String(
                            productoActual.id
                          ) ===
                          String(
                            ingrediente.productoId
                          )
                      );

                    const costo =
                      calcularCostoIngrediente(
                        ingrediente,
                        productos
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