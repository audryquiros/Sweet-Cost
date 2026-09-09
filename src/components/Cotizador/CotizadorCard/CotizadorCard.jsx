import "./CotizadorCard.css";

function CotizadorCard({
  cotizacion,
  onEliminar,
}) {
  const fecha = cotizacion.fecha
    ? new Date(
        cotizacion.fecha
      ).toLocaleDateString("es-CR")
    : "";

  return (
    <article className="cotizador-card">
      <div className="cotizador-card-header">
        <div>
          <h3>
            {cotizacion.nombre}
          </h3>

          <p>
            {cotizacion.recetaNombre}
          </p>
        </div>

        <span className="cotizador-card-fecha">
          {fecha}
        </span>
      </div>

      <div className="cotizador-card-datos">
        <div className="cotizador-card-dato">
          <span>Cantidad</span>

          <strong>
            {cotizacion.cantidad}
          </strong>
        </div>

        <div className="cotizador-card-dato">
          <span>Margen</span>

          <strong>
            {cotizacion.margen}%
          </strong>
        </div>
      </div>

      <div className="cotizador-card-costos">
        <div>
          <span>
            Costo de receta
          </span>

          <strong>
            ₡
            {Number(
              cotizacion.costoReceta
            ).toFixed(2)}
          </strong>
        </div>

        <div>
          <span>
            Toppings y salsas
          </span>

          <strong>
            ₡
            {Number(
              cotizacion.costoExtras
            ).toFixed(2)}
          </strong>
        </div>

        <div>
          <span>Insumos</span>

          <strong>
            ₡
            {Number(
              cotizacion.costoInsumos
            ).toFixed(2)}
          </strong>
        </div>

        <div>
          <span>
            Mano de obra
          </span>

          <strong>
            ₡
            {Number(
              cotizacion.manoObra
            ).toFixed(2)}
          </strong>
        </div>
      </div>

      <div className="cotizador-card-total">
        <span>
          Costo total
        </span>

        <strong>
          ₡
          {Number(
            cotizacion.costoTotal
          ).toFixed(2)}
        </strong>
      </div>

      <div className="cotizador-card-precio">
        <span>
          Precio sugerido
        </span>

        <strong>
          ₡
          {Number(
            cotizacion.precioSugerido
          ).toFixed(2)}
        </strong>
      </div>

      <div className="cotizador-card-actions">
        <button
          type="button"
          className="cotizador-card-eliminar"
          onClick={() =>
            onEliminar(cotizacion)
          }
        >
          Eliminar
        </button>
      </div>
    </article>
  );
}

export default CotizadorCard;