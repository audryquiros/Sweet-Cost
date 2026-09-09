import "./InsumoCard.css";

function InsumoCard({
  insumo,
  onEditar,
  onEliminar,
}) {
  const cantidad = Number(insumo.cantidad);
  const precio = Number(insumo.precio);

  let costoUnitario = 0;
  let unidadBase = insumo.unidad;

  if (insumo.unidad === "docena") {
    costoUnitario = precio / (cantidad * 12);
    unidadBase = "unidad";
  } else if (insumo.unidad === "paquete") {
    costoUnitario = precio / cantidad;
    unidadBase = "paquete";
  } else if (insumo.unidad === "kg") {
    costoUnitario = precio / (cantidad * 1000);
    unidadBase = "g";
  } else if (insumo.unidad === "l") {
    costoUnitario = precio / (cantidad * 1000);
    unidadBase = "ml";
  } else if (cantidad > 0) {
    costoUnitario = precio / cantidad;
  }

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
          onClick={() => onEliminar(insumo.id)}
        >
          Eliminar
        </button>
      </div>
    </article>
  );
}

export default InsumoCard;