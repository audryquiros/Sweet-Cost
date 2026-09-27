import { useState } from "react";
import { createPedido } from "../../../services/pedidoServices";
import { updateCotizacion } from "../../../services/cotizadorServices";
import "./ConvertirPedidoModal.css";

function ConvertirPedidoModal({ cotizacion, onCreado, onCancelar }) {
  const [formulario, setFormulario] = useState({
    cliente: cotizacion.cliente || "",
    telefono: cotizacion.telefono || "",
    fechaEntrega: "",
    metodoPago: "",
    deposito: "0",
    observaciones: cotizacion.observaciones || "",
  });
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const total = Number(cotizacion.precioSugerido || 0);
  const deposito = Number(formulario.deposito || 0);
  const saldo = Math.max(total - deposito, 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario((actual) => ({ ...actual, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formulario.cliente.trim()) {
      setError("Debes ingresar el nombre del cliente.");
      return;
    }

    if (!formulario.fechaEntrega) {
      setError("Debes indicar la fecha de entrega.");
      return;
    }

    if (deposito < 0 || deposito > total) {
      setError("El depósito debe estar entre ₡0 y el total del pedido.");
      return;
    }

    try {
      setGuardando(true);

      const pedido = {
        cotizacionId: cotizacion.id,
        cotizacionNombre: cotizacion.nombre,
        cliente: formulario.cliente.trim(),
        telefono: formulario.telefono.trim(),
        recetaId: cotizacion.recetaId,
        recetaNombre: cotizacion.recetaNombre,
        cantidadAVender: cotizacion.cantidadAVender,
        unidadesIncluidas: cotizacion.unidadesIncluidas,
        cantidadTotalProductos: cotizacion.cantidadTotalProductos,
        extrasModo: cotizacion.extrasModo,
        toppings: cotizacion.toppings || [],
        salsas: cotizacion.salsas || [],
        extras: cotizacion.extras || [],
        insumos: cotizacion.insumos || [],
        costoTotal: cotizacion.costoTotal || 0,
        precioSugerido: total,
        deposito,
        saldo,
        fechaPedido: new Date().toISOString(),
        fechaEntrega: formulario.fechaEntrega,
        metodoPago: formulario.metodoPago,
        estado: "Pendiente",
        observaciones: formulario.observaciones.trim(),
      };

      const nuevoPedido = await createPedido(pedido);

      const cotizacionActualizada = {
        ...cotizacion,
        estado: "Aceptada",
        pedidoId: nuevoPedido.id,
        cliente: formulario.cliente.trim(),
        telefono: formulario.telefono.trim(),
      };

      await updateCotizacion(cotizacion.id, cotizacionActualizada);
      onCreado(nuevoPedido, cotizacionActualizada);
    } catch (err) {
      setError(err.message || "No se pudo convertir la cotización en pedido.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="convertir-pedido-overlay" onMouseDown={(e) => e.target === e.currentTarget && onCancelar()}>
      <div className="convertir-pedido-modal">
        <div className="convertir-pedido-header">
          <div>
            <span className="convertir-pedido-label">Nueva orden desde cotización</span>
            <h2>Convertir en pedido</h2>
            <p>{cotizacion.nombre}</p>
          </div>
          <button type="button" className="convertir-pedido-cerrar" onClick={onCancelar}>×</button>
        </div>

        <div className="convertir-pedido-resumen">
          <div><span>Receta</span><strong>{cotizacion.recetaNombre || "-"}</strong></div>
          <div><span>Cantidad</span><strong>{cotizacion.cantidadAVender || 0}</strong></div>
          <div><span>Total</span><strong>₡{total.toFixed(2)}</strong></div>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="convertir-pedido-error">{error}</div>}

          <div className="convertir-pedido-grid">
            <div className="convertir-pedido-field">
              <label htmlFor="cliente">Cliente *</label>
              <input id="cliente" name="cliente" value={formulario.cliente} onChange={handleChange} placeholder="Nombre del cliente" />
            </div>
            <div className="convertir-pedido-field">
              <label htmlFor="telefono">Teléfono</label>
              <input id="telefono" name="telefono" value={formulario.telefono} onChange={handleChange} placeholder="8888-8888" />
            </div>
            <div className="convertir-pedido-field">
              <label htmlFor="fechaEntrega">Fecha de entrega *</label>
              <input id="fechaEntrega" name="fechaEntrega" type="date" value={formulario.fechaEntrega} onChange={handleChange} />
            </div>
            <div className="convertir-pedido-field">
              <label htmlFor="metodoPago">Método de pago</label>
              <select id="metodoPago" name="metodoPago" value={formulario.metodoPago} onChange={handleChange}>
                <option value="">Seleccionar</option>
                <option value="Efectivo">Efectivo</option>
                <option value="SINPE">SINPE</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Tarjeta">Tarjeta</option>
              </select>
            </div>
            <div className="convertir-pedido-field">
              <label htmlFor="deposito">Depósito</label>
              <input id="deposito" name="deposito" type="number" min="0" max={total} step="0.01" value={formulario.deposito} onChange={handleChange} />
            </div>
            <div className="convertir-pedido-field convertir-pedido-field-full">
              <label>Saldo pendiente</label>
              <div className="convertir-pedido-saldo">₡{saldo.toFixed(2)}</div>
            </div>
            <div className="convertir-pedido-field convertir-pedido-field-full">
              <label htmlFor="observaciones">Observaciones</label>
              <textarea id="observaciones" name="observaciones" rows="3" value={formulario.observaciones} onChange={handleChange} placeholder="Detalles importantes para la preparación o entrega" />
            </div>
          </div>

          <div className="convertir-pedido-actions">
            <button type="button" className="convertir-pedido-secundario" onClick={onCancelar}>Cancelar</button>
            <button type="submit" className="convertir-pedido-principal" disabled={guardando}>
              {guardando ? "Creando pedido..." : "Crear pedido"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ConvertirPedidoModal;
