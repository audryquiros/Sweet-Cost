const API_URL = "https://api.frankfurter.dev/v2/rate/usd/crc";

/**
 * Obtiene el tipo de cambio de referencia USD → CRC desde una API externa real.
 * No requiere API key y se utiliza únicamente como referencia visual; no modifica
 * precios ni datos del negocio.
 */
export async function obtenerTipoCambioUSDCRC() {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch(API_URL, { signal: controller.signal });
    if (!response.ok) {
      throw new Error("No se pudo consultar el tipo de cambio.");
    }

    const data = await response.json();
    const rate = Number(data?.rate);

    if (!Number.isFinite(rate) || rate <= 0) {
      throw new Error("La API no devolvió un tipo de cambio válido.");
    }

    return {
      rate,
      date: data?.date || null,
      base: data?.base || "USD",
      quote: data?.quote || "CRC",
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("La consulta del tipo de cambio tardó demasiado.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}
