import { getRepositories } from "@/shared/db/factory";
import { Building2, ShieldCheck } from "lucide-react";
import { LocalesAdminList } from "./LocalesClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cola de Moderación de Locales | Admin RentLocal",
};

export default async function AdminLocalesPage() {
  const repos = getRepositories();

  // Fetch ALL locales (no filter on estado — admin sees everything)
  const { items: allLocales } = await repos.locales.search({ limit: 500 });

  // Sort: en_revision first, then rechazados, then borradores, then publicados, then suspendidos
  const statusOrder: Record<string, number> = {
    en_revision: 0,
    rechazado: 1,
    borrador: 2,
    publicado: 3,
    suspendido: 4,
  };
  const sortedLocales = [...allLocales].sort(
    (a, b) =>
      (statusOrder[a.estado] ?? 99) - (statusOrder[b.estado] ?? 99)
  );

  // Fetch all unique owners in parallel
  const uniqueOwnerIds = [...new Set(allLocales.map((l) => l.owner_id))];
  const owners = await Promise.all(
    uniqueOwnerIds.map((id) => repos.users.findById(id))
  );
  const ownersMap = Object.fromEntries(
    owners
      .filter((o) => o !== null)
      .map((o) => [o!.id, o!])
  );

  // Fetch lead counts per local in parallel
  const leadCountEntries = await Promise.all(
    allLocales.map(async (l) => {
      const count = await repos.leads.countByLocalId(l.id);
      return [l.id, count] as const;
    })
  );
  const leadCounts = Object.fromEntries(leadCountEntries);

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-500" />
            Cola de Moderación de Locales
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Revisar, aprobar o rechazar locales comerciales. Los locales en
            revisión aparecen primero.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>
            Cada aprobación y rechazo queda registrado con motivo en auditoría.
          </span>
        </div>
      </div>

      {/* Client-side interactive list */}
      <LocalesAdminList
        locales={sortedLocales}
        ownersMap={ownersMap}
        leadCounts={leadCounts}
      />
    </div>
  );
}
