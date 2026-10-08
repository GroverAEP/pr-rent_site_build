import { describe, it, expect, beforeAll } from "vitest";
import { getRepositories } from "@/shared/db/factory";
import { runSeed } from "../../scripts/seed";
import { generateSlug } from "@/shared/lib/slug";

describe("Locales Domain & Catalogue Engine", () => {
  const repos = getRepositories();

  beforeAll(async () => {
    await runSeed();
  });

  describe("Publication States & Moderation Visibility", () => {
    it("debe mostrar únicamente locales 'publicado' en el catálogo público", async () => {
      const publicSearch = await repos.locales.search({ estado: "publicado" });
      expect(publicSearch.items.length).toBeGreaterThanOrEqual(10);

      // Verificar que ningún local en revisión se filtre en la búsqueda pública
      const containsInReview = publicSearch.items.some(
        (loc) => loc.estado === "en_revision"
      );
      expect(containsInReview).toBe(false);
    });

    it("debe encontrar el local en estado 'en_revision' solo si se filtra explícitamente", async () => {
      const reviewSearch = await repos.locales.search({ estado: "en_revision" });
      expect(reviewSearch.items.length).toBe(1);
      expect(reviewSearch.items[0].slug).toBe(
        "local-comercial-en-revision-surquillo"
      );
    });
  });

  describe("Search & Advanced Filtering", () => {
    it("debe filtrar correctamente por tipo de operación (alquiler)", async () => {
      const result = await repos.locales.search({
        operacion: "alquiler",
        estado: "publicado",
      });
      expect(result.items.length).toBeGreaterThan(0);
      for (const loc of result.items) {
        expect(loc.operacion).toBe("alquiler");
      }
    });

    it("debe filtrar correctamente por tipo de operación (venta)", async () => {
      const result = await repos.locales.search({
        operacion: "venta",
        estado: "publicado",
      });
      expect(result.items.length).toBe(1);
      expect(result.items[0].distrito).toBe("San Isidro");
    });

    it("debe filtrar por distrito específico de Lima (San Isidro)", async () => {
      const result = await repos.locales.search({
        distrito: "San Isidro",
        estado: "publicado",
      });
      expect(result.items.length).toBeGreaterThanOrEqual(2);
      for (const loc of result.items) {
        expect(loc.distrito).toBe("San Isidro");
      }
    });

    it("debe filtrar por rango de área m²", async () => {
      const result = await repos.locales.search({
        minArea: 100,
        maxArea: 150,
        estado: "publicado",
      });
      expect(result.items.length).toBeGreaterThan(0);
      for (const loc of result.items) {
        expect(loc.area_m2).toBeGreaterThanOrEqual(100);
        expect(loc.area_m2).toBeLessThanOrEqual(150);
      }
    });

    it("debe buscar por coincidencia en texto libre", async () => {
      const result = await repos.locales.search({
        search: "Larco",
        estado: "publicado",
      });
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items[0].direccion).toContain("Larco");
    });
  });

  describe("Owner CRUD Operations", () => {
    it("debe crear un local con estado inicial 'en_revision' y configuración 3D", async () => {
      const slug = generateSlug("Local Test Miraflores", "test1");
      const created = await repos.locales.create({
        id: `loc-test-${Date.now()}`,
        owner_id: "usr-owner-001",
        slug,
        titulo: "Local Test Miraflores",
        operacion: "alquiler",
        precio: 4000,
        moneda: "PEN",
        area_m2: 90,
        direccion: "Calle Alcanfores 200",
        distrito: "Miraflores",
        ciudad: "Lima",
        lat: null,
        lng: null,
        descripcion: "Local de prueba para verificar creación.",
        caracteristicas: {
          banos: 1,
          estacionamiento: true,
          vitrina: true,
          aire_acondicionado: false,
          nivel: 1,
        },
        rubros_sugeridos: ["Retail", "Oficina"],
        estado: "en_revision",
        portada_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
        tour_config: {
          version: 1,
          dimensions: { width: 6, depth: 15, height: 3.2 },
          architecture: {
            wallColor: "#FFFFFF",
            wallTexture: "smooth",
            floorMaterial: "porcelain",
            floorColor: "#CBD5E1",
            ceilingColor: "#FFFFFF",
            doorPosition: { wall: "front", offset: 0, width: 1.5, height: 2.6 },
            windows: [],
          },
          lighting: { ambientIntensity: 0.8, mode: "day", spotlights: [] },
          preset: "retail_store",
          hotspots: [],
          camera: { initialPosition: [0, 1.6, 6], initialTarget: [0, 1.5, 0], fov: 60 },
        },
        tour_glb_url: null,
      });

      expect(created.id).toBeDefined();
      expect(created.estado).toBe("en_revision");

      const fetched = await repos.locales.findById(created.id);
      expect(fetched).not.toBeNull();
      expect(fetched?.titulo).toBe("Local Test Miraflores");

      // Actualización
      const updated = await repos.locales.update(created.id, {
        precio: 4200,
      });
      expect(updated.precio).toBe(4200);

      // Eliminación
      const deleted = await repos.locales.delete(created.id);
      expect(deleted).toBe(true);

      const afterDelete = await repos.locales.findById(created.id);
      expect(afterDelete).toBeNull();
    });
  });
});
