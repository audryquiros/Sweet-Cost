import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AUTH_KEY = "sweetcost-auth-user";
const PENDING_BUSINESSES_KEY = "sweetcost-pending-businesses";
const API_EMPLEADOS = "http://localhost:3001/empleados";
const API_NEGOCIOS = "http://localhost:3001/negocios";

const AuthContext = createContext(null);

function leerSesion() {
  try {
    const guardado = sessionStorage.getItem(AUTH_KEY);
    return guardado ? JSON.parse(guardado) : null;
  } catch {
    return null;
  }
}

function normalizarRol(rol = "") {
  const valor = String(rol).toLowerCase().trim();
  return valor === "admin" || valor === "administrador" ? "administrador" : "empleado";
}

function obtenerIdsNegocios(empleado) {
  const ids = new Set(
    Array.isArray(empleado?.negocioIds)
      ? empleado.negocioIds
      : empleado?.negocioId
        ? [empleado.negocioId]
        : []
  );
  return [...ids];
}

async function obtenerNegociosDisponibles(empleado) {
  const response = await fetch(API_NEGOCIOS);
  if (!response.ok) throw new Error("No se pudieron cargar los negocios");
  const negocios = await response.json();
  const ids = new Set(obtenerIdsNegocios(empleado));

  // El administrador es propietario de los negocios cuyo administradorId
  // coincide con su usuario. Los empleados dependen exclusivamente de
  // negocioIds, por lo que pueden trabajar en uno o varios negocios.
  if (normalizarRol(empleado?.rol) === "administrador" && empleado?.id) {
    negocios.forEach((negocio) => {
      if (negocio.administradorId === empleado.id) ids.add(negocio.id);
    });
  }

  return negocios.filter((negocio) => ids.has(negocio.id));
}

function guardarSesion(usuario) {
  sessionStorage.setItem(AUTH_KEY, JSON.stringify(usuario));
  window.dispatchEvent(new CustomEvent("sweetcost-auth-cambio", { detail: usuario }));
}

function limpiarSesion() {
  sessionStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(PENDING_BUSINESSES_KEY);
  localStorage.removeItem("sweetcost-negocio-activo");
  localStorage.removeItem("sweetcost-perfil");
  window.dispatchEvent(new CustomEvent("sweetcost-auth-cambio", { detail: null }));
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(leerSesion);

  useEffect(() => {
    const sincronizar = () => setUsuario(leerSesion());
    window.addEventListener("sweetcost-auth-cambio", sincronizar);
    return () => window.removeEventListener("sweetcost-auth-cambio", sincronizar);
  }, []);

  const login = async (correo, clave) => {
    const response = await fetch(`${API_EMPLEADOS}?correo=${encodeURIComponent(correo.trim())}`);
    if (!response.ok) throw new Error("No se pudo consultar el acceso");

    const empleados = await response.json();
    const empleado = empleados.find(
      (item) => item.estado === "activo" && item.correo.toLowerCase() === correo.trim().toLowerCase() && item.clave === clave
    );

    if (!empleado) {
      throw new Error("Correo o contraseña incorrectos.");
    }

    const usuarioBase = {
      id: empleado.id,
      nombre: empleado.nombre,
      correo: empleado.correo,
      telefono: empleado.telefono || "",
      rol: normalizarRol(empleado.rol),
      estado: empleado.estado,
      foto: empleado.foto || "/illustrations/perfil.png",
      negocioId: empleado.negocioId || null,
      negocioIds: obtenerIdsNegocios(empleado),
    };

    const negocios = await obtenerNegociosDisponibles(empleado);
    if (!negocios.length) {
      throw new Error("Tu usuario no tiene un negocio asignado.");
    }

    usuarioBase.negocioIds = negocios.map((negocio) => negocio.id);
    guardarSesion(usuarioBase);

    // Solo el administrador necesita escoger explícitamente el negocio al iniciar
    // cuando tiene varios. Un empleado con varios negocios entra al negocio activo
    // (o al primero disponible) y puede cambiar después desde el selector del sidebar.
    if (usuarioBase.rol === "administrador" && negocios.length > 1) {
      sessionStorage.setItem(PENDING_BUSINESSES_KEY, JSON.stringify(negocios));
      return { usuario: usuarioBase, negocios, requiereNegocio: true };
    }

    sessionStorage.removeItem(PENDING_BUSINESSES_KEY);
    const negocioActivoGuardado = localStorage.getItem("sweetcost-negocio-activo");
    const negocio = negocios.find((item) => item.id === negocioActivoGuardado) || negocios[0];
    const usuarioConNegocio = { ...usuarioBase, negocioId: negocio.id };
    guardarSesion(usuarioConNegocio);
    localStorage.setItem("sweetcost-negocio-activo", negocio.id);
    window.dispatchEvent(new CustomEvent("sweetcost-negocio-cambio", { detail: negocio }));
    return { usuario: usuarioConNegocio, negocios, requiereNegocio: false, negocio };
  };

  const seleccionarNegocio = (negocio) => {
    if (!usuario || !negocio?.id) return false;

    const ids = obtenerIdsNegocios(usuario);
    const esPropietario = usuario.rol === "administrador" && negocio.administradorId === usuario.id;
    if (!ids.includes(negocio.id) && !esPropietario) return false;

    const negocioIds = [...new Set([...ids, ...(esPropietario ? [negocio.id] : [])])];
    const actualizado = { ...usuario, negocioId: negocio.id, negocioIds };
    guardarSesion(actualizado);
    sessionStorage.removeItem(PENDING_BUSINESSES_KEY);
    localStorage.setItem("sweetcost-negocio-activo", negocio.id);
    window.dispatchEvent(new CustomEvent("sweetcost-negocio-cambio", { detail: negocio }));
    return true;
  };

  const logout = () => {
    limpiarSesion();
    setUsuario(null);
  };

  const value = useMemo(() => ({
    usuario,
    autenticado: Boolean(usuario),
    login,
    logout,
    seleccionarNegocio,
  }), [usuario]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe utilizarse dentro de AuthProvider");
  return context;
}

export function getAuthUser() {
  return leerSesion();
}

export function getPendingBusinesses() {
  try {
    const value = sessionStorage.getItem(PENDING_BUSINESSES_KEY);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

export { AUTH_KEY, PENDING_BUSINESSES_KEY };
