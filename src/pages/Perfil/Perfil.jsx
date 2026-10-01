import { useEffect, useState } from "react";
import { getNegocioActivo } from "../../context/negocioContext";
import { usePerfilActual } from "../../context/perfilContext";
import { formatearTelefono } from "../../utils/formatearTelefono";
import { updateEmpleadoParcial } from "../../services/empleadoServices";
import "./Perfil.css";

const AVATARES = Array.from({ length: 32 }, (_, indice) => `/avatars/avatar-${indice + 1}.png`);

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
  const [negocio, setNegocio] = useState(() => getNegocioActivo());
  const { perfil, actualizarPerfil } = usePerfilActual();
  const [formulario, setFormulario] = useState(perfil);
  const [guardado, setGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState("");
  const [selectorFotoAbierto, setSelectorFotoAbierto] = useState(false);

  useEffect(() => {
    setFormulario(perfil);
  }, [perfil]);

  useEffect(() => {
    const handleNegocioCambio = (event) => {
      if (event.detail) setNegocio(event.detail);
    };

    window.addEventListener("sweetcost-negocio-cambio", handleNegocioCambio);
    return () => window.removeEventListener("sweetcost-negocio-cambio", handleNegocioCambio);
  }, []);

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
      foto: formulario.foto || ICONOS.perfil,
    };

    setGuardando(true);
    setGuardado(false);
    setErrorGuardado("");

    try {
      const empleadoActualizado = await updateEmpleadoParcial(perfil.id, cambios);

      actualizarPerfil({
        nombre: empleadoActualizado.nombre,
        correo: empleadoActualizado.correo,
        telefono: empleadoActualizado.telefono,
        foto: empleadoActualizado.foto || ICONOS.perfil,
      });

      setFormulario((actual) => ({
        ...actual,
        nombre: empleadoActualizado.nombre,
        correo: empleadoActualizado.correo,
        telefono: empleadoActualizado.telefono,
        foto: empleadoActualizado.foto || ICONOS.perfil,
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
            <div className="perfil-avatar-wrap">
              <div className="perfil-avatar">
                <img src={formulario.foto || ICONOS.perfil} alt={`Foto de ${perfil.nombre}`} onError={(event) => { event.currentTarget.src = ICONOS.perfil; }} />
              </div>
              <button type="button" className="perfil-avatar-edit" onClick={() => setSelectorFotoAbierto(true)} aria-label="Cambiar foto de perfil">
                Cambiar foto
              </button>
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

      {selectorFotoAbierto && (
        <div className="perfil-avatar-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectorFotoAbierto(false); }}>
          <section className="perfil-avatar-modal" role="dialog" aria-modal="true" aria-labelledby="perfil-avatar-modal-title">
            <div className="perfil-avatar-modal-header">
              <div>
                <span className="perfil-card-label">Personalización</span>
                <h2 id="perfil-avatar-modal-title">Elige tu foto de perfil</h2>
                <p>Selecciona una de las imágenes predeterminadas.</p>
              </div>
              <button type="button" className="perfil-avatar-modal-close" onClick={() => setSelectorFotoAbierto(false)} aria-label="Cerrar"><img src="/illustrations/cerrar.png" alt="" aria-hidden="true" /></button>
            </div>

            <div className="perfil-avatar-options">
              {AVATARES.map((avatar, indice) => (
                <button
                  type="button"
                  key={avatar}
                  className={`perfil-avatar-option${formulario.foto === avatar ? " selected" : ""}`}
                  onClick={() => {
                    setFormulario((actual) => ({ ...actual, foto: avatar }));
                    setGuardado(false);
                    setErrorGuardado("");
                    setSelectorFotoAbierto(false);
                  }}
                  aria-label={`Seleccionar foto ${indice + 1}`}
                  aria-pressed={formulario.foto === avatar}
                >
                  <img src={avatar} alt={`Foto predeterminada ${indice + 1}`} onError={(event) => { event.currentTarget.src = ICONOS.perfil; }} />
                  {formulario.foto === avatar && <span>✓</span>}
                </button>
              ))}
            </div>

            <small className="perfil-avatar-modal-note">Las imágenes se leen desde <strong>public/avatars</strong>. Puedes reemplazarlas por tus propias imágenes manteniendo los nombres avatar-1.png a avatar-32.png.</small>
          </section>
        </div>
      )}

      <section className="perfil-security-card">
        <div>
          <span className="perfil-card-label">Cuenta</span>
          <h2>Seguridad</h2>
          <p>La gestión de contraseña y autenticación se administra desde el acceso de Sweet Cost.</p>
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
