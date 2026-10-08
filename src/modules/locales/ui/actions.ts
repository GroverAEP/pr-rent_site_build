"use server";

import { revalidatePath } from "next/cache";
import { getRepositories } from "@/shared/db/factory";
import { getCurrentUser } from "@/modules/auth";
import { generateSlug, randomSuffix } from "@/shared/lib/slug";
import { localFormSchema, LocalFormData } from "../application/local.schemas";
import { TourConfig } from "../domain/local.entity";

export interface LocalActionResult<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export async function createLocalAction(
  formData: LocalFormData
): Promise<LocalActionResult<{ id: string; slug: string }>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "Debes iniciar sesión para publicar un local." };
  }

  const parsed = localFormSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      message: "Por favor corrige los datos del local.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const repos = getRepositories();

  const id = `loc-${Date.now()}-${randomSuffix(4)}`;
  const slug = generateSlug(`${data.titulo}-${data.distrito}`, randomSuffix(4));

  // Generar tour_config paramétrico inicial derivado del área
  const approxWidth = Math.max(4, Math.round(Math.sqrt(data.area_m2 * 0.7) * 10) / 10);
  const approxDepth = Math.max(5, Math.round((data.area_m2 / approxWidth) * 10) / 10);

  const initialTourConfig: TourConfig = {
    version: 1,
    dimensions: {
      width: approxWidth,
      depth: approxDepth,
      height: 3.2,
    },
    architecture: {
      wallColor: "#F1F5F9",
      wallTexture: "smooth",
      floorMaterial: "porcelain",
      floorColor: "#CBD5E1",
      ceilingColor: "#FFFFFF",
      doorPosition: { wall: "front", offset: 0, width: 1.6, height: 2.6 },
      windows: [{ wall: "front", offset: 0, width: 3.0, height: 2.2 }],
    },
    lighting: {
      ambientIntensity: 0.85,
      mode: "day",
      spotlights: [],
    },
    preset: "retail_store",
    hotspots: [
      {
        id: "hs-1",
        position: [approxWidth / 4, 1.2, -approxDepth / 3],
        title: "Espacio Principal de Exhibición",
        description: "Área abierta con gran visibilidad desde la puerta de ingreso.",
      },
    ],
    camera: {
      initialPosition: [0, 1.6, approxDepth / 2 - 0.5],
      initialTarget: [0, 1.5, 0],
      fov: 60,
    },
  };

  try {
    const local = await repos.locales.create({
      id,
      owner_id: user.id,
      slug,
      titulo: data.titulo,
      operacion: data.operacion,
      precio: data.precio,
      moneda: data.moneda,
      area_m2: data.area_m2,
      direccion: data.direccion,
      distrito: data.distrito,
      ciudad: data.ciudad,
      lat: null,
      lng: null,
      descripcion: data.descripcion,
      caracteristicas: data.caracteristicas,
      rubros_sugeridos: data.rubros_sugeridos,
      estado: "en_revision", // Requiere aprobación del administrador
      portada_url: data.portada_url,
      tour_config: initialTourConfig,
      tour_glb_url: null,
    });

    // Registrar foto en media
    await repos.media.create({
      id: `med-${id}-cover`,
      local_id: id,
      tipo: "foto",
      url: data.portada_url,
      orden: 0,
    });

    revalidatePath("/panel/locales");
    revalidatePath("/locales");
    revalidatePath("/");

    return {
      success: true,
      message: "Local comercial registrado y enviado a revisión.",
      data: { id: local.id, slug: local.slug },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al registrar el local.";
    return { success: false, message: msg };
  }
}

export async function updateLocalAction(
  id: string,
  formData: LocalFormData
): Promise<LocalActionResult<{ id: string }>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "No autorizado." };
  }

  const repos = getRepositories();
  const current = await repos.locales.findById(id);
  if (!current) {
    return { success: false, message: "Local no encontrado." };
  }

  if (current.owner_id !== user.id && user.role !== "admin") {
    return { success: false, message: "No tienes permiso para modificar este local." };
  }

  const parsed = localFormSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      message: "Datos inválidos.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await repos.locales.update(id, {
      titulo: parsed.data.titulo,
      operacion: parsed.data.operacion,
      precio: parsed.data.precio,
      moneda: parsed.data.moneda,
      area_m2: parsed.data.area_m2,
      direccion: parsed.data.direccion,
      distrito: parsed.data.distrito,
      ciudad: parsed.data.ciudad,
      descripcion: parsed.data.descripcion,
      caracteristicas: parsed.data.caracteristicas,
      rubros_sugeridos: parsed.data.rubros_sugeridos,
      portada_url: parsed.data.portada_url,
    });

    revalidatePath("/panel/locales");
    revalidatePath(`/locales/${current.slug}`);
    revalidatePath("/locales");

    return {
      success: true,
      message: "Local comercial actualizado con éxito.",
      data: { id },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al actualizar.";
    return { success: false, message: msg };
  }
}

export async function deleteLocalAction(
  id: string
): Promise<LocalActionResult<void>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "No autorizado." };
  }

  const repos = getRepositories();
  const current = await repos.locales.findById(id);
  if (!current) {
    return { success: false, message: "Local no encontrado." };
  }

  if (current.owner_id !== user.id && user.role !== "admin") {
    return { success: false, message: "No tienes permiso para eliminar este local." };
  }

  try {
    await repos.locales.delete(id);
    revalidatePath("/panel/locales");
    revalidatePath("/locales");
    return { success: true, message: "Local eliminado exitosamente." };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al eliminar.";
    return { success: false, message: msg };
  }
}
