import { useMemo, useState } from "react";

import {
  createCotizacion,
} from "../../../services/cotizadorServices";

import {
  obtenerCostoUnitarioInsumo,
  calcularCostoPorRendimiento,
  calcularCostoPorciones,
} from "../../../utils/calculosCostos";

import "./CotizadorForm.css";

function CotizadorForm({
  recetas,
  productos,
  insumos,
  onCotizacionCreada,
  onCancelar,
}) {
  const [formulario, setFormulario] = useState({
    nombre: "",
    recetaId: "",
    cantidadAVender: 1,
    unidadesIncluidas: 10,
    tiempoPreparacion: 0,
    tiempoCoccion: 0,
    tiempoDecoracion: 0,
    tiempoEmpaque: 0,
    tarifaHora: 2500,
    margen: 30,
  });

  const [extrasModo, setExtrasModo] = useState("estandar");

  const [toppingsPorEnvase, setToppingsPorEnvase] =
    useState(0);

  const [salsasPorEnvase, setSalsasPorEnvase] =
    useState(0);

  const [toppingsSeleccionados, setToppingsSeleccionados] =
    useState([]);

  const [salsasSeleccionadas, setSalsasSeleccionadas] =
    useState([]);

  const [insumosSeleccionados, setInsumosSeleccionados] =
    useState([]);

  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const recetaSeleccionada = useMemo(() => {
    return recetas.find(
      (receta) =>
        String(receta.id) === String(formulario.recetaId)
    );
  }, [recetas, formulario.recetaId]);

  const toppings = useMemo(() => {
    return productos.filter(
      (producto) => producto.tipo === "topping"
    );
  }, [productos]);

  const salsas = useMemo(() => {
    return productos.filter(
      (producto) => producto.tipo === "salsa"
    );
  }, [productos]);

  const cantidadAVender =
    Number(formulario.cantidadAVender) || 0;

  const unidadesIncluidas =
    Number(formulario.unidadesIncluidas) || 0;

  const cantidadTotalProductos =
    cantidadAVender * unidadesIncluidas;

  /* =====================================================
     COSTO DE LA RECETA
  ===================================================== */

  const costoPorUnidadReceta = recetaSeleccionada
    ? calcularCostoPorRendimiento(
        recetaSeleccionada,
        productos
      )
    : 0;

  const costoReceta =
    costoPorUnidadReceta * cantidadTotalProductos;

  /* =====================================================
     COSTO TOPPINGS ESTÁNDAR
  ===================================================== */

  const costoToppingEstandar = useMemo(() => {
    if (!toppings.length) return 0;

    const costos = toppings
      .map((producto) =>
        calcularCostoPorciones(producto, 1)
      )
      .filter((costo) => costo > 0);

    if (!costos.length) return 0;

    return (
      costos.reduce(
        (total, costo) => total + costo,
        0
      ) / costos.length
    );
  }, [toppings]);

  const costoToppingsEstandar =
    costoToppingEstandar *
    toppingsPorEnvase *
    cantidadAVender;

  /* =====================================================
     COSTO TOPPINGS PERSONALIZADOS

     Cada topping seleccionado representa
     UNA porción.

     Ejemplo:
     2 toppings por envase:
       - Oreo
       - M&M

     Se calcula:
       Oreo x 1
       M&M x 1

     y no:
       Oreo x 2
       M&M x 2
  ===================================================== */

  const costoToppingsPersonalizados =
    toppingsSeleccionados.reduce(
      (total, productoId) => {
        const producto = toppings.find(
          (item) =>
            String(item.id) === String(productoId)
        );

        if (!producto) return total;

        const costoPorPorcion =
          calcularCostoPorciones(producto, 1);

        return (
          total +
          costoPorPorcion * cantidadAVender
        );
      },
      0
    );

  const costoToppings =
    extrasModo === "estandar"
      ? costoToppingsEstandar
      : costoToppingsPersonalizados;

  const costoToppingsPorEnvase =
    cantidadAVender > 0
      ? costoToppings / cantidadAVender
      : 0;

  /* =====================================================
     COSTO SALSAS ESTÁNDAR
  ===================================================== */

  const costoSalsaEstandar = useMemo(() => {
    if (!salsas.length) return 0;

    const costos = salsas
      .map((producto) =>
        calcularCostoPorciones(producto, 1)
      )
      .filter((costo) => costo > 0);

    if (!costos.length) return 0;

    return (
      costos.reduce(
        (total, costo) => total + costo,
        0
      ) / costos.length
    );
  }, [salsas]);

  const costoSalsasEstandar =
    costoSalsaEstandar *
    salsasPorEnvase *
    cantidadAVender;

  /* =====================================================
     COSTO SALSAS PERSONALIZADAS

     Cada salsa seleccionada representa
     UNA porción.

     Ejemplo:
     2 salsas por envase:
       - Chocolate
       - Fresa

     Se calcula:
       Chocolate x 1
       Fresa x 1
  ===================================================== */

  const costoSalsasPersonalizadas =
    salsasSeleccionadas.reduce(
      (total, productoId) => {
        const producto = salsas.find(
          (item) =>
            String(item.id) === String(productoId)
        );

        if (!producto) return total;

        const costoPorPorcion =
          calcularCostoPorciones(producto, 1);

        return (
          total +
          costoPorPorcion * cantidadAVender
        );
      },
      0
    );

  const costoSalsas =
    extrasModo === "estandar"
      ? costoSalsasEstandar
      : costoSalsasPersonalizadas;

  const costoSalsasPorEnvase =
    cantidadAVender > 0
      ? costoSalsas / cantidadAVender
      : 0;

  /* =====================================================
     COSTO INSUMOS
  ===================================================== */

  const costoInsumos =
    insumosSeleccionados.reduce(
      (total, item) => {
        const insumo = insumos.find(
          (insumoActual) =>
            String(insumoActual.id) ===
            String(item.insumoId)
        );

        if (!insumo) return total;

        const cantidadPorEnvase =
          Number(item.cantidadPorEnvase) || 0;

        const cantidadTotal =
          cantidadPorEnvase *
          cantidadAVender;

        const costoUnitario =
          obtenerCostoUnitarioInsumo(insumo);

        return (
          total +
          costoUnitario * cantidadTotal
        );
      },
      0
    );

  const costoInsumosPorEnvase =
    cantidadAVender > 0
      ? costoInsumos / cantidadAVender
      : 0;

  /* =====================================================
     COSTOS
  ===================================================== */

  const costoExtras =
    costoToppings + costoSalsas;

  const costoExtrasPorEnvase =
    cantidadAVender > 0
      ? costoExtras / cantidadAVender
      : 0;

  const costoProduccion =
    costoReceta +
    costoExtras +
    costoInsumos;

  /* =====================================================
     PRODUCCIÓN DEL PEDIDO COMPLETO
  ===================================================== */

  const tiempoPreparacion =
    Number(formulario.tiempoPreparacion) || 0;

  const tiempoCoccion =
    Number(formulario.tiempoCoccion) || 0;

  const tiempoDecoracion =
    Number(formulario.tiempoDecoracion) || 0;

  const tiempoEmpaque =
    Number(formulario.tiempoEmpaque) || 0;

  const tarifaHora =
    Number(formulario.tarifaHora) || 0;

  const tiempoTotalProduccion =
    tiempoPreparacion +
    tiempoCoccion +
    tiempoDecoracion +
    tiempoEmpaque;

  const horasProduccion =
    tiempoTotalProduccion / 60;

  const manoObra =
    horasProduccion * tarifaHora;

  const costoTotal =
    costoProduccion + manoObra;

  const margen =
    Number(formulario.margen) || 0;

  const precioSugerido =
    costoTotal +
    costoTotal * (margen / 100);

  const precioPorUnidadVenta =
    cantidadAVender > 0
      ? precioSugerido / cantidadAVender
      : 0;

  /* =====================================================
     CAMBIAR CAMPOS
  ===================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormulario((actual) => ({
      ...actual,
      [name]: value,
    }));
  };

  /* =====================================================
     TOPPINGS PERSONALIZADOS
  ===================================================== */

  const agregarTopping = () => {
    if (
      toppingsSeleccionados.length >=
      toppingsPorEnvase
    ) {
      return;
    }

    setToppingsSeleccionados((actuales) => [
      ...actuales,
      "",
    ]);
  };

  const cambiarTopping = (index, value) => {
    setToppingsSeleccionados((actuales) =>
      actuales.map((item, i) =>
        i === index ? value : item
      )
    );
  };

  const eliminarTopping = (index) => {
    setToppingsSeleccionados((actuales) =>
      actuales.filter((_, i) => i !== index)
    );
  };

  /* =====================================================
     SALSAS PERSONALIZADAS
  ===================================================== */

  const agregarSalsa = () => {
    if (
      salsasSeleccionadas.length >=
      salsasPorEnvase
    ) {
      return;
    }

    setSalsasSeleccionadas((actuales) => [
      ...actuales,
      "",
    ]);
  };

  const cambiarSalsa = (index, value) => {
    setSalsasSeleccionadas((actuales) =>
      actuales.map((item, i) =>
        i === index ? value : item
      )
    );
  };

  const eliminarSalsa = (index) => {
    setSalsasSeleccionadas((actuales) =>
      actuales.filter((_, i) => i !== index)
    );
  };

  /* =====================================================
     INSUMOS
  ===================================================== */

  const agregarInsumo = () => {
    setInsumosSeleccionados((actuales) => [
      ...actuales,
      {
        insumoId: "",
        cantidadPorEnvase: 1,
      },
    ]);
  };

  const cambiarInsumo = (
    index,
    campo,
    valor
  ) => {
    setInsumosSeleccionados((actuales) =>
      actuales.map((item, i) =>
        i === index
          ? {
              ...item,
              [campo]: valor,
            }
          : item
      )
    );
  };

  const eliminarInsumo = (index) => {
    setInsumosSeleccionados((actuales) =>
      actuales.filter((_, i) => i !== index)
    );
  };

  /* =====================================================
     GUARDAR
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formulario.nombre.trim()) {
      setError(
        "Debes ingresar un nombre para la cotización."
      );
      return;
    }

    if (!formulario.recetaId) {
      setError(
        "Debes seleccionar una receta."
      );
      return;
    }

    if (cantidadAVender <= 0) {
      setError(
        "La cantidad a vender debe ser mayor que 0."
      );
      return;
    }

    if (unidadesIncluidas <= 0) {
      setError(
        "La cantidad de productos por envase debe ser mayor que 0."
      );
      return;
    }

    if (margen < 0) {
      setError(
        "El margen no puede ser negativo."
      );
      return;
    }

    /* VALIDAR TOPPINGS */

    if (
      extrasModo === "personalizado" &&
      toppingsPorEnvase !==
        toppingsSeleccionados.length
    ) {
      setError(
        `Debes seleccionar exactamente ${toppingsPorEnvase} topping(s) por envase.`
      );
      return;
    }

    if (
      extrasModo === "personalizado" &&
      toppingsSeleccionados.some(
        (id) => !id
      )
    ) {
      setError(
        "Debes seleccionar todos los toppings personalizados."
      );
      return;
    }

    /* VALIDAR SALSAS */

    if (
      extrasModo === "personalizado" &&
      salsasPorEnvase !==
        salsasSeleccionadas.length
    ) {
      setError(
        `Debes seleccionar exactamente ${salsasPorEnvase} salsa(s) por envase.`
      );
      return;
    }

    if (
      extrasModo === "personalizado" &&
      salsasSeleccionadas.some(
        (id) => !id
      )
    ) {
      setError(
        "Debes seleccionar todas las salsas personalizadas."
      );
      return;
    }

    /* VALIDAR INSUMOS */

    if (
      insumosSeleccionados.some(
        (item) =>
          !item.insumoId ||
          Number(item.cantidadPorEnvase) <= 0
      )
    ) {
      setError(
        "Debes seleccionar todos los insumos y colocar una cantidad por envase mayor que 0."
      );
      return;
    }

    try {
      setGuardando(true);

      const insumosGuardados =
        insumosSeleccionados.map((item) => {
          const cantidadPorEnvase =
            Number(
              item.cantidadPorEnvase
            );

          const cantidadTotal =
            cantidadPorEnvase *
            cantidadAVender;

          const insumo = insumos.find(
            (insumoActual) =>
              String(insumoActual.id) ===
              String(item.insumoId)
          );

          const costoUnitario =
            insumo
              ? obtenerCostoUnitarioInsumo(
                  insumo
                )
              : 0;

          const costoTotal =
            costoUnitario *
            cantidadTotal;

          return {
            insumoId: item.insumoId,
            nombre: insumo
              ? insumo.nombre
              : "",
            cantidadPorEnvase,
            cantidadTotal,
            costoUnitario,
            costo: costoTotal,
          };
        });

      const cotizacion = {
        nombre: formulario.nombre.trim(),

        recetaId: recetaSeleccionada.id,
        recetaNombre: recetaSeleccionada.nombre,

        cantidadAVender,
        unidadesIncluidas,
        cantidadTotalProductos,

        extrasModo,

        toppings: toppingsSeleccionados,
        salsas: salsasSeleccionadas,

        toppingsEstandar:
          toppingsPorEnvase,

        salsasEstandar:
          salsasPorEnvase,

        toppingsPorEnvase,
        salsasPorEnvase,

        extras: [
          ...toppingsSeleccionados.map(
            (productoId) => ({
              tipo: "topping",
              productoId,
            })
          ),
          ...salsasSeleccionadas.map(
            (productoId) => ({
              tipo: "salsa",
              productoId,
            })
          ),
        ],

        insumos: insumosGuardados,

        tiempoPreparacion,
        tiempoCoccion,
        tiempoDecoracion,
        tiempoEmpaque,
        tiempoTotalProduccion,
        horasProduccion,
        tarifaHora,
        manoObra,
        margen,

        costoReceta,

        costoToppings,
        costoToppingsPorEnvase,

        costoSalsas,
        costoSalsasPorEnvase,

        costoExtras,
        costoExtrasPorEnvase,

        costoInsumos,
        costoInsumosPorEnvase,

        costoProduccion,

        costoTotal,
        precioSugerido,
        precioPorUnidadVenta,

        fecha: new Date().toISOString(),
      };

      const nuevaCotizacion =
        await createCotizacion(cotizacion);

      onCotizacionCreada(nuevaCotizacion);
    } catch (error) {
      setError(
        error.message ||
          "No se pudo guardar la cotización."
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
          <h2>Nueva cotización</h2>

          <p>
            Configura la venta y calcula su
            precio sugerido.
          </p>
        </div>
      </div>

      {error && (
        <div className="cotizador-form-error">
          {error}
        </div>
      )}

      {/* DATOS PRINCIPALES */}

      <div className="cotizador-form-grid">
        <div className="cotizador-field">
          <label htmlFor="nombre">
            Nombre de la cotización
          </label>

          <input
            id="nombre"
            name="nombre"
            type="text"
            value={formulario.nombre}
            onChange={handleChange}
            placeholder="Ej. Pedido cumpleaños"
          />
        </div>

        <div className="cotizador-field">
          <label htmlFor="recetaId">
            Receta
          </label>

          <select
            id="recetaId"
            name="recetaId"
            value={formulario.recetaId}
            onChange={handleChange}
          >
            <option value="">
              Selecciona una receta
            </option>

            {recetas.map((receta) => (
              <option
                key={receta.id}
                value={receta.id}
              >
                {receta.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="cotizador-field">
          <label htmlFor="cantidadAVender">
            Cantidad a vender
          </label>

          <input
            id="cantidadAVender"
            name="cantidadAVender"
            type="number"
            min="1"
            value={formulario.cantidadAVender}
            onChange={handleChange}
          />

          <small>
            Ej.: cantidad de cajas, vasos,
            bolsas o envases
          </small>
        </div>

        <div className="cotizador-field">
          <label htmlFor="unidadesIncluidas">
            Cantidad de productos incluidos
            en el envase
          </label>

          <input
            id="unidadesIncluidas"
            name="unidadesIncluidas"
            type="number"
            min="1"
            value={formulario.unidadesIncluidas}
            onChange={handleChange}
          />

          <small>
            {recetaSeleccionada
              ? `Ej.: cantidad de ${recetaSeleccionada.nombre.toLowerCase()} por cada envase`
              : "Ej.: cantidad de productos por cada envase"}
          </small>
        </div>
      </div>

      {/* TOPPINGS Y SALSAS */}

      <section className="cotizador-seccion">
        <div className="cotizador-seccion-header">
          <div>
            <h3>
              Toppings y salsas
            </h3>

            <p>
              Selecciona cómo quieres calcular
              los extras de la venta.
            </p>
          </div>
        </div>

        <div className="cotizador-extra-modos">
          <button
            type="button"
            className={`cotizador-extra-modo ${
              extrasModo === "estandar"
                ? "activo"
                : ""
            }`}
            onClick={() =>
              setExtrasModo("estandar")
            }
          >
            Estándar
          </button>

          <button
            type="button"
            className={`cotizador-extra-modo ${
              extrasModo === "personalizado"
                ? "activo"
                : ""
            }`}
            onClick={() =>
              setExtrasModo("personalizado")
            }
          >
            Personalizado
          </button>
        </div>

        {/* TOPPINGS */}

        <div className="cotizador-subseccion">
          <div className="cotizador-seccion-header">
            <div>
              <h4>Toppings</h4>

              <p>
                Cantidad de toppings que se
                entregan por cada envase.
              </p>
            </div>
          </div>

          <div className="cotizador-form-grid">
            <div className="cotizador-field">
              <label htmlFor="toppingsPorEnvase">
                Cantidad de toppings por
                envase
              </label>

              <input
                id="toppingsPorEnvase"
                type="number"
                min="0"
                value={toppingsPorEnvase}
                onChange={(e) => {
                  const cantidad =
                    Number(e.target.value) || 0;

                  setToppingsPorEnvase(
                    cantidad
                  );

                  setToppingsSeleccionados(
                    (actuales) =>
                      actuales.slice(
                        0,
                        cantidad
                      )
                  );
                }}
                placeholder="Ej. 2"
              />

              <small>
                Coloca 0 si la venta no lleva
                toppings.
              </small>
            </div>
          </div>

          {extrasModo === "personalizado" &&
            toppingsPorEnvase > 0 && (
              <>
                <div className="cotizador-seccion-header">
                  <div>
                    <h4>
                      Toppings seleccionados
                    </h4>
                  </div>

                  <button
                    type="button"
                    className="btn-agregar-extra"
                    onClick={agregarTopping}
                    disabled={
                      toppingsSeleccionados.length >=
                      toppingsPorEnvase
                    }
                  >
                    Agregar topping
                  </button>
                </div>

                <div className="cotizador-items">
                  {toppingsSeleccionados.length ===
                    0 && (
                    <div className="cotizador-vacio">
                      No has seleccionado
                      toppings.
                    </div>
                  )}

                  {toppingsSeleccionados.map(
                    (productoId, index) => (
                      <div
                        className="cotizador-item"
                        key={index}
                      >
                        <div className="cotizador-field">
                          <label>
                            Topping
                          </label>

                          <select
                            value={productoId}
                            onChange={(e) =>
                              cambiarTopping(
                                index,
                                e.target.value
                              )
                            }
                          >
                            <option value="">
                              Selecciona un
                              topping
                            </option>

                            {toppings.map(
                              (producto) => (
                                <option
                                  key={
                                    producto.id
                                  }
                                  value={
                                    producto.id
                                  }
                                >
                                  {
                                    producto.nombre
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        <button
                          type="button"
                          className="btn-eliminar-item"
                          onClick={() =>
                            eliminarTopping(
                              index
                            )
                          }
                        >
                          Eliminar
                        </button>
                      </div>
                    )
                  )}
                </div>

                <small className="cotizador-ayuda-selecciones">
                  Seleccionados:{" "}
                  {toppingsSeleccionados.length}{" "}
                  de {toppingsPorEnvase}
                </small>
              </>
            )}
        </div>

        {/* SALSAS */}

        <div className="cotizador-subseccion">
          <div className="cotizador-seccion-header">
            <div>
              <h4>Salsas</h4>

              <p>
                Cantidad de salsas que se
                entregan por cada envase.
              </p>
            </div>
          </div>

          <div className="cotizador-form-grid">
            <div className="cotizador-field">
              <label htmlFor="salsasPorEnvase">
                Cantidad de salsas por envase
              </label>

              <input
                id="salsasPorEnvase"
                type="number"
                min="0"
                value={salsasPorEnvase}
                onChange={(e) => {
                  const cantidad =
                    Number(e.target.value) || 0;

                  setSalsasPorEnvase(
                    cantidad
                  );

                  setSalsasSeleccionadas(
                    (actuales) =>
                      actuales.slice(
                        0,
                        cantidad
                      )
                  );
                }}
                placeholder="Ej. 2"
              />

              <small>
                Coloca 0 si la venta no lleva
                salsas.
              </small>
            </div>
          </div>

          {extrasModo === "personalizado" &&
            salsasPorEnvase > 0 && (
              <>
                <div className="cotizador-seccion-header">
                  <div>
                    <h4>
                      Salsas seleccionadas
                    </h4>
                  </div>

                  <button
                    type="button"
                    className="btn-agregar-extra"
                    onClick={agregarSalsa}
                    disabled={
                      salsasSeleccionadas.length >=
                      salsasPorEnvase
                    }
                  >
                    Agregar salsa
                  </button>
                </div>

                <div className="cotizador-items">
                  {salsasSeleccionadas.length ===
                    0 && (
                    <div className="cotizador-vacio">
                      No has seleccionado
                      salsas.
                    </div>
                  )}

                  {salsasSeleccionadas.map(
                    (productoId, index) => (
                      <div
                        className="cotizador-item"
                        key={index}
                      >
                        <div className="cotizador-field">
                          <label>
                            Salsa
                          </label>

                          <select
                            value={productoId}
                            onChange={(e) =>
                              cambiarSalsa(
                                index,
                                e.target.value
                              )
                            }
                          >
                            <option value="">
                              Selecciona una
                              salsa
                            </option>

                            {salsas.map(
                              (producto) => (
                                <option
                                  key={
                                    producto.id
                                  }
                                  value={
                                    producto.id
                                  }
                                >
                                  {
                                    producto.nombre
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        <button
                          type="button"
                          className="btn-eliminar-item"
                          onClick={() =>
                            eliminarSalsa(
                              index
                            )
                          }
                        >
                          Eliminar
                        </button>
                      </div>
                    )
                  )}
                </div>

                <small className="cotizador-ayuda-selecciones">
                  Seleccionadas:{" "}
                  {salsasSeleccionadas.length}{" "}
                  de {salsasPorEnvase}
                </small>
              </>
            )}
        </div>

        {/* RESUMEN EXTRAS */}

        <div className="cotizador-resumen-extra">
          <div>
            <span>
              Costo de toppings total
            </span>

            <strong>
              ₡{costoToppings.toFixed(2)}
            </strong>
          </div>

          <div>
            <span>
              Costo de toppings por envase
            </span>

            <strong>
              ₡{costoToppingsPorEnvase.toFixed(2)}
            </strong>
          </div>

          <div>
            <span>
              Costo de salsas total
            </span>

            <strong>
              ₡{costoSalsas.toFixed(2)}
            </strong>
          </div>

          <div>
            <span>
              Costo de salsas por envase
            </span>

            <strong>
              ₡{costoSalsasPorEnvase.toFixed(2)}
            </strong>
          </div>

          <div>
            <span>
              Total extras
            </span>

            <strong>
              ₡{costoExtras.toFixed(2)}
            </strong>
          </div>

          <div>
            <span>
              Total extras por envase
            </span>

            <strong>
              ₡{costoExtrasPorEnvase.toFixed(2)}
            </strong>
          </div>
        </div>
      </section>

      {/* INSUMOS */}

      <section className="cotizador-seccion">
        <div className="cotizador-seccion-header">
          <div>
            <h3>Insumos</h3>

            <p>
              Agrega los materiales necesarios
              para preparar cada envase.
            </p>
          </div>

          <button
            type="button"
            className="btn-agregar-extra"
            onClick={agregarInsumo}
          >
            Agregar insumo
          </button>
        </div>

        <div className="cotizador-items">
          {insumosSeleccionados.length === 0 && (
            <div className="cotizador-vacio">
              No has agregado insumos.
            </div>
          )}

          {insumosSeleccionados.map(
            (item, index) => {
              const insumoSeleccionado =
                insumos.find(
                  (insumo) =>
                    String(insumo.id) ===
                    String(item.insumoId)
                );

              const cantidadPorEnvase =
                Number(
                  item.cantidadPorEnvase
                ) || 0;

              const cantidadTotal =
                cantidadPorEnvase *
                cantidadAVender;

              const costoUnitario =
                insumoSeleccionado
                  ? obtenerCostoUnitarioInsumo(
                      insumoSeleccionado
                    )
                  : 0;

              const costoTotal =
                costoUnitario *
                cantidadTotal;

              return (
                <div
                  className="cotizador-item"
                  key={index}
                >
                  <div className="cotizador-field">
                    <label>
                      Insumo
                    </label>

                    <select
                      value={item.insumoId}
                      onChange={(e) =>
                        cambiarInsumo(
                          index,
                          "insumoId",
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Selecciona un insumo
                      </option>

                      {insumos.map(
                        (insumo) => (
                          <option
                            key={insumo.id}
                            value={insumo.id}
                          >
                            {insumo.nombre}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="cotizador-field">
                    <label>
                      Cantidad por envase
                    </label>

                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={
                        item.cantidadPorEnvase
                      }
                      onChange={(e) =>
                        cambiarInsumo(
                          index,
                          "cantidadPorEnvase",
                          e.target.value
                        )
                      }
                      placeholder="Ej. 2"
                    />

                    <small>
                      Cantidad que necesita
                      cada envase.
                    </small>
                  </div>

                  <div className="cotizador-field">
                    <label>
                      Cantidad total
                    </label>

                    <input
                      type="number"
                      value={cantidadTotal}
                      readOnly
                    />

                    <small>
                      {cantidadPorEnvase} ×{" "}
                      {cantidadAVender}{" "}
                      envases
                    </small>
                  </div>

                  <div className="cotizador-field">
                    <label>
                      Costo
                    </label>

                    <input
                      type="text"
                      value={`₡${costoTotal.toFixed(
                        2
                      )}`}
                      readOnly
                    />
                  </div>

                  <button
                    type="button"
                    className="btn-eliminar-item"
                    onClick={() =>
                      eliminarInsumo(index)
                    }
                  >
                    Eliminar
                  </button>
                </div>
              );
            }
          )}
        </div>

        <div className="cotizador-resumen-extra">
          <div>
            <span>
              Costo de insumos total
            </span>

            <strong>
              ₡{costoInsumos.toFixed(2)}
            </strong>
          </div>

          <div>
            <span>
              Costo de insumos por envase
            </span>

            <strong>
              ₡{costoInsumosPorEnvase.toFixed(2)}
            </strong>
          </div>
        </div>
      </section>

      {/* PRODUCCIÓN DEL PEDIDO COMPLETO */}

      <section className="cotizador-seccion">
        <div className="cotizador-seccion-header">
          <div>
            <h3>Producción del pedido completo</h3>

            <p>
              Registra cuánto tiempo necesitas para
              preparar todo el pedido y calcula
              automáticamente el costo de mano de obra.
            </p>
          </div>
        </div>

        <div className="cotizador-form-grid">
          <div className="cotizador-field">
            <label htmlFor="tiempoPreparacion">
              Preparación (minutos)
            </label>

            <input
              id="tiempoPreparacion"
              name="tiempoPreparacion"
              type="number"
              min="0"
              step="1"
              value={formulario.tiempoPreparacion}
              onChange={handleChange}
              placeholder="Ej. 30"
            />

            <small>
              Tiempo de preparación de todo el pedido.
            </small>
          </div>

          <div className="cotizador-field">
            <label htmlFor="tiempoCoccion">
              Cocción (minutos)
            </label>

            <input
              id="tiempoCoccion"
              name="tiempoCoccion"
              type="number"
              min="0"
              step="1"
              value={formulario.tiempoCoccion}
              onChange={handleChange}
              placeholder="Ej. 60"
            />

            <small>
              Tiempo total de cocción del pedido.
            </small>
          </div>

          <div className="cotizador-field">
            <label htmlFor="tiempoDecoracion">
              Decoración (minutos)
            </label>

            <input
              id="tiempoDecoracion"
              name="tiempoDecoracion"
              type="number"
              min="0"
              step="1"
              value={formulario.tiempoDecoracion}
              onChange={handleChange}
              placeholder="Ej. 45"
            />

            <small>
              Tiempo necesario para decorar todo el pedido.
            </small>
          </div>

          <div className="cotizador-field">
            <label htmlFor="tiempoEmpaque">
              Empaque (minutos)
            </label>

            <input
              id="tiempoEmpaque"
              name="tiempoEmpaque"
              type="number"
              min="0"
              step="1"
              value={formulario.tiempoEmpaque}
              onChange={handleChange}
              placeholder="Ej. 30"
            />

            <small>
              Tiempo necesario para empacar todo el pedido.
            </small>
          </div>

          <div className="cotizador-field">
            <label htmlFor="tarifaHora">
              Costo por hora de trabajo
            </label>

            <input
              id="tarifaHora"
              name="tarifaHora"
              type="number"
              min="0"
              step="1"
              value={formulario.tarifaHora}
              onChange={handleChange}
              placeholder="Ej. 2500"
            />

            <small>
              Tarifa utilizada para calcular la mano de obra.
            </small>
          </div>

          <div className="cotizador-field">
            <label>
              Tiempo total de producción
            </label>

            <input
              type="text"
              value={`${tiempoTotalProduccion} minutos (${horasProduccion.toFixed(2)} h)`}
              readOnly
            />

            <small>
              Suma de preparación, cocción, decoración y empaque.
            </small>
          </div>

          <div className="cotizador-field">
            <label>
              Costo de mano de obra
            </label>

            <input
              type="text"
              value={`₡${manoObra.toFixed(2)}`}
              readOnly
            />

            <small>
              Tiempo total ÷ 60 × costo por hora.
            </small>
          </div>

          <div className="cotizador-field">
            <label htmlFor="margen">
              Ganancia sobre costo (%)
            </label>

            <input
              id="margen"
              name="margen"
              type="number"
              min="0"
              value={formulario.margen}
              onChange={handleChange}
            />

            <small>
              Ej.: 30 significa un 30% de
              ganancia sobre el costo.
            </small>
          </div>
        </div>
      </section>

      {/* RESUMEN */}

      <section className="cotizador-resumen">
        <h3>Resumen de la cotización</h3>

        <div className="cotizador-resumen-linea">
          <span>
            Total de productos
          </span>

          <strong>
            {cantidadTotalProductos}
          </strong>
        </div>

        <div className="cotizador-resumen-linea">
          <span>
            Costo de receta
          </span>

          <strong>
            ₡{costoReceta.toFixed(2)}
          </strong>
        </div>

        <div className="cotizador-resumen-linea">
          <span>
            Toppings y salsas
          </span>

          <strong>
            ₡{costoExtras.toFixed(2)}
          </strong>
        </div>

        <div className="cotizador-resumen-linea">
          <span>
            Costo de insumos total
          </span>

          <strong>
            ₡{costoInsumos.toFixed(2)}
          </strong>
        </div>

        <div className="cotizador-resumen-linea">
          <span>
            Costo de insumos por envase
          </span>

          <strong>
            ₡{costoInsumosPorEnvase.toFixed(2)}
          </strong>
        </div>

        <div className="cotizador-resumen-linea">
          <span>
            Tiempo total de producción
          </span>

          <strong>
            {tiempoTotalProduccion} min
          </strong>
        </div>

        <div className="cotizador-resumen-linea">
          <span>
            Mano de obra
          </span>

          <strong>
            ₡{manoObra.toFixed(2)}
          </strong>
        </div>

        <div className="cotizador-resumen-total">
          <span>
            Costo total
          </span>

          <strong>
            ₡{costoTotal.toFixed(2)}
          </strong>
        </div>

        <div className="cotizador-precio">
          <span>
            Precio sugerido por envase
          </span>

          <strong>
            ₡{precioPorUnidadVenta.toFixed(2)}
          </strong>
        </div>

        <div className="cotizador-resumen-linea">
          <span>
            Precio total sugerido
          </span>

          <strong>
            ₡{precioSugerido.toFixed(2)}
          </strong>
        </div>
      </section>

      {/* BOTONES */}

      <div className="cotizador-form-actions">
        <button
          type="button"
          className="cotizador-btn-cancelar"
          onClick={onCancelar}
          disabled={guardando}
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="cotizador-btn-guardar"
          disabled={guardando}
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