import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { getProductos, updateProducto } from "../../services/productoServices";
import { estimarDensidadIA } from "../../services/aiServices";
import FilterSelect from "../common/FilterSelect";

import "./ConversorMedidas.css";

const unidades = {
  masa: [
    {
      valor: "mg",
      nombre: "Miligramos (mg)",
    },
    {
      valor: "g",
      nombre: "Gramos (g)",
    },
    {
      valor: "kg",
      nombre: "Kilogramos (kg)",
    },
    {
      valor: "oz",
      nombre: "Onzas (oz)",
    },
    {
      valor: "lb",
      nombre: "Libras (lb)",
    },
  ],

  volumen: [
    {
      valor: "ml",
      nombre: "Mililitros (ml)",
    },
    {
      valor: "l",
      nombre: "Litros (L)",
    },
    {
      valor: "taza",
      nombre: "Taza",
    },
    {
      valor: "cda",
      nombre: "Cucharada",
    },
    {
      valor: "cdta",
      nombre: "Cucharadita",
    },
    {
      valor: "oz_liquida",
      nombre: "Onza líquida (fl oz)",
    },
  ],

  cantidad: [
    {
      valor: "unidad",
      nombre: "Unidad",
    },
    {
      valor: "docena",
      nombre: "Docena",
    },
  ],
};

const volumenEnMl = {
  ml: 1,
  l: 1000,
  taza: 240,
  cda: 15,
  cdta: 5,
  oz_liquida: 29.5735,
};

const masaEnGramos = {
  mg: 0.001,
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,
};

// Valores aproximados para ingredientes comunes. Se usan solo cuando
// el producto todavía no tiene una densidad guardada.
const densidadesConocidas = {
  harina: 0.53,
  azucar: 0.85,
  sal: 1.2,
  leche: 1.03,
  aceite: 0.92,
  agua: 1,
  miel: 1.42,
  chocolate: 0.65,
  cacao: 0.52,
  arroz: 0.85,
  avena: 0.41,
  maicena: 0.59,
  almidon: 0.59,
  lechecondensada: 1.28,
};

const normalizarNombre = (valor = "") =>
  String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const buscarDensidadConocida = (producto) => {
  const nombre = normalizarNombre(producto?.nombre);
  const marca = normalizarNombre(producto?.marca);

  const coincidencia = Object.entries(densidadesConocidas).find(([clave]) =>
    nombre.includes(normalizarNombre(clave)) ||
    marca.includes(normalizarNombre(clave))
  );

  return coincidencia ? coincidencia[1] : null;
};

/*
 * Convierte una cantidad escrita como decimal,
 * fracción o número mixto a un número.
 *
 * Ejemplos:
 * "1"     -> 1
 * "1.5"   -> 1.5
 * "1,5"   -> 1.5
 * "1/2"   -> 0.5
 * "3/4"   -> 0.75
 * "1 1/2" -> 1.5
 * "2 1/4" -> 2.25
 */
const interpretarCantidad = (valor) => {
  if (typeof valor !== "string") {
    return null;
  }

  const texto = valor
    .trim()
    .replace(",", ".");

  if (!texto) {
    return null;
  }

  /*
   * Número decimal o entero.
   * Ejemplos: 1, 1.5, 0.25
   */
  if (/^\d*\.?\d+$/.test(texto)) {
    const numero = Number(texto);

    return Number.isFinite(numero)
      ? numero
      : null;
  }

  /*
   * Fracción simple.
   * Ejemplos: 1/2, 1/3, 3/4
   */
  const fraccionSimple =
    texto.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);

  if (fraccionSimple) {
    const numerador = Number(
      fraccionSimple[1]
    );

    const denominador = Number(
      fraccionSimple[2]
    );

    if (
      !Number.isFinite(numerador) ||
      !Number.isFinite(denominador) ||
      denominador === 0
    ) {
      return null;
    }

    const resultado =
      numerador / denominador;

    return Number.isFinite(resultado)
      ? resultado
      : null;
  }

  /*
   * Número mixto.
   * Ejemplos: 1 1/2, 2 1/4, 3 3/4
   */
  const numeroMixto =
    texto.match(
      /^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/
    );

  if (numeroMixto) {
    const entero = Number(
      numeroMixto[1]
    );

    const numerador = Number(
      numeroMixto[2]
    );

    const denominador = Number(
      numeroMixto[3]
    );

    if (
      !Number.isFinite(entero) ||
      !Number.isFinite(numerador) ||
      !Number.isFinite(denominador) ||
      denominador === 0
    ) {
      return null;
    }

    const resultado =
      entero + numerador / denominador;

    return Number.isFinite(resultado)
      ? resultado
      : null;
  }

  return null;
};

const opcionesUnidades = [
  ...unidades.masa.map((u) => ({ valor: u.valor, nombre: `Masa · ${u.nombre}` })),
  ...unidades.volumen.map((u) => ({ valor: u.valor, nombre: `Volumen · ${u.nombre}` })),
  ...unidades.cantidad.map((u) => ({ valor: u.valor, nombre: `Cantidad · ${u.nombre}` })),
];

function ConversorMedidas({
  productoIdInicial = "",
  unidadDestinoBase = "",
  onUsarResultado,
}) {
  const [productos, setProductos] =
    useState([]);

  const [cantidad, setCantidad] =
    useState("1");

  const [unidadOrigen, setUnidadOrigen] =
    useState("taza");

  const [unidadDestino, setUnidadDestino] =
    useState("g");

  const [productoId, setProductoId] =
    useState("");

  const [
    densidadPersonalizada,
    setDensidadPersonalizada,
  ] = useState("");

  const [densidadIA, setDensidadIA] =
    useState(null);

  const [estimandoDensidad, setEstimandoDensidad] =
    useState(false);

  const [guardandoDensidad, setGuardandoDensidad] =
    useState(false);

  const [resultado, setResultado] =
    useState(null);

  const [mensaje, setMensaje] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    setProductoId(
      productoIdInicial || ""
    );

    if (unidadDestinoBase) {
      setUnidadDestino(
        unidadDestinoBase
      );

      if (
        unidadDestinoBase ===
        "unidad"
      ) {
        setUnidadOrigen(
          "unidad"
        );
      }
    } else {
      setUnidadDestino("g");
    }

    setDensidadPersonalizada("");
    setDensidadIA(null);

    setResultado(null);

    setMensaje("");

    setError("");
  }, [
    productoIdInicial,
    unidadDestinoBase,
  ]);

  const cargarProductos = async () => {
    try {
      const data =
        await getProductos();

      setProductos(data);
    } catch (error) {
      setError(error.message);
    }
  };

  const productoSeleccionado =
    useMemo(() => {
      return productos.find(
        (producto) =>
          String(producto.id) ===
          String(productoId)
      );
    }, [
      productos,
      productoId,
    ]);

  const densidadConocida = useMemo(() => {
    if (!productoSeleccionado) return null;
    if (Number(productoSeleccionado.densidad) > 0) return null;
    return buscarDensidadConocida(productoSeleccionado);
  }, [productoSeleccionado]);

  const cambiarProducto = (nuevoProductoId) => {
    setProductoId(nuevoProductoId);
    setDensidadIA(null);
    setDensidadPersonalizada("");
    setResultado(null);
    setError("");
    setMensaje("");
  };

  const obtenerDensidad = () => {
    if (densidadPersonalizada !== "") {
      const densidad = Number(densidadPersonalizada);
      if (densidad > 0) return densidad;
    }

    if (productoSeleccionado && Number(productoSeleccionado.densidad) > 0) {
      return Number(productoSeleccionado.densidad);
    }

    if (densidadIA?.densidad > 0) {
      return Number(densidadIA.densidad);
    }

    if (densidadConocida > 0) {
      return densidadConocida;
    }

    return null;
  };

  const estimarDensidad = async () => {
    if (!productoSeleccionado) {
      setError("Selecciona un producto para estimar su densidad.");
      return null;
    }

    setEstimandoDensidad(true);
    setError("");

    try {
      const data = await estimarDensidadIA({
        producto: {
          id: productoSeleccionado.id,
          nombre: productoSeleccionado.nombre,
          marca: productoSeleccionado.marca || "",
          tipo: productoSeleccionado.tipo || "",
          unidad: productoSeleccionado.unidad || "",
        },
      });

      const densidad = Number(data.densidad);
      if (!Number.isFinite(densidad) || densidad <= 0) {
        throw new Error("La IA no devolvió una densidad válida.");
      }

      const estimacion = {
        densidad,
        confianza: data.confianza || "media",
        fuente: data.fuente || "IA",
        explicacion: data.explicacion || "Estimación aproximada según el producto.",
      };

      setDensidadIA(estimacion);
      return estimacion;
    } catch (error) {
      setError(error.message || "No se pudo estimar la densidad automáticamente.");
      return null;
    } finally {
      setEstimandoDensidad(false);
    }
  };

  const guardarDensidadIA = async () => {
    if (!productoSeleccionado || !densidadIA?.densidad) return;

    setGuardandoDensidad(true);
    setError("");

    try {
      const actualizado = await updateProducto(productoSeleccionado.id, {
        ...productoSeleccionado,
        densidad: densidadIA.densidad,
      });

      setProductos((actuales) =>
        actuales.map((producto) =>
          String(producto.id) === String(actualizado.id)
            ? actualizado
            : producto
        )
      );

      setDensidadIA(null);
      setMensaje("Densidad guardada en el producto.");
    } catch (error) {
      setError(error.message || "No se pudo guardar la densidad en el producto.");
    } finally {
      setGuardandoDensidad(false);
    }
  };

  const obtenerTipoUnidad = (
    unidad
  ) => {
    if (
      masaEnGramos[unidad] !==
      undefined
    ) {
      return "masa";
    }

    if (
      volumenEnMl[unidad] !==
      undefined
    ) {
      return "volumen";
    }

    if (
      unidad === "unidad" ||
      unidad === "docena"
    ) {
      return "cantidad";
    }

    return null;
  };

  const convertir = async () => {
    setError("");

    setMensaje("");

    setResultado(null);

    const valor =
      interpretarCantidad(cantidad);

    if (
      valor === null ||
      valor < 0
    ) {
      setError(
        "Ingresa una cantidad válida. Puedes usar números, fracciones como 1/2 o números mixtos como 1 1/2."
      );

      return;
    }

    if (
      unidadOrigen ===
      unidadDestino
    ) {
      setResultado({
        valor,
        unidad: unidadDestino,
      });

      return;
    }

    const tipoOrigen =
      obtenerTipoUnidad(
        unidadOrigen
      );

    const tipoDestino =
      obtenerTipoUnidad(
        unidadDestino
      );

    if (
      tipoOrigen === "masa" &&
      tipoDestino === "masa"
    ) {
      const gramos =
        valor *
        masaEnGramos[
          unidadOrigen
        ];

      const convertido =
        gramos /
        masaEnGramos[
          unidadDestino
        ];

      setResultado({
        valor: convertido,
        unidad: unidadDestino,
      });

      return;
    }

    if (
      tipoOrigen === "volumen" &&
      tipoDestino === "volumen"
    ) {
      const mililitros =
        valor *
        volumenEnMl[
          unidadOrigen
        ];

      const convertido =
        mililitros /
        volumenEnMl[
          unidadDestino
        ];

      setResultado({
        valor: convertido,
        unidad: unidadDestino,
      });

      return;
    }

    if (
      tipoOrigen === "cantidad" &&
      tipoDestino === "cantidad"
    ) {
      let unidadesTotales =
        valor;

      if (
        unidadOrigen ===
        "docena"
      ) {
        unidadesTotales =
          valor * 12;
      }

      let convertido =
        unidadesTotales;

      if (
        unidadDestino ===
        "docena"
      ) {
        convertido =
          unidadesTotales / 12;
      }

      setResultado({
        valor: convertido,
        unidad: unidadDestino,
      });

      return;
    }

    if (
      (tipoOrigen === "masa" &&
        tipoDestino ===
          "volumen") ||
      (tipoOrigen ===
        "volumen" &&
        tipoDestino ===
          "masa")
    ) {
      let densidad = obtenerDensidad();

      if (!densidad && productoSeleccionado) {
        const estimacion = await estimarDensidad();
        densidad = estimacion?.densidad || null;
      }

      if (!densidad) {
        setError(
          "Este producto no tiene una densidad disponible. Puedes introducirla manualmente o configurarla con IA."
        );
        return;
      }

      let convertido;

      if (
        tipoOrigen === "masa"
      ) {
        const gramos =
          valor *
          masaEnGramos[
            unidadOrigen
          ];

        const mililitros =
          gramos / densidad;

        convertido =
          mililitros /
          volumenEnMl[
            unidadDestino
          ];
      } else {
        const mililitros =
          valor *
          volumenEnMl[
            unidadOrigen
          ];

        const gramos =
          mililitros * densidad;

        convertido =
          gramos /
          masaEnGramos[
            unidadDestino
          ];
      }

      setResultado({
        valor: convertido,
        unidad: unidadDestino,
      });

      return;
    }

    setError(
      "No es posible realizar esta conversión."
    );
  };

  const formatearResultado = (
    valor
  ) => {
    if (
      !Number.isFinite(valor)
    ) {
      return "0";
    }

    if (
      Math.abs(valor) >= 100
    ) {
      return valor.toFixed(1);
    }

    if (
      Math.abs(valor) >= 10
    ) {
      return valor.toFixed(2);
    }

    return valor.toFixed(3);
  };

  const usarResultado = () => {
    if (
      !resultado ||
      !onUsarResultado
    ) {
      return;
    }

    onUsarResultado(
      Number(
        resultado.valor.toFixed(4)
      ),
      resultado.unidad
    );

    setMensaje(
      "Resultado aplicado a la receta."
    );
  };

  const limpiar = () => {
    setCantidad("1");

    setResultado(null);
    setDensidadIA(null);

    setError("");

    setMensaje("");
  };

  const densidadActual =
    obtenerDensidad();

  return (
    <aside className="conversor-medidas">
      <div className="conversor-header">
        <div>
          <h2>
            Conversor de medidas
          </h2>

          <p>
            Convierte cantidades de cocina,
            peso y volumen.
          </p>
        </div>
      </div>

      {error && (
        <div className="conversor-error">
          {error}
        </div>
      )}

      <div className="conversor-form">
        <div className="conversor-group">
          <label htmlFor="conversor-cantidad">
            Cantidad
          </label>

          <input
            id="conversor-cantidad"
            type="text"
            inputMode="decimal"
            value={cantidad}
            onChange={(e) =>
              setCantidad(
                e.target.value
              )
            }
            placeholder="Ej. 1/2 o 1 1/2"
          />

          <small>
            Puedes usar números decimales,
            fracciones como 1/2 o números
            mixtos como 1 1/2.
          </small>
        </div>

        <div className="conversor-group">
          <label htmlFor="conversor-origen">
            Convertir desde
          </label>

          <FilterSelect
            id="conversor-origen"
            value={unidadOrigen}
            options={opcionesUnidades}
            onChange={setUnidadOrigen}
            className="conversor-form-filter-select"
            portalMenu
          />
        </div>

        <div className="conversor-group">
          <label htmlFor="conversor-destino">
            Convertir a
          </label>

          <FilterSelect
            id="conversor-destino"
            value={unidadDestino}
            options={opcionesUnidades}
            onChange={setUnidadDestino}
            disabled={Boolean(unidadDestinoBase)}
            className="conversor-form-filter-select"
            portalMenu
          />
        </div>

        <div className="conversor-group">
          <label htmlFor="conversor-producto">
            Producto o ingrediente
          </label>

          <FilterSelect
            id="conversor-producto"
            value={productoId}
            options={[
              { valor: "", nombre: "Seleccionar producto" },
              ...productos.map((producto) => ({
                valor: producto.id,
                nombre: `${producto.nombre}${producto.marca ? ` - ${producto.marca}` : ""}`,
              })),
            ]}
            onChange={cambiarProducto}
            className="conversor-form-filter-select"
            portalMenu
          />

          <small>
            Selecciona el ingrediente para
            utilizar su densidad.
          </small>
        </div>

        {productoSeleccionado && (
          <div className="conversor-densidad-panel">
            <div className="conversor-densidad-actual">
              <span>
                {productoSeleccionado.densidad
                  ? "Densidad registrada"
                  : densidadIA
                    ? "Densidad estimada por IA"
                    : densidadConocida
                      ? "Densidad automática"
                      : "Densidad"}
              </span>

              <strong>
                {densidadActual
                  ? `${densidadActual} g/ml`
                  : "No disponible"}
              </strong>
            </div>

            {!productoSeleccionado.densidad && densidadConocida && !densidadIA && (
              <small className="conversor-densidad-origen">
                Valor aproximado para un ingrediente común. Se usará automáticamente.
              </small>
            )}

            {densidadIA && (
              <div className="conversor-densidad-ia">
                <div>
                  <strong>Estimación IA</strong>
                  <span>Confianza: {densidadIA.confianza}</span>
                </div>

                <p>{densidadIA.explicacion}</p>

                <div className="conversor-densidad-ia-actions">
                  <button
                    type="button"
                    className="conversor-btn-usar-densidad"
                    onClick={guardarDensidadIA}
                    disabled={guardandoDensidad}
                  >
                    {guardandoDensidad ? "Guardando..." : "Guardar en producto"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="conversor-group">
          <label htmlFor="conversor-densidad">
            Densidad personalizada
          </label>

          <div className="conversor-input-sufijo">
            <input
              id="conversor-densidad"
              type="number"
              value={
                densidadPersonalizada
              }
              onChange={(e) =>
                setDensidadPersonalizada(
                  e.target.value
                )
              }
              min="0"
              step="0.001"
              placeholder="Ej. 0.53"
            />

            <span>
              g/ml
            </span>
          </div>

          <small>
            Opcional. Si la introduces, tendrá prioridad sobre cualquier densidad automática.
          </small>
        </div>

        <div className="conversor-actions">
          <button
            type="button"
            className="conversor-btn-limpiar"
            onClick={limpiar}
          >
            Limpiar
          </button>

          <button
            type="button"
            className="conversor-btn-convertir"
            onClick={convertir}
            disabled={estimandoDensidad}
          >
            {estimandoDensidad ? "Estimando densidad..." : "Convertir"}
          </button>
        </div>
      </div>

      {resultado && (
        <div className="conversor-resultado">
          <span>
            Resultado
          </span>

          <strong>
            {formatearResultado(
              resultado.valor
            )}{" "}
            {resultado.unidad}
          </strong>

          {onUsarResultado && (
            <button
              type="button"
              className="conversor-btn-usar"
              onClick={usarResultado}
            >
              Usar resultado
            </button>
          )}
        </div>
      )}

      {mensaje && (
        <div className="conversor-mensaje">
          {mensaje}
        </div>
      )}
    </aside>
  );
}

export default ConversorMedidas;