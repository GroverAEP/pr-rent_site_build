import { getCurrentUser, logoutAction } from "@/modules/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ShieldAlert,
  LogOut,
  Users,
  Building2,
  LayoutDashboard,
  FileText,
  ExternalLink,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/ingresar");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F9]">
      {/* Top Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-xl font-bold font-display"
            >
              <div className="w-8 h-8 bg-[#0E5A73] text-white rounded-lg flex items-center justify-center font-black text-sm">
                RL
              </div>
              <span>RentLocal</span>
            </Link>

            <span className="text-[11px] bg-amber-500/20 text-amber-300 font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border border-amber-500/30">
              <ShieldAlert className="w-3 h-3 text-[#F59E0B]" />
              Super Admin Único
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <span>Ver Sitio Público</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <div className="h-4 w-px bg-slate-700 hidden sm:block" />

            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-200">
                {user.nombre}
              </div>
              <div className="text-[11px] text-slate-400">{user.email}</div>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div className="bg-slate-800/80 border-t border-slate-700/60 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-4 overflow-x-auto py-1 text-xs">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors whitespace-nowrap"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Resumen & Métricas</span>
            </Link>
            <Link
              href="/admin/locales"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors whitespace-nowrap"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Cola de Locales</span>
            </Link>
            <Link
              href="/admin/usuarios"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors whitespace-nowrap"
            >
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span>Propietarios & WhatsApp</span>
            </Link>
            <Link
              href="/admin/auditoria"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bitácora de Auditoría</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
