import { useEffect, useState } from "react";
import {
  createInsumo,
  updateInsumo,
} from "../../../services/insumoServices";
import "./InsumosForm.css";

const formularioInicial = {
  nombre: "",
  presentacion: "",
  cantidad: "",
  unidad: "unidad",
  precio: "",
};

function InsumosForm({
  insumo,
  onInsumoCreado,
  onInsumoActualizado,
  onCancelar,
}) {
  const [formulario, setFormulario] =
    useState(formularioInicial);

  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (insumo) {
      setFormulario({
        nombre: insumo.nombre || "",
        presentacion: insumo.presentacion || "",
        cantidad: insumo.cantidad ?? "",
        unidad: insumo.unidad || "unidad",
        precio: insumo.precio ?? "",
      });
    } else {
      setFormulario(formularioInicial);
    }

    setError("");
  }, [insumo]);

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

    const insumoData = {
      nombre: formulario.nombre.trim(),
      presentacion: formulario.presentacion.trim(),
      cantidad: Number(formulario.cantidad),
      unidad: formulario.unidad,
      precio: Number(formulario.precio),
    };

    try {
      if (insumo) {
        const insumoActualizado = await updateInsumo(
          insumo.id,
          insumoData
        );

        onInsumoActualizado(insumoActualizado);
      } else {
        const insumoCreado =
          await createInsumo(insumoData);

        onInsumoCreado(insumoCreado);

        setFormulario(formularioInicial);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="insumos-form">
      <div className="insumos-form-header">
        <div>
          <h2>
            {insumo
              ? "Editar insumo"
              : "Agregar insumo"}
          </h2>

          <p>
            {insumo
              ? "Modifica la información del insumo."
              : "Registra materiales utilizados para preparar o entregar tus productos."}
          </p>
        </div>
      </div>

      {error && (
        <div className="insumos-form-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="insumo-form-group">
          <label htmlFor="nombre">
            Nombre del insumo
          </label>

          <input
            id="nombre"
            type="text"
            name="nombre"
            value={formulario.nombre}
            onChange={handleChange}
            placeholder="Ej. Caja para mini donas"
            required
          />
        </div>

        <div className="insumo-form-group">
          <label htmlFor="presentacion">
            Presentación
          </label>

          <input
            id="presentacion"
            type="text"
            name="presentacion"
            value={formulario.presentacion}
            onChange={handleChange}
            placeholder="Ej. Capacidad para 10 mini donas"
          />
        </div>

        <div className="insumo-form-group">
          <label htmlFor="cantidad">
            Cantidad comprada
          </label>

          <input
            id="cantidad"
            type="number"
            name="cantidad"
            value={formulario.cantidad}
            onChange={handleChange}
            placeholder="Ej. 10"
            min="0"
            step="any"
            required
          />
        </div>

        <div className="insumo-form-group">
          <label htmlFor="unidad">
            Unidad
          </label>

          <select
            id="unidad"
            name="unidad"
            value={formulario.unidad}
            onChange={handleChange}
          >
            <option value="unidad">
              Unidad
            </option>

            <option value="paquete">
              Paquete
            </option>

            <option value="docena">
              Docena
            </option>

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
          </select>
        </div>

        <div className="insumo-form-group">
          <label htmlFor="precio">
            Precio total de compra
          </label>

          <input
            id="precio"
            type="number"
            name="precio"
            value={formulario.precio}
            onChange={handleChange}
            placeholder="Ej. 1500"
            min="0"
            step="any"
            required
          />
        </div>

        <div className="insumos-form-actions">
          <button
            type="button"
            className="insumo-btn-cancelar"
            onClick={onCancelar}
            disabled={guardando}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="insumo-btn-guardar"
            disabled={guardando}
          >
            {guardando
              ? "Guardando..."
              : insumo
              ? "Guardar cambios"
              : "Agregar insumo"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default InsumosForm;