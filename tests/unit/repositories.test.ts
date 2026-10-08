import { describe, it, expect, beforeAll } from "vitest";
import { getRepositories } from "@/shared/db/factory";
import { runSeed } from "../../scripts/seed";
import { env } from "@/shared/config/env";

describe("SQLite Repositories & Domain Rules", () => {
  const repos = getRepositories();

  beforeAll(async () => {
    // Inicializar BD con seed
    await runSeed();
  });

  describe("User Repository & Single Admin Invariant", () => {
    it("debe encontrar al administrador existente", async () => {
      const admin = await repos.users.findAdmin();
      expect(admin).not.toBeNull();
      expect(admin?.role).toBe("admin");
      expect(admin?.email).toBe(env.ADMIN_EMAIL.toLowerCase());
    });

    it("debe impedir la creación de un segundo administrador (regla de negocio inviolable)", async () => {
      await expect(
        repos.users.create({
          id: "fake-admin-2",
          role: "admin",
          nombre: "Impostor Admin",
          email: "impostor@localvista.pe",
          password_hash: "hash",
          telefono_whatsapp: "+51999888777",
          nombre_negocio: null,
          estado: "activo",
        })
      ).rejects.toThrow("Solo puede existir un único administrador");
    });

    it("debe listar propietarios filtrados por estado", async () => {
      const activeOwners = await repos.users.list({
        role: "owner",
        estado: "activo",
      });
      expect(activeOwners.length).toBeGreaterThanOrEqual(3);

      const pendingOwners = await repos.users.list({
        role: "owner",
        estado: "pendiente",
      });
      expect(pendingOwners.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Local Repository & Search Engine", () => {
    it("debe buscar locales por distrito y devolver configuración 3D deserializada", async () => {
      const result = await repos.locales.search({ distrito: "Miraflores" });
      expect(result.items.length).toBeGreaterThan(0);

      const local = result.items[0];
      expect(local.distrito).toBe("Miraflores");
      expect(local.tour_config).toBeDefined();
      expect(local.tour_config.dimensions.width).toBeGreaterThan(0);
      expect(local.caracteristicas).toBeDefined();
    });

    it("debe filtrar por rango de precio y ordenación", async () => {
      const result = await repos.locales.search({
        minPrecio: 4000,
        maxPrecio: 8000,
        orderBy: "precio_asc",
      });

      expect(result.items.length).toBeGreaterThan(0);
      for (const item of result.items) {
        expect(item.precio).toBeGreaterThanOrEqual(4000);
        expect(item.precio).toBeLessThanOrEqual(8000);
      }
    });

    it("debe buscar por slug único", async () => {
      const local = await repos.locales.findBySlug(
        "local-puerta-a-calle-av-larco-miraflores"
      );
      expect(local).not.toBeNull();
      expect(local?.titulo).toContain("Av. Larco");
      expect(local?.tour_config.hotspots.length).toBeGreaterThan(0);
    });
  });

  describe("Lead Repository & Analytics", () => {
    it("debe registrar leads y contabilizar clics", async () => {
      const newLeadId = `test-lead-${Date.now()}`;
      await repos.leads.create({
        id: newLeadId,
        local_id: "loc-001",
        origen: "tour3d",
        user_agent_hash: "hash-ua-test",
        ip_hash: "hash-ip-test",
      });

      const count = await repos.leads.countByLocalId("loc-001");
      expect(count).toBeGreaterThan(0);

      const stats = await repos.leads.getStatsSummary();
      expect(stats.totalLeads).toBeGreaterThan(0);
    });
  });

  describe("Audit Log Repository", () => {
    it("debe registrar eventos de auditoría y listarlos en orden descendente", async () => {
      await repos.audit.create({
        id: `audit-${Date.now()}`,
        actor_id: "usr-admin-001",
        accion: "TEST_EVENT",
        entidad: "locales",
        entidad_id: "loc-001",
        detalle: { test: true },
      });

      const logs = await repos.audit.listRecent(5);
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].accion).toBe("TEST_EVENT");
    });
  });
});
