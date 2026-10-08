/**
 * Public API del módulo viewer3d.
 * Exporta únicamente lo que otros módulos necesitan.
 */

// Componentes UI (client-side, importar con dynamic si hace falta)
export { default as TourViewer } from "./ui/TourViewer";
export { default as TourEditor } from "./ui/TourEditor";

// Tipos de dominio necesarios en otros módulos
export type { TourConfig, RoomDimensions, Hotspot, FurniturePreset } from "./domain/tour.types";
export { defaultTourConfig, RUBRO_TEMPLATES, normalizeTourConfig } from "./domain/tour.types";

