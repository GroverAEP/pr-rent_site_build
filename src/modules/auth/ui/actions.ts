"use server";

import { redirect } from "next/navigation";
import { getRepositories } from "@/shared/db/factory";
import { LocalAuthService } from "../infrastructure/local-auth.service";
import {
  setSessionCookie,
  clearSessionCookie,
} from "../infrastructure/session";
import {
  loginSchema,
  LoginFormData,
  registerOwnerSchema,
  RegisterOwnerFormData,
} from "../application/auth.schemas";

export interface ActionResult<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export async function loginAction(
  data: LoginFormData
): Promise<ActionResult<{ redirectUrl: string }>> {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: "Por favor corrige los datos del formulario.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const repos = getRepositories();
    const authService = new LocalAuthService(repos.users);
    const { user, sessionToken } = await authService.signIn(parsed.data);

    await setSessionCookie(sessionToken);

    const redirectUrl = user.role === "admin" ? "/admin" : "/panel";
    return {
      success: true,
      message: "Inicio de sesión exitoso.",
      data: { redirectUrl },
    };
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Error inesperado al iniciar sesión.";
    return {
      success: false,
      message: msg,
    };
  }
}

export async function registerOwnerAction(
  data: RegisterOwnerFormData
): Promise<ActionResult<{ redirectUrl: string }>> {
  const parsed = registerOwnerSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: "Por favor corrige los datos del formulario.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const repos = getRepositories();
    const authService = new LocalAuthService(repos.users);
    const { sessionToken } = await authService.signUpOwner({
      nombre: parsed.data.nombre,
      email: parsed.data.email,
      password: parsed.data.password,
      telefono_whatsapp: parsed.data.telefono_whatsapp,
      nombre_negocio: parsed.data.nombre_negocio || undefined,
    });

    await setSessionCookie(sessionToken);

    return {
      success: true,
      message:
        "Registro completado. Tu cuenta de propietario ha sido creada con éxito.",
      data: { redirectUrl: "/panel" },
    };
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : "Error inesperado al registrar el propietario.";
    return {
      success: false,
      message: msg,
    };
  }
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/ingresar");
}
