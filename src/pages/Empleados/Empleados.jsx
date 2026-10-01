import { useEffect, useMemo, useState } from "react";
import EmpleadoForm from "../../components/Empleados/EmpleadoForm/EmpleadoForm";
import EmpleadoList from "../../components/Empleados/EmpleadoList/EmpleadoList";
import EmpleadoDetalle from "../../components/Empleados/EmpleadoDetalle/EmpleadoDetalle";
import ViewToggle from "../../components/common/ViewToggle/ViewToggle";
import FilterSelect from "../../components/common/FilterSelect";
import Icon from "../../components/common/Icon/Icon";
import Confirmacion from "../../components/Confirmacion/Confirmacion";
import { deleteEmpleado, getEmpleados } from "../../services/empleadoServices";
import { useAuth } from "../../context/authContext";
import { getAsistencias, registrarIngreso, registrarSalida, actualizarHorario } from "../../services/asistenciaServices";
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
  const [asistencias, setAsistencias] = useState([]);
  const [cargandoAsistencia, setCargandoAsistencia] = useState(true);
  const [guardandoAsistencia, setGuardandoAsistencia] = useState(null);
  const [registroEditando, setRegistroEditando] = useState(null);
  const [horaIngresoEdit, setHoraIngresoEdit] = useState("");
  const [horaSalidaEdit, setHoraSalidaEdit] = useState("");
  const [guardandoHorario, setGuardandoHorario] = useState(false);
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === "administrador";

  useEffect(() => { cargarEmpleados(); cargarAsistencias(); }, []);

  const cargarAsistencias = async () => {
    try { setCargandoAsistencia(true); setAsistencias(await getAsistencias()); }
    catch (err) { setError(err.message); }
    finally { setCargandoAsistencia(false); }
  };

  const fechaHoy = () => {
    const ahora = new Date();
    return `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-${String(ahora.getDate()).padStart(2, "0")}`;
  };

  const hora = (value) => value ? new Date(value).toLocaleTimeString("es-CR", { hour: "numeric", minute: "2-digit" }) : "—";

  const horaParaInput = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const isoConHora = (baseValue, timeValue) => {
    if (!timeValue) return null;
    const base = new Date(baseValue || new Date());
    const [hours, minutes] = timeValue.split(":").map(Number);
    base.setHours(hours || 0, minutes || 0, 0, 0);
    return base.toISOString();
  };

  const abrirEditarHorario = (registro) => {
    if (!esAdmin) return;
    setRegistroEditando(registro);
    setHoraIngresoEdit(horaParaInput(registro.ingreso));
    setHoraSalidaEdit(horaParaInput(registro.salida));
  };

  const guardarHorario = async () => {
    if (!registroEditando || !horaIngresoEdit) return;
    try {
      const ingreso = isoConHora(registroEditando.ingreso || registroEditando.fecha, horaIngresoEdit);
      const salida = horaSalidaEdit ? isoConHora(registroEditando.salida || registroEditando.ingreso || registroEditando.fecha, horaSalidaEdit) : null;
      if (salida && new Date(salida) < new Date(ingreso)) {
        setError("La hora de salida no puede ser anterior a la hora de ingreso.");
        return;
      }
      setGuardandoHorario(true);
      const actualizado = await actualizarHorario(registroEditando.id, {
        ingreso,
        salida,
      });
      setAsistencias((actuales) => actuales.map((item) => item.id === actualizado.id ? actualizado : item));
      setRegistroEditando(null);
      mostrarMensaje("Horario actualizado correctamente.");
    } catch (err) { setError(err.message); }
    finally { setGuardandoHorario(false); }
  };

  const registrarEntrada = async (empleado) => {
    try {
      setGuardandoAsistencia(empleado.id);
      const nuevo = await registrarIngreso({ empleadoId: empleado.id, empleadoNombre: empleado.nombre });
      setAsistencias((actuales) => [...actuales, nuevo]);
      mostrarMensaje(`Ingreso registrado para ${empleado.nombre}.`);
      window.dispatchEvent(new CustomEvent("sweetcost-datos-cambio"));
    } catch (err) { setError(err.message); }
    finally { setGuardandoAsistencia(null); }
  };

  const registrarSalidaEmpleado = async (registro) => {
    try {
      setGuardandoAsistencia(registro.empleadoId);
      const actualizado = await registrarSalida(registro.id);
      setAsistencias((actuales) => actuales.map((item) => item.id === actualizado.id ? actualizado : item));
      mostrarMensaje(`Salida registrada para ${registro.empleadoNombre}.`);
    } catch (err) { setError(err.message); }
    finally { setGuardandoAsistencia(null); }
  };

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

      {registroEditando && (
        <div className="asistencia-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setRegistroEditando(null); }}>
          <section className="asistencia-modal" role="dialog" aria-modal="true" aria-labelledby="editar-horario-title">
            <div className="asistencia-modal-header">
              <div><span>CONTROL DE PERSONAL</span><h2 id="editar-horario-title">Editar horario</h2><p>{registroEditando.empleadoNombre} · {registroEditando.fecha}</p></div>
              <button type="button" className="asistencia-modal-close" onClick={() => setRegistroEditando(null)} aria-label="Cerrar"><img src="/illustrations/cerrar.png" alt="" aria-hidden="true" /></button>
            </div>
            <div className="asistencia-modal-fields">
              <label>Hora de ingreso<input type="time" value={horaIngresoEdit} onChange={(event) => setHoraIngresoEdit(event.target.value)} /></label>
              <label>Hora de salida<input type="time" value={horaSalidaEdit} onChange={(event) => setHoraSalidaEdit(event.target.value)} /></label>
            </div>
            <div className="asistencia-modal-actions"><button type="button" className="asistencia-btn" onClick={() => setRegistroEditando(null)}>Cancelar</button><button type="button" className="asistencia-btn asistencia-btn--entry" disabled={guardandoHorario || !horaIngresoEdit} onClick={guardarHorario}>{guardandoHorario ? "Guardando..." : "Guardar horario"}</button></div>
          </section>
        </div>
      )}

      {!mostrarFormulario && (
        <section className="asistencia-panel">
          <div className="asistencia-panel-heading">
            <div>
              <span>CONTROL DE PERSONAL</span>
              <h2>Registro de ingreso</h2>
              <p>Registra la entrada y salida de cada empleado y conserva el historial de asistencia.</p>
            </div>
            <div className="asistencia-fecha">{new Date().toLocaleDateString("es-CR", { weekday: "long", day: "numeric", month: "long" })}</div>
          </div>
          <div className="asistencia-lista">
            {cargandoAsistencia ? <div className="asistencia-empty">Cargando registros...</div> : empleados.filter((empleado) => empleado.estado === "activo").map((empleado) => {
              const registro = asistencias.find((item) => item.empleadoId === empleado.id && item.fecha === fechaHoy());
              return (
                <article className="asistencia-row" key={empleado.id}>
                  <div className="asistencia-persona">
                    <div className="asistencia-avatar"><img src={empleado.foto || "/illustrations/perfil.png"} alt="" /></div>
                    <div><strong>{empleado.nombre}</strong><span>{empleado.rol === "administrador" ? "Administrador" : "Empleado"}</span></div>
                  </div>
                  <div className="asistencia-horas"><span>Ingreso <b>{hora(registro?.ingreso)}</b></span><span>Salida <b>{hora(registro?.salida)}</b></span></div>
                  <div className="asistencia-estado">
                    {!registro && (
                      <div className="asistencia-actions asistencia-actions--single">
                        <button type="button" className="asistencia-btn asistencia-btn--entry" disabled={guardandoAsistencia === empleado.id} onClick={() => registrarEntrada(empleado)}>
                          {guardandoAsistencia === empleado.id ? "Guardando..." : "Registrar ingreso"}
                        </button>
                      </div>
                    )}
                    {registro && !registro.salida && (
                      <div className="asistencia-actions">
                        <button type="button" className="asistencia-btn asistencia-btn--exit" disabled={guardandoAsistencia === empleado.id} onClick={() => registrarSalidaEmpleado(registro)}>
                          {guardandoAsistencia === empleado.id ? "Guardando..." : "Registrar salida"}
                        </button>
                        {esAdmin && (
                          <button type="button" className="asistencia-btn asistencia-btn--edit" onClick={() => abrirEditarHorario(registro)}>
                            Editar horario
                          </button>
                        )}
                      </div>
                    )}
                    {registro?.salida && (
                      <div className="asistencia-actions">
                        <span className="asistencia-completa">Jornada registrada</span>
                        {esAdmin && (
                          <button type="button" className="asistencia-btn asistencia-btn--edit" onClick={() => abrirEditarHorario(registro)}>
                            Editar horario
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
            {!cargandoAsistencia && !empleados.some((empleado) => empleado.estado === "activo") && <div className="asistencia-empty">No hay empleados activos para registrar asistencia.</div>}
          </div>
          {asistencias.length > 0 && (
            <div className="asistencia-historial">
              <div className="asistencia-historial-title"><strong>Últimos registros</strong><span>Los registros se conservan por negocio.</span></div>
              <div className="asistencia-historial-grid">
                {asistencias.slice().sort((a,b) => new Date(b.ingreso) - new Date(a.ingreso)).map((registro) => (
                  <div className="asistencia-historial-item" key={registro.id}>
                    <div className="asistencia-historial-persona"><strong>{registro.empleadoNombre}</strong><span>{registro.fecha}</span></div>
                    <small>{hora(registro.ingreso)} · {hora(registro.salida)}</small>
                    {esAdmin && <button type="button" className="asistencia-historial-edit" onClick={() => abrirEditarHorario(registro)}>Editar horario</button>}
                  </div>
                ))}
              </div>
            </div>
          )}
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
