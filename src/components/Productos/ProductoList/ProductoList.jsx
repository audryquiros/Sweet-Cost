import ProductoCard from "../ProductoCard/ProductoCard";
import "./ProductoList.css";

function ProductoList({
  productos,
  onEditar,
  onEliminar,
}) {
  if (productos.length === 0) {
    return (
      <div className="productos-vacio">
        <h3>No hay productos registrados</h3>

        <p>
          Agrega tu primer producto para comenzar a
          gestionar tus costos.
        </p>
      </div>
    );
  }

  return (
    <div className="productos-grid">
      {productos.map((producto) => (
        <ProductoCard
          key={producto.id}
          producto={producto}
          onEditar={onEditar}
          onEliminar={onEliminar}
        />
      ))}
    </div>
  );
}

export default ProductoList;