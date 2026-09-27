import { NavLink } from "react-router-dom";
import "./Nav.css";

const menuPrincipal = [
  { to: "/", label: "Dashboard", icon: "grid" },
  { to: "/productos", label: "Productos", icon: "box" },
  { to: "/insumos", label: "Insumos", icon: "package" },
  { to: "/recetas", label: "Recetas", icon: "recipe" },
  { to: "/cotizaciones", label: "Cotizaciones", icon: "quote" },
  { to: "/pedidos", label: "Pedidos", icon: "orders" },
  { to: "/calendario", label: "Calendario", icon: "calendar" },
  { to: "/empleados", label: "Empleados", icon: "users" },
];

const menuCuenta = [
  { to: "/configuracion", label: "Configuración", icon: "settings" },
  { to: "/perfil", label: "Mi perfil", icon: "profile" },
];

function Icon({ type }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    box: <><path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="M4 7v10l8 4 8-4V7"/><path d="M12 11v10"/></>,
    package: <><path d="m3.5 7.5 8.5-4 8.5 4-8.5 4-8.5-4Z"/><path d="M3.5 7.5v9l8.5 4 8.5-4v-9"/><path d="M12 11.5v9"/></>,
    recipe: <><path d="M6 3h9l3 3v15H6z"/><path d="M15 3v4h4"/><path d="M9 11h6M9 15h6M9 19h4"/></>,
    quote: <><path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
    orders: <><path d="M4 5h16v14H4z"/><path d="M8 9h8M8 13h8M8 17h5"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    users: <><circle cx="9" cy="8" r="3"/><path d="M3.5 20c.5-3.3 2.4-5 5.5-5s5 1.7 5.5 5"/><path d="M16 5.5a3 3 0 0 1 0 5.8M17 15c2.1.5 3.5 2 4 5"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V20h-2.6v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H6v-2.6h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L9 6.7l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V5h2.6v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1v2.6h-.1a1.7 1.7 0 0 0-1.1 1.4Z"/></>,
    profile: <><circle cx="12" cy="8" r="3.5"/><path d="M5 21c.8-4 3.1-6 7-6s6.2 2 7 6"/></>,
  };

  return <svg {...common}>{paths[type]}</svg>;
}

function SidebarLink({ item }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
    >
      <Icon type={item.icon} />
      <span>{item.label}</span>
    </NavLink>
  );
}

function Nav() {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <NavLink to="/" className="sidebar-brand" aria-label="Sweet Cost - Dashboard">
          <img src="/logoSC.png" alt="Sweet Cost" className="sidebar-logo" />
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
          <span className="logout-icon" aria-hidden="true">↪</span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}

export default Nav;
