"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, RotateCcw, Filter, SlidersHorizontal } from "lucide-react";

const DISTRITOS_LIMA = [
  "Miraflores",
  "San Isidro",
  "Santiago de Surco",
  "San Borja",
  "Barranco",
  "La Victoria",
  "Cercado de Lima",
  "Jesús María",
  "Magdalena del Mar",
  "Lince",
  "Pueblo Libre",
  "San Miguel",
  "Surquillo",
];

export function LocalFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [operacion, setOperacion] = useState(searchParams.get("operacion") || "todos");
  const [distrito, setDistrito] = useState(searchParams.get("distrito") || "todos");
  const [minPrecio, setMinPrecio] = useState(searchParams.get("minPrecio") || "");
  const [maxPrecio, setMaxPrecio] = useState(searchParams.get("maxPrecio") || "");
  const [minArea, setMinArea] = useState(searchParams.get("minArea") || "");
  const [maxArea, setMaxArea] = useState(searchParams.get("maxArea") || "");
  const [orderBy, setOrderBy] = useState(searchParams.get("orderBy") || "recientes");

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (operacion && operacion !== "todos") params.set("operacion", operacion);
    if (distrito && distrito !== "todos") params.set("distrito", distrito);
    if (minPrecio) params.set("minPrecio", minPrecio);
    if (maxPrecio) params.set("maxPrecio", maxPrecio);
    if (minArea) params.set("minArea", minArea);
    if (maxArea) params.set("maxArea", maxArea);
    if (orderBy && orderBy !== "recientes") params.set("orderBy", orderBy);

    startTransition(() => {
      router.push(`/locales?${params.toString()}`);
    });
    setMobileDrawerOpen(false);
  };

  const clearFilters = () => {
    setSearch("");
    setOperacion("todos");
    setDistrito("todos");
    setMinPrecio("");
    setMaxPrecio("");
    setMinArea("");
    setMaxArea("");
    setOrderBy("recientes");

    startTransition(() => {
      router.push("/locales");
    });
    setMobileDrawerOpen(false);
  };

  return (
    <div>
      {/* Botón de apertura en móvil */}
      <div className="lg:hidden mb-4 flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por avenida o distrito..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
          />
        </div>
        <button
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 flex items-center gap-1.5 shadow-sm"
        >
          <Filter className="w-4 h-4 text-[#0E5A73]" />
          <span>Filtros</span>
        </button>
      </div>

      {/* Panel de Filtros (Sidebar en Desktop o Drawer en Móvil) */}
      <div
        className={`bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 ${
          mobileDrawerOpen
            ? "fixed inset-y-0 left-0 z-50 w-80 overflow-y-auto block shadow-2xl"
            : "hidden lg:block"
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#0E5A73]" />
            <span>Filtros de Búsqueda</span>
          </h3>
          <button
            onClick={clearFilters}
            className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Limpiar</span>
          </button>
        </div>

        {/* Buscador de texto */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Palabra Clave
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Ej. Larco, Benavides..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#0E5A73]"
            />
          </div>
        </div>

        {/* Tipo de Operación */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Operación
          </label>
          <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl">
            {[
              { id: "todos", label: "Todos" },
              { id: "alquiler", label: "Alquiler" },
              { id: "venta", label: "Venta" },
              { id: "traspaso", label: "Traspaso" },
            ].map((op) => (
              <button
                key={op.id}
                type="button"
                onClick={() => setOperacion(op.id)}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                  operacion === op.id
                    ? "bg-white text-[#0E5A73] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {op.label}
              </button>
            ))}
          </div>
        </div>

        {/* Distrito */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Distrito de Lima
          </label>
          <select
            value={distrito}
            onChange={(e) => setDistrito(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#0E5A73]"
          >
            <option value="todos">Todos los distritos</option>
            {DISTRITOS_LIMA.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Rango de Precio */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Precio
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Mín"
              value={minPrecio}
              onChange={(e) => setMinPrecio(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
            <input
              type="number"
              placeholder="Máx"
              value={maxPrecio}
              onChange={(e) => setMaxPrecio(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* Rango de Área m² */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Área Total (m²)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Mín m²"
              value={minArea}
              onChange={(e) => setMinArea(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
            <input
              type="number"
              placeholder="Máx m²"
              value={maxArea}
              onChange={(e) => setMaxArea(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* Ordenación */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Ordenar Por
          </label>
          <select
            value={orderBy}
            onChange={(e) => setOrderBy(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          >
            <option value="recientes">Más recientes</option>
            <option value="precio_asc">Precio: de menor a mayor</option>
            <option value="precio_desc">Precio: de mayor a menor</option>
            <option value="area_desc">Mayor área (m²)</option>
          </select>
        </div>

        <button
          type="button"
          onClick={applyFilters}
          className="w-full py-2.5 bg-[#0E5A73] hover:bg-[#093F52] text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          Aplicar Filtros
        </button>
      </div>

      {mobileDrawerOpen && (
        <div
          onClick={() => setMobileDrawerOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}
    </div>
  );
}
