import { useEffect, useState } from "react";
import {
  getInsumos,
  deleteInsumo,
} from "../../services/insumoServices";

import InsumosForm from "../../components/Insumos/InsumosForm/InsumosForm";
import InsumoList from "../../components/Insumos/InsumoList/InsumoList";

import "./Insumos.css";

function Insumos() {
  const [insumos, setInsumos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);
  const [insumoSeleccionado, setInsumoSeleccionado] =
    useState(null);

  const [error, setError] = useState("");

  useEffect(() => {
    cargarInsumos();
  }, []);

  const cargarInsumos = async () => {
    try {
      setError("");

      const data = await getInsumos();

      setInsumos(data);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleMostrarFormulario = () => {
    setInsumoSeleccionado(null);
    setMostrarFormulario(true);
  };

  const handleCancelar = () => {
    setInsumoSeleccionado(null);
    setMostrarFormulario(false);
  };

  const handleInsumoCreado = (insumo) => {
    setInsumos((insumosActuales) => [
      ...insumosActuales,
      insumo,
    ]);

    setMostrarFormulario(false);
  };

  const handleEditar = (insumo) => {
    setInsumoSeleccionado(insumo);
    setMostrarFormulario(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleInsumoActualizado = (
    insumoActualizado
  ) => {
    setInsumos((insumosActuales) =>
      insumosActuales.map((insumo) =>
        insumo.id === insumoActualizado.id
          ? insumoActualizado
          : insumo
      )
    );

    setInsumoSeleccionado(null);
    setMostrarFormulario(false);
  };

  const handleEliminar = async (id) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar este insumo?"
    );

    if (!confirmar) {
      return;
    }

    try {
      await deleteInsumo(id);

      setInsumos((insumosActuales) =>
        insumosActuales.filter(
          (insumo) => insumo.id !== id
        )
      );
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <main className="insumos-page">
      <header className="insumos-header">
        <div>
          <h1>Insumos</h1>

          <p>
            Administra los materiales utilizados para
            preparar y entregar tus productos.
          </p>
        </div>

        {!mostrarFormulario && (
          <button
            type="button"
            className="btn-agregar-insumo"
            onClick={handleMostrarFormulario}
          >
            Agregar insumo
          </button>
        )}
      </header>

      {error && (
        <div className="insumos-error">
          {error}
        </div>
      )}

      {mostrarFormulario && (
        <InsumosForm
          insumo={insumoSeleccionado}
          onInsumoCreado={handleInsumoCreado}
          onInsumoActualizado={
            handleInsumoActualizado
          }
          onCancelar={handleCancelar}
        />
      )}

      <section className="insumos-lista">
        <div className="insumos-lista-header">
          <div>
            <h2>Insumos registrados</h2>

            <p>
              {insumos.length}{" "}
              {insumos.length === 1
                ? "insumo registrado"
                : "insumos registrados"}
            </p>
          </div>
        </div>

        <InsumoList
          insumos={insumos}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
        />
      </section>
    </main>
  );
}

export default Insumos;