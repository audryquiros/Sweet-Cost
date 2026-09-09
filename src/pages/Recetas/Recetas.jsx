import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getRecetas,
  deleteReceta,
} from "../../services/recetaServices";

import { getProductos } from "../../services/productoServices";

import RecetasForm from "../../components/Recetas/RecetasForm/RecetasForm";
import RecetaList from "../../components/Recetas/RecetaList/RecetaList";
import ConversorMedidas from "../../components/ConversorMedidas/ConversorMedidas";

import "./Recetas.css";

function Recetas() {
  const [recetas, setRecetas] = useState([]);
  const [productos, setProductos] = useState([]);

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [recetaSeleccionada, setRecetaSeleccionada] =
    useState(null);

  const [ingredienteSeleccionado, setIngredienteSeleccionado] =
    useState(null);

  const [productoSeleccionadoId, setProductoSeleccionadoId] =
    useState("");

  const [resultadoConversor, setResultadoConversor] =
    useState(null);

  const [mensajeExito, setMensajeExito] =
    useState("");

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  const recetasListaRef = useRef(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setError("");
      setCargando(true);

      const [recetasData, productosData] =
        await Promise.all([
          getRecetas(),
          getProductos(),
        ]);

      setRecetas(recetasData);
      setProductos(productosData);
    } catch (error) {
      setError(error.message);
    } finally {
      setCargando(false);
    }
  };

  const handleMostrarFormulario = () => {
    setRecetaSeleccionada(null);

    setIngredienteSeleccionado(null);

    setProductoSeleccionadoId("");

    setResultadoConversor(null);

    setMensajeExito("");

    setMostrarFormulario(true);
  };

  const handleCancelar = () => {
    setRecetaSeleccionada(null);

    setIngredienteSeleccionado(null);

    setProductoSeleccionadoId("");

    setResultadoConversor(null);

    setMostrarFormulario(false);
  };

  const handleRecetaCreada = (receta) => {
    setRecetas((recetasActuales) => [
      ...recetasActuales,
      receta,
    ]);

    setIngredienteSeleccionado(null);

    setProductoSeleccionadoId("");

    setResultadoConversor(null);

    setMensajeExito(
      "Receta agregada correctamente."
    );

    setMostrarFormulario(false);

    setTimeout(() => {
      recetasListaRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);

    setTimeout(() => {
      setMensajeExito("");
    }, 3000);
  };

  const handleEditar = (receta) => {
    setRecetaSeleccionada(receta);

    setIngredienteSeleccionado(null);

    setProductoSeleccionadoId("");

    setResultadoConversor(null);

    setMensajeExito("");

    setMostrarFormulario(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleRecetaActualizada = (
    recetaActualizada
  ) => {
    setRecetas((recetasActuales) =>
      recetasActuales.map((receta) =>
        receta.id === recetaActualizada.id
          ? recetaActualizada
          : receta
      )
    );

    setRecetaSeleccionada(null);

    setIngredienteSeleccionado(null);

    setProductoSeleccionadoId("");

    setResultadoConversor(null);

    setMensajeExito(
      "Receta actualizada correctamente."
    );

    setMostrarFormulario(false);

    setTimeout(() => {
      recetasListaRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);

    setTimeout(() => {
      setMensajeExito("");
    }, 3000);
  };

  const handleEliminar = async (id) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar esta receta?"
    );

    if (!confirmar) {
      return;
    }

    try {
      setError("");

      await deleteReceta(id);

      setRecetas((recetasActuales) =>
        recetasActuales.filter(
          (receta) => receta.id !== id
        )
      );
    } catch (error) {
      setError(error.message);
    }
  };

  /*
   * Esta función se mantiene estable entre
   * renderizados gracias a useCallback.
   */
  const handleSeleccionarIngrediente =
    useCallback(
      (indice, productoId) => {
        setIngredienteSeleccionado(
          indice
        );

        setProductoSeleccionadoId(
          productoId || ""
        );

        setResultadoConversor(null);
      },
      []
    );

  const obtenerUnidadBaseProducto = (
    productoId
  ) => {
    const producto = productos.find(
      (producto) =>
        String(producto.id) ===
        String(productoId)
    );

    if (!producto) {
      return "";
    }

    if (producto.unidad === "kg") {
      return "g";
    }

    if (producto.unidad === "l") {
      return "ml";
    }

    return producto.unidad;
  };

  const handleUsarResultadoConversor = (
    valor,
    unidad
  ) => {
    if (
      ingredienteSeleccionado === null
    ) {
      return;
    }

    setResultadoConversor({
      ingredienteIndex:
        ingredienteSeleccionado,

      valor,

      unidad,
    });
  };

  if (cargando) {
    return (
      <main className="recetas-page">
        <div className="recetas-cargando">
          Cargando recetas...
        </div>
      </main>
    );
  }

  return (
    <main className="recetas-page">
      <header className="recetas-header">
        <div>
          <h1>Recetas</h1>

          <p>
            Administra tus recetas y conoce cuánto
            cuesta producir cada producto.
          </p>
        </div>

        {!mostrarFormulario && (
          <button
            type="button"
            className="btn-agregar-receta"
            onClick={handleMostrarFormulario}
          >
            Agregar receta
          </button>
        )}
      </header>

      {error && (
        <div className="recetas-error">
          {error}
        </div>
      )}

      {productos.length === 0 && (
        <div className="recetas-aviso">
          <strong>
            No hay productos registrados.
          </strong>

          <p>
            Primero registra los ingredientes,
            toppings y salsas que utilizarás en
            tus recetas.
          </p>
        </div>
      )}

      {mostrarFormulario && (
        <div className="recetas-form-layout">
          <RecetasForm
            receta={recetaSeleccionada}
            resultadoConversor={
              resultadoConversor
            }
            onRecetaCreada={
              handleRecetaCreada
            }
            onRecetaActualizada={
              handleRecetaActualizada
            }
            onCancelar={handleCancelar}
            onSeleccionarIngrediente={
              handleSeleccionarIngrediente
            }
          />

          <div className="recetas-conversor">
            <ConversorMedidas
              productoIdInicial={
                productoSeleccionadoId
              }
              unidadDestinoBase={
                obtenerUnidadBaseProducto(
                  productoSeleccionadoId
                )
              }
              onUsarResultado={
                ingredienteSeleccionado !==
                null
                  ? handleUsarResultadoConversor
                  : null
              }
            />
          </div>
        </div>
      )}

      <section
        className="recetas-lista"
        ref={recetasListaRef}
      >
        {mensajeExito && (
          <div className="recetas-exito">
            {mensajeExito}
          </div>
        )}

        <div className="recetas-lista-header">
          <div>
            <h2>
              Recetas registradas
            </h2>

            <p>
              {recetas.length}{" "}
              {recetas.length === 1
                ? "receta registrada"
                : "recetas registradas"}
            </p>
          </div>
        </div>

        <RecetaList
          recetas={recetas}
          productos={productos}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
        />
      </section>
    </main>
  );
}

export default Recetas;