import { useEffect, useRef, useState } from "react";
import { createPedido } from "../../../services/pedidoServices";
import { updateCotizacion } from "../../../services/cotizadorServices";
import FilterSelect from "../../common/FilterSelect";
import "./ConvertirPedidoModal.css";


const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const DIAS = ["LU", "MA", "MI", "JU", "VI", "SA", "DO"];

function toLocalDate(value) {
  if (!value) return new Date();
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function DatePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [monthDate, setMonthDate] = useState(() => toLocalDate(value));
  const ref = useRef(null);

  useEffect(() => {
    if (value) setMonthDate(toLocalDate(value));
  }, [value]);

  useEffect(() => {
    const handleOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const previousDays = new Date(monthDate.getFullYear(), monthDate.getMonth(), 0).getDate();
  const cells = [];

  for (let i = startOffset - 1; i >= 0; i -= 1) {
    cells.push({ day: previousDays - i, outside: true, date: new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, previousDays - i) });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ day, outside: false, date: new Date(monthDate.getFullYear(), monthDate.getMonth(), day) });
  }
  let nextDay = 1;
  while (cells.length < 42) {
    cells.push({ day: nextDay, outside: true, date: new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, nextDay) });
    nextDay += 1;
  }

  const todayValue = toDateValue(new Date());
  const displayValue = value
    ? `${value.slice(8, 10)}/${value.slice(5, 7)}/${value.slice(0, 4)}`
    : "dd/mm/aaaa";

  return (
    <div className={`sc-date-picker ${open ? "is-open" : ""}`} ref={ref}>
      <button
        type="button"
        className={`sc-picker-trigger ${value ? "has-value" : ""}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{displayValue}</span>
        <img
          className="sc-picker-icon"
          src="/illustrations/calendario.png"
          alt=""
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="sc-picker-popover sc-date-popover" role="dialog" aria-label="Seleccionar fecha">
          <div className="sc-date-header">
            <strong>{MESES[monthDate.getMonth()]} de {monthDate.getFullYear()}</strong>
            <div className="sc-date-nav">
              <button type="button" aria-label="Mes anterior" onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1))}>‹</button>
              <button type="button" aria-label="Mes siguiente" onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1))}>›</button>
            </div>
          </div>
          <div className="sc-date-weekdays">
            {DIAS.map((dia) => <span key={dia}>{dia}</span>)}
          </div>
          <div className="sc-date-grid">
            {cells.map((cell, index) => {
              const cellValue = toDateValue(cell.date);
              const selected = cellValue === value;
              const today = cellValue === todayValue;
              return (
                <button
                  key={`${cellValue}-${index}`}
                  type="button"
                  className={`sc-date-day ${cell.outside ? "outside" : ""} ${selected ? "selected" : ""} ${today ? "today" : ""}`}
                  onClick={() => {
                    onChange(cellValue);
                    setMonthDate(cell.date);
                    setOpen(false);
                  }}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
          <div className="sc-date-footer">
            <button type="button" onClick={() => { onChange(""); setOpen(false); }}>Borrar</button>
            <button type="button" onClick={() => { const today = new Date(); onChange(toDateValue(today)); setMonthDate(today); setOpen(false); }}>Hoy</button>
          </div>
        </div>
      )}
    </div>
  );
}

function TimePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // El valor se sigue almacenando internamente como HH:mm (24 h),
  // pero la interfaz utiliza el formato de 12 horas con AM/PM.
  const [storedHour, storedMinute] = value ? value.split(":") : ["", ""];
  const parsedHour = storedHour !== "" ? Number(storedHour) : null;
  const displayHour = parsedHour === null ? "" : String(parsedHour % 12 || 12);
  const period = parsedHour === null ? "" : parsedHour >= 12 ? "PM" : "AM";
  const minute = storedMinute || "";

  const hours = Array.from({ length: 12 }, (_, index) => String(index + 1));
  const minutes = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, "0"));
  const periods = ["AM", "PM"];

  useEffect(() => {
    const handleOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const to24Hour = (hour12, nextPeriod) => {
    const hourNumber = Number(hour12);
    if (nextPeriod === "PM") return String(hourNumber === 12 ? 12 : hourNumber + 12).padStart(2, "0");
    return String(hourNumber === 12 ? 0 : hourNumber).padStart(2, "0");
  };

  const setPart = (nextHour = displayHour, nextMinute = minute || "00", nextPeriod = period || "AM") => {
    if (nextHour && nextMinute && nextPeriod) {
      onChange(`${to24Hour(nextHour, nextPeriod)}:${nextMinute}`);
    }
  };

  const displayValue = value ? `${displayHour}:${minute} ${period}` : "--:-- --";

  return (
    <div className={`sc-time-picker ${open ? "is-open" : ""}`} ref={ref}>
      <button
        type="button"
        className={`sc-picker-trigger ${value ? "has-value" : ""}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{displayValue}</span>
        <img
          className="sc-picker-icon"
          src="/illustrations/reloj.png"
          alt=""
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="sc-picker-popover sc-time-popover" role="dialog" aria-label="Seleccionar hora">
          <div className="sc-time-title">Selecciona una hora</div>
          <div className="sc-time-columns">
            <div className="sc-time-column">
              <span className="sc-time-column-label">Hora</span>
              <div className="sc-time-options">
                {hours.map((item) => (
                  <button key={item} type="button" className={item === displayHour ? "selected" : ""} onClick={() => setPart(item, minute || "00", period || "AM")}>{item}</button>
                ))}
              </div>
            </div>
            <div className="sc-time-column">
              <span className="sc-time-column-label">Minutos</span>
              <div className="sc-time-options">
                {minutes.map((item) => (
                  <button key={item} type="button" className={item === minute ? "selected" : ""} onClick={() => setPart(displayHour || "12", item, period || "AM")}>{item}</button>
                ))}
              </div>
            </div>
            <div className="sc-time-column sc-time-period-column">
              <span className="sc-time-column-label">Periodo</span>
              <div className="sc-time-options sc-time-period-options">
                {periods.map((item) => (
                  <button key={item} type="button" className={item === period ? "selected" : ""} onClick={() => setPart(displayHour || "12", minute || "00", item)}>{item}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="sc-time-footer">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Borrar
            </button>

            <div className="sc-time-footer-actions">
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const roundedMinutes = Math.floor(now.getMinutes() / 5) * 5;

                  onChange(
                    `${String(now.getHours()).padStart(2, "0")}:${String(
                      roundedMinutes
                    ).padStart(2, "0")}`
                  );

                  setOpen(false);
                }}
              >
                Ahora
              </button>

              <button
                type="button"
                className="sc-time-done"
                onClick={() => setOpen(false)}
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ConvertirPedidoModal({ cotizacion, onCreado, onCancelar }) {
  const [formulario, setFormulario] = useState({
    cliente: cotizacion.cliente || "",
    telefono: cotizacion.telefono || "",
    fechaEntrega: "",
    horaEntrega: "",
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

    if (!formulario.horaEntrega) {
      setError("Debes indicar la hora de entrega.");
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
        horaEntrega: formulario.horaEntrega,
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
              <label htmlFor="cliente" className="convertir-pedido-label-with-icon">
                <img src="/illustrations/perfil.png" alt="" aria-hidden="true" />
                <span>Cliente *</span>
              </label>
              <input id="cliente" name="cliente" value={formulario.cliente} onChange={handleChange} placeholder="Nombre del cliente" />
            </div>
            <div className="convertir-pedido-field">
              <label htmlFor="telefono" className="convertir-pedido-label-with-icon">
                <img src="/illustrations/telefono.png" alt="" aria-hidden="true" />
                <span>Teléfono</span>
              </label>
              <input id="telefono" name="telefono" value={formulario.telefono} onChange={handleChange} placeholder="8888-8888" />
            </div>
            <div className="convertir-pedido-field">
              <label className="convertir-pedido-label-with-icon">
                <img src="/illustrations/calendario.png" alt="" aria-hidden="true" />
                <span>Fecha de entrega *</span>
              </label>
              <DatePicker
                value={formulario.fechaEntrega}
                onChange={(value) => setFormulario((actual) => ({ ...actual, fechaEntrega: value }))}
              />
            </div>
            <div className="convertir-pedido-field">
              <label className="convertir-pedido-label-with-icon">
                <img src="/illustrations/reloj.png" alt="" aria-hidden="true" />
                <span>Hora de entrega *</span>
              </label>
              <TimePicker
                value={formulario.horaEntrega}
                onChange={(value) => setFormulario((actual) => ({ ...actual, horaEntrega: value }))}
              />
            </div>
            <FilterSelect
              id="metodoPago"
              label={<span className="convertir-pedido-select-label-with-icon"><img src="/illustrations/billetera.png" alt="" aria-hidden="true" /><span>Método de pago</span></span>}
              value={formulario.metodoPago}
              options={[
                { valor: "", nombre: "Seleccionar" },
                { valor: "Efectivo", nombre: "Efectivo" },
                { valor: "SINPE", nombre: "SINPE" },
                { valor: "Transferencia", nombre: "Transferencia" },
                { valor: "Tarjeta", nombre: "Tarjeta" },
              ]}
              onChange={(value) => setFormulario((actual) => ({ ...actual, metodoPago: value }))}
              className="convertir-pedido-select"
            />
            <div className="convertir-pedido-field">
              <label htmlFor="deposito" className="convertir-pedido-label-with-icon">
                <img src="/illustrations/moneda.png" alt="" aria-hidden="true" />
                <span>Depósito</span>
              </label>
              <input id="deposito" name="deposito" type="number" min="0" max={total} step="0.01" value={formulario.deposito} onChange={handleChange} />
            </div>
            <div className="convertir-pedido-field convertir-pedido-field-full">
              <label className="convertir-pedido-label-with-icon">
                <img src="/illustrations/moneda.png" alt="" aria-hidden="true" />
                <span>Saldo pendiente</span>
              </label>
              <div className="convertir-pedido-saldo">₡{saldo.toFixed(2)}</div>
            </div>
            <div className="convertir-pedido-field convertir-pedido-field-full">
              <label htmlFor="observaciones" className="convertir-pedido-label-with-icon">
                <img src="/illustrations/recibo.png" alt="" aria-hidden="true" />
                <span>Observaciones</span>
              </label>
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
