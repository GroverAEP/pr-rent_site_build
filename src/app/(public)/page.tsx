import Link from "next/link";
import { getRepositories } from "@/shared/db/factory";
import { LocalCard } from "@/modules/locales";
import {
  Search,
  Box,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "LocalVista | Locales Comerciales con Recorrido 3D en Lima, Perú",
  description:
    "Encuentra locales comerciales en alquiler, venta o traspaso en Miraflores, San Isidro, Surco y más distritos de Lima con tour virtual 3D del interior.",
};

const DISTRITOS_POPULARES = [
  "Miraflores",
  "San Isidro",
  "Santiago de Surco",
  "San Borja",
  "Barranco",
  "La Victoria",
  "Cercado de Lima",
];

export default async function HomePage() {
  const repos = getRepositories();
  const { items: featuredLocales } = await repos.locales.search({
    estado: "publicado",
    limit: 6,
  });

  return (
    <div className="flex flex-col gap-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-sky-50/70 via-white to-transparent pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200/60 overflow-hidden">
        {/* Decoración geométrica sutil 3D de fondo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-[#0E5A73]/10 to-amber-200/20 blur-3xl rounded-full pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-xs font-semibold text-amber-900 mb-6 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>La primera plataforma comercial 3D-First de Lima</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display mb-4 leading-tight">
            Encuentra el local ideal para tu negocio y{" "}
            <span className="text-[#0E5A73] underline decoration-[#F59E0B] decoration-4 underline-offset-4">
              recorre su interior en 3D
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Ahorra semanas de visitas físicas. Inspecciona distribución, vitrinas y acabados en 360° antes de contactar directamente al dueño por WhatsApp.
          </p>

          {/* Buscador Integrado */}
          <div className="bg-white p-3 sm:p-4 rounded-3xl shadow-xl border border-slate-200 max-w-3xl mx-auto text-left">
            <form action="/locales" method="GET" className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">
                  Operación
                </label>
                <select
                  name="operacion"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E5A73]"
                >
                  <option value="todos">Cualquiera</option>
                  <option value="alquiler">Alquiler</option>
                  <option value="venta">Venta</option>
                  <option value="traspaso">Traspaso</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">
                  Distrito de Lima
                </label>
                <select
                  name="distrito"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E5A73]"
                >
                  <option value="todos">Todos los distritos</option>
                  {DISTRITOS_POPULARES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#0E5A73] hover:bg-[#093F52] text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer h-[42px]"
                >
                  <Search className="w-4 h-4" />
                  <span>Buscar</span>
                </button>
              </div>
            </form>
          </div>

          {/* Enlaces rápidos a distritos */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Populares:</span>
            {DISTRITOS_POPULARES.slice(0, 5).map((d) => (
              <Link
                key={d}
                href={`/locales?distrito=${encodeURIComponent(d)}`}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 transition-colors"
              >
                {d}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Grid de Locales Destacados */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#0E5A73] uppercase tracking-wider mb-1">
              <Box className="w-4 h-4 text-[#F59E0B]" />
              <span>Inmersión Virtual Garantizada</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
              Locales Comerciales Destacados en Lima
            </h2>
          </div>

          <Link
            href="/locales"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0E5A73] hover:underline"
          >
            <span>Ver todo el catálogo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredLocales.map((local) => (
            <LocalCard key={local.id} local={local} featured />
          ))}
        </div>
      </section>

      {/* Propuesta de Valor */}
      <section className="bg-white py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display mb-3">
              ¿Cómo funciona LocalVista?
            </h2>
            <p className="text-sm text-slate-500">
              Diseñado para emprendedores y franquicias que buscan abrir su próximo local comercial en tiempo récord.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center text-[#0E5A73] mb-4">
                <Box className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                1. Recorrido 3D Inmersivo
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Examina cada metro cuadrado, columnas, altura de techos y puntos de luz desde tu celular o computadora antes de desplazarte.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 mb-4">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                2. Contacto Directo WhatsApp
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sin formularios eternos ni intermediarios. El botón abre una conversación directa con el propietario con la ficha del local ya adjunta.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-800 mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                3. Moderación y Seguridad
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cada inmueble y propietario es validado por nuestra administración antes de aparecer públicamente en la plataforma.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Banner para Propietarios */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mb-8">
        <div className="bg-[#0E5A73] rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-lg">
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-bold font-display mb-3 text-white">
              ¿Tienes un local comercial desocupado?
            </h2>
            <p className="text-sm text-sky-100 leading-relaxed">
              Publica tu inmueble y genera su recorrido 3D interactivo en pocos minutos sin necesidad de renders costosos. Recibe a los interesados directamente en tu WhatsApp.
            </p>
          </div>

          <div className="flex-shrink-0">
            <Link
              href="/registro"
              className="px-6 py-3.5 bg-[#F59E0B] hover:bg-amber-600 text-slate-900 font-bold rounded-xl text-sm shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Publicar mi local gratis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
