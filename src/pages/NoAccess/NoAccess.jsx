import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import "./NoAccess.css";

function NoAccess() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const handleAction = () => {
    navigate(usuario ? "/perfil" : "/login", { replace: true });
  };

  return (
    <main className="status-page status-page--403">
      <section className="status-card">
        <img src="/logo-principal.png" alt="Sweet Cost" className="status-logo" />

        <div className="status-visual" aria-hidden="true">
          <img src="/illustrations/estado-inactivo.png" alt="" />
        </div>

        <div className="status-code" aria-hidden="true">403</div>
        <span className="status-eyebrow">Sweet Cost</span>
        <h1>No tienes acceso a esta función</h1>
        <p>Tu rol actual no tiene permisos para acceder a esta sección de Sweet Cost.</p>

        <button type="button" className="status-button" onClick={handleAction}>
          {usuario ? "Ir a mi perfil" : "Iniciar sesión"}
        </button>
      </section>
    </main>
  );
}

export default NoAccess;
