import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import "./RestablecerContrasena.css";


function EyeIcon({ visible }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="reset-eye-icon">
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

export default function RestablecerContrasena() {
  const navigate = useNavigate();

  const [clave, setClave] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [estado, setEstado] = useState("idle");
  const [msg, setMsg] = useState("");
  const [mostrarClave, setMostrarClave] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    if (clave.length < 6) { setEstado("error"); setMsg("La contraseña debe tener al menos 6 caracteres."); return; }
    if (clave !== confirmar) { setEstado("error"); setMsg("Las contraseñas no coinciden."); return; }
    setEstado("loading");
    setMsg("");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("El enlace de recuperación no es válido o ya expiró.");

      // Guardamos el correo de la cuenta antes de cerrar la sesión para
      // mostrarlo automáticamente en el formulario de inicio de sesión.
      const correoRestablecido = sessionData.session.user?.email || "";

      const { error } = await supabase.auth.updateUser({ password: clave });
      if (error) throw new Error(error.message);

      setEstado("success");
      setMsg("Tu contraseña fue actualizada. Ya puedes iniciar sesión.");
      await supabase.auth.signOut();

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: { correoRestablecido },
        });
      }, 1500);
    } catch (error) {
      setEstado("error");
      setMsg(error.message || "No se pudo actualizar la contraseña. Inténtalo nuevamente.");
    }
  };

  return (
    <main className="reset-page">
      <section className="reset-card">
        <Link to="/login">
          <img src="/logoSC.png" alt="Sweet Cost" />
        </Link>

        <span>RESTABLECER CONTRASEÑA</span>

        <h1>Crea una nueva contraseña</h1>

        <p>Escribe tu nueva contraseña para continuar.</p>

        {estado !== "success" ? (
          <form onSubmit={enviar}>
            <label>
              Nueva contraseña
              <div className="reset-password-field">
                <input
                  type={mostrarClave ? "text" : "password"}
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  minLength={6}
                  required
                />
                <button type="button" className="reset-password-toggle" onClick={() => setMostrarClave((v) => !v)} aria-label={mostrarClave ? "Ocultar contraseña" : "Mostrar contraseña"}>
                  <EyeIcon visible={mostrarClave} />
                </button>
              </div>
            </label>

            <label>
              Confirmar contraseña
              <div className="reset-password-field">
                <input
                  type={mostrarConfirmar ? "text" : "password"}
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  minLength={6}
                  required
                />
                <button type="button" className="reset-password-toggle" onClick={() => setMostrarConfirmar((v) => !v)} aria-label={mostrarConfirmar ? "Ocultar contraseña" : "Mostrar contraseña"}>
                  <EyeIcon visible={mostrarConfirmar} />
                </button>
              </div>
            </label>

            {msg && (
              <div className="reset-msg">
                {msg}
              </div>
            )}

            <button type="submit" disabled={estado === "loading"}>
              {estado === "loading"
                ? "Actualizando..."
                : "Actualizar contraseña"}
            </button>
          </form>
        ) : (
          <div className="reset-success">{msg}</div>
        )}

        <Link to="/login">Volver a iniciar sesión</Link>
      </section>
    </main>
  );
}