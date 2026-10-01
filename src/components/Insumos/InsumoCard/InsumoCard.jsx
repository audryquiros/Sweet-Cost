import {
  obtenerCostoUnitarioInsumo,
  obtenerUnidadCostoInsumo,
} from "../../../utils/calculosCostos";

import Icon from "../../common/Icon/Icon";

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
          className="insumo-btn-editar sc-action-edit"
          onClick={() => onEditar(insumo)}
        >
          <Icon type="edit" size={22} />
          <span>Editar</span>
        </button>

        <button
          type="button"
          className="insumo-btn-eliminar sc-action-delete"
          onClick={() => onEliminar(insumo)}
        >
          <Icon type="trash" size={22} />
          <span>Eliminar</span>
        </button>
      </div>
    </article>
  );
}

export default InsumoCard;