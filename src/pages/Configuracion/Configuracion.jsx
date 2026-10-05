import { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import "./Configuracion.css";
import { getNegocioActivoId, sincronizarNegocioActivo } from "../../context/negocioContext";
import { guardarImagenNegocio, obtenerImagenNegocio, eliminarImagenNegocio } from "../../utils/imagenStorage";
import { getNegocioActivoDesdeServidor, updateNegocio } from "../../services/negocioServices";
import { speakText, speechSupported, stopSpeech } from "../../utils/textToSpeech";
import { obtenerTipoCambioUSDCRC } from "../../services/tipoCambioServices";

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
  const { usuario } = useAuth();
  const esAdministrador = usuario?.rol === "administrador";
  const [seccionActiva, setSeccionActiva] = useState(esAdministrador ? "negocio" : "apariencia");
  const [negocio, setNegocio] = useState({
    nombre: "",
    tipo: "",
    telefono: "",
    correo: "",
    imagen: "",
  });
  const [margen, setMargen] = useState("30");
  const [tema, setTema] = useState(() => localStorage.getItem("sweetcost-tema") || "claro");
  const [tamanoTexto, setTamanoTexto] = useState(() => localStorage.getItem("sweetcost-tamano-texto") || "medio");
  const [daltonismo, setDaltonismo] = useState(() => localStorage.getItem("sweetcost-daltonismo") || "normal");
  const [altoContraste, setAltoContraste] = useState(() => localStorage.getItem("sweetcost-alto-contraste") === "true");
  const [lecturaTexto, setLecturaTexto] = useState(() => localStorage.getItem("sweetcost-lectura-texto") === "true");
  const [cargandoNegocio, setCargandoNegocio] = useState(true);
  const [guardandoNegocio, setGuardandoNegocio] = useState(false);
  const [mensajeNegocio, setMensajeNegocio] = useState("");
  const [mensajeCostos, setMensajeCostos] = useState("");
  const [procesandoImagenNegocio, setProcesandoImagenNegocio] = useState(false);
  const [imagenNegocioUrl, setImagenNegocioUrl] = useState("");
  const [tipoCambio, setTipoCambio] = useState(null);
  const [cargandoTipoCambio, setCargandoTipoCambio] = useState(false);
  const [errorTipoCambio, setErrorTipoCambio] = useState("");

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

  useEffect(() => {
    guardarPreferencia("sweetcost-lectura-texto", String(lecturaTexto));
  }, [lecturaTexto]);

  useEffect(() => {
    if (!esAdministrador || seccionActiva !== "costos") return undefined;

    let activo = true;
    setCargandoTipoCambio(true);
    setErrorTipoCambio("");

    obtenerTipoCambioUSDCRC()
      .then((resultado) => {
        if (activo) setTipoCambio(resultado);
      })
      .catch((error) => {
        if (activo) {
          setTipoCambio(null);
          setErrorTipoCambio(error.message || "No se pudo consultar el tipo de cambio.");
        }
      })
      .finally(() => {
        if (activo) setCargandoTipoCambio(false);
      });

    return () => {
      activo = false;
    };
  }, [esAdministrador, seccionActiva]);

  useEffect(() => {
    let activo = true;
    const cargarNegocio = async () => {
      try {
        const datos = await getNegocioActivoDesdeServidor();
        if (!activo) return;
        const imagenGuardada = await obtenerImagenNegocio(datos.id);
        if (imagenGuardada) setImagenNegocioUrl(imagenGuardada);
        setNegocio((prev) => ({ ...prev, ...datos, imagen: imagenGuardada || "" }));
        setMargen(String(datos.margenGanancia ?? 30));
      } catch (error) {
        console.error(error);
        if (activo) setMensajeNegocio("No se pudieron cargar los datos del negocio.");
      } finally {
        if (activo) setCargandoNegocio(false);
      }
    };
    cargarNegocio();
    return () => { activo = false; };
  }, [usuario?.id, usuario?.negocioId]);

  useEffect(() => {
    return () => {
      if (imagenNegocioUrl) URL.revokeObjectURL(imagenNegocioUrl);
    };
  }, [imagenNegocioUrl]);

  useEffect(() => () => stopSpeech(), []);

  useEffect(() => {
    // La lectura se administra globalmente desde AppRoutes para que no se
    // desactive al salir de Configuración. Aquí solo sincronizamos la
    // preferencia guardada con el resto de la aplicación.
    if (!speechSupported) return;
    window.dispatchEvent(
      new CustomEvent("sweetcost-tts-change", { detail: lecturaTexto })
    );
  }, [lecturaTexto]);

  const actualizar = (campo, valor) => {
    setNegocio((prev) => ({ ...prev, [campo]: valor }));
  };

  const seleccionarImagenNegocio = async (event) => {
    const archivo = event.target.files?.[0];
    event.target.value = "";
    if (!archivo) return;

    setProcesandoImagenNegocio(true);
    setMensajeNegocio("");
    try {
      const id = getNegocioActivoId();
      const url = await guardarImagenNegocio(archivo, id);
      setImagenNegocioUrl(url);
      actualizar("imagen", url);
    } catch (error) {
      console.error(error);
      setMensajeNegocio("No se pudo procesar la imagen. Usa un archivo JPG, PNG o WEBP.");
    } finally {
      setProcesandoImagenNegocio(false);
    }
  };

  const quitarImagenNegocio = async () => {
    try {
      await eliminarImagenNegocio(getNegocioActivoId());
      if (imagenNegocioUrl) URL.revokeObjectURL(imagenNegocioUrl);
      setImagenNegocioUrl("");
      actualizar("imagen", "");
      setMensajeNegocio("");
    } catch (error) {
      console.error(error);
      setMensajeNegocio("No se pudo quitar la imagen.");
    }
  };

  const guardarNegocio = async () => {
    setGuardandoNegocio(true);
    setMensajeNegocio("");
    try {
      const actualizado = await updateNegocio(getNegocioActivoId(), {
        nombre: negocio.nombre.trim(),
        tipo: negocio.tipo.trim(),
        telefono: negocio.telefono.trim(),
        correo: negocio.correo.trim(),
      });
      const negocioSinImagen = { ...actualizado, imagen: imagenNegocioUrl };
      setNegocio((prev) => ({ ...prev, ...negocioSinImagen }));
      sincronizarNegocioActivo(negocioSinImagen);
      setMensajeNegocio("Cambios guardados correctamente.");
    } catch (error) {
      console.error(error);
      setMensajeNegocio("No se pudieron guardar los cambios. Verifica que json-server esté activo.");
    } finally {
      setGuardandoNegocio(false);
    }
  };

  const guardarCostos = async () => {
    setMensajeCostos("");
    try {
      const valor = Math.min(100, Math.max(0, Number(margen) || 0));
      const actualizado = await updateNegocio(getNegocioActivoId(), { margenGanancia: valor });
      setMargen(String(actualizado.margenGanancia ?? valor));
      sincronizarNegocioActivo(actualizado);
      setMensajeCostos("Margen guardado correctamente.");
    } catch (error) {
      console.error(error);
      setMensajeCostos("No se pudo guardar el margen. Verifica que json-server esté activo.");
    }
  };

  const probarLectura = () => {
    if (!speechSupported) return;

    // La prueba se ejecuta directamente desde el click para conservar el
    // permiso de reproducción de voz que conceden Chrome/Opera al usuario.
    stopSpeech();
    const funciono = speakText(
      "Esta es una prueba de lectura de Sweet Cost. Si escuchas esta frase, la lectura en voz alta está funcionando correctamente."
    );

    if (!funciono) {
      console.warn("No fue posible iniciar la prueba de lectura.");
    }
  };

  const seccionesVisibles = esAdministrador
    ? secciones
    : secciones.filter((seccion) => ["apariencia", "accesibilidad"].includes(seccion.id));

  const seccionRenderizada = !esAdministrador && !["apariencia", "accesibilidad"].includes(seccionActiva)
    ? "apariencia"
    : seccionActiva;

  return (
    <main className="configuracion-page">
      <header className="configuracion-header">
        <div>
          <h1>Configuración</h1>
          <p>Administra las preferencias y datos de tu negocio.</p>
        </div>
      </header>

      <div className="configuracion-layout">
        <aside className="configuracion-nav" aria-label="Secciones de configuración">
          {seccionesVisibles.map((seccion) => (
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
          {seccionRenderizada === "negocio" && (
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

              <div className="configuracion-business-image">
                <div className="configuracion-business-image-preview">
                  {imagenNegocioUrl ? (
                    <img src={imagenNegocioUrl} alt={`Logo de ${negocio.nombre}`} />
                  ) : (
                    <span>{(negocio.nombre || "SC").slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <div className="configuracion-business-image-copy">
                  <strong>Imagen del negocio</strong>
                  <p>Esta imagen aparecerá en el selector del negocio del menú lateral.</p>
                  {esAdministrador ? (
                    <div className="configuracion-business-image-actions">
                      <label className="configuracion-secondary configuracion-file-button">
                        {procesandoImagenNegocio ? "Procesando..." : "Agregar imagen"}
                        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={seleccionarImagenNegocio} disabled={procesandoImagenNegocio} />
                      </label>
                      {imagenNegocioUrl && (
                        <button type="button" className="configuracion-secondary configuracion-danger-button" onClick={quitarImagenNegocio}>Quitar</button>
                      )}
                    </div>
                  ) : (
                    <small>Solo el administrador puede cambiar la imagen del negocio.</small>
                  )}
                </div>
              </div>
              <div className="configuracion-actions">{mensajeNegocio && <p className={`configuracion-feedback ${mensajeNegocio.startsWith("Cambios") ? "success" : "error"}`} role="status" aria-live="polite">{mensajeNegocio}</p>}<button type="button" className="configuracion-primary" onClick={guardarNegocio} disabled={guardandoNegocio || cargandoNegocio}>{guardandoNegocio ? "Guardando..." : "Guardar cambios"}</button></div>
            </div>
          )}

          {seccionRenderizada === "costos" && (
            <div className="configuracion-card">
              <div className="configuracion-card-header">
                <div><span className="configuracion-card-label">Precios</span><h2>Costos y precios</h2><p>Define un margen de ganancia de referencia para tus productos.</p></div>
              </div>
              <div className="configuracion-form-grid configuracion-form-grid--single">
                <label><span>Margen de ganancia predeterminado (%)</span><input type="number" min="0" max="100" value={margen} onChange={(e) => setMargen(e.target.value)} /></label>
              </div>
              <div className="configuracion-info"><strong>¿Cómo se utiliza?</strong><p>Este valor puede servir como referencia al calcular precios sugeridos. Podrás ajustarlo en cada producto cuando sea necesario.</p></div>

              <div className="configuracion-exchange-card" aria-live="polite">
                <div>
                  <span className="configuracion-card-label">Referencia externa</span>
                  <strong>Tipo de cambio USD / CRC</strong>
                  <p>Consulta informativa para apoyar la lectura de precios en dólares. No modifica los registros de Sweet Cost.</p>
                </div>
                <div className="configuracion-exchange-value">
                  {cargandoTipoCambio ? (
                    <span>Consultando...</span>
                  ) : tipoCambio ? (
                    <>
                      <strong>₡{tipoCambio.rate.toLocaleString("es-CR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                      <small>por USD · {tipoCambio.date || "último dato disponible"}</small>
                    </>
                  ) : (
                    <span>{errorTipoCambio || "No disponible"}</span>
                  )}
                </div>
              </div>

              <div className="configuracion-actions">{mensajeCostos && <p className={`configuracion-feedback ${mensajeCostos.startsWith("Margen") ? "success" : "error"}`} role="status" aria-live="polite">{mensajeCostos}</p>}<button type="button" className="configuracion-primary" onClick={guardarCostos}>Guardar cambios</button></div>
            </div>
          )}

          {seccionRenderizada === "unidades" && (
            <div className="configuracion-card">
              <div className="configuracion-card-header"><div><span className="configuracion-card-label">Medidas</span><h2>Unidades</h2><p>Unidades disponibles para insumos y recetas.</p></div></div>
              <div className="configuracion-unidades">
                {["Kilogramo (kg)", "Gramo (g)", "Litro (L)", "Mililitro (ml)", "Unidad (ud)", "Docena (doc)"].map((unidad) => <span key={unidad}>{unidad}</span>)}
              </div>
            </div>
          )}

          {seccionRenderizada === "apariencia" && (
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

          {seccionRenderizada === "accesibilidad" && (
            <div className="configuracion-card">
              <div className="configuracion-card-header"><div><span className="configuracion-card-label">Accesibilidad</span><h2>Accesibilidad</h2><p>Configura opciones visuales para facilitar el uso de la interfaz.</p></div></div>

              <div className="configuracion-setting">
                <div><strong>Mayor contraste</strong><p>Aumenta el contraste de superficies, textos y bordes de la interfaz.</p></div>
                <button type="button" className={`configuracion-switch${altoContraste ? " active" : ""}`} aria-pressed={altoContraste} onClick={() => setAltoContraste((prev) => !prev)}><span /></button>
              </div>

              <div className="configuracion-setting">
                <div><strong>Lectura de texto</strong><p>Activa la lectura en voz alta. Al mantener el cursor sobre un texto durante un instante, Sweet Cost lo leerá automáticamente.</p></div>
                <button
                  type="button"
                  className={`configuracion-switch${lecturaTexto ? " active" : ""}`}
                  aria-pressed={lecturaTexto}
                  onClick={() => {
                    const activar = !lecturaTexto;
                    setLecturaTexto(activar);
                    if (activar) {
                      speakText("Lectura de texto activada.");
                    } else {
                      stopSpeech();
                    }
                  }}
                  disabled={!speechSupported}
                >
                  <span />
                </button>
              </div>

              <div className="configuracion-voice-actions">
                <div><strong>{speechSupported ? "Prueba de lectura" : "Lectura no disponible"}</strong><p>{speechSupported ? "Escucha una frase de prueba para comprobar que la lectura está activa." : "Tu navegador no admite la lectura de texto mediante Web Speech API."}</p></div>
                <button type="button" className="configuracion-secondary" onClick={probarLectura} disabled={!speechSupported || !lecturaTexto}>Probar lectura</button>
                <button type="button" className="configuracion-secondary" onClick={stopSpeech} disabled={!speechSupported}>Detener</button>
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
