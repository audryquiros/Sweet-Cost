import { NavLink } from "react-router-dom";
import "./Nav.css";

function Nav() {
  return (
    <nav className="nav">
      <div className="nav-container">

        <NavLink to="/" className="nav-logo">
          Sweet Cost
        </NavLink>

        <div className="nav-links">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Inicio
          </NavLink>

          <NavLink
            to="/productos"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Productos
          </NavLink>

          <NavLink
            to="/insumos"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Insumos
          </NavLink>

          <NavLink
            to="/recetas"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Recetas
          </NavLink>

          <NavLink
            to="/cotizaciones"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Cotizador
          </NavLink>
        </div>

      </div>
    </nav>
  );
}

export default Nav;