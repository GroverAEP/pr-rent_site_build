import Link from "next/link";
import Image from "next/image";
import { Local } from "../domain/local.entity";
import { formatPrice } from "@/shared/lib/currency";
import { MapPin, Maximize2, Box, Sparkles } from "lucide-react";

interface LocalCardProps {
  local: Local;
  featured?: boolean;
}

export function LocalCard({ local, featured = false }: LocalCardProps) {
  const operacionLabels = {
    alquiler: "Alquiler",
    venta: "Venta",
    traspaso: "Traspaso",
  };

  const operacionBadges = {
    alquiler: "bg-sky-100 text-[#0E5A73]",
    venta: "bg-emerald-100 text-emerald-800",
    traspaso: "bg-purple-100 text-purple-800",
  };

  return (
    <div
      className={`group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col ${
        featured ? "ring-2 ring-[#0E5A73]/20" : ""
      }`}
    >
      {/* Portada con Badges */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <Image
          src={local.portada_url}
          alt={local.titulo}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${
              operacionBadges[local.operacion]
            }`}
          >
            {operacionLabels[local.operacion]}
          </span>
        </div>

        {/* Badge 3D Destacado */}
        <div className="absolute bottom-3 left-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900/85 backdrop-blur-md text-amber-300 rounded-full text-xs font-semibold shadow-sm">
            <Box className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Tour 3D Activo</span>
          </div>
        </div>
      </div>

      {/* Contenido de la Tarjeta */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Precio y Distrito */}
          <div className="flex items-baseline justify-between gap-2 mb-2">
            <div className="text-xl font-extrabold text-slate-900 font-display">
              {formatPrice(local.precio, local.moneda)}
              {local.operacion === "alquiler" && (
                <span className="text-xs font-normal text-slate-500"> / mes</span>
              )}
            </div>

            <div className="flex items-center text-xs font-medium text-slate-500 gap-1">
              <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{local.area_m2} m²</span>
            </div>
          </div>

          <h3 className="font-bold text-slate-900 line-clamp-2 text-base group-hover:text-[#0E5A73] transition-colors mb-2">
            {local.titulo}
          </h3>

          <div className="flex items-center text-xs text-slate-500 gap-1 mb-3">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">
              {local.direccion}, {local.distrito}
            </span>
          </div>

          {/* Tags de rubros */}
          {local.rubros_sugeridos.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {local.rubros_sugeridos.slice(0, 3).map((rubro) => (
                <span
                  key={rubro}
                  className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                >
                  {rubro}
                </span>
              ))}
              {local.rubros_sugeridos.length > 3 && (
                <span className="text-[11px] text-slate-400 self-center">
                  +{local.rubros_sugeridos.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Botón Ver Local y Tour */}
        <Link
          href={`/locales/${local.slug}`}
          className="w-full mt-2 py-2.5 px-4 bg-slate-100 hover:bg-[#0E5A73] text-slate-800 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>Explorar Local y Tour 3D</span>
        </Link>
      </div>
    </div>
  );
}
