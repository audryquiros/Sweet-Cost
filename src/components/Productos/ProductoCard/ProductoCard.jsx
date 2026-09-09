import "./ProductoCard.css";

function ProductoCard({
  producto,
  onEditar,
  onEliminar,
}) {
  const cantidad = Number(producto.cantidad);
  const precio = Number(producto.precio);
  const densidad = Number(producto.densidad);

  let costoUnitario = 0;
  let unidadBase = producto.unidad;

  if (producto.unidad === "kg") {
    costoUnitario =
      precio / (cantidad * 1000);

    unidadBase = "g";
  } else if (producto.unidad === "l") {
    costoUnitario =
      precio / (cantidad * 1000);

    unidadBase = "ml";
  } else if (cantidad > 0) {
    costoUnitario =
      precio / cantidad;
  }

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

        <span
          className={`producto-tipo tipo-${producto.tipo}`}
        >
          {producto.tipo}
        </span>
      </div>

      <div className="producto-card-info">
        <div className="producto-info-item">
          <span>Cantidad comprada</span>

          <strong>
            {producto.cantidad} {producto.unidad}
          </strong>
        </div>

        <div className="producto-info-item">
          <span>Precio total de compra</span>

          <strong>
            ₡{precio.toFixed(2)}
          </strong>
        </div>

        <div className="producto-costo">
          <span>Costo unitario</span>

          <strong>
            ₡{costoUnitario.toFixed(2)} / {unidadBase}
          </strong>
        </div>

        {producto.densidad !== null &&
          producto.densidad !== undefined &&
          producto.densidad !== "" &&
          densidad > 0 && (
            <div className="producto-densidad">
              <span>Densidad</span>

              <strong>
                {densidad} g/ml
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
            onEliminar(producto.id)
          }
        >
          Eliminar
        </button>
      </div>
    </article>
  );
}

export default ProductoCard;