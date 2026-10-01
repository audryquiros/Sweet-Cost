import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getPendingBusinesses, useAuth } from "../../context/authContext";
import { getRutaInicioPorRol } from "../../services/authServices";
import "./SeleccionNegocio.css";

function SeleccionNegocio() {
  const { usuario, seleccionarNegocio } = useAuth();
  const navigate = useNavigate();
  const [negocios] = useState(getPendingBusinesses);

  if (!usuario) return <Navigate to="/login" replace />;
  if (negocios.length <= 1) return <Navigate to={getRutaInicioPorRol(usuario.rol)} replace />;

  const elegir = (negocio) => {
    if (!seleccionarNegocio(negocio)) return;
    navigate(getRutaInicioPorRol(usuario.rol), { replace: true });
  };

  return (
    <main className="selection-page">
      <section className="selection-card">
        <img src="/logo-principal.png" alt="Sweet Cost" className="selection-logo" />
        <span className="selection-eyebrow">Bienvenido, {usuario.nombre}</span>
        <h1>Elige un negocio</h1>
        <p>Tu cuenta tiene acceso a más de un negocio. Selecciona con cuál quieres trabajar.</p>
        <div className="selection-grid">
          {negocios.map((negocio) => (
            <button type="button" className="selection-business" key={negocio.id} onClick={() => elegir(negocio)}>
              <span className="selection-business-avatar">
                {negocio.imagen ? <img src={negocio.imagen} alt="" /> : (negocio.nombre || "SC").slice(0, 2).toUpperCase()}
              </span>
              <span className="selection-business-copy"><strong>{negocio.nombre}</strong><small>{negocio.tipo}</small></span>
              <span className="selection-arrow">→</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
export default SeleccionNegocio;
