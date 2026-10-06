import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ProductoList from "../../components/Productos/ProductoList/ProductoList";
import ViewToggle from "../../components/common/ViewToggle/ViewToggle";
import FilterSelect from "../../components/common/FilterSelect";

import ProductosForm from "../../components/Productos/ProductosForm/ProductosForm";

import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
  getRecetasQueUsanProducto,
} from "../../services/productoServices";

import Icon from "../../components/common/Icon/Icon";
import Confirmacion from "../../components/Confirmacion/Confirmacion";

import "./Productos.css";

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

  const [productoAEliminar, setProductoAEliminar] =
    useState(null);

  const [recetasRelacionadas, setRecetasRelacionadas] =
    useState([]);

  const navigate = useNavigate();

  const [filtroTipo, setFiltroTipo] =
    useState("todos");

  const [vista, setVista] = useState(() => localStorage.getItem("sweetcost-view-productos") || "lista");

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  const [mensajeExito, setMensajeExito] =
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

  const manejarEliminar = async (producto) => {
    setError("");
    try {
      const recetas = await getRecetasQueUsanProducto(producto.id);
      setRecetasRelacionadas(recetas);
      setProductoAEliminar(producto);
    } catch (error) {
      console.error(error);
      setError("No se pudo comprobar si el producto está siendo utilizado.");
    }
  };

  const cancelarEliminacion = () => {
    setProductoAEliminar(null);
    setRecetasRelacionadas([]);
  };

  const irARecetas = () => {
    cancelarEliminacion();
    navigate("/recetas");
  };

  const confirmarEliminacion = async () => {
    if (!productoAEliminar) {
      return;
    }

    try {
      setError("");

      await deleteProducto(productoAEliminar.id);

      setProductos((actuales) =>
        actuales.filter(
          (producto) =>
            String(producto.id) !==
            String(productoAEliminar.id)
        )
      );

      setProductoAEliminar(null);
      setRecetasRelacionadas([]);
      setMensajeExito("Producto eliminado correctamente.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => setMensajeExito(""), 3000);
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

      return (
        coincideTipo
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
            <Icon type="plus" size={20} />
            <span>Nuevo producto</span>
          </button>
        )}
      </header>

      {/* =================================================
          ERROR
          ================================================= */}

      {mensajeExito && (
        <div className="productos-exito" role="status">
          {mensajeExito}
        </div>
      )}

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



      {productoAEliminar && (
        <Confirmacion
          titulo={recetasRelacionadas.length ? "No se puede eliminar este producto" : "¿Eliminar producto?"}
          mensaje={
            recetasRelacionadas.length
              ? `"${productoAEliminar.nombre}" está siendo utilizado en ${recetasRelacionadas.length === 1 ? "una receta" : `${recetasRelacionadas.length} recetas`}. Elimínalo de ${recetasRelacionadas.length === 1 ? "esa receta" : "esas recetas"} antes de eliminarlo.${recetasRelacionadas.length <= 3 ? ` ${recetasRelacionadas.map((receta) => receta.nombre).join(", ")}.` : ""}`
              : `¿Deseas eliminar "${productoAEliminar.nombre}"? Esta acción no se puede deshacer.`
          }
          onConfirmar={recetasRelacionadas.length ? irARecetas : confirmarEliminacion}
          onCancelar={cancelarEliminacion}
          textoConfirmar={recetasRelacionadas.length ? "Ir a recetas" : "Eliminar"}
        />
      )}
    </main>
  );
}

export default Productos;