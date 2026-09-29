import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "../pages/Home/Home";
import Productos from "../pages/Productos/Productos";
import Insumos from "../pages/Insumos/Insumos";
import Recetas from "../pages/Recetas/Recetas";
import Cotizador from "../pages/Cotizador/Cotizador";
import Pedidos from "../pages/Pedidos/Pedidos";
import Calendario from "../pages/Calendario/Calendario";
import Empleados from "../pages/Empleados/Empleados";
import Configuracion from "../pages/Configuracion/Configuracion";

import Nav from "../components/Nav/Nav";

function ComingSoon({ title, description, illustration }) {
  return (
    <main className="module-placeholder">
      <div className="module-placeholder-card">
        {illustration && (
          <div className="module-placeholder-illustration" aria-hidden="true">
            <img src={`/illustrations/${illustration}.png`} alt="" />
          </div>
        )}
        <p className="module-placeholder-label">Sweet Cost</p>
        <h1>{title}</h1>
        <p>{description}</p>
        <span>Sección preparada para la siguiente etapa del proyecto.</span>
      </div>
    </main>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Nav />

      <div className="app-shell">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/insumos" element={<Insumos />} />
          <Route path="/recetas" element={<Recetas />} />
          <Route path="/cotizaciones" element={<Cotizador />} />
          <Route path="/cotizaciones/:id" element={<Cotizador />} />

          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/pedidos/:id" element={<Pedidos />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/empleados" element={<Empleados />} />
<Route path="/configuracion" element={<Configuracion />} />
          <Route
            path="/perfil"
            element={
              <ComingSoon
                title="Mi perfil"
                description="Consulta y actualiza la información de tu cuenta."
                illustration="perfil"
              />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default AppRoutes;
