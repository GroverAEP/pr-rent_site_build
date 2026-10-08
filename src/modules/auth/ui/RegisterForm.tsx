"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  registerOwnerSchema,
  RegisterOwnerFormData,
} from "../application/auth.schemas";
import { registerOwnerAction } from "./actions";
import {
  UserPlus,
  AlertCircle,
  Building2,
  Lock,
  Mail,
  Phone,
  User,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterOwnerFormData>({
    resolver: zodResolver(registerOwnerSchema),
    defaultValues: {
      nombre: "",
      email: "",
      telefono_whatsapp: "+51 ",
      nombre_negocio: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterOwnerFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await registerOwnerAction(data);
      if (!res.success) {
        setServerError(res.message || "Error al completar el registro.");
        setIsSubmitting(false);
        return;
      }

      router.push(res.data?.redirectUrl || "/panel");
      router.refresh();
    } catch {
      setServerError("Ocurrió un error inesperado al procesar el registro.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-[#0E5A73] mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            Registrar Propietario
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Publica tus locales comerciales y recibe clientes directamente en tu WhatsApp
          </p>
        </div>

        {/* Banner informativo de moderación */}
        <div className="mb-6 p-4 bg-sky-50/70 border border-sky-100 rounded-xl flex items-start gap-3 text-sky-900 text-xs leading-relaxed">
          <ShieldCheck className="w-5 h-5 flex-shrink-0 text-[#0E5A73] mt-0.5" />
          <div>
            <strong className="font-semibold block mb-0.5 text-[#0E5A73]">
              Verificación de Propietarios
            </strong>
            Tu cuenta se creará de inmediato para que puedas configurar tus locales y recorridos 3D. El administrador validará tu perfil antes de que tus locales sean públicos para proteger la seguridad de los clientes.
          </div>
        </div>

        {serverError && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nombre Completo o Razón Social
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Ej. Juan Pérez o Inmobiliaria del Sur SAC"
                {...register("nombre")}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5A73] focus:bg-white transition-all ${
                  errors.nombre ? "border-red-400 bg-red-50/30" : "border-slate-200"
                }`}
              />
            </div>
            {errors.nombre && (
              <p className="text-xs text-red-600 mt-1">{errors.nombre.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="contacto@empresa.pe"
                  {...register("email")}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5A73] focus:bg-white transition-all ${
                    errors.email ? "border-red-400 bg-red-50/30" : "border-slate-200"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                WhatsApp de Contacto (+51)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="+51 987 654 321"
                  {...register("telefono_whatsapp")}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5A73] focus:bg-white transition-all ${
                    errors.telefono_whatsapp ? "border-red-400 bg-red-50/30" : "border-slate-200"
                  }`}
                />
              </div>
              {errors.telefono_whatsapp && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.telefono_whatsapp.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nombre Comercial o Marca (Opcional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Building2 className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Ej. Espacios Comerciales Lima"
                {...register("nombre_negocio")}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5A73] focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Contraseña (Mín. 8 caracteres)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5A73] focus:bg-white transition-all ${
                    errors.password ? "border-red-400 bg-red-50/30" : "border-slate-200"
                  }`}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5A73] focus:bg-white transition-all ${
                    errors.confirmPassword ? "border-red-400 bg-red-50/30" : "border-slate-200"
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 bg-[#0E5A73] hover:bg-[#093F52] text-white font-medium rounded-xl text-sm shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="inline-block animate-spin mr-1">⌛</span>
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            <span>{isSubmitting ? "Registrando..." : "Crear Cuenta de Propietario"}</span>
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            ¿Ya tienes una cuenta registrada?{" "}
            <Link
              href="/ingresar"
              className="text-[#0E5A73] font-semibold hover:underline inline-flex items-center gap-1"
            >
              Iniciar sesión
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
