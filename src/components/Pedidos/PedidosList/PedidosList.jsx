import Icon from "../../common/Icon/Icon";
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
                      <Icon type="eye" size={16} />
                    </button>
                    <button type="button" onClick={() => onEditar(pedido)} aria-label={`Editar pedido de ${pedido.cliente}`} title="Editar">
                      <Icon type="edit" size={16} />
                    </button>
                    <button type="button" className="pedido-action-danger" onClick={() => onEliminar(pedido)} aria-label={`Eliminar pedido de ${pedido.cliente}`} title="Eliminar">
                      <Icon type="trash" size={16} />
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
