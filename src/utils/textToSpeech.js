export const speechSupported =
  typeof window !== "undefined" &&
  "speechSynthesis" in window &&
  "SpeechSynthesisUtterance" in window;

// Elementos cuyo contenido visible puede leerse al pasar el cursor.
const READABLE_SELECTOR =
  "h1,h2,h3,h4,h5,h6,p,li,label,small,strong,em,span,a,td,th,legend,figcaption,button,[role=button]";

// No intentamos leer controles donde el cursor está editando/seleccionando contenido.
const IGNORED_SELECTOR = "input,textarea,select,option,img,svg,[data-no-tts]";

export function stopSpeech() {
  if (speechSupported) window.speechSynthesis.cancel();
}

export function speakText(text) {
  if (!speechSupported || !text?.trim()) return false;

  const contenido = text.replace(/\s+/g, " ").trim();
  if (!contenido) return false;

  stopSpeech();

  const utterance = new SpeechSynthesisUtterance(contenido);
  utterance.lang = "es-CR";
  utterance.rate = 0.95;
  utterance.pitch = 1;

  // Preferimos una voz en español cuando el navegador ya la tiene disponible.
  // Si todavía no hay voces cargadas, el navegador utilizará su voz predeterminada.
  const voces = window.speechSynthesis.getVoices();
  const vozEspanol = voces.find((voz) => /^es(?:-|$)/i.test(voz.lang));
  if (vozEspanol) utterance.voice = vozEspanol;

  // resume() ayuda en navegadores que dejan el motor de voz pausado después
  // de una lectura anterior. La llamada a speak() permanece dentro de la
  // interacción del usuario cuando se usa desde un botón.
  window.speechSynthesis.resume();
  window.speechSynthesis.speak(utterance);
  return true;
}

function obtenerElementoLegible(target) {
  if (!(target instanceof Element)) return null;
  if (target.closest(IGNORED_SELECTOR)) return null;

  // Primero intentamos el elemento semántico más cercano al texto bajo el cursor.
  const elemento = target.closest(READABLE_SELECTOR);
  if (!elemento || elemento.closest("[data-no-tts]")) return null;

  // Evita que un texto dentro de una tarjeta provoque que se lea toda la tarjeta.
  const texto = elemento.textContent?.replace(/\s+/g, " ").trim();
  if (!texto || texto.length < 2 || texto.length > 220) return null;

  return { elemento, texto };
}

export function enableHoverTextReading(delay = 550) {
  if (!speechSupported || typeof document === "undefined") return () => {};

  let elementoActual = null;
  let temporizador = null;

  const cancelar = () => {
    if (temporizador !== null) {
      window.clearTimeout(temporizador);
      temporizador = null;
    }
  };

  const alEntrar = (event) => {
    const legible = obtenerElementoLegible(event.target);
    if (!legible) return;

    if (legible.elemento === elementoActual) return;

    cancelar();
    elementoActual = legible.elemento;

    temporizador = window.setTimeout(() => {
      // Solo habla si el usuario sigue sobre el mismo elemento.
      if (elementoActual === legible.elemento) {
        speakText(legible.texto);
      }
      temporizador = null;
    }, delay);
  };

  const alSalir = (event) => {
    const legible = obtenerElementoLegible(event.target);
    if (!legible) return;

    const related = event.relatedTarget;
    if (related instanceof Node && legible.elemento.contains(related)) return;

    cancelar();
    if (legible.elemento === elementoActual) {
      elementoActual = null;
      stopSpeech();
    }
  };

  // pointerover funciona de forma más consistente que mouseover con trackpads,
  // mouse y elementos anidados.
  document.addEventListener("pointerover", alEntrar);
  document.addEventListener("pointerout", alSalir);

  return () => {
    cancelar();
    document.removeEventListener("pointerover", alEntrar);
    document.removeEventListener("pointerout", alSalir);
    elementoActual = null;
    stopSpeech();
  };
}
