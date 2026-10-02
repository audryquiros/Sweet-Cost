import { useEffect } from "react";
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
import PrivateRoute from "./PrivateRoute";

import { getPendingBusinesses, useAuth } from "../context/authContext";
import { cargarNegociosDesdeServidor } from "../context/negocioContext";
import { speechSupported, enableHoverTextReading, stopSpeech } from "../utils/textToSpeech";

const ADMIN = ["administrador"];
const EMPLEADO = ["empleado"];
const AMBOS = ["administrador", "empleado"];

function AppContent() {
  const { usuario, autenticado } = useAuth();
  const location = useLocation();

  const esAcceso =
    location.pathname === "/login" ||
    location.pathname === "/seleccionar-negocio";

  useEffect(() => {
    cargarNegociosDesdeServidor().catch((error) => {
      console.warn(
        "No se pudieron sincronizar los negocios desde JSON Server:",
        error
      );
    });
  }, []);

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

      <div className={autenticado && !esAcceso ? "app-shell" : ""}>
        <Routes>
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
