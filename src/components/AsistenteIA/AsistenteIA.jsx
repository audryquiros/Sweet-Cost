import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { consultarFacturasIA } from "../../services/aiServices";
import { createFactura, deleteFactura } from "../../services/facturaServices";
import { createProducto, deleteProducto } from "../../services/productoServices";
import { createInsumo, deleteInsumo } from "../../services/insumoServices";
import { getNegocioActivo } from "../../context/negocioContext";
import { useAuth } from "../../context/authContext";
import "./AsistenteIA.css";

function formatearMonto(valor, moneda = "CRC") {
  if (valor == null || Number.isNaN(Number(valor))) return "No identificado";

  const codigo = String(moneda || "CRC").toUpperCase();
  const simbolo = codigo === "USD" ? "$" : codigo === "EUR" ? "€" : "₡";

  return `${simbolo}${Number(valor).toLocaleString("es-CR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

const UNIDADES = ["unidad", "paquete", "docena", "g", "kg", "ml", "l"];
const TIPOS_PRODUCTO = ["ingrediente", "topping", "salsa"];

function normalizarProducto(producto = {}) {
  return {
    descripcion: producto.descripcion || "",
    cantidad: Number(producto.cantidad) || 1,
    precioUnitario: Number(producto.precioUnitario) || 0,
    total: Number(producto.total ?? producto.totalProducto) || 0,
    tipoRegistro: producto.tipoRegistro || "insumo",
    agregarInventario: producto.agregarInventario !== false,
    unidad: producto.unidad || "unidad",
    tipoProducto: producto.tipoProducto || "ingrediente",
    marca: producto.marca || "",
    presentacion: producto.presentacion || "",
  };
}

function prepararFacturaParaRevision(factura = {}) {
  return {
    ...factura,
    productos: Array.isArray(factura.productos)
      ? factura.productos.map(normalizarProducto)
      : [],
  };
}

function FacturaRevision({ facturaInicial, onConfirm, confirmando }) {
  const [factura, setFactura] = useState(() => prepararFacturaParaRevision(facturaInicial));

  const cambiarFactura = (campo, valor) => {
    setFactura((actual) => ({ ...actual, [campo]: valor }));
  };

  const cambiarProducto = (index, campo, valor) => {
    setFactura((actual) => {
      const productos = actual.productos.map((producto, i) => {
        if (i !== index) return producto;

        const actualizado = { ...producto, [campo]: valor };

        if (campo === "cantidad" || campo === "precioUnitario") {
          actualizado.total =
            (Number(actualizado.cantidad) || 0) *
            (Number(actualizado.precioUnitario) || 0);
        }

        if (campo === "tipoRegistro" && valor === "producto") {
          actualizado.tipoProducto = actualizado.tipoProducto || "ingrediente";
        }

        return actualizado;
      });

      return { ...actual, productos };
    });
  };

  const agregarProducto = () => {
    setFactura((actual) => ({
      ...actual,
      productos: [
        ...actual.productos,
        normalizarProducto({
          descripcion: "",
          cantidad: 1,
          precioUnitario: 0,
          total: 0,
          tipoRegistro: "insumo",
          agregarInventario: true,
        }),
      ],
    }));
  };

  const eliminarProducto = (index) => {
    setFactura((actual) => ({
      ...actual,
      productos: actual.productos.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="ai-invoice-review">
      <div className="ai-invoice-review__intro">
        <strong>Revisar factura antes de registrar</strong>
        <span>Edita los datos y define qué líneas quieres agregar al inventario.</span>
      </div>

      <div className="ai-invoice-form-grid">
        <label>
          Proveedor
          <input value={factura.proveedor || ""} onChange={(e) => cambiarFactura("proveedor", e.target.value)} />
        </label>

        <label>
          Número de factura
          <input value={factura.numeroFactura || ""} onChange={(e) => cambiarFactura("numeroFactura", e.target.value)} />
        </label>

        <label>
          Fecha
          <input value={factura.fecha || ""} onChange={(e) => cambiarFactura("fecha", e.target.value)} />
        </label>

        <label>
          Moneda
          <select value={factura.moneda || "CRC"} onChange={(e) => cambiarFactura("moneda", e.target.value)}>
            <option value="CRC">CRC</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </label>

        <label>
          Subtotal
          <input type="number" min="0" step="any" value={factura.subtotal ?? ""} onChange={(e) => cambiarFactura("subtotal", e.target.value === "" ? null : Number(e.target.value))} />
        </label>

        <label>
          Descuento
          <input type="number" min="0" step="any" value={factura.descuento ?? ""} onChange={(e) => cambiarFactura("descuento", e.target.value === "" ? null : Number(e.target.value))} />
        </label>

        <label>
          Impuesto / IVA
          <input type="number" min="0" step="any" value={factura.impuesto ?? ""} onChange={(e) => cambiarFactura("impuesto", e.target.value === "" ? null : Number(e.target.value))} />
        </label>

        <label>
          Total
          <input type="number" min="0" step="any" value={factura.total ?? ""} onChange={(e) => cambiarFactura("total", e.target.value === "" ? null : Number(e.target.value))} />
        </label>
      </div>

      <div className="ai-review-section">
        <div className="ai-review-section__header">
          <div>
            <strong>Productos de la factura</strong>
            <span>Selecciona qué quieres agregar y si corresponde a un insumo o producto.</span>
          </div>
          <button type="button" className="ai-review-add" onClick={agregarProducto} disabled={confirmando}>
            + Agregar línea
          </button>
        </div>

        <div className="ai-review-items">
          {factura.productos.map((producto, index) => (
            <div className="ai-review-item" key={`review-${index}`}>
              <div className="ai-review-item__top">
                <label className="ai-review-check">
                  <input
                    type="checkbox"
                    checked={producto.agregarInventario}
                    onChange={(e) => cambiarProducto(index, "agregarInventario", e.target.checked)}
                    disabled={confirmando}
                  />
                  <span>Agregar al inventario</span>
                </label>
                <button type="button" className="ai-review-remove" onClick={() => eliminarProducto(index)} disabled={confirmando} aria-label="Eliminar línea">
                  ×
                </button>
              </div>

              <div className="ai-review-item__grid">
                <label className="ai-review-item__wide">
                  Nombre / descripción
                  <input value={producto.descripcion} onChange={(e) => cambiarProducto(index, "descripcion", e.target.value)} disabled={confirmando} />
                </label>

                <label>
                  Tipo
                  <select value={producto.tipoRegistro} onChange={(e) => cambiarProducto(index, "tipoRegistro", e.target.value)} disabled={confirmando}>
                    <option value="insumo">Insumo</option>
                    <option value="producto">Producto</option>
                  </select>
                </label>

                <label>
                  Cantidad
                  <input type="number" min="0" step="any" value={producto.cantidad} onChange={(e) => cambiarProducto(index, "cantidad", e.target.value)} disabled={confirmando} />
                </label>

                <label>
                  Unidad
                  <select value={producto.unidad} onChange={(e) => cambiarProducto(index, "unidad", e.target.value)} disabled={confirmando}>
                    {UNIDADES.map((unidad) => <option key={unidad} value={unidad}>{unidad}</option>)}
                  </select>
                </label>

                <label>
                  Precio unitario
                  <input type="number" min="0" step="any" value={producto.precioUnitario} onChange={(e) => cambiarProducto(index, "precioUnitario", e.target.value)} disabled={confirmando} />
                </label>

                <label>
                  Total línea
                  <input type="number" min="0" step="any" value={producto.total} onChange={(e) => cambiarProducto(index, "total", e.target.value)} disabled={confirmando} />
                </label>

                {producto.tipoRegistro === "insumo" ? (
                  <label className="ai-review-item__wide">
                    Presentación
                    <input value={producto.presentacion} onChange={(e) => cambiarProducto(index, "presentacion", e.target.value)} placeholder="Ej. paquete de 15 unidades" disabled={confirmando} />
                  </label>
                ) : (
                  <>
                    <label>
                      Tipo de producto
                      <select value={producto.tipoProducto} onChange={(e) => cambiarProducto(index, "tipoProducto", e.target.value)} disabled={confirmando}>
                        {TIPOS_PRODUCTO.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
                      </select>
                    </label>

                    <label>
                      Marca
                      <input value={producto.marca} onChange={(e) => cambiarProducto(index, "marca", e.target.value)} disabled={confirmando} />
                    </label>
                  </>
                )}
              </div>
            </div>
          ))}

          {!factura.productos.length && (
            <div className="ai-review-empty">No hay líneas agregadas. Puedes añadir una manualmente.</div>
          )}
        </div>
      </div>

      <div className="ai-review-summary">
        <span>Total de factura</span>
        <strong>{formatearMonto(factura.total, factura.moneda)}</strong>
      </div>

      <button
        type="button"
        className="ai-invoice-confirm"
        onClick={() => onConfirm(factura)}
        disabled={confirmando || !factura.proveedor?.trim() || !factura.numeroFactura?.trim() || factura.total == null}
      >
        {confirmando ? "Registrando factura e inventario..." : "Confirmar y agregar al inventario"}
      </button>
    </div>
  );
}

function Mensaje({ item }) {
  return (
    <div className={`ai-chat-message ai-chat-message--${item.autor}`}>
      <div className="ai-chat-bubble">{item.texto}</div>

      {item.factura && !item.confirmado && (
        <div className="ai-invoice-preview">
          <FacturaRevision
            facturaInicial={item.factura}
            onConfirm={(facturaEditada) => item.onConfirm?.(facturaEditada)}
            confirmando={item.confirmando}
          />
        </div>
      )}

      {item.factura && item.confirmado && (
        <div className="ai-invoice-preview ai-invoice-preview--confirmed">
          <div className="ai-invoice-preview__title">Factura registrada</div>
          <div className="ai-invoice-grid">
            <span>Proveedor</span>
            <strong>{item.factura.proveedor || "No identificado"}</strong>
            <span>Número</span>
            <strong>{item.factura.numeroFactura || "No identificado"}</strong>
            <span>Total</span>
            <strong>{formatearMonto(item.factura.total, item.factura.moneda)}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AsistenteIA() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [negocio, setNegocio] = useState(() => getNegocioActivo());
  const [abierto, setAbierto] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [mensajes, setMensajes] = useState([
    {
      id: "inicio",
      autor: "ia",
      texto:
        "Hola. Soy el asistente de Sweet Cost. Puedes subir una factura para extraer sus datos, revisarlos, editar qué se agregará al inventario y confirmar el registro.",
    },
  ]);
  const fileRef = useRef(null);
  const listRef = useRef(null);
  const assistantRef = useRef(null);

  useEffect(() => {
    const actualizar = (event) => {
      if (event.detail) setNegocio(event.detail);
      else setNegocio(getNegocioActivo());
    };

    window.addEventListener("sweetcost-negocio-cambio", actualizar);
    return () => window.removeEventListener("sweetcost-negocio-cambio", actualizar);
  }, []);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [mensajes, enviando]);

  useEffect(() => {
    if (!abierto) return undefined;

    const cerrarAlHacerClickFuera = (event) => {
      if (!assistantRef.current?.contains(event.target)) {
        setAbierto(false);
      }
    };

    document.addEventListener("pointerdown", cerrarAlHacerClickFuera);
    return () => document.removeEventListener("pointerdown", cerrarAlHacerClickFuera);
  }, [abierto]);

  if (usuario?.rol !== "administrador") return null;

  const agregar = (item) =>
    setMensajes((actuales) => [...actuales, { id: `${Date.now()}-${Math.random()}`, ...item }]);

  const enviar = async () => {
    if ((!mensaje.trim() && !archivo) || enviando) return;

    const textoUsuario = mensaje.trim() || `Factura adjunta: ${archivo.name}`;
    const archivoActual = archivo;

    setMensaje("");
    setArchivo(null);
    if (fileRef.current) fileRef.current.value = "";

    agregar({ autor: "usuario", texto: textoUsuario });
    setEnviando(true);

    try {
      const data = await consultarFacturasIA({ mensaje: textoUsuario, archivo: archivoActual, negocio, usuario });
      const factura = data.factura || data.datosFactura || null;

      agregar({
        autor: "ia",
        texto:
          data.mensaje ||
          data.respuesta ||
          (factura ? "Encontré los datos de la factura. Revisa y edita las líneas antes de agregarlas al inventario." : "Analicé la solicitud."),
        factura,
        requiereConfirmacion: Boolean(factura),
        onConfirm: (facturaEditada) => confirmarFactura(facturaEditada),
      });
    } catch (error) {
      agregar({ autor: "ia", texto: error.message || "No pude procesar la solicitud.", error: true });
    } finally {
      setEnviando(false);
    }
  };

  async function confirmarFactura(factura) {
    if (!factura || enviando) return;

    const productosSeleccionados = (factura.productos || []).filter(
      (producto) => producto.agregarInventario && producto.descripcion?.trim()
    );

    const facturaParaGuardar = {
      ...factura,
      productos: (factura.productos || []).map((producto) => ({
        descripcion: producto.descripcion?.trim() || "",
        cantidad: Number(producto.cantidad) || 0,
        precioUnitario: Number(producto.precioUnitario) || 0,
        total: Number(producto.total) || 0,
        tipoRegistro: producto.tipoRegistro || "insumo",
        agregarInventario: Boolean(producto.agregarInventario),
        unidad: producto.unidad || "unidad",
        tipoProducto: producto.tipoProducto || null,
        marca: producto.marca || "",
        presentacion: producto.presentacion || "",
      })),
    };

    setEnviando(true);
    setMensajes((actuales) => actuales.map((item) =>
      item.factura?.numeroFactura === factura.numeroFactura && item.requiereConfirmacion
        ? { ...item, confirmando: true }
        : item
    ));

    let registro = null;
    const creados = [];

    try {
      registro = await createFactura(facturaParaGuardar, { negocioId: negocio?.id, usuario });

      for (const item of productosSeleccionados) {
        if (item.tipoRegistro === "producto") {
          const productoCreado = await createProducto({
            nombre: item.descripcion.trim(),
            marca: item.marca?.trim() || "",
            tipo: item.tipoProducto || "ingrediente",
            cantidadPresentaciones: Number(item.cantidad) || 1,
            cantidadPorPresentacion: 1,
            unidad: item.unidad || "unidad",
            precioPorPresentacion: Number(item.precioUnitario) || 0,
            densidad: null,
            cantidadPorPorcion: null,
            unidadPorPorcion: null,
          });
          creados.push({ tipo: "producto", id: productoCreado.id });
        } else {
          const insumoCreado = await createInsumo({
            nombre: item.descripcion.trim(),
            presentacion: item.presentacion?.trim() || "",
            cantidad: Number(item.cantidad) || 1,
            unidad: item.unidad || "unidad",
            precio: Number(item.total) || 0,
          });
          creados.push({ tipo: "insumo", id: insumoCreado.id });
        }
      }

      setMensajes((actuales) => actuales.map((item) =>
        item.factura === factura
          ? { ...item, factura: facturaParaGuardar, confirmando: false, confirmado: true, requiereConfirmacion: false }
          : item
      ));

      const cantidadProductos = productosSeleccionados.filter(
        (item) => item.tipoRegistro === "producto"
      ).length;
      const cantidadInsumos = productosSeleccionados.filter(
        (item) => item.tipoRegistro !== "producto"
      ).length;

      agregar({
        autor: "ia",
        texto: productosSeleccionados.length
          ? `La factura ${registro.numeroFactura || factura.numeroFactura} fue registrada y se agregaron ${productosSeleccionados.length} línea(s) al inventario.`
          : `La factura ${registro.numeroFactura || factura.numeroFactura} fue registrada. No se agregaron líneas al inventario.`,
      });

      setAbierto(false);

      if (cantidadProductos > cantidadInsumos) {
        navigate("/productos");
      } else if (cantidadInsumos > cantidadProductos) {
        navigate("/insumos");
      } else if (cantidadProductos > 0) {
        // Si hay empate entre productos e insumos, se abre Productos como punto de revisión.
        navigate("/productos");
      }
    } catch (error) {
      await Promise.allSettled(
        creados.map((item) => item.tipo === "producto" ? deleteProducto(item.id) : deleteInsumo(item.id))
      );

      if (registro?.id) {
        await deleteFactura(registro.id);
      }

      setMensajes((actuales) => actuales.map((item) =>
        item.factura === factura ? { ...item, confirmando: false } : item
      ));

      agregar({ autor: "ia", texto: error.message || "No se pudo registrar la factura ni actualizar el inventario.", error: true });
    } finally {
      setEnviando(false);
    }
  }

  const onKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      enviar();
    }
  };

  return (
    <div ref={assistantRef} className={`ai-assistant ${abierto ? "is-open" : ""}`}>
      {abierto && (
        <section className="ai-chat-window" aria-label="Asistente de facturas con IA">
          <header className="ai-chat-header">
            <div>
              <span className="ai-chat-kicker">SWEET COST</span>
              <h2>Asistente de facturas</h2>
              <p>Analiza facturas, revisa sus líneas y decide qué agregar al inventario.</p>
            </div>
            <button type="button" className="ai-chat-close" onClick={() => setAbierto(false)} aria-label="Cerrar asistente">
              <img src="/illustrations/cerrar.png" alt="" aria-hidden="true" />
            </button>
          </header>

          <div className="ai-chat-list" ref={listRef}>
            {mensajes.map((item) => <Mensaje key={item.id} item={item} />)}
            {enviando && (
              <div className="ai-chat-message ai-chat-message--ia">
                <div className="ai-chat-bubble ai-chat-loading">Procesando factura...</div>
              </div>
            )}
          </div>

          <div className="ai-chat-file">
            {archivo ? (
              <div className="ai-file-chip">
                <span>{archivo.name}</span>
                <button type="button" onClick={() => { setArchivo(null); if (fileRef.current) fileRef.current.value = ""; }} aria-label="Quitar factura">×</button>
              </div>
            ) : (
              <button type="button" className="ai-attach-button" onClick={() => fileRef.current?.click()}>Adjuntar factura</button>
            )}
            <input ref={fileRef} type="file" accept=".pdf,image/png,image/jpeg,image/webp" hidden onChange={(event) => setArchivo(event.target.files?.[0] || null)} />
          </div>

          <div className="ai-chat-composer">
            <textarea value={mensaje} onChange={(event) => setMensaje(event.target.value)} onKeyDown={onKeyDown} placeholder="Escribe una consulta sobre la factura..." rows={2} disabled={enviando} />
            <button type="button" onClick={enviar} disabled={enviando || (!mensaje.trim() && !archivo)}>Enviar</button>
          </div>
        </section>
      )}

      <button type="button" className="ai-assistant-trigger" onClick={() => setAbierto((value) => !value)} aria-label={abierto ? "Cerrar asistente" : "Abrir asistente de facturas"} title={abierto ? "Cerrar asistente" : "Facturas IA"}>
        <img className="ai-trigger-icon" src="/illustrations/chatbox.png" alt="" aria-hidden="true" />
      </button>
    </div>
  );
}

export { FacturaRevision };
