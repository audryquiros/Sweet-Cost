import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import "./RestablecerContrasena.css";

const URL = import.meta.env.VITE_N8N_RESTABLECER_URL || "";

export default function RestablecerContrasena() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get("token") || "";

  const [clave, setClave] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [estado, setEstado] = useState("idle");
  const [msg, setMsg] = useState("");

  const enviar = async (e) => {
    e.preventDefault();

    if (!token) {
      setEstado("error");
      setMsg("El enlace de recuperación no contiene un token válido.");
      return;
    }

    if (clave.length < 6) {
      setEstado("error");
      setMsg("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (clave !== confirmar) {
      setEstado("error");
      setMsg("Las contraseñas no coinciden.");
      return;
    }

    if (!URL) {
      setEstado("error");
      setMsg(
        "Configura VITE_N8N_RESTABLECER_URL para conectar el flujo de n8n."
      );
      return;
    }

    setEstado("loading");
    setMsg("");

    try {
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          nuevaContrasena: clave,
          origen: "sweet-cost",
          accion: "restablecer_contrasena",
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.ok === false) {
        throw new Error(
          data.mensaje || "No se pudo actualizar la contraseña."
        );
      }

      setEstado("success");
      setMsg("Tu contraseña fue actualizada. Ya puedes iniciar sesión.");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (error) {
      setEstado("error");
      setMsg(
        error.message ||
          "No se pudo actualizar la contraseña. Inténtalo nuevamente."
      );
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
              <input
                type="password"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                minLength={6}
                required
              />
            </label>

            <label>
              Confirmar contraseña
              <input
                type="password"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                minLength={6}
                required
              />
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