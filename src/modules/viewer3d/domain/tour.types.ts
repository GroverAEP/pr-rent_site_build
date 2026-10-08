/**
 * Tipos de dominio para el sistema de tours 3D (viewer3d module).
 * tour_config se almacena como JSON en la tabla locales.
 */

export type FloorMaterial = "ceramic" | "wood" | "concrete" | "marble" | "vinyl";
export type WallMaterial = "white" | "cream" | "gray" | "painted" | "brick";
export type LightingMode = "day" | "night";
export type NavMode = "orbit" | "fps";

export interface RoomDimensions {
  width: number;   // metros (eje X)
  depth: number;   // metros (eje Z)
  height: number;  // metros (eje Y)
}

export interface DoorConfig {
  wall: "front" | "back" | "left" | "right";
  offset: number; // posición relativa 0..1 a lo largo de la pared
  width: number;  // metros
}

export interface WindowConfig {
  wall: "front" | "back" | "left" | "right";
  offset: number;
  width: number;
  height: number;
  sillHeight: number;
}

export interface FurniturePreset {
  type: "counter" | "shelves" | "tables" | "vitrine" | "desk" | "rack" | "fridge";
  x: number;
  z: number;
  rotation: number; // grados
  scale?: number;
}

export interface Hotspot {
  id: string;
  label: string;
  description?: string;
  x: number;
  y: number;
  z: number;
  icon?: "info" | "camera" | "door" | "warning";
}

export interface TourConfig {
  room: RoomDimensions;
  floor: FloorMaterial;
  walls: WallMaterial;
  door: DoorConfig;
  windows: WindowConfig[];
  furniture: FurniturePreset[];
  hotspots: Hotspot[];
  ambientColor?: string;  // hex, default "#FFFFFF"
  accentColor?: string;   // hex, color de accent lights
}

// Configuración por defecto para nuevos locales
export const defaultTourConfig: TourConfig = {
  room: { width: 10, depth: 15, height: 3.2 },
  floor: "ceramic",
  walls: "white",
  door: { wall: "front", offset: 0.5, width: 1.2 },
  windows: [
    { wall: "front", offset: 0.2, width: 1.5, height: 1.4, sillHeight: 0.9 },
    { wall: "front", offset: 0.8, width: 1.5, height: 1.4, sillHeight: 0.9 },
  ],
  furniture: [],
  hotspots: [],
  ambientColor: "#F5F0E8",
  accentColor: "#FFD580",
};

// Templates predefinidos por rubro
export const RUBRO_TEMPLATES: Record<string, Partial<TourConfig>> = {
  "Restaurante / Café": {
    furniture: [
      { type: "tables", x: -3, z: -3, rotation: 0 },
      { type: "tables", x: 0, z: -3, rotation: 0 },
      { type: "tables", x: 3, z: -3, rotation: 0 },
      { type: "tables", x: -3, z: 0, rotation: 0 },
      { type: "tables", x: 3, z: 0, rotation: 0 },
      { type: "counter", x: 0, z: 4, rotation: 0 },
    ],
  },
  "Boutique Retail": {
    furniture: [
      { type: "shelves", x: -4, z: 0, rotation: 90 },
      { type: "shelves", x: 4, z: 0, rotation: -90 },
      { type: "vitrine", x: 0, z: 4, rotation: 0 },
      { type: "counter", x: 0, z: 3, rotation: 0 },
    ],
  },
  "Oficina / Coworking": {
    furniture: [
      { type: "desk", x: -3, z: -2, rotation: 0 },
      { type: "desk", x: 0, z: -2, rotation: 0 },
      { type: "desk", x: 3, z: -2, rotation: 0 },
      { type: "desk", x: -3, z: 2, rotation: 180 },
      { type: "desk", x: 0, z: 2, rotation: 180 },
    ],
  },
  "Minimarket / Bodega": {
    furniture: [
      { type: "rack", x: -3, z: 0, rotation: 0 },
      { type: "rack", x: 0, z: 0, rotation: 0 },
      { type: "rack", x: 3, z: 0, rotation: 0 },
      { type: "fridge", x: -4, z: 4, rotation: 90 },
      { type: "counter", x: 3, z: 4, rotation: -90 },
    ],
  },
};

/**
 * Normaliza cualquier objeto JSON almacenado como tour_config
 * adaptando esquemas anteriores o valores parciales a un TourConfig válido.
 */
export function normalizeTourConfig(raw: unknown): TourConfig {
  if (!raw || typeof raw !== "object") {
    return { ...defaultTourConfig };
  }

  const data = raw as Record<string, unknown>;
  const rawRoom = (data.room as Record<string, unknown>) || undefined;
  const rawDimensions = (data.dimensions as Record<string, unknown>) || undefined;
  const rawArch = (data.architecture as Record<string, unknown>) || undefined;
  const rawDoor = (data.door as Record<string, unknown>) || undefined;

  // Detectar dimensiones: data.room o data.dimensions (legacy)
  const roomW = Number(rawRoom?.width ?? rawDimensions?.width ?? defaultTourConfig.room.width);
  const roomD = Number(rawRoom?.depth ?? rawDimensions?.depth ?? defaultTourConfig.room.depth);
  const roomH = Number(rawRoom?.height ?? rawDimensions?.height ?? defaultTourConfig.room.height);

  // Mapear piso
  let floor: FloorMaterial = "ceramic";
  const rawFloor = (data.floor ?? rawArch?.floorMaterial) as string | undefined;
  if (rawFloor && ["ceramic", "wood", "concrete", "marble", "vinyl"].includes(rawFloor)) {
    floor = rawFloor as FloorMaterial;
  } else if (rawFloor === "wood_laminate") {
    floor = "wood";
  } else if (rawFloor === "polished_concrete") {
    floor = "concrete";
  } else if (rawFloor === "porcelain") {
    floor = "ceramic";
  }

  // Mapear paredes
  let walls: WallMaterial = "white";
  const rawWalls = (data.walls ?? (rawArch?.wallColor === "#F1F5F9" ? "white" : rawArch?.wallTexture)) as string | undefined;
  if (rawWalls && ["white", "cream", "gray", "painted", "brick"].includes(rawWalls)) {
    walls = rawWalls as WallMaterial;
  }

  // Mapear puerta
  const door: DoorConfig = {
    wall: (rawDoor?.wall as DoorConfig["wall"]) ?? "front",
    offset: typeof rawDoor?.offset === "number" ? rawDoor.offset : 0.5,
    width: typeof rawDoor?.width === "number" ? rawDoor.width : 1.2,
  };

  // Mapear ventanas
  const rawWindows = Array.isArray(data.windows) ? (data.windows as Array<Record<string, unknown>>) : null;
  const windows: WindowConfig[] = rawWindows
    ? rawWindows.map((w) => ({
        wall: (w.wall as WindowConfig["wall"]) ?? "front",
        offset: typeof w.offset === "number" ? w.offset : 0.5,
        width: typeof w.width === "number" ? w.width : 1.5,
        height: typeof w.height === "number" ? w.height : 1.4,
        sillHeight: typeof w.sillHeight === "number" ? w.sillHeight : 0.9,
      }))
    : defaultTourConfig.windows;

  // Mapear mobiliario
  const rawFurniture = Array.isArray(data.furniture) ? (data.furniture as Array<Record<string, unknown>>) : null;
  const furniture: FurniturePreset[] = rawFurniture
    ? rawFurniture.map((f) => ({
        type: (f.type as FurniturePreset["type"]) ?? "counter",
        x: Number(f.x ?? 0),
        z: Number(f.z ?? 0),
        rotation: Number(f.rotation ?? 0),
        scale: typeof f.scale === "number" ? f.scale : undefined,
      }))
    : [];

  // Mapear hotspots (soporta nuevo formato y formato legacy con position: [x,y,z] y title)
  const rawHotspots = Array.isArray(data.hotspots) ? (data.hotspots as Array<Record<string, unknown>>) : null;
  const hotspots: Hotspot[] = rawHotspots
    ? rawHotspots.map((h, idx) => {
        const id = String(h.id ?? `hs-${idx}`);
        const label = String(h.label ?? h.title ?? `Punto ${idx + 1}`);
        const description = h.description ? String(h.description) : undefined;
        let x = 0;
        let y = 1.5;
        let z = 0;
        if (Array.isArray(h.position) && h.position.length >= 3) {
          x = Number(h.position[0]) || 0;
          y = Number(h.position[1]) || 1.5;
          z = Number(h.position[2]) || 0;
        } else {
          x = Number(h.x ?? 0);
          y = Number(h.y ?? 1.5);
          z = Number(h.z ?? 0);
        }
        return { id, label, description, x, y, z, icon: (h.icon as Hotspot["icon"]) ?? "info" };
      })
    : [];


  return {
    room: {
      width: Math.max(3, Math.min(roomW, 40)),
      depth: Math.max(3, Math.min(roomD, 50)),
      height: Math.max(2.2, Math.min(roomH, 8)),
    },
    floor,
    walls,
    door,
    windows,
    furniture,
    hotspots,
    ambientColor: typeof data.ambientColor === "string" ? data.ambientColor : "#F5F0E8",
    accentColor: typeof data.accentColor === "string" ? data.accentColor : "#FFD580",
  };
}

