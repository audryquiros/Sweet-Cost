import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import "./NotFound.css";

function NotFound() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const handleAction = () => {
    navigate(usuario ? "/perfil" : "/login", { replace: true });
  };

  return (
    <main className="status-page status-page--404">
      <section className="status-card">
        <img src="/logo-principal.png" alt="Sweet Cost" className="status-logo" />

        <div className="status-visual" aria-hidden="true">
          <img src="/illustrations/recibo.png" alt="" />
        </div>

        <div className="status-code" aria-hidden="true">404</div>
        <span className="status-eyebrow">Sweet Cost</span>
        <h1>Página no encontrada</h1>
        <p>La página que buscas no existe o ya no está disponible.</p>

        <button type="button" className="status-button" onClick={handleAction}>
          {usuario ? "Ir a mi perfil" : "Iniciar sesión"}
        </button>
      </section>
    </main>
  );
}

export default NotFound;
