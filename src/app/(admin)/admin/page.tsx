import { getCurrentUser } from "@/modules/auth";
import { redirect } from "next/navigation";
import { logoutAction } from "@/modules/auth";
import Link from "next/link";
import {
  ShieldAlert,
  LogOut,
  Users,
  Building2,
  Activity,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Panel de Administración | LocalVista",
};

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/ingresar");
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold text-[#0E5A73] font-display"
            >
              <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                LV
              </div>
              <span>LocalVista</span>
            </Link>
            <span className="text-xs bg-slate-900 text-white font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <ShieldAlert className="w-3 h-3 text-[#F59E0B]" />
              Super Admin Único
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-slate-800">
                {user.nombre}
              </div>
              <div className="text-xs text-slate-500">{user.email}</div>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">
              Control de Moderación
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Supervisión de propietarios, aprobación de locales y registro de auditoría
            </p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Propietarios
              </span>
              <Users className="w-4 h-4 text-[#0E5A73]" />
            </div>
            <div className="text-3xl font-bold text-slate-900">4</div>
            <p className="text-xs text-amber-600 font-medium mt-1">
              1 pendiente de revisión
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Locales Totales
              </span>
              <Building2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900">11</div>
            <p className="text-xs text-slate-400 mt-1">10 publicados, 1 en cola</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Cola de Aprobación
              </span>
              <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div className="text-3xl font-bold text-amber-600">1</div>
            <p className="text-xs text-slate-400 mt-1">Pendiente de publicar</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Leads WhatsApp
              </span>
              <Activity className="w-4 h-4 text-[#25D366]" />
            </div>
            <div className="text-3xl font-bold text-slate-900">3</div>
            <p className="text-xs text-slate-400 mt-1">Clics auditados</p>
          </div>
        </div>

        {/* Fast Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/admin/usuarios"
            className="p-6 bg-white border border-slate-200 hover:border-[#0E5A73] rounded-2xl transition-all shadow-sm group"
          >
            <h3 className="font-bold text-slate-900 group-hover:text-[#0E5A73] transition-colors flex items-center justify-between">
              <span>Gestionar Propietarios</span>
              <Users className="w-5 h-5 text-slate-400 group-hover:text-[#0E5A73]" />
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Aprobar nuevos registros, suspender cuentas o actualizar números de WhatsApp con bitácora de auditoría.
            </p>
          </Link>

          <Link
            href="/admin/locales"
            className="p-6 bg-white border border-slate-200 hover:border-[#0E5A73] rounded-2xl transition-all shadow-sm group"
          >
            <h3 className="font-bold text-slate-900 group-hover:text-[#0E5A73] transition-colors flex items-center justify-between">
              <span>Revisar Cola de Locales</span>
              <Building2 className="w-5 h-5 text-slate-400 group-hover:text-[#0E5A73]" />
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Inspeccionar datos de los locales, previsualizar configuraciones 3D, aprobar o rechazar con motivo formal.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
