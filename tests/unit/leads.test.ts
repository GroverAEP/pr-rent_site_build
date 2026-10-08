import { describe, it, expect, beforeEach } from "vitest";
import { getRepositories } from "../../src/shared/db/factory";
import { checkRateLimit } from "../../src/shared/lib/rate-limit";
import {
  isValidPeruvianPhone,
  normalizePhoneToE164,
  phoneToWhatsAppNumber,
} from "../../src/shared/lib/phone";
import { runSeed } from "../../scripts/seed";

describe("Leads & WhatsApp Redirection Engine", () => {
  beforeEach(async () => {
    await runSeed();
  });

  describe("Phone Formatting & Validation (Perú +51)", () => {
    it("valida números peruanos estándar de 9 dígitos", () => {
      expect(isValidPeruvianPhone("+51981234567")).toBe(true);
      expect(isValidPeruvianPhone("+51972345678")).toBe(true);
      expect(isValidPeruvianPhone("+51881234567")).toBe(false); // no empieza en 9
      expect(isValidPeruvianPhone("981234567")).toBe(false); // falta +51
    });

    it("normaliza números con distintos formatos a E.164", () => {
      expect(normalizePhoneToE164("981234567")).toBe("+51981234567");
      expect(normalizePhoneToE164("0981234567")).toBe("+51981234567");
      expect(normalizePhoneToE164("51981234567")).toBe("+51981234567");
      expect(normalizePhoneToE164("+51 981 234 567")).toBe("+51981234567");
    });

    it("extrae el número limpio para wa.me sin el símbolo más", () => {
      expect(phoneToWhatsAppNumber("+51981234567")).toBe("51981234567");
      expect(phoneToWhatsAppNumber("981234567")).toBe("51981234567");
    });
  });

  describe("Rate Limiting", () => {
    it("permite solicitudes dentro del límite y bloquea al exceder", () => {
      const key = `test-ip-${Date.now()}`;
      // Límite de 3 solicitudes
      const r1 = checkRateLimit(key, 3, 10);
      expect(r1.allowed).toBe(true);
      expect(r1.remaining).toBe(2);

      const r2 = checkRateLimit(key, 3, 10);
      expect(r2.allowed).toBe(true);
      expect(r2.remaining).toBe(1);

      const r3 = checkRateLimit(key, 3, 10);
      expect(r3.allowed).toBe(true);
      expect(r3.remaining).toBe(0);

      const r4 = checkRateLimit(key, 3, 10);
      expect(r4.allowed).toBe(false);
      expect(r4.remaining).toBe(0);
      expect(r4.resetIn).toBeGreaterThan(0);
    });
  });

  describe("Lead Repository Operations", () => {
    it("registra un nuevo lead y actualiza métricas por local y por propietario", () => {
      const repos = getRepositories();
      const localId = "loc-001"; // pertenece a usr-owner-001 en seed

      const initialCount = repos.leads.countByLocalId(localId);

      repos.leads.create({
        id: `lead-test-${Date.now()}`,
        local_id: localId,
        origen: "detalle",
        user_agent_hash: "hash123",
        ip_hash: "iphash123",
      });

      return Promise.all([
        initialCount,
        repos.leads.countByLocalId(localId),
        repos.leads.countByOwnerId("usr-owner-001"),
      ]).then(([init, after, ownerCount]) => {
        expect(after).toBe(init + 1);
        expect(ownerCount).toBeGreaterThanOrEqual(1);
      });
    });

    it("obtiene el resumen estadístico de leads (total y últimos 7 días)", async () => {
      const repos = getRepositories();
      const summary = await repos.leads.getStatsSummary();
      expect(summary.totalLeads).toBeGreaterThanOrEqual(3); // del seed
      expect(summary.last7Days).toBeGreaterThanOrEqual(3);
    });
  });
});
