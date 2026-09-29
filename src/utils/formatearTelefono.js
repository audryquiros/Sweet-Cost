/**
 * Formatea teléfonos de Costa Rica al formato 0000-0000.
 * Acepta espacios, guiones, paréntesis y otros caracteres, pero conserva
 * únicamente los primeros 8 dígitos.
 */
export const formatearTelefono = (valor = "") => {
  const digitos = String(valor).replace(/\D/g, "").slice(0, 8);

  if (digitos.length <= 4) return digitos;
  return `${digitos.slice(0, 4)}-${digitos.slice(4)}`;
};

export const telefonoCompleto = (valor = "") => {
  const digitos = String(valor).replace(/\D/g, "");
  return digitos.length === 8;
};
