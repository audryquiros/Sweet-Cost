import InsumoCard from "../InsumoCard/InsumoCard";
import Icon from "../../common/Icon/Icon";
import EmptyState from "../../common/EmptyState/EmptyState";
import { obtenerCostoUnitarioInsumo, obtenerUnidadCostoInsumo } from "../../../utils/calculosCostos";
import "./InsumoList.css";

function InsumoList({ insumos, onEditar, onEliminar, vista = "cards" }) {
  if (insumos.length === 0) {
    return (
      <EmptyState
        illustration="insumos-frasco"
        title="No hay insumos registrados"
        description="Agrega tu primer insumo para comenzar a gestionar los costos de tus materiales."
      />
    );
  }

  if (vista === "lista") {
    return (
      <div className="insumos-table-wrap">
        <div className="insumos-table-header"><span>Insumo</span><span>Presentación</span><span>Cantidad</span><span>Compra</span><span>Costo unitario</span><span>Acciones</span></div>
        {insumos.map((insumo) => {
          const costo = obtenerCostoUnitarioInsumo(insumo);
          const unidad = obtenerUnidadCostoInsumo(insumo.unidad);
          return (
            <article className="insumo-lista-item" key={insumo.id}>
              <div><strong>{insumo.nombre}</strong><small>{insumo.unidad}</small></div>
              <div>{insumo.presentacion || "—"}</div>
              <div>{insumo.cantidad} {insumo.unidad}</div>
              <div>₡{Number(insumo.precio || 0).toFixed(2)}</div>
              <div className="insumo-lista-costo">₡{costo.toFixed(2)} / {unidad}</div>
              <div className="insumo-lista-actions"><button type="button" onClick={() => onEditar(insumo)}><Icon type="edit" size={21} /><span>Editar</span></button><button type="button" className="danger" onClick={() => onEliminar(insumo)}><Icon type="trash" size={21} /><span>Eliminar</span></button></div>
            </article>
          );
        })}
      </div>
    );
  }

  return <div className="insumos-grid">{insumos.map((insumo) => <InsumoCard key={insumo.id} insumo={insumo} onEditar={onEditar} onEliminar={onEliminar} />)}</div>;
}

export default InsumoList;
