import { useEffect, useState } from "react";
import {
  createProducto,
  updateProducto,
} from "../../../services/productoServices";
import "./ProductosForm.css";

const formularioInicial = {
  nombre: "",
  marca: "",
  tipo: "ingrediente",
  cantidad: "",
  unidad: "g",
  precio: "",
  densidad: "",
};

function ProductosForm({
  producto,
  onProductoCreado,
  onProductoActualizado,
  onCancelar,
}) {
  const [formulario, setFormulario] =
    useState(formularioInicial);

  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (producto) {
      setFormulario({
        nombre: producto.nombre || "",
        marca: producto.marca || "",
        tipo: producto.tipo || "ingrediente",
        cantidad: producto.cantidad ?? "",
        unidad: producto.unidad || "g",
        precio: producto.precio ?? "",
        densidad: producto.densidad ?? "",
      });
    } else {
      setFormulario(formularioInicial);
    }

    setError("");
  }, [producto]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormulario((formularioActual) => ({
      ...formularioActual,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setGuardando(true);

    const productoData = {
      nombre: formulario.nombre.trim(),
      marca: formulario.marca.trim(),
      tipo: formulario.tipo,
      cantidad: Number(formulario.cantidad),
      unidad: formulario.unidad,
      precio: Number(formulario.precio),
      densidad:
        formulario.densidad === ""
          ? null
          : Number(formulario.densidad),
    };

    try {
      if (producto) {
        const productoActualizado =
          await updateProducto(
            producto.id,
            productoData
          );

        onProductoActualizado(productoActualizado);
      } else {
        const productoCreado =
          await createProducto(productoData);

        onProductoCreado(productoCreado);

        setFormulario(formularioInicial);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="productos-form">
      <div className="productos-form-header">
        <div>
          <h2>
            {producto
              ? "Editar producto"
              : "Agregar producto"}
          </h2>

          <p>
            {producto
              ? "Modifica la información del producto."
              : "Registra un ingrediente, topping o salsa."}
          </p>
        </div>
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nombre">
            Nombre del producto
          </label>

          <input
            id="nombre"
            type="text"
            name="nombre"
            value={formulario.nombre}
            onChange={handleChange}
            placeholder="Ej. Harina"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="marca">
            Marca
          </label>

          <input
            id="marca"
            type="text"
            name="marca"
            value={formulario.marca}
            onChange={handleChange}
            placeholder="Ej. Doña María"
          />
        </div>

        <div className="form-group">
          <label htmlFor="tipo">
            Tipo de producto
          </label>

          <select
            id="tipo"
            name="tipo"
            value={formulario.tipo}
            onChange={handleChange}
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

        <div className="form-group">
          <label htmlFor="cantidad">
            Cantidad comprada
          </label>

          <input
            id="cantidad"
            type="number"
            name="cantidad"
            value={formulario.cantidad}
            onChange={handleChange}
            placeholder="Ej. 1000"
            min="0"
            step="any"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="unidad">
            Unidad
          </label>

          <select
            id="unidad"
            name="unidad"
            value={formulario.unidad}
            onChange={handleChange}
          >
            <option value="g">
              Gramos (g)
            </option>

            <option value="kg">
              Kilogramos (kg)
            </option>

            <option value="ml">
              Mililitros (ml)
            </option>

            <option value="l">
              Litros (l)
            </option>

            <option value="unidad">
              Unidad
            </option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="precio">
            Precio total de compra
          </label>

          <input
            id="precio"
            type="number"
            name="precio"
            value={formulario.precio}
            onChange={handleChange}
            placeholder="Ej. 1200"
            min="0"
            step="any"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="densidad">
            Densidad
          </label>

          <div className="input-con-unidad">
            <input
              id="densidad"
              type="number"
              name="densidad"
              value={formulario.densidad}
              onChange={handleChange}
              placeholder="Ej. 0.53"
              min="0"
              step="0.001"
            />

            <span>g/ml</span>
          </div>

          <small>
            Opcional. Se utiliza para convertir entre
            gramos y volumen.
          </small>
        </div>

        <div className="form-actions">
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
    </section>
  );
}

export default ProductosForm;