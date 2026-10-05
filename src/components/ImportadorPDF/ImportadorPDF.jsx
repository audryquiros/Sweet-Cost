import { useEffect } from "react";
import { getNegocioActivo } from "../../context/negocioContext";
import "./ImportadorPDF.css";

function formatoMoneda(valor) {
  return `₡${Number(valor || 0).toLocaleString("es-CR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatoNumero(valor) {
  return Number(valor || 0).toLocaleString("es-CR", {
    maximumFractionDigits: 2,
  });
}

function formatoFecha(fecha) {
  if (!fecha) return new Date().toLocaleDateString("es-CR");
  return new Date(fecha).toLocaleDateString("es-CR");
}

function ImportadorPDF({
  cotizacion,
  productos = [],
  insumos = [],
  tipoDocumento = "factura",
  onCerrar,
}) {
  const negocio = getNegocioActivo();
  const esCotizacion = tipoDocumento === "cotizacion";

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onCerrar();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCerrar]);

  if (!cotizacion) return null;

  const cantidadAVender = Number(
    cotizacion.cantidadAVender ?? cotizacion.cantidadCajas ?? cotizacion.cantidad ?? 0
  );
  const unidadesIncluidas = Number(
    cotizacion.unidadesIncluidas ?? cotizacion.unidadesPorCaja ?? 0
  );
  const cantidadTotalProductos = Number(
    cotizacion.cantidadTotalProductos ?? cantidadAVender * unidadesIncluidas
  );
  const precioPorUnidadVenta = Number(
    cotizacion.precioPorUnidadVenta ??
      cotizacion.precioPorCaja ??
      (cantidadAVender > 0 ? Number(cotizacion.precioSugerido || 0) / cantidadAVender : 0)
  );
  const precioTotalSugerido = Number(cotizacion.precioSugerido || 0);
  const fecha = formatoFecha(cotizacion.fecha);

  const extras = Array.isArray(cotizacion.extras) ? cotizacion.extras : [];
  const toppings = extras.filter((extra) => extra.tipo === "topping");
  const salsas = extras.filter((extra) => extra.tipo === "salsa");
  const insumosCotizacion = Array.isArray(cotizacion.insumos)
    ? cotizacion.insumos
    : [];

  const obtenerProducto = (id) =>
    productos.find((producto) => String(producto.id) === String(id));

  const obtenerNombreExtra = (extra) =>
    extra.nombre || obtenerProducto(extra.productoId)?.nombre || "Extra";

  const imprimirDocumento = () => {
    window.print();
  };

  return (
    <div
      className="importador-pdf-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="documento-cliente-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCerrar();
      }}
    >
      <div className="importador-pdf-modal">
        <div className="importador-pdf-toolbar">
          <div>
            <span className="importador-pdf-eyebrow">Documento para cliente</span>
            <h2 id="documento-cliente-title">
              {esCotizacion ? "Cotización" : "Factura de venta"}
            </h2>
            <p>
              {esCotizacion
                ? `Documento completo de la cotización ${cotizacion.nombre}.`
                : `Generada a partir de la cotización ${cotizacion.nombre}.`}
            </p>
          </div>

          <button
            type="button"
            className="importador-pdf-close"
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="importador-pdf-document">
          <header className="factura-cliente-header">
            <div>
              <div className="factura-cliente-brand">Sweet Cost</div>
              <strong>{negocio?.nombre || "Negocio activo"}</strong>
              {negocio?.tipo && <span>{negocio.tipo}</span>}
            </div>

            <div className="factura-cliente-title-block">
              <span>{esCotizacion ? "COTIZACIÓN" : "FACTURA"}</span>
              <strong>#{cotizacion.id}</strong>
              <small>{fecha}</small>
            </div>
          </header>

          <section className="factura-cliente-info">
            <div>
              <span>Nombre de la cotización</span>
              <strong>{cotizacion.nombre || "Sin nombre"}</strong>
            </div>
            <div>
              <span>Cliente</span>
              <strong>{cotizacion.cliente || "No especificado"}</strong>
            </div>
            <div>
              <span>Teléfono</span>
              <strong>{cotizacion.telefono || "No especificado"}</strong>
            </div>
            <div>
              <span>Tramitada por</span>
              <strong>{cotizacion.empleadoNombre || "No registrado"}</strong>
            </div>
            <div>
              <span>Estado</span>
              <strong>{cotizacion.estado || "Pendiente"}</strong>
            </div>
          </section>

          <section className="factura-cliente-section">
            <div className="factura-cliente-section-heading">
              <span>01</span>
              <div>
                <h3>Información de la venta</h3>
                <p>Detalle completo de la receta y cantidades cotizadas.</p>
              </div>
            </div>

            <div className="factura-cliente-detail-grid">
              <div><span>Receta</span><strong>{cotizacion.recetaNombre || "—"}</strong></div>
              <div><span>Cantidad a vender</span><strong>{formatoNumero(cantidadAVender)}</strong></div>
              <div><span>Productos por envase</span><strong>{formatoNumero(unidadesIncluidas)}</strong></div>
              <div><span>Total de productos</span><strong>{formatoNumero(cantidadTotalProductos)}</strong></div>
              <div><span>Modo de extras</span><strong>{cotizacion.extrasModo === "personalizado" ? "Personalizado" : "Estándar"}</strong></div>
              <div><span>Margen de ganancia</span><strong>{formatoNumero(cotizacion.margen)}%</strong></div>
            </div>
          </section>

          <section className="factura-cliente-section">
            <div className="factura-cliente-section-heading">
              <span>02</span>
              <div>
                <h3>Toppings y salsas</h3>
                <p>Configuración, cantidades y costos de los extras.</p>
              </div>
            </div>

            <div className="factura-cliente-detail-grid">
              <div><span>Toppings por envase</span><strong>{formatoNumero(cotizacion.toppingsPorEnvase)}</strong></div>
              <div><span>Costo toppings por envase</span><strong>{formatoMoneda(cotizacion.costoToppingsPorEnvase)}</strong></div>
              <div><span>Costo toppings total</span><strong>{formatoMoneda(cotizacion.costoToppings)}</strong></div>
              <div><span>Salsas por envase</span><strong>{formatoNumero(cotizacion.salsasPorEnvase)}</strong></div>
              <div><span>Costo salsas por envase</span><strong>{formatoMoneda(cotizacion.costoSalsasPorEnvase)}</strong></div>
              <div><span>Costo salsas total</span><strong>{formatoMoneda(cotizacion.costoSalsas)}</strong></div>
            </div>

            {extras.length > 0 ? (
              <div className="factura-cliente-subtable">
                <div className="factura-cliente-subtable-head">
                  <span>Extra</span><span>Tipo</span><span>Porciones</span><span>Costo</span>
                </div>
                {extras.map((extra, index) => (
                  <div className="factura-cliente-subtable-row" key={`${extra.productoId || extra.nombre || "extra"}-${index}`}>
                    <span>{obtenerNombreExtra(extra)}</span>
                    <span>{extra.tipo === "topping" ? "Topping" : "Salsa"}</span>
                    <span>{formatoNumero(extra.cantidadPorciones ?? extra.cantidadUsos ?? 1)}</span>
                    <strong>{formatoMoneda(extra.costo)}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="factura-cliente-empty">No se registraron extras específicos.</p>
            )}

            <div className="factura-cliente-inline-total">
              <span>Total extras por envase</span>
              <strong>{formatoMoneda(cotizacion.costoExtrasPorEnvase)}</strong>
              <span>Total extras</span>
              <strong>{formatoMoneda(cotizacion.costoExtras)}</strong>
            </div>
          </section>

          <section className="factura-cliente-section">
            <div className="factura-cliente-section-heading">
              <span>03</span>
              <div>
                <h3>Insumos</h3>
                <p>Detalle de insumos utilizados en la cotización.</p>
              </div>
            </div>

            {insumosCotizacion.length > 0 ? (
              <div className="factura-cliente-subtable">
                <div className="factura-cliente-subtable-head factura-cliente-subtable-insumos">
                  <span>Insumo</span><span>Cant. por envase</span><span>Cant. total</span><span>Costo</span>
                </div>
                {insumosCotizacion.map((insumo, index) => {
                  const cantidadPorEnvase = Number(insumo.cantidadPorEnvase ?? insumo.cantidad ?? 0);
                  const cantidadTotal = Number(insumo.cantidadTotal ?? cantidadPorEnvase * cantidadAVender);
                  const registrado = insumos.find((item) => String(item.id) === String(insumo.insumoId));
                  return (
                    <div className="factura-cliente-subtable-row factura-cliente-subtable-insumos" key={`${insumo.insumoId || insumo.nombre || "insumo"}-${index}`}>
                      <span>{insumo.nombre || registrado?.nombre || "Insumo"}</span>
                      <span>{formatoNumero(cantidadPorEnvase)}</span>
                      <span>{formatoNumero(cantidadTotal)}</span>
                      <strong>{formatoMoneda(insumo.costo)}</strong>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="factura-cliente-empty">No se registraron insumos.</p>
            )}

            <div className="factura-cliente-inline-total">
              <span>Costo de insumos por envase</span>
              <strong>{formatoMoneda(cotizacion.costoInsumosPorEnvase)}</strong>
              <span>Costo de insumos total</span>
              <strong>{formatoMoneda(cotizacion.costoInsumos)}</strong>
            </div>
          </section>

          <section className="factura-cliente-section">
            <div className="factura-cliente-section-heading">
              <span>04</span>
              <div>
                <h3>Producción y mano de obra</h3>
                <p>Todos los tiempos y valores utilizados para calcular el costo.</p>
              </div>
            </div>

            <div className="factura-cliente-detail-grid">
              <div><span>Preparación</span><strong>{formatoNumero(cotizacion.tiempoPreparacion)} min</strong></div>
              <div><span>Cocción</span><strong>{formatoNumero(cotizacion.tiempoCoccion)} min</strong></div>
              <div><span>Decoración</span><strong>{formatoNumero(cotizacion.tiempoDecoracion)} min</strong></div>
              <div><span>Empaque</span><strong>{formatoNumero(cotizacion.tiempoEmpaque)} min</strong></div>
              <div><span>Tiempo total</span><strong>{formatoNumero(cotizacion.tiempoTotalProduccion)} min</strong></div>
              <div><span>Horas de producción</span><strong>{formatoNumero(cotizacion.horasProduccion)} h</strong></div>
              <div><span>Tarifa por hora</span><strong>{formatoMoneda(cotizacion.tarifaHora)}</strong></div>
              <div><span>Mano de obra</span><strong>{formatoMoneda(cotizacion.manoObra)}</strong></div>
            </div>
          </section>

          <section className="factura-cliente-section">
            <div className="factura-cliente-section-heading">
              <span>05</span>
              <div>
                <h3>Resumen económico</h3>
                <p>Desglose completo del cálculo de la cotización.</p>
              </div>
            </div>

            <div className="factura-cliente-cost-table">
              <div><span>Costo de receta</span><strong>{formatoMoneda(cotizacion.costoReceta)}</strong></div>
              <div><span>Toppings y salsas</span><strong>{formatoMoneda(cotizacion.costoExtras)}</strong></div>
              <div><span>Insumos</span><strong>{formatoMoneda(cotizacion.costoInsumos)}</strong></div>
              <div><span>Mano de obra</span><strong>{formatoMoneda(cotizacion.manoObra)}</strong></div>
              <div className="factura-cliente-cost-total"><span>Costo total</span><strong>{formatoMoneda(cotizacion.costoTotal)}</strong></div>
            </div>

            <div className="factura-cliente-price-grid">
              <div><span>Margen aplicado</span><strong>{formatoNumero(cotizacion.margen)}%</strong></div>
              <div><span>Precio sugerido por envase</span><strong>{formatoMoneda(precioPorUnidadVenta)}</strong></div>
              <div><span>Precio total sugerido</span><strong>{formatoMoneda(precioTotalSugerido)}</strong></div>
            </div>
          </section>

          <div className="factura-cliente-total-final">
            <div>
              <span>{esCotizacion ? "TOTAL COTIZADO" : "TOTAL A PAGAR"}</span>
              <small>{cantidadTotalProductos ? `${formatoNumero(cantidadTotalProductos)} productos incluidos` : ""}</small>
            </div>
            <strong>{formatoMoneda(precioTotalSugerido)}</strong>
          </div>

          <footer className="factura-cliente-footer">
            <p>
              {esCotizacion
                ? "Documento generado desde Sweet Cost. Esta cotización no constituye una factura."
                : "Documento generado desde Sweet Cost a partir de una cotización."}
            </p>
            <p>{esCotizacion ? "Gracias por considerar nuestros servicios." : "Gracias por su compra."}</p>
          </footer>
        </div>

        <div className="importador-pdf-actions">
          <button type="button" className="importador-pdf-secondary" onClick={onCerrar}>
            Cerrar
          </button>
          <button type="button" className="importador-pdf-primary" onClick={imprimirDocumento}>
            {esCotizacion ? "Imprimir cotización" : "Imprimir / Guardar PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImportadorPDF;
