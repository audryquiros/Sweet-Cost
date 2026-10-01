import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

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
import Login from "../pages/Login/Login";
import SeleccionNegocio from "../pages/SeleccionNegocio/SeleccionNegocio";
import NoAccess from "../pages/NoAccess/NoAccess";
import NotFound from "../pages/NotFound/NotFound";

import Nav from "../components/Nav/Nav";
import { useAuth } from "../context/authContext";
import { cargarNegociosDesdeServidor } from "../context/negocioContext";
import { puedeAccederRuta, getRutaInicioPorRol } from "../services/authServices";
import { speechSupported, enableHoverTextReading, stopSpeech } from "../utils/textToSpeech";

function AppContent() {
  const { usuario, autenticado } = useAuth();
  const location = useLocation();
  const esAcceso = location.pathname === "/login" || location.pathname === "/seleccionar-negocio";

  useEffect(() => {
    cargarNegociosDesdeServidor().catch((error) => {
      console.warn("No se pudieron sincronizar los negocios desde JSON Server:", error);
    });
  }, []);

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
    const handleTtsChange = (event) => sincronizarLectura(Boolean(event.detail));
    window.addEventListener("sweetcost-tts-change", handleTtsChange);
    return () => {
      window.removeEventListener("sweetcost-tts-change", handleTtsChange);
      cleanupHover?.();
      document.documentElement.dataset.tts = "off";
      stopSpeech();
    };
  }, []);

  return (
    <>
      {autenticado && !esAcceso && <Nav />}
      <div className={autenticado && !esAcceso ? "app-shell" : ""}>
        <Routes>
          <Route path="/login" element={autenticado ? <Navigate to={getRutaInicioPorRol(usuario.rol)} replace /> : <Login />} />
          <Route path="/seleccionar-negocio" element={<SeleccionNegocio />} />
          <Route path="/403" element={<NoAccess />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<ProtectedApp />} />
        </Routes>
      </div>
    </>
  );
}

const RUTAS_DEL_SISTEMA = [
  "/",
  "/productos",
  "/insumos",
  "/recetas",
  "/cotizaciones",
  "/pedidos",
  "/calendario",
  "/empleados",
  "/configuracion",
  "/perfil",
];

function esRutaDelSistema(pathname) {
  return RUTAS_DEL_SISTEMA.some(
    (ruta) => pathname === ruta || (ruta !== "/" && pathname.startsWith(`${ruta}/`))
  );
}

function ProtectedApp() {
  const { usuario, autenticado } = useAuth();
  const location = useLocation();

  if (!autenticado) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!usuario?.negocioId) {
    return <Navigate to="/seleccionar-negocio" replace />;
  }

  // Una ruta existente pero no permitida por el rol muestra 403.
  if (esRutaDelSistema(location.pathname) && !puedeAccederRuta(usuario.rol, location.pathname)) {
    return <NoAccess />;
  }

  // Una ruta que no pertenece al sistema muestra 404.
  if (!esRutaDelSistema(location.pathname)) {
    return <NotFound />;
  }

  return (
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
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function AppRoutes() {
  return <BrowserRouter><AppContent /></BrowserRouter>;
}

export default AppRoutes;
