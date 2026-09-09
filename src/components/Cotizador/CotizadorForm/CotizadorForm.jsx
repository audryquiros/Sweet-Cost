import { useMemo, useState } from "react";

import {
  createCotizacion,
} from "../../../services/cotizadorServices";

import {
  obtenerCostoUnitarioInsumo,
  calcularCostoPorUso,
  calcularCostoPorRendimiento,
} from "../../../utils/calculosCostos";

import "./CotizadorForm.css";

function CotizadorForm({
  recetas,
  productos,
  insumos,
  onCotizacionCreada,
  onCancelar,
}) {
  const [formulario, setFormulario] =
    useState({
      nombre: "",
      recetaId: "",
      cantidad: 1,
      manoObra: "",
      margen: 30,
    });

  const [extras, setExtras] =
    useState([]);

  const [insumosSeleccionados, setInsumosSeleccionados] =
    useState([]);

  const [error, setError] =
    useState("");

  const [guardando, setGuardando] =
    useState(false);

  const productosExtras =
    productos.filter(
      (producto) =>
        producto.tipo ===
          "topping" ||
        producto.tipo ===
          "salsa"
    );

  const recetaSeleccionada =
    recetas.find(
      (receta) =>
        String(receta.id) ===
        String(
          formulario.recetaId
        )
    );

  const cambiarFormulario = (
    e
  ) => {
    const {
      name,
      value,
    } = e.target;

    setFormulario(
      (actual) => ({
        ...actual,
        [name]: value,
      })
    );
  };

  const seleccionarReceta = (
    e
  ) => {
    setFormulario(
      (actual) => ({
        ...actual,
        recetaId:
          e.target.value,
      })
    );
  };

  const agregarExtra = () => {
    setExtras(
      (actuales) => [
        ...actuales,
        {
          productoId: "",
          cantidad: 1,
        },
      ]
    );
  };

  const cambiarExtra = (
    indice,
    campo,
    valor
  ) => {
    setExtras(
      (actuales) =>
        actuales.map(
          (extra, index) =>
            index === indice
              ? {
                  ...extra,
                  [campo]:
                    valor,
                }
              : extra
        )
    );
  };

  const eliminarExtra = (
    indice
  ) => {
    setExtras(
      (actuales) =>
        actuales.filter(
          (_, index) =>
            index !== indice
        )
    );
  };

  const agregarInsumo = () => {
    setInsumosSeleccionados(
      (actuales) => [
        ...actuales,
        {
          insumoId: "",
          cantidad: 1,
        },
      ]
    );
  };

  const cambiarInsumo = (
    indice,
    campo,
    valor
  ) => {
    setInsumosSeleccionados(
      (actuales) =>
        actuales.map(
          (insumo, index) =>
            index === indice
              ? {
                  ...insumo,
                  [campo]:
                    valor,
                }
              : insumo
        )
    );
  };

  const eliminarInsumo = (
    indice
  ) => {
    setInsumosSeleccionados(
      (actuales) =>
        actuales.filter(
          (_, index) =>
            index !== indice
        )
    );
  };

  const calculos = useMemo(() => {
    const cantidad =
      Number(
        formulario.cantidad
      );

    const manoObra =
      Number(
        formulario.manoObra
      );

    const margen =
      Number(
        formulario.margen
      );

    let costoReceta = 0;

    if (recetaSeleccionada) {
      const costoPorUnidad =
        calcularCostoPorRendimiento(
          recetaSeleccionada,
          productos
        );

      costoReceta =
        costoPorUnidad *
        (
          Number.isFinite(
            cantidad
          )
            ? cantidad
            : 0
        );
    }

    const costoExtras =
      extras.reduce(
        (
          total,
          extra
        ) => {
          const producto =
            productos.find(
              (
                productoActual
              ) =>
                String(
                  productoActual.id
                ) ===
                String(
                  extra.productoId
                )
            );

          if (!producto) {
            return total;
          }

          return (
            total +
            calcularCostoPorUso(
              producto,
              Number(
                extra.cantidad
              )
            )
          );
        },
        0
      );

    const costoInsumos =
      insumosSeleccionados.reduce(
        (
          total,
          item
        ) => {
          const insumo =
            insumos.find(
              (
                insumoActual
              ) =>
                String(
                  insumoActual.id
                ) ===
                String(
                  item.insumoId
                )
            );

          if (!insumo) {
            return total;
          }

          const costoUnitario =
            obtenerCostoUnitarioInsumo(
              insumo
            );

          const cantidadInsumo =
            Number(
              item.cantidad
            );

          if (
            !Number.isFinite(
              cantidadInsumo
            )
          ) {
            return total;
          }

          return (
            total +
            costoUnitario *
              cantidadInsumo
          );
        },
        0
      );

    const manoObraValida =
      Number.isFinite(
        manoObra
      )
        ? manoObra
        : 0;

    const costoProduccion =
      costoReceta +
      costoExtras +
      costoInsumos;

    const costoTotal =
      costoProduccion +
      manoObraValida;

    let precioSugerido = 0;

    if (
      Number.isFinite(
        margen
      ) &&
      margen >= 0 &&
      margen < 100
    ) {
      precioSugerido =
        costoTotal /
        (
          1 -
          margen / 100
        );
    }

    return {
      costoReceta,
      costoExtras,
      costoInsumos,
      costoProduccion,
      manoObra:
        manoObraValida,
      costoTotal,
      precioSugerido,
    };
  }, [
    formulario.cantidad,
    formulario.manoObra,
    formulario.margen,
    recetaSeleccionada,
    productos,
    extras,
    insumosSeleccionados,
    insumos,
  ]);

  const validarFormulario =
    () => {
      if (
        !formulario.nombre.trim()
      ) {
        return "Ingresa un nombre para la cotización.";
      }

      if (
        !formulario.recetaId
      ) {
        return "Selecciona una receta.";
      }

      if (
        Number(
          formulario.cantidad
        ) <= 0
      ) {
        return "La cantidad a vender debe ser mayor que cero.";
      }

      if (
        Number(
          formulario.margen
        ) < 0 ||
        Number(
          formulario.margen
        ) >= 100
      ) {
        return "El margen debe estar entre 0% y 99.99%.";
      }

      for (
        const extra of extras
      ) {
        if (
          !extra.productoId
        ) {
          return "Selecciona un topping o salsa.";
        }

        const producto =
          productos.find(
            (
              productoActual
            ) =>
              String(
                productoActual.id
              ) ===
              String(
                extra.productoId
              )
          );

        if (
          !producto
        ) {
          return "No se encontró uno de los productos seleccionados.";
        }

        if (
          !Number(
            producto.cantidadPorUso
          ) ||
          Number(
            producto.cantidadPorUso
          ) <= 0
        ) {
          return `El producto "${producto.nombre}" no tiene configurada la cantidad por uso. Ve a Productos y edítalo.`;
        }

        if (
          Number(
            extra.cantidad
          ) <= 0
        ) {
          return "La cantidad de toppings o salsas debe ser mayor que cero.";
        }
      }

      for (
        const item of
          insumosSeleccionados
      ) {
        if (
          !item.insumoId
        ) {
          return "Selecciona un insumo.";
        }

        if (
          Number(
            item.cantidad
          ) <= 0
        ) {
          return "La cantidad de insumos debe ser mayor que cero.";
        }
      }

      return "";
    };

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    const mensajeError =
      validarFormulario();

    if (mensajeError) {
      setError(
        mensajeError
      );
      return;
    }

    try {
      setError("");
      setGuardando(true);

      const extrasGuardados =
        extras.map(
          (extra) => {
            const producto =
              productos.find(
                (
                  productoActual
                ) =>
                  String(
                    productoActual.id
                  ) ===
                  String(
                    extra.productoId
                  )
              );

            const cantidadUsos =
              Number(
                extra.cantidad
              );

            return {
              productoId:
                extra.productoId,

              nombre:
                producto?.nombre ||
                "",

              tipo:
                producto?.tipo ||
                "",

              cantidadUsos,

              cantidadPorUso:
                Number(
                  producto?.cantidadPorUso
                ),

              unidadPorUso:
                producto?.unidadPorUso ||
                "",

              costo: Number(
                calcularCostoPorUso(
                  producto,
                  cantidadUsos
                ).toFixed(2)
              ),
            };
          }
        );

      const insumosGuardados =
        insumosSeleccionados.map(
          (item) => {
            const insumo =
              insumos.find(
                (
                  insumoActual
                ) =>
                  String(
                    insumoActual.id
                  ) ===
                  String(
                    item.insumoId
                  )
              );

            return {
              insumoId:
                item.insumoId,

              nombre:
                insumo?.nombre ||
                "",

              cantidad:
                Number(
                  item.cantidad
                ),

              unidad:
                insumo?.unidad ||
                "",

              costo: Number(
                (
                  obtenerCostoUnitarioInsumo(
                    insumo
                  ) *
                  Number(
                    item.cantidad
                  )
                ).toFixed(2)
              ),
            };
          }
        );

      const cotizacion = {
        nombre:
          formulario.nombre.trim(),

        recetaId:
          formulario.recetaId,

        recetaNombre:
          recetaSeleccionada?.nombre ||
          "",

        cantidad:
          Number(
            formulario.cantidad
          ),

        extras:
          extrasGuardados,

        insumos:
          insumosGuardados,

        manoObra:
          Number(
            formulario.manoObra
          ) || 0,

        margen:
          Number(
            formulario.margen
          ),

        costoReceta:
          Number(
            calculos.costoReceta.toFixed(
              2
            )
          ),

        costoExtras:
          Number(
            calculos.costoExtras.toFixed(
              2
            )
          ),

        costoInsumos:
          Number(
            calculos.costoInsumos.toFixed(
              2
            )
          ),

        costoProduccion:
          Number(
            calculos.costoProduccion.toFixed(
              2
            )
          ),

        costoTotal:
          Number(
            calculos.costoTotal.toFixed(
              2
            )
          ),

        precioSugerido:
          Number(
            calculos.precioSugerido.toFixed(
              2
            )
          ),

        fecha:
          new Date().toISOString(),
      };

      const nuevaCotizacion =
        await createCotizacion(
          cotizacion
        );

      onCotizacionCreada(
        nuevaCotizacion
      );
    } catch (error) {
      setError(
        error.message
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form
      className="cotizador-form"
      onSubmit={handleSubmit}
    >
      <div className="cotizador-form-header">
        <div>
          <h2>
            Nueva cotización
          </h2>

          <p>
            Configura exactamente lo que vas a
            vender.
          </p>
        </div>
      </div>

      {error && (
        <div className="cotizador-form-error">
          {error}
        </div>
      )}

      <div className="cotizador-form-grid">
        <div className="cotizador-field">
          <label htmlFor="nombre">
            Nombre de la cotización
          </label>

          <input
            id="nombre"
            name="nombre"
            type="text"
            value={
              formulario.nombre
            }
            onChange={
              cambiarFormulario
            }
            placeholder="Ej. Caja de mini donas"
          />
        </div>

        <div className="cotizador-field">
          <label htmlFor="recetaId">
            Receta
          </label>

          <select
            id="recetaId"
            name="recetaId"
            value={
              formulario.recetaId
            }
            onChange={
              seleccionarReceta
            }
          >
            <option value="">
              Selecciona una receta
            </option>

            {recetas.map(
              (receta) => (
                <option
                  key={
                    receta.id
                  }
                  value={
                    receta.id
                  }
                >
                  {receta.nombre}
                </option>
              )
            )}
          </select>
        </div>

        <div className="cotizador-field">
          <label htmlFor="cantidad">
            Cantidad de productos
          </label>

          <input
            id="cantidad"
            name="cantidad"
            type="number"
            min="1"
            step="1"
            value={
              formulario.cantidad
            }
            onChange={
              cambiarFormulario
            }
          />
        </div>
      </div>

      <section className="cotizador-seccion">
        <div className="cotizador-seccion-header">
          <div>
            <h3>
              Toppings y salsas
            </h3>

            <p>
              Indica cuántos toppings o salsas
              utilizarás. El sistema conoce cuánto
              producto necesita cada uno.
            </p>
          </div>

          <button
            type="button"
            className="btn-agregar-extra"
            onClick={
              agregarExtra
            }
          >
            Agregar
          </button>
        </div>

        {extras.length ===
        0 ? (
          <div className="cotizador-vacio">
            No has agregado toppings ni
            salsas.
          </div>
        ) : (
          <div className="cotizador-items">
            {extras.map(
              (
                extra,
                indice
              ) => {
                const producto =
                  productosExtras.find(
                    (
                      productoActual
                    ) =>
                      String(
                        productoActual.id
                      ) ===
                      String(
                        extra.productoId
                      )
                  );

                const costo =
                  producto
                    ? calcularCostoPorUso(
                        producto,
                        Number(
                          extra.cantidad
                        )
                      )
                    : 0;

                return (
                  <div
                    className="cotizador-item"
                    key={
                      indice
                    }
                  >
                    <div className="cotizador-field">
                      <label>
                        Topping o salsa
                      </label>

                      <select
                        value={
                          extra.productoId
                        }
                        onChange={(
                          e
                        ) =>
                          cambiarExtra(
                            indice,
                            "productoId",
                            e.target.value
                          )
                        }
                      >
                        <option value="">
                          Selecciona
                        </option>

                        {productosExtras.map(
                          (
                            productoActual
                          ) => (
                            <option
                              key={
                                productoActual.id
                              }
                              value={
                                productoActual.id
                              }
                            >
                              {
                                productoActual.nombre
                              }
                              {" - "}
                              {
                                productoActual.tipo
                              }
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div className="cotizador-field">
                      <label>
                        Cantidad de usos
                      </label>

                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={
                          extra.cantidad
                        }
                        onChange={(
                          e
                        ) =>
                          cambiarExtra(
                            indice,
                            "cantidad",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="cotizador-field">
                      <label>
                        Consumo
                      </label>

                      <input
                        type="text"
                        readOnly
                        value={
                          producto
                            ? `${Number(
                                producto.cantidadPorUso
                              )} ${
                                producto.unidadPorUso
                              } / uso`
                            : ""
                        }
                      />
                    </div>

                    <div className="cotizador-field">
                      <label>
                        Costo
                      </label>

                      <input
                        type="text"
                        readOnly
                        value={
                          producto
                            ? `₡${costo.toFixed(
                                2
                              )}`
                            : ""
                        }
                      />
                    </div>

                    <button
                      type="button"
                      className="btn-eliminar-item"
                      onClick={() =>
                        eliminarExtra(
                          indice
                        )
                      }
                    >
                      Eliminar
                    </button>
                  </div>
                );
              }
            )}
          </div>
        )}
      </section>

      <section className="cotizador-seccion">
        <div className="cotizador-seccion-header">
          <div>
            <h3>
              Insumos
            </h3>

            <p>
              Agrega cajas, bolsas, servilletas,
              cubiertos u otros materiales.
            </p>
          </div>

          <button
            type="button"
            className="btn-agregar-extra"
            onClick={
              agregarInsumo
            }
          >
            Agregar
          </button>
        </div>

        {insumosSeleccionados.length ===
        0 ? (
          <div className="cotizador-vacio">
            No has agregado insumos.
          </div>
        ) : (
          <div className="cotizador-items">
            {insumosSeleccionados.map(
              (
                item,
                indice
              ) => (
                <div
                  className="cotizador-item"
                  key={
                    indice
                  }
                >
                  <div className="cotizador-field">
                    <label>
                      Insumo
                    </label>

                    <select
                      value={
                        item.insumoId
                      }
                      onChange={(
                        e
                      ) =>
                        cambiarInsumo(
                          indice,
                          "insumoId",
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Selecciona
                      </option>

                      {insumos.map(
                        (
                          insumo
                        ) => (
                          <option
                            key={
                              insumo.id
                            }
                            value={
                              insumo.id
                            }
                          >
                            {
                              insumo.nombre
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="cotizador-field">
                    <label>
                      Cantidad
                    </label>

                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={
                        item.cantidad
                      }
                      onChange={(
                        e
                      ) =>
                        cambiarInsumo(
                          indice,
                          "cantidad",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <button
                    type="button"
                    className="btn-eliminar-item"
                    onClick={() =>
                      eliminarInsumo(
                        indice
                      )
                    }
                  >
                    Eliminar
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </section>

      <section className="cotizador-seccion">
        <div className="cotizador-seccion-header">
          <div>
            <h3>
              Costos adicionales
            </h3>

            <p>
              Define la mano de obra y el margen de
              ganancia.
            </p>
          </div>
        </div>

        <div className="cotizador-form-grid">
          <div className="cotizador-field">
            <label htmlFor="manoObra">
              Mano de obra
            </label>

            <input
              id="manoObra"
              name="manoObra"
              type="number"
              min="0"
              step="0.01"
              value={
                formulario.manoObra
              }
              onChange={
                cambiarFormulario
              }
              placeholder="₡0"
            />
          </div>

          <div className="cotizador-field">
            <label htmlFor="margen">
              Margen de ganancia (%)
            </label>

            <input
              id="margen"
              name="margen"
              type="number"
              min="0"
              max="99.99"
              step="0.01"
              value={
                formulario.margen
              }
              onChange={
                cambiarFormulario
              }
            />
          </div>
        </div>
      </section>

      <section className="cotizador-resumen">
        <h3>
          Resumen de costos
        </h3>

        <div className="cotizador-resumen-linea">
          <span>
            Costo de receta
          </span>

          <strong>
            ₡
            {calculos.costoReceta.toFixed(
              2
            )}
          </strong>
        </div>

        <div className="cotizador-resumen-linea">
          <span>
            Toppings y salsas
          </span>

          <strong>
            ₡
            {calculos.costoExtras.toFixed(
              2
            )}
          </strong>
        </div>

        <div className="cotizador-resumen-linea">
          <span>
            Insumos
          </span>

          <strong>
            ₡
            {calculos.costoInsumos.toFixed(
              2
            )}
          </strong>
        </div>

        <div className="cotizador-resumen-linea">
          <span>
            Mano de obra
          </span>

          <strong>
            ₡
            {calculos.manoObra.toFixed(
              2
            )}
          </strong>
        </div>

        <div className="cotizador-resumen-total">
          <span>
            Costo total
          </span>

          <strong>
            ₡
            {calculos.costoTotal.toFixed(
              2
            )}
          </strong>
        </div>

        <div className="cotizador-precio">
          <span>
            Precio sugerido
          </span>

          <strong>
            ₡
            {calculos.precioSugerido.toFixed(
              2
            )}
          </strong>
        </div>
      </section>

      <div className="cotizador-form-actions">
        <button
          type="button"
          className="cotizador-btn-cancelar"
          onClick={
            onCancelar
          }
          disabled={
            guardando
          }
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="cotizador-btn-guardar"
          disabled={
            guardando
          }
        >
          {guardando
            ? "Guardando..."
            : "Guardar cotización"}
        </button>
      </div>
    </form>
  );
}

export default CotizadorForm;