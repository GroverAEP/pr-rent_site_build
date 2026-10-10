"use client";

import { useState, useTransition } from "react";
import {
  moderateUserAction,
  updateUserPhoneAction,
  type AdminActionResult,
} from "@/modules/admin/actions";
import type { User, UserStatus } from "@/modules/users";
import {
  CheckCircle2,
  XCircle,
  Pause,
  Phone,
  Mail,
  Building,
  Calendar,
  Edit3,
  X,
  Loader2,
  ExternalLink,
  Search,
} from "lucide-react";

interface UserRowCardProps {
  user: User;
  leadCount: number;
}

const statusConfig: Record<
  UserStatus,
  { label: string; colorClass: string; dotColor: string }
> = {
  pendiente: {
    label: "Pendiente",
    colorClass: "bg-amber-100 text-amber-800",
    dotColor: "bg-amber-500",
  },
  activo: {
    label: "Activo",
    colorClass: "bg-emerald-100 text-emerald-800",
    dotColor: "bg-emerald-500",
  },
  suspendido: {
    label: "Suspendido",
    colorClass: "bg-red-100 text-red-800",
    dotColor: "bg-red-500",
  },
};

function UserRowCard({ user, leadCount }: UserRowCardProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);
  const [editingPhone, setEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState(user.telefono_whatsapp);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleModerate = (newStatus: UserStatus, motivo?: string) => {
    setFeedback(null);
    startTransition(async () => {
      const result: AdminActionResult = await moderateUserAction(
        user.id,
        newStatus,
        motivo
      );
      setFeedback({
        ok: result.success,
        msg: result.message || "Acción completada",
      });
      if (result.success) {
        setShowRejectReason(false);
        setRejectReason("");
      }
    });
  };

  const handleUpdatePhone = () => {
    setFeedback(null);
    startTransition(async () => {
      const result = await updateUserPhoneAction(user.id, newPhone);
      setFeedback({
        ok: result.success,
        msg: result.message || "Teléfono actualizado",
      });
      if (result.success) {
        setEditingPhone(false);
      }
    });
  };

  const config = statusConfig[user.estado];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 transition-all hover:shadow-md">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="font-bold text-slate-900 text-base truncate">
            {user.nombre}
          </h3>
          {user.nombre_negocio && (
            <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
              <Building className="w-3.5 h-3.5 shrink-0" />
              {user.nombre_negocio}
            </p>
          )}
        </div>
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${config.colorClass}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
          {config.label}
        </span>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-sm">
        <div className="flex items-center gap-2 text-slate-600 truncate">
          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{user.email}</span>
        </div>

        <div className="flex items-center gap-2 text-slate-600">
          <Phone className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
          {editingPhone ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <input
                type="text"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="border border-slate-300 rounded-lg px-2 py-1 text-sm w-full max-w-[180px] focus:outline-none focus:ring-2 focus:ring-[#0E5A73] focus:border-transparent"
                placeholder="+51987654321"
                disabled={isPending}
              />
              <button
                onClick={handleUpdatePhone}
                disabled={isPending}
                className="text-xs bg-[#0E5A73] text-white px-2.5 py-1 rounded-lg hover:bg-[#093F52] disabled:opacity-50 cursor-pointer"
              >
                {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Guardar"}
              </button>
              <button
                onClick={() => {
                  setEditingPhone(false);
                  setNewPhone(user.telefono_whatsapp);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-sm">
                {user.telefono_whatsapp}
              </span>
              <a
                href={`https://wa.me/${user.telefono_whatsapp.replace("+", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#25D366] hover:text-green-700"
                title="Abrir en WhatsApp"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setEditingPhone(true)}
                className="text-slate-400 hover:text-[#0E5A73] cursor-pointer"
                title="Editar teléfono"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-slate-500 text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          Registrado:{" "}
          {new Date(user.created_at).toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>

        <div className="flex items-center gap-2 text-slate-500 text-xs">
          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          Leads WhatsApp recibidos:{" "}
          <span className="font-semibold text-slate-700">{leadCount}</span>
        </div>
      </div>

      {/* Suspend with reason */}
      {showRejectReason && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <label className="text-xs font-semibold text-red-700 block mb-1.5">
            Motivo de suspensión:
          </label>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={2}
            className="w-full border border-red-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
            placeholder="Escribe el motivo de la suspensión..."
            disabled={isPending}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() =>
                handleModerate("suspendido", rejectReason || "Sin motivo")
              }
              disabled={isPending || !rejectReason.trim()}
              className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                "Confirmar Suspensión"
              )}
            </button>
            <button
              onClick={() => {
                setShowRejectReason(false);
                setRejectReason("");
              }}
              className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5 cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Feedback message */}
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
      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
        {user.estado !== "activo" && (
          <button
            onClick={() => handleModerate("activo")}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Activar Cuenta
          </button>
        )}
        {user.estado !== "suspendido" && (
          <button
            onClick={() => setShowRejectReason(true)}
            disabled={isPending || showRejectReason}
            className="inline-flex items-center gap-1.5 text-xs font-medium bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Pause className="w-3.5 h-3.5" />
            Suspender
          </button>
        )}
        {user.estado === "suspendido" && (
          <button
            onClick={() => handleModerate("pendiente")}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 text-xs font-medium bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-200 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" />
            Pasar a Pendiente
          </button>
        )}
      </div>
    </div>
  );
}

// --- Filter bar (client-only) ---

interface UsersListProps {
  users: User[];
  leadCounts: Record<string, number>;
}

export function UsuariosAdminList({ users, leadCounts }: UsersListProps) {
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [search, setSearch] = useState("");

  const filtered = users.filter((u) => {
    const matchStatus =
      filterStatus === "todos" || u.estado === filterStatus;
    const matchSearch =
      !search ||
      u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.nombre_negocio &&
        u.nombre_negocio.toLowerCase().includes(search.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const statusCounts = {
    todos: users.length,
    pendiente: users.filter((u) => u.estado === "pendiente").length,
    activo: users.filter((u) => u.estado === "activo").length,
    suspendido: users.filter((u) => u.estado === "suspendido").length,
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
            placeholder="Buscar por nombre, email o negocio..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0E5A73] focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(
            Object.entries(statusCounts) as [string, number][]
          ).map(([key, count]) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
                filterStatus === key
                  ? "bg-[#0E5A73] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {key === "todos"
                ? "Todos"
                : key.charAt(0).toUpperCase() + key.slice(1)}{" "}
              ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="text-sm">
            No se encontraron propietarios con los filtros aplicados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((user) => (
            <UserRowCard
              key={user.id}
              user={user}
              leadCount={leadCounts[user.id] || 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
