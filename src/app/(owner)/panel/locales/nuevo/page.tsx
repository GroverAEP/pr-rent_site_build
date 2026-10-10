import { getCurrentUser } from "@/modules/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LocalForm } from "@/modules/locales";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Publicar Nuevo Local Comercial | Panel Propietario",
};

export default async function NuevoLocalPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/ingresar");
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/panel"
              className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-bold text-slate-900 font-display">
              Publicar Nuevo Local Comercial
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <p className="text-sm text-slate-500">
            Completa los datos de tu inmueble. Al guardar, se generará su recorrido 3D paramétrico para que lo personalices y pasará a revisión de administración.
          </p>
        </div>

        <LocalForm isEditing={false} />
      </main>
    </div>
  );
}
