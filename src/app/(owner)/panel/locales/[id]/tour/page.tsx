import { getCurrentUser } from "@/modules/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getRepositories } from "@/shared/db/factory";
import { ArrowLeft, Box, Sparkles, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Editor de Recorrido 3D | Panel Propietario",
};

interface TourEditorPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TourEditorPage({ params }: TourEditorPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect("/ingresar");
  }

  const repos = getRepositories();
  const local = await repos.locales.findById(id);

  if (!local) {
    notFound();
  }

  if (local.owner_id !== user.id && user.role !== "admin") {
    redirect("/panel/locales");
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/panel/locales"
              className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Box className="w-5 h-5 text-amber-500" />
              <h1 className="text-lg font-bold text-slate-900 font-display">
                Editor 3D: {local.titulo}
              </h1>
            </div>
          </div>

          <Link
            href={`/locales/${local.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
          >
            <span>Ver Ficha Pública</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center max-w-2xl mx-auto my-12">
          <div className="w-16 h-16 bg-amber-50 text-[#F59E0B] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display mb-2">
            Configuración 3D Activa
          </h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Tu local cuenta con dimensiones paramétricas calculadas (
            <strong>{local.tour_config.dimensions.width}m × {local.tour_config.dimensions.depth}m</strong>) y preset <strong>{local.tour_config.preset}</strong>. En la Fase 5 se activará el editor visual en tiempo real con Three.js para posicionar hotspots haciendo clic directamente en el espacio 3D.
          </p>

          <Link
            href="/panel/locales"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0E5A73] hover:bg-[#093F52] text-white rounded-xl text-xs font-semibold"
          >
            Volver a Mis Locales
          </Link>
        </div>
      </main>
    </div>
  );
}
