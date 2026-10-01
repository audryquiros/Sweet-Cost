export function getRutaInicioPorRol(rol) {
  return String(rol).toLowerCase() === "administrador" ? "/" : "/cotizaciones";
}

export function puedeAccederRuta(rol, pathname) {
  const normalizado = String(rol).toLowerCase();
  if (normalizado === "administrador") return true;

  const rutasEmpleado = ["/cotizaciones", "/pedidos", "/recetas", "/calendario", "/configuracion", "/perfil"];
  return rutasEmpleado.some((ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`));
}
