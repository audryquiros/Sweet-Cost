export function getRutaInicioPorRol() {
  // Ambos roles tienen su propio dashboard en "/".
  // El contenido se adapta dentro de Home.jsx según el rol.
  return "/";
}

export function puedeAccederRuta(rol, pathname) {
  const normalizado = String(rol).toLowerCase();

  if (normalizado === "administrador") return true;

  // El empleado puede consultar su dashboard y estas funciones.
  const rutasEmpleado = [
    "/",
    "/recetas",
    "/cotizaciones",
    "/pedidos",
    "/calendario",
    "/configuracion",
    "/perfil",
  ];

  return rutasEmpleado.some(
    (ruta) =>
      pathname === ruta ||
      (ruta !== "/" && pathname.startsWith(`${ruta}/`))
  );
}
