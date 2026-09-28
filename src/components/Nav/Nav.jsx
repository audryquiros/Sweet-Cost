import { NavLink } from "react-router-dom";
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
    dashboard: (<>
      <path d="M4 19V9"/>
      <path d="M10 19V5"/>
      <path d="M16 19v-7"/>
      <path d="M22 19V3"/>
    </>),
    products: (<>
      <path d="M3.5 7.5 12 3l8.5 4.5L12 12 3.5 7.5Z"/>
      <path d="M3.5 7.5V17L12 21l8.5-4V7.5"/>
      <path d="M12 12v9"/>
    </>),
    supplies: (<>
      <path d="M7 4h10"/>
      <path d="M8 4v3l-2 3v7a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-7l-2-3V4"/>
      <path d="M8 10h8"/>
    </>),
    recipes: (<>
      <path d="M6 3.5h8.5L18 7v13.5H6z"/>
      <path d="M14.5 3.5V7H18"/>
      <path d="M9 11h6M9 14.5h6M9 18h4"/>
    </>),
    quotes: (<>
      <path d="M5 4.5h14v15H5z"/>
      <path d="M8 8h8M8 11.5h8M8 15h5"/>
      <path d="M8 19.5v1"/>
    </>),
    orders: (<>
      <path d="M6 3.5h12v17H6z"/>
      <path d="M9 3.5v3h6v-3"/>
      <path d="m9 13 2 2 4-4"/>
    </>),
    calendar: (<>
      <rect x="3.5" y="5" width="17" height="16" rx="2"/>
      <path d="M8 3v4M16 3v4M3.5 10h17"/>
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
    </>),
    employees: (<>
      <circle cx="9" cy="8" r="3"/>
      <path d="M3.5 20c.6-3.2 2.5-5 5.5-5s4.9 1.8 5.5 5"/>
      <path d="M16 6.5a2.5 2.5 0 0 1 0 4.9M17 15.5c2 .7 3.2 2.1 3.5 4.5"/>
    </>),
    settings: (<>
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.8 1.8 0 0 0 .4 2l-1.8 1.8a1.8 1.8 0 0 0-2-.4 1.8 1.8 0 0 0-1.1 1.6v.5h-2.6V20a1.8 1.8 0 0 0-1.1-1.6 1.8 1.8 0 0 0-2 .4L7.4 17a1.8 1.8 0 0 0 .4-2 1.8 1.8 0 0 0-1.6-1.1H5.5v-2.6h.7a1.8 1.8 0 0 0 1.6-1.1 1.8 1.8 0 0 0-.4-2l1.8-1.8a1.8 1.8 0 0 0 2 .4 1.8 1.8 0 0 0 1.1-1.6v-.5h2.6v.5a1.8 1.8 0 0 0 1.1 1.6 1.8 1.8 0 0 0 2-.4l1.8 1.8a1.8 1.8 0 0 0-.4 2 1.8 1.8 0 0 0 1.6 1.1h.7v2.6h-.7a1.8 1.8 0 0 0-1.6 1.1Z"/>
    </>),
    profile: (<>
      <circle cx="12" cy="8" r="3.5"/>
      <path d="M5 20.5c.8-3.7 3.1-5.5 7-5.5s6.2 1.8 7 5.5"/>
    </>),
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
          <span className="logout-icon" aria-hidden="true">↪</span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}

export default Nav;
