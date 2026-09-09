import "./RecetaCard.css";

function RecetaCard({
  receta,
  productos,
  onEditar,
  onEliminar,
}) {
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

    return (
      Number(ingrediente.cantidad) *
      costoUnitario
    );
  };

  const costoTotal = receta.ingredientes.reduce(
    (total, ingrediente) =>
      total +
      calcularCostoIngrediente(ingrediente),
    0
  );

  const rendimiento = Number(receta.rendimiento);

  const costoPorUnidad =
    rendimiento > 0
      ? costoTotal / rendimiento
      : 0;

  return (
    <article className="receta-card">
      <div className="receta-card-header">
        <div>
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

      <div className="receta-ingredientes">
        <div className="receta-ingredientes-title">
          <h4>Ingredientes</h4>
        </div>

        {receta.ingredientes.length === 0 ? (
          <p className="receta-sin-ingredientes">
            No hay ingredientes registrados.
          </p>
        ) : (
          <div className="receta-ingredientes-lista">
            {receta.ingredientes.map(
              (ingrediente, indice) => {
                const producto =
                  productos.find(
                    (producto) =>
                      String(producto.id) ===
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
                    className="receta-ingrediente"
                    key={indice}
                  >
                    <div>
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

                    <strong>
                      ₡{costo.toFixed(2)}
                    </strong>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

      <div className="receta-costos">
        <div className="receta-costo-item">
          <span>Costo total</span>

          <strong>
            ₡{costoTotal.toFixed(2)}
          </strong>
        </div>

        <div className="receta-costo-item destacado">
          <span>Costo por unidad</span>

          <strong>
            ₡{costoPorUnidad.toFixed(2)}
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
  );
}

export default RecetaCard;