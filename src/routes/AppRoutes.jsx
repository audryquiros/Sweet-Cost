import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
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
import Login from "../pages/Login/Login";
import RecuperarContrasena from "../pages/RecuperarContrasena/RecuperarContrasena";
import RestablecerContrasena from "../pages/RestablecerContrasena/RestablecerContrasena";
import Registro from "../pages/Registro/Registro";
import Negocios from "../pages/Negocios/Negocios";
import SeleccionNegocio from "../pages/SeleccionNegocio/SeleccionNegocio";
import NoAccess from "../pages/NoAccess/NoAccess";
import NotFound from "../pages/NotFound/NotFound";

import Nav from "../components/Nav/Nav";
import AsistenteIA from "../components/AsistenteIA/AsistenteIA";
import PrivateRoute from "./PrivateRoute";

import { getPendingBusinesses, useAuth } from "../context/authContext";
import { cargarNegociosDesdeServidor } from "../context/negocioContext";
import { speechSupported, enableHoverTextReading, stopSpeech } from "../utils/textToSpeech";

const ADMIN = ["administrador"];
const AMBOS = ["administrador", "empleado"];

function AppContent() {
  const { usuario, autenticado } = useAuth();
  const location = useLocation();
  const [negocioVersion, setNegocioVersion] = useState(0);

  // Supabase puede devolver el enlace de recuperación con un `code`
  // o con `type=recovery` en query/hash, dependiendo del flujo de Auth.
  // Si por alguna razón el proveedor devuelve al sitio raíz, debemos
  // llevar al usuario a la pantalla de nueva contraseña antes de que
  // PrivateRoute pueda renderizar el Dashboard.
  const esRecuperacion = (() => {
    if (location.pathname === "/restablecer-contrasena") return true;

    const searchParams = new URLSearchParams(location.search);
    const hashParams = new URLSearchParams(location.hash.replace(/^#/, ""));

    return (
      searchParams.get("type") === "recovery" ||
      searchParams.has("code") ||
      hashParams.get("type") === "recovery"
    );
  })();

  const esAcceso =
    location.pathname === "/login" ||
    location.pathname === "/seleccionar-negocio" ||
    location.pathname === "/restablecer-contrasena";

  if (esRecuperacion && location.pathname !== "/restablecer-contrasena") {
    return <Navigate to="/restablecer-contrasena" replace />;
  }

  useEffect(() => {
    const handleNegocioCambio = () => {
      // Remonta la vista actual al cambiar de negocio para que cualquier
      // módulo que cargue datos al montarse vuelva a consultar el negocio
      // activo sin depender de un refresh del navegador.
      setNegocioVersion((actual) => actual + 1);
    };

    window.addEventListener("sweetcost-negocio-cambio", handleNegocioCambio);
    return () => window.removeEventListener("sweetcost-negocio-cambio", handleNegocioCambio);
  }, []);

  useEffect(() => {
    if (!autenticado) return;
    cargarNegociosDesdeServidor().catch((error) => {
      console.warn(
        "No se pudieron sincronizar los negocios desde Supabase:",
        error
      );
    });
  }, [autenticado, usuario?.id]);

  useEffect(() => {
    if (!speechSupported) return undefined;

    let cleanupHover = null;

    const sincronizarLectura = (
      valor = localStorage.getItem("sweetcost-lectura-texto") === "true"
    ) => {
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

    const handleTtsChange = (event) =>
      sincronizarLectura(Boolean(event.detail));

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
      {autenticado && !esAcceso && <AsistenteIA />}

      <div className={autenticado && !esAcceso ? "app-shell" : ""}>
        <Routes key={negocioVersion}>
          {/* Acceso */}
          <Route
            path="/login"
            element={
              autenticado ? (
                <Navigate
                  to={
                    usuario?.rol === "administrador" &&
                    getPendingBusinesses().length > 1
                      ? "/seleccionar-negocio"
                      : "/"
                  }
                  replace
                />
              ) : (
                <Login />
              )
            }
          />

          <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
          <Route path="/restablecer-contrasena" element={<RestablecerContrasena />} />
          <Route path="/registro" element={autenticado ? <Navigate to="/" replace /> : <Registro />} />

          <Route
            path="/seleccionar-negocio"
            element={
              <PrivateRoute requireBusiness={false}>
                <SeleccionNegocio />
              </PrivateRoute>
            }
          />

          {/* Errores */}
          <Route path="/403" element={<NoAccess />} />
          <Route path="/404" element={<NotFound />} />

          {/* Dashboard: ambos roles */}
          <Route
            path="/"
            element={
              <PrivateRoute allowedRoles={AMBOS}>
                <Home />
              </PrivateRoute>
            }
          />

          <Route
            path="/negocios"
            element={
              <PrivateRoute allowedRoles={ADMIN}>
                <Negocios />
              </PrivateRoute>
            }
          />

          {/* Administración exclusiva */}
          <Route
            path="/productos"
            element={
              <PrivateRoute allowedRoles={ADMIN}>
                <Productos />
              </PrivateRoute>
            }
          />

          <Route
            path="/insumos"
            element={
              <PrivateRoute allowedRoles={ADMIN}>
                <Insumos />
              </PrivateRoute>
            }
          />

          <Route
            path="/empleados"
            element={
              <PrivateRoute allowedRoles={ADMIN}>
                <Empleados />
              </PrivateRoute>
            }
          />

          {/* Funciones compartidas */}
          <Route
            path="/recetas"
            element={
              <PrivateRoute allowedRoles={AMBOS}>
                <Recetas />
              </PrivateRoute>
            }
          />

          <Route
            path="/cotizaciones"
            element={
              <PrivateRoute allowedRoles={AMBOS}>
                <Cotizador />
              </PrivateRoute>
            }
          />

          <Route
            path="/cotizaciones/:id"
            element={
              <PrivateRoute allowedRoles={AMBOS}>
                <Cotizador />
              </PrivateRoute>
            }
          />

          <Route
            path="/pedidos"
            element={
              <PrivateRoute allowedRoles={AMBOS}>
                <Pedidos />
              </PrivateRoute>
            }
          />

          <Route
            path="/pedidos/:id"
            element={
              <PrivateRoute allowedRoles={AMBOS}>
                <Pedidos />
              </PrivateRoute>
            }
          />

          <Route
            path="/calendario"
            element={
              <PrivateRoute allowedRoles={AMBOS}>
                <Calendario />
              </PrivateRoute>
            }
          />

          <Route
            path="/configuracion"
            element={
              <PrivateRoute allowedRoles={AMBOS}>
                <Configuracion />
              </PrivateRoute>
            }
          />

          <Route
            path="/perfil"
            element={
              <PrivateRoute allowedRoles={AMBOS}>
                <Perfil />
              </PrivateRoute>
            }
          />

          {/* Cualquier URL desconocida */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default AppRoutes;
