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

function AppRoutes() {
  return (
    <BrowserRouter>
      <Nav />

      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/productos"
          element={<Productos />}
        />

        <Route
          path="/insumos"
          element={<Insumos />}
        />

        <Route
          path="/recetas"
          element={<Recetas />}
        />

        <Route
          path="/cotizaciones"
          element={<Cotizador />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;