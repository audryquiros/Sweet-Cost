import { useEffect, useRef, useState } from "react";
import { consultarFacturasIA } from "../../services/aiServices";
import { getNegocioActivo } from "../../context/negocioContext";
import { useAuth } from "../../context/authContext";
import "./AsistenteIA.css";

function Mensaje({ item }) {
  return (
    <div className={`ai-chat-message ai-chat-message--${item.autor}`}>
      <div className="ai-chat-bubble">{item.texto}</div>

      {item.factura && (
        <div className="ai-invoice-preview">
          <div className="ai-invoice-preview__title">Factura detectada</div>
          <div className="ai-invoice-grid">
            <span>Proveedor</span><strong>{item.factura.proveedor || "No identificado"}</strong>
            <span>Número</span><strong>{item.factura.numero || "No identificado"}</strong>
            <span>Fecha</span><strong>{item.factura.fecha || "No identificada"}</strong>
            <span>Total</span><strong>{item.factura.total != null ? `${item.factura.moneda || "₡"}${Number(item.factura.total).toLocaleString("es-CR")}` : "No identificado"}</strong>
          </div>
          {Array.isArray(item.factura.items) && item.factura.items.length > 0 && (
            <div className="ai-invoice-items">
              <span>Productos detectados</span>
              {item.factura.items.slice(0, 5).map((linea, index) => (
                <div key={`${linea.nombre || "item"}-${index}`}>
                  <strong>{linea.nombre || "Producto"}</strong>
                  <small>{linea.cantidad ?? 1} × {linea.precio != null ? Number(linea.precio).toLocaleString("es-CR") : "—"}</small>
                </div>
              ))}
            </div>
          )}
          {item.requiereConfirmacion && (
            <button type="button" className="ai-invoice-confirm" onClick={() => item.onConfirm?.()}>
              Confirmar y registrar factura
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function AsistenteIA() {
  const { usuario } = useAuth();
  const [negocio, setNegocio] = useState(() => getNegocioActivo());

  useEffect(() => {
    const actualizar = (event) => {
      if (event.detail) setNegocio(event.detail);
      else setNegocio(getNegocioActivo());
    };
    window.addEventListener("sweetcost-negocio-cambio", actualizar);
    return () => window.removeEventListener("sweetcost-negocio-cambio", actualizar);
  }, []);
  const [abierto, setAbierto] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [mensajes, setMensajes] = useState([
    {
      id: "inicio",
      autor: "ia",
      texto: "Hola. Soy el asistente de Sweet Cost. Puedes subir una factura para que extraiga sus datos, detecte inconsistencias y te prepare el registro para confirmarlo.",
    },
  ]);
  const fileRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [mensajes, enviando]);

  if (usuario?.rol !== "administrador") return null;

  const agregar = (item) => setMensajes((actuales) => [...actuales, { id: `${Date.now()}-${Math.random()}`, ...item }]);

  const enviar = async () => {
    if ((!mensaje.trim() && !archivo) || enviando) return;

    const textoUsuario = mensaje.trim() || `Factura adjunta: ${archivo.name}`;
    const archivoActual = archivo;
    setMensaje("");
    setArchivo(null);
    if (fileRef.current) fileRef.current.value = "";

    agregar({
      autor: "usuario",
      texto: textoUsuario,
    });

    setEnviando(true);

    try {
      const data = await consultarFacturasIA({
        mensaje: textoUsuario,
        archivo: archivoActual,
        negocio,
        usuario,
      });

      const factura = data.factura || data.datosFactura || null;
      agregar({
        autor: "ia",
        texto: data.mensaje || data.respuesta || "Analicé la solicitud. Revisa los datos obtenidos.",
        factura,
        requiereConfirmacion: Boolean(data.requiereConfirmacion && factura),
        onConfirm: () => confirmarFactura(factura),
      });
    } catch (error) {
      agregar({
        autor: "ia",
        texto: error.message || "No pude procesar la solicitud.",
        error: true,
      });
    } finally {
      setEnviando(false);
    }
  };

  async function confirmarFactura(factura) {
    if (!factura || enviando) return;
    setEnviando(true);
    try {
      const data = await consultarFacturasIA({
        mensaje: "Confirmar registro de la factura.",
        negocio,
        usuario,
        factura,
      });
      agregar({
        autor: "ia",
        texto: data.mensaje || "La factura fue confirmada y registrada correctamente.",
      });
    } catch (error) {
      agregar({
        autor: "ia",
        texto: error.message || "No se pudo registrar la factura.",
        error: true,
      });
    } finally {
      setEnviando(false);
    }
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      enviar();
    }
  };

  return (
    <div className={`ai-assistant ${abierto ? "is-open" : ""}`}>
      {abierto && (
        <section className="ai-chat-window" aria-label="Asistente de facturas con IA">
          <header className="ai-chat-header">
            <div>
              <span className="ai-chat-kicker">SWEET COST</span>
              <h2>Asistente de facturas</h2>
              <p>Analiza facturas con IA antes de registrarlas.</p>
            </div>
            <button type="button" className="ai-chat-close" onClick={() => setAbierto(false)} aria-label="Cerrar asistente">
              <img src="/illustrations/cerrar.png" alt="" aria-hidden="true" />
            </button>
          </header>

          <div className="ai-chat-list" ref={listRef}>
            {mensajes.map((item) => <Mensaje key={item.id} item={item} />)}
            {enviando && <div className="ai-chat-message ai-chat-message--ia"><div className="ai-chat-bubble ai-chat-loading">Analizando...</div></div>}
          </div>

          <div className="ai-chat-file">
            {archivo ? (
              <div className="ai-file-chip">
                <span>{archivo.name}</span>
                <button type="button" onClick={() => { setArchivo(null); if (fileRef.current) fileRef.current.value = ""; }} aria-label="Quitar factura">×</button>
              </div>
            ) : (
              <button type="button" className="ai-attach-button" onClick={() => fileRef.current?.click()}>
                Adjuntar factura
              </button>
            )}
            <input ref={fileRef} type="file" accept=".pdf,image/png,image/jpeg,image/webp" hidden onChange={(event) => setArchivo(event.target.files?.[0] || null)} />
          </div>

          <div className="ai-chat-composer">
            <textarea
              value={mensaje}
              onChange={(event) => setMensaje(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Escribe una consulta sobre la factura..."
              rows={2}
              disabled={enviando}
            />
            <button type="button" onClick={enviar} disabled={enviando || (!mensaje.trim() && !archivo)}>
              Enviar
            </button>
          </div>
        </section>
      )}

      <button type="button" className="ai-assistant-trigger" onClick={() => setAbierto((value) => !value)} aria-label={abierto ? "Cerrar asistente" : "Abrir asistente de facturas"} title={abierto ? "Cerrar asistente" : "Facturas IA"}>
        <img
          className="ai-trigger-icon"
          src="/illustrations/chatbox.png"
          alt=""
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
