/**
 * Utilidades de validación y formateo de teléfonos móviles de Perú (+51)
 */

export function cleanPhone(phone: string): string {
  return phone.replace(/[\s\-\(\)]/g, "");
}

/**
 * Valida formato E.164 peruano: +51 seguido de 9 dígitos empezando en 9
 * Ej: +51987654321
 */
export function isValidPeruvianPhone(phone: string): boolean {
  const cleaned = cleanPhone(phone);
  return /^\+519\d{8}$/.test(cleaned);
}

/**
 * Normaliza cualquier entrada común a formato E.164:
 * "987654321" -> "+51987654321"
 * "51987654321" -> "+51987654321"
 * "+51 987 654 321" -> "+51987654321"
 */
export function normalizePhoneToE164(phone: string): string {
  let cleaned = cleanPhone(phone);
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.slice(1);
  }
  if (!cleaned.startsWith("+")) {
    if (cleaned.startsWith("51")) {
      cleaned = `+${cleaned}`;
    } else {
      cleaned = `+51${cleaned}`;
    }
  }
  return cleaned;
}

/**
 * Genera el número limpio para wa.me (sin el signo más)
 * Ej: "51987654321"
 */
export function phoneToWhatsAppNumber(phone: string): string {
  return normalizePhoneToE164(phone).replace("+", "");
}
