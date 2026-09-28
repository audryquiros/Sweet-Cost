import { useEffect, useMemo, useState } from "react";
import { getPedidos } from "../../services/pedidoServices";
import "./Calendario.css";
import Icon from "../../components/common/Icon/Icon";

const VISTAS = ["Mes", "Semana", "Día"];
const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const ESTADO_CLASE = {
  Pendiente: "pendiente",
  "En preparación": "preparacion",
  Listo: "listo",
  Entregado: "entregado",
  Cancelado: "cancelado",
};

function fechaLocal(valor) {
  if (!valor) return null;
  const texto = String(valor);
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    const [year, month, day] = texto.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  const fecha = new Date(texto);
  return Number.isNaN(fecha.getTime()) ? null : new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

function fechaClave(fecha) {
  if (!fecha) return "";
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatearHora(hora) {
  if (!hora) return "Sin hora";
  const [hours, minutes] = String(hora).split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return hora;
  const periodo = hours >= 12 ? "PM" : "AM";
  const hora12 = hours % 12 || 12;
  return `${hora12}:${String(minutes).padStart(2, "0")} ${periodo}`;
}

function formatearFechaCompleta(fecha) {
  return fecha.toLocaleDateString("es-CR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function inicioSemana(fecha) {
  const resultado = new Date(fecha);
  const dia = resultado.getDay();
  const diferencia = dia === 0 ? -6 : 1 - dia;
  resultado.setDate(resultado.getDate() + diferencia);
  resultado.setHours(0, 0, 0, 0);
  return resultado;
}

function construirDiasMes(fecha) {
  const primerDia = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
  const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
  const offset = primerDia.getDay() === 0 ? 6 : primerDia.getDay() - 1;
  const dias = [];

  for (let index = 0; index < offset; index += 1) {
    const dia = new Date(primerDia);
    dia.setDate(primerDia.getDate() - (offset - index));
    dias.push({ fecha: dia, otroMes: true });
  }

  for (let diaNumero = 1; diaNumero <= ultimoDia.getDate(); diaNumero += 1) {
    dias.push({ fecha: new Date(fecha.getFullYear(), fecha.getMonth(), diaNumero), otroMes: false });
  }

  while (dias.length % 7 !== 0) {
    const ultimaFecha = dias[dias.length - 1].fecha;
    const dia = new Date(ultimaFecha);
    dia.setDate(dia.getDate() + 1);
    dias.push({ fecha: dia, otroMes: true });
  }

  return dias;
}

function Calendario() {
  const hoy = useMemo(() => new Date(), []);
  const [pedidos, setPedidos] = useState([]);
  const [fechaActual, setFechaActual] = useState(hoy);
  const [vista, setVista] = useState("Mes");
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;
    getPedidos()
      .then((datos) => {
        if (activo) setPedidos(Array.isArray(datos) ? datos : []);
      })
      .catch((err) => {
        if (activo) setError(err.message || "No se pudieron cargar las entregas.");
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const pedidosConFecha = useMemo(
    () => pedidos.filter((pedido) => pedido.fechaEntrega),
    [pedidos],
  );

  const pedidosPorFecha = useMemo(() => {
    const mapa = {};
    pedidosConFecha.forEach((pedido) => {
      const clave = String(pedido.fechaEntrega).slice(0, 10);
      if (!mapa[clave]) mapa[clave] = [];
      mapa[clave].push(pedido);
    });

    Object.values(mapa).forEach((lista) => {
      lista.sort((a, b) => String(a.horaEntrega || "99:99").localeCompare(String(b.horaEntrega || "99:99")));
    });
    return mapa;
  }, [pedidosConFecha]);

  const cambiarPeriodo = (direccion) => {
    setFechaActual((actual) => {
      const siguiente = new Date(actual);
      if (vista === "Mes") siguiente.setMonth(siguiente.getMonth() + direccion);
      if (vista === "Semana") siguiente.setDate(siguiente.getDate() + (direccion * 7));
      if (vista === "Día") siguiente.setDate(siguiente.getDate() + direccion);
      return siguiente;
    });
  };

  const irHoy = () => setFechaActual(new Date());

  const seleccionarDia = (fecha) => {
    setFechaActual(fecha);
    setVista("Día");
  };

  const pedidosDelDia = (fecha) => pedidosPorFecha[fechaClave(fecha)] || [];

  const diasMes = useMemo(() => construirDiasMes(fechaActual), [fechaActual]);

  const diasSemana = useMemo(() => {
    const inicio = inicioSemana(fechaActual);
    return Array.from({ length: 7 }, (_, index) => {
      const fecha = new Date(inicio);
      fecha.setDate(inicio.getDate() + index);
      return fecha;
    });
  }, [fechaActual]);

  const encabezadoPeriodo = useMemo(() => {
    if (vista === "Mes") return `${MESES[fechaActual.getMonth()]} ${fechaActual.getFullYear()}`;
    if (vista === "Día") return formatearFechaCompleta(fechaActual);

    const inicio = diasSemana[0];
    const fin = diasSemana[6];
    if (inicio.getMonth() === fin.getMonth()) {
      return `${inicio.getDate()} – ${fin.getDate()} de ${MESES[fin.getMonth()]} ${fin.getFullYear()}`;
    }
    return `${inicio.getDate()} ${MESES[inicio.getMonth()].slice(0, 3)} – ${fin.getDate()} ${MESES[fin.getMonth()].slice(0, 3)} ${fin.getFullYear()}`;
  }, [vista, fechaActual, diasSemana]);

  if (cargando) {
    return <main className="calendario-page"><div className="calendario-cargando">Cargando calendario...</div></main>;
  }

  return (
    <main className="calendario-page">
      <header className="calendario-header">
        <div>
          <h1>Calendario de entregas</h1>
          <p>Organiza las fechas y horarios de entrega de tus pedidos.</p>
        </div>
      </header>

      {error && <div className="calendario-error">{error}</div>}

      <section className="calendario-toolbar">
        <button type="button" className="calendario-hoy" onClick={irHoy}><Icon type="calendar" size={15} /> Hoy</button>
        <div className="calendario-navegacion">
          <button type="button" onClick={() => cambiarPeriodo(-1)} aria-label="Periodo anterior"><span aria-hidden="true">‹</span></button>
          <h2>{encabezadoPeriodo}</h2>
          <button type="button" onClick={() => cambiarPeriodo(1)} aria-label="Periodo siguiente"><span aria-hidden="true">›</span></button>
        </div>
        <div className="calendario-vistas" role="tablist" aria-label="Vista del calendario">
          {VISTAS.map((opcion) => (
            <button
              key={opcion}
              type="button"
              className={vista === opcion ? "activo" : ""}
              onClick={() => setVista(opcion)}
              role="tab"
              aria-selected={vista === opcion}
            >
              {opcion === "Mes" && <Icon type="calendar" size={14} />}
              {opcion === "Semana" && <Icon type="dashboard" size={14} />}
              {opcion === "Día" && <Icon type="profile" size={14} />}
              <span>{opcion}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="calendario-meta">
        <div className="calendario-leyenda" aria-label="Estados de los pedidos">
          <span><i className="leyenda-dot pendiente" /> Pendiente</span>
          <span><i className="leyenda-dot preparacion" /> En preparación</span>
          <span><i className="leyenda-dot listo" /> Listo</span>
          <span><i className="leyenda-dot entregado" /> Entregado</span>
          <span><i className="leyenda-dot cancelado" /> Cancelado</span>
        </div>
        <span className="calendario-contador">
          {pedidosConFecha.length} {pedidosConFecha.length === 1 ? "entrega programada" : "entregas programadas"}
        </span>
      </div>

      {pedidosConFecha.length === 0 && (
        <div className="calendario-aviso">
          <span className="calendario-aviso-icon"><Icon type="orders" size={13} /></span>
          <div>
            <strong>No hay entregas programadas todavía</strong>
            <p>Cuando conviertas una cotización aceptada en pedido y le asignes una fecha y hora de entrega, aparecerá automáticamente en este calendario.</p>
          </div>
        </div>
      )}

      <>
          {vista === "Mes" && (
            <section className="calendario-mes" aria-label="Calendario mensual">
              <div className="calendario-dias-semana">
                {DIAS.map((dia) => <span key={dia}>{dia}</span>)}
              </div>
              <div className="calendario-grid" style={{ gridTemplateRows: `repeat(${diasMes.length / 7}, minmax(0, 1fr))` }}>
                {diasMes.map(({ fecha, otroMes }) => {
                  const clave = fechaClave(fecha);
                  const pedidosDia = pedidosPorFecha[clave] || [];
                  const esHoy = clave === fechaClave(hoy);
                  return (
                    <article
                      key={clave}
                      className={`calendario-celda${otroMes ? " otro-mes" : ""}${esHoy ? " hoy" : ""}`}
                      onDoubleClick={() => seleccionarDia(fecha)}
                    >
                      <button type="button" className="calendario-numero" onClick={() => seleccionarDia(fecha)}>{fecha.getDate()}</button>
                      <div className="calendario-eventos">
                        {pedidosDia.slice(0, 3).map((pedido) => (
                          <button
                            key={pedido.id}
                            type="button"
                            className={`calendario-evento ${ESTADO_CLASE[pedido.estado] || "pendiente"}`}
                            onClick={() => setPedidoSeleccionado(pedido)}
                            title={`${pedido.cliente || "Cliente"} · ${formatearHora(pedido.horaEntrega)}`}
                          >
                            <strong>{pedido.horaEntrega ? formatearHora(pedido.horaEntrega) : "Sin hora"}</strong>
                            <span>{pedido.cliente || `Pedido #${pedido.id}`}</span>
                          </button>
                        ))}
                        {pedidosDia.length > 3 && <span className="calendario-mas">+{pedidosDia.length - 3} más</span>}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {vista === "Semana" && (
            <section className="calendario-semana" aria-label="Calendario semanal">
              {diasSemana.map((fecha) => {
                const pedidosDia = pedidosDelDia(fecha);
                return (
                  <article key={fechaClave(fecha)} className={`agenda-dia${fechaClave(fecha) === fechaClave(hoy) ? " hoy" : ""}`}>
                    <header>
                      <span>{DIAS[(fecha.getDay() + 6) % 7]}</span>
                      <strong>{fecha.getDate()}</strong>
                    </header>
                    <div className="agenda-lista">
                      {pedidosDia.length ? pedidosDia.map((pedido) => (
                        <button key={pedido.id} type="button" className={`agenda-evento ${ESTADO_CLASE[pedido.estado] || "pendiente"}`} onClick={() => setPedidoSeleccionado(pedido)}>
                          <span>{formatearHora(pedido.horaEntrega)}</span>
                          <strong>{pedido.cliente || `Pedido #${pedido.id}`}</strong>
                          <small>#{pedido.id}</small>
                        </button>
                      )) : <span className="agenda-sin-eventos">Sin entregas</span>}
                    </div>
                  </article>
                );
              })}
            </section>
          )}

          {vista === "Día" && (
            <section className="calendario-dia" aria-label="Agenda del día">
              <div className="dia-resumen">
                <span>{formatearFechaCompleta(fechaActual)}</span>
                <strong>{pedidosDelDia(fechaActual).length} {pedidosDelDia(fechaActual).length === 1 ? "entrega" : "entregas"}</strong>
              </div>
              <div className="dia-agenda">
                {pedidosDelDia(fechaActual).length ? pedidosDelDia(fechaActual).map((pedido) => (
                  <button key={pedido.id} type="button" className={`dia-evento ${ESTADO_CLASE[pedido.estado] || "pendiente"}`} onClick={() => setPedidoSeleccionado(pedido)}>
                    <span className="dia-hora">{formatearHora(pedido.horaEntrega)}</span>
                    <span className="dia-linea" />
                    <span className="dia-info"><strong>{pedido.cliente || `Pedido #${pedido.id}`}</strong><small>Pedido #{pedido.id} · {pedido.cotizacionNombre || "Cotización"}</small></span>
                    <span className="dia-estado">{pedido.estado}</span>
                  </button>
                )) : (
                  <div className="dia-sin-eventos">No hay entregas programadas para este día.</div>
                )}
              </div>
            </section>
          )}
      </>

      {pedidoSeleccionado && (
        <div className="calendario-modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && setPedidoSeleccionado(null)}>
          <section className="calendario-modal" role="dialog" aria-modal="true" aria-labelledby="calendario-detalle-title">
            <header>
              <div>
                <span>Pedido #{pedidoSeleccionado.id}</span>
                <h2 id="calendario-detalle-title">{pedidoSeleccionado.cliente || "Cliente"}</h2>
              </div>
              <button type="button" onClick={() => setPedidoSeleccionado(null)} aria-label="Cerrar detalle">×</button>
            </header>
            <div className="calendario-detalle-grid">
              <div><span>Entrega</span><strong>{formatearFechaCompleta(fechaLocal(pedidoSeleccionado.fechaEntrega))}</strong></div>
              <div><span>Hora</span><strong>{formatearHora(pedidoSeleccionado.horaEntrega)}</strong></div>
              <div><span>Cotización</span><strong>{pedidoSeleccionado.cotizacionNombre || "-"}</strong></div>
              <div><span>Estado</span><strong>{pedidoSeleccionado.estado}</strong></div>
              <div><span>Total</span><strong>₡{Number(pedidoSeleccionado.precioSugerido || 0).toLocaleString("es-CR", { minimumFractionDigits: 2 })}</strong></div>
              <div><span>Saldo</span><strong>₡{Number(pedidoSeleccionado.saldo || 0).toLocaleString("es-CR", { minimumFractionDigits: 2 })}</strong></div>
            </div>
            {pedidoSeleccionado.observaciones && <div className="calendario-detalle-observaciones"><span>Observaciones</span><p>{pedidoSeleccionado.observaciones}</p></div>}
          </section>
        </div>
      )}
    </main>
  );
}

export default Calendario;
