import { Suspense } from "react";
import Link from "next/link";
import { getRepositories } from "@/shared/db/factory";
import { LocalCard, LocalFilterBar, Operacion } from "@/modules/locales";
import { Building2, SearchX } from "lucide-react";

export const metadata = {
  title: "Catálogo de Locales Comerciales en Lima | RentLocal",
  description:
    "Explora y filtra locales comerciales en alquiler, venta o traspaso en Villa El Salvador y distritos de Lima con ubicación en mapa y vista 3D.",
};

interface LocalesPageProps {
  searchParams: Promise<{
    search?: string;
    operacion?: string;
    distrito?: string;
    minPrecio?: string;
    maxPrecio?: string;
    minArea?: string;
    maxArea?: string;
    orderBy?: string;
  }>;
}

export default async function LocalesPage({ searchParams }: LocalesPageProps) {
  const params = await searchParams;

  const repos = getRepositories();
  const operacionParam =
    params.operacion && params.operacion !== "todos"
      ? (params.operacion as Operacion)
      : undefined;

  const distritoParam =
    params.distrito && params.distrito !== "todos"
      ? params.distrito
      : undefined;

  const { items: locales, total } = await repos.locales.search({
    estado: "publicado",
    search: params.search,
    operacion: operacionParam,
    distrito: distritoParam,
    minPrecio: params.minPrecio ? Number(params.minPrecio) : undefined,
    maxPrecio: params.maxPrecio ? Number(params.maxPrecio) : undefined,
    minArea: params.minArea ? Number(params.minArea) : undefined,
    maxArea: params.maxArea ? Number(params.maxArea) : undefined,
    orderBy: params.orderBy as "recientes" | "precio_asc" | "precio_desc" | "area_desc",
    limit: 30,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
          Locales Comerciales Disponibles
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {total} {total === 1 ? "local encontrado" : "locales encontrados"} con recorrido 3D interior interactivo
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar de Filtros */}
        <div className="lg:col-span-1">
          <Suspense fallback={<div className="p-4 bg-white rounded-2xl border border-slate-200">Cargando filtros...</div>}>
            <LocalFilterBar />
          </Suspense>
        </div>

        {/* Resultados */}
        <div className="lg:col-span-3">
          {locales.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {locales.map((local) => (
                <LocalCard key={local.id} local={local} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4">
                <SearchX className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                No encontramos locales con esos filtros
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                Prueba ampliando el rango de precios, seleccionando todos los distritos o limpiando los términos de búsqueda.
              </p>
              <Link
                href="/locales"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0E5A73] text-white rounded-xl text-xs font-semibold hover:bg-[#093F52] transition-colors"
              >
                <Building2 className="w-4 h-4" />
                <span>Restablecer todos los filtros</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
