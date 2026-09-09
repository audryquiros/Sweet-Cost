import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <main className="home-page">
      <section className="home-header">
        <div>
          <p className="home-subtitle">
            Sweet Cost
          </p>

          <h1>
            Bienvenida
          </h1>

          <p className="home-description">
            Administra tus costos, recetas y cotizaciones
            desde un solo lugar.
          </p>
        </div>
      </section>

      <section className="home-modulos">
        <Link
          to="/productos"
          className="home-card"
        >
          <div className="home-card-content">
            <h2>Productos</h2>

            <p>
              Registra ingredientes, toppings y salsas
              utilizados en tus recetas.
            </p>
          </div>

          <span className="home-card-link">
            Ver productos
          </span>
        </Link>

        <Link
          to="/insumos"
          className="home-card"
        >
          <div className="home-card-content">
            <h2>Insumos</h2>

            <p>
              Administra empaques, cajas, bolsas,
              cubiertos y otros materiales.
            </p>
          </div>

          <span className="home-card-link">
            Ver insumos
          </span>
        </Link>

        <Link
          to="/recetas"
          className="home-card"
        >
          <div className="home-card-content">
            <h2>Recetas</h2>

            <p>
              Crea recetas y calcula automáticamente
              el costo de producción.
            </p>
          </div>

          <span className="home-card-link">
            Ver recetas
          </span>
        </Link>

        <Link
          to="/cotizaciones"
          className="home-card"
        >
          <div className="home-card-content">
            <h2>Cotizador</h2>

            <p>
              Arma productos para la venta y calcula
              su costo y precio sugerido.
            </p>
          </div>

          <span className="home-card-link">
            Crear cotización
          </span>
        </Link>
      </section>
    </main>
  );
}

export default Home;