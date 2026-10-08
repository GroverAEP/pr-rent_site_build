import { getCurrentUser } from "@/modules/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getRepositories } from "@/shared/db/factory";
import { formatPrice } from "@/shared/lib/currency";
import { deleteLocalAction } from "@/modules/locales";
import {
  Plus,
  Building2,
  Box,
  Edit,
  Trash2,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mis Locales Comerciales | Panel Propietario",
};

export default async function OwnerLocalesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/ingresar");
  }

  const repos = getRepositories();
  const locales = await repos.locales.findByOwnerId(user.id);

  const statusBadges: Record<string, string> = {
    borrador: "bg-slate-100 text-slate-700",
    en_revision: "bg-amber-100 text-amber-800",
    publicado: "bg-emerald-100 text-emerald-800",
    rechazado: "bg-red-100 text-red-800",
    suspendido: "bg-red-100 text-red-800",
  };

  const statusLabels: Record<string, string> = {
    borrador: "Borrador",
    en_revision: "En Revisión",
    publicado: "Publicado",
    rechazado: "Rechazado",
    suspendido: "Suspendido",
  };

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
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
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/panel" className="text-slate-500 hover:text-slate-900">
                Resumen
              </Link>
              <Link href="/panel/locales" className="font-semibold text-[#0E5A73]">
                Mis Locales
              </Link>
            </nav>
          </div>

          <Link
            href="/panel/locales/nuevo"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0E5A73] hover:bg-[#093F52] text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Publicar Local</span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">
              Mis Locales Comerciales ({locales.length})
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Administra tus propiedades, modifica sus datos y personaliza su recorrido 3D
            </p>
          </div>
        </div>

        {locales.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              Aún no tienes locales registrados
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
              Comienza publicando tu primer inmueble comercial y configura su recorrido 3D paramétrico.
            </p>
            <Link
              href="/panel/locales/nuevo"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0E5A73] hover:bg-[#093F52] text-white font-medium text-sm rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar mi primer local</span>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Inmueble</th>
                    <th className="px-6 py-4">Ubicación</th>
                    <th className="px-6 py-4">Precio / Área</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {locales.map((loc) => (
                    <tr key={loc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="relative w-14 h-11 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                            <Image
                              src={loc.portada_url}
                              alt={loc.titulo}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block line-clamp-1">
                              {loc.titulo}
                            </span>
                            <span className="text-xs text-slate-400 capitalize">
                              {loc.operacion}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-800 block">
                          {loc.distrito}
                        </span>
                        <span className="text-xs text-slate-400 truncate max-w-[180px] block">
                          {loc.direccion}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900 block">
                          {formatPrice(loc.precio, loc.moneda)}
                        </span>
                        <span className="text-xs text-slate-400">
                          {loc.area_m2} m²
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            statusBadges[loc.estado] || "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {statusLabels[loc.estado] || loc.estado}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Configurar Tour 3D */}
                          <Link
                            href={`/panel/locales/${loc.id}/tour`}
                            className="p-2 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                            title="Editar Tour 3D"
                          >
                            <Box className="w-4 h-4" />
                          </Link>

                          {/* Ver Ficha Pública */}
                          <Link
                            href={`/locales/${loc.slug}`}
                            target="_blank"
                            className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                            title="Ver en la web"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          {/* Editar Datos */}
                          <Link
                            href={`/panel/locales/${loc.id}/editar`}
                            className="p-2 text-[#0E5A73] bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors cursor-pointer"
                            title="Editar datos"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {/* Eliminar Local */}
                          <form
                            action={async () => {
                              "use server";
                              await deleteLocalAction(loc.id);
                            }}
                          >
                            <button
                              type="submit"
                              className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar local"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
