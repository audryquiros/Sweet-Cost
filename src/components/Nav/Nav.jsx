import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import Icon from "../common/Icon/Icon";
import { getNegocioActivo } from "../../context/negocioContext";
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

  if (!src) {
    return <Icon type={type} />;
  }

  return (
    <img
      className="sidebar-illustration-icon"
      src={src}
      alt=""
      aria-hidden="true"
    />
  );
}

function SidebarLink({ item, onNavigate }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      onClick={onNavigate}
      className={({ isActive }) =>
        `sidebar-link${isActive ? " active" : ""}`
      }
    >
      <SidebarIcon type={item.icon} />
      <span>{item.label}</span>
    </NavLink>
  );
}

function Nav() {
  const negocioActivo = getNegocioActivo();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const responsiveModeRef = useRef(
    typeof window === "undefined"
      ? "desktop"
      : window.innerWidth <= 777
        ? "mobile"
        : window.innerWidth <= 1024
          ? "tablet"
          : "desktop"
  );

  useEffect(() => {
    const getMode = () => {
      if (window.innerWidth <= 777) return "mobile";
      if (window.innerWidth <= 1024) return "tablet";
      return "desktop";
    };

    const handleResize = () => {
      const nextMode = getMode();

      // Al entrar/cambiar entre desktop, tablet y mobile el menú siempre
      // comienza cerrado. Así nunca queda "pegado" sobre el contenido.
      if (nextMode !== responsiveModeRef.current) {
        setIsMobileOpen(false);
        responsiveModeRef.current = nextMode;
      }
    };

    const closeSidebarOnReturn = () => {
      // Al cambiar de pestaña o volver al navegador, el sidebar móvil
      // siempre queda en un estado limpio y no arrastra el overlay.
      setIsMobileOpen(false);
      document.body.classList.remove("sidebar-open");
    };

    const handleVisibilityChange = () => {
      if (document.hidden) closeSidebarOnReturn();
    };

    const handlePageShow = () => {
      closeSidebarOnReturn();
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
      document.body.classList.remove("sidebar-open");
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle(
      "sidebar-open",
      isMobileOpen && window.innerWidth <= 1024
    );

    return () => {
      document.body.classList.remove("sidebar-open");
    };
  }, [isMobileOpen]);

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Botón para abrir el menú en mobile */}
      <button
        type="button"
        className="mobile-menu-trigger"
        aria-label="Abrir menú"
        aria-expanded={isMobileOpen}
        onClick={() => setIsMobileOpen(true)}
      >
        <img src="/illustrations/menu.png" alt="" className="mobile-menu-icon" />
      </button>

      {/* Fondo para cerrar el menú */}
      {isMobileOpen && (
        <button
          type="button"
          className="mobile-menu-backdrop"
          aria-label="Cerrar menú"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar${isMobileOpen ? " sidebar-open" : ""}`}
      >
        {/* Botón X */}
        <button
          type="button"
          className="mobile-menu-close"
          aria-label="Cerrar menú"
          onClick={closeMobileMenu}
        >
          <Icon type="close" size={20} />
        </button>

        <div className="sidebar-top">
          {/* Logo */}
          <NavLink
            to="/"
            className="sidebar-brand"
            aria-label="Sweet Cost - Dashboard"
            onClick={closeMobileMenu}
          >
            <img
              src="/logo-principal.png"
              alt="Sweet Cost"
              className="sidebar-logo"
            />
          </NavLink>

          {/* Negocio */}
          <div
            className="business-switcher"
            role="button"
            tabIndex={0}
          >
            <div className="business-avatar">SC</div>

            <div className="business-info">
              <strong>{negocioActivo.nombre}</strong>
              <span>{negocioActivo.tipo}</span>
            </div>

            <span
              className="business-chevron"
              aria-hidden="true"
            >
              ⌄
            </span>
          </div>

          {/* Principal */}
          <div className="sidebar-section-label">
            Principal
          </div>

          <nav
            className="sidebar-nav"
            aria-label="Navegación principal"
          >
            <SidebarLink
              item={menuPrincipal[0]}
              onNavigate={closeMobileMenu}
            />
          </nav>

          {/* Gestión */}
          <div className="sidebar-section-label sidebar-section-label--spaced">
            Gestión del negocio
          </div>

          <nav
            className="sidebar-nav"
            aria-label="Gestión del negocio"
          >
            {menuPrincipal.slice(1).map((item) => (
              <SidebarLink
                key={item.to}
                item={item}
                onNavigate={closeMobileMenu}
              />
            ))}
          </nav>
        </div>

        {/* Cuenta */}
        <div className="sidebar-bottom">
          <div className="sidebar-divider" />

          <div className="sidebar-section-label">
            Cuenta
          </div>

          <nav
            className="sidebar-nav"
            aria-label="Cuenta y preferencias"
          >
            {menuCuenta.map((item) => (
              <SidebarLink
                key={item.to}
                item={item}
                onNavigate={closeMobileMenu}
              />
            ))}
          </nav>

          {/* Cerrar sesión */}
          <button
            className="sidebar-logout"
            type="button"
          >
            <SidebarIcon type="logout" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Nav;