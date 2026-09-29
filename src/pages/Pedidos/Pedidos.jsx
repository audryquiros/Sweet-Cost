import { useEffect, useMemo, useState } from "react";
import { getPedidos, updatePedido, deletePedido } from "../../services/pedidoServices";
import { getCotizaciones } from "../../services/cotizadorServices";
import Confirmacion from "../../components/Confirmacion/Confirmacion";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import Icon from "../../components/common/Icon/Icon";

import "./Pedidos.css";

const ESTADOS = ["Pendiente", "En preparación", "Listo", "Entregado", "Pagado", "Cancelado"];

function formatearFecha(fecha) {
  if (!fecha) return "-";
  const valor = String(fecha).includes("T") ? fecha : `${fecha}T00:00:00`;
  return new Date(valor).toLocaleDateString("es-CR");
}

function formatearHora(hora) {
  if (!hora) return "Sin hora";
  const [hours, minutes] = String(hora).split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return hora;
  const periodo = hours >= 12 ? "PM" : "AM";
  const hora12 = hours % 12 || 12;
  return `${hora12}:${String(minutes).padStart(2, "0")} ${periodo}`;
}

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [pedidoAEliminar, setPedidoAEliminar] = useState(null);
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [pedidosData, cotizacionesData] = await Promise.all([getPedidos(), getCotizaciones()]);
      setPedidos(pedidosData);
      setCotizaciones(cotizacionesData);
      setError("");
    } catch (err) {
      setError(err.message || "No se pudieron cargar los pedidos.");
    } finally {
      setCargando(false);
    }
  };

  const cantidadesPorEstado = useMemo(() => {
    const cantidades = ESTADOS.reduce((acc, estado) => ({ ...acc, [estado]: 0 }), {});
    pedidos.forEach((pedido) => {
      if (cantidades[pedido.estado] !== undefined) cantidades[pedido.estado] += 1;
    });
    return cantidades;
  }, [pedidos]);

  const pedidosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return pedidos.filter((pedido) => {
      const coincideTexto = !texto || [
        pedido.id,
        pedido.cliente,
        pedido.telefono,
        pedido.cotizacionNombre,
        pedido.recetaNombre,
      ].some((valor) => String(valor || "").toLowerCase().includes(texto));
      const coincideEstado = estadoFiltro === "Todos" || pedido.estado === estadoFiltro;
      return coincideTexto && coincideEstado;
    });
  }, [pedidos, busqueda, estadoFiltro]);

  const cambiarEstado = async (pedido, estado) => {
    try {
      const actualizado = await updatePedido(pedido.id, { ...pedido, estado });
      setPedidos((actuales) => actuales.map((item) => item.id === actualizado.id ? actualizado : item));
    } catch (err) {
      setError(err.message || "No se pudo actualizar el estado.");
    }
  };

  const eliminarPedido = async () => {
    if (!pedidoAEliminar) return;
    try {
      await deletePedido(pedidoAEliminar.id);
      setPedidos((actuales) => actuales.filter((item) => item.id !== pedidoAEliminar.id));
      setPedidoAEliminar(null);
    } catch (err) {
      setError(err.message || "No se pudo eliminar el pedido.");
    }
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setEstadoFiltro("Todos");
  };

  const cotizacionRelacionada = (pedido) =>
    cotizaciones.find((cotizacion) => String(cotizacion.id) === String(pedido.cotizacionId));

  if (cargando) {
    return <main className="pedidos-page"><div className="pedidos-cargando">Cargando pedidos...</div></main>;
  }

  return (
    <main className="pedidos-page">
      <header className="pedidos-header">
        <div>
          <h1>Pedidos</h1>
          <p>Gestiona los pedidos creados a partir de tus cotizaciones aceptadas.</p>
        </div>
      </header>

      {error && <div className="pedidos-error">{error}</div>}

      <section className="pedidos-tabs" aria-label="Filtrar pedidos por estado">
        <button type="button" className={estadoFiltro === "Todos" ? "activo" : ""} onClick={() => setEstadoFiltro("Todos")}>
          Todos <span>{pedidos.length}</span>
        </button>
        {ESTADOS.map((estado) => (
          <button
            key={estado}
            type="button"
            className={estadoFiltro === estado ? "activo" : ""}
            onClick={() => setEstadoFiltro(estado)}
          >
            {estado} <span>{cantidadesPorEstado[estado]}</span>
          </button>
        ))}
      </section>

      <section className="pedidos-filtros">
        <div className="pedidos-busqueda">
          <span aria-hidden="true">⌕</span>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar pedido..."
            aria-label="Buscar pedido"
          />
        </div>
        <button type="button" className="pedidos-filtro-fecha" disabled>
          Filtrar por fecha
          <span aria-hidden="true">▾</span>
        </button>
        {(busqueda || estadoFiltro !== "Todos") && (
          <button type="button" className="pedidos-limpiar" onClick={limpiarFiltros}>Limpiar</button>
        )}
      </section>

      {pedidosFiltrados.length === 0 ? (
        <EmptyState
          className="pedidos-vacio"
          illustration="pedidos-portapapeles"
          title="No hay pedidos para mostrar"
          description="Los pedidos se crean desde una cotización aceptada mediante “Convertir en pedido”."
        />
      ) : (
        <section className="pedidos-tabla-wrap">
          <table className="pedidos-tabla">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Entrega</th>
                <th>Hora</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map((pedido) => (
                <tr key={pedido.id}>
                  <td>
                    <strong>#{pedido.id}</strong>
                    <span>{pedido.cotizacionNombre || "Pedido desde cotización"}</span>
                  </td>
                  <td>
                    <strong>{pedido.cliente}</strong>
                    <span>{pedido.telefono || "Sin teléfono"}</span>
                  </td>
                  <td>{formatearFecha(pedido.fechaPedido)}</td>
                  <td><span>{formatearFecha(pedido.fechaEntrega)}</span></td>
                  <td><strong>{formatearHora(pedido.horaEntrega)}</strong></td>
                  <td><strong>₡{Number(pedido.precioSugerido || 0).toLocaleString("es-CR", { minimumFractionDigits: 2 })}</strong></td>
                  <td>
                    <select
                      className={`pedido-estado-select ${String(pedido.estado).toLowerCase().replaceAll(" ", "-")}`}
                      value={pedido.estado}
                      onChange={(e) => cambiarEstado(pedido, e.target.value)}
                      aria-label={`Estado del pedido ${pedido.id}`}
                    >
                      {ESTADOS.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
                    </select>
                  </td>
                  <td>
                    <div className="pedido-acciones">
                      <button type="button" onClick={() => setDetalle(pedido)} aria-label={`Ver pedido ${pedido.id}`}><Icon type="eye" size={19} /><span>Ver</span></button>
                      <button type="button" className="pedido-eliminar" onClick={() => setPedidoAEliminar(pedido)} aria-label={`Eliminar pedido ${pedido.id}`}><Icon type="trash" size={19} /><span>Eliminar</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {detalle && (
        <div className="pedido-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setDetalle(null)}>
          <div className="pedido-modal">
            <div className="pedido-modal-header">
              <div><span>Pedido #{detalle.id}</span><h2>{detalle.cliente}</h2></div>
              <button type="button" onClick={() => setDetalle(null)}>×</button>
            </div>
            <div className="pedido-detalle-grid">
              <div><span>Cotización</span><strong>{detalle.cotizacionNombre || "-"}</strong></div>
              <div><span>Receta</span><strong>{detalle.recetaNombre || "-"}</strong></div>
              <div><span>Fecha del pedido</span><strong>{formatearFecha(detalle.fechaPedido)}</strong></div>
              <div><span>Fecha de entrega</span><strong>{formatearFecha(detalle.fechaEntrega)}</strong></div>
              <div><span>Hora de entrega</span><strong>{formatearHora(detalle.horaEntrega)}</strong></div>
              <div><span>Cantidad</span><strong>{detalle.cantidadAVender || 0}</strong></div>
              <div><span>Productos totales</span><strong>{detalle.cantidadTotalProductos || 0}</strong></div>
              <div><span>Método de pago</span><strong>{detalle.metodoPago || "-"}</strong></div>
              <div><span>Depósito</span><strong>₡{Number(detalle.deposito || 0).toLocaleString("es-CR", { minimumFractionDigits: 2 })}{detalle.depositoPorcentaje != null ? ` (${Number(detalle.depositoPorcentaje)}%)` : ""}</strong></div>
              <div><span>Saldo</span><strong>₡{Number(detalle.saldo || 0).toLocaleString("es-CR", { minimumFractionDigits: 2 })}</strong></div>
              <div><span>Total</span><strong>₡{Number(detalle.precioSugerido || 0).toLocaleString("es-CR", { minimumFractionDigits: 2 })}</strong></div>
            </div>
            {cotizacionRelacionada(detalle) && <div className="pedido-origen">Este pedido fue generado desde la cotización <strong>{cotizacionRelacionada(detalle).nombre}</strong>.</div>}
            {detalle.observaciones && <div className="pedido-observaciones"><span>Observaciones</span><p>{detalle.observaciones}</p></div>}
          </div>
        </div>
      )}

      {pedidoAEliminar && (
        <Confirmacion mensaje={`¿Estás seguro de que deseas eliminar el pedido #${pedidoAEliminar.id}? Esta acción no se puede deshacer.`} onConfirmar={eliminarPedido} onCancelar={() => setPedidoAEliminar(null)} />
      )}
    </main>
  );
}

export default Pedidos;
