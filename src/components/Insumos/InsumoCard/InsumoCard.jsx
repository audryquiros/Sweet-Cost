import {
  obtenerCostoUnitarioInsumo,
  obtenerUnidadCostoInsumo,
} from "../../../utils/calculosCostos";

import "./InsumoCard.css";

function InsumoCard({
  insumo,
  onEditar,
  onEliminar,
}) {
  const precio = Number(insumo.precio);

  const costoUnitario =
    obtenerCostoUnitarioInsumo(insumo);

  const unidadBase =
    obtenerUnidadCostoInsumo(insumo.unidad);

  return (
    <article className="insumo-card">
      <div className="insumo-card-header">
        <div>
          <h3>{insumo.nombre}</h3>

          {insumo.presentacion && (
            <p className="insumo-presentacion">
              {insumo.presentacion}
            </p>
          )}
        </div>

        <span className="insumo-unidad">
          {insumo.unidad}
        </span>
      </div>

      <div className="insumo-card-info">
        <div className="insumo-info-item">
          <span>Cantidad comprada</span>

          <strong>
            {insumo.cantidad} {insumo.unidad}
          </strong>
        </div>

        <div className="insumo-info-item">
          <span>Precio total de compra</span>

          <strong>
            ₡{precio.toFixed(2)}
          </strong>
        </div>

        <div className="insumo-costo">
          <span>Costo unitario</span>

          <strong>
            ₡{costoUnitario.toFixed(2)} / {unidadBase}
          </strong>
        </div>
      </div>

      <div className="insumo-card-actions">
        <button
          type="button"
          className="insumo-btn-editar"
          onClick={() => onEditar(insumo)}
        >
          Editar
        </button>

        <button
          type="button"
          className="insumo-btn-eliminar"
          onClick={() => onEliminar(insumo)}
        >
          Eliminar
        </button>
      </div>
    </article>
  );
}

export default InsumoCard;