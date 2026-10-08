export type Operacion = "alquiler" | "venta" | "traspaso";
export type Moneda = "PEN" | "USD";
export type LocalStatus =
  | "borrador"
  | "en_revision"
  | "publicado"
  | "rechazado"
  | "suspendido";

export interface TourConfig {
  version: 1;
  dimensions: {
    width: number;
    depth: number;
    height: number;
  };
  architecture: {
    wallColor: string;
    wallTexture: "smooth" | "brick" | "concrete" | "drywall";
    floorMaterial:
      | "ceramic"
      | "wood_laminate"
      | "polished_concrete"
      | "porcelain";
    floorColor: string;
    ceilingColor: string;
    doorPosition: {
      wall: "front" | "back";
      offset: number;
      width: number;
      height: number;
    };
    windows: Array<{
      wall: "front" | "left" | "right";
      offset: number;
      width: number;
      height: number;
    }>;
  };
  lighting: {
    ambientIntensity: number;
    mode: "day" | "night";
    spotlights: Array<{ x: number; y: number; z: number; intensity: number }>;
  };
  preset:
    | "empty"
    | "retail_store"
    | "restaurant_cafe"
    | "office"
    | "warehouse";
  hotspots: Array<{
    id: string;
    position: [number, number, number];
    title: string;
    description: string;
    icon?: string;
  }>;
  camera: {
    initialPosition: [number, number, number];
    initialTarget: [number, number, number];
    fov: number;
  };
}

export interface LocalCaracteristicas {
  banos: number;
  estacionamiento: boolean;
  vitrina: boolean;
  aire_acondicionado: boolean;
  nivel: number;
  pozo_tierra?: boolean;
  trifasica?: boolean;
}

export interface Local {
  id: string;
  owner_id: string;
  slug: string;
  titulo: string;
  operacion: Operacion;
  precio: number;
  moneda: Moneda;
  area_m2: number;
  direccion: string;
  distrito: string;
  ciudad: string;
  lat: number | null;
  lng: number | null;
  descripcion: string;
  caracteristicas: LocalCaracteristicas;
  rubros_sugeridos: string[];
  estado: LocalStatus;
  portada_url: string;
  tour_config: TourConfig;
  tour_glb_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface LocalSearchFilter {
  operacion?: Operacion;
  distrito?: string;
  minPrecio?: number;
  maxPrecio?: number;
  minArea?: number;
  maxArea?: number;
  search?: string;
  estado?: LocalStatus;
  owner_id?: string;
  limit?: number;
  offset?: number;
  orderBy?: "recientes" | "precio_asc" | "precio_desc" | "area_desc";
}

export interface ILocalRepository {
  findById(id: string): Promise<Local | null>;
  findBySlug(slug: string): Promise<Local | null>;
  findByOwnerId(ownerId: string): Promise<Local[]>;
  create(local: Omit<Local, "created_at" | "updated_at">): Promise<Local>;
  update(id: string, partial: Partial<Omit<Local, "id">>): Promise<Local>;
  delete(id: string): Promise<boolean>;
  search(filter?: LocalSearchFilter): Promise<{ items: Local[]; total: number }>;
}
