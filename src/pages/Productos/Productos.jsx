import { useEffect, useState } from "react";

import ProductoList from "../../components/Productos/ProductoList/ProductoList";
import ViewToggle from "../../components/common/ViewToggle/ViewToggle";
import FilterSelect from "../../components/common/FilterSelect";

import ProductosForm from "../../components/Productos/ProductosForm/ProductosForm";

import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
} from "../../services/productoServices";

import "./Productos.css";

const CATEGORIAS = [
  {
    valor: "todas",
    nombre: "Todas",
  },
  {
    valor: "general",
    nombre: "General",
  },
  {
    valor: "reposteria",
    nombre: "Repostería",
  },
  {
    valor: "comida",
    nombre: "Comida",
  },
  {
    valor: "bebidas",
    nombre: "Bebidas",
  },
];

const TIPOS = [
  {
    valor: "todos",
    nombre: "Todos",
  },
  {
    valor: "ingrediente",
    nombre: "Ingredientes",
  },
  {
    valor: "topping",
    nombre: "Toppings",
  },
  {
    valor: "salsa",
    nombre: "Salsas",
  },
];

function Productos() {
  const [productos, setProductos] = useState([]);

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [productoEditar, setProductoEditar] =
    useState(null);

  const [filtroTipo, setFiltroTipo] =
    useState("todos");

  const [filtroCategoria, setFiltroCategoria] =
    useState("todas");

  const [vista, setVista] = useState(() => localStorage.getItem("sweetcost-view-productos") || "lista");

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
   * =====================================================
   * CARGAR PRODUCTOS
   * =====================================================
   */

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      setError("");

      const datos = await getProductos();

      setProductos(
        Array.isArray(datos)
          ? datos
          : []
      );
    } catch (error) {
      console.error(error);

      setError(
        "No se pudieron cargar los productos."
      );
    } finally {
      setCargando(false);
    }
  };

  /*
   * =====================================================
   * CREAR PRODUCTO
   * =====================================================
   */

  const manejarProductoCreado = async (
    producto
  ) => {
    try {
      const nuevoProducto =
        await createProducto(producto);

      setProductos((actuales) => [
        ...actuales,
        nuevoProducto,
      ]);

      setMostrarFormulario(false);
      setProductoEditar(null);
      setError("");
    } catch (error) {
      console.error(error);

      setError(
        "No se pudo registrar el producto."
      );
    }
  };

  /*
   * =====================================================
   * ACTUALIZAR PRODUCTO
   * =====================================================
   */

  const manejarProductoActualizado = async (
    producto
  ) => {
    try {
      const productoActualizado =
        await updateProducto(
          producto.id,
          producto
        );

      setProductos((actuales) =>
        actuales.map(
          (productoActual) =>
            String(productoActual.id) ===
            String(producto.id)
              ? productoActualizado
              : productoActual
        )
      );

      setProductoEditar(null);
      setMostrarFormulario(false);
      setError("");
    } catch (error) {
      console.error(error);

      setError(
        "No se pudo actualizar el producto."
      );
    }
  };

  /*
   * =====================================================
   * ELIMINAR PRODUCTO
   * =====================================================
   */

  const manejarEliminar = async (id) => {
    const confirmar =
      window.confirm(
        "¿Estás seguro de que deseas eliminar este producto?"
      );

    if (!confirmar) {
      return;
    }

    try {
      setError("");

      await deleteProducto(id);

      setProductos((actuales) =>
        actuales.filter(
          (producto) =>
            String(producto.id) !==
            String(id)
        )
      );
    } catch (error) {
      console.error(error);

      setError(
        "No se pudo eliminar el producto."
      );
    }
  };

  /*
   * =====================================================
   * EDITAR PRODUCTO
   * =====================================================
   */

  const manejarEditar = (producto) => {
    setProductoEditar(producto);

    setMostrarFormulario(true);

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * =====================================================
   * CANCELAR FORMULARIO
   * =====================================================
   */

  const manejarCancelarFormulario = () => {
    setProductoEditar(null);

    setMostrarFormulario(false);

    setError("");
  };

  /*
   * =====================================================
   * FILTRAR PRODUCTOS
   * =====================================================
   */

  const productosFiltrados =
    productos.filter((producto) => {
      const coincideTipo =
        filtroTipo === "todos" ||
        producto.tipo === filtroTipo;

      const coincideCategoria =
        filtroCategoria === "todas" ||
        producto.categoria ===
          filtroCategoria;

      return (
        coincideTipo &&
        coincideCategoria
      );
    });

  return (
    <main className="productos-page">

      {/* =================================================
          ENCABEZADO
          ================================================= */}

      <header className="productos-header">
        <div>
          <h1>Productos</h1>

          <p>
            Administra los ingredientes,
            toppings, salsas y productos
            utilizados en tu negocio.
          </p>
        </div>

        {!mostrarFormulario && (
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setProductoEditar(null);
              setMostrarFormulario(true);
              setError("");
            }}
          >
            Nuevo producto
          </button>
        )}
      </header>

      {/* =================================================
          ERROR
          ================================================= */}

      {error && (
        <div className="productos-error">
          {error}
        </div>
      )}

      {/* =================================================
          FORMULARIO

          Aparece arriba del listado, pero NO
          oculta los productos.
          ================================================= */}

      {mostrarFormulario && (
        <div className="productos-form-contenedor">
          <ProductosForm
            producto={productoEditar}
            onProductoCreado={
              manejarProductoCreado
            }
            onProductoActualizado={
              manejarProductoActualizado
            }
            onCancelar={
              manejarCancelarFormulario
            }
          />
        </div>
      )}

      {/* =================================================
          CONTROLES
          ================================================= */}

      <div className="productos-controles">
        <div className="productos-filtros">
          <FilterSelect
            id="filtroCategoriaProductos"
            label="Categoría"
            value={filtroCategoria}
            options={CATEGORIAS}
            onChange={setFiltroCategoria}
          />

          <FilterSelect
            id="filtroTipoProductos"
            label="Tipo"
            value={filtroTipo}
            options={TIPOS}
            onChange={setFiltroTipo}
          />
        </div>

        <ViewToggle
          value={vista}
          onChange={(nuevaVista) => {
            setVista(nuevaVista);
            localStorage.setItem(
              "sweetcost-view-productos",
              nuevaVista
            );
          }}
        />
      </div>

      <div className="productos-contador">
        <span>
          {productosFiltrados.length}{" "}
          {productosFiltrados.length === 1 ? "producto" : "productos"}
        </span>
      </div>

      {/* =================================================
          LISTADO
          ================================================= */}

      {cargando ? (
        <div className="productos-mensaje">
          Cargando productos...
        </div>
      ) : (
        <ProductoList
          productos={productosFiltrados}
          onEditar={manejarEditar}
          onEliminar={manejarEliminar}
          vista={vista}
        />
      )}

    </main>
  );
}

export default Productos;