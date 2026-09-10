import { useState } from "react";

import "./CotizadorCard.css";

function CotizadorCard({
  cotizacion,
  onEliminar,
}) {
  const [mostrarDetalles, setMostrarDetalles] =
    useState(false);

  const formatoMoneda = (valor) => {
    return `₡${Number(valor || 0).toFixed(2)}`;
  };

  const cantidadAVender =
    Number(
      cotizacion.cantidadAVender ??
        cotizacion.cantidadCajas ??
        cotizacion.cantidad ??
        0
    ) || 0;

  const unidadesIncluidas =
    cotizacion.unidadesIncluidas ??
    cotizacion.unidadesPorCaja ??
    null;

  const cantidadTotalProductos =
    Number(
      cotizacion.cantidadTotalProductos ??
        (Number(unidadesIncluidas) > 0
          ? cantidadAVender *
            Number(unidadesIncluidas)
          : 0)
    ) || 0;

  const precioPorUnidadVenta =
    Number(
      cotizacion.precioPorUnidadVenta ??
        cotizacion.precioPorCaja ??
        (cantidadAVender > 0
          ? Number(
              cotizacion.precioSugerido || 0
            ) / cantidadAVender
          : 0)
    ) || 0;

  const precioTotalSugerido =
    Number(
      cotizacion.precioSugerido || 0
    ) || 0;

  const fecha = cotizacion.fecha
    ? new Date(
        cotizacion.fecha
      ).toLocaleDateString("es-CR")
    : "";

  const extras = Array.isArray(
    cotizacion.extras
  )
    ? cotizacion.extras
    : [];

  const insumos = Array.isArray(
    cotizacion.insumos
  )
    ? cotizacion.insumos
    : [];

  const toppings = extras.filter(
    (extra) =>
      extra.tipo === "topping"
  );

  const salsas = extras.filter(
    (extra) =>
      extra.tipo === "salsa"
  );

  const imprimirCotizacion = () => {
    window.print();
  };

  return (
    <>
      <article className="cotizador-card">
        {/* HEADER */}

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

        {/* DATOS PRINCIPALES */}

        <div className="cotizador-card-datos">
          <div className="cotizador-card-dato">
            <span>
              Cantidad a vender
            </span>

            <strong>
              {cantidadAVender}
            </strong>
          </div>

          <div className="cotizador-card-dato">
            <span>
              Productos por envase
            </span>

            <strong>
              {unidadesIncluidas ??
                "-"}
            </strong>
          </div>

          <div className="cotizador-card-dato">
            <span>
              Total de productos
            </span>

            <strong>
              {cantidadTotalProductos}
            </strong>
          </div>

          <div className="cotizador-card-dato">
            <span>
              Margen
            </span>

            <strong>
              {Number(
                cotizacion.margen || 0
              )}
              %
            </strong>
          </div>
        </div>

        {/* COSTOS */}

        <div className="cotizador-card-costos">
          <div>
            <span>
              Costo de receta
            </span>

            <strong>
              {formatoMoneda(
                cotizacion.costoReceta
              )}
            </strong>
          </div>

          <div>
            <span>
              Toppings y salsas
            </span>

            <strong>
              {formatoMoneda(
                cotizacion.costoExtras
              )}
            </strong>
          </div>

          <div>
            <span>
              Insumos
            </span>

            <strong>
              {formatoMoneda(
                cotizacion.costoInsumos
              )}
            </strong>
          </div>

          <div>
            <span>
              Mano de obra
            </span>

            <strong>
              {formatoMoneda(
                cotizacion.manoObra
              )}
            </strong>
          </div>
        </div>

        {/* COSTO TOTAL */}

        <div className="cotizador-card-total">
          <span>
            Costo total
          </span>

          <strong>
            {formatoMoneda(
              cotizacion.costoTotal
            )}
          </strong>
        </div>

        {/* PRECIO POR ENVASE */}

        <div className="cotizador-card-precio">
          <span>
            Precio sugerido por envase
          </span>

          <strong>
            {formatoMoneda(
              precioPorUnidadVenta
            )}
          </strong>
        </div>

        {/* PRECIO TOTAL */}

        <div className="cotizador-card-precio-total">
          <span>
            Precio total sugerido
          </span>

          <strong>
            {formatoMoneda(
              precioTotalSugerido
            )}
          </strong>
        </div>

        {/* ACCIONES */}

        <div className="cotizador-card-actions">
          <button
            type="button"
            className="cotizador-card-detalles"
            onClick={() =>
              setMostrarDetalles(true)
            }
          >
            Ver detalles
          </button>

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

      {/* MODAL DE DETALLES */}

      {mostrarDetalles && (
        <div
          className="cotizador-modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              setMostrarDetalles(false);
            }
          }}
        >
          <div className="cotizador-modal">
            <div className="cotizador-modal-header">
              <div>
                <h2>
                  Detalles de la cotización
                </h2>

                <p>
                  {cotizacion.nombre}
                </p>
              </div>

              <button
                type="button"
                className="cotizador-modal-cerrar"
                onClick={() =>
                  setMostrarDetalles(false)
                }
              >
                ×
              </button>
            </div>

            {/* INFORMACIÓN DE LA VENTA */}

            <section className="cotizador-modal-seccion">
              <h3>
                Información de la venta
              </h3>

              <div className="cotizador-modal-grid">
                <div>
                  <span>
                    Receta
                  </span>

                  <strong>
                    {cotizacion.recetaNombre ||
                      "-"}
                  </strong>
                </div>

                <div>
                  <span>
                    Cantidad a vender
                  </span>

                  <strong>
                    {cantidadAVender}
                  </strong>
                </div>

                <div>
                  <span>
                    Productos por envase
                  </span>

                  <strong>
                    {unidadesIncluidas ??
                      "-"}
                  </strong>
                </div>

                <div>
                  <span>
                    Total de productos
                  </span>

                  <strong>
                    {cantidadTotalProductos}
                  </strong>
                </div>

                <div>
                  <span>
                    Margen de ganancia
                  </span>

                  <strong>
                    {Number(
                      cotizacion.margen ||
                        0
                    )}
                    %
                  </strong>
                </div>

                <div>
                  <span>
                    Modo de extras
                  </span>

                  <strong>
                    {cotizacion.extrasModo ===
                    "personalizado"
                      ? "Personalizado"
                      : "Estándar"}
                  </strong>
                </div>
              </div>
            </section>

            {/* EXTRAS */}

            <section className="cotizador-modal-seccion">
              <h3>
                Toppings y salsas
              </h3>

              <div className="cotizador-modal-desglose">
                <div className="cotizador-modal-linea-principal">
                  <span>
                    Toppings por envase
                  </span>

                  <strong>
                    {cotizacion.toppingsPorEnvase ??
                      0}
                  </strong>
                </div>

                <div>
                  <span>
                    Costo de toppings por envase
                  </span>

                  <strong>
                    {formatoMoneda(
                      cotizacion.costoToppingsPorEnvase
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Costo de toppings total
                  </span>

                  <strong>
                    {formatoMoneda(
                      cotizacion.costoToppings
                    )}
                  </strong>
                </div>

                <div className="cotizador-modal-linea-principal">
                  <span>
                    Salsas por envase
                  </span>

                  <strong>
                    {cotizacion.salsasPorEnvase ??
                      0}
                  </strong>
                </div>

                <div>
                  <span>
                    Costo de salsas por envase
                  </span>

                  <strong>
                    {formatoMoneda(
                      cotizacion.costoSalsasPorEnvase
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Costo de salsas total
                  </span>

                  <strong>
                    {formatoMoneda(
                      cotizacion.costoSalsas
                    )}
                  </strong>
                </div>

                <div className="cotizador-modal-linea-total">
                  <span>
                    Total extras por envase
                  </span>

                  <strong>
                    {formatoMoneda(
                      cotizacion.costoExtrasPorEnvase
                    )}
                  </strong>
                </div>

                <div className="cotizador-modal-linea-total-secundaria">
                  <span>
                    Total extras
                  </span>

                  <strong>
                    {formatoMoneda(
                      cotizacion.costoExtras
                    )}
                  </strong>
                </div>
              </div>

              {extras.length > 0 && (
                <div className="cotizador-modal-lista">
                  <h4>
                    Extras utilizados
                  </h4>

                  {extras.map(
                    (extra, index) => (
                      <div
                        className="cotizador-modal-extra"
                        key={
                          `${extra.productoId || extra.nombre || "extra"}-${index}`
                        }
                      >
                        <div>
                          <strong>
                            {extra.nombre ||
                              "Extra"}
                          </strong>

                          <span>
                            {extra.tipo ===
                            "topping"
                              ? "Topping"
                              : "Salsa"}
                          </span>
                        </div>

                        <div>
                          <span>
                            {extra.cantidadPorciones ??
                              extra.cantidadUsos ??
                              1}{" "}
                            porción(es)
                          </span>

                          <strong>
                            {formatoMoneda(
                              extra.costo
                            )}
                          </strong>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              {toppings.length === 0 &&
                salsas.length === 0 &&
                extras.length === 0 && (
                  <p className="cotizador-modal-vacio">
                    No se registraron extras
                    específicos.
                  </p>
                )}
            </section>

            {/* INSUMOS */}

            <section className="cotizador-modal-seccion">
              <h3>
                Insumos
              </h3>

              {insumos.length > 0 ? (
                <div className="cotizador-modal-tabla">
                  <div className="cotizador-modal-tabla-header">
                    <span>
                      Insumo
                    </span>

                    <span>
                      Cant. por envase
                    </span>

                    <span>
                      Cant. total
                    </span>

                    <span>
                      Costo
                    </span>
                  </div>

                  {insumos.map(
                    (insumo, index) => {
                      const cantidadPorEnvase =
                        Number(
                          insumo.cantidadPorEnvase ??
                            insumo.cantidad ??
                            0
                        );

                      const cantidadTotal =
                        Number(
                          insumo.cantidadTotal ??
                            cantidadPorEnvase *
                              cantidadAVender
                        );

                      return (
                        <div
                          className="cotizador-modal-tabla-fila"
                          key={
                            `${insumo.insumoId || insumo.nombre || "insumo"}-${index}`
                          }
                        >
                          <span>
                            {insumo.nombre ||
                              "Insumo"}
                          </span>

                          <span>
                            {cantidadPorEnvase}
                          </span>

                          <span>
                            {cantidadTotal}
                          </span>

                          <strong>
                            {formatoMoneda(
                              insumo.costo
                            )}
                          </strong>
                        </div>
                      );
                    }
                  )}
                </div>
              ) : (
                <p className="cotizador-modal-vacio">
                  No se registraron insumos.
                </p>
              )}

              <div className="cotizador-modal-desglose">
                <div className="cotizador-modal-linea-total">
                  <span>
                    Costo de insumos por envase
                  </span>

                  <strong>
                    {formatoMoneda(
                      cotizacion.costoInsumosPorEnvase
                    )}
                  </strong>
                </div>

                <div className="cotizador-modal-linea-total-secundaria">
                  <span>
                    Costo de insumos total
                  </span>

                  <strong>
                    {formatoMoneda(
                      cotizacion.costoInsumos
                    )}
                  </strong>
                </div>
              </div>
            </section>

            {/* RESUMEN DE COSTOS */}

            <section className="cotizador-modal-seccion">
              <h3>
                Resumen de costos
              </h3>

              <div className="cotizador-modal-desglose">
                <div>
                  <span>
                    Costo de receta
                  </span>

                  <strong>
                    {formatoMoneda(
                      cotizacion.costoReceta
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Toppings y salsas
                  </span>

                  <strong>
                    {formatoMoneda(
                      cotizacion.costoExtras
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Insumos
                  </span>

                  <strong>
                    {formatoMoneda(
                      cotizacion.costoInsumos
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Mano de obra
                  </span>

                  <strong>
                    {formatoMoneda(
                      cotizacion.manoObra
                    )}
                  </strong>
                </div>

                <div className="cotizador-modal-linea-total">
                  <span>
                    Costo total
                  </span>

                  <strong>
                    {formatoMoneda(
                      cotizacion.costoTotal
                    )}
                  </strong>
                </div>

                <div className="cotizador-modal-precio">
                  <span>
                    Precio sugerido por envase
                  </span>

                  <strong>
                    {formatoMoneda(
                      precioPorUnidadVenta
                    )}
                  </strong>
                </div>

                <div className="cotizador-modal-linea-total-secundaria">
                  <span>
                    Precio total sugerido
                  </span>

                  <strong>
                    {formatoMoneda(
                      precioTotalSugerido
                    )}
                  </strong>
                </div>
              </div>
            </section>

            {/* ACCIONES DEL MODAL */}

            <div className="cotizador-modal-actions">
              <button
                type="button"
                className="cotizador-modal-btn-secundario"
                onClick={() =>
                  setMostrarDetalles(false)
                }
              >
                Cerrar
              </button>

              <button
                type="button"
                className="cotizador-modal-btn-imprimir"
                onClick={
                  imprimirCotizacion
                }
              >
                Imprimir / Guardar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CotizadorCard;