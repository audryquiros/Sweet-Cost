import RecetaCard from "../RecetaCard/RecetaCard";
import EmptyState from "../../common/EmptyState/EmptyState";
import { calcularCostoReceta, calcularCostoPorRendimiento } from "../../../utils/calculosCostos";
import "./RecetaList.css";

function RecetaList({ recetas, productos, onEditar, onEliminar, vista = "cards" }) {
  if (recetas.length === 0) {
    return (
      <EmptyState
        illustration="recetas-batidor"
        title="No hay recetas registradas"
        description="Agrega tu primera receta para comenzar a calcular los costos de producción."
      />
    );
  }

  if (vista === "lista") {
    return <div className="recetas-table-wrap">
      <div className="recetas-table-header"><span>Receta</span><span>Categoría</span><span>Rendimiento</span><span>Costo total</span><span>Costo por unidad</span><span>Acciones</span></div>
      {recetas.map((receta) => {
        const total = calcularCostoReceta(receta, productos);
        const porRendimiento = calcularCostoPorRendimiento(receta, productos);
        return <article className="receta-lista-item" key={receta.id}>
          <div><strong>{receta.nombre}</strong><small>{receta.descripcion || "Sin descripción"}</small></div>
          <div><span className="receta-lista-badge">{receta.categoria === "reposteria" ? "Repostería" : receta.categoria === "comida" ? "Comida" : receta.categoria === "bebidas" ? "Bebidas" : "General"}</span></div>
          <div>{receta.rendimiento} {receta.unidadRendimiento}</div>
          <div>₡{total.toFixed(2)}</div>
          <div className="receta-lista-costo">₡{porRendimiento.toFixed(2)}</div>
          <div className="receta-lista-actions"><button type="button" onClick={() => onEditar(receta)}>Editar</button><button type="button" className="danger" onClick={() => onEliminar(receta)}>Eliminar</button></div>
        </article>;
      })}
    </div>;
  }

  return <div className="recetas-grid">{recetas.map((receta) => <RecetaCard key={receta.id} receta={receta} productos={productos} onEditar={onEditar} onEliminar={onEliminar} />)}</div>;
}

export default RecetaList;
