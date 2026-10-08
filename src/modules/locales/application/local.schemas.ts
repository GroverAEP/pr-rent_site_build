import { z } from "zod";

export const localFormSchema = z.object({
  titulo: z
    .string()
    .min(5, "El título debe tener al menos 5 caracteres")
    .max(150, "El título no puede exceder 150 caracteres"),
  operacion: z.enum(["alquiler", "venta", "traspaso"] as const, {
    error: "Selecciona una operación válida",
  }),
  precio: z.coerce
    .number()
    .positive("El precio debe ser un número mayor a 0"),
  moneda: z.enum(["PEN", "USD"] as const, {
    error: "Selecciona una moneda válida (PEN o USD)",
  }),
  area_m2: z.coerce
    .number()
    .positive("El área debe ser mayor a 0 m²"),
  direccion: z
    .string()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(200, "La dirección es demasiado extensa"),
  distrito: z
    .string()
    .min(2, "Selecciona o ingresa un distrito"),
  ciudad: z.string().default("Lima"),
  descripcion: z
    .string()
    .min(20, "La descripción debe tener al menos 20 caracteres")
    .max(2500, "La descripción no puede exceder 2500 caracteres"),
  portada_url: z
    .string()
    .url("Ingresa una URL válida para la foto de portada"),
  caracteristicas: z.object({
    banos: z.coerce.number().int().min(0).default(1),
    estacionamiento: z.boolean().default(false),
    vitrina: z.boolean().default(false),
    aire_acondicionado: z.boolean().default(false),
    nivel: z.coerce.number().int().min(1).default(1),
    pozo_tierra: z.boolean().default(false),
    trifasica: z.boolean().default(false),
  }),
  rubros_sugeridos: z.array(z.string()).default([]),
});

export type LocalFormData = z.infer<typeof localFormSchema>;

