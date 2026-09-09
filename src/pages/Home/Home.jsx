import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getProductos } from "../../services/productoServices";
import { getInsumos } from "../../services/insumoServices";
import { getRecetas } from "../../services/recetaServices";
import { getCotizaciones } from "../../services/cotizadorServices";

import {
  calcularCostoReceta,
  calcularCostoPorRendimiento,
} from "../../utils/calculosCostos";

import "./Home.css";

function Home() {
  const [productos, setProductos] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [recetas, setRecetas] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        setCargando(true);
        setError("");

        const [
          productosData,
          insumosData,
          recetasData,
          cotizacionesData,
        ] = await Promise.all([
          getProductos(),
          getInsumos(),
          getRecetas(),
          getCotizaciones(),
        ]);

        setProductos(productosData);
        setInsumos(insumosData);
        setRecetas(recetasData);
        setCotizaciones(cotizacionesData);
      } catch (error) {
        setError(
          "No se pudo cargar la información del dashboard."
        );
      } finally {
        setCargando(false);
      }
    };

    cargarDashboard();
  }, []);

  const recetasConCosto = recetas.map((receta) => {
    const costoTotal = calcularCostoReceta(
      receta,
      productos
    );

    const costoPorUnidad =
      calcularCostoPorRendimiento(
        receta,
        productos
      );

    return {
      ...receta,
      costoTotal,
      costoPorUnidad,
    };
  });

  const costoPromedio =
    recetasConCosto.length > 0
      ? recetasConCosto.reduce(
          (total, receta) =>
            total + receta.costoPorUnidad,
          0
        ) / recetasConCosto.length
      : 0;

  const recetaMasEconomica =
    recetasConCosto.length > 0
      ? [...recetasConCosto].sort(
          (a, b) =>
            a.costoPorUnidad -
            b.costoPorUnidad
        )[0]
      : null;

  const recetaMasCostosa =
    recetasConCosto.length > 0
      ? [...recetasConCosto].sort(
          (a, b) =>
            b.costoPorUnidad -
            a.costoPorUnidad
        )[0]
      : null;

  const cotizacionesConDatos =
    cotizaciones.filter(
      (cotizacion) =>
        cotizacion &&
        cotizacion.nombre
    );

  const ultimaCotizacion =
    cotizacionesConDatos.length > 0
      ? cotizacionesConDatos[
          cotizacionesConDatos.length - 1
        ]
      : null;

  const formatearMoneda = (valor) => {
    return `₡${Number(valor || 0).toFixed(2)}`;
  };

  if (cargando) {
    return (
      <main className="home-page">
        <div className="home-loading">
          <p>Cargando dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="home-page">

      <section className="home-header">
        <div>
          <p className="home-subtitle">
            Sweet Cost
          </p>

          <h1>
            Dashboard
          </h1>

          <p className="home-description">
            Un resumen general de tus productos,
            costos, recetas y cotizaciones.
          </p>
        </div>
      </section>

      {error && (
        <div className="home-error">
          {error}
        </div>
      )}

      {/* =========================
          INDICADORES GENERALES
      ========================= */}

      <section className="home-kpis">

        <div className="home-kpi">
          <span className="home-kpi-label">
            Productos
          </span>

          <strong>
            {productos.length}
          </strong>

          <small>
            registrados
          </small>
        </div>

        <div className="home-kpi">
          <span className="home-kpi-label">
            Insumos
          </span>

          <strong>
            {insumos.length}
          </strong>

          <small>
            registrados
          </small>
        </div>

        <div className="home-kpi">
          <span className="home-kpi-label">
            Recetas
          </span>

          <strong>
            {recetas.length}
          </strong>

          <small>
            disponibles
          </small>
        </div>

        <div className="home-kpi">
          <span className="home-kpi-label">
            Cotizaciones
          </span>

          <strong>
            {cotizaciones.length}
          </strong>

          <small>
            realizadas
          </small>
        </div>

      </section>

      {/* =========================
          RESUMEN Y ACCESOS
      ========================= */}

      <section className="home-content">

        <div className="home-panel home-costos">

          <div className="home-panel-header">
            <div>
              <p className="home-panel-subtitle">
                Análisis
              </p>

              <h2>
                Resumen de costos
              </h2>
            </div>
          </div>

          {recetasConCosto.length === 0 ? (
            <div className="home-empty">
              <p>
                Todavía no tienes recetas suficientes
                para mostrar un análisis de costos.
              </p>
            </div>
          ) : (
            <div className="home-costos-list">

              <div className="home-costo-item">
                <div>
                  <span>
                    Costo promedio por unidad
                  </span>

                  <small>
                    Promedio de todas las recetas
                  </small>
                </div>

                <strong>
                  {formatearMoneda(
                    costoPromedio
                  )}
                </strong>
              </div>

              <div className="home-costo-item">
                <div>
                  <span>
                    Receta más económica
                  </span>

                  <small>
                    {recetaMasEconomica?.nombre}
                  </small>
                </div>

                <strong>
                  {formatearMoneda(
                    recetaMasEconomica?.costoPorUnidad
                  )}
                </strong>
              </div>

              <div className="home-costo-item">
                <div>
                  <span>
                    Receta más costosa
                  </span>

                  <small>
                    {recetaMasCostosa?.nombre}
                  </small>
                </div>

                <strong>
                  {formatearMoneda(
                    recetaMasCostosa?.costoPorUnidad
                  )}
                </strong>
              </div>

            </div>
          )}

        </div>

        {/* =========================
            ACCESOS RÁPIDOS
        ========================= */}

        <div className="home-panel home-acciones">

          <div className="home-panel-header">
            <div>
              <p className="home-panel-subtitle">
                Accesos rápidos
              </p>

              <h2>
                ¿Qué deseas hacer?
              </h2>
            </div>
          </div>

          <div className="home-actions-list">

            <Link
              to="/productos"
              className="home-action"
            >
              <div>
                <strong>
                  Agregar producto
                </strong>

                <span>
                  Registrar un ingrediente,
                  topping o salsa.
                </span>
              </div>

              <span className="home-action-arrow">
                →
              </span>
            </Link>

            <Link
              to="/insumos"
              className="home-action"
            >
              <div>
                <strong>
                  Agregar insumo
                </strong>

                <span>
                  Registrar materiales y
                  empaques.
                </span>
              </div>

              <span className="home-action-arrow">
                →
              </span>
            </Link>

            <Link
              to="/recetas"
              className="home-action"
            >
              <div>
                <strong>
                  Crear receta
                </strong>

                <span>
                  Registrar ingredientes y
                  rendimiento.
                </span>
              </div>

              <span className="home-action-arrow">
                →
              </span>
            </Link>

            <Link
              to="/cotizaciones"
              className="home-action"
            >
              <div>
                <strong>
                  Nueva cotización
                </strong>

                <span>
                  Calcular costo y precio
                  de venta.
                </span>
              </div>

              <span className="home-action-arrow">
                →
              </span>
            </Link>

          </div>

        </div>

      </section>

      {/* =========================
          RECETAS
      ========================= */}

      <section className="home-panel home-recetas">

        <div className="home-panel-header">
          <div>
            <p className="home-panel-subtitle">
              Producción
            </p>

            <h2>
              Resumen de recetas
            </h2>
          </div>
        </div>

        {recetasConCosto.length === 0 ? (
          <div className="home-empty">
            <p>
              No hay recetas registradas todavía.
            </p>
          </div>
        ) : (
          <div className="home-recetas-list">

            {recetasConCosto
              .slice(0, 5)
              .map((receta) => (
                <div
                  className="home-receta"
                  key={receta.id}
                >
                  <div>
                    <strong>
                      {receta.nombre}
                    </strong>

                    <span>
                      Rendimiento:{" "}
                      {receta.rendimiento}{" "}
                      {receta.unidadRendimiento}
                    </span>
                  </div>

                  <div className="home-receta-costos">

                    <div>
                      <span>
                        Costo total
                      </span>

                      <strong>
                        {formatearMoneda(
                          receta.costoTotal
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Costo por unidad
                      </span>

                      <strong>
                        {formatearMoneda(
                          receta.costoPorUnidad
                        )}
                      </strong>
                    </div>

                  </div>
                </div>
              ))}

          </div>
        )}

      </section>

      {/* =========================
          ÚLTIMA COTIZACIÓN
      ========================= */}

      <section className="home-panel home-actividad">

        <div className="home-panel-header">
          <div>
            <p className="home-panel-subtitle">
              Actividad
            </p>

            <h2>
              Última cotización
            </h2>
          </div>
        </div>

        {ultimaCotizacion ? (
          <div className="home-ultima-cotizacion">

            <div>
              <span>
                Cotización
              </span>

              <strong>
                {ultimaCotizacion.nombre}
              </strong>
            </div>

            <div>
              <span>
                Precio sugerido
              </span>

              <strong>
                {formatearMoneda(
                  ultimaCotizacion.precioSugerido
                )}
              </strong>
            </div>

          </div>
        ) : (
          <div className="home-empty">
            <p>
              Todavía no has creado ninguna
              cotización.
            </p>
          </div>
        )}

      </section>

    </main>
  );
}

export default Home;