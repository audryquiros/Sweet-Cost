import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../../components/common/Icon/Icon";
import { supabase } from "../../lib/supabase";
import "./RestablecerContrasena.css";

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
      const { error } = await supabase.auth.updateUser({ password: clave });
      if (error) throw new Error(error.message);
      setEstado("success");
      setMsg("Tu contraseña fue actualizada. Ya puedes iniciar sesión.");
      await supabase.auth.signOut();
      setTimeout(() => navigate("/login", { replace: true }), 1500);
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
                  <Icon type="eye" size={19} />
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
                  <Icon type="eye" size={19} />
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