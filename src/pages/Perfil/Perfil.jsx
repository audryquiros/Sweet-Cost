import { useEffect, useState } from "react";
import { getNegocioActivo } from "../../context/negocioContext";
import { usePerfilActual } from "../../context/perfilContext";
import { formatearTelefono } from "../../utils/formatearTelefono";
import { updateEmpleadoParcial } from "../../services/empleadoServices";
import "./Perfil.css";

const ICONOS = {
  perfil: "/illustrations/perfil.png",
  correo: "/illustrations/correo.png",
  telefono: "/illustrations/telefono.png",
  rol: "/illustrations/rol-administrador.png",
  estado: "/illustrations/estado-activo.png",
  editar: "/illustrations/editar.png",
  negocio: "/illustrations/configuracion.png",
};

function Perfil() {
  const negocio = getNegocioActivo();
  const { perfil, actualizarPerfil } = usePerfilActual();
  const [formulario, setFormulario] = useState(perfil);
  const [guardado, setGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState("");

  useEffect(() => {
    setFormulario(perfil);
  }, [perfil]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormulario((actual) => ({ ...actual, [name]: value }));
    setGuardado(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (guardando) return;

    const cambios = {
      nombre: formulario.nombre.trim(),
      correo: formulario.correo.trim(),
      telefono: formulario.telefono.trim(),
    };

    setGuardando(true);
    setGuardado(false);
    setErrorGuardado("");

    try {
      const empleadoActualizado = await updateEmpleadoParcial("emp-001", cambios);

      actualizarPerfil({
        nombre: empleadoActualizado.nombre,
        correo: empleadoActualizado.correo,
        telefono: empleadoActualizado.telefono,
      });

      setFormulario((actual) => ({
        ...actual,
        nombre: empleadoActualizado.nombre,
        correo: empleadoActualizado.correo,
        telefono: empleadoActualizado.telefono,
      }));
      setGuardado(true);
    } catch (error) {
      console.error("No se pudo guardar el perfil:", error);
      setErrorGuardado("No se pudieron guardar los cambios. Verifica que JSON Server esté ejecutándose.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <main className="perfil-page">
      <header className="perfil-header">
        <div>
          <h1>Mi perfil</h1>
          <p>Administra tu información personal y consulta tu rol dentro del negocio.</p>
        </div>
      </header>

      <section className="perfil-layout">
        <article className="perfil-resumen">
          <div className="perfil-resumen-top">
            <div className="perfil-avatar">
              <img src={ICONOS.perfil} alt="" aria-hidden="true" />
            </div>
            <div className="perfil-resumen-copy">
              <span className="perfil-role">{perfil.rol}</span>
              <h2>{perfil.nombre}</h2>
              <p>{perfil.correo}</p>
            </div>
            <span className="perfil-status">{perfil.estado}</span>
          </div>

          <div className="perfil-resumen-divider" />

          <div className="perfil-business">
            <div className="perfil-info-icon">
              <img src={ICONOS.negocio} alt="" aria-hidden="true" />
            </div>
            <div>
              <span>Negocio activo</span>
              <strong>{negocio.nombre}</strong>
              <small>{negocio.tipo}</small>
            </div>
          </div>
        </article>

        <form className="perfil-form-card" onSubmit={handleSubmit}>
          <div className="perfil-card-header">
            <div>
              <span className="perfil-card-label">Información personal</span>
              <h2>Datos de mi perfil</h2>
              <p>Actualiza los datos que utilizas para identificar tu cuenta.</p>
            </div>
            <div className="perfil-card-header-icon" aria-hidden="true">
              <img src={ICONOS.editar} alt="" />
            </div>
          </div>

          <div className="perfil-form-grid">
            <label className="perfil-field">
              <span>Nombre completo</span>
              <div className="perfil-input-wrap">
                <img src={ICONOS.perfil} alt="" aria-hidden="true" />
                <input name="nombre" value={formulario.nombre} onChange={handleChange} required />
              </div>
            </label>

            <label className="perfil-field">
              <span>Correo electrónico</span>
              <div className="perfil-input-wrap">
                <img src={ICONOS.correo} alt="" aria-hidden="true" />
                <input type="email" name="correo" value={formulario.correo} onChange={handleChange} required />
              </div>
            </label>

            <label className="perfil-field">
              <span>Teléfono</span>
              <div className="perfil-input-wrap">
                <img src={ICONOS.telefono} alt="" aria-hidden="true" />
                <input
                  name="telefono"
                  value={formulario.telefono}
                  onChange={handleChange}
                  inputMode="numeric"
                  placeholder="0000-0000"
                />
              </div>
            </label>

            <div className="perfil-field">
              <span>Rol</span>
              <div className="perfil-readonly">
                <img src={ICONOS.rol} alt="" aria-hidden="true" />
                <strong>{perfil.rol}</strong>
                <small>Asignado por el negocio</small>
              </div>
            </div>
          </div>

          <div className="perfil-form-footer">
            <p
              className={guardado || errorGuardado ? "perfil-save-message visible" : "perfil-save-message"}
              role="status"
              aria-live="polite"
            >
              {errorGuardado || (guardado ? "Cambios guardados correctamente." : "")}
            </p>
            <button className="perfil-save-button" type="submit" disabled={guardando}>
              <span>{guardando ? "Guardando..." : "Guardar cambios"}</span>
            </button>
          </div>
        </form>
      </section>

      <section className="perfil-security-card">
        <div>
          <span className="perfil-card-label">Cuenta</span>
          <h2>Seguridad</h2>
          <p>La gestión de contraseña y autenticación se incorporará cuando se conecte el módulo de acceso de usuarios.</p>
        </div>
        <div className="perfil-security-state">
          <span className="perfil-security-dot" />
          <span>Cuenta activa</span>
        </div>
      </section>
    </main>
  );
}

export default Perfil;
