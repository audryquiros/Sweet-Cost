import { useEffect, useState } from "react";

import {
  createProducto,
  updateProducto,
} from "../../../services/productoServices";

import {
  obtenerUnidadBase,
  calcularCantidadTotalProducto,
  calcularTotalCompraProducto,
  calcularCantidadTotalBase,
  calcularCostoUnitario,
  obtenerUnidadCosto,
  obtenerNombreUnidad,
} from "../../../utils/calculosCostos";

import "./ProductosForm.css";

const FORMULARIO_INICIAL = {
  nombre: "",
  marca: "",
  tipo: "ingrediente",
  cantidadPresentaciones: "",
  cantidadPorPresentacion: "",
  unidad: "g",
  precioPorPresentacion: "",
  densidad: "",
  cantidadPorPorcion: "",
  unidadPorPorcion: "g",
};

function ProductosForm({
  producto,
  onProductoCreado,
  onProductoActualizado,
  onCancelar,
}) {
  const [formulario, setFormulario] = useState(
    FORMULARIO_INICIAL
  );

  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (producto) {
      const unidad = producto.unidad || "g";

      setFormulario({
        nombre: producto.nombre || "",
        marca: producto.marca || "",
        tipo: producto.tipo || "ingrediente",

        cantidadPresentaciones:
          producto.cantidadPresentaciones ?? "",

        cantidadPorPresentacion:
          producto.cantidadPorPresentacion ?? "",

        unidad,

        precioPorPresentacion:
          producto.precioPorPresentacion ?? "",

        densidad:
          producto.densidad ?? "",

        cantidadPorPorcion:
          producto.cantidadPorPorcion ?? "",

        unidadPorPorcion:
          producto.unidadPorPorcion ||
          obtenerUnidadBase(unidad),
      });
    } else {
      setFormulario(FORMULARIO_INICIAL);
    }

    setError("");
  }, [producto]);

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario((actual) => {
      const nuevoFormulario = {
        ...actual,
        [name]: value,
      };

      /*
       * Si cambia el tipo de producto:
       *
       * Ingrediente:
       * no necesita cantidad por porción.
       *
       * Topping:
       * utiliza la unidad base del producto.
       *
       * Salsa:
       * utiliza la unidad base del producto.
       */
      if (name === "tipo") {
        if (value === "ingrediente") {
          nuevoFormulario.cantidadPorPorcion = "";
          nuevoFormulario.unidadPorPorcion = "";
        } else {
          nuevoFormulario.unidadPorPorcion =
            obtenerUnidadBase(
              nuevoFormulario.unidad
            );
        }
      }

      /*
       * Si cambia la unidad del producto y es
       * topping o salsa, actualizamos la unidad
       * de la porción automáticamente.
       */
      if (
        name === "unidad" &&
        nuevoFormulario.tipo !== "ingrediente"
      ) {
        nuevoFormulario.unidadPorPorcion =
          obtenerUnidadBase(value);
      }

      return nuevoFormulario;
    });
  };

  const cantidadTotal =
    calcularCantidadTotalProducto(formulario);

  const totalCompra =
    calcularTotalCompraProducto(formulario);

  const cantidadTotalBase =
    calcularCantidadTotalBase(formulario);

  const costoUnitario =
    calcularCostoUnitario(formulario);

  const unidadCosto =
    obtenerUnidadCosto(formulario.unidad);

  const nombreUnidadCosto =
    obtenerNombreUnidad(unidadCosto);

  const manejarSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const cantidadPresentaciones =
      Number(formulario.cantidadPresentaciones);

    const cantidadPorPresentacion =
      Number(formulario.cantidadPorPresentacion);

    const precioPorPresentacion =
      Number(formulario.precioPorPresentacion);

    if (!formulario.nombre.trim()) {
      setError(
        "Ingresa el nombre del producto."
      );
      return;
    }

    if (
      !Number.isFinite(cantidadPresentaciones) ||
      cantidadPresentaciones <= 0
    ) {
      setError(
        "La cantidad de presentaciones debe ser mayor que cero."
      );
      return;
    }

    if (
      !Number.isFinite(cantidadPorPresentacion) ||
      cantidadPorPresentacion <= 0
    ) {
      setError(
        "El contenido por presentación debe ser mayor que cero."
      );
      return;
    }

    if (
      !Number.isFinite(precioPorPresentacion) ||
      precioPorPresentacion < 0
    ) {
      setError(
        "Ingresa un precio por presentación válido."
      );
      return;
    }

    if (
      formulario.densidad !== "" &&
      (
        !Number.isFinite(
          Number(formulario.densidad)
        ) ||
        Number(formulario.densidad) <= 0
      )
    ) {
      setError(
        "La densidad debe ser un valor mayor que cero."
      );
      return;
    }

    /*
     * Solo toppings y salsas necesitan
     * una cantidad por porción.
     */
    if (formulario.tipo !== "ingrediente") {
      const cantidadPorPorcion =
        Number(formulario.cantidadPorPorcion);

      if (
        !Number.isFinite(cantidadPorPorcion) ||
        cantidadPorPorcion <= 0
      ) {
        setError(
          formulario.tipo === "topping"
            ? "La cantidad por topping debe ser mayor que cero."
            : "La cantidad por salsa debe ser mayor que cero."
        );
        return;
      }

      if (!formulario.unidadPorPorcion) {
        setError(
          "Selecciona la unidad de la porción."
        );
        return;
      }
    }

    const productoData = {
      nombre: formulario.nombre.trim(),

      marca: formulario.marca.trim(),

      tipo: formulario.tipo,

      cantidadPresentaciones:
        cantidadPresentaciones,

      cantidadPorPresentacion:
        cantidadPorPresentacion,

      unidad: formulario.unidad,

      precioPorPresentacion:
        precioPorPresentacion,

      densidad:
        formulario.densidad === ""
          ? null
          : Number(formulario.densidad),

      cantidadPorPorcion:
        formulario.tipo === "ingrediente"
          ? null
          : Number(
              formulario.cantidadPorPorcion
            ),

      unidadPorPorcion:
        formulario.tipo === "ingrediente"
          ? null
          : formulario.unidadPorPorcion,
    };

    setGuardando(true);

    try {
      if (producto) {
        const productoActualizado =
          await updateProducto(
            producto.id,
            productoData
          );

        onProductoActualizado(
          productoActualizado
        );
      } else {
        const productoCreado =
          await createProducto(
            productoData
          );

        onProductoCreado(
          productoCreado
        );

        setFormulario(FORMULARIO_INICIAL);
      }
    } catch (error) {
      setError(
        error.message ||
          "No se pudo guardar el producto."
      );
    } finally {
      setGuardando(false);
    }
  };

  const textoPorcion =
    formulario.tipo === "topping"
      ? "Cantidad por topping"
      : "Cantidad por salsa";

  const textoDescripcionPorcion =
    formulario.tipo === "topping"
      ? "Cantidad de producto que se entrega en cada topping."
      : "Cantidad de producto que se entrega en cada salsa.";

  return (
    <form
      className="productos-form"
      onSubmit={manejarSubmit}
    >
      <div className="productos-form-header">
        <h2>
          {producto
            ? "Editar producto"
            : "Agregar producto"}
        </h2>

        <p>
          Registra un ingrediente, topping o salsa.
        </p>
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <div className="productos-form-grid">

        {/* NOMBRE */}

        <div className="form-group">
          <label htmlFor="nombre">
            Nombre del producto
          </label>

          <input
            id="nombre"
            name="nombre"
            type="text"
            value={formulario.nombre}
            onChange={manejarCambio}
            placeholder="Ej. Galletas Oreo"
            required
          />
        </div>

        {/* MARCA */}

        <div className="form-group">
          <label htmlFor="marca">
            Marca
          </label>

          <input
            id="marca"
            name="marca"
            type="text"
            value={formulario.marca}
            onChange={manejarCambio}
            placeholder="Ej. Oreo"
          />
        </div>

        {/* TIPO */}

        <div className="form-group">
          <label htmlFor="tipo">
            Tipo de producto
          </label>

          <select
            id="tipo"
            name="tipo"
            value={formulario.tipo}
            onChange={manejarCambio}
          >
            <option value="ingrediente">
              Ingrediente
            </option>

            <option value="topping">
              Topping
            </option>

            <option value="salsa">
              Salsa
            </option>
          </select>
        </div>

        {/* PRESENTACIONES */}

        <div className="form-group">
          <label htmlFor="cantidadPresentaciones">
            Presentaciones compradas
          </label>

          <input
            id="cantidadPresentaciones"
            name="cantidadPresentaciones"
            type="number"
            min="0"
            step="any"
            value={
              formulario.cantidadPresentaciones
            }
            onChange={manejarCambio}
            placeholder="Ej. 2"
            required
          />

          <small>
            Cantidad de paquetes, bolsas,
            botellas, cajas u otras
            presentaciones que compraste.
          </small>
        </div>

        {/* CONTENIDO */}

        <div className="form-group">
          <label htmlFor="cantidadPorPresentacion">
            Contenido por presentación
          </label>

          <div className="input-with-unit">
            <input
              id="cantidadPorPresentacion"
              name="cantidadPorPresentacion"
              type="number"
              min="0"
              step="any"
              value={
                formulario.cantidadPorPresentacion
              }
              onChange={manejarCambio}
              placeholder="Ej. 500"
              required
            />

            <select
              name="unidad"
              value={formulario.unidad}
              onChange={manejarCambio}
            >
              <option value="g">
                g
              </option>

              <option value="kg">
                kg
              </option>

              <option value="ml">
                ml
              </option>

              <option value="l">
                L
              </option>

              <option value="unidad">
                unidad
              </option>

              <option value="docena">
                docena
              </option>
            </select>
          </div>

          <small>
            Ej. 135 g por tubo, 500 ml por
            botella o 12 unidades por cartón.
          </small>
        </div>

        {/* PRECIO */}

        <div className="form-group">
          <label htmlFor="precioPorPresentacion">
            Precio por presentación
          </label>

          <div className="precio-input">
            <span>₡</span>

            <input
              id="precioPorPresentacion"
              name="precioPorPresentacion"
              type="number"
              min="0"
              step="any"
              value={
                formulario.precioPorPresentacion
              }
              onChange={manejarCambio}
              placeholder="Ej. 2500"
              required
            />
          </div>

          <small>
            Precio de una sola presentación.
          </small>
        </div>

        {/* PORCIÓN */}

        {formulario.tipo !== "ingrediente" && (
          <div className="producto-porcion">
            <div className="form-group">
              <label htmlFor="cantidadPorPorcion">
                {textoPorcion}
              </label>

              <div className="input-with-unit">
                <input
                  id="cantidadPorPorcion"
                  name="cantidadPorPorcion"
                  type="number"
                  min="0"
                  step="any"
                  value={
                    formulario.cantidadPorPorcion
                  }
                  onChange={manejarCambio}
                  placeholder={
                    formulario.tipo === "topping"
                      ? "Ej. 10"
                      : "Ej. 15"
                  }
                  required
                />

                <select
                  name="unidadPorPorcion"
                  value={
                    formulario.unidadPorPorcion
                  }
                  onChange={manejarCambio}
                >
                  <option value="g">
                    g
                  </option>

                  <option value="kg">
                    kg
                  </option>

                  <option value="ml">
                    ml
                  </option>

                  <option value="l">
                    L
                  </option>

                  <option value="unidad">
                    unidad
                  </option>
                </select>
              </div>

              <small>
                {textoDescripcionPorcion}
              </small>
            </div>
          </div>
        )}

        {/* DENSIDAD */}

        <div className="form-group">
          <label htmlFor="densidad">
            Densidad
            <span className="campo-opcional">
              Opcional
            </span>
          </label>

          <input
            id="densidad"
            name="densidad"
            type="number"
            min="0"
            step="any"
            value={formulario.densidad}
            onChange={manejarCambio}
            placeholder="Ej. 0.53"
          />

          <small>
            Se utiliza para conversiones entre
            gramos y mililitros cuando corresponda.
          </small>
        </div>

      </div>

      {/* NOTA */}

      <div className="productos-form-nota">
        <strong>Importante:</strong>

        <p>
          Ingresa la cantidad de producto que
          contiene cada presentación. La cantidad
          de paquetes, bolsas o cajas se registra
          por separado.
        </p>

        <p>
          Ejemplo: si compraste{" "}
          <strong>
            2 tubos de Oreo de 135 g
          </strong>
          , coloca 2 presentaciones y 135 g por
          presentación.
        </p>

        {formulario.tipo === "topping" && (
          <p>
            Para el topping, indica también
            cuántos gramos se entregan en cada
            porción.
          </p>
        )}

        {formulario.tipo === "salsa" && (
          <p>
            Para la salsa, indica también
            cuántos mililitros se entregan en cada
            porción.
          </p>
        )}
      </div>

      {/* RESUMEN */}

      <div className="productos-resumen">

        <div className="resumen-item">
          <span>
            Total disponible
          </span>

          <strong>
            {cantidadTotal > 0
              ? `${cantidadTotal.toLocaleString(
                  "es-CR",
                  {
                    maximumFractionDigits: 2,
                  }
                )} ${obtenerNombreUnidad(
                  formulario.unidad
                )}`
              : "—"}
          </strong>
        </div>

        <div className="resumen-item">
          <span>
            Total de compra
          </span>

          <strong>
            {totalCompra > 0
              ? `₡${totalCompra.toLocaleString(
                  "es-CR",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}`
              : "—"}
          </strong>
        </div>

        <div className="resumen-item">
          <span>
            Costo por {nombreUnidadCosto}
          </span>

          <strong>
            {cantidadTotalBase > 0
              ? `₡${costoUnitario.toLocaleString(
                  "es-CR",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )} / ${nombreUnidadCosto}`
              : "—"}
          </strong>
        </div>

      </div>

      {/* BOTONES */}

      <div className="productos-form-acciones">

        <button
          type="button"
          className="btn-cancelar"
          onClick={onCancelar}
          disabled={guardando}
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="btn-guardar"
          disabled={guardando}
        >
          {guardando
            ? "Guardando..."
            : producto
              ? "Guardar cambios"
              : "Agregar producto"}
        </button>

      </div>
    </form>
  );
}

export default ProductosForm;