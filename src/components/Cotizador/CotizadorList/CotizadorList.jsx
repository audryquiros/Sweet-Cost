import CotizadorCard from "../CotizadorCard/CotizadorCard";

import "./CotizadorList.css";

function CotizadorList({
  cotizaciones,
  insumos,
  onEliminar,
}) {
  if (cotizaciones.length === 0) {
    return (
      <div className="cotizador-vacio-lista">
        <h3>
          No hay cotizaciones registradas
        </h3>

        <p>
          Crea tu primera cotización para
          calcular cuánto cuesta una venta.
        </p>
      </div>
    );
  }

  return (
    <div className="cotizador-grid">
      {cotizaciones.map(
        (cotizacion) => (
          <CotizadorCard
            key={cotizacion.id}
            cotizacion={cotizacion}
            insumos={insumos}
            onEliminar={onEliminar}
          />
        )
      )}
    </div>
  );
}

export default CotizadorList;