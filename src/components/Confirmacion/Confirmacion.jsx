import "./Confirmacion.css";

function Confirmacion({
  titulo = "¿Eliminar elemento?",
  mensaje = "Esta acción no se puede deshacer.",
  onConfirmar,
  onCancelar,
  textoConfirmar = "Eliminar",
  icono = "/illustrations/eliminar.png",
}) {
  return (
    <div
      className="confirmacion-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancelar();
        }
      }}
    >
      <div
        className="confirmacion-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmacion-titulo"
        aria-describedby="confirmacion-mensaje"
      >
        <div className="confirmacion-icono">
          <img src={icono} alt="" aria-hidden="true" />
        </div>

        <div className="confirmacion-contenido">
          <h3 id="confirmacion-titulo">{titulo}</h3>
          <p id="confirmacion-mensaje">{mensaje}</p>
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
            <img
              src="/illustrations/eliminar.png"
              alt=""
              aria-hidden="true"
            />
            <span>{textoConfirmar}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Confirmacion;
