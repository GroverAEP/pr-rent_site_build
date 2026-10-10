import { getCurrentUser } from "@/modules/auth";
import { redirect } from "next/navigation";
import { logoutAction } from "@/modules/auth";
import Link from "next/link";
import Image from "next/image";
import { getRepositories } from "@/shared/db/factory";
import { formatPrice } from "@/shared/lib/currency";
import { deleteLocalAction } from "@/modules/locales";
import {
  Building2,
  LogOut,
  Plus,
  Clock,
  Eye,
  MessageSquare,
  Box,
  Edit,
  Trash2,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Panel del Propietario | RentLocal",
};

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

export default async function OwnerPanelPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/ingresar");
  }

  const repos = getRepositories();

  // Obtener negocios del propietario y conteo de leads de WhatsApp
  const [locales, whatsappLeadsCount] = await Promise.all([
    repos.locales.findByOwnerId(user.id),
    repos.leads.countByOwnerId(user.id),
  ]);

  // Estimación de visualizaciones según locales activos y tours configurados
  const totalToursConfigurados = locales.filter(
    (l) => l.tour_config?.hotspots?.length > 0 || l.tour_glb_url
  ).length;

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
                RL
              </div>
              <span>RentLocal</span>
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

        {/* Encabezado y Acción Principal */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">
              Bienvenido, {user.nombre.split(" ")[0]}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Gestiona tus negocios, mide métricas de interacción y personaliza tus recorridos
            </p>
          </div>

          <Link
            href="/panel/locales/nuevo"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0E5A73] hover:bg-[#093F52] text-white font-medium text-sm rounded-xl shadow-sm transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Publicar nuevo negocio</span>
          </Link>
        </div>

        {/* Tarjetas de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Mis Negocios Registrados
              </span>
              <Building2 className="w-4 h-4 text-[#0E5A73]" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{locales.length}</div>
            <p className="text-xs text-slate-400 mt-1">
              {locales.filter((l) => l.estado === "publicado").length} publicados en el catálogo
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Tours 3D Activos
              </span>
              <Eye className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{totalToursConfigurados}</div>
            <p className="text-xs text-slate-400 mt-1">Negocios con recorrido virtual</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Contactos Directos WhatsApp
              </span>
              <MessageSquare className="w-4 h-4 text-[#25D366]" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{whatsappLeadsCount}</div>
            <p className="text-xs text-slate-400 mt-1">Clics de clientes hacia tu chat</p>
          </div>
        </div>

        {/* Sección: Lista de Negocios del Propietario */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#0E5A73]" />
              <span>Mis Negocios y Locales ({locales.length})</span>
            </h2>
            {locales.length > 0 && (
              <span className="text-xs text-slate-500">
                Visualiza el estado y gestiona cada propiedad
              </span>
            )}
          </div>

          {locales.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4">
                <Building2 className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">
                Aún no tienes locales o negocios registrados
              </h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
                Empieza publicando tu primer inmueble comercial. Podrás añadir su ubicación en Google Maps y personalizar su recorrido 3D.
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
                      <th className="px-6 py-4">Negocio / Inmueble</th>
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
                              title="Ver en la web pública"
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
        </div>
      </main>
    </div>
  );
}
