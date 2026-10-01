import { useMemo, useState } from "react";
import {
  calcularCostoIngrediente,
  calcularCostoPorRendimiento,
  calcularCostoReceta,
} from "../../../utils/calculosCostos";
import "./RecetaDetalle.css";

function RecetaDetalle({ receta, productos, onEditar, onVolver }) {
  const [pestana, setPestana] = useState("general");
  const [margen, setMargen] = useState(Number(receta.margenGanancia ?? 30));

  const costoTotal = useMemo(
    () => calcularCostoReceta(receta, productos),
    [receta, productos]
  );

  const costoPorUnidad = useMemo(
    () => calcularCostoPorRendimiento(receta, productos),
    [receta, productos]
  );

  const precioSugerido = costoPorUnidad * (1 + margen / 100);


  const obtenerUnidadRendimiento = () => {
    if (receta.unidadRendimiento === "docena") return "docena";
    if (receta.unidadRendimiento === "porciones") return "porción";
    return "unidad";
  };

  const formatoMoneda = (valor) =>
    `₡${Number(valor || 0).toLocaleString("es-CR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const renderIngredientes = () => (
    <div className="receta-detalle-tabla-wrap">
      <table className="receta-detalle-tabla">
        <thead>
          <tr>
            <th>Insumo</th>
            <th>Cantidad</th>
            <th>Unidad</th>
            <th>Costo unitario</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {(receta.ingredientes || []).map((ingrediente, indice) => {
            const producto = productos.find(
              (productoActual) =>
                String(productoActual.id) === String(ingrediente.productoId)
            );
            const subtotal = calcularCostoIngrediente(ingrediente, productos);
            const costoUnitario = ingrediente.cantidad
              ? subtotal / Number(ingrediente.cantidad)
              : 0;

            return (
              <tr key={`${ingrediente.productoId}-${indice}`}>
                <td>
                  <strong>{producto?.nombre || "Producto no encontrado"}</strong>
                </td>
                <td>{ingrediente.cantidad}</td>
                <td>{ingrediente.unidad || "—"}</td>
                <td>{formatoMoneda(costoUnitario)}</td>
                <td className="subtotal">{formatoMoneda(subtotal)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <section className="receta-detalle">
      <button type="button" className="receta-detalle-volver" onClick={onVolver}>
        ← Volver a recetas
      </button>

      <header className="receta-detalle-header">
        <div>
          <div className="receta-detalle-titulo-linea">
            <h1>Receta: {receta.nombre}</h1>
            <span className="receta-detalle-estado">Activa</span>
          </div>
          <p>Consulta la información, ingredientes y costos de esta receta.</p>
        </div>

        <button type="button" className="receta-detalle-editar" onClick={() => onEditar(receta)}>
          Editar receta
        </button>
      </header>

      <div className="receta-detalle-tabs" role="tablist" aria-label="Información de la receta">
        <button
          type="button"
          className={pestana === "general" ? "activo" : ""}
          onClick={() => setPestana("general")}
        >
          Información general
        </button>
        <button
          type="button"
          className={pestana === "ingredientes" ? "activo" : ""}
          onClick={() => setPestana("ingredientes")}
        >
          Ingredientes
        </button>
      </div>

      {pestana === "general" && (
        <>
          <div className="receta-detalle-general">
            <div className="receta-detalle-info">
              <div className="receta-detalle-campo">
                <span>Nombre</span>
                <strong>{receta.nombre}</strong>
              </div>
              <div className="receta-detalle-campo">
                <span>Rinde</span>
                <strong>
                  {receta.rendimiento} {obtenerUnidadRendimiento()}
                </strong>
              </div>
              <div className="receta-detalle-campo receta-detalle-descripcion">
                <span>Descripción</span>
                <strong>{receta.descripcion || "Sin descripción registrada."}</strong>
              </div>
            </div>

            <aside className="receta-detalle-costos">
              <h2>Resumen de costos</h2>
              <div>
                <span>Costo total de ingredientes</span>
                <strong>{formatoMoneda(costoTotal)}</strong>
              </div>
              <div>
                <span>Costo por unidad</span>
                <strong>{formatoMoneda(costoPorUnidad)}</strong>
              </div>
              <label className="receta-detalle-margen">
                <span>Margen de ganancia</span>
                <div>
                  <input
                    type="number"
                    min="0"
                    value={margen}
                    onChange={(event) => setMargen(Number(event.target.value) || 0)}
                  />
                  <b>%</b>
                </div>
              </label>
              <div className="receta-detalle-precio">
                <span>Precio de venta sugerido</span>
                <strong>{formatoMoneda(precioSugerido)}</strong>
              </div>
            </aside>
          </div>

          <section className="receta-detalle-ingredientes">
            <div className="receta-detalle-seccion-header">
              <div>
                <h2>Ingredientes</h2>
                <p>
                  {receta.ingredientes?.length || 0} ingredientes registrados en esta receta.
                </p>
              </div>
              <button type="button" onClick={() => setPestana("ingredientes")}>
                Ver ingredientes
              </button>
            </div>
            {renderIngredientes()}
          </section>
        </>
      )}

      {pestana === "ingredientes" && (
        <section className="receta-detalle-ingredientes receta-detalle-ingredientes-pestana">
          <div className="receta-detalle-seccion-header">
            <div>
              <h2>Ingredientes</h2>
              <p>
                {receta.ingredientes?.length || 0} ingredientes registrados en esta receta.
              </p>
            </div>
          </div>
          {renderIngredientes()}
        </section>
      )}
    </section>
  );
}

export default RecetaDetalle;
