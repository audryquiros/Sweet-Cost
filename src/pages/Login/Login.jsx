import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { getPendingBusinesses, useAuth } from "../../context/authContext";
import "./Login.css";

function EyeIcon({ visible }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="login-eye-icon">
      <path
        d={visible
          ? "M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z"
          : "M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.4 5.5A10.8 10.8 0 0 1 12 5c6 0 9.5 7 9.5 7a18.7 18.7 0 0 1-2.7 3.5M6.2 6.2C3.7 8 2.5 12 2.5 12S6 19 12 19c1.4 0 2.7-.3 3.9-.8"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {visible && <circle cx="12" cy="12" r="2.2" fill="currentColor" />}
    </svg>
  );
}

function Login() {
  const { usuario, autenticado, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [correo, setCorreo] = useState(
    () =>
      location.state?.correoRestablecido ||
      localStorage.getItem("sweetcost-recordar-correo") ||
      ""
  );
  const [clave, setClave] = useState("");
  const [mostrarClave, setMostrarClave] = useState(false);
  const [recordarme, setRecordarme] = useState(true);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  if (autenticado) {
    const tieneNegociosPendientes =
      usuario?.rol === "administrador" && getPendingBusinesses().length > 1;

    return (
      <Navigate
        to={
          tieneNegociosPendientes
            ? "/seleccionar-negocio"
            : location.state?.from?.pathname || "/"
        }
        replace
      />
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setCargando(true);

    if (recordarme) {
      localStorage.setItem("sweetcost-recordar-correo", correo.trim());
    } else {
      localStorage.removeItem("sweetcost-recordar-correo");
    }

    try {
      const resultado = await login(correo, clave, recordarme);

      if (resultado.requiereNegocio) {
        navigate("/seleccionar-negocio", { replace: true });
      } else {
        navigate(
          "/",
          { replace: true }
        );
      }
    } catch (err) {
      setError(err.message || "No se pudo iniciar sesión.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-content">
        <section className="login-brand-card" aria-label="Información de Sweet Cost">
          <img
            className="login-brand-logo"
            src="/logoSC.png"
            alt="Sweet Cost"
          />

          <p className="login-brand-title">
            Gestiona tus recetas,
            <br />
            calcula tus costos
            <br />
            y haz crecer tu negocio.
          </p>

          <div className="login-brand-features" aria-label="Funciones principales">
            <div className="login-brand-feature">
              <img src="/illustrations/recetas-batidor.png" alt="" />
              <span>Recetas</span>
            </div>

            <div className="login-brand-feature">
              <img src="/illustrations/moneda.png" alt="" />
              <span>Costos</span>
            </div>

            <div className="login-brand-feature">
              <img src="/illustrations/empleados.png" alt="" />
              <span>Negocio</span>
            </div>
          </div>
        </section>

        <section className="login-card" aria-labelledby="login-title">
          <div className="login-heading">
            <h1 id="login-title">Inicia sesión</h1>
            <p>Ingresa a tu cuenta para continuar.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <label className="login-field">
              <span>Correo electrónico</span>
              <input
                type="email"
                value={correo}
                onChange={(event) => setCorreo(event.target.value)}
                placeholder="tu@correo.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="login-field">
              <span>Contraseña</span>
              <div className="login-password-wrap">
                <input
                  type={mostrarClave ? "text" : "password"}
                  value={clave}
                  onChange={(event) => setClave(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setMostrarClave((actual) => !actual)}
                  aria-label={
                    mostrarClave ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  title={mostrarClave ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <EyeIcon visible={mostrarClave} />
                </button>
              </div>
            </label>

            <div className="login-options">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={recordarme}
                  onChange={(event) => setRecordarme(event.target.checked)}
                  aria-label="Recordarme"
                />
                <span className="login-remember-box" aria-hidden="true">
                  {recordarme && <span className="login-remember-check">✓</span>}
                </span>
                <span className="login-remember-text">Recordarme</span>
              </label>

              <button type="button" className="login-forgot" onClick={() => navigate("/recuperar-contrasena")}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="login-submit" disabled={cargando}>
              <span>{cargando ? "Ingresando..." : "Iniciar sesión"}</span>
              {!cargando && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <div className="login-divider" aria-hidden="true">
            <span>o</span>
          </div>

          <button type="button" className="login-create-account" onClick={() => navigate("/registro")}>
            Crear una cuenta
          </button>
        </section>
      </div>
    </main>
  );
}

export default Login;
