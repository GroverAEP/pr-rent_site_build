import { describe, it, expect } from "vitest";
import {
  normalizeTourConfig,
  defaultTourConfig,
  RUBRO_TEMPLATES,
  TourConfig,
} from "../../src/modules/viewer3d/domain/tour.types";
import {
  buildRoom,
  buildDoor,
  buildWindows,
  buildFurniturePiece,
  buildFullScene,
} from "../../src/modules/viewer3d/infrastructure/room-builder";

describe("Viewer3D - TourConfig Normalization & Domain", () => {
  it("retorna defaultTourConfig cuando el valor recibido es nulo o inválido", () => {
    const fromNull = normalizeTourConfig(null);
    expect(fromNull.room.width).toBe(defaultTourConfig.room.width);
    expect(fromNull.floor).toBe("ceramic");

    const fromUndefined = normalizeTourConfig(undefined);
    expect(fromUndefined.room.depth).toBe(defaultTourConfig.room.depth);

    const fromString = normalizeTourConfig("not an object");
    expect(fromString.room.height).toBe(defaultTourConfig.room.height);
  });

  it("normaliza configuraciones provenientes del esquema legacy (seed con dimensions y position)", () => {
    const legacySeed = {
      version: 1,
      dimensions: { width: 8.5, depth: 16.0, height: 3.5 },
      architecture: {
        floorMaterial: "porcelain",
        wallColor: "#F1F5F9",
      },
      hotspots: [
        {
          id: "hs-1",
          title: "Zona de Exhibición",
          position: [2.0, 1.4, -4.0],
        },
      ],
    };

    const normalized = normalizeTourConfig(legacySeed);
    expect(normalized.room.width).toBe(8.5);
    expect(normalized.room.depth).toBe(16.0);
    expect(normalized.room.height).toBe(3.5);
    expect(normalized.floor).toBe("ceramic"); // porcelain mapeado a ceramic
    expect(normalized.walls).toBe("white");
    expect(normalized.hotspots).toHaveLength(1);
    expect(normalized.hotspots[0].label).toBe("Zona de Exhibición");
    expect(normalized.hotspots[0].x).toBe(2.0);
    expect(normalized.hotspots[0].y).toBe(1.4);
    expect(normalized.hotspots[0].z).toBe(-4.0);
  });

  it("preserva configuraciones 3D nativas completas", () => {
    const customConfig: TourConfig = {
      room: { width: 12, depth: 20, height: 4 },
      floor: "wood",
      walls: "brick",
      door: { wall: "left", offset: 0.3, width: 1.5 },
      windows: [{ wall: "right", offset: 0.4, width: 2, height: 1.8, sillHeight: 1 }],
      furniture: [{ type: "counter", x: 1, z: 2, rotation: 45 }],
      hotspots: [{ id: "h1", label: "Caja", x: 1, y: 1.5, z: 2 }],
      ambientColor: "#FFFFFF",
      accentColor: "#FFAA00",
    };

    const normalized = normalizeTourConfig(customConfig);
    expect(normalized.room.width).toBe(12);
    expect(normalized.floor).toBe("wood");
    expect(normalized.walls).toBe("brick");
    expect(normalized.furniture[0].type).toBe("counter");
    expect(normalized.hotspots[0].label).toBe("Caja");
  });

  it("dispone de templates por rubro válidos", () => {
    expect(RUBRO_TEMPLATES["Restaurante / Café"]).toBeDefined();
    expect(RUBRO_TEMPLATES["Restaurante / Café"].furniture?.length).toBeGreaterThan(0);
    expect(RUBRO_TEMPLATES["Boutique Retail"]).toBeDefined();
    expect(RUBRO_TEMPLATES["Minimarket / Bodega"]).toBeDefined();
  });
});

describe("Viewer3D - Three.js Parametric Room Builder", () => {
  it("construye la estructura básica de la sala (piso, techo y 4 paredes)", () => {
    const room = buildRoom(defaultTourConfig);
    expect(room.children.length).toBe(6); // piso + techo + 4 paredes
  });

  it("construye el marco y hoja de la puerta", () => {
    const door = buildDoor(defaultTourConfig);
    expect(door.children.length).toBe(4); // 3 marcos + 1 hoja
  });

  it("construye ventanas paramétricas con marcos y cristales", () => {
    const windows = buildWindows(defaultTourConfig);
    // 2 ventanas configuradas en defaultTourConfig, cada una con marco + vidrio = 4 mallas
    expect(windows.children.length).toBe(4);
  });

  it("construye diferentes piezas de mobiliario", () => {
    const counter = buildFurniturePiece({ type: "counter", x: 0, z: 0, rotation: 0 });
    expect(counter.children.length).toBeGreaterThan(0);

    const tables = buildFurniturePiece({ type: "tables", x: 2, z: 2, rotation: 90 });
    expect(tables.children.length).toBeGreaterThan(0);

    const shelves = buildFurniturePiece({ type: "shelves", x: -2, z: -2, rotation: 0 });
    expect(shelves.children.length).toBeGreaterThan(0);
  });

  it("ensambla la escena 3D completa integrando sala, vanos y muebles", () => {
    const cfg: TourConfig = {
      ...defaultTourConfig,
      furniture: [
        { type: "counter", x: 0, z: 2, rotation: 0 },
        { type: "tables", x: -2, z: -2, rotation: 0 },
      ],
    };
    const scene = buildFullScene(cfg);
    // Debería tener room group + door group + windows group + 2 furniture groups
    expect(scene.children.length).toBe(5);
  });
});
