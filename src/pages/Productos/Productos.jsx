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

      await deleteProducto(productoAEliminar.id);

      setProductos((productosActuales) =>
        productosActuales.filter(
          (producto) =>
            producto.id !== productoAEliminar.id
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

  return (
    <main className="productos-page">
      <header className="productos-header">
        <div>
          <h1>Productos</h1>

          <p>
            Administra los ingredientes, toppings y salsas
            utilizados en tu negocio.
          </p>
        </div>

        {!mostrarFormulario && (
          <button
            type="button"
            className="btn-agregar-producto"
            onClick={handleMostrarFormulario}
          >
            Agregar producto
          </button>
        )}
      </header>

      {mensajeExito && (
        <div className="productos-exito">
          {mensajeExito}
        </div>
      )}

      {error && (
        <div className="productos-error">
          {error}
        </div>
      )}

      {mostrarFormulario && (
        <ProductosForm
          producto={productoSeleccionado}
          onProductoCreado={handleProductoCreado}
          onProductoActualizado={
            handleProductoActualizado
          }
          onCancelar={handleCancelar}
        />
      )}

      <section className="productos-lista">
        <div className="productos-lista-header">
          <div>
            <h2>Productos registrados</h2>

            <p>
              {productos.length}{" "}
              {productos.length === 1
                ? "producto registrado"
                : "productos registrados"}
            </p>
          </div>
        </div>

        <ProductoList
          productos={productos}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
        />
      </section>

      {productoAEliminar && (
        <Confirmacion
          mensaje={`¿Estás seguro de que deseas eliminar el producto "${productoAEliminar.nombre}"? Esta acción no se puede deshacer.`}
          onConfirmar={confirmarEliminacion}
          onCancelar={cancelarEliminacion}
        />
      )}
    </main>
  );
}

export default Productos;