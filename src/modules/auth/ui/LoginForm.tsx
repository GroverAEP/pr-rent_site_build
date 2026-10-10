"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginSchema, LoginFormData } from "../application/auth.schemas";
import { loginAction } from "./actions";
import { LogIn, AlertCircle, Building2, Lock, Mail, ArrowRight } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "";
  const errorParam = searchParams.get("error");

  const [serverError, setServerError] = useState<string | null>(
    errorParam === "suspended"
      ? "Tu cuenta ha sido suspendida. Contacta a administración."
      : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await loginAction(data);
      if (!res.success) {
        setServerError(res.message || "Error al iniciar sesión.");
        setIsSubmitting(false);
        return;
      }

      const target = redirectParam || res.data?.redirectUrl || "/panel";
      router.push(target);
      router.refresh();
    } catch {
      setServerError("Ocurrió un error al procesar la solicitud.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-[#0E5A73] mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            Iniciar Sesión
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Accede al panel de propietario o administración de RentLocal
          </p>
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
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                placeholder="tu.correo@ejemplo.pe"
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
              Contraseña
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 bg-[#0E5A73] hover:bg-[#093F52] text-white font-medium rounded-xl text-sm shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="inline-block animate-spin mr-1">⌛</span>
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span>{isSubmitting ? "Verificando..." : "Entrar a mi cuenta"}</span>
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            ¿Aún no tienes cuenta para publicar?{" "}
            <Link
              href="/registro"
              className="text-[#0E5A73] font-semibold hover:underline inline-flex items-center gap-1"
            >
              Regístrate aquí
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
