import { getRepositories } from "@/shared/db/factory";
import { Users, ShieldCheck } from "lucide-react";
import { UsuariosAdminList } from "./UsuariosClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gestión de Propietarios | Admin RentLocal",
};

export default async function AdminUsuariosPage() {
  const repos = getRepositories();

  // Fetch all owners (excluding admin)
  const owners = await repos.users.list({ role: "owner" });

  // Fetch lead counts per owner in parallel
  const leadCountEntries = await Promise.all(
    owners.map(async (u) => {
      const count = await repos.leads.countByOwnerId(u.id);
      return [u.id, count] as const;
    })
  );
  const leadCounts = Object.fromEntries(leadCountEntries);

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
            <Users className="w-6 h-6 text-[#0E5A73]" />
            Gestión de Propietarios
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Aprobar cuentas, suspender usuarios y actualizar números de
            WhatsApp con registro de auditoría.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>
            Todas las acciones quedan registradas en la bitácora de auditoría.
          </span>
        </div>
      </div>

      {/* Client-side interactive list */}
      <UsuariosAdminList users={owners} leadCounts={leadCounts} />
    </div>
  );
}
