import { describe, it, expect } from "vitest";
import { formatPrice } from "@/shared/lib/currency";
import {
  isValidPeruvianPhone,
  normalizePhoneToE164,
  phoneToWhatsAppNumber,
} from "@/shared/lib/phone";
import { generateSlug } from "@/shared/lib/slug";
import { checkRateLimit } from "@/shared/lib/rate-limit";

describe("Shared Utilities", () => {
  describe("Currency Formatter", () => {
    it("debe formatear precios en soles correctamente", () => {
      expect(formatPrice(4500, "PEN")).toBe("S/ 4,500");
      expect(formatPrice(12500.5, "PEN")).toBe("S/ 12,500.5");
    });

    it("debe formatear precios en dólares correctamente", () => {
      expect(formatPrice(1800, "USD")).toBe("US$ 1,800");
    });
  });

  describe("Phone Formatter & Validator", () => {
    it("debe validar números peruanos E.164 válidos (+519XXXXXXXX)", () => {
      expect(isValidPeruvianPhone("+51987654321")).toBe(true);
      expect(isValidPeruvianPhone("+51 987 654 321")).toBe(true);
      expect(isValidPeruvianPhone("+51887654321")).toBe(false); // No empieza en 9
      expect(isValidPeruvianPhone("+1234567890")).toBe(false);
    });

    it("debe normalizar números a formato E.164", () => {
      expect(normalizePhoneToE164("987654321")).toBe("+51987654321");
      expect(normalizePhoneToE164("51987654321")).toBe("+51987654321");
      expect(normalizePhoneToE164("+51 987 654 321")).toBe("+51987654321");
    });

    it("debe generar el formato adecuado para WhatsApp API", () => {
      expect(phoneToWhatsAppNumber("+51987654321")).toBe("51987654321");
      expect(phoneToWhatsAppNumber("987654321")).toBe("51987654321");
    });
  });

  describe("Slug Generator", () => {
    it("debe normalizar acentos y caracteres especiales", () => {
      const slug = generateSlug("¡Local Comercial en Miraflores & San Isidro!");
      expect(slug).toBe("local-comercial-en-miraflores-san-isidro");
    });

    it("debe agregar sufijo si se especifica", () => {
      const slug = generateSlug("Local en Surco", "abc12");
      expect(slug).toBe("local-en-surco-abc12");
    });
  });

  describe("Rate Limiter", () => {
    it("debe permitir solicitudes dentro del límite y bloquear excedentes", () => {
      const key = `test-ip-${Date.now()}`;
      const res1 = checkRateLimit(key, 2, 60);
      expect(res1.allowed).toBe(true);
      expect(res1.remaining).toBe(1);

      const res2 = checkRateLimit(key, 2, 60);
      expect(res2.allowed).toBe(true);
      expect(res2.remaining).toBe(0);

      const res3 = checkRateLimit(key, 2, 60);
      expect(res3.allowed).toBe(false);
    });
  });
});
