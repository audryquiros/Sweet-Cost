import { useEffect, useState } from "react";

import {
  getInsumos,
  deleteInsumo,
} from "../../services/insumoServices";

import InsumosForm from "../../components/Insumos/InsumosForm/InsumosForm";
import InsumoList from "../../components/Insumos/InsumoList/InsumoList";
import Confirmacion from "../../components/Confirmacion/Confirmacion";

import "./Insumos.css";

function Insumos() {
  const [insumos, setInsumos] = useState([]);

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [insumoSeleccionado, setInsumoSeleccionado] =
    useState(null);

  const [insumoAEliminar, setInsumoAEliminar] =
    useState(null);

  const [mensajeExito, setMensajeExito] =
    useState("");

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

    setMensajeExito(
      "Insumo agregado correctamente."
    );

    setMostrarFormulario(false);

    setTimeout(() => {
      setMensajeExito("");
    }, 3000);
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

    setMensajeExito(
      "Insumo actualizado correctamente."
    );

    setTimeout(() => {
      setMensajeExito("");
    }, 3000);
  };

  const handleEliminar = (insumo) => {
    setInsumoAEliminar(insumo);
  };

  const confirmarEliminacion = async () => {
    if (!insumoAEliminar) {
      return;
    }

    try {
      setError("");

      await deleteInsumo(insumoAEliminar.id);

      setInsumos((insumosActuales) =>
        insumosActuales.filter(
          (insumo) =>
            insumo.id !== insumoAEliminar.id
        )
      );

      setInsumoAEliminar(null);

      setMensajeExito(
        "Insumo eliminado correctamente."
      );

      setTimeout(() => {
        setMensajeExito("");
      }, 3000);
    } catch (error) {
      setError(error.message);
    }
  };

  const cancelarEliminacion = () => {
    setInsumoAEliminar(null);
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

      {mensajeExito && (
        <div className="insumos-exito">
          {mensajeExito}
        </div>
      )}

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

      {insumoAEliminar && (
        <Confirmacion
          mensaje={`¿Estás seguro de que deseas eliminar el insumo "${insumoAEliminar.nombre}"? Esta acción no se puede deshacer.`}
          onConfirmar={confirmarEliminacion}
          onCancelar={cancelarEliminacion}
        />
      )}
    </main>
  );
}

export default Insumos;