import RecetaCard from "../RecetaCard/RecetaCard";
import "./RecetaList.css";

function RecetaList({
  recetas,
  productos,
  onEditar,
  onEliminar,
}) {
  if (recetas.length === 0) {
    return (
      <div className="recetas-vacio">
        <h3>No hay recetas registradas</h3>

        <p>
          Agrega tu primera receta para comenzar a
          calcular los costos de producción.
        </p>
      </div>
    );
  }

  return (
    <div className="recetas-grid">
      {recetas.map((receta) => (
        <RecetaCard
          key={receta.id}
          receta={receta}
          productos={productos}
          onEditar={onEditar}
          onEliminar={onEliminar}
        />
      ))}
    </div>
  );
}

export default RecetaList;