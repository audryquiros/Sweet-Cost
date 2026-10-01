import { useState } from "react";
import { Link } from "react-router-dom";
import "./RecuperarContrasena.css";

const N8N_WEBHOOK_URL =
  import.meta.env.VITE_N8N_RECUPERACION_URL || "";

function RecuperarContrasena() {
  const [correo, setCorreo] = useState("");
  const [estado, setEstado] = useState("idle");
  const [mensaje, setMensaje] = useState("");

  const enviarSolicitud = async (event) => {
    event.preventDefault();
    setEstado("loading");
    setMensaje("");

    if (!N8N_WEBHOOK_URL) {
      setEstado("error");
      setMensaje(
        "La recuperación todavía no está conectada. Configura VITE_N8N_RECUPERACION_URL con la URL del Webhook de n8n."
      );
      return;
    }

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: correo.trim().toLowerCase(),
          origen: "sweet-cost",
          accion: "recuperar_contrasena",
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo enviar la solicitud.");
      }

      setEstado("success");
      setMensaje(
        "Si el correo está registrado, recibirás las instrucciones para recuperar tu contraseña."
      );
    } catch (error) {
      setEstado("error");
      setMensaje(
        error.message || "No se pudo procesar la solicitud. Inténtalo nuevamente."
      );
    }
  };

  return (
    <main className="recuperar-page">
      <section className="recuperar-card">
        <Link className="recuperar-logo-link" to="/login" aria-label="Volver al inicio de sesión">
          <img src="/logoSC.png" alt="Sweet Cost" className="recuperar-logo" />
        </Link>

        {estado !== "success" ? (
          <>
            <span className="recuperar-eyebrow">RECUPERACIÓN DE CUENTA</span>
            <h1>¿Olvidaste tu contraseña?</h1>
            <p className="recuperar-description">
              Ingresa el correo asociado a tu cuenta y te enviaremos las
              instrucciones para crear una nueva contraseña.
            </p>

            <form onSubmit={enviarSolicitud} className="recuperar-form">
              <label>
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

              {mensaje && (
                <p className="recuperar-message recuperar-message--error" role="alert">
                  {mensaje}
                </p>
              )}

              <button
                type="submit"
                className="recuperar-submit"
                disabled={estado === "loading"}
              >
                {estado === "loading" ? "Enviando..." : "Enviar instrucciones"}
              </button>
            </form>
          </>
        ) : (
          <div className="recuperar-success">
            <div className="recuperar-success-icon">✓</div>
            <span className="recuperar-eyebrow">SOLICITUD ENVIADA</span>
            <h1>Revisa tu correo</h1>
            <p>{mensaje}</p>
          </div>
        )}

        <Link className="recuperar-back" to="/login">
          Volver a iniciar sesión
        </Link>
      </section>
    </main>
  );
}

export default RecuperarContrasena;
