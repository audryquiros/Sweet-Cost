import { useEffect, useState } from "react";
import {
  getProductos,
  deleteProducto,
} from "../../services/productoServices";

import ProductosForm from "../../components/Productos/ProductosForm/ProductosForm";
import ProductoList from "../../components/Productos/ProductoList/ProductoList";

import "./Productos.css";

function Productos() {
  const [productos, setProductos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);
  const [productoSeleccionado, setProductoSeleccionado] =
    useState(null);

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

    setMostrarFormulario(false);
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
  };

  const handleEliminar = async (id) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar este producto?"
    );

    if (!confirmar) {
      return;
    }

    try {
      await deleteProducto(id);

      setProductos((productosActuales) =>
        productosActuales.filter(
          (producto) => producto.id !== id
        )
      );
    } catch (error) {
      setError(error.message);
    }
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
    </main>
  );
}

export default Productos;