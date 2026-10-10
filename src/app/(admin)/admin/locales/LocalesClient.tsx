"use client";

import { useState, useTransition } from "react";
import {
  moderateLocalAction,
  type AdminActionResult,
} from "@/modules/admin/actions";
import type { Local, LocalStatus } from "@/modules/locales";
import type { User } from "@/modules/users";
import {
  CheckCircle2,
  XCircle,
  Pause,
  MapPin,
  Ruler,
  DollarSign,
  Eye,
  Calendar,
  Loader2,
  Search,
  Building2,
  ExternalLink,
} from "lucide-react";

const statusConfig: Record<
  LocalStatus,
  { label: string; colorClass: string; dotColor: string }
> = {
  borrador: {
    label: "Borrador",
    colorClass: "bg-slate-100 text-slate-700",
    dotColor: "bg-slate-400",
  },
  en_revision: {
    label: "En Revisión",
    colorClass: "bg-amber-100 text-amber-800",
    dotColor: "bg-amber-500",
  },
  publicado: {
    label: "Publicado",
    colorClass: "bg-emerald-100 text-emerald-800",
    dotColor: "bg-emerald-500",
  },
  rechazado: {
    label: "Rechazado",
    colorClass: "bg-red-100 text-red-800",
    dotColor: "bg-red-400",
  },
  suspendido: {
    label: "Suspendido",
    colorClass: "bg-red-100 text-red-700",
    dotColor: "bg-red-600",
  },
};

function formatPrice(precio: number, moneda: string): string {
  const formatted = new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(precio);
  return moneda === "PEN" ? `S/ ${formatted}` : `US$ ${formatted}`;
}

interface LocalCardProps {
  local: Local;
  owner: User | undefined;
  leadCount: number;
}

function LocalModerationCard({ local, owner, leadCount }: LocalCardProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleAction = (
    action: "aprobar" | "rechazar" | "suspender",
    motivo?: string
  ) => {
    setFeedback(null);
    startTransition(async () => {
      const result: AdminActionResult = await moderateLocalAction(
        local.id,
        action,
        motivo
      );
      setFeedback({
        ok: result.success,
        msg: result.message || "Acción completada",
      });
      if (result.success) {
        setShowRejectForm(false);
        setRejectReason("");
      }
    });
  };

  const config = statusConfig[local.estado];
  const operacionLabel = {
    alquiler: "Alquiler",
    venta: "Venta",
    traspaso: "Traspaso",
  }[local.operacion];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
      {/* Cover image + badges */}
      <div className="relative h-40 bg-slate-200">
        {local.portada_url ? (
          <img
            src={local.portada_url}
            alt={local.titulo}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100">
            <Building2 className="w-12 h-12 text-slate-300" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${config.colorClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
            {config.label}
          </span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-900/70 text-white">
            {operacionLabel}
          </span>
        </div>
        {local.tour_config && (
          <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F59E0B] text-white">
            Tour 3D
          </span>
        )}
      </div>

      <div className="p-5">
        {/* Title and price */}
        <div className="mb-3">
          <h3 className="font-bold text-slate-900 text-base leading-tight">
            {local.titulo}
          </h3>
          <p className="text-lg font-bold text-[#0E5A73] mt-1">
            {formatPrice(local.precio, local.moneda)}
            <span className="text-xs font-normal text-slate-400">
              {" "}
              / {local.operacion === "alquiler" ? "mes" : "total"}
            </span>
          </p>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 mb-4">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {local.distrito}, {local.ciudad}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Ruler className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {local.area_m2} m²
          </div>
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {formatPrice(local.precio / local.area_m2, local.moneda)}/m²
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
            {leadCount} leads
          </div>
        </div>

        {/* Owner info */}
        {owner && (
          <div className="bg-slate-50 rounded-xl px-3 py-2 mb-4 text-xs">
            <span className="text-slate-400">Propietario: </span>
            <span className="font-semibold text-slate-700">
              {owner.nombre}
            </span>
            <span className="text-slate-300 mx-1">·</span>
            <span className="text-slate-500 font-mono">
              {owner.telefono_whatsapp}
            </span>
            <span className="text-slate-300 mx-1">·</span>
            <span
              className={`font-medium ${
                owner.estado === "activo"
                  ? "text-emerald-600"
                  : owner.estado === "pendiente"
                    ? "text-amber-600"
                    : "text-red-600"
              }`}
            >
              {owner.estado}
            </span>
          </div>
        )}

        {/* Date and slug */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(local.created_at).toLocaleDateString("es-PE", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
          <a
            href={`/locales/${local.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[#0E5A73] hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            ver ficha
          </a>
        </div>

        {/* Reject reason form */}
        {showRejectForm && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <label className="text-xs font-semibold text-red-700 block mb-1.5">
              Motivo del rechazo:
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={2}
              className="w-full border border-red-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              placeholder="Describe por qué se rechaza este local..."
              disabled={isPending}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() =>
                  handleAction("rechazar", rejectReason || "Sin motivo")
                }
                disabled={isPending || !rejectReason.trim()}
                className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50 cursor-pointer"
              >
                {isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  "Confirmar Rechazo"
                )}
              </button>
              <button
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectReason("");
                }}
                className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div
            className={`mb-3 text-xs px-3 py-2 rounded-lg ${
              feedback.ok
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {feedback.msg}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
          {(local.estado === "en_revision" ||
            local.estado === "rechazado" ||
            local.estado === "suspendido") && (
            <button
              onClick={() => handleAction("aprobar")}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Aprobar y Publicar
            </button>
          )}

          {(local.estado === "en_revision" ||
            local.estado === "publicado") && (
            <button
              onClick={() => setShowRejectForm(true)}
              disabled={isPending || showRejectForm}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              Rechazar
            </button>
          )}

          {local.estado === "publicado" && (
            <button
              onClick={() => handleAction("suspender", "Suspendido por el administrador")}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-200 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5" />
              Suspender
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- List with filters ---

interface LocalsListProps {
  locales: Local[];
  ownersMap: Record<string, User>;
  leadCounts: Record<string, number>;
}

export function LocalesAdminList({
  locales,
  ownersMap,
  leadCounts,
}: LocalsListProps) {
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [search, setSearch] = useState("");

  const filtered = locales.filter((l) => {
    const matchStatus =
      filterStatus === "todos" || l.estado === filterStatus;
    const matchSearch =
      !search ||
      l.titulo.toLowerCase().includes(search.toLowerCase()) ||
      l.slug.toLowerCase().includes(search.toLowerCase()) ||
      l.distrito.toLowerCase().includes(search.toLowerCase()) ||
      (ownersMap[l.owner_id] &&
        ownersMap[l.owner_id].nombre
          .toLowerCase()
          .includes(search.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const statusCounts: Record<string, number> = {
    todos: locales.length,
    en_revision: locales.filter((l) => l.estado === "en_revision").length,
    publicado: locales.filter((l) => l.estado === "publicado").length,
    borrador: locales.filter((l) => l.estado === "borrador").length,
    rechazado: locales.filter((l) => l.estado === "rechazado").length,
    suspendido: locales.filter((l) => l.estado === "suspendido").length,
  };

  const statusLabels: Record<string, string> = {
    todos: "Todos",
    en_revision: "En Revisión",
    publicado: "Publicados",
    borrador: "Borrador",
    rechazado: "Rechazados",
    suspendido: "Suspendidos",
  };

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, slug, distrito..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0E5A73] focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {Object.entries(statusCounts).map(([key, count]) =>
            count > 0 || key === "todos" ? (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
                  filterStatus === key
                    ? "bg-[#0E5A73] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {statusLabels[key]} ({count})
              </button>
            ) : null
          )}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Building2 className="w-12 h-12 mx-auto text-slate-200 mb-3" />
          <p className="text-sm">
            No se encontraron locales con los filtros aplicados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((local) => (
            <LocalModerationCard
              key={local.id}
              local={local}
              owner={ownersMap[local.owner_id]}
              leadCount={leadCounts[local.id] || 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
