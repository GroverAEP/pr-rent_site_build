import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getRepositories } from "@/shared/db/factory";
import { formatPrice } from "@/shared/lib/currency";
import { getCurrentUser } from "@/modules/auth";
import { TourViewer, normalizeTourConfig } from "@/modules/viewer3d";
import type { TourConfig } from "@/modules/viewer3d";
import {
  MapPin,
  Maximize2,
  Box,
  Clock,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Compass,
  Map,
  ExternalLink,
} from "lucide-react";


interface LocalDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: LocalDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const repos = getRepositories();
  const local = await repos.locales.findBySlug(slug);

  if (!local) {
    return {
      title: "Local no encontrado | RentLocal",
    };
  }

  const priceFormatted = formatPrice(local.precio, local.moneda);

  return {
    title: `${local.titulo} en ${local.distrito} (${priceFormatted}) | RentLocal`,
    description: `${local.titulo} en ${local.distrito}, Lima. ${local.area_m2} m². Recorre el interior en 3D y contacta directamente al propietario.`,
    openGraph: {
      title: `${local.titulo} - Recorrido 3D en ${local.distrito}`,
      description: `${local.descripcion.slice(0, 160)}...`,
      images: [
        {
          url: local.portada_url,
          width: 1200,
          height: 630,
          alt: local.titulo,
        },
      ],
    },
  };
}

export default async function LocalDetailPage({
  params,
}: LocalDetailPageProps) {
  const { slug } = await params;
  const repos = getRepositories();
  const local = await repos.locales.findBySlug(slug);

  if (!local) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  const isOwnerOrAdmin =
    currentUser &&
    (currentUser.id === local.owner_id || currentUser.role === "admin");

  // Si no está publicado y no es el dueño/admin viéndolo, 404
  if (local.estado !== "publicado" && !isOwnerOrAdmin) {
    notFound();
  }

  const owner = await repos.users.findById(local.owner_id);
  const mediaList = await repos.media.findByLocalId(local.id);

  // Parsear tour_config almacenado como JSON en la BD
  const tourConfig: TourConfig = normalizeTourConfig(local.tour_config);

  // Fotos para el fallback del visor
  const photos = [
    local.portada_url,
    ...mediaList.filter((m) => m.tipo === "foto").map((m) => m.url),
  ].filter(Boolean);

  // Esquema JSON-LD para SEO comercial
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: local.titulo,
    description: local.descripcion,
    url: `https://localvista.pe/locales/${local.slug}`,
    image: local.portada_url,
    offers: {
      "@type": "Offer",
      price: local.precio,
      priceCurrency: local.moneda,
      availability: "https://schema.org/InStock",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: local.direccion,
      addressLocality: local.distrito,
      addressRegion: "Lima",
      addressCountry: "PE",
    },
  };

  const whatsappRedirectUrl = `/r/${local.slug}?origin=detalle`;

  return (
    <div className="pb-24 lg:pb-16">
      {/* Script JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs y Barra Superior */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-xs">
          <nav className="flex items-center gap-1.5 text-slate-500 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-slate-900 transition-colors">
              Inicio
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <Link href="/locales" className="hover:text-slate-900 transition-colors">
              Locales
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <Link
              href={`/locales?distrito=${encodeURIComponent(local.distrito)}`}
              className="hover:text-slate-900 transition-colors"
            >
              {local.distrito}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-900 font-semibold truncate max-w-[200px]">
              {local.titulo}
            </span>
          </nav>

          <Link
            href="/locales"
            className="hidden sm:inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al catálogo</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Banner si está en revisión o borrador */}
        {local.estado !== "publicado" && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-amber-900 text-sm">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span>
                <strong>Modo Vista Previa:</strong> Este local está en estado{" "}
                <span className="font-bold underline">{local.estado}</span> y solo es visible para ti.
              </span>
            </div>
            {currentUser?.id === local.owner_id && (
              <Link
                href={`/panel/locales/${local.id}/tour`}
                className="px-3 py-1.5 bg-[#0E5A73] text-white rounded-lg text-xs font-semibold"
              >
                Editar Tour 3D
              </Link>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VISOR 3D INTERACTIVO                                                      */}
        {/* ========================================================================= */}
        <section id="visor-3d" className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Box className="w-4 h-4 text-[#0E5A73]" />
              Recorrido 3D Interior
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Compass className="w-3.5 h-3.5" />
              <span>{tourConfig.room.width}m × {tourConfig.room.depth}m · Alt. {tourConfig.room.height}m</span>
            </div>
          </div>
          <TourViewer
            tourConfig={tourConfig}
            glbUrl={local.tour_glb_url ?? undefined}
            photos={photos}
            titulo={local.titulo}
          />
          {tourConfig.hotspots.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tourConfig.hotspots.map((h) => (
                <span
                  key={h.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]" />
                  {h.label}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* CUERPO PRINCIPAL: DETALLE Y PANEL LATERAL DE CONTACTO                    */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda: Información Detallada */}
          <div className="lg:col-span-2 space-y-8">
            {/* Título y Ubicación */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-sky-100 text-[#0E5A73] rounded-lg text-xs font-bold uppercase tracking-wider">
                  {local.operacion}
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                  {local.distrito}, Lima
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display mb-3">
                {local.titulo}
              </h1>

              <div className="flex items-center text-sm text-slate-500 gap-1.5 mb-6">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>{local.direccion}, {local.distrito}, {local.ciudad}</span>
              </div>

              {/* Métricas Principales */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="block text-xs text-slate-400 font-medium">
                    Precio Mensual
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                    {formatPrice(local.precio, local.moneda)}
                  </span>
                </div>

                <div>
                  <span className="block text-xs text-slate-400 font-medium">
                    Área Total
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 font-display flex items-center gap-1">
                    <Maximize2 className="w-4 h-4 text-slate-400" />
                    {local.area_m2} m²
                  </span>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <span className="block text-xs text-slate-400 font-medium">
                    Precio Estimado / m²
                  </span>
                  <span className="text-base font-bold text-slate-700">
                    {local.moneda === "PEN" ? "S/ " : "US$ "}
                    {(local.precio / local.area_m2).toFixed(2)} / m²
                  </span>
                </div>
              </div>
            </div>

            {/* Ficha Técnica y Características */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-slate-900 font-display">
                Ficha Técnica del Local
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm">
                <div>
                  <span className="block text-xs text-slate-400">Baños (SSHH)</span>
                  <strong className="text-slate-800">{local.caracteristicas.banos}</strong>
                </div>

                <div>
                  <span className="block text-xs text-slate-400">Nivel / Piso</span>
                  <strong className="text-slate-800">Piso {local.caracteristicas.nivel}</strong>
                </div>

                <div>
                  <span className="block text-xs text-slate-400">Vitrina a la Calle</span>
                  <strong className="text-slate-800">
                    {local.caracteristicas.vitrina ? "Sí, mampara frontal" : "No"}
                  </strong>
                </div>

                <div>
                  <span className="block text-xs text-slate-400">Estacionamiento</span>
                  <strong className="text-slate-800">
                    {local.caracteristicas.estacionamiento ? "Disponible" : "No incluido"}
                  </strong>
                </div>

                <div>
                  <span className="block text-xs text-slate-400">Energía Trifásica</span>
                  <strong className="text-slate-800">
                    {local.caracteristicas.trifasica ? "Habilitada" : "Monofásica"}
                  </strong>
                </div>

                <div>
                  <span className="block text-xs text-slate-400">Pozo a Tierra</span>
                  <strong className="text-slate-800">
                    {local.caracteristicas.pozo_tierra ? "Certificado" : "No"}
                  </strong>
                </div>
              </div>

              {/* Rubros sugeridos */}
              {local.rubros_sugeridos.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                    Rubros Comerciales Ideales
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {local.rubros_sugeridos.map((rubro) => (
                      <span
                        key={rubro}
                        className="px-3 py-1 bg-sky-50 text-[#0E5A73] border border-sky-100 rounded-xl text-xs font-semibold"
                      >
                        ✓ {rubro}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Ubicación en Google Maps */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#0E5A73]/10 flex items-center justify-center text-[#0E5A73]">
                    <Map className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 font-display">
                      Ubicación en Google Maps
                    </h2>
                    <p className="text-xs text-slate-500">
                      {local.direccion}, {local.distrito}, Lima
                    </p>
                  </div>
                </div>

                <a
                  href={
                    local.lat && local.lng
                      ? `https://www.google.com/maps/search/?api=1&query=${local.lat},${local.lng}`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${local.direccion}, ${local.distrito}, Lima, Perú`
                        )}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0E5A73] hover:bg-[#093F52] text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir en Google Maps</span>
                </a>
              </div>

              {/* Iframe interactivo de Google Maps */}
              <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                <iframe
                  title={`Ubicación de ${local.titulo}`}
                  width="100%"
                  height="100%"
                  className="border-0"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={
                    local.lat && local.lng
                      ? `https://maps.google.com/maps?q=${local.lat},${local.lng}&hl=es&z=16&output=embed`
                      : `https://maps.google.com/maps?q=${encodeURIComponent(
                          `${local.direccion}, ${local.distrito}, Lima, Perú`
                        )}&hl=es&z=15&output=embed`
                  }
                />
              </div>
            </div>

            {/* Descripción */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 font-display">
                Descripción del Inmueble
              </h2>
              <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {local.descripcion}
              </div>
            </div>

            {/* Galería Fotográfica */}
            {mediaList.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-slate-900 font-display">
                  Galería de Fotos
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {mediaList.map((m) => (
                    <div
                      key={m.id}
                      className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200"
                    >
                      <Image
                        src={m.url}
                        alt="Foto del local"
                        fill
                        className="object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Columna Derecha: Tarjeta de Contacto Directo */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm sticky top-24 space-y-6">
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Contacto Directo
                </span>
                <div className="text-2xl font-black text-slate-900 font-display">
                  {formatPrice(local.precio, local.moneda)}
                  {local.operacion === "alquiler" && (
                    <span className="text-xs font-normal text-slate-500"> / mes</span>
                  )}
                </div>
              </div>

              {/* Tarjeta del Propietario Verificado */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3.5">
                <div className="w-11 h-11 bg-[#0E5A73] text-white rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0">
                  {owner?.nombre.charAt(0) || "P"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-900 truncate flex items-center gap-1.5">
                    <span>{owner?.nombre_negocio || owner?.nombre || "Propietario"}</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    Propietario Verificado RentLocal
                  </p>
                </div>
              </div>

              {/* Botón Verde WhatsApp */}
              <a
                href={whatsappRedirectUrl}
                className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-emerald-600 text-slate-950 font-bold rounded-2xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {/* SVG Oficial de WhatsApp */}
                <svg
                  className="w-5 h-5 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.507 14.307l-.009.075c-.238-.12-1.406-.697-1.624-.777-.219-.079-.378-.119-.538.12-.16.239-.617.776-.756.935-.14.16-.279.179-.517.06-.239-.12-1.009-.372-1.923-1.187-.71-.634-1.19-1.417-1.33-1.656-.139-.239-.015-.368.105-.487.108-.107.239-.278.358-.418.12-.139.16-.239.239-.398.08-.16.04-.299-.02-.418-.06-.12-.538-1.296-.737-1.774-.194-.467-.393-.404-.538-.412l-.46-.008c-.16 0-.418.06-.637.299-.219.239-.837.818-.837 1.994 0 1.176.857 2.313.976 2.473.12.159 1.687 2.576 4.086 3.612.57.247 1.016.394 1.364.505.573.182 1.094.156 1.506.095.46-.068 1.406-.575 1.605-1.13.199-.554.199-1.03.139-1.13-.059-.098-.219-.158-.458-.278zM12.04 2c-5.523 0-10 4.477-10 10 0 1.77.46 3.432 1.264 4.883L2 22l5.247-1.265C8.653 21.528 10.287 22 12.04 22c5.523 0 10-4.477 10-10s-4.477-10-10-10z" />
                </svg>
                <span>Contactar por WhatsApp</span>
              </a>

              <div className="text-[11px] text-slate-400 text-center leading-relaxed">
                🔒 Por seguridad, tu solicitud es auditada y redirigida instantáneamente a la app de WhatsApp del dueño.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BARRA INFERIOR STICKY EN MÓVIL (1-TAP WHATSAPP)                           */}
      {/* ========================================================================= */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 p-3.5 z-40 flex items-center justify-between gap-4 shadow-2xl">
        <div>
          <span className="block text-[11px] text-slate-400 font-medium">
            {local.operacion}
          </span>
          <span className="text-lg font-black text-slate-900 font-display">
            {formatPrice(local.precio, local.moneda)}
          </span>
        </div>

        <a
          href={whatsappRedirectUrl}
          className="flex-1 py-3 px-4 bg-[#25D366] text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          {/* WhatsApp icon */}
          <svg
            className="w-4 h-4 fill-current"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.507 14.307l-.009.075c-.238-.12-1.406-.697-1.624-.777-.219-.079-.378-.119-.538.12-.16.239-.617.776-.756.935-.14.16-.279.179-.517.06-.239-.12-1.009-.372-1.923-1.187-.71-.634-1.19-1.417-1.33-1.656-.139-.239-.015-.368.105-.487.108-.107.239-.278.358-.418.12-.139.16-.239.239-.398.08-.16.04-.299-.02-.418-.06-.12-.538-1.296-.737-1.774-.194-.467-.393-.404-.538-.412l-.46-.008c-.16 0-.418.06-.637.299-.219.239-.837.818-.837 1.994 0 1.176.857 2.313.976 2.473.12.159 1.687 2.576 4.086 3.612.57.247 1.016.394 1.364.505.573.182 1.094.156 1.506.095.46-.068 1.406-.575 1.605-1.13.199-.554.199-1.03.139-1.13-.059-.098-.219-.158-.458-.278zM12.04 2c-5.523 0-10 4.477-10 10 0 1.77.46 3.432 1.264 4.883L2 22l5.247-1.265C8.653 21.528 10.287 22 12.04 22c5.523 0 10-4.477 10-10s-4.477-10-10-10z" />
          </svg>
          <span>Contactar por WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
