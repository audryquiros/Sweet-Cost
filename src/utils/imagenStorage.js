const DB_NAME = "sweetcost-media";
const STORE_NAME = "imagenes";
const DB_VERSION = 1;

function abrirDB() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB no está disponible en este navegador."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("No se pudo abrir el almacenamiento de imágenes."));
  });
}

export async function guardarImagenNegocio(file, negocioId) {
  if (!file || !negocioId) throw new Error("Faltan datos para guardar la imagen.");

  const blob = await comprimirImagen(file);
  const db = await abrirDB();

  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(blob, `negocio:${negocioId}`);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error || new Error("No se pudo guardar la imagen."));
  });

  db.close();
  return obtenerImagenNegocio(negocioId);
}

export async function obtenerImagenNegocio(negocioId) {
  if (!negocioId) return "";

  const db = await abrirDB();
  const blob = await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(`negocio:${negocioId}`);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
  db.close();

  return blob ? URL.createObjectURL(blob) : "";
}

export async function eliminarImagenNegocio(negocioId) {
  if (!negocioId) return;

  const db = await abrirDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(`negocio:${negocioId}`);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function comprimirImagen(file) {
  if (!file.type?.startsWith("image/")) {
    throw new Error("Selecciona un archivo de imagen válido.");
  }

  const dataUrl = await leerComoDataUrl(file);
  const imagen = await cargarImagen(dataUrl);
  const maxSize = 700;
  const escala = Math.min(1, maxSize / Math.max(imagen.naturalWidth, imagen.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(imagen.naturalWidth * escala));
  canvas.height = Math.max(1, Math.round(imagen.naturalHeight * escala));

  const contexto = canvas.getContext("2d");
  contexto.drawImage(imagen, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("No se pudo comprimir la imagen.")),
      "image/jpeg",
      0.78
    );
  });
}

function leerComoDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });
}

function cargarImagen(src) {
  return new Promise((resolve, reject) => {
    const imagen = new Image();
    imagen.onload = () => resolve(imagen);
    imagen.onerror = () => reject(new Error("No se pudo procesar la imagen."));
    imagen.src = src;
  });
}
