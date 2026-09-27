import "./PedidosList.css";

const estados = {
  Pendiente: "pendiente",
  "En preparación": "preparacion",
  Listo: "listo",
  Entregado: "entregado",
  Cancelado: "cancelado",
};

const formatearFecha = (fecha) => {
  if (!fecha) return "—";

  const valor = new Date(`${fecha}T00:00:00`);

  if (Number.isNaN(valor.getTime())) return fecha;

  return valor.toLocaleDateString("es-CR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatearMoneda = (valor) =>
  `₡ ${Number(valor || 0).toLocaleString("es-CR", {
    maximumFractionDigits: 0,
  })}`;

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
      <path d="m13.5 6.5 4 4" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 7h14M10 11v6M14 11v6M9 7V4h6v3M7 7l1 14h8l1-14" />
    </svg>
  );
}

function PedidosList({ pedidos, onVer, onEditar, onEliminar }) {
  if (!pedidos.length) {
    return (
      <div className="pedidos-empty">
        <div className="pedidos-empty-icon">+</div>
        <h3>No hay pedidos para mostrar</h3>
        <p>Prueba cambiar los filtros o registra un nuevo pedido.</p>
      </div>
    );
  }

  return (
    <div className="pedidos-table-wrap">
      <table className="pedidos-table">
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Entrega</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((pedido) => {
            const estadoClase = estados[pedido.estado] || "pendiente";

            return (
              <tr key={pedido.id}>
                <td>
                  <span className="pedido-number">#{String(pedido.numero || pedido.id).slice(-4)}</span>
                </td>
                <td>
                  <div className="pedido-client">
                    <strong>{pedido.cliente}</strong>
                    {pedido.telefono && <span>{pedido.telefono}</span>}
                  </div>
                </td>
                <td>{formatearFecha(pedido.fecha)}</td>
                <td>{formatearFecha(pedido.fechaEntrega)}</td>
                <td className="pedido-total-cell">{formatearMoneda(pedido.total)}</td>
                <td>
                  <span className={`pedido-status pedido-status--${estadoClase}`}>
                    {pedido.estado}
                  </span>
                </td>
                <td>
                  <div className="pedido-actions">
                    <button type="button" onClick={() => onVer(pedido)} aria-label={`Ver pedido de ${pedido.cliente}`} title="Ver">
                      <EyeIcon />
                    </button>
                    <button type="button" onClick={() => onEditar(pedido)} aria-label={`Editar pedido de ${pedido.cliente}`} title="Editar">
                      <EditIcon />
                    </button>
                    <button type="button" className="pedido-action-danger" onClick={() => onEliminar(pedido)} aria-label={`Eliminar pedido de ${pedido.cliente}`} title="Eliminar">
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default PedidosList;
