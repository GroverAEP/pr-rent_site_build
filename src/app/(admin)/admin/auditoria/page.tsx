import { getRepositories } from "@/shared/db/factory";
import {
  FileText,
  User,
  Building2,
  Settings,
  Clock,
  ShieldAlert,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bitácora de Auditoría | Admin RentLocal",
};

const accionStyles: Record<string, { icon: React.ReactNode; color: string }> = {
  USUARIO_ACTIVO: {
    icon: <User className="w-3.5 h-3.5" />,
    color: "text-emerald-600 bg-emerald-50",
  },
  USUARIO_SUSPENDIDO: {
    icon: <User className="w-3.5 h-3.5" />,
    color: "text-red-600 bg-red-50",
  },
  USUARIO_PENDIENTE: {
    icon: <User className="w-3.5 h-3.5" />,
    color: "text-amber-600 bg-amber-50",
  },
  USUARIO_TELEFONO_MODIFICADO: {
    icon: <User className="w-3.5 h-3.5" />,
    color: "text-blue-600 bg-blue-50",
  },
  LOCAL_APROBAR: {
    icon: <Building2 className="w-3.5 h-3.5" />,
    color: "text-emerald-600 bg-emerald-50",
  },
  LOCAL_RECHAZAR: {
    icon: <Building2 className="w-3.5 h-3.5" />,
    color: "text-red-600 bg-red-50",
  },
  LOCAL_SUSPENDER: {
    icon: <Building2 className="w-3.5 h-3.5" />,
    color: "text-amber-600 bg-amber-50",
  },
};

function getAccionStyle(accion: string) {
  return (
    accionStyles[accion] || {
      icon: <Settings className="w-3.5 h-3.5" />,
      color: "text-slate-600 bg-slate-50",
    }
  );
}

function formatAccion(accion: string): string {
  return accion
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());
}

export default async function AdminAuditoriaPage() {
  const repos = getRepositories();

  // Fetch the last 100 audit entries
  const entries = await repos.audit.listRecent(100);

  // Resolve unique actor names
  const uniqueActorIds = [...new Set(entries.map((e) => e.actor_id))];
  const actors = await Promise.all(
    uniqueActorIds.map((id) => repos.users.findById(id))
  );
  const actorsMap = Object.fromEntries(
    actors.filter((a) => a !== null).map((a) => [a!.id, a!])
  );

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-500" />
            Bitácora de Auditoría
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Registro inmutable de todas las acciones administrativas con
            actor, entidad afectada y timestamp.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
          <ShieldAlert className="w-4 h-4 text-[#F59E0B]" />
          <span>
            {entries.length} registro{entries.length !== 1 ? "s" : ""} en total
          </span>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Clock className="w-16 h-16 mx-auto text-slate-200 mb-4" />
          <p className="text-sm">
            Aún no se han registrado acciones de auditoría.
          </p>
          <p className="text-xs mt-1">
            Las entradas aparecerán aquí al moderar usuarios o locales.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <div className="col-span-2">Timestamp</div>
            <div className="col-span-2">Actor</div>
            <div className="col-span-2">Acción</div>
            <div className="col-span-1">Entidad</div>
            <div className="col-span-5">Detalle</div>
          </div>

          {/* Entries */}
          <div className="divide-y divide-slate-100">
            {entries.map((entry) => {
              const style = getAccionStyle(entry.accion);
              const actor = actorsMap[entry.actor_id];
              const detalle = entry.detalle;

              return (
                <div
                  key={entry.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors text-sm"
                >
                  {/* Timestamp */}
                  <div className="col-span-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-300 shrink-0 hidden md:block" />
                    <time className="text-xs text-slate-500 font-mono">
                      {new Date(entry.created_at).toLocaleDateString("es-PE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                      {" "}
                      {new Date(entry.created_at).toLocaleTimeString("es-PE", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </time>
                  </div>

                  {/* Actor */}
                  <div className="col-span-2">
                    <span className="text-sm font-medium text-slate-700">
                      {actor
                        ? actor.nombre
                        : entry.actor_id.slice(0, 8) + "..."}
                    </span>
                    {actor && (
                      <span className="block text-[11px] text-slate-400">
                        {actor.role === "admin" ? "Admin" : "Owner"} ·{" "}
                        {actor.email}
                      </span>
                    )}
                  </div>

                  {/* Action badge */}
                  <div className="col-span-2">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg ${style.color}`}
                    >
                      {style.icon}
                      {formatAccion(entry.accion)}
                    </span>
                  </div>

                  {/* Entity */}
                  <div className="col-span-1">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                      {entry.entidad}
                    </span>
                  </div>

                  {/* Detail */}
                  <div className="col-span-5 text-xs text-slate-500">
                    {detalle && typeof detalle === "object" ? (
                      <div className="space-y-0.5">
                        {Object.entries(detalle).map(([key, value]) => (
                          <div key={key} className="flex gap-1.5">
                            <span className="text-slate-400 font-medium shrink-0">
                              {key.replace(/_/g, " ")}:
                            </span>
                            <span className="text-slate-600 truncate">
                              {String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-300 italic">
                        Sin detalle
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
