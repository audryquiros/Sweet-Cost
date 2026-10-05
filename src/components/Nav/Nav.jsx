import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import Icon from "../common/Icon/Icon";
import { getNegocioActivo, NEGOCIOS } from "../../context/negocioContext";
import { usePerfilActual } from "../../context/perfilContext";
import { useAuth } from "../../context/authContext";
import "./Nav.css";
import Notificaciones from "../Notificaciones/Notificaciones";

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

function SidebarIcon({ type, perfil }) {
  const [profileImage, setProfileImage] = useState(
    perfil?.foto || iconImages.profile
  );

  useEffect(() => {
    setProfileImage(perfil?.foto || iconImages.profile);
  }, [perfil?.foto]);

  const src = type === "profile" ? profileImage : iconImages[type];

  if (!src) {
    return <Icon type={type} />;
  }

  return (
    <img
      className="sidebar-illustration-icon"
      src={src}
      alt={type === "profile" ? (perfil?.nombre || "Perfil") : ""}
      aria-hidden={type === "profile" ? undefined : true}
      onError={type === "profile" ? () => setProfileImage(iconImages.profile) : undefined}
    />
  );
}

function SidebarLink({ item, onNavigate, perfil }) {
  const isProfile = item.icon === "profile";

  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      onClick={onNavigate}
      className={({ isActive }) =>
        `sidebar-link${isActive ? " active" : ""}${isProfile ? " sidebar-profile-link" : ""}`
      }
    >
      <SidebarIcon type={item.icon} perfil={perfil} />
      {isProfile ? (
        <span className="sidebar-profile-copy">
          <span className="sidebar-link-label">{item.label}</span>
          <span className="sidebar-profile-hint">Tu perfil</span>
        </span>
      ) : (
        <span className="sidebar-link-label">{item.label}</span>
      )}
    </NavLink>
  );
}

function Nav() {
  const [negocioActivo, setNegocioActivo] = useState(
    () => getNegocioActivo() || { id: "", nombre: "", tipo: "", imagen: "" }
  );
  const [negociosDisponibles, setNegociosDisponibles] = useState(() => [...NEGOCIOS]);
  const { perfil } = usePerfilActual();
  const { usuario, logout, seleccionarNegocio } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [negociosAbierto, setNegociosAbierto] = useState(false);
  const [imagenNegocioError, setImagenNegocioError] = useState(false);
  const responsiveModeRef = useRef("desktop");

  useEffect(() => {
    // Al cambiar de usuario, recalculamos el negocio desde la sesión actual.
    // Nunca conservamos visualmente el negocio de la cuenta anterior.
    const negocioSesion = getNegocioActivo();
    setNegocioActivo(negocioSesion || { id: "", nombre: "", tipo: "", imagen: "" });
    setImagenNegocioError(false);
  }, [usuario?.id, usuario?.negocioId, usuario?.negocioIds]);

  useEffect(() => {
    const handleNegocioCambio = (event) => {
      if (event.detail) {
        setNegocioActivo(event.detail);
        setImagenNegocioError(false);
      }
    };

    window.addEventListener("sweetcost-negocio-cambio", handleNegocioCambio);
    return () => window.removeEventListener("sweetcost-negocio-cambio", handleNegocioCambio);
  }, []);

  useEffect(() => {
    const handleNegociosCargados = (event) => {
      setNegociosDisponibles(Array.isArray(event.detail) ? event.detail : [...NEGOCIOS]);
    };

    window.addEventListener("sweetcost-negocios-cargados", handleNegociosCargados);
    setNegociosDisponibles([...NEGOCIOS]);
    return () => window.removeEventListener("sweetcost-negocios-cargados", handleNegociosCargados);
  }, []);

  const negociosDelUsuario = useMemo(() => {
    const ids = new Set(
      Array.isArray(usuario?.negocioIds)
        ? usuario.negocioIds
        : usuario?.negocioId
          ? [usuario.negocioId]
          : []
    );

    // El administrador también obtiene los negocios de los que figura como propietario.
    if (usuario?.rol === "administrador" && usuario?.id) {
      negociosDisponibles.forEach((negocio) => {
        if (negocio.administradorId === usuario.id) ids.add(negocio.id);
      });
    }

    return negociosDisponibles.filter((negocio) => ids.has(negocio.id));
  }, [negociosDisponibles, usuario?.id, usuario?.rol, usuario?.negocioId, usuario?.negocioIds]);

  const puedeCambiarNegocio = usuario?.rol === "administrador" || negociosDelUsuario.length > 1;

  useEffect(() => {
    const getViewportWidth = () => {
      const visualWidth = window.visualViewport?.width;
      const clientWidth = document.documentElement?.clientWidth;
      const innerWidth = window.innerWidth;
      const candidates = [visualWidth, clientWidth, innerWidth]
        .map(Number)
        .filter((value) => Number.isFinite(value) && value > 0);

      // clientWidth es el valor más estable cuando Chrome/Opera restaura
      // una pestaña y visualViewport todavía conserva temporalmente el ancho anterior.
      return Math.round(clientWidth || visualWidth || innerWidth || 0);
    };

    const getMode = () => {
      const width = getViewportWidth();
      if (width <= 777) return "mobile";
      if (width <= 1024) return "tablet";
      return "desktop";
    };

    const sincronizarModoResponsive = () => {
      const nextMode = getMode();
      responsiveModeRef.current = nextMode;
      document.documentElement.dataset.responsiveMode = nextMode;
      try {
        localStorage.setItem("sweetcost-responsive-mode", nextMode);
      } catch {
        // El modo visual sigue funcionando aunque el navegador bloquee storage.
      }
    };

    sincronizarModoResponsive();

    const handleResize = () => {
      const nextMode = getMode();
      if (nextMode !== responsiveModeRef.current) {
        setIsMobileOpen(false);
        setNegociosAbierto(false);
        responsiveModeRef.current = nextMode;
      }
      document.documentElement.dataset.responsiveMode = nextMode;
      try { localStorage.setItem("sweetcost-responsive-mode", nextMode); } catch {}
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // El navegador puede restaurar el viewport unos milisegundos después
        // de hacer visible la pestaña. Recalculamos inmediatamente y una vez
        // más en el siguiente frame para evitar conservar el layout de escritorio.
        sincronizarModoResponsive();
        requestAnimationFrame(() => sincronizarModoResponsive());
        document.body.classList.remove("sidebar-open");
        setIsMobileOpen(false);
      }
    };

    const handlePageShow = () => {
      sincronizarModoResponsive();
      requestAnimationFrame(() => sincronizarModoResponsive());
    };

    window.addEventListener("resize", handleResize);
    window.visualViewport?.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.visualViewport?.removeEventListener("resize", handleResize);
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

  const cambiarNegocio = (negocio) => {
    if (!negocio || !seleccionarNegocio(negocio)) return;
    setNegocioActivo(negocio);
    setImagenNegocioError(false);
    setNegociosAbierto(false);
    closeMobileMenu();
  };

  return (
    <>
      <Notificaciones />
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
          <img src="/illustrations/cerrar.png" alt="" aria-hidden="true" />
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
          <div className={`business-switcher-wrap${negociosAbierto ? " is-open" : ""}`}>
            <button
              type="button"
              className="business-switcher"
              aria-expanded={puedeCambiarNegocio ? negociosAbierto : undefined}
              aria-haspopup={puedeCambiarNegocio ? "menu" : undefined}
              disabled={!puedeCambiarNegocio}
              onClick={() => puedeCambiarNegocio && setNegociosAbierto((actual) => !actual)}
            >
              <span className="business-avatar">
                {negocioActivo.imagen && !imagenNegocioError ? (
                  <img
                    src={negocioActivo.imagen}
                    alt={`Imagen de ${negocioActivo.nombre}`}
                    onError={() => setImagenNegocioError(true)}
                  />
                ) : (
                  <img src="/logoSC.png" alt="" className="business-logo-fallback" />
                )}
              </span>
              <span className="business-info">
                <strong>{negocioActivo.nombre}</strong>
                <span>{negocioActivo.tipo}</span>
              </span>
              <span className="business-chevron" aria-hidden="true">⌄</span>
            </button>

            {negociosAbierto && puedeCambiarNegocio && (
              <div className="business-menu" role="menu">
                <div className="business-menu-title">Cambiar de negocio</div>
                {negociosDelUsuario.map((negocio) => (
                  <button
                    type="button"
                    role="menuitem"
                    key={negocio.id}
                    className={`business-menu-item${negocio.id === negocioActivo?.id ? " active" : ""}`}
                    onClick={() => cambiarNegocio(negocio)}
                  >
                    <span className="business-menu-avatar"><img src="/illustrations/negocio.png" alt="" aria-hidden="true" /></span>
                    <span><strong>{negocio.nombre}</strong><small>{negocio.tipo}</small></span>
                    {negocio.id === negocioActivo?.id && <span className="business-menu-check">✓</span>}
                  </button>
                ))}
                {usuario?.rol === "administrador" && (
                  <NavLink to="/negocios" className="business-menu-manage" onClick={() => { setNegociosAbierto(false); closeMobileMenu(); }}>
                    Administrar negocios
                  </NavLink>
                )}
              </div>
            )}
          </div>

          <div className="sidebar-section-label">Principal</div>
          <nav className="sidebar-nav" aria-label="Navegación principal">
            <SidebarLink item={menuPrincipal[0]} onNavigate={closeMobileMenu} perfil={perfil} />
          </nav>

          <div className="sidebar-section-label sidebar-section-label--spaced">Gestión del negocio</div>
          <nav className="sidebar-nav" aria-label="Gestión del negocio">
            {menuPrincipal.slice(1).filter((item) => usuario?.rol === "administrador" || ["/recetas", "/cotizaciones", "/pedidos", "/calendario"].includes(item.to)).map((item) => (
              <SidebarLink key={item.to} item={item} onNavigate={closeMobileMenu} perfil={perfil} />
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
                perfil={perfil}
              />
            ))}
            <SidebarLink
              item={{ to: "/perfil", label: perfil?.nombre || "Mi perfil", icon: "profile" }}
              onNavigate={closeMobileMenu}
              perfil={perfil}
            />
          </nav>

          {/* Cerrar sesión */}
          <button
            className="sidebar-logout"
            type="button"
            onClick={() => { logout(); closeMobileMenu(); }}
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