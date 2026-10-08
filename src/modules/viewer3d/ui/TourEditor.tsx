"use client";
/**
 * Editor 3D para propietarios: permite configurar dimensiones,
 * materiales, muebles y hotspots del tour paramétrico.
 * Incluye preview en vivo del resultado.
 */

import { useState } from "react";
import { TourConfig, FloorMaterial, WallMaterial, FurniturePreset, Hotspot, RUBRO_TEMPLATES } from "../domain/tour.types";
import dynamic from "next/dynamic";

const Viewer3DCanvas = dynamic(() => import("./Viewer3DCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-[#0E5A73] border-t-transparent rounded-full" />
    </div>
  ),
});

interface TourEditorProps {
  initialConfig: TourConfig;
  rubros: string[];
  onSave: (config: TourConfig) => Promise<void>;
}

const FLOOR_OPTIONS: { value: FloorMaterial; label: string; color: string }[] = [
  { value: "ceramic", label: "Cerámica", color: "#E8E0D0" },
  { value: "wood", label: "Madera", color: "#A0724A" },
  { value: "concrete", label: "Concreto", color: "#9E9E9E" },
  { value: "marble", label: "Mármol", color: "#F0EEE8" },
  { value: "vinyl", label: "Vinílico", color: "#C8B89A" },
];

const WALL_OPTIONS: { value: WallMaterial; label: string; color: string }[] = [
  { value: "white", label: "Blanco", color: "#F5F5F0" },
  { value: "cream", label: "Crema", color: "#F5EDD8" },
  { value: "gray", label: "Gris", color: "#D0D0C8" },
  { value: "painted", label: "Pintado (Azul)", color: "#C8DDED" },
  { value: "brick", label: "Ladrillo", color: "#B56A52" },
];

const FURNITURE_TYPES = [
  { type: "counter" as const, label: "Mostrador", icon: "🏪" },
  { type: "shelves" as const, label: "Estantes", icon: "📚" },
  { type: "tables" as const, label: "Mesas", icon: "🪑" },
  { type: "vitrine" as const, label: "Vitrina", icon: "💎" },
  { type: "desk" as const, label: "Escritorio", icon: "💼" },
  { type: "rack" as const, label: "Rack/Góndola", icon: "🛒" },
  { type: "fridge" as const, label: "Refrigerador", icon: "❄️" },
];

export default function TourEditor({ initialConfig, rubros, onSave }: TourEditorProps) {
  const [config, setConfig] = useState<TourConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<"room" | "materials" | "furniture" | "hotspots">("room");
  const [saving, setSaving] = useState(false);
  const [newHotspot, setNewHotspot] = useState<Partial<Hotspot>>({});

  const update = (partial: Partial<TourConfig>) => setConfig(c => ({ ...c, ...partial }));

  const applyRubroTemplate = (rubro: string) => {
    const template = RUBRO_TEMPLATES[rubro];
    if (template) setConfig(c => ({ ...c, ...template }));
  };

  const addFurniture = (type: FurniturePreset["type"]) => {
    const piece: FurniturePreset = { type, x: 0, z: 0, rotation: 0 };
    update({ furniture: [...config.furniture, piece] });
  };

  const removeFurniture = (idx: number) => {
    update({ furniture: config.furniture.filter((_, i) => i !== idx) });
  };

  const updateFurniture = (idx: number, changes: Partial<FurniturePreset>) => {
    update({
      furniture: config.furniture.map((f, i) => i === idx ? { ...f, ...changes } : f),
    });
  };

  const addHotspot = () => {
    if (!newHotspot.label) return;
    const hs: Hotspot = {
      id: `hs-${Date.now()}`,
      label: newHotspot.label,
      description: newHotspot.description,
      x: newHotspot.x ?? 0,
      y: newHotspot.y ?? 1.5,
      z: newHotspot.z ?? 0,
      icon: "info",
    };
    update({ hotspots: [...config.hotspots, hs] });
    setNewHotspot({});
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(config);
    setSaving(false);
  };

  const TABS = [
    { id: "room" as const, label: "Dimensiones", icon: "📐" },
    { id: "materials" as const, label: "Materiales", icon: "🎨" },
    { id: "furniture" as const, label: "Mobiliario", icon: "🪑" },
    { id: "hotspots" as const, label: "Puntos Info", icon: "📍" },
  ];

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full">
      {/* Panel de edición */}
      <div className="w-full xl:w-96 flex-shrink-0 space-y-4">
        {/* Tabs */}
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <span className="block text-base mb-0.5">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Templates de rubro */}
        {rubros.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs font-semibold text-amber-900 mb-2">⚡ Aplicar plantilla de rubro</p>
            <div className="flex flex-wrap gap-1.5">
              {rubros.map((r) => RUBRO_TEMPLATES[r] && (
                <button
                  key={r}
                  onClick={() => applyRubroTemplate(r)}
                  className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200 transition-colors"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Dimensiones */}
        {activeTab === "room" && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
            <h3 className="font-semibold text-slate-900 text-sm">Dimensiones del local</h3>
            {(["width", "depth", "height"] as const).map((dim) => {
              const labels = { width: "Ancho (m)", depth: "Fondo (m)", height: "Alto (m)" };
              const min = { width: 3, depth: 3, height: 2.2 };
              const max = { width: 30, depth: 50, height: 8 };
              return (
                <div key={dim}>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {labels[dim]}: <span className="text-[#0E5A73] font-bold">{config.room[dim]}m</span>
                  </label>
                  <input
                    type="range"
                    min={min[dim]}
                    max={max[dim]}
                    step={0.5}
                    value={config.room[dim]}
                    onChange={(e) => update({ room: { ...config.room, [dim]: parseFloat(e.target.value) } })}
                    className="w-full accent-[#0E5A73]"
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{min[dim]}m</span><span>{max[dim]}m</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab: Materiales */}
        {activeTab === "materials" && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm mb-2">Piso</h3>
              <div className="grid grid-cols-5 gap-2">
                {FLOOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => update({ floor: opt.value })}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                      config.floor === opt.value ? "border-[#0E5A73]" : "border-slate-200"
                    }`}
                  >
                    <div className="w-8 h-8 rounded" style={{ backgroundColor: opt.color }} />
                    <span className="text-xs text-slate-600">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm mb-2">Paredes</h3>
              <div className="grid grid-cols-5 gap-2">
                {WALL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => update({ walls: opt.value })}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                      config.walls === opt.value ? "border-[#0E5A73]" : "border-slate-200"
                    }`}
                  >
                    <div className="w-8 h-8 rounded border" style={{ backgroundColor: opt.color }} />
                    <span className="text-xs text-slate-600">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Mobiliario */}
        {activeTab === "furniture" && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <h3 className="font-semibold text-slate-900 text-sm">Añadir mobiliario</h3>
            <div className="grid grid-cols-4 gap-2">
              {FURNITURE_TYPES.map((ft) => (
                <button
                  key={ft.type}
                  onClick={() => addFurniture(ft.type)}
                  className="flex flex-col items-center gap-1 p-2.5 rounded-xl border border-slate-200 hover:border-[#0E5A73] hover:bg-slate-50 transition-all text-center"
                >
                  <span className="text-xl">{ft.icon}</span>
                  <span className="text-xs text-slate-600">{ft.label}</span>
                </button>
              ))}
            </div>
            {config.furniture.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                <p className="text-xs font-medium text-slate-700">Piezas ({config.furniture.length})</p>
                {config.furniture.map((piece, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-50 rounded-lg p-2">
                    <span className="text-sm">{FURNITURE_TYPES.find(f => f.type === piece.type)?.icon}</span>
                    <div className="flex-1 flex items-center gap-1">
                      <label className="text-xs text-slate-500">X:</label>
                      <input
                        type="number"
                        value={piece.x}
                        step={0.5}
                        onChange={(e) => updateFurniture(idx, { x: parseFloat(e.target.value) })}
                        className="w-14 text-xs border border-slate-200 rounded px-1 py-0.5"
                      />
                      <label className="text-xs text-slate-500">Z:</label>
                      <input
                        type="number"
                        value={piece.z}
                        step={0.5}
                        onChange={(e) => updateFurniture(idx, { z: parseFloat(e.target.value) })}
                        className="w-14 text-xs border border-slate-200 rounded px-1 py-0.5"
                      />
                    </div>
                    <button onClick={() => removeFurniture(idx)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Hotspots */}
        {activeTab === "hotspots" && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <h3 className="font-semibold text-slate-900 text-sm">Puntos de información</h3>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Etiqueta (ej: Zona de caja)"
                value={newHotspot.label ?? ""}
                onChange={(e) => setNewHotspot(h => ({ ...h, label: e.target.value }))}
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2"
              />
              <input
                type="text"
                placeholder="Descripción (opcional)"
                value={newHotspot.description ?? ""}
                onChange={(e) => setNewHotspot(h => ({ ...h, description: e.target.value }))}
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2"
              />
              <div className="flex gap-2">
                {(["x", "y", "z"] as const).map((axis) => (
                  <div key={axis} className="flex-1">
                    <label className="text-xs text-slate-500 uppercase">{axis}:</label>
                    <input
                      type="number"
                      value={newHotspot[axis] ?? (axis === "y" ? 1.5 : 0)}
                      step={0.5}
                      onChange={(e) => setNewHotspot(h => ({ ...h, [axis]: parseFloat(e.target.value) }))}
                      className="w-full text-xs border border-slate-200 rounded px-1 py-0.5 mt-0.5"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={addHotspot}
                disabled={!newHotspot.label}
                className="w-full py-2 bg-[#0E5A73] text-white text-xs rounded-lg disabled:opacity-50 hover:bg-[#093F52] transition-colors"
              >
                + Agregar punto
              </button>
            </div>
            {config.hotspots.length > 0 && (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {config.hotspots.map((hs, idx) => (
                  <div key={hs.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                    <div>
                      <p className="text-xs font-medium text-slate-800">📍 {hs.label}</p>
                      <p className="text-xs text-slate-500">({hs.x}, {hs.y}, {hs.z})</p>
                    </div>
                    <button
                      onClick={() => update({ hotspots: config.hotspots.filter((_, i) => i !== idx) })}
                      className="text-red-400 hover:text-red-600 text-xs"
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Botón guardar */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-[#0E5A73] hover:bg-[#093F52] text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-60"
        >
          {saving ? "Guardando…" : "💾 Guardar configuración 3D"}
        </button>
      </div>

      {/* Preview 3D */}
      <div className="flex-1 min-h-[400px] xl:min-h-0 rounded-2xl overflow-hidden bg-slate-900">
        <Viewer3DCanvas tourConfig={config} />
      </div>
    </div>
  );
}
