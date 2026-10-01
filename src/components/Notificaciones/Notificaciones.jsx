import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getInsumos } from "../../services/insumoServices";
import { getCotizaciones } from "../../services/cotizadorServices";
import { getPedidos } from "../../services/pedidoServices";
import { getNegocioActivo } from "../../context/negocioContext";
import { useAuth } from "../../context/authContext";
import Icon from "../common/Icon/Icon";
import "./Notificaciones.css";

const READ_KEY = "sweetcost-notificaciones-leidas-v1";
const TIME_KEY = "sweetcost-notificaciones-fechas-v1";

const readStored = () => {
  try { return JSON.parse(localStorage.getItem(READ_KEY) || "[]"); } catch { return []; }
};

const readTimes = () => {
  try { return JSON.parse(localStorage.getItem(TIME_KEY) || "{}"); } catch { return {}; }
};

const notificationTime = (id, fallback = null) => {
  const stored = readTimes();
  if (stored[id]) return stored[id];
  const value = fallback || new Date().toISOString();
  stored[id] = value;
  localStorage.setItem(TIME_KEY, JSON.stringify(stored));
  return value;
};

const formatNotificationTime = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const fecha = d.toLocaleDateString("es-CR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const hora = d.toLocaleTimeString("es-CR", { hour: "numeric", minute: "2-digit" });
  return `${fecha} · ${hora}`;
};

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const hoursUntil = (date, time = "23:59") => {
  const target = new Date(`${date}T${time}`);
  return (target.getTime() - Date.now()) / 36e5;
};

function Notificaciones() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [leidas, setLeidas] = useState(readStored);
  const [loading, setLoading] = useState(false);
  const [negocio, setNegocio] = useState(() => getNegocioActivo());
  const { usuario } = useAuth();
  const ref = useRef(null);

  useEffect(() => {
    const change = (event) => event.detail && setNegocio(event.detail);
    window.addEventListener("sweetcost-negocio-cambio", change);
    return () => window.removeEventListener("sweetcost-negocio-cambio", change);
  }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      const [insumos, cotizaciones, pedidos] = await Promise.all([getInsumos(), getCotizaciones(), getPedidos()]);
      const result = [];
      const bajo = insumos.filter((i) => Number(i.cantidad || 0) <= 15);
      if (usuario?.rol === "administrador") bajo.forEach((i) => result.push({
        id: `stock-${i.id}`,
        tipo: Number(i.cantidad || 0) <= 5 ? "danger" : "warning",
        titulo: Number(i.cantidad || 0) <= 5 ? "Stock en peligro" : "Stock bajo",
        texto: `${i.nombre}: ${i.cantidad} ${i.unidad || "unidades"}.`,
        to: "/insumos",
        fechaHora: notificationTime(`stock-${i.id}`, i.fechaActualizacion || i.updatedAt),
      }));

      pedidos.filter((p) => p.fechaEntrega && !["Entregado", "Cancelado"].includes(p.estado) && hoursUntil(p.fechaEntrega, p.horaEntrega || "23:59") >= -2 && hoursUntil(p.fechaEntrega, p.horaEntrega || "23:59") <= 72)
        .forEach((p) => result.push({
          id: `pedido-proximo-${p.id}`,
          tipo: "info",
          titulo: "Pedido próximo",
          texto: `${p.recetaNombre || p.cotizacionNombre || `Pedido #${p.id}`} · ${p.fechaEntrega}${p.horaEntrega ? ` · ${p.horaEntrega}` : ""}.`,
          to: "/pedidos",
          fechaHora: notificationTime(`pedido-proximo-${p.id}`, p.fechaPedido || p.fecha || p.createdAt),
        }));

      cotizaciones.filter((c) => !["Aceptada", "Convertida", "Rechazada"].includes(c.estado)).forEach((c) => result.push({
        id: `cotizacion-${c.id}`,
        tipo: "quote",
        titulo: "Cotización pendiente",
        texto: `${c.nombre || "Cotización"} está pendiente de revisión.`,
        to: "/cotizaciones",
        fechaHora: notificationTime(`cotizacion-${c.id}`, c.fecha || c.createdAt),
      }));

      const activos = pedidos.filter((p) => !["Entregado", "Cancelado"].includes(p.estado));
      if (activos.length) {
        const resumen = activos.reduce((acc, p) => { acc[p.estado || "Pendiente"] = (acc[p.estado || "Pendiente"] || 0) + 1; return acc; }, {});
        result.push({
          id: `estados-${today()}-${Object.entries(resumen).map(([k,v]) => `${k}-${v}`).join("|")}`,
          tipo: "order",
          titulo: "Estado de pedidos",
          texto: Object.entries(resumen).map(([estado, cantidad]) => `${cantidad} ${estado.toLowerCase()}`).join(" · "),
          to: "/pedidos",
          fechaHora: notificationTime(`estados-${today()}-${Object.entries(resumen).map(([k,v]) => `${k}-${v}`).join("|")}`),
        });
      }

      result.sort((a, b) => new Date(b.fechaHora || 0) - new Date(a.fechaHora || 0));
      setItems(result);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
    const timer = window.setInterval(cargar, 60000);
    const refresh = () => cargar();
    window.addEventListener("sweetcost-datos-cambio", refresh);
    return () => { window.clearInterval(timer); window.removeEventListener("sweetcost-datos-cambio", refresh); };
  }, [negocio?.id, usuario?.rol]);

  useEffect(() => {
    if (open) cargar();
  }, [open]);

  useEffect(() => {
    const outside = (event) => { if (ref.current && !ref.current.contains(event.target)) setOpen(false); };
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  const unread = useMemo(() => items.filter((item) => !leidas.includes(item.id)), [items, leidas]);

  const markAll = () => {
    const next = Array.from(new Set([...leidas, ...items.map((i) => i.id)]));
    setLeidas(next);
    localStorage.setItem(READ_KEY, JSON.stringify(next));
  };

  const openItem = (item) => {
    if (!leidas.includes(item.id)) {
      const next = [...leidas, item.id];
      setLeidas(next);
      localStorage.setItem(READ_KEY, JSON.stringify(next));
    }
    setOpen(false);
  };

  return (
    <div className="notifications-root" ref={ref}>
      <button type="button" className={`notifications-trigger ${unread.length ? "has-unread" : ""}`} onClick={() => setOpen((v) => !v)} aria-label={`Notificaciones${unread.length ? `, ${unread.length} sin leer` : ""}`} aria-expanded={open}>
        <img src={unread.length ? "/illustrations/notificacion.png" : "/illustrations/notificacion-sin-corazon.png"} alt="" className="notifications-icon" />
        {unread.length > 0 && <span className="notifications-badge">{unread.length > 9 ? "9+" : unread.length}</span>}
      </button>
      {open && (
        <section className="notifications-panel" aria-label="Notificaciones">
          <header>
            <div><span>ACTUALIZACIONES</span><h2>Notificaciones</h2></div>
            <button type="button" onClick={markAll} disabled={!unread.length}>Marcar como leídas</button>
          </header>
          <div className="notifications-list">
            {loading && <div className="notifications-empty">Actualizando...</div>}
            {!loading && !items.length && <div className="notifications-empty">No hay alertas pendientes.</div>}
            {!loading && items.map((item) => (
              <Link to={item.to} key={item.id} className={`notification-item notification-item--${item.tipo} ${leidas.includes(item.id) ? "is-read" : ""}`} onClick={() => openItem(item)}>
                <span className="notification-dot" />
                <div><strong>{item.titulo}</strong><p>{item.texto}</p><time dateTime={item.fechaHora}>{formatNotificationTime(item.fechaHora)}</time></div>
              </Link>
            ))}
          </div>
          <footer>Se actualizan automáticamente cada minuto.</footer>
        </section>
      )}
    </div>
  );
}

export default Notificaciones;
