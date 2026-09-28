import { NavLink } from "react-router-dom";
import Icon from "../common/Icon/Icon";
import "./Nav.css";

const menuPrincipal = [
  { to: "/", label: "Dashboard", icon: "dashboard" },
  { to: "/productos", label: "Productos", icon: "products" },
  { to: "/insumos", label: "Insumos", icon: "supplies" },
  { to: "/recetas", label: "Recetas", icon: "recipes" },
  { to: "/cotizaciones", label: "Cotizaciones", icon: "quotes" },
  { to: "/pedidos", label: "Pedidos", icon: "orders" },
  { to: "/calendario", label: "Calendario", icon: "calendar" },
  { to: "/empleados", label: "Empleados", icon: "employees" },
];

const menuCuenta = [
  { to: "/configuracion", label: "Configuración", icon: "settings" },
  { to: "/perfil", label: "Mi perfil", icon: "profile" },
];

const iconImages = {
  products: "/illustrations/productos-cupcake.png",
  supplies: "/illustrations/insumos-frasco.png",
  recipes: "/illustrations/recetas-batidor.png",
  quotes: "/illustrations/cotizaciones-recibo.png",
  orders: "/illustrations/pedidos-portapapeles.png",
  calendar: "/illustrations/calendario.png",
  employees: "/illustrations/empleados.png",
  settings: "/illustrations/configuracion.png",
  profile: "/illustrations/perfil.png",
  dashboard: "/illustrations/dashboard.png",
  logout: "/illustrations/cerrar-sesion.png",
};

function SidebarIcon({ type }) {
  const src = iconImages[type];
  if (!src) return <Icon type={type} />;
  return <img className="sidebar-illustration-icon" src={src} alt="" aria-hidden="true" />;
}

function SidebarLink({ item }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
    >
      <SidebarIcon type={item.icon} />
      <span>{item.label}</span>
    </NavLink>
  );
}

function Nav() {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <NavLink to="/" className="sidebar-brand" aria-label="Sweet Cost - Dashboard">
          <img
            src="/logo-principal.png"
            alt="Sweet Cost"
            className="sidebar-logo"
          />
        </NavLink>

        <div className="business-switcher" role="button" tabIndex={0}>
          <div className="business-avatar">SC</div>
          <div className="business-info">
            <strong>Dulces Momentos</strong>
            <span>Repostería</span>
          </div>
          <span className="business-chevron" aria-hidden="true">⌄</span>
        </div>

        <div className="sidebar-section-label">Principal</div>
        <nav className="sidebar-nav" aria-label="Navegación principal">
          <SidebarLink item={menuPrincipal[0]} />
        </nav>

        <div className="sidebar-section-label sidebar-section-label--spaced">Gestión del negocio</div>
        <nav className="sidebar-nav" aria-label="Gestión del negocio">
          {menuPrincipal.slice(1).map((item) => (
            <SidebarLink key={item.to} item={item} />
          ))}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-divider" />
        <div className="sidebar-section-label">Cuenta</div>
        <nav className="sidebar-nav" aria-label="Cuenta y preferencias">
          {menuCuenta.map((item) => (
            <SidebarLink key={item.to} item={item} />
          ))}
        </nav>

        <button className="sidebar-logout" type="button">
          <SidebarIcon type="logout" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}

export default Nav;
