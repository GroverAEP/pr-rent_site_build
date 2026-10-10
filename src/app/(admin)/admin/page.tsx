import { getRepositories } from "@/shared/db/factory";
import Link from "next/link";
import {
  Users,
  Building2,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  FileText,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Panel de Administración | RentLocal",
};

export default async function AdminDashboardPage() {
  const repos = getRepositories();

  // Fetch real metrics from the database
  const [allUsers, allLocalesResult, leadStats, recentAudit] =
    await Promise.all([
      repos.users.list({ role: "owner" }),
      repos.locales.search({ limit: 1000 }),
      repos.leads.getStatsSummary(),
      repos.audit.listRecent(8),
    ]);

  // User counts by status
  const usersPendientes = allUsers.filter(
    (u) => u.estado === "pendiente"
  ).length;
  const usersActivos = allUsers.filter((u) => u.estado === "activo").length;
  const usersSuspendidos = allUsers.filter(
    (u) => u.estado === "suspendido"
  ).length;

  // Local counts by status
  const allLocales = allLocalesResult.items;
  const localesEnRevision = allLocales.filter(
    (l) => l.estado === "en_revision"
  ).length;
  const localesPublicados = allLocales.filter(
    (l) => l.estado === "publicado"
  ).length;
  const localesRechazados = allLocales.filter(
    (l) => l.estado === "rechazado"
  ).length;
  const localesSuspendidos = allLocales.filter(
    (l) => l.estado === "suspendido"
  ).length;
  const localesBorrador = allLocales.filter(
    (l) => l.estado === "borrador"
  ).length;

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            Control de Moderación
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Supervisión de propietarios, aprobación de locales y registro
            de auditoría
          </p>
        </div>
      </div>

      {/* Metric Cards Row 1: Key Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Propietarios
            </span>
            <Users className="w-4 h-4 text-[#0E5A73]" />
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {allUsers.length}
          </div>
          {usersPendientes > 0 ? (
            <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {usersPendientes} pendiente{usersPendientes > 1 ? "s" : ""} de
              revisión
            </p>
          ) : (
            <p className="text-xs text-emerald-600 font-medium mt-1">
              Todos revisados ✓
            </p>
          )}
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Locales Totales
            </span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {allLocales.length}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {localesPublicados} publicados, {localesBorrador} borrador
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Cola de Aprobación
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="text-3xl font-bold text-amber-600">
            {localesEnRevision}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {localesRechazados > 0
              ? `${localesRechazados} rechazados`
              : "Sin rechazados"}{" "}
            · {localesSuspendidos} suspendidos
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Leads WhatsApp
            </span>
            <Activity className="w-4 h-4 text-[#25D366]" />
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {leadStats.totalLeads}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {leadStats.last7Days} en los últimos 7 días
          </p>
        </div>
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Users status breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#0E5A73]" />
            Estado de Propietarios
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Activos
              </span>
              <span className="text-sm font-semibold text-slate-900">
                {usersActivos}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Pendientes
              </span>
              <span className="text-sm font-semibold text-amber-600">
                {usersPendientes}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Suspendidos
              </span>
              <span className="text-sm font-semibold text-slate-900">
                {usersSuspendidos}
              </span>
            </div>
          </div>
        </div>

        {/* Locales status breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            Estado de Locales Comerciales
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Publicados
              </span>
              <span className="text-sm font-semibold text-slate-900">
                {localesPublicados}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                En Revisión
              </span>
              <span className="text-sm font-semibold text-amber-600">
                {localesEnRevision}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Borrador
              </span>
              <span className="text-sm font-semibold text-slate-900">
                {localesBorrador}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                Rechazados
              </span>
              <span className="text-sm font-semibold text-slate-900">
                {localesRechazados}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                Suspendidos
              </span>
              <span className="text-sm font-semibold text-slate-900">
                {localesSuspendidos}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards + Recent Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Acciones Rápidas
          </h2>

          <Link
            href="/admin/usuarios"
            className="block p-5 bg-white border border-slate-200 hover:border-[#0E5A73] rounded-2xl transition-all shadow-sm group"
          >
            <h3 className="font-bold text-slate-900 group-hover:text-[#0E5A73] transition-colors flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-500" />
                Gestionar Propietarios
              </span>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#0E5A73]" />
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Aprobar nuevos registros, suspender cuentas o actualizar
              números de WhatsApp.
            </p>
            {usersPendientes > 0 && (
              <span className="mt-3 inline-block text-[11px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                {usersPendientes} pendiente{usersPendientes > 1 ? "s" : ""}
              </span>
            )}
          </Link>

          <Link
            href="/admin/locales"
            className="block p-5 bg-white border border-slate-200 hover:border-[#0E5A73] rounded-2xl transition-all shadow-sm group"
          >
            <h3 className="font-bold text-slate-900 group-hover:text-[#0E5A73] transition-colors flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-500" />
                Revisar Cola de Locales
              </span>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#0E5A73]" />
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Inspeccionar datos, previsualizar 3D, aprobar o rechazar
              con motivo.
            </p>
            {localesEnRevision > 0 && (
              <span className="mt-3 inline-block text-[11px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                {localesEnRevision} en cola
              </span>
            )}
          </Link>
        </div>

        {/* Recent Audit */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" />
              Auditoría Reciente
            </h2>
            <Link
              href="/admin/auditoria"
              className="text-xs text-[#0E5A73] hover:underline font-medium flex items-center gap-1"
            >
              Ver toda la bitácora
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentAudit.length === 0 ? (
            <p className="text-sm text-slate-400 italic py-4">
              Sin actividad registrada aún.
            </p>
          ) : (
            <div className="space-y-3">
              {recentAudit.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 text-sm border-b border-slate-100 pb-3 last:border-0"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0E5A73] mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-slate-800">
                      {entry.accion.replace(/_/g, " ")}
                    </span>
                    <span className="text-slate-400"> · </span>
                    <span className="text-slate-500">{entry.entidad}</span>
                    {entry.detalle &&
                      typeof entry.detalle === "object" &&
                      "motivo" in entry.detalle && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                          {String(entry.detalle.motivo)}
                        </p>
                      )}
                  </div>
                  <time className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                    {new Date(entry.created_at).toLocaleDateString("es-PE", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
