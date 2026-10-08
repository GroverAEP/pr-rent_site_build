import { getCurrentUser } from "@/modules/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getRepositories } from "@/shared/db/factory";
import { normalizeTourConfig, TourConfig } from "@/modules/viewer3d";
import { updateTourConfigAction } from "@/modules/locales";
import { ArrowLeft, Box, ExternalLink } from "lucide-react";
import { TourEditorClient } from "./TourEditorClient";

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

  const tourConfig = normalizeTourConfig(local.tour_config);

  const saveAction = async (config: TourConfig) => {
    "use server";
    return updateTourConfigAction(local.id, config);
  };

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
        <TourEditorClient
          initialConfig={tourConfig}
          rubros={local.rubros_sugeridos}
          onSaveAction={saveAction}
        />
      </main>
    </div>
  );
}


