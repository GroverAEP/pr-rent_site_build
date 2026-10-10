import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupabaseUserRepository } from "@/modules/users";
import { SupabaseLocalRepository } from "@/modules/locales";
import { SupabaseLeadRepository } from "@/modules/leads";
import { SupabaseAuditLogRepository } from "@/modules/admin";
import { SupabaseStorageService } from "@/modules/media";
import * as supabaseDriver from "@/shared/db/supabase.driver";
import type { SupabaseClient } from "@supabase/supabase-js";

describe("Supabase Repositories Adapter Suite (Fase 8)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("SupabaseUserRepository", () => {
    it("debe consultar usuario por ID y formatear correctamente", async () => {
      const mockUser = {
        id: "usr-test-1",
        role: "owner",
        nombre: "Test Owner",
        email: "owner@test.com",
        password_hash: "hash",
        telefono_whatsapp: "+51999999999",
        nombre_negocio: "Negocio Test",
        estado: "activo",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockUser, error: null }),
          }),
        }),
      });

      vi.spyOn(supabaseDriver, "getSupabaseServiceClient").mockReturnValue({
        from: mockFrom,
      } as unknown as SupabaseClient);

      const repo = new SupabaseUserRepository();
      const user = await repo.findById("usr-test-1");

      expect(user).not.toBeNull();
      expect(user?.email).toBe("owner@test.com");
      expect(mockFrom).toHaveBeenCalledWith("users");
    });

    it("debe prevenir creación de segundo admin en Supabase", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ count: 1, error: null }),
        }),
      });

      vi.spyOn(supabaseDriver, "getSupabaseServiceClient").mockReturnValue({
        from: mockFrom,
      } as unknown as SupabaseClient);

      const repo = new SupabaseUserRepository();

      await expect(
        repo.create({
          id: "fake-admin",
          role: "admin",
          nombre: "Fake",
          email: "fake@admin.com",
          password_hash: "pass",
          telefono_whatsapp: "+51987654321",
          nombre_negocio: null,
          estado: "activo",
        })
      ).rejects.toThrow("Solo puede existir un único administrador");
    });
  });

  describe("SupabaseLocalRepository", () => {
    it("debe mapear correctamente un local con datos JSONB deserializados", async () => {
      const mockRawLocal = {
        id: "loc-test-1",
        owner_id: "usr-1",
        slug: "local-test-lima",
        titulo: "Local de Prueba",
        operacion: "alquiler",
        precio: 4500,
        moneda: "PEN",
        area_m2: 85,
        direccion: "Av Larco 100",
        distrito: "Miraflores",
        ciudad: "Lima",
        lat: -12.12,
        lng: -77.03,
        descripcion: "Excelente ubicación",
        caracteristicas: { banos: 2, vitrina: true },
        rubros_sugeridos: ["Retail", "Cafetería"],
        estado: "publicado",
        portada_url: "/uploads/portada.jpg",
        tour_config: {
          version: 1,
          dimensions: { width: 6, depth: 10, height: 3 },
          architecture: {
            wallColor: "#fff",
            wallTexture: "smooth",
            floorMaterial: "ceramic",
            floorColor: "#eee",
            ceilingColor: "#fff",
            doorPosition: { wall: "front", offset: 0, width: 1.2, height: 2.4 },
            windows: [],
          },
          lighting: { ambientIntensity: 0.8, mode: "day", spotlights: [] },
          preset: "empty",
          hotspots: [],
          camera: {
            initialPosition: [0, 1.6, 4],
            initialTarget: [0, 1.5, 0],
            fov: 60,
          },
        },
        tour_glb_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockRawLocal, error: null }),
          }),
        }),
      });

      vi.spyOn(supabaseDriver, "getSupabaseServiceClient").mockReturnValue({
        from: mockFrom,
      } as unknown as SupabaseClient);

      const repo = new SupabaseLocalRepository();
      const local = await repo.findBySlug("local-test-lima");

      expect(local).not.toBeNull();
      expect(local?.titulo).toBe("Local de Prueba");
      expect(local?.caracteristicas.vitrina).toBe(true);
      expect(local?.rubros_sugeridos).toContain("Retail");
    });
  });

  describe("SupabaseLeadRepository", () => {
    it("debe consultar métricas de leads con getStatsSummary", async () => {
      const mockFrom = vi.fn().mockImplementation(() => {
        return {
          select: vi.fn().mockImplementation((_, opts: { head?: boolean } | undefined) => {
            if (opts?.head) {
              return {
                gte: vi.fn().mockResolvedValue({ count: 5, error: null }),
                then: (resolve: (val: { count: number; error: null }) => void) =>
                  resolve({ count: 20, error: null }),
              };
            }
            return {
              gte: vi.fn().mockResolvedValue({ count: 5, error: null }),
            };
          }),
        };
      });

      vi.spyOn(supabaseDriver, "getSupabaseServiceClient").mockReturnValue({
        from: mockFrom,
      } as unknown as SupabaseClient);

      const repo = new SupabaseLeadRepository();
      const stats = await repo.getStatsSummary();

      expect(stats).toBeDefined();
      expect(stats.totalLeads).toBe(20);
      expect(stats.last7Days).toBe(5);
    });
  });

  describe("SupabaseAuditLogRepository", () => {
    it("debe registrar un evento de auditoría en Supabase", async () => {
      const mockAuditLog = {
        id: "6c7633c3-a7a5-49ef-9b4f-dbd64ffcf60b",
        actor_id: "8e716b64-4746-4c12-9c16-f4b87f4e4a9f",
        accion: "LOCAL_APROBADO",
        entidad: "locales",
        entidad_id: "loc-123",
        detalle: { motivo: "Todo conforme" },
        created_at: new Date().toISOString(),
      };

      const mockInsert = vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockAuditLog, error: null }),
          }),
        });
      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });

      vi.spyOn(supabaseDriver, "getSupabaseServiceClient").mockReturnValue({
        from: mockFrom,
      } as unknown as SupabaseClient);

      const repo = new SupabaseAuditLogRepository();
      const created = await repo.create({
        id: "aud-001",
        actor_id: "8e716b64-4746-4c12-9c16-f4b87f4e4a9f",
        accion: "LOCAL_APROBADO",
        entidad: "locales",
        entidad_id: "loc-123",
        detalle: { motivo: "Todo conforme" },
      });

      expect(mockInsert).toHaveBeenCalledWith(
        expect.not.objectContaining({ id: expect.anything() })
      );
      expect(created.id).toBe("6c7633c3-a7a5-49ef-9b4f-dbd64ffcf60b");
      expect(created.accion).toBe("LOCAL_APROBADO");
    });
  });

  describe("SupabaseStorageService", () => {
    it("debe calcular la URL pública correctamente", () => {
      const storage = new SupabaseStorageService();
      const url = storage.getPublicUrl("uploads/foto1.jpg");
      expect(url).toContain("/storage/v1/object/public/locales-media/uploads/foto1.jpg");
    });
  });
});
