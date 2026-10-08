import { useEffect, useState } from "react";
import FilterSelect from "../../common/FilterSelect";

import {
  createProducto,
  updateProducto,
} from "../../../services/productoServices";

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
      setFormulario({
        nombre: producto.nombre || "",
        marca: producto.marca || "",
        tipo: producto.tipo || "ingrediente",
        cantidadPresentaciones:
          producto.cantidadPresentaciones ?? "",
        cantidadPorPresentacion:
          producto.cantidadPorPresentacion ?? "",
        unidad: producto.unidad || "g",
        precioPorPresentacion:
          producto.precioPorPresentacion ?? "",
        densidad: producto.densidad ?? "",
        cantidadPorPorcion:
          producto.cantidadPorPorcion ?? "",
        unidadPorPorcion:
          producto.unidadPorPorcion || "g",
      });
    } else {
      setFormulario(FORMULARIO_INICIAL);
    }

    setError("");
  }, [producto]);

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario((actual) => ({
      ...actual,
      [name]: value,
    }));
  };

  const cantidadPresentaciones =
    Number(formulario.cantidadPresentaciones) || 0;

  const cantidadPorPresentacion =
    Number(formulario.cantidadPorPresentacion) || 0;

  const precioPorPresentacion =
    Number(formulario.precioPorPresentacion) || 0;

  const cantidadTotal =
    cantidadPresentaciones *
    cantidadPorPresentacion;

  const totalCompra =
    cantidadPresentaciones *
    precioPorPresentacion;

  const obtenerUnidadCosto = () => {
    if (formulario.unidad === "kg") {
      return "g";
    }

    if (formulario.unidad === "l") {
      return "ml";
    }

    if (formulario.unidad === "docena") {
      return "unidad";
    }

    return formulario.unidad;
  };

  const obtenerCantidadBase = () => {
    if (formulario.unidad === "kg") {
      return cantidadTotal * 1000;
    }

    if (formulario.unidad === "l") {
      return cantidadTotal * 1000;
    }

    if (formulario.unidad === "docena") {
      return cantidadTotal * 12;
    }

    return cantidadTotal;
  };

  const cantidadBase = obtenerCantidadBase();

  const costoUnitario =
    cantidadBase > 0
      ? totalCompra / cantidadBase
      : 0;

  const manejarSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const cantidadPresentacionesNumero =
      Number(formulario.cantidadPresentaciones);

    const cantidadPorPresentacionNumero =
      Number(formulario.cantidadPorPresentacion);

    const precioPorPresentacionNumero =
      Number(formulario.precioPorPresentacion);

    if (!formulario.nombre.trim()) {
      setError(
        "Ingresa el nombre del producto."
      );
      return;
    }


    if (
      !Number.isFinite(
        cantidadPresentacionesNumero
      ) ||
      cantidadPresentacionesNumero <= 0
    ) {
      setError(
        "La cantidad de presentaciones debe ser mayor que cero."
      );
      return;
    }

    if (
      !Number.isFinite(
        cantidadPorPresentacionNumero
      ) ||
      cantidadPorPresentacionNumero <= 0
    ) {
      setError(
        "El contenido por presentación debe ser mayor que cero."
      );
      return;
    }

    if (
      !Number.isFinite(
        precioPorPresentacionNumero
      ) ||
      precioPorPresentacionNumero < 0
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
        Number(formulario.densidad) < 0
      )
    ) {
      setError(
        "La densidad debe ser un valor igual o mayor que cero."
      );
      return;
    }

    const esPorcion =
      formulario.tipo === "topping" ||
      formulario.tipo === "salsa";

    const cantidadPorPorcionNumero =
      Number(formulario.cantidadPorPorcion);

    if (esPorcion) {
      if (
        !Number.isFinite(
          cantidadPorPorcionNumero
        ) ||
        cantidadPorPorcionNumero <= 0
      ) {
        setError(
          "La cantidad por porción debe ser mayor que cero para toppings y salsas."
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
      nombre:
        formulario.nombre.trim(),

      marca:
        formulario.marca.trim(),

      tipo:
        formulario.tipo,


      cantidadPresentaciones:
        cantidadPresentacionesNumero,

      cantidadPorPresentacion:
        cantidadPorPresentacionNumero,

      unidad:
        formulario.unidad,

      precioPorPresentacion:
        precioPorPresentacionNumero,

      // 0 significa "sin densidad" y se guarda como null para que
      // el conversor vuelva a considerarla opcional/no registrada.
      densidad:
        formulario.densidad === "" ||
        Number(formulario.densidad) === 0
          ? null
          : Number(formulario.densidad),

      cantidadPorPorcion:
        esPorcion
          ? cantidadPorPorcionNumero
          : null,

      unidadPorPorcion:
        esPorcion
          ? formulario.unidadPorPorcion
          : null,
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

        setFormulario(
          FORMULARIO_INICIAL
        );
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

  return (
    <form
      className="productos-form"
      onSubmit={manejarSubmit}
    >
      <div className="productos-form-header">
        <h2>
          {producto
            ? "Editar producto"
            : "Registrar producto"}
        </h2>

        <p>
          Registra la presentación en la que
          compraste el producto.
        </p>
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <div className="productos-form-grid">
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

        <div className="form-group">
          <label htmlFor="tipo">
            Tipo
          </label>

          <FilterSelect
            id="tipo"
            value={formulario.tipo}
            options={[
              { valor: "ingrediente", nombre: "Ingrediente" },
              { valor: "topping", nombre: "Topping" },
              { valor: "salsa", nombre: "Salsa" },
            ]}
            onChange={(value) => manejarCambio({ target: { name: "tipo", value } })}
            className="form-filter-select"
            portalMenu
          />
        </div>


        <div className="form-group">
          <label htmlFor="cantidadPresentaciones">
            Cantidad de presentaciones
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
            tubos, botellas, cajas, etc.
            que compraste.
          </small>
        </div>

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
              placeholder="Ej. 135"
              required
            />

            <FilterSelect
              id="unidad"
              value={formulario.unidad}
              options={[
                { valor: "g", nombre: "g" },
                { valor: "kg", nombre: "kg" },
                { valor: "ml", nombre: "ml" },
                { valor: "l", nombre: "L" },
                { valor: "unidad", nombre: "unidad" },
                { valor: "docena", nombre: "docena" },
              ]}
              onChange={(value) => manejarCambio({ target: { name: "unidad", value } })}
              className="form-filter-select"
              portalMenu
            />
          </div>

          <small>
            Ej.: 135 g por tubo, 500 ml por
            botella, 2.5 kg por bolsa o 12
            unidades por cartón.
          </small>
        </div>

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
              placeholder="Ej. 1200"
              required
            />
          </div>
        </div>

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
            Úsala si necesitas convertir entre volumen y peso.
            Puedes dejarla vacía o escribir 0 para quitar la densidad.
          </small>
        </div>

        {(formulario.tipo === "topping" ||
          formulario.tipo === "salsa") && (
          <div className="form-group">
            <label htmlFor="cantidadPorPorcion">
              Cantidad por{" "}
              {formulario.tipo === "topping"
                ? "topping"
                : "salsa"}
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
                placeholder="Ej. 10"
                required
              />

              <FilterSelect
                id="unidadPorPorcion"
                value={formulario.unidadPorPorcion}
                options={[
                  { valor: "g", nombre: "g" },
                  { valor: "kg", nombre: "kg" },
                  { valor: "ml", nombre: "ml" },
                  { valor: "l", nombre: "L" },
                  { valor: "unidad", nombre: "unidad" },
                  { valor: "docena", nombre: "docena" },
                ]}
                onChange={(value) => manejarCambio({ target: { name: "unidadPorPorcion", value } })}
                className="form-filter-select"
                portalMenu
              />
            </div>

            <small>
              Cantidad que se utiliza para una
              porción de este{" "}
              {formulario.tipo === "topping"
                ? "topping"
                : "salsa"}.
              {" "}
              Ej.: 10 g por topping.
            </small>
          </div>
        )}
      </div>

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
      </div>

      <div className="productos-resumen">
        <div className="resumen-item">
          <span>
            Total disponible
          </span>

          <strong>
            {cantidadTotal > 0
              ? `${cantidadTotal} ${formulario.unidad}`
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
            Costo por {obtenerUnidadCosto()}
          </span>

          <strong>
            {costoUnitario > 0
              ? `₡${costoUnitario.toLocaleString(
                  "es-CR",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  }
                )}`
              : "—"}
          </strong>
        </div>
      </div>

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
              : "Registrar producto"}
        </button>
      </div>
    </form>
  );
}

export default ProductosForm;