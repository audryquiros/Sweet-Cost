const THEME_KEY = "sweetcost-tema";
const FONT_SIZE_KEY = "sweetcost-tamano-texto";
const COLOR_VISION_KEY = "sweetcost-daltonismo";
const CONTRAST_KEY = "sweetcost-alto-contraste";

export function applyStoredAppearance() {
  const root = document.documentElement;
  const tema = localStorage.getItem(THEME_KEY) || "claro";
  const tamanoTexto = localStorage.getItem(FONT_SIZE_KEY) || "medio";
  const daltonismo = localStorage.getItem(COLOR_VISION_KEY) || "normal";
  const altoContraste = localStorage.getItem(CONTRAST_KEY) === "true";

  root.dataset.theme = tema;
  root.dataset.fontSize = tamanoTexto;
  root.dataset.colorVision = daltonismo;
  root.dataset.contrast = altoContraste ? "alto" : "normal";
}

export function installAppearanceSync() {
  applyStoredAppearance();

  const handleStorage = (event) => {
    if ([THEME_KEY, FONT_SIZE_KEY, COLOR_VISION_KEY, CONTRAST_KEY].includes(event.key)) {
      applyStoredAppearance();
    }
  };

  const handleVisibility = () => {
    if (!document.hidden) applyStoredAppearance();
  };

  window.addEventListener("storage", handleStorage);
  document.addEventListener("visibilitychange", handleVisibility);

  return () => {
    window.removeEventListener("storage", handleStorage);
    document.removeEventListener("visibilitychange", handleVisibility);
  };
}
