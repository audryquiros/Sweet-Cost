import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getProductos } from "../../services/productoServices";
import { getInsumos } from "../../services/insumoServices";
import { getCotizaciones } from "../../services/cotizadorServices";
import { getPedidos } from "../../services/pedidoServices";
import { getEmpleados } from "../../services/empleadoServices";
import { getAsistencias, registrarIngreso, registrarSalida } from "../../services/asistenciaServices";
import { useAuth } from "../../context/authContext";
import { getNegocioActivo } from "../../context/negocioContext";
import { obtenerProyeccionIA } from "../../services/aiServices";
import "./Home.css";

const money = (value) => `₡${Number(value || 0).toLocaleString("es-CR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const money2 = (value) => `₡${Number(value || 0).toLocaleString("es-CR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const date = (value) => { if (!value) return "Sin fecha"; const d = new Date(`${String(value).slice(0,10)}T12:00:00`); return Number.isNaN(d.getTime()) ? "Sin fecha" : d.toLocaleDateString("es-CR", { day:"2-digit", month:"short" }).replace(".",""); };
const time12 = (value) => { if (!value) return ""; const [hh, mm] = String(value).split(":").map(Number); if (Number.isNaN(hh)) return value; return `${hh % 12 || 12}:${String(mm || 0).padStart(2,"0")} ${hh >= 12 ? "PM" : "AM"}`; };
const monthKey = (value) => { const d = new Date(value); return Number.isNaN(d.getTime()) ? null : `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; };
const monthLabel = (key) => { const [year, month] = key.split("-").map(Number); return new Date(year, month-1, 1).toLocaleDateString("es-CR", { month:"short" }).replace(".",""); };
const weekStart = (value) => { const d = new Date(value); d.setHours(0,0,0,0); const day = d.getDay(); d.setDate(d.getDate() - (day === 0 ? 6 : day - 1)); return d; };

function Home() {
  const { usuario } = useAuth();
  const [negocio, setNegocio] = useState(() => getNegocioActivo());
  const [productos, setProductos] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [periodoProyeccion, setPeriodoProyeccion] = useState("mensual");
  const [proyeccionIA, setProyeccionIA] = useState(null);
  const [proyeccionIALoading, setProyeccionIALoading] = useState(false);
  const [proyeccionIAError, setProyeccionIAError] = useState("");
  const [periodoEntregas, setPeriodoEntregas] = useState("semanal");
  const [asistencias, setAsistencias] = useState([]);
  const [guardandoAsistencia, setGuardandoAsistencia] = useState(false);
  const esAdmin = usuario?.rol === "administrador";

  useEffect(() => {
    const negocioSesion = getNegocioActivo();
    setNegocio(negocioSesion);

    const change = (event) => event.detail && setNegocio(event.detail);
    window.addEventListener("sweetcost-negocio-cambio", change);
    return () => window.removeEventListener("sweetcost-negocio-cambio", change);
  }, [usuario?.id, usuario?.negocioId, usuario?.negocioIds]);

  const cargar = async () => {
    try {
      setCargando(true); setError("");
      const requests = [getProductos(), getInsumos(), getCotizaciones(), getPedidos()];
      if (esAdmin) requests.push(getEmpleados());
      const [productosData, insumosData, cotizacionesData, pedidosData, empleadosData = []] = await Promise.all(requests);
      setProductos(productosData); setInsumos(insumosData); setCotizaciones(cotizacionesData); setPedidos(pedidosData); setEmpleados(empleadosData);
    } catch (err) { setError(err.message || "No se pudo cargar toda la información del dashboard."); }
    finally { setCargando(false); }
  };

  useEffect(() => { cargar(); }, [negocio?.id, esAdmin]);
  useEffect(() => { const refresh = () => cargar(); window.addEventListener("sweetcost-datos-cambio", refresh); return () => window.removeEventListener("sweetcost-datos-cambio", refresh); }, [negocio?.id, esAdmin]);

  useEffect(() => {
    if (esAdmin || !usuario?.id) return;
    const cargarAsistencia = async () => {
      try { setAsistencias(await getAsistencias()); } catch { setAsistencias([]); }
    };
    cargarAsistencia();
    const refresh = () => cargarAsistencia();
    window.addEventListener("sweetcost-datos-cambio", refresh);
    return () => window.removeEventListener("sweetcost-datos-cambio", refresh);
  }, [esAdmin, usuario?.id, negocio?.id]);

  const fechaHoy = () => { const ahora = new Date(); return `${ahora.getFullYear()}-${String(ahora.getMonth()+1).padStart(2,"0")}-${String(ahora.getDate()).padStart(2,"0")}`; };
  const miAsistenciaHoy = asistencias.find((item) => item.empleadoId === usuario?.id && item.fecha === fechaHoy());
  const horaAsistencia = (value) => value ? new Date(value).toLocaleTimeString("es-CR", { hour: "numeric", minute: "2-digit" }) : "—";
  const registrarMiEntrada = async () => {
    try {
      setGuardandoAsistencia(true);
      const nuevo = await registrarIngreso({ empleadoId: usuario.id, empleadoNombre: usuario.nombre });
      setAsistencias((actuales) => actuales.some((item) => item.id === nuevo.id) ? actuales.map((item) => item.id === nuevo.id ? nuevo : item) : [...actuales, nuevo]);
      window.dispatchEvent(new CustomEvent("sweetcost-datos-cambio"));
    } catch (err) {
      setError(err.message || "No se pudo registrar tu entrada.");
    } finally {
      setGuardandoAsistencia(false);
    }
  };
  const registrarMiSalida = async () => {
    if (!miAsistenciaHoy) return;
    try {
      setGuardandoAsistencia(true);
      const actualizado = await registrarSalida(miAsistenciaHoy.id);
      setAsistencias((actuales) => actuales.map((item) => item.id === actualizado.id ? actualizado : item));
      window.dispatchEvent(new CustomEvent("sweetcost-datos-cambio"));
    } catch (err) {
      setError(err.message || "No se pudo registrar tu salida.");
    } finally {
      setGuardandoAsistencia(false);
    }
  };

  const pedidosActivos = useMemo(() => pedidos.filter((p) => !["Cancelado", "Entregado", "Pagado"].includes(p.estado)), [pedidos]);
  // Una venta realizada solo entra en los KPI financieros cuando el pedido
  // ya fue entregado o pagado. Los pedidos pendientes se muestran aparte.
  const pedidosReales = useMemo(
    () => pedidos.filter((p) => ["Entregado", "Pagado"].includes(String(p.estado || ""))),
    [pedidos]
  );
  const ventas = useMemo(() => pedidosReales.reduce((s,p) => s + Number(p.precioSugerido || p.total || 0), 0), [pedidosReales]);
  const costos = useMemo(() => pedidosReales.reduce((s,p) => s + Number(p.costoTotal || 0), 0), [pedidosReales]);
  const ganancia = ventas - costos;
  const perdidasCanceladas = useMemo(() => pedidos.filter((p) => p.estado === "Cancelado").reduce((s,p) => s + Number(p.costoTotal || 0), 0), [pedidos]);
  const pedidosPendientes = pedidos.filter((p) => !["Entregado", "Pagado", "Cancelado"].includes(p.estado)).length;
  const cotizacionesPendientes = cotizaciones.filter((c) => !["Aceptada","Convertida","Rechazada"].includes(c.estado));
  const stockRiesgo = useMemo(() => insumos.filter((i) => Number(i.cantidad || 0) <= 15).sort((a,b) => Number(a.cantidad||0)-Number(b.cantidad||0)), [insumos]);
  const stockPeligro = stockRiesgo.filter((i) => Number(i.cantidad || 0) <= 5);

  const pedidosPorEstado = useMemo(() => ["Pendiente","En preparación","Listo","Entregado","Cancelado"].map((estado) => ({ estado, cantidad: pedidos.filter((p) => String(p.estado||"").toLowerCase() === estado.toLowerCase()).length })), [pedidos]);

  const ventasPorSemana = useMemo(() => {
    const current = weekStart(new Date());
    const weeks = Array.from({length:4},(_,index)=>{ const inicio=new Date(current); inicio.setDate(inicio.getDate()-(3-index)*7); return {inicio, valor:0}; });
    pedidosReales.forEach((p)=>{ const d = new Date(p.fechaPedido || p.fecha || p.fechaEntrega); if(Number.isNaN(d.getTime())) return; const w=weekStart(d); const target=weeks.find((x)=>x.inicio.getTime()===w.getTime()); if(target) target.valor += Number(p.precioSugerido||p.total||0); });
    const max=Math.max(...weeks.map(x=>x.valor),1);
    return weeks.map(x=>({...x, porcentaje:Math.max(7,Math.round(x.valor/max*100)), etiqueta:x.inicio.toLocaleDateString("es-CR",{day:"2-digit",month:"short"}).replace(".","")}));
  }, [pedidosReales]);

  const proximasEntregas = useMemo(() => [...pedidos].filter((p)=>p.fechaEntrega && !["Entregado","Cancelado"].includes(p.estado)).sort((a,b)=>new Date(`${a.fechaEntrega}T${a.horaEntrega||"23:59"}`)-new Date(`${b.fechaEntrega}T${b.horaEntrega||"23:59"}`)).slice(0,4),[pedidos]);

  const historialMensual = useMemo(() => {
    const map = new Map();
    pedidosReales.forEach((p)=>{ const key=monthKey(p.fechaPedido||p.fecha||p.fechaEntrega); if(!key)return; const row=map.get(key)||{key,ventas:0,costos:0}; row.ventas+=Number(p.precioSugerido||p.total||0); row.costos+=Number(p.costoTotal||0); map.set(key,row); });
    const current=new Date(); for(let i=5;i>=0;i--){ const d=new Date(current.getFullYear(),current.getMonth()-i,1); const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; if(!map.has(key)) map.set(key,{key,ventas:0,costos:0}); }
    return [...map.values()].sort((a,b)=>a.key.localeCompare(b.key)).slice(-6).map(x=>({...x,ganancia:x.ventas-x.costos}));
  }, [pedidosReales]);

  const proyeccionBase = useMemo(() => {
    const conDatos = historialMensual.filter(x=>x.ventas>0);
    const base = conDatos.length ? conDatos.reduce((s,x)=>s+x.ventas,0)/conDatos.length : 0;
    const margenPromedio = conDatos.length ? conDatos.reduce((s,x)=>s+x.ganancia,0)/conDatos.length : 0;
    if(periodoProyeccion === "mensual") return {
      ventas:base,
      ganancia:margenPromedio,
      texto:conDatos.length >= 3 ? "Estimación local basada en el historial de ventas." : "Estimación local basada en las ventas disponibles.",
    };
    return {
      ventas:base*12,
      ganancia:margenPromedio*12,
      texto:"Estimación local anualizada a partir del promedio mensual.",
    };
  }, [historialMensual, periodoProyeccion]);

  useEffect(() => {
    if (!esAdmin || !negocio?.id) {
      setProyeccionIA(null);
      setProyeccionIAError("");
      return;
    }

    let cancelado = false;

    const cargarProyeccionIA = async () => {
      setProyeccionIALoading(true);
      setProyeccionIAError("");

      try {
        // n8n debe consultar la fuente de datos configurada para el negocio; React ya usa Supabase.
        // Desde React solo enviamos el negocio que está actualmente seleccionado.
        const data = await obtenerProyeccionIA({
          negocioId: negocio.id,
        });

        if (!cancelado) {
          setProyeccionIA(data);
        }
      } catch (err) {
        if (!cancelado) {
          setProyeccionIA(null);
          setProyeccionIAError(
            err.message || "No se pudo obtener la proyección con IA."
          );
        }
      } finally {
        if (!cancelado) setProyeccionIALoading(false);
      }
    };

    cargarProyeccionIA();

    return () => {
      cancelado = true;
    };
  }, [esAdmin, negocio?.id]);

  const proyeccion = useMemo(() => {
    // n8n devuelve directamente proyeccionMensual/proyeccionAnual.
    const mensual = proyeccionIA?.proyeccionMensual;
    const anual = proyeccionIA?.proyeccionAnual;
    const fuente = periodoProyeccion === "mensual" ? mensual : anual;

    if (!fuente) return proyeccionBase;

    return {
      ventas: Number(
        fuente.ventas ??
          fuente.ingresos ??
          fuente.ventasProyectadas ??
          proyeccionBase.ventas
      ),
      costos: Number(
        fuente.costos ?? proyeccionBase.ventas - proyeccionBase.ganancia
      ),
      ganancia: Number(
        fuente.ganancia ??
          fuente.gananciaProyectada ??
          proyeccionBase.ganancia
      ),
      texto:
        proyeccionIA.analisis ||
        "Proyección calculada con IA a partir del historial y contexto actual del negocio.",
    };
  }, [periodoProyeccion, proyeccionIA, proyeccionBase]);

  const empleadoTop = useMemo(() => {
    const map=new Map();
    const registrar=(item,tipo)=>{
      const id=item.empleadoId || "sin-asignar";
      const nombre=item.empleadoNombre || "Sin responsable";
      const row=map.get(id)||{id,nombre,total:0,cotizaciones:0,pedidos:0};
      row.total++;
      row[tipo]++;
      map.set(id,row);
    };
    cotizaciones.forEach((item)=>registrar(item,"cotizaciones"));
    pedidos.forEach((item)=>registrar(item,"pedidos"));
    return [...map.values()].sort((a,b)=>b.total-a.total)[0] || null;
  }, [cotizaciones,pedidos]);

  const pedidosPropios = useMemo(() => pedidos.filter((p) => p.empleadoId === usuario?.id), [pedidos, usuario?.id]);
  const cotizacionesPropias = useMemo(() => cotizaciones.filter((c) => c.empleadoId === usuario?.id), [cotizaciones, usuario?.id]);

  const maxFinancial = Math.max(...historialMensual.map(x=>Math.max(x.ventas,x.costos)),1);

  if(cargando) return <main className="home-page"><div className="home-loading">Cargando dashboard...</div></main>;

  return (
    <main className="home-page">
      <header className="home-header">
        <div><h1>Dashboard</h1><p>Información clave de {negocio?.nombre || "tu negocio"} para tomar decisiones con mayor claridad.</p></div>
        <div className="home-business-badge"><div className="home-business-logo"><img src={negocio?.imagen || "/logoSC.png"} alt="" /></div><div><strong>{negocio?.nombre || "Negocio activo"}</strong><span>{negocio?.tipo || ""}</span></div></div>
      </header>
      {error && <div className="home-error">{error}</div>}

      {!esAdmin ? (
        <section className="home-employee-dashboard">
          <div className="home-kpis home-kpis--employee">
            <article className="home-kpi"><div className="home-kpi-icon"><img src="/illustrations/cotizaciones-recibo.png" alt=""/></div><span>Mis cotizaciones</span><strong>{cotizacionesPropias.length}</strong><small>{cotizacionesPropias.filter(c=>!["Aceptada","Convertida","Rechazada"].includes(c.estado)).length} pendientes</small></article>
            <article className="home-kpi"><div className="home-kpi-icon"><img src="/illustrations/pedidos-portapapeles.png" alt=""/></div><span>Mis pedidos</span><strong>{pedidosPropios.length}</strong><small>{pedidosPropios.filter(p=>!["Entregado","Cancelado"].includes(p.estado)).length} por atender</small></article>
            <article className="home-kpi"><div className="home-kpi-icon"><img src="/illustrations/calendario.png" alt=""/></div><span>Próximas entregas</span><strong>{pedidosPropios.filter(p=>p.fechaEntrega && !["Entregado","Cancelado"].includes(p.estado)).length}</strong><small>Consulta tu calendario</small></article>
          </div>
          <section className="home-dashboard-grid home-dashboard-grid--employee-main">
            <article className="home-panel">
              <div className="home-panel-heading"><div><span>MIS PEDIDOS</span><h2>Pedidos por atender</h2></div><Link to="/pedidos">Ver pedidos</Link></div>
              {pedidosPropios.filter(p=>!["Entregado","Cancelado"].includes(p.estado)).length ? <div className="home-list">{pedidosPropios.filter(p=>!["Entregado","Cancelado"].includes(p.estado)).slice(0,5).map(p=><Link className="home-list-row home-list-row--link" to={`/pedidos/${p.id}`} key={p.id}><div className="home-row-icon"><img src="/illustrations/pedidos-portapapeles.png" alt=""/></div><div><strong>{p.recetaNombre||p.cotizacionNombre||`Pedido #${p.id}`}</strong><span>{p.cliente||"Sin cliente"}</span></div><b>{p.estado||"Pendiente"}</b></Link>)}</div> : <div className="home-empty">No tienes pedidos pendientes.</div>}
            </article>
            <article className="home-panel home-attendance-panel">
              <div className="home-panel-heading"><div><span>CONTROL DE PERSONAL</span><h2>Mi jornada</h2></div></div>
              <div className="home-attendance-body"><div><strong>{miAsistenciaHoy ? "Jornada de hoy" : "Aún no has registrado tu entrada"}</strong><span>{miAsistenciaHoy ? `Entrada ${horaAsistencia(miAsistenciaHoy.ingreso)}${miAsistenciaHoy.salida ? ` · Salida ${horaAsistencia(miAsistenciaHoy.salida)}` : ""}` : "Registra tu entrada al comenzar y tu salida al terminar."}</span></div><div className="home-attendance-actions">{!miAsistenciaHoy && <button type="button" className="home-attendance-btn home-attendance-btn--entry" disabled={guardandoAsistencia} onClick={registrarMiEntrada}>{guardandoAsistencia ? "Guardando..." : "Registrar entrada"}</button>}{miAsistenciaHoy && !miAsistenciaHoy.salida && <button type="button" className="home-attendance-btn home-attendance-btn--exit" disabled={guardandoAsistencia} onClick={registrarMiSalida}>{guardandoAsistencia ? "Guardando..." : "Registrar salida"}</button>}{miAsistenciaHoy?.salida && <span className="home-attendance-complete">Jornada registrada</span>}</div></div>
            </article>
          </section>
          <section className="home-panel home-deliveries-panel">
            <div className="home-panel-heading"><div><span>CALENDARIO</span><h2>Próximas entregas</h2></div><div className="home-panel-actions"><div className="home-period-toggle"><button type="button" className={periodoEntregas==="semanal"?"active":""} onClick={()=>setPeriodoEntregas("semanal")}>Semanal</button><button type="button" className={periodoEntregas==="mensual"?"active":""} onClick={()=>setPeriodoEntregas("mensual")}>Mensual</button></div><Link to="/calendario">Ver calendario</Link></div></div>
            {(() => { const now=new Date(); const limit=new Date(now); if(periodoEntregas==="semanal") limit.setDate(limit.getDate()+7); else limit.setMonth(limit.getMonth()+1); const rows=pedidosPropios.filter(p=>p.fechaEntrega && !["Entregado","Cancelado"].includes(p.estado) && new Date(`${p.fechaEntrega}T${p.horaEntrega||"23:59"}`)>=now && new Date(`${p.fechaEntrega}T${p.horaEntrega||"23:59"}`)<=limit).sort((a,b)=>new Date(`${a.fechaEntrega}T${a.horaEntrega||"23:59"}`)-new Date(`${b.fechaEntrega}T${b.horaEntrega||"23:59"}`)).slice(0,8); return rows.length ? <div className="home-list">{rows.map(p=><Link className="home-list-row home-list-row--link" to={`/pedidos/${p.id}`} key={p.id}><div className="home-row-icon calendar"><img src="/illustrations/calendario.png" alt=""/></div><div><strong>{p.recetaNombre||p.cotizacionNombre||`Pedido #${p.id}`}</strong><span>{p.cliente||"Sin cliente"}</span></div><b>{date(p.fechaEntrega)}{p.horaEntrega?` · ${time12(p.horaEntrega)}`:""}</b></Link>)}</div> : <div className="home-empty">No tienes entregas pendientes en este periodo.</div>; })()}
          </section>
        </section>
      ) : (
      <section className="home-admin-dashboard">
      <section className="home-kpis">
        <article className="home-kpi"><div className="home-kpi-icon"><img src="/illustrations/moneda.png" alt=""/></div><span>Ventas</span><strong>{money(ventas)}</strong><small>{pedidosReales.length} pedido{pedidosReales.length===1?"":"s"} registrado{pedidosReales.length===1?"":"s"}</small></article>
        <article className="home-kpi home-kpi--positive"><div className="home-kpi-icon"><img src="/illustrations/dashboard.png" alt=""/></div><span>Ganancia realizada</span><strong>{money(ganancia)}</strong><small>{ventas ? `${Math.round((ganancia/ventas)*100)}% de margen realizado` : "Sin ventas"}</small></article>
        <article className="home-kpi home-kpi--warning"><div className="home-kpi-icon"><img src="/illustrations/insumos-frasco.png" alt=""/></div><span>Stock en riesgo</span><strong>{stockRiesgo.length}</strong><small>{stockPeligro.length} en nivel crítico</small></article>
        <article className="home-kpi home-kpi--danger"><div className="home-kpi-icon"><img src="/illustrations/eliminar.png" alt=""/></div><span>Pérdidas por cancelación</span><strong>{money(perdidasCanceladas)}</strong><small>{pedidos.filter(p=>p.estado==="Cancelado").length} pedido{pedidos.filter(p=>p.estado==="Cancelado").length===1?"":"s"} cancelado{pedidos.filter(p=>p.estado==="Cancelado").length===1?"":"s"}</small></article>
        <article className="home-kpi"><div className="home-kpi-icon"><img src="/illustrations/pedidos-portapapeles.png" alt=""/></div><span>Por atender</span><strong>{pedidosPendientes + cotizacionesPendientes.length}</strong><small>{pedidosPendientes} pedidos · {cotizacionesPendientes.length} cotizaciones</small></article>
      </section>

      <section className="home-dashboard-grid home-dashboard-grid--main">
        <article className="home-panel home-financial-panel">
          <div className="home-panel-heading"><div><span>RENDIMIENTO</span><h2>Ventas, costos y ganancia</h2></div><Link to="/pedidos">Ver pedidos</Link></div>
          <div className="home-financial-chart">
            <div className="home-chart-y"><span>{money(maxFinancial)}</span><span>{money(maxFinancial*.66)}</span><span>{money(maxFinancial*.33)}</span><span>₡0</span></div>
            <div className="home-financial-bars">{historialMensual.map((row)=><div className="home-financial-month" key={row.key}><div className="home-financial-columns"><div className="home-financial-col home-financial-sales" style={{height:`${Math.max(5,row.ventas/maxFinancial*100)}%`}} title={`Ventas: ${money(row.ventas)}`}/><div className="home-financial-col home-financial-cost" style={{height:`${Math.max(5,row.costos/maxFinancial*100)}%`}} title={`Costos: ${money(row.costos)}`}/></div><span>{monthLabel(row.key)}</span></div>)}</div>
          </div>
          <div className="home-financial-legend"><span><i className="sales"/>Ventas</span><span><i className="cost"/>Costos</span><span><i className="profit"/>Ganancia</span><strong>Ganancia actual: {money2(ganancia)}</strong></div>
        </article>

        <article className="home-panel home-forecast-panel">
          <div className="home-panel-heading">
            <div><span>PROYECCIÓN CON IA</span><h2>Proyección financiera</h2></div>
            <div className="home-panel-actions">
              <div className="home-period-toggle"><button type="button" className={periodoProyeccion==="mensual"?"active":""} onClick={()=>setPeriodoProyeccion("mensual")}>Mensual</button><button type="button" className={periodoProyeccion==="anual"?"active":""} onClick={()=>setPeriodoProyeccion("anual")}>Anual</button></div>
            </div>
          </div>
          <div className="home-forecast-body">
            {proyeccionIALoading ? (
              <div className="home-forecast-ai-state">Analizando los datos reales del negocio...</div>
            ) : (
              <>
                <div className="home-forecast-value">{money(proyeccion.ventas)}</div>
                <span>ventas proyectadas</span>
                <div className="home-forecast-profit">
                  <strong>{money(proyeccion.ganancia)}</strong>
                  <span>ganancia proyectada</span>
                </div>
                <p className="home-forecast-analysis">{proyeccion.texto}</p>
                {proyeccionIA && (
                  <small className="home-forecast-source">Generada con IA a partir del historial real de ventas, costos y pedidos.</small>
                )}
                {proyeccionIA ? (
                  <div className="home-forecast-ai-meta">
                    <span className={`home-forecast-badge home-forecast-badge--${proyeccionIA.confianza || "baja"}`}>
                      Confianza: {proyeccionIA.confianza || "baja"}
                    </span>
                    <span className="home-forecast-trend">
                      Tendencia: {proyeccionIA.tendencia || "insuficiente"}
                    </span>
                  </div>
                ) : (
                  <small>{proyeccionIAError || "No fue posible obtener la proyección con IA."}</small>
                )}
              </>
            )}
          </div>
        </article>
      </section>

      <section className="home-dashboard-grid home-dashboard-grid--secondary">
        <article className="home-panel home-stock-panel"><div className="home-panel-heading"><div><span>INVENTARIO</span><h2>Stock en peligro</h2></div><Link to="/insumos">Ver inventario</Link></div>{stockRiesgo.length ? <div className="home-list">{stockRiesgo.slice(0,5).map(item=><div className="home-list-row" key={item.id}><div className={`home-row-icon ${Number(item.cantidad||0)<=5?"danger":"warning"}`}>!</div><div><strong>{item.nombre}</strong><span>{item.presentacion || item.unidad || "Insumo"}</span></div><b className={Number(item.cantidad||0)<=5?"danger-text":"warning-text"}>{item.cantidad} {item.unidad}</b></div>)}</div>:<div className="home-empty">No hay insumos en riesgo.</div>}</article>

        <article className="home-panel"><div className="home-panel-heading"><div><span>TRÁMITES</span><h2>Empleado con más gestiones</h2></div><Link to="/empleados">Ver equipo</Link></div>{empleadoTop ? <div className="home-top-employee"><div className="home-top-avatar"><img src={empleados.find(e=>e.id===empleadoTop.id)?.foto || "/illustrations/perfil.png"} alt=""/></div><div><strong>{empleadoTop.nombre}</strong><span>{empleadoTop.total} gestión{empleadoTop.total===1?"":"es"} registradas</span><small>{empleadoTop.cotizaciones} cotizaciones · {empleadoTop.pedidos} pedidos</small></div></div> : <div className="home-empty">Aún no hay trámites con responsable registrado.</div>}</article>
      </section>

      <section className="home-dashboard-grid home-dashboard-grid--bottom">
        <article className="home-panel"><div className="home-panel-heading"><div><span>PEDIDOS</span><h2>Estado de pedidos</h2></div><Link to="/pedidos">Ver todos</Link></div><div className="home-status-content"><div className="home-donut" style={{background:(()=>{const colors=["#9b7ede","#d98c9a","#8fc7b7","#6d4c8d","#c9bdc8"];let start=0;const total=Math.max(pedidos.length,1);return `conic-gradient(${pedidosPorEstado.map((x,i)=>{const end=start+(x.cantidad/total)*100;const p=`${colors[i]} ${start}% ${end}%`;start=end;return p}).join(", ")})`})()}}><div><strong>{pedidos.length}</strong><span>Pedidos</span></div></div><div className="home-legend">{pedidosPorEstado.map((x,i)=><div key={x.estado}><i style={{background:["#9b7ede","#d98c9a","#8fc7b7","#6d4c8d","#c9bdc8"][i]}}/><span>{x.estado}</span><strong>{x.cantidad}</strong></div>)}</div></div></article>
        <article className="home-panel"><div className="home-panel-heading"><div><span>CALENDARIO</span><h2>Próximas entregas</h2></div><div className="home-panel-actions"><div className="home-period-toggle"><button type="button" className={periodoEntregas==="semanal"?"active":""} onClick={()=>setPeriodoEntregas("semanal")}>Semanal</button><button type="button" className={periodoEntregas==="mensual"?"active":""} onClick={()=>setPeriodoEntregas("mensual")}>Mensual</button></div><Link to="/calendario">Ver calendario</Link></div></div>{(() => { const now=new Date(); const limit=new Date(now); if(periodoEntregas==="semanal") limit.setDate(limit.getDate()+7); else limit.setMonth(limit.getMonth()+1); const rows=pedidos.filter(p=>p.fechaEntrega && !["Entregado","Cancelado"].includes(p.estado) && new Date(`${p.fechaEntrega}T${p.horaEntrega||"23:59"}`)>=now && new Date(`${p.fechaEntrega}T${p.horaEntrega||"23:59"}`)<=limit).sort((a,b)=>new Date(`${a.fechaEntrega}T${a.horaEntrega||"23:59"}`)-new Date(`${b.fechaEntrega}T${b.horaEntrega||"23:59"}`)).slice(0,8); return rows.length ? <div className="home-list">{rows.map(p=><Link className="home-list-row home-list-row--link" to={`/pedidos/${p.id}`} key={p.id}><div className="home-row-icon calendar"><img src="/illustrations/calendario.png" alt=""/></div><div><strong>{p.recetaNombre||p.cotizacionNombre||`Pedido #${p.id}`}</strong><span>{p.cliente||"Sin cliente"}</span></div><b>{date(p.fechaEntrega)}{p.horaEntrega?` · ${time12(p.horaEntrega)}`:""}</b></Link>)}</div> : <div className="home-empty">No hay entregas pendientes en este periodo.</div>; })()}</article>
      </section>
      </section>
      )}
    </main>
  );
}

export default Home;
