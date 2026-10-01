import { useCallback, useEffect, useState } from "react";
import { getAuthUser } from "./authContext";

const PERFIL_KEY = "sweetcost-perfil";

const PERFIL_DEFAULT = {
  id: null,
  nombre: "",
  correo: "",
  telefono: "",
  rol: "Empleado",
  estado: "Activo",
  foto: "/illustrations/perfil.png",
};

function leerPerfil() {
  const usuario = getAuthUser();
  if (usuario) {
    return { ...PERFIL_DEFAULT, ...usuario };
  }

  try {
    const guardado = localStorage.getItem(PERFIL_KEY);
    return guardado ? { ...PERFIL_DEFAULT, ...JSON.parse(guardado) } : PERFIL_DEFAULT;
  } catch {
    return PERFIL_DEFAULT;
  }
}

export function getPerfilActual() {
  return leerPerfil();
}

export function guardarPerfilActual(perfil) {
  const usuario = getAuthUser();
  const nuevoPerfil = { ...PERFIL_DEFAULT, ...perfil, ...(usuario || {}) , ...perfil };

  localStorage.setItem(PERFIL_KEY, JSON.stringify(nuevoPerfil));

  if (usuario) {
    const actualizado = { ...usuario, ...perfil };
    sessionStorage.setItem("sweetcost-auth-user", JSON.stringify(actualizado));
    window.dispatchEvent(new CustomEvent("sweetcost-auth-cambio", { detail: actualizado }));
  }

  window.dispatchEvent(new CustomEvent("sweetcost-perfil-cambio"));
  return nuevoPerfil;
}

export function usePerfilActual() {
  const [perfil, setPerfil] = useState(leerPerfil);

  const actualizarPerfil = useCallback((cambios) => {
    setPerfil((actual) => guardarPerfilActual({ ...actual, ...cambios }));
  }, []);

  useEffect(() => {
    const sincronizar = () => setPerfil(leerPerfil());
    window.addEventListener("sweetcost-perfil-cambio", sincronizar);
    window.addEventListener("sweetcost-auth-cambio", sincronizar);
    window.addEventListener("storage", sincronizar);
    return () => {
      window.removeEventListener("sweetcost-perfil-cambio", sincronizar);
      window.removeEventListener("sweetcost-auth-cambio", sincronizar);
      window.removeEventListener("storage", sincronizar);
    };
  }, []);

  return { perfil, actualizarPerfil };
}

export { PERFIL_KEY, PERFIL_DEFAULT };
