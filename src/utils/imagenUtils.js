export function imagenFileADataUrl(file, opciones = {}) {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.82,
    mimeType = "image/webp",
  } = opciones;

  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Selecciona un archivo de imagen válido."));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imagen = new Image();
      imagen.onload = () => {
        const escala = Math.min(
          1,
          maxWidth / imagen.naturalWidth,
          maxHeight / imagen.naturalHeight
        );
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(imagen.naturalWidth * escala));
        canvas.height = Math.max(1, Math.round(imagen.naturalHeight * escala));

        const contexto = canvas.getContext("2d");
        contexto.drawImage(imagen, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL(mimeType, quality));
      };
      imagen.onerror = () => reject(new Error("No se pudo procesar la imagen."));
      imagen.src = reader.result;
    };

    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.readAsDataURL(file);
  });
}
