import { useEffect, useMemo, useState } from "react";
import { getProductos } from "../../../services/productoServices";
import "./PedidosForm.css";

const ESTADOS = [
  "Pendiente",
  "En preparación",
  "Listo",
  "Entregado",
  "Cancelado",
];

const METODOS_PAGO = [
  "Sin definir",
  "Efectivo",
  "SINPE Móvil",
  "Transferencia",
  "Tarjeta",
];

const obtenerPrecioProducto = (producto) => {
  const precio = Number(
    producto?.precioVenta ??
      producto?.precioSugerido ??
      producto?.precioPorPresentacion ??
      0,
  );

  return Number.isFinite(precio) ? precio : 0;
};

const fechaLocal = (dias = 0) => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString().slice(0, 10);
};

const estadoInicial = {
  cliente: "",
  telefono: "",
  fecha: fechaLocal(),
  fechaEntrega: fechaLocal(3),
  productoId: "",
  cantidad: 1,
  precioUnitario: 0,
  estado: "Pendiente",
  metodoPago: "Sin definir",
  deposito: 0,
  observaciones: "",
};

function PedidosForm({ pedidoEditar, onGuardar, onCancelar }) {
  const [formulario, setFormulario] = useState(estadoInicial);
  const [productos, setProductos] = useState([]);
  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [errorProductos, setErrorProductos] = useState("");

  useEffect(() => {
    let activo = true;

    const cargarProductos = async () => {
      try {
        setCargandoProductos(true);
        const datos = await getProductos();

        if (activo) {
          setProductos(Array.isArray(datos) ? datos : []);
          setErrorProductos("");
        }
      } catch (error) {
        console.error(error);
        if (activo) {
          setErrorProductos("No se pudieron cargar los productos.");
        }
      } finally {
        if (activo) {
          setCargandoProductos(false);
        }
      }
    };

    cargarProductos();

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    if (pedidoEditar) {
      setFormulario({
        ...estadoInicial,
        ...pedidoEditar,
        deposito: Number(pedidoEditar.deposito ?? 0),
        cantidad: Number(pedidoEditar.cantidad ?? 1),
        precioUnitario: Number(pedidoEditar.precioUnitario ?? 0),
      });
    } else {
      setFormulario(estadoInicial);
    }
  }, [pedidoEditar]);

  const productoSeleccionado = useMemo(
    () => productos.find((producto) => String(producto.id) === String(formulario.productoId)),
    [productos, formulario.productoId],
  );

  const total =
    Number(formulario.cantidad || 0) * Number(formulario.precioUnitario || 0);

  const saldo = Math.max(total - Number(formulario.deposito || 0), 0);

  const manejarCambio = (event) => {
    const { name, value } = event.target;

    setFormulario((actual) => ({
      ...actual,
      [name]: ["cantidad", "precioUnitario", "deposito"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const manejarProducto = (event) => {
    const productoId = event.target.value;
    const producto = productos.find(
      (item) => String(item.id) === String(productoId),
    );

    setFormulario((actual) => ({
      ...actual,
      productoId,
      precioUnitario: producto ? obtenerPrecioProducto(producto) : 0,
    }));
  };

  const manejarSubmit = (event) => {
    event.preventDefault();

    if (!formulario.cliente.trim()) {
      return;
    }

    if (!formulario.productoId) {
      return;
    }

    onGuardar({
      ...formulario,
      cliente: formulario.cliente.trim(),
      telefono: formulario.telefono.trim(),
      productoNombre: productoSeleccionado?.nombre || "",
      total,
      saldoPendiente: saldo,
    });
  };

  return (
    <div className="pedido-form-overlay" role="presentation">
      <section
        className="pedido-form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pedido-form-title"
      >
        <div className="pedido-form-header">
          <div>
            <span className="pedido-form-eyebrow">Sweet Cost</span>
            <h2 id="pedido-form-title">
              {pedidoEditar ? "Editar pedido" : "Nuevo pedido"}
            </h2>
            <p>Registra los datos del cliente, producto y entrega.</p>
          </div>
          <button
            className="pedido-form-close"
            type="button"
            onClick={onCancelar}
            aria-label="Cerrar formulario"
          >
            ×
          </button>
        </div>

        <form className="pedido-form" onSubmit={manejarSubmit}>
          <div className="pedido-form-section">
            <h3>Información del cliente</h3>
            <div className="pedido-form-grid">
              <label>
                Cliente *
                <input
                  name="cliente"
                  value={formulario.cliente}
                  onChange={manejarCambio}
                  placeholder="Ej. Ana Torres"
                  required
                />
              </label>

              <label>
                Teléfono
                <input
                  name="telefono"
                  value={formulario.telefono}
                  onChange={manejarCambio}
                  placeholder="8888-8888"
                />
              </label>

              <label>
                Fecha del pedido *
                <input
                  type="date"
                  name="fecha"
                  value={formulario.fecha}
                  onChange={manejarCambio}
                  required
                />
              </label>

              <label>
                Fecha de entrega *
                <input
                  type="date"
                  name="fechaEntrega"
                  value={formulario.fechaEntrega}
                  min={formulario.fecha}
                  onChange={manejarCambio}
                  required
                />
              </label>
            </div>
          </div>

          <div className="pedido-form-section">
            <h3>Detalle del pedido</h3>
            <div className="pedido-form-grid pedido-form-grid--three">
              <label>
                Producto *
                <select
                  name="productoId"
                  value={formulario.productoId}
                  onChange={manejarProducto}
                  required
                  disabled={cargandoProductos}
                >
                  <option value="">
                    {cargandoProductos ? "Cargando..." : "Selecciona un producto"}
                  </option>
                  {productos.map((producto) => (
                    <option key={producto.id} value={producto.id}>
                      {producto.nombre}
                    </option>
                  ))}
                </select>
                {errorProductos && <small className="pedido-form-error">{errorProductos}</small>}
              </label>

              <label>
                Cantidad *
                <input
                  type="number"
                  min="1"
                  name="cantidad"
                  value={formulario.cantidad}
                  onChange={manejarCambio}
                  required
                />
              </label>

              <label>
                Precio unitario *
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="precioUnitario"
                  value={formulario.precioUnitario}
                  onChange={manejarCambio}
                  required
                />
              </label>
            </div>

            <div className="pedido-total-preview">
              <span>Total del pedido</span>
              <strong>
                ₡ {total.toLocaleString("es-CR", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </div>
          </div>

          <div className="pedido-form-section">
            <h3>Entrega y pago</h3>
            <div className="pedido-form-grid pedido-form-grid--three">
              <label>
                Estado
                <select
                  name="estado"
                  value={formulario.estado}
                  onChange={manejarCambio}
                >
                  {ESTADOS.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Método de pago
                <select
                  name="metodoPago"
                  value={formulario.metodoPago}
                  onChange={manejarCambio}
                >
                  {METODOS_PAGO.map((metodo) => (
                    <option key={metodo} value={metodo}>
                      {metodo}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Depósito
                <input
                  type="number"
                  min="0"
                  max={total}
                  step="0.01"
                  name="deposito"
                  value={formulario.deposito}
                  onChange={manejarCambio}
                />
              </label>
            </div>

            <label className="pedido-form-full">
              Observaciones
              <textarea
                name="observaciones"
                value={formulario.observaciones}
                onChange={manejarCambio}
                rows="3"
                placeholder="Indicaciones especiales, decoración, horario de entrega, etc."
              />
            </label>
          </div>

          <div className="pedido-form-summary">
            <div>
              <span>Total</span>
              <strong>₡ {total.toLocaleString("es-CR")}</strong>
            </div>
            <div>
              <span>Saldo pendiente</span>
              <strong>₡ {saldo.toLocaleString("es-CR")}</strong>
            </div>
          </div>

          <div className="pedido-form-actions">
            <button type="button" className="pedido-btn-secondary" onClick={onCancelar}>
              Cancelar
            </button>
            <button type="submit" className="pedido-btn-primary">
              {pedidoEditar ? "Guardar cambios" : "Guardar pedido"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default PedidosForm;
