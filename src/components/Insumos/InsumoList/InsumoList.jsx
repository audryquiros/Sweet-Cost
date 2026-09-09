import InsumoCard from "../InsumoCard/InsumoCard";
import "./InsumoList.css";

function InsumoList({
  insumos,
  onEditar,
  onEliminar,
}) {
  if (insumos.length === 0) {
    return (
      <div className="insumos-vacio">
        <h3>No hay insumos registrados</h3>

        <p>
          Agrega tu primer insumo para comenzar a
          gestionar los costos de tus materiales.
        </p>
      </div>
    );
  }

  return (
    <div className="insumos-grid">
      {insumos.map((insumo) => (
        <InsumoCard
          key={insumo.id}
          insumo={insumo}
          onEditar={onEditar}
          onEliminar={onEliminar}
        />
      ))}
    </div>
  );
}

export default InsumoList;