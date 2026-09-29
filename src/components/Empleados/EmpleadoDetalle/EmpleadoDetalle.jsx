import "./EmpleadoDetalle.css";
import { formatearTelefono } from "../../../utils/formatearTelefono";

const rolNombre = { empleado: "Empleado", administrador: "Administrador" };
const estadoNombre = { activo: "Activo", inactivo: "Inactivo" };

// Nombres de los iconos que se colocarán en /public/illustrations/.
// Puedes reemplazar los nombres aquí si tus archivos tienen otro nombre.
const ICONOS = {
  correo: "/illustrations/correo.png",
  telefono: "/illustrations/telefono.png",
  rolAdministrador: "/illustrations/rol-administrador.png",
  rolEmpleado: "/illustrations/rol-empleado.png",
  estadoActivo: "/illustrations/estado-activo.png",
  estadoInactivo: "/illustrations/estado-inactivo.png",
};

function EmpleadoDetalle({ empleado, onCerrar }) {
  if (!empleado) return null;

  const estado = empleado.estado || "activo";
  const rol = empleado.rol || "empleado";
  const estadoTexto = estadoNombre[estado] || estado;
  const rolTexto = rolNombre[rol] || rol;

  const iconoRol = rol === "administrador" ? ICONOS.rolAdministrador : ICONOS.rolEmpleado;
  const iconoEstado = estado === "activo" ? ICONOS.estadoActivo : ICONOS.estadoInactivo;

  return (
    <div
      className="empleado-detalle-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCerrar();
      }}
    >
      <section
        className="empleado-detalle-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="empleado-detalle-titulo"
      >
        <div className="empleado-detalle-header">
          <div>
            <span>DETALLE DEL EMPLEADO</span>
            <h2 id="empleado-detalle-titulo">{empleado.nombre}</h2>
          </div>
          <div className="empleado-detalle-avatar">
            <img src="/illustrations/perfil.png" alt="" aria-hidden="true" />
          </div>
        </div>

        <div className="empleado-detalle-grid">
          <div className="empleado-detalle-item">
            <div className="empleado-detalle-item-icon" aria-hidden="true">
              <img src={ICONOS.correo} alt="" />
            </div>
            <div className="empleado-detalle-item-content">
              <span>Correo electrónico</span>
              <strong>{empleado.correo || "No registrado"}</strong>
            </div>
          </div>

          <div className="empleado-detalle-item">
            <div className="empleado-detalle-item-icon" aria-hidden="true">
              <img src={ICONOS.telefono} alt="" />
            </div>
            <div className="empleado-detalle-item-content">
              <span>Teléfono</span>
              <strong>
                {empleado.telefono ? formatearTelefono(empleado.telefono) : "No registrado"}
              </strong>
            </div>
          </div>

          <div className="empleado-detalle-item">
            <div className="empleado-detalle-item-icon" aria-hidden="true">
              <img src={iconoRol} alt="" />
            </div>
            <div className="empleado-detalle-item-content">
              <span>Rol</span>
              <strong>{rolTexto || "No registrado"}</strong>
            </div>
          </div>

          <div className={`empleado-detalle-item empleado-detalle-item--estado estado-${estado}`}>
            <div className="empleado-detalle-item-icon" aria-hidden="true">
              <img src={iconoEstado} alt="" />
            </div>
            <div className="empleado-detalle-item-content">
              <span>Estado</span>
              <strong>{estadoTexto}</strong>
            </div>
          </div>
        </div>

        <div className="empleado-detalle-actions">
          <button type="button" onClick={onCerrar}>Cerrar</button>
        </div>
      </section>
    </div>
  );
}

export default EmpleadoDetalle;
