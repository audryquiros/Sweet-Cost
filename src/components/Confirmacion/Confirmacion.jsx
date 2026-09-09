import "./Confirmacion.css";

function Confirmacion({
  titulo = "Confirmar eliminación",
  mensaje,
  onConfirmar,
  onCancelar,
}) {
  return (
    <div className="confirmacion-overlay">
      <div className="confirmacion-modal">
        <div className="confirmacion-contenido">
          <h3>{titulo}</h3>

          <p>{mensaje}</p>
        </div>

        <div className="confirmacion-acciones">
          <button
            type="button"
            className="btn-confirmacion-cancelar"
            onClick={onCancelar}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="btn-confirmacion-eliminar"
            onClick={onConfirmar}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export default Confirmacion;