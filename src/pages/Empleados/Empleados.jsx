import { useEffect, useMemo, useState } from "react";
import EmpleadoForm from "../../components/Empleados/EmpleadoForm/EmpleadoForm";
import EmpleadoList from "../../components/Empleados/EmpleadoList/EmpleadoList";
import EmpleadoDetalle from "../../components/Empleados/EmpleadoDetalle/EmpleadoDetalle";
import ViewToggle from "../../components/common/ViewToggle/ViewToggle";
import FilterSelect from "../../components/common/FilterSelect";
import Icon from "../../components/common/Icon/Icon";
import Confirmacion from "../../components/Confirmacion/Confirmacion";
import { deleteEmpleado, getEmpleados } from "../../services/empleadoServices";
import "./Empleados.css";

const ROLES = [
  { valor: "todos", nombre: "Todos los roles" },
  { valor: "administrador", nombre: "Administrador" },
  { valor: "empleado", nombre: "Empleado" },
];

const ESTADOS = [
  { valor: "todos", nombre: "Todos los estados" },
  { valor: "activo", nombre: "Activos" },
  { valor: "inactivo", nombre: "Inactivos" },
];

function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [vista, setVista] = useState(() => localStorage.getItem("sweetcost-view-empleados") || "cards");
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [empleadoDetalle, setEmpleadoDetalle] = useState(null);
  const [empleadoAEliminar, setEmpleadoAEliminar] = useState(null);
  const [mensajeExito, setMensajeExito] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { cargarEmpleados(); }, []);

  const cargarEmpleados = async () => {
    try { setError(""); setEmpleados(await getEmpleados()); }
    catch (err) { setError(err.message); }
  };

  const mostrarMensaje = (mensaje) => {
    setMensajeExito(mensaje);
    window.clearTimeout(window.__sweetCostEmpleadoMessage);
    window.__sweetCostEmpleadoMessage = window.setTimeout(() => setMensajeExito(""), 3000);
  };

  const empleadosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return empleados.filter((empleado) => {
      const coincideTexto = !texto || [empleado.nombre, empleado.correo, empleado.telefono].some((campo) => String(campo || "").toLowerCase().includes(texto));
      const coincideRol = filtroRol === "todos" || empleado.rol === filtroRol;
      const coincideEstado = filtroEstado === "todos" || empleado.estado === filtroEstado;
      return coincideTexto && coincideRol && coincideEstado;
    });
  }, [empleados, busqueda, filtroRol, filtroEstado]);

  const abrirAgregar = () => { setEmpleadoSeleccionado(null); setMostrarFormulario(true); };
  const abrirEditar = (empleado) => { setEmpleadoSeleccionado(empleado); setMostrarFormulario(true); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const cerrarFormulario = () => { setEmpleadoSeleccionado(null); setMostrarFormulario(false); };

  const empleadoCreado = (empleado) => { setEmpleados((actuales) => [...actuales, empleado]); cerrarFormulario(); mostrarMensaje("Empleado agregado correctamente."); };
  const empleadoActualizado = (empleado) => { setEmpleados((actuales) => actuales.map((item) => item.id === empleado.id ? empleado : item)); cerrarFormulario(); mostrarMensaje("Empleado actualizado correctamente."); };

  const confirmarEliminacion = async () => {
    if (!empleadoAEliminar) return;
    try {
      await deleteEmpleado(empleadoAEliminar.id);
      setEmpleados((actuales) => actuales.filter((item) => item.id !== empleadoAEliminar.id));
      setEmpleadoAEliminar(null);
      mostrarMensaje("Empleado eliminado correctamente.");
    } catch (err) { setError(err.message); }
  };

  return (
    <main className="empleados-page">
      <header className="empleados-header">
        <div>
          <h1>Empleados</h1>
          <p>Administra las personas que forman parte de tu negocio y sus roles.</p>
        </div>
        {!mostrarFormulario && (
          <button type="button" className="btn-agregar-empleado" onClick={abrirAgregar}>
            <Icon type="plus" size={20} />
            <span>Agregar empleado</span>
          </button>
        )}
      </header>

      {mensajeExito && <div className="empleados-exito">{mensajeExito}</div>}
      {error && <div className="empleados-error">{error}</div>}

      {mostrarFormulario && (
        <EmpleadoForm empleado={empleadoSeleccionado} onCreado={empleadoCreado} onActualizado={empleadoActualizado} onCancelar={cerrarFormulario} />
      )}

      {!mostrarFormulario && (
      <section className="empleados-lista">
        <div className="empleados-lista-top">
          <div>
            <h2>Equipo del negocio</h2>
            <p>{empleadosFiltrados.length} {empleadosFiltrados.length === 1 ? "empleado visible" : "empleados visibles"}</p>
          </div>
          {!mostrarFormulario && <ViewToggle value={vista} onChange={(value) => { setVista(value); localStorage.setItem("sweetcost-view-empleados", value); }} />}
        </div>

        {!mostrarFormulario && (
          <div className="empleados-controles">
            <div className="empleados-busqueda">
              <img src="/illustrations/buscar.png" alt="" aria-hidden="true" className="search-bar-icon" />
              <input type="search" value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Buscar empleado..." aria-label="Buscar empleado" />
            </div>
            <FilterSelect id="filtro-rol-empleados" value={filtroRol} options={ROLES} onChange={setFiltroRol} portalMenu />
            <FilterSelect id="filtro-estado-empleados" value={filtroEstado} options={ESTADOS} onChange={setFiltroEstado} portalMenu />
          </div>
        )}

        {!mostrarFormulario && <EmpleadoList empleados={empleadosFiltrados} vista={vista} onVer={setEmpleadoDetalle} onEditar={abrirEditar} onEliminar={setEmpleadoAEliminar} />}
      </section>
      )}

      {empleadoDetalle && <EmpleadoDetalle empleado={empleadoDetalle} onCerrar={() => setEmpleadoDetalle(null)} />}
      {empleadoAEliminar && (
        <Confirmacion
          titulo="¿Eliminar empleado?"
          mensaje={`¿Estás seguro de que deseas eliminar a "${empleadoAEliminar.nombre}"? Esta acción no se puede deshacer.`}
          onConfirmar={confirmarEliminacion}
          onCancelar={() => setEmpleadoAEliminar(null)}
        />
      )}
    </main>
  );
}

export default Empleados;
