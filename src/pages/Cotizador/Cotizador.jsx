import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getCotizaciones,
  deleteCotizacion,
} from "../../services/cotizadorServices";

import { getRecetas } from "../../services/recetaServices";
import { getProductos } from "../../services/productoServices";
import { getInsumos } from "../../services/insumoServices";

import ConvertirPedidoModal from "../../components/Pedidos/ConvertirPedidoModal/ConvertirPedidoModal";

import CotizadorForm from "../../components/Cotizador/CotizadorForm/CotizadorForm";
import CotizadorList from "../../components/Cotizador/CotizadorList/CotizadorList";
import ViewToggle from "../../components/common/ViewToggle/ViewToggle";
import Confirmacion from "../../components/Confirmacion/Confirmacion";

import "./Cotizador.css";

function Cotizador() {
  const navigate = useNavigate();
  const { id: cotizacionId } = useParams();
  const [cotizaciones, setCotizaciones] =
    useState([]);

  const [recetas, setRecetas] =
    useState([]);

  const [productos, setProductos] =
    useState([]);

  const [insumos, setInsumos] =
    useState([]);

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [
    cotizacionAEliminar,
    setCotizacionAEliminar,
  ] = useState(null);

  const [mensajeExito, setMensajeExito] =
    useState(null);

  const [error, setError] =
    useState("");

  const [cargando, setCargando] =
    useState(true);

  const [vista, setVista] = useState(() => localStorage.getItem("sweetcost-view-cotizaciones") || "cards");

  const [cotizacionParaPedido, setCotizacionParaPedido] =
    useState(null);

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

      setCotizaciones(
        cotizacionesData
      );

      setRecetas(
        recetasData
      );

      setProductos(
        productosData
      );

      setInsumos(
        insumosData
      );
    } catch (error) {
      setError(
        error.message ||
          "No se pudieron cargar los datos."
      );
    } finally {
      setCargando(false);
    }
  };

  const handleMostrarFormulario = () => {
    setMensajeExito(null);
    setError("");
    setMostrarFormulario(true);
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
  };

  const handleCotizacionCreada = (
    cotizacion
  ) => {
    setCotizaciones(
      (cotizacionesActuales) => [
        ...cotizacionesActuales,
        cotizacion,
      ]
    );

    setMostrarFormulario(false);

    setMensajeExito({
      texto: "Cotización guardada correctamente.",
      pedidoId: null,
    });

    setTimeout(() => {
      setMensajeExito(null);
    }, 3000);
  };


  const handleAbrirConversion = (cotizacion) => {
    setError("");
    setMensajeExito(null);
    setCotizacionParaPedido(cotizacion);
  };

  const handlePedidoCreado = (pedido, cotizacionActualizada) => {
    setCotizaciones((actuales) =>
      actuales.map((item) =>
        item.id === cotizacionActualizada.id
          ? cotizacionActualizada
          : item
      )
    );

    setCotizacionParaPedido(null);
    setMensajeExito({
      texto: `Pedido #${pedido.id} creado correctamente desde la cotización.`,
      pedidoId: pedido.id,
    });

    setTimeout(() => {
      setMensajeExito(null);
    }, 7000);
  };

  const handleEliminar = (
    cotizacion
  ) => {
    setCotizacionAEliminar(
      cotizacion
    );
  };

  const confirmarEliminacion =
    async () => {
      if (
        !cotizacionAEliminar
      ) {
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

        setCotizacionAEliminar(
          null
        );

        setMensajeExito({
          texto: "Cotización eliminada correctamente.",
          pedidoId: null,
        });

        setTimeout(() => {
          setMensajeExito(null);
        }, 3000);
      } catch (error) {
        setError(
          error.message ||
            "No se pudo eliminar la cotización."
        );
      }
    };

  const cancelarEliminacion = () => {
    setCotizacionAEliminar(
      null
    );
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
      {/* ENCABEZADO */}

      <header className="cotizador-header">
        <div>
          <h1>
            Cotizaciones
          </h1>

          <p>
            Configura una venta y calcula
            el costo y precio sugerido de
            tus productos.
          </p>
        </div>

        {!mostrarFormulario && (
          <button
            type="button"
            className="btn-nueva-cotizacion"
            onClick={handleMostrarFormulario}
          >
            <img
              src="/illustrations/agregar.png"
              alt=""
              aria-hidden="true"
              className="btn-nueva-cotizacion-icon"
            />
            <span>Nueva cotización</span>
          </button>
        )}
      </header>

      {/* MENSAJES */}

      {mensajeExito && (
        <div className="cotizador-exito" role="status">
          <span>{mensajeExito.texto}</span>
          {mensajeExito.pedidoId && (
            <button
              type="button"
              className="cotizador-exito-ver-pedido"
              onClick={() => navigate(`/pedidos/${mensajeExito.pedidoId}`)}
            >
              <img src="/illustrations/pedidos-portapapeles.png" alt="" aria-hidden="true" />
              <span>Ver pedido</span>
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="cotizador-error">
          {error}
        </div>
      )}

      {/* FORMULARIO */}

      {mostrarFormulario && (
        <CotizadorForm
          recetas={recetas}
          productos={productos}
          insumos={insumos}
          onCotizacionCreada={
            handleCotizacionCreada
          }
          onCancelar={
            handleCancelar
          }
        />
      )}

      {/* HISTORIAL */}

      <section className="cotizador-lista">
        <div className="cotizador-lista-header">
          <div>
            <p>
            {cotizaciones.length}{" "}
            {cotizaciones.length === 1
              ? "cotización realizada"
              : "cotizaciones realizadas"}
            </p>
          </div>

          <ViewToggle
            value={vista}
            onChange={(nuevaVista) => {
              setVista(nuevaVista);
              localStorage.setItem("sweetcost-view-cotizaciones", nuevaVista);
            }}
          />
        </div>

        <CotizadorList
          cotizaciones={
            cotizaciones
          }
          insumos={insumos}
          productos={productos}
          onEliminar={
            handleEliminar
          }
          onConvertirPedido={
            handleAbrirConversion
          }
          vista={vista}
          cotizacionIdParaAbrir={cotizacionId}
        />
      </section>

      {/* CONFIRMACIÓN DE ELIMINACIÓN */}

      {cotizacionAEliminar && (
        <Confirmacion
          mensaje={`¿Estás seguro de que deseas eliminar la cotización "${cotizacionAEliminar.nombre}"? Esta acción no se puede deshacer.`}
          onConfirmar={
            confirmarEliminacion
          }
          onCancelar={
            cancelarEliminacion
          }
        />
      )}

      {cotizacionParaPedido && (
        <ConvertirPedidoModal
          cotizacion={cotizacionParaPedido}
          onCreado={handlePedidoCreado}
          onCancelar={() => setCotizacionParaPedido(null)}
        />
      )}
    </main>
  );
}

export default Cotizador;