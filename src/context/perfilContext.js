import { useCallback, useEffect, useState } from "react";

const PERFIL_KEY = "sweetcost-perfil";

const PERFIL_DEFAULT = {
  nombre: "María Rodríguez",
  correo: "maria.rodriguez@sweetcost.demo",
  telefono: "8888-1001",
  rol: "Administrador",
  estado: "Activo",
  foto: "/illustrations/perfil.png",
};

function leerPerfil() {
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
  const nuevoPerfil = { ...PERFIL_DEFAULT, ...perfil };
  localStorage.setItem(PERFIL_KEY, JSON.stringify(nuevoPerfil));
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
    window.addEventListener("storage", sincronizar);

    return () => {
      window.removeEventListener("sweetcost-perfil-cambio", sincronizar);
      window.removeEventListener("storage", sincronizar);
    };
  }, []);

  return { perfil, actualizarPerfil };
}

export { PERFIL_KEY, PERFIL_DEFAULT };
