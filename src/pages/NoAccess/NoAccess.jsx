import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { getRutaInicioPorRol } from "../../services/authServices";
import "./NoAccess.css";

function NoAccess() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const inicio = usuario ? getRutaInicioPorRol(usuario.rol) : "/login";

  return (
    <main className="status-page">
      <section className="status-card">
        <img src="/logo-principal.png" alt="Sweet Cost" className="status-logo" />
        <div className="status-code" aria-hidden="true">403</div>
        <span className="status-eyebrow">Sweet Cost</span>
        <h1>No tienes acceso a esta función</h1>
        <p>Tu rol actual no tiene permisos para acceder a esta sección de Sweet Cost.</p>
        <button type="button" className="status-button" onClick={() => navigate(inicio, { replace: true })}>
          Volver al inicio
        </button>
        {usuario && <button type="button" className="status-link" onClick={() => navigate("/perfil")}>Ir a mi perfil</button>}
      </section>
    </main>
  );
}

export default NoAccess;
