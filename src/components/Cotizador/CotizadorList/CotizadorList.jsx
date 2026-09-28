import CotizadorCard from "../CotizadorCard/CotizadorCard";
import Icon from "../../common/Icon/Icon";
import EmptyState from "../../common/EmptyState/EmptyState";
import "./CotizadorList.css";

function CotizadorList({ cotizaciones, insumos, onEliminar, onConvertirPedido, vista = "cards" }) {
  if (cotizaciones.length === 0) {
    return (
      <EmptyState
        illustration="cotizaciones-recibo"
        title="No hay cotizaciones registradas"
        description="Crea tu primera cotización para calcular cuánto cuesta una venta."
      />
    );
  }

  if (vista === "lista") {
    return <div className="cotizador-table-wrap">
      <div className="cotizador-table-header"><span>Cotización</span><span>Cliente</span><span>Fecha</span><span>Total</span><span>Estado</span><span>Acciones</span></div>
      {cotizaciones.map((cotizacion) => {
        const total = Number(cotizacion.precioSugerido || 0);
        const estado = cotizacion.estado || "Pendiente";
        const fecha = cotizacion.fecha ? new Date(cotizacion.fecha).toLocaleDateString("es-CR") : "—";
        const puedeConvertir = String(estado).toLowerCase() === "aceptada" && !cotizacion.pedidoId;
        return <article className="cotizador-lista-item" key={cotizacion.id}>
          <div><strong>{cotizacion.nombre}</strong><small>{cotizacion.recetaNombre || "Sin receta"}</small></div>
          <div>{cotizacion.cliente || "—"}</div>
          <div>{fecha}</div>
          <div className="cotizador-lista-total">₡{total.toFixed(2)}</div>
          <div><span className={`cotizador-lista-estado estado-${String(estado).toLowerCase().replace(/\s+/g, "-")}`}>{estado}</span></div>
          <div className="cotizador-lista-actions">
            {puedeConvertir && <button type="button" onClick={() => onConvertirPedido(cotizacion)}>Crear pedido</button>}
            <button type="button" className="danger" onClick={() => onEliminar(cotizacion)}><Icon type="trash" size={15} /><span>Eliminar</span></button>
          </div>
        </article>;
      })}
    </div>;
  }

  return <div className="cotizador-grid">{cotizaciones.map((cotizacion) => <CotizadorCard key={cotizacion.id} cotizacion={cotizacion} insumos={insumos} onEliminar={onEliminar} onConvertirPedido={onConvertirPedido} />)}</div>;
}

export default CotizadorList;
