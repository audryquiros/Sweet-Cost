import { useEffect, useState } from "react";

import {
  getProductos,
  deleteProducto,
} from "../../services/productoServices";

import ProductosForm from "../../components/Productos/ProductosForm/ProductosForm";
import ProductoList from "../../components/Productos/ProductoList/ProductoList";
import Confirmacion from "../../components/Confirmacion/Confirmacion";

import "./Productos.css";

function Productos() {
  const [productos, setProductos] = useState([]);

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [productoSeleccionado, setProductoSeleccionado] =
    useState(null);

  const [productoAEliminar, setProductoAEliminar] =
    useState(null);

  const [mensajeExito, setMensajeExito] =
    useState("");

  const [error, setError] = useState("");

  const [filtroTipo, setFiltroTipo] =
    useState("todos");

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setError("");

      const data = await getProductos();

      setProductos(data);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleMostrarFormulario = () => {
    setProductoSeleccionado(null);
    setMostrarFormulario(true);
  };

  const handleCancelar = () => {
    setProductoSeleccionado(null);
    setMostrarFormulario(false);
  };

  const handleProductoCreado = (producto) => {
    setProductos((productosActuales) => [
      ...productosActuales,
      producto,
    ]);

    setMensajeExito(
      "Producto agregado correctamente."
    );

    setMostrarFormulario(false);

    setTimeout(() => {
      setMensajeExito("");
    }, 3000);
  };

  const handleEditar = (producto) => {
    setProductoSeleccionado(producto);
    setMostrarFormulario(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleProductoActualizado = (
    productoActualizado
  ) => {
    setProductos((productosActuales) =>
      productosActuales.map((producto) =>
        producto.id === productoActualizado.id
          ? productoActualizado
          : producto
      )
    );

    setProductoSeleccionado(null);
    setMostrarFormulario(false);

    setMensajeExito(
      "Producto actualizado correctamente."
    );

    setTimeout(() => {
      setMensajeExito("");
    }, 3000);
  };

  const handleEliminar = (producto) => {
    setProductoAEliminar(producto);
  };

  const confirmarEliminacion = async () => {
    if (!productoAEliminar) {
      return;
    }

    try {
      setError("");

      await deleteProducto(
        productoAEliminar.id
      );

      setProductos((productosActuales) =>
        productosActuales.filter(
          (producto) =>
            producto.id !==
            productoAEliminar.id
        )
      );

      setProductoAEliminar(null);

      setMensajeExito(
        "Producto eliminado correctamente."
      );

      setTimeout(() => {
        setMensajeExito("");
      }, 3000);
    } catch (error) {
      setError(error.message);
    }
  };

  const cancelarEliminacion = () => {
    setProductoAEliminar(null);
  };

  /*
   * FILTRAR PRODUCTOS
   */

  const productosFiltrados =
    filtroTipo === "todos"
      ? productos
      : productos.filter(
          (producto) =>
            producto.tipo === filtroTipo
        );

  /*
   * TEXTO DEL CONTADOR
   */

  const obtenerTextoCantidad = () => {
    const cantidad =
      productosFiltrados.length;

    if (filtroTipo === "todos") {
      return cantidad === 1
        ? "1 producto"
        : `${cantidad} productos`;
    }

    if (filtroTipo === "ingrediente") {
      return cantidad === 1
        ? "1 ingrediente"
        : `${cantidad} ingredientes`;
    }

    if (filtroTipo === "topping") {
      return cantidad === 1
        ? "1 topping"
        : `${cantidad} toppings`;
    }

    if (filtroTipo === "salsa") {
      return cantidad === 1
        ? "1 salsa"
        : `${cantidad} salsas`;
    }

    return `${cantidad} productos`;
  };

  return (
    <main className="productos-page">

      {/* ENCABEZADO */}

      <header className="productos-header">
        <div>
          <h1>Productos</h1>

          <p>
            Administra los ingredientes, toppings y
            salsas utilizados en tu negocio.
          </p>
        </div>

        {!mostrarFormulario && (
          <button
            type="button"
            className="btn-agregar-producto"
            onClick={
              handleMostrarFormulario
            }
          >
            Agregar producto
          </button>
        )}
      </header>

      {/* MENSAJE DE ÉXITO */}

      {mensajeExito && (
        <div className="productos-exito">
          {mensajeExito}
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="productos-error">
          {error}
        </div>
      )}

      {/* FORMULARIO */}

      {mostrarFormulario && (
        <ProductosForm
          producto={productoSeleccionado}
          onProductoCreado={
            handleProductoCreado
          }
          onProductoActualizado={
            handleProductoActualizado
          }
          onCancelar={handleCancelar}
        />
      )}

      {/* LISTADO */}

      <section className="productos-lista">

        <div className="productos-lista-header">

          <div>
            <h2>Listado</h2>

            <p>
              Mostrando{" "}
              {obtenerTextoCantidad()}
            </p>
          </div>

          {/* FILTROS */}

          <div className="productos-filtros">

            <button
              type="button"
              className={
                filtroTipo === "todos"
                  ? "filtro-activo"
                  : ""
              }
              onClick={() =>
                setFiltroTipo("todos")
              }
            >
              Todos
            </button>

            <button
              type="button"
              className={
                filtroTipo === "ingrediente"
                  ? "filtro-activo"
                  : ""
              }
              onClick={() =>
                setFiltroTipo(
                  "ingrediente"
                )
              }
            >
              Ingredientes
            </button>

            <button
              type="button"
              className={
                filtroTipo === "topping"
                  ? "filtro-activo"
                  : ""
              }
              onClick={() =>
                setFiltroTipo("topping")
              }
            >
              Toppings
            </button>

            <button
              type="button"
              className={
                filtroTipo === "salsa"
                  ? "filtro-activo"
                  : ""
              }
              onClick={() =>
                setFiltroTipo("salsa")
              }
            >
              Salsas
            </button>

          </div>

        </div>

        <ProductoList
          productos={productosFiltrados}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
        />

      </section>

      {/* CONFIRMACIÓN DE ELIMINACIÓN */}

      {productoAEliminar && (
        <Confirmacion
          mensaje={`¿Estás seguro de que deseas eliminar el producto "${productoAEliminar.nombre}"? Esta acción no se puede deshacer.`}
          onConfirmar={
            confirmarEliminacion
          }
          onCancelar={
            cancelarEliminacion
          }
        />
      )}

    </main>
  );
}

export default Productos;