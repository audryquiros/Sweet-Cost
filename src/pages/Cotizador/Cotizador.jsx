import { useEffect, useState } from "react";

import {
  getCotizaciones,
  createCotizacion,
  deleteCotizacion,
} from "../../services/cotizadorServices";

import { getRecetas } from "../../services/recetaServices";
import { getProductos } from "../../services/productoServices";
import { getInsumos } from "../../services/insumoServices";

import CotizadorForm from "../../components/Cotizador/CotizadorForm/CotizadorForm";
import CotizadorList from "../../components/Cotizador/CotizadorList/CotizadorList";
import Confirmacion from "../../components/Confirmacion/Confirmacion";

import "./Cotizador.css";

function Cotizador() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [recetas, setRecetas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [insumos, setInsumos] = useState([]);

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [cotizacionAEliminar, setCotizacionAEliminar] =
    useState(null);

  const [mensajeExito, setMensajeExito] =
    useState("");

  const [error, setError] = useState("");

  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError("");

      const [
        cotizacionesData,
        recetasData,
        productosData,
        insumosData,
      ] = await Promise.all([
        getCotizaciones(),
        getRecetas(),
        getProductos(),
        getInsumos(),
      ]);

      setCotizaciones(cotizacionesData);
      setRecetas(recetasData);
      setProductos(productosData);
      setInsumos(insumosData);
    } catch (error) {
      setError(error.message);
    } finally {
      setCargando(false);
    }
  };

  const handleMostrarFormulario = () => {
    setMensajeExito("");
    setError("");
    setMostrarFormulario(true);
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
  };

  const handleCotizacionCreada = (
    cotizacion
  ) => {
    setCotizaciones((cotizacionesActuales) => [
      ...cotizacionesActuales,
      cotizacion,
    ]);

    setMostrarFormulario(false);

    setMensajeExito(
      "Cotización guardada correctamente."
    );

    setTimeout(() => {
      setMensajeExito("");
    }, 3000);
  };

  const handleEliminar = (cotizacion) => {
    setCotizacionAEliminar(cotizacion);
  };

  const confirmarEliminacion = async () => {
    if (!cotizacionAEliminar) {
      return;
    }

    try {
      setError("");

      await deleteCotizacion(
        cotizacionAEliminar.id
      );

      setCotizaciones(
        (cotizacionesActuales) =>
          cotizacionesActuales.filter(
            (cotizacion) =>
              cotizacion.id !==
              cotizacionAEliminar.id
          )
      );

      setCotizacionAEliminar(null);

      setMensajeExito(
        "Cotización eliminada correctamente."
      );

      setTimeout(() => {
        setMensajeExito("");
      }, 3000);
    } catch (error) {
      setError(error.message);
    }
  };

  const cancelarEliminacion = () => {
    setCotizacionAEliminar(null);
  };

  if (cargando) {
    return (
      <main className="cotizador-page">
        <div className="cotizador-cargando">
          Cargando cotizador...
        </div>
      </main>
    );
  }

  return (
    <main className="cotizador-page">
      <header className="cotizador-header">
        <div>
          <h1>Cotizador</h1>

          <p>
            Configura una venta y calcula el costo y
            precio sugerido de tus productos.
          </p>
        </div>

        {!mostrarFormulario && (
          <button
            type="button"
            className="btn-nueva-cotizacion"
            onClick={handleMostrarFormulario}
          >
            Nueva cotización
          </button>
        )}
      </header>

      {mensajeExito && (
        <div className="cotizador-exito">
          {mensajeExito}
        </div>
      )}

      {error && (
        <div className="cotizador-error">
          {error}
        </div>
      )}

      {mostrarFormulario && (
        <CotizadorForm
          recetas={recetas}
          productos={productos}
          insumos={insumos}
          onCotizacionCreada={
            handleCotizacionCreada
          }
          onCancelar={handleCancelar}
        />
      )}

      <section className="cotizador-lista">
        <div className="cotizador-lista-header">
          <div>
            <h2>
              Cotizaciones registradas
            </h2>

            <p>
              {cotizaciones.length}{" "}
              {cotizaciones.length === 1
                ? "cotización registrada"
                : "cotizaciones registradas"}
            </p>
          </div>
        </div>

        <CotizadorList
          cotizaciones={cotizaciones}
          onEliminar={handleEliminar}
        />
      </section>

      {cotizacionAEliminar && (
        <Confirmacion
          mensaje={`¿Estás seguro de que deseas eliminar la cotización "${cotizacionAEliminar.nombre}"? Esta acción no se puede deshacer.`}
          onConfirmar={confirmarEliminacion}
          onCancelar={cancelarEliminacion}
        />
      )}
    </main>
  );
}

export default Cotizador;