import { Suspense } from "react";
import { RegisterForm } from "@/modules/auth";
import Link from "next/link";

export const metadata = {
  title: "Registro de Propietario | LocalVista",
  description: "Crea tu cuenta de propietario para publicar locales comerciales con recorrido 3D.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#F6F7F9] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-2xl font-bold text-[#0E5A73] font-display"
        >
          <div className="w-9 h-9 bg-[#0E5A73] text-white rounded-xl flex items-center justify-center font-black text-lg">
            LV
          </div>
          <span>LocalVista</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <Suspense
          fallback={
            <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-500">
              Cargando formulario...
            </div>
          }
        >
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
