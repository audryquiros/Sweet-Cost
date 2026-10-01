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
  const [seguridadAbierta, setSeguridadAbierta] = useState(null);
  const [seguridadFormulario, setSeguridadFormulario] = useState({
    correo: "",
    claveActual: "",
    claveNueva: "",
    claveConfirmacion: "",
  });
  const [guardandoSeguridad, setGuardandoSeguridad] = useState(false);
  const [errorSeguridad, setErrorSeguridad] = useState("");
  const [exitoSeguridad, setExitoSeguridad] = useState("");

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


  const abrirSeguridad = (tipo) => {
    setSeguridadAbierta(tipo);
    setErrorSeguridad("");
    setExitoSeguridad("");
    setSeguridadFormulario({
      correo: perfil.correo || "",
      claveActual: "",
      claveNueva: "",
      claveConfirmacion: "",
    });
  };

  const cerrarSeguridad = () => {
    if (guardandoSeguridad) return;
    setSeguridadAbierta(null);
    setErrorSeguridad("");
    setExitoSeguridad("");
  };

  const actualizarSesionCorreo = (correo) => {
    try {
      const raw = sessionStorage.getItem("sweetcost-auth-user");
      if (!raw) return;
      const usuario = JSON.parse(raw);
      sessionStorage.setItem(
        "sweetcost-auth-user",
        JSON.stringify({ ...usuario, correo })
      );
      window.dispatchEvent(new CustomEvent("sweetcost-auth-cambio"));
    } catch {
      // El perfil ya quedó actualizado en JSON Server aunque la sesión no pueda sincronizarse.
    }
  };

  const guardarSeguridad = async (event) => {
    event.preventDefault();
    if (guardandoSeguridad) return;

    setErrorSeguridad("");
    setExitoSeguridad("");

    try {
      if (seguridadAbierta === "correo") {
        const nuevoCorreo = seguridadFormulario.correo.trim().toLowerCase();

        if (!nuevoCorreo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevoCorreo)) {
          setErrorSeguridad("Ingresa un correo electrónico válido.");
          return;
        }

        if (nuevoCorreo === String(perfil.correo || "").toLowerCase()) {
          setErrorSeguridad("El correo nuevo debe ser diferente al actual.");
          return;
        }

        setGuardandoSeguridad(true);
        const empleadosResponse = await fetch("http://localhost:3001/empleados");
        if (!empleadosResponse.ok) throw new Error("No se pudieron consultar las cuentas.");
        const empleados = await empleadosResponse.json();
        const correoExiste = empleados.some(
          (empleado) =>
            empleado.id !== perfil.id &&
            String(empleado.correo || "").trim().toLowerCase() === nuevoCorreo
        );

        if (correoExiste) {
          setErrorSeguridad("Ese correo ya está registrado en Sweet Cost.");
          return;
        }

        const actualizado = await updateEmpleadoParcial(perfil.id, { correo: nuevoCorreo });
        actualizarPerfil({ correo: actualizado.correo });
        setFormulario((actual) => ({ ...actual, correo: actualizado.correo }));
        actualizarSesionCorreo(actualizado.correo);
        setExitoSeguridad("Correo electrónico actualizado correctamente.");
      }

      if (seguridadAbierta === "contrasena") {
        const { claveActual, claveNueva, claveConfirmacion } = seguridadFormulario;

        if (!claveActual || !claveNueva || !claveConfirmacion) {
          setErrorSeguridad("Completa todos los campos.");
          return;
        }

        if (claveNueva.length < 8) {
          setErrorSeguridad("La nueva contraseña debe tener al menos 8 caracteres.");
          return;
        }

        if (claveNueva !== claveConfirmacion) {
          setErrorSeguridad("Las contraseñas nuevas no coinciden.");
          return;
        }

        setGuardandoSeguridad(true);
        const response = await fetch(`http://localhost:3001/empleados/${perfil.id}`);
        if (!response.ok) throw new Error("No se pudo verificar la cuenta.");
        const empleadoActual = await response.json();

        if (empleadoActual.clave !== claveActual) {
          setErrorSeguridad("La contraseña actual no es correcta.");
          return;
        }

        await updateEmpleadoParcial(perfil.id, { clave: claveNueva });
        setSeguridadFormulario((actual) => ({
          ...actual,
          claveActual: "",
          claveNueva: "",
          claveConfirmacion: "",
        }));
        setExitoSeguridad("Contraseña actualizada correctamente.");
      }
    } catch (error) {
      console.error("No se pudo actualizar la seguridad:", error);
      setErrorSeguridad(
        error.message?.includes("fetch")
          ? "No se pudo conectar con el servidor."
          : error.message || "No se pudo actualizar la información."
      );
    } finally {
      setGuardandoSeguridad(false);
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
        <div className="perfil-security-copy">
          <span className="perfil-card-label">Cuenta</span>
          <h2>Seguridad</h2>
          <p>Administra el correo asociado a tu cuenta y cambia tu contraseña cuando lo necesites.</p>
        </div>

        <div className="perfil-security-actions">
          <button type="button" className="perfil-security-action" onClick={() => abrirSeguridad("correo")}>
            <img src={ICONOS.correo} alt="" aria-hidden="true" />
            <span>
              <strong>Cambiar correo</strong>
              <small>Actualizar el correo de acceso</small>
            </span>
          </button>

          <button type="button" className="perfil-security-action" onClick={() => abrirSeguridad("contrasena")}>
            <img src={ICONOS.editar} alt="" aria-hidden="true" />
            <span>
              <strong>Cambiar contraseña</strong>
              <small>Actualizar tu contraseña</small>
            </span>
          </button>

          <div className="perfil-security-state">
            <span className="perfil-security-dot" />
            <span>Cuenta activa</span>
          </div>
        </div>
      </section>

      {seguridadAbierta && (
        <div
          className="perfil-security-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) cerrarSeguridad();
          }}
        >
          <section className="perfil-security-modal" role="dialog" aria-modal="true">
            <div className="perfil-security-modal-header">
              <div>
                <span className="perfil-card-label">Seguridad</span>
                <h2>{seguridadAbierta === "correo" ? "Cambiar correo electrónico" : "Cambiar contraseña"}</h2>
                <p>
                  {seguridadAbierta === "correo"
                    ? "El nuevo correo será el que utilices para iniciar sesión."
                    : "Por seguridad, confirma tu contraseña actual antes de establecer una nueva."}
                </p>
              </div>
              <button type="button" className="perfil-security-modal-close" onClick={cerrarSeguridad} aria-label="Cerrar">
                <img src="/illustrations/cerrar.png" alt="" aria-hidden="true" />
              </button>
            </div>

            <form className="perfil-security-modal-form" onSubmit={guardarSeguridad}>
              {seguridadAbierta === "correo" ? (
                <>
                  <label>
                    <span>Correo actual</span>
                    <input type="email" value={perfil.correo || ""} disabled />
                  </label>
                  <label>
                    <span>Nuevo correo electrónico</span>
                    <input
                      type="email"
                      value={seguridadFormulario.correo}
                      onChange={(event) => setSeguridadFormulario((actual) => ({ ...actual, correo: event.target.value }))}
                      autoComplete="email"
                      required
                    />
                  </label>
                </>
              ) : (
                <>
                  <label>
                    <span>Contraseña actual</span>
                    <input
                      type="password"
                      value={seguridadFormulario.claveActual}
                      onChange={(event) => setSeguridadFormulario((actual) => ({ ...actual, claveActual: event.target.value }))}
                      autoComplete="current-password"
                      required
                    />
                  </label>
                  <label>
                    <span>Nueva contraseña</span>
                    <input
                      type="password"
                      value={seguridadFormulario.claveNueva}
                      onChange={(event) => setSeguridadFormulario((actual) => ({ ...actual, claveNueva: event.target.value }))}
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                  </label>
                  <label>
                    <span>Confirmar nueva contraseña</span>
                    <input
                      type="password"
                      value={seguridadFormulario.claveConfirmacion}
                      onChange={(event) => setSeguridadFormulario((actual) => ({ ...actual, claveConfirmacion: event.target.value }))}
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                  </label>
                </>
              )}

              {errorSeguridad && <p className="perfil-security-message perfil-security-message--error">{errorSeguridad}</p>}
              {exitoSeguridad && <p className="perfil-security-message perfil-security-message--success">{exitoSeguridad}</p>}

              <div className="perfil-security-modal-actions">
                <button type="button" className="perfil-security-cancel" onClick={cerrarSeguridad}>Cancelar</button>
                <button type="submit" className="perfil-security-save" disabled={guardandoSeguridad}>
                  {guardandoSeguridad ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default Perfil;
