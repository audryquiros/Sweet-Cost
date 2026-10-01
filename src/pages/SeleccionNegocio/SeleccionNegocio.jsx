import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getPendingBusinesses, useAuth } from "../../context/authContext";
import { getRutaInicioPorRol } from "../../services/authServices";
import "./SeleccionNegocio.css";

function SeleccionNegocio() {
  const { usuario, seleccionarNegocio, logout } = useAuth();
  const navigate = useNavigate();
  const [negocios] = useState(getPendingBusinesses);

  if (!usuario) return <Navigate to="/login" replace />;

  // Esta pantalla de selección se reserva para administradores con varios negocios.
  // Los empleados pueden cambiar de negocio desde el selector del sidebar cuando
  // tengan más de uno asignado.
  if (usuario.rol !== "administrador" || negocios.length <= 1) {
    return <Navigate to={getRutaInicioPorRol(usuario.rol)} replace />;
  }

  const elegir = (negocio) => {
    if (!seleccionarNegocio(negocio)) return;
    navigate(getRutaInicioPorRol(usuario.rol), { replace: true });
  };

  return (
    <main className="selection-page">
      <div className="selection-overlay" aria-hidden="true" />
      <section className="selection-card" aria-labelledby="selection-title">
        <img src="/logoSC.png" alt="Sweet Cost" className="selection-logo" />
        <span className="selection-eyebrow">ADMINISTRACIÓN DE NEGOCIOS</span>
        <h1 id="selection-title">¿Qué negocio quieres administrar?</h1>
        <p>Tu cuenta tiene acceso a varios negocios. Selecciona uno para entrar a su información y administrar su operación.</p>

        <div className="selection-grid">
          {negocios.map((negocio) => (
            <button type="button" className="selection-business" key={negocio.id} onClick={() => elegir(negocio)}>
              <span className="selection-business-avatar">
                {negocio.imagen ? (
                  <img src={negocio.imagen} alt="" />
                ) : (
                  <img src="/illustrations/negocio.png" alt="" />
                )}
              </span>
              <span className="selection-business-copy">
                <strong>{negocio.nombre}</strong>
                <small>{negocio.tipo}</small>
                {negocio.correo && <small>{negocio.correo}</small>}
              </span>
              <span className="selection-arrow" aria-hidden="true">→</span>
            </button>
          ))}
        </div>

        <button type="button" className="selection-logout" onClick={() => {
          logout();
          navigate("/login", { replace: true });
        }}>
          Cerrar sesión
        </button>
      </section>
    </main>
  );
}

export default SeleccionNegocio;
