import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";

/**
 * Protege rutas según autenticación, negocio seleccionado y rol.
 *
 * allowedRoles:
 *   - ["administrador"]
 *   - ["empleado"]
 *   - ["administrador", "empleado"]
 *
 * requireBusiness=false se utiliza para /seleccionar-negocio,
 * porque esa página existe precisamente antes de tener un negocio activo.
 */
function PrivateRoute({
  children,
  allowedRoles = null,
  requireBusiness = true,
}) {
  const { usuario, autenticado } = useAuth();
  const location = useLocation();

  if (!autenticado) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  if (requireBusiness && !usuario?.negocioId) {
    return <Navigate to="/seleccionar-negocio" replace />;
  }

  if (
    Array.isArray(allowedRoles) &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(usuario?.rol)
  ) {
    return <Navigate to="/403" replace />;
  }

  return children;
}

export default PrivateRoute;
