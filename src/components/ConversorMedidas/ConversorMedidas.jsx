import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { getProductos } from "../../services/productoServices";

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

  const obtenerDensidad = () => {
    if (
      densidadPersonalizada !== ""
    ) {
      const densidad =
        Number(
          densidadPersonalizada
        );

      if (densidad > 0) {
        return densidad;
      }
    }

    if (
      productoSeleccionado &&
      Number(
        productoSeleccionado.densidad
      ) > 0
    ) {
      return Number(
        productoSeleccionado.densidad
      );
    }

    return null;
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

  const convertir = () => {
    setError("");

    setMensaje("");

    setResultado(null);

    const valor = Number(
      cantidad
    );

    if (
      !Number.isFinite(valor) ||
      valor < 0
    ) {
      setError(
        "Ingresa una cantidad válida mayor o igual a cero."
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
      const densidad =
        obtenerDensidad();

      if (!densidad) {
        setError(
          "Este producto no tiene una densidad registrada. Puedes agregarla desde Productos o introducir una densidad personalizada."
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
            type="number"
            value={cantidad}
            onChange={(e) =>
              setCantidad(
                e.target.value
              )
            }
            min="0"
            step="any"
          />
        </div>

        <div className="conversor-group">
          <label htmlFor="conversor-origen">
            Convertir desde
          </label>

          <select
            id="conversor-origen"
            value={unidadOrigen}
            onChange={(e) =>
              setUnidadOrigen(
                e.target.value
              )
            }
          >
            <optgroup label="Masa">
              {unidades.masa.map(
                (unidad) => (
                  <option
                    key={
                      unidad.valor
                    }
                    value={
                      unidad.valor
                    }
                  >
                    {unidad.nombre}
                  </option>
                )
              )}
            </optgroup>

            <optgroup label="Volumen">
              {unidades.volumen.map(
                (unidad) => (
                  <option
                    key={
                      unidad.valor
                    }
                    value={
                      unidad.valor
                    }
                  >
                    {unidad.nombre}
                  </option>
                )
              )}
            </optgroup>

            <optgroup label="Cantidad">
              {unidades.cantidad.map(
                (unidad) => (
                  <option
                    key={
                      unidad.valor
                    }
                    value={
                      unidad.valor
                    }
                  >
                    {unidad.nombre}
                  </option>
                )
              )}
            </optgroup>
          </select>
        </div>

        <div className="conversor-group">
          <label htmlFor="conversor-destino">
            Convertir a
          </label>

          <select
            id="conversor-destino"
            value={unidadDestino}
            onChange={(e) =>
              setUnidadDestino(
                e.target.value
              )
            }
            disabled={Boolean(
              unidadDestinoBase
            )}
          >
            <optgroup label="Masa">
              {unidades.masa.map(
                (unidad) => (
                  <option
                    key={
                      unidad.valor
                    }
                    value={
                      unidad.valor
                    }
                  >
                    {unidad.nombre}
                  </option>
                )
              )}
            </optgroup>

            <optgroup label="Volumen">
              {unidades.volumen.map(
                (unidad) => (
                  <option
                    key={
                      unidad.valor
                    }
                    value={
                      unidad.valor
                    }
                  >
                    {unidad.nombre}
                  </option>
                )
              )}
            </optgroup>

            <optgroup label="Cantidad">
              {unidades.cantidad.map(
                (unidad) => (
                  <option
                    key={
                      unidad.valor
                    }
                    value={
                      unidad.valor
                    }
                  >
                    {unidad.nombre}
                  </option>
                )
              )}
            </optgroup>
          </select>
        </div>

        <div className="conversor-group">
          <label htmlFor="conversor-producto">
            Producto o ingrediente
          </label>

          <select
            id="conversor-producto"
            value={productoId}
            onChange={(e) =>
              setProductoId(
                e.target.value
              )
            }
          >
            <option value="">
              Seleccionar producto
            </option>

            {productos.map(
              (producto) => (
                <option
                  key={producto.id}
                  value={producto.id}
                >
                  {producto.nombre}

                  {producto.marca
                    ? ` - ${producto.marca}`
                    : ""}
                </option>
              )
            )}
          </select>

          <small>
            Selecciona el ingrediente para
            utilizar su densidad.
          </small>
        </div>

        {productoSeleccionado && (
          <div className="conversor-densidad-actual">
            <span>
              Densidad registrada
            </span>

            <strong>
              {densidadActual
                ? `${densidadActual} g/ml`
                : "Sin densidad registrada"}
            </strong>
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
            Opcional. Si la introduces, tendrá
            prioridad sobre la densidad registrada.
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
          >
            Convertir
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