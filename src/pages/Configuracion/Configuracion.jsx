import { useEffect, useState } from "react";
import "./Configuracion.css";

const secciones = [
  { id: "negocio", titulo: "Negocio", descripcion: "Información general de tu negocio." },
  { id: "costos", titulo: "Costos y precios", descripcion: "Define el margen que usarás para tus productos." },
  { id: "unidades", titulo: "Unidades", descripcion: "Consulta las unidades disponibles para tus registros." },
  { id: "apariencia", titulo: "Apariencia", descripcion: "Personaliza el tema y tamaño del texto." },
  { id: "accesibilidad", titulo: "Accesibilidad", descripcion: "Ajusta contraste y opciones para daltonismo." },
];

const temas = [
  { id: "claro", titulo: "Claro", descripcion: "Interfaz clara con la paleta de Sweet Cost." },
  { id: "oscuro", titulo: "Oscuro", descripcion: "Superficies oscuras para ambientes con poca luz." },
];

const tamanosTexto = [
  { id: "pequeno", titulo: "Pequeño", ejemplo: "Aa" },
  { id: "medio", titulo: "Medio", ejemplo: "Aa" },
  { id: "grande", titulo: "Grande", ejemplo: "Aa" },
];

const modosDaltonismo = [
  { id: "normal", titulo: "Normal", descripcion: "Colores originales de Sweet Cost." },
  { id: "protanopia", titulo: "Protanopia", descripcion: "Ajuste para menor percepción del rojo." },
  { id: "deuteranopia", titulo: "Deuteranopia", descripcion: "Ajuste para menor percepción del verde." },
  { id: "tritanopia", titulo: "Tritanopia", descripcion: "Ajuste para menor percepción del azul." },
];

function guardarPreferencia(clave, valor) {
  localStorage.setItem(clave, valor);
}

function aplicarPreferencias({ tema, tamanoTexto, daltonismo }) {
  const root = document.documentElement;
  root.dataset.theme = tema;
  root.dataset.fontSize = tamanoTexto;
  root.dataset.colorVision = daltonismo;
}

function Configuracion() {
  const [seccionActiva, setSeccionActiva] = useState("negocio");
  const [negocio, setNegocio] = useState({
    nombre: "Dulces Momentos",
    tipo: "Repostería",
    telefono: "8888-0000",
    correo: "contacto@dulcesmomentos.com",
  });
  const [margen, setMargen] = useState("30");
  const [tema, setTema] = useState(() => localStorage.getItem("sweetcost-tema") || "claro");
  const [tamanoTexto, setTamanoTexto] = useState(() => localStorage.getItem("sweetcost-tamano-texto") || "medio");
  const [daltonismo, setDaltonismo] = useState(() => localStorage.getItem("sweetcost-daltonismo") || "normal");
  const [altoContraste, setAltoContraste] = useState(() => localStorage.getItem("sweetcost-alto-contraste") === "true");

  useEffect(() => {
    aplicarPreferencias({ tema, tamanoTexto, daltonismo });
    guardarPreferencia("sweetcost-tema", tema);
    guardarPreferencia("sweetcost-tamano-texto", tamanoTexto);
    guardarPreferencia("sweetcost-daltonismo", daltonismo);
  }, [tema, tamanoTexto, daltonismo]);

  useEffect(() => {
    document.documentElement.dataset.contrast = altoContraste ? "alto" : "normal";
    guardarPreferencia("sweetcost-alto-contraste", String(altoContraste));
  }, [altoContraste]);

  const actualizar = (campo, valor) => {
    setNegocio((prev) => ({ ...prev, [campo]: valor }));
  };

  return (
    <main className="configuracion-page">
      <header className="configuracion-header">
        <div>
          <span className="configuracion-kicker">Preferencias</span>
          <h1>Configuración</h1>
          <p>Administra las preferencias y datos de tu negocio.</p>
        </div>
      </header>

      <div className="configuracion-layout">
        <aside className="configuracion-nav" aria-label="Secciones de configuración">
          {secciones.map((seccion) => (
            <button
              key={seccion.id}
              type="button"
              className={seccionActiva === seccion.id ? "active" : ""}
              onClick={() => setSeccionActiva(seccion.id)}
            >
              <span className="configuracion-nav-dot" />
              <span>
                <strong>{seccion.titulo}</strong>
                <small>{seccion.descripcion}</small>
              </span>
            </button>
          ))}
        </aside>

        <section className="configuracion-content">
          {seccionActiva === "negocio" && (
            <div className="configuracion-card">
              <div className="configuracion-card-header">
                <div>
                  <span className="configuracion-card-label">Información</span>
                  <h2>Datos del negocio</h2>
                  <p>Esta información identifica tu negocio dentro de Sweet Cost.</p>
                </div>
              </div>
              <div className="configuracion-form-grid">
                <label><span>Nombre del negocio</span><input value={negocio.nombre} onChange={(e) => actualizar("nombre", e.target.value)} /></label>
                <label><span>Tipo de negocio</span><input value={negocio.tipo} onChange={(e) => actualizar("tipo", e.target.value)} /></label>
                <label><span>Teléfono</span><input value={negocio.telefono} onChange={(e) => actualizar("telefono", e.target.value)} /></label>
                <label><span>Correo electrónico</span><input type="email" value={negocio.correo} onChange={(e) => actualizar("correo", e.target.value)} /></label>
              </div>
              <div className="configuracion-actions"><button type="button" className="configuracion-primary">Guardar cambios</button></div>
            </div>
          )}

          {seccionActiva === "costos" && (
            <div className="configuracion-card">
              <div className="configuracion-card-header">
                <div><span className="configuracion-card-label">Precios</span><h2>Costos y precios</h2><p>Define un margen de ganancia de referencia para tus productos.</p></div>
              </div>
              <div className="configuracion-form-grid configuracion-form-grid--single">
                <label><span>Margen de ganancia predeterminado (%)</span><input type="number" min="0" max="100" value={margen} onChange={(e) => setMargen(e.target.value)} /></label>
              </div>
              <div className="configuracion-info"><strong>¿Cómo se utiliza?</strong><p>Este valor puede servir como referencia al calcular precios sugeridos. Podrás ajustarlo en cada producto cuando sea necesario.</p></div>
              <div className="configuracion-actions"><button type="button" className="configuracion-primary">Guardar cambios</button></div>
            </div>
          )}

          {seccionActiva === "unidades" && (
            <div className="configuracion-card">
              <div className="configuracion-card-header"><div><span className="configuracion-card-label">Medidas</span><h2>Unidades</h2><p>Unidades disponibles para insumos y recetas.</p></div></div>
              <div className="configuracion-unidades">
                {["Kilogramo (kg)", "Gramo (g)", "Litro (L)", "Mililitro (ml)", "Unidad (ud)", "Docena (doc)"].map((unidad) => <span key={unidad}>{unidad}</span>)}
              </div>
            </div>
          )}

          {seccionActiva === "apariencia" && (
            <div className="configuracion-card">
              <div className="configuracion-card-header"><div><span className="configuracion-card-label">Interfaz</span><h2>Apariencia</h2><p>Personaliza cómo se presenta Sweet Cost en tu dispositivo.</p></div></div>

              <div className="configuracion-subsection">
                <div className="configuracion-subsection-heading"><strong>Tema</strong><span>Selecciona el aspecto general de la interfaz.</span></div>
                <div className="configuracion-option-grid configuracion-option-grid--themes">
                  {temas.map((opcion) => (
                    <button key={opcion.id} type="button" className={`configuracion-option-card ${tema === opcion.id ? "selected" : ""}`} onClick={() => setTema(opcion.id)} aria-pressed={tema === opcion.id}>
                      <span className={`configuracion-theme-preview ${opcion.id}`}><span /><span /><span /></span>
                      <span className="configuracion-option-copy"><strong>{opcion.titulo}</strong><small>{opcion.descripcion}</small></span>
                      <span className="configuracion-option-check">✓</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="configuracion-subsection">
                <div className="configuracion-subsection-heading"><strong>Tamaño del texto</strong><span>Ajusta el tamaño de lectura de toda la aplicación.</span></div>
                <div className="configuracion-text-size-grid">
                  {tamanosTexto.map((opcion) => (
                    <button key={opcion.id} type="button" className={`configuracion-text-size ${tamanoTexto === opcion.id ? "selected" : ""}`} onClick={() => setTamanoTexto(opcion.id)} aria-pressed={tamanoTexto === opcion.id}>
                      <span className={`configuracion-text-size-sample ${opcion.id}`}>{opcion.ejemplo}</span><strong>{opcion.titulo}</strong><span className="configuracion-option-check">✓</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {seccionActiva === "accesibilidad" && (
            <div className="configuracion-card">
              <div className="configuracion-card-header"><div><span className="configuracion-card-label">Accesibilidad</span><h2>Accesibilidad</h2><p>Configura opciones visuales para facilitar el uso de la interfaz.</p></div></div>

              <div className="configuracion-setting">
                <div><strong>Mayor contraste</strong><p>Aumenta el contraste de superficies, textos y bordes de la interfaz.</p></div>
                <button type="button" className={`configuracion-switch${altoContraste ? " active" : ""}`} aria-pressed={altoContraste} onClick={() => setAltoContraste((prev) => !prev)}><span /></button>
              </div>

              <div className="configuracion-subsection">
                <div className="configuracion-subsection-heading"><strong>Adaptación para daltonismo</strong><span>Selecciona una combinación de colores diseñada para diferenciar mejor estados y elementos.</span></div>
                <div className="configuracion-color-grid">
                  {modosDaltonismo.map((opcion) => (
                    <button key={opcion.id} type="button" className={`configuracion-color-option ${daltonismo === opcion.id ? "selected" : ""}`} onClick={() => setDaltonismo(opcion.id)} aria-pressed={daltonismo === opcion.id}>
                      <span className={`configuracion-color-swatch ${opcion.id}`}><i /><i /><i /></span>
                      <span className="configuracion-option-copy"><strong>{opcion.titulo}</strong><small>{opcion.descripcion}</small></span>
                      <span className="configuracion-option-check">✓</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Configuracion;
