"use server";

import { revalidatePath } from "next/cache";
import { getRepositories } from "@/shared/db/factory";
import { getCurrentUser } from "@/modules/auth";
import { UserStatus } from "@/modules/users";
import { LocalStatus } from "@/modules/locales";
import { isValidPeruvianPhone, normalizePhoneToE164 } from "@/shared/lib/phone";
import { randomSuffix } from "@/shared/lib/slug";

export interface AdminActionResult<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * Modera el estado de un usuario propietario (activar, suspender)
 */
export async function moderateUserAction(
  userId: string,
  newStatus: UserStatus,
  motivo?: string
): Promise<AdminActionResult<void>> {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") {
    return { success: false, message: "No autorizado. Se requieren permisos de administrador." };
  }

  const repos = getRepositories();
  const targetUser = await repos.users.findById(userId);
  if (!targetUser) {
    return { success: false, message: "Usuario no encontrado." };
  }

  if (targetUser.role === "admin") {
    return { success: false, message: "No es posible suspender o alterar al superadministrador." };
  }

  try {
    await repos.users.update(userId, { estado: newStatus });

    // Registro de auditoría
    await repos.audit.create({
      id: `aud-${Date.now()}-${randomSuffix(4)}`,
      actor_id: admin.id,
      accion: `USUARIO_${newStatus.toUpperCase()}`,
      entidad: "users",
      entidad_id: userId,
      detalle: {
        estado_anterior: targetUser.estado,
        nuevo_estado: newStatus,
        email: targetUser.email,
        motivo: motivo || "Modificación manual de moderación",
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/usuarios");
    revalidatePath("/admin/auditoria");
    return { success: true, message: `Usuario actualizado a estado '${newStatus}' con éxito.` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al actualizar estado del usuario.";
    return { success: false, message: msg };
  }
}

/**
 * Actualiza el número de WhatsApp de un propietario con validación estricta E.164
 */
export async function updateUserPhoneAction(
  userId: string,
  newPhone: string
): Promise<AdminActionResult<string>> {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") {
    return { success: false, message: "No autorizado." };
  }

  const normalized = normalizePhoneToE164(newPhone);
  if (!isValidPeruvianPhone(normalized)) {
    return {
      success: false,
      message: "El teléfono debe ser un móvil peruano válido (+51 9XX XXX XXX).",
    };
  }

  const repos = getRepositories();
  const targetUser = await repos.users.findById(userId);
  if (!targetUser) {
    return { success: false, message: "Usuario no encontrado." };
  }

  try {
    await repos.users.update(userId, { telefono_whatsapp: normalized });

    // Registro en auditoría
    await repos.audit.create({
      id: `aud-${Date.now()}-${randomSuffix(4)}`,
      actor_id: admin.id,
      accion: "USUARIO_TELEFONO_MODIFICADO",
      entidad: "users",
      entidad_id: userId,
      detalle: {
        telefono_anterior: targetUser.telefono_whatsapp,
        nuevo_telefono: normalized,
      },
    });

    revalidatePath("/admin/usuarios");
    revalidatePath("/admin/auditoria");
    return {
      success: true,
      message: "Teléfono WhatsApp actualizado exitosamente.",
      data: normalized,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al actualizar teléfono.";
    return { success: false, message: msg };
  }
}

/**
 * Modera un local comercial: Aprobar, Rechazar con motivo o Suspender
 */
export async function moderateLocalAction(
  localId: string,
  action: "aprobar" | "rechazar" | "suspender",
  motivo?: string
): Promise<AdminActionResult<void>> {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") {
    return { success: false, message: "No autorizado. Se requieren permisos de administrador." };
  }

  const repos = getRepositories();
  const local = await repos.locales.findById(localId);
  if (!local) {
    return { success: false, message: "Local comercial no encontrado." };
  }

  let nuevoEstado: LocalStatus;
  switch (action) {
    case "aprobar":
      nuevoEstado = "publicado";
      break;
    case "rechazar":
      nuevoEstado = "rechazado";
      break;
    case "suspender":
      nuevoEstado = "suspendido";
      break;
    default:
      return { success: false, message: "Acción de moderación no reconocida." };
  }

  try {
    await repos.locales.update(localId, { estado: nuevoEstado });

    // Registro de auditoría
    await repos.audit.create({
      id: `aud-${Date.now()}-${randomSuffix(4)}`,
      actor_id: admin.id,
      accion: `LOCAL_${action.toUpperCase()}`,
      entidad: "locales",
      entidad_id: localId,
      detalle: {
        titulo: local.titulo,
        slug: local.slug,
        estado_anterior: local.estado,
        nuevo_estado: nuevoEstado,
        motivo: motivo || (action === "aprobar" ? "Aprobado para publicación" : "Sin motivo especificado"),
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/locales");
    revalidatePath("/admin/auditoria");
    revalidatePath(`/locales/${local.slug}`);
    revalidatePath("/locales");
    revalidatePath("/");

    return {
      success: true,
      message: `Local comercial ${nuevoEstado === "publicado" ? "aprobado y publicado" : `marcado como '${nuevoEstado}'`} con éxito.`,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al moderar local comercial.";
    return { success: false, message: msg };
  }
}
