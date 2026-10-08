import { getCurrentUser } from "@/modules/auth";
import { redirect } from "next/navigation";
import { logoutAction } from "@/modules/auth";
import Link from "next/link";
import { Building2, LogOut, Plus, Clock, Eye, MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Panel del Propietario | LocalVista",
};

export default async function OwnerPanelPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/ingresar");
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold text-[#0E5A73] font-display"
            >
              <div className="w-8 h-8 bg-[#0E5A73] text-white rounded-lg flex items-center justify-center font-bold text-sm">
                LV
              </div>
              <span>LocalVista</span>
            </Link>
            <span className="text-xs bg-sky-100 text-[#0E5A73] font-semibold px-2.5 py-1 rounded-full">
              Panel Propietario
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-slate-800">
                {user.nombre}
              </div>
              <div className="text-xs text-slate-500">
                {user.telefono_whatsapp}
              </div>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user.estado === "pendiente" && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900">
            <Clock className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
            <div>
              <strong className="font-semibold block text-sm text-amber-900">
                Tu cuenta está en proceso de revisión
              </strong>
              <p className="text-xs text-amber-800 mt-0.5">
                Puedes registrar y configurar tus locales comerciales en 3D. El administrador validará tu cuenta y número de WhatsApp (+51) para que los locales pasen a estar visibles públicamente.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">
              Bienvenido, {user.nombre.split(" ")[0]}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Gestiona tus locales y mide el interés de clientes hacia tu WhatsApp
            </p>
          </div>

          <Link
            href="/panel/locales/nuevo"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0E5A73] hover:bg-[#093F52] text-white font-medium text-sm rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Publicar nuevo local</span>
          </Link>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Mis Locales
              </span>
              <Building2 className="w-4 h-4 text-[#0E5A73]" />
            </div>
            <div className="text-3xl font-bold text-slate-900">0</div>
            <p className="text-xs text-slate-400 mt-1">Locales registrados</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Visualizaciones 3D
              </span>
              <Eye className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div className="text-3xl font-bold text-slate-900">0</div>
            <p className="text-xs text-slate-400 mt-1">Recorridos realizados</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Contactos WhatsApp
              </span>
              <MessageSquare className="w-4 h-4 text-[#25D366]" />
            </div>
            <div className="text-3xl font-bold text-slate-900">0</div>
            <p className="text-xs text-slate-400 mt-1">Clics hacia tu chat</p>
          </div>
        </div>

        {/* Empty state card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">
            Aún no tienes locales publicados
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Empieza publicando tu primer inmueble comercial. Podrás configurar su recorrido 3D paramétrico en pocos clics.
          </p>
          <Link
            href="/panel/locales/nuevo"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0E5A73] hover:bg-[#093F52] text-white font-medium text-sm rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Publicar mi primer local</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
