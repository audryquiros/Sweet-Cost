import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../lib/supabase";
import { hidratarNegocios } from "./negocioContext";

const AUTH_KEY = "sweetcost-auth-user";
const PENDING_BUSINESSES_KEY = "sweetcost-pending-businesses";

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

  return valor === "admin" || valor === "administrador"
    ? "administrador"
    : "empleado";
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

function normalizarNegocio(negocio) {
  return {
    ...negocio,
    margenGanancia: negocio?.margen_ganancia ?? negocio?.margenGanancia,
    administradorId: negocio?.administrador_id ?? negocio?.administradorId,
  };
}

function guardarSesion(usuario) {
  sessionStorage.setItem(AUTH_KEY, JSON.stringify(usuario));

  window.dispatchEvent(
    new CustomEvent("sweetcost-auth-cambio", {
      detail: usuario,
    })
  );
}

function limpiarSesion() {
  sessionStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(PENDING_BUSINESSES_KEY);
  sessionStorage.removeItem("sweetcost-negocios-autorizados");

  localStorage.removeItem("sweetcost-negocio-activo");
  localStorage.removeItem("sweetcost-perfil");

  window.dispatchEvent(
    new CustomEvent("sweetcost-auth-cambio", {
      detail: null,
    })
  );
}

async function obtenerPerfilUsuario(authUserId) {
  if (!authUserId) {
    throw new Error("No se encontró el usuario autenticado.");
  }

  /*
   * Buscamos el empleado vinculado a Supabase Auth.
   *
   * No buscamos por contraseña.
   * La contraseña ya fue validada por Supabase Auth.
   */
  const { data: empleado, error: empleadoError } = await supabase
    .from("empleados")
    .select("*")
    .eq("auth_user_id", authUserId)
    .eq("estado", "activo")
    .maybeSingle();

  if (empleadoError) {
    console.error("Error obteniendo empleado:", empleadoError);
    throw new Error("No se pudo cargar tu perfil.");
  }

  if (!empleado) {
    throw new Error(
      "Tu cuenta está autenticada, pero no está vinculada a un empleado de Sweet Cost."
    );
  }

  /*
   * Obtenemos TODOS los negocios asociados mediante
   * empleado_negocios.
   */
  const { data: relaciones, error: relacionesError } = await supabase
    .from("empleado_negocios")
    .select("empleado_id, negocio_id")
    .eq("empleado_id", empleado.id);

  if (relacionesError) {
    console.error("Error obteniendo negocios:", relacionesError);
    throw new Error("No se pudieron cargar tus negocios.");
  }

  const negocioIds = [
    ...new Set(
      (relaciones || [])
        .map((relacion) => relacion.negocio_id)
        .filter(Boolean)
    ),
  ];

  /*
   * Como respaldo, incluimos negocio_id del empleado
   * si existe y todavía no estaba en la lista.
   */
  if (empleado.negocio_id && !negocioIds.includes(empleado.negocio_id)) {
    negocioIds.push(empleado.negocio_id);
  }

  if (!negocioIds.length) {
    throw new Error("Tu usuario no tiene un negocio asignado.");
  }

  /*
   * RLS se encargará de devolver únicamente los negocios
   * a los que este usuario tiene acceso.
   */
  const { data: negocios, error: negociosError } = await supabase
    .from("negocios")
    .select("*")
    .in("id", negocioIds);

  if (negociosError) {
    console.error("Error obteniendo negocios:", negociosError);
    throw new Error("No se pudieron cargar tus negocios.");
  }

  if (!negocios?.length) {
    throw new Error("No tienes acceso a ningún negocio.");
  }

  const negociosNormalizados = negocios.map(normalizarNegocio);
  hidratarNegocios(negociosNormalizados);

  const usuarioBase = {
    id: empleado.id,
    authUserId: authUserId,
    nombre: empleado.nombre,
    correo: empleado.correo,
    telefono: empleado.telefono || "",
    rol: normalizarRol(empleado.rol),
    estado: empleado.estado,
    foto: empleado.foto || "/illustrations/perfil.png",
    negocioId: null,
    negocioIds: negocios.map((negocio) => negocio.id),
  };

  /*
   * Administradores con varios negocios deben seleccionar
   * explícitamente uno.
   */
  if (
    usuarioBase.rol === "administrador" &&
    negocios.length > 1
  ) {
    guardarSesion(usuarioBase);

    sessionStorage.setItem(
      PENDING_BUSINESSES_KEY,
      JSON.stringify(negociosNormalizados)
    );

    localStorage.removeItem("sweetcost-negocio-activo");

    return {
      usuario: usuarioBase,
      negocios: negociosNormalizados,
      requiereNegocio: true,
    };
  }

  sessionStorage.removeItem(PENDING_BUSINESSES_KEY);

  /*
   * Intentamos recuperar el negocio seleccionado anteriormente,
   * pero únicamente si pertenece a los negocios autorizados.
   */
  const negocioActivoGuardado = localStorage.getItem(
    `sweetcost-negocio-activo:${empleado.id}`
  );

  const negocioGuardadoPertenece = negocios.some(
    (negocio) => negocio.id === negocioActivoGuardado
  );

  /*
   * Preferimos el negocio_id principal del empleado.
   * Después el negocio guardado.
   * Finalmente el primero autorizado.
   */
  const negocio =
    negociosNormalizados.find(
      (item) => item.id === empleado.negocio_id
    ) ||
    (negocioGuardadoPertenece
      ? negociosNormalizados.find(
          (item) => item.id === negocioActivoGuardado
        )
      : null) ||
    negociosNormalizados[0];

  const usuarioConNegocio = {
    ...usuarioBase,
    negocioId: negocio.id,
    negocioIds: negocios.map((item) => item.id),
  };

  guardarSesion(usuarioConNegocio);

  localStorage.removeItem("sweetcost-negocio-activo");

  localStorage.setItem(
    `sweetcost-negocio-activo:${usuarioConNegocio.id}`,
    negocio.id
  );

  window.dispatchEvent(
    new CustomEvent("sweetcost-negocio-cambio", {
      detail: negocio,
    })
  );

  return {
    usuario: usuarioConNegocio,
    negocios: negociosNormalizados,
    requiereNegocio: false,
    negocio: normalizarNegocio(negocio),
  };
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(leerSesion);

  /*
   * Recuperar la sesión de Supabase al abrir/recargar la aplicación.
   */
  useEffect(() => {
    let activo = true;

    const cargarSesion = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error recuperando sesión:", error);
        return;
      }

      if (!session?.user) {
        if (activo) {
          setUsuario(null);
          limpiarSesion();
        }

        return;
      }

      try {
        const resultado = await obtenerPerfilUsuario(
          session.user.id
        );

        if (activo) {
          setUsuario(resultado.usuario);
        }
      } catch (errorPerfil) {
        console.error(
          "Error cargando perfil autenticado:",
          errorPerfil
        );

        await supabase.auth.signOut();

        if (activo) {
          setUsuario(null);
          limpiarSesion();
        }
      }
    };

    cargarSesion();

    /*
     * Supabase notificará cuando haya login/logout.
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" || !session?.user) {
          setUsuario(null);
          limpiarSesion();
        }
      }
    );

    return () => {
      activo = false;
      subscription.unsubscribe();
    };
  }, []);

  /*
   * Mantiene compatible el evento que ya utilizaba
   * Sweet Cost para sincronizar sesiones.
   */
  useEffect(() => {
    const sincronizar = () => {
      setUsuario(leerSesion());
    };

    window.addEventListener(
      "sweetcost-auth-cambio",
      sincronizar
    );

    return () => {
      window.removeEventListener(
        "sweetcost-auth-cambio",
        sincronizar
      );
    };
  }, []);

  const login = async (correo, clave) => {
    const correoNormalizado = correo.trim().toLowerCase();

    /*
     * IMPORTANTE:
     * La contraseña ahora la valida Supabase Auth.
     * Ya no consultamos empleados.clave.
     */
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: correoNormalizado,
        password: clave,
      });

    if (error) {
      console.error("Error de autenticación:", error);

      throw new Error(
        "Correo o contraseña incorrectos."
      );
    }

    if (!data.user) {
      throw new Error(
        "No se pudo obtener el usuario autenticado."
      );
    }

    try {
      const resultado = await obtenerPerfilUsuario(
        data.user.id
      );

      setUsuario(resultado.usuario);

      return resultado;
    } catch (errorPerfil) {
      /*
       * Si Auth funciona pero el empleado no está correctamente
       * vinculado, cerramos la sesión para no dejar una cuenta
       * autenticada sin perfil válido.
       */
      await supabase.auth.signOut();

      throw errorPerfil;
    }
  };

  const seleccionarNegocio = (negocio) => {
    if (!usuario || !negocio?.id) {
      return false;
    }

    const ids = obtenerIdsNegocios(usuario);

    if (!ids.includes(negocio.id)) {
      return false;
    }

    const actualizado = {
      ...usuario,
      negocioId: negocio.id,
      negocioIds: ids,
    };

    guardarSesion(actualizado);
    try {
      const cache = JSON.parse(sessionStorage.getItem("sweetcost-negocios-autorizados") || "[]");
      const actualizados = cache.map((item) => item.id === negocio.id ? negocio : item);
      if (!actualizados.some((item) => item.id === negocio.id)) actualizados.push(negocio);
      hidratarNegocios(actualizados);
    } catch { hidratarNegocios([negocio]); }

    sessionStorage.removeItem(
      PENDING_BUSINESSES_KEY
    );

    localStorage.removeItem(
      "sweetcost-negocio-activo"
    );

    localStorage.setItem(
      `sweetcost-negocio-activo:${usuario.id}`,
      negocio.id
    );

    window.dispatchEvent(
      new CustomEvent("sweetcost-negocio-cambio", {
        detail: negocio,
      })
    );

    setUsuario(actualizado);

    return true;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error cerrando sesión:", error);
    }

    limpiarSesion();
    setUsuario(null);
  };

  const value = useMemo(
    () => ({
      usuario,
      autenticado: Boolean(usuario),
      login,
      logout,
      seleccionarNegocio,
    }),
    [usuario]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider"
    );
  }

  return context;
}

export function getAuthUser() {
  return leerSesion();
}

export function getPendingBusinesses() {
  try {
    const value = sessionStorage.getItem(
      PENDING_BUSINESSES_KEY
    );

    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

export {
  AUTH_KEY,
  PENDING_BUSINESSES_KEY,
};