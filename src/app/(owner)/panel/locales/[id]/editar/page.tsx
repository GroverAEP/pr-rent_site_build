import { getCurrentUser } from "@/modules/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getRepositories } from "@/shared/db/factory";
import { LocalForm } from "@/modules/locales";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Editar Local Comercial | Panel Propietario",
};

interface EditarLocalPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditarLocalPage({
  params,
}: EditarLocalPageProps) {
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/panel/locales"
              className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-bold text-slate-900 font-display">
              Editar Local: {local.titulo}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LocalForm initialData={local} isEditing={true} />
      </main>
    </div>
  );
}
