import { useEffect } from "react";
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
import Perfil from "../pages/Perfil/Perfil";

import Nav from "../components/Nav/Nav";
import { speechSupported, enableHoverTextReading, stopSpeech } from "../utils/textToSpeech";

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
  useEffect(() => {
    if (!speechSupported) return undefined;

    let cleanupHover = null;

    const sincronizarLectura = (valor = localStorage.getItem("sweetcost-lectura-texto") === "true") => {
      cleanupHover?.();
      cleanupHover = null;

      if (valor) {
        document.documentElement.dataset.tts = "on";
        cleanupHover = enableHoverTextReading();
      } else {
        document.documentElement.dataset.tts = "off";
        stopSpeech();
      }
    };

    sincronizarLectura();

    const handleTtsChange = (event) => {
      sincronizarLectura(Boolean(event.detail));
    };

    window.addEventListener("sweetcost-tts-change", handleTtsChange);

    return () => {
      window.removeEventListener("sweetcost-tts-change", handleTtsChange);
      cleanupHover?.();
      document.documentElement.dataset.tts = "off";
      stopSpeech();
    };
  }, []);

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
          <Route path="/perfil" element={<Perfil />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default AppRoutes;
