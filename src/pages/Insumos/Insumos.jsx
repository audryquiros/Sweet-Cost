import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getInsumos,
  deleteInsumo,
  getRelacionesInsumo,
} from "../../services/insumoServices";

import InsumosForm from "../../components/Insumos/InsumosForm/InsumosForm";
import InsumoList from "../../components/Insumos/InsumoList/InsumoList";
import ViewToggle from "../../components/common/ViewToggle/ViewToggle";
import Confirmacion from "../../components/Confirmacion/Confirmacion";

import Icon from "../../components/common/Icon/Icon";

import "./Insumos.css";

function Insumos() {
  const [insumos, setInsumos] = useState([]);

  const [vista, setVista] = useState(() => localStorage.getItem("sweetcost-view-insumos") || "lista");

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [insumoSeleccionado, setInsumoSeleccionado] =
    useState(null);

  const [insumoAEliminar, setInsumoAEliminar] =
    useState(null);

  const [relacionesInsumo, setRelacionesInsumo] =
    useState({ cotizaciones: [], pedidos: [] });

  const navigate = useNavigate();

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

  const handleEliminar = async (insumo) => {
    try {
      setError("");

      const relaciones = await getRelacionesInsumo(insumo.id);

      setRelacionesInsumo(relaciones);
      setInsumoAEliminar(insumo);
    } catch (error) {
      console.error(error);
      setError("No se pudo comprobar si el insumo está siendo utilizado.");
    }
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
      setRelacionesInsumo({ cotizaciones: [], pedidos: [] });

      setMensajeExito(
        "Insumo eliminado correctamente."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        setMensajeExito("");
      }, 3000);
    } catch (error) {
      console.error(error);
      const mensaje = String(error?.message || "");
      if (mensaje.includes("cotizacion_insumos_insumo_id_fkey") || mensaje.includes("pedido_insumos_insumo_id_fkey")) {
        setError("No se puede eliminar el insumo porque todavía está siendo utilizado en una cotización o pedido.");
      } else {
        setError("No se pudo eliminar el insumo.");
      }
    }
  };

  const cancelarEliminacion = () => {
    setInsumoAEliminar(null);
    setRelacionesInsumo({ cotizaciones: [], pedidos: [] });
  };

  const irACotizaciones = () => {
    cancelarEliminacion();
    navigate("/cotizaciones");
  };

  const irAPedidos = () => {
    cancelarEliminacion();
    navigate("/pedidos");
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
            <Icon type="plus" size={20} />
            <span>Agregar insumo</span>
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

          <ViewToggle
            value={vista}
            onChange={(nuevaVista) => {
              setVista(nuevaVista);
              localStorage.setItem("sweetcost-view-insumos", nuevaVista);
            }}
          />
        </div>

        <InsumoList
          insumos={insumos}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
          vista={vista}
        />
      </section>

      {insumoAEliminar && (
        <Confirmacion
          titulo={
            relacionesInsumo.cotizaciones.length || relacionesInsumo.pedidos.length
              ? "No se puede eliminar este insumo"
              : "¿Eliminar insumo?"
          }
          mensaje={
            relacionesInsumo.cotizaciones.length || relacionesInsumo.pedidos.length
              ? `"${insumoAEliminar.nombre}" está siendo utilizado en ${
                  relacionesInsumo.cotizaciones.length && relacionesInsumo.pedidos.length
                    ? "cotizaciones y pedidos"
                    : relacionesInsumo.cotizaciones.length
                      ? "una o más cotizaciones"
                      : "uno o más pedidos"
                }. ${
                  relacionesInsumo.cotizaciones.length && relacionesInsumo.pedidos.length
                    ? "Debes quitarlo de esos registros antes de eliminarlo."
                    : relacionesInsumo.cotizaciones.length
                      ? "Debes quitarlo de las cotizaciones donde se utiliza antes de eliminarlo."
                      : "Debes quitarlo de los pedidos donde se utiliza antes de eliminarlo."
                }`
              : `¿Estás seguro de que deseas eliminar el insumo "${insumoAEliminar.nombre}"? Esta acción no se puede deshacer.`
          }
          onConfirmar={
            relacionesInsumo.cotizaciones.length
              ? irACotizaciones
              : relacionesInsumo.pedidos.length
                ? irAPedidos
                : confirmarEliminacion
          }
          onCancelar={cancelarEliminacion}
          textoConfirmar={
            relacionesInsumo.cotizaciones.length
              ? "Ir a cotizaciones"
              : relacionesInsumo.pedidos.length
                ? "Ir a pedidos"
                : "Eliminar"
          }
          textoSecundario={
            relacionesInsumo.cotizaciones.length && relacionesInsumo.pedidos.length
              ? "Ir a pedidos"
              : ""
          }
          onSecundario={
            relacionesInsumo.cotizaciones.length && relacionesInsumo.pedidos.length
              ? irAPedidos
              : undefined
          }
        />
      )}
    </main>
  );
}

export default Insumos;