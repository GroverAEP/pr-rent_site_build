import Link from "next/link";
import { getCurrentUser } from "@/modules/auth";
import { Sparkles, User, LogIn, Plus } from "lucide-react";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F9]">
      {/* Navbar Superior */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold text-[#0E5A73] font-display"
            >
              <div className="w-8 h-8 bg-[#0E5A73] text-white rounded-lg flex items-center justify-center font-black text-sm">
                RL
              </div>
              <span>RentLocal</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <Link
                href="/locales"
                className="hover:text-[#0E5A73] transition-colors"
              >
                Explorar Locales
              </Link>
              <Link
                href="/locales?operacion=alquiler"
                className="hover:text-[#0E5A73] transition-colors"
              >
                En Alquiler
              </Link>
              <Link
                href="/locales?operacion=venta"
                className="hover:text-[#0E5A73] transition-colors"
              >
                En Venta
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/panel/locales/nuevo"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-semibold transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Publicar Local</span>
            </Link>

            {user ? (
              <Link
                href={user.role === "admin" ? "/admin" : "/panel"}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0E5A73] hover:bg-[#093F52] text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
              >
                <User className="w-3.5 h-3.5" />
                <span>
                  {user.role === "admin" ? "Panel Admin" : "Mi Panel"}
                </span>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/ingresar"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Ingresar</span>
                </Link>
                <Link
                  href="/registro"
                  className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0E5A73] hover:bg-[#093F52] text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear Cuenta</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1">{children}</div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 text-xl font-bold text-white font-display mb-3">
                <div className="w-7 h-7 bg-[#0E5A73] text-white rounded-lg flex items-center justify-center font-bold text-xs">
                  RL
                </div>
                <span>RentLocal</span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Plataforma inmobiliaria comercial para Lima y Perú. Recorre locales comerciales en 3D antes de agendar tu visita física, ubica el negocio en Google Maps y contacta directamente al dueño por WhatsApp.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                Zonas Populares en Lima
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <Link href="/locales?distrito=Villa+El+Salvador" className="hover:text-white transition-colors">
                    Locales en Villa El Salvador
                  </Link>
                </li>
                <li>
                  <Link href="/locales?distrito=Miraflores" className="hover:text-white transition-colors">
                    Locales en Miraflores
                  </Link>
                </li>
                <li>
                  <Link href="/locales?distrito=San+Juan+de+Miraflores" className="hover:text-white transition-colors">
                    Locales en San Juan de Miraflores
                  </Link>
                </li>
                <li>
                  <Link href="/locales?distrito=Villa+Mar%C3%ADa+del+Triunfo" className="hover:text-white transition-colors">
                    Locales en VMT
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                Propietarios
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <Link href="/registro" className="hover:text-white transition-colors">
                    Publicar mi local comercial
                  </Link>
                </li>
                <li>
                  <Link href="/ingresar" className="hover:text-white transition-colors">
                    Acceder a mi panel
                  </Link>
                </li>
                <li>
                  <span className="text-slate-500">Recorrido 3D opcional</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              © 2026 RentLocal Perú. Todos los derechos reservados.
            </div>
            <div className="flex gap-4">
              <span className="text-slate-500">Lima Metropolitana, Perú</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
