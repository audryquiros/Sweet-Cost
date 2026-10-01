import Icon from "../../common/Icon/Icon";
import EmptyState from "../../common/EmptyState/EmptyState";
import "./EmpleadoList.css";
import { formatearTelefono } from "../../../utils/formatearTelefono";

const rolNombre = { empleado: "Empleado", administrador: "Administrador" };
const estadoNombre = { activo: "Activo", inactivo: "Inactivo" };

function EmpleadoList({ empleados, vista, onVer, onEditar, onEliminar }) {
  if (!empleados.length) {
    return (
      <EmptyState
        illustration="empleados"
        title="No hay empleados registrados"
        description="Agrega empleados para comenzar a administrar el equipo de tu negocio."
      />
    );
  }

  if (vista === "cards") {
    return (
      <div className="empleados-grid">
        {empleados.map((empleado) => (
          <article className="empleado-card" key={empleado.id}>
            <div className="empleado-card-top">
              <div className="empleado-avatar"><img src="/illustrations/perfil.png" alt="" /></div>
              <span className={`empleado-status empleado-status--${empleado.estado}`}>{estadoNombre[empleado.estado] || empleado.estado}</span>
            </div>
            <h3>{empleado.nombre}</h3>
            <p className="empleado-rol">{rolNombre[empleado.rol] || empleado.rol}</p>
            <div className="empleado-card-info">
              <div><img src="/illustrations/recibo.png" alt="" /><span>{empleado.correo}</span></div>
              {empleado.telefono && <div><img src="/illustrations/telefono.png" alt="" /><span>{formatearTelefono(empleado.telefono)}</span></div>}
            </div>
            <div className="empleado-card-actions">
              <button type="button" onClick={() => onVer(empleado)}><Icon type="eye" size={18} /><span>Ver</span></button>
              <button type="button" className="sc-action-edit" onClick={() => onEditar(empleado)}><Icon type="edit" size={18} /><span>Editar</span></button>
              <button type="button" className="empleado-action-danger sc-action-delete" onClick={() => onEliminar(empleado)}><Icon type="trash" size={18} /><span>Eliminar</span></button>
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="empleados-lista-vista">
      <div className="empleados-lista-header">
        <div>Empleado</div><div>Contacto</div><div>Rol</div><div>Estado</div><div>Acciones</div>
      </div>
      {empleados.map((empleado) => (
        <article className="empleado-lista-item" key={empleado.id}>
          <div className="empleado-lista-persona">
            <div className="empleado-avatar empleado-avatar--small"><img src="/illustrations/perfil.png" alt="" /></div>
            <div><strong>{empleado.nombre}</strong><span>ID #{empleado.id}</span></div>
          </div>
          <div className="empleado-lista-contacto"><span>{empleado.correo}</span>{empleado.telefono && <span>{formatearTelefono(empleado.telefono)}</span>}</div>
          <div className="empleado-lista-dato empleado-lista-rol">{rolNombre[empleado.rol] || empleado.rol}</div>
          <div className="empleado-lista-estado"><span className={`empleado-status empleado-status--${empleado.estado}`}>{estadoNombre[empleado.estado] || empleado.estado}</span></div>
          <div className="empleado-lista-actions">
            <button type="button" onClick={() => onVer(empleado)} aria-label={`Ver ${empleado.nombre}`}><Icon type="eye" size={18} /></button>
            <button type="button" onClick={() => onEditar(empleado)} aria-label={`Editar ${empleado.nombre}`}><Icon type="edit" size={18} /></button>
            <button type="button" className="empleado-action-danger sc-action-delete" onClick={() => onEliminar(empleado)} aria-label={`Eliminar ${empleado.nombre}`}><Icon type="trash" size={18} /></button>
          </div>
        </article>
      ))}
    </div>
  );
}

export default EmpleadoList;
