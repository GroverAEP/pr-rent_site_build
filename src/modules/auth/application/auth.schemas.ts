import { z } from "zod";
import { isValidPeruvianPhone } from "@/shared/lib/phone";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es requerido")
    .email("Ingresa un correo electrónico válido"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerOwnerSchema = z
  .object({
    nombre: z
      .string()
      .min(3, "El nombre completo debe tener al menos 3 caracteres")
      .max(100, "El nombre es demasiado largo"),
    email: z
      .string()
      .min(1, "El correo electrónico es requerido")
      .email("Ingresa un correo electrónico válido"),
    telefono_whatsapp: z
      .string()
      .min(1, "El teléfono de WhatsApp es obligatorio")
      .refine(
        (val) => isValidPeruvianPhone(val),
        "Ingresa un número celular peruano válido (+51 9XX XXX XXX o 9XXXXXXXX)"
      ),
    nombre_negocio: z
      .string()
      .max(120, "El nombre del negocio no puede exceder 120 caracteres")
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z
      .string()
      .min(1, "Por favor confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterOwnerFormData = z.infer<typeof registerOwnerSchema>;
