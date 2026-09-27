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

import Nav from "../components/Nav/Nav";

function ComingSoon({ title, description }) {
  return (
    <main className="module-placeholder">
      <div className="module-placeholder-card">
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

          <Route
            path="/pedidos"
            element={
              <ComingSoon
                title="Pedidos"
                description="Gestiona pedidos, estados, clientes y fechas de entrega del negocio."
              />
            }
          />
          <Route
            path="/calendario"
            element={
              <ComingSoon
                title="Calendario"
                description="Visualiza y organiza las fechas de entrega de tus pedidos."
              />
            }
          />
          <Route
            path="/empleados"
            element={
              <ComingSoon
                title="Empleados"
                description="Administra los empleados asociados al negocio seleccionado."
              />
            }
          />
          <Route
            path="/configuracion"
            element={
              <ComingSoon
                title="Configuración"
                description="Configura el negocio, categorías, unidades, márgenes de ganancia y opciones de accesibilidad."
              />
            }
          />
          <Route
            path="/perfil"
            element={
              <ComingSoon
                title="Mi perfil"
                description="Consulta y actualiza la información de tu cuenta."
              />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default AppRoutes;
