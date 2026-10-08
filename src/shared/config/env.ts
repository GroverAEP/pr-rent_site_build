import { z } from "zod";

const envSchema = z
  .object({
    DB_DRIVER: z.enum(["sqlite", "supabase"]).default("sqlite"),
    NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
    AUTH_SECRET: z
      .string()
      .min(32, "AUTH_SECRET debe tener al menos 32 caracteres")
      .default("localvista-dev-secret-super-key-32-chars-long-2026"),
    ADMIN_EMAIL: z.string().email().default("admin@localvista.pe"),
    ADMIN_PASSWORD: z
      .string()
      .min(8, "ADMIN_PASSWORD debe tener al menos 8 caracteres")
      .default("AdminLocalVista2026!"),
    NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  })
  .superRefine((data, ctx) => {
    if (data.DB_DRIVER === "supabase") {
      if (!data.NEXT_PUBLIC_SUPABASE_URL) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "NEXT_PUBLIC_SUPABASE_URL es obligatorio cuando DB_DRIVER=supabase",
          path: ["NEXT_PUBLIC_SUPABASE_URL"],
        });
      }
      if (!data.SUPABASE_SERVICE_ROLE_KEY) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "SUPABASE_SERVICE_ROLE_KEY es obligatorio cuando DB_DRIVER=supabase",
          path: ["SUPABASE_SERVICE_ROLE_KEY"],
        });
      }
    }
  });

function getParsedEnv() {
  const result = envSchema.safeParse({
    DB_DRIVER: process.env.DB_DRIVER,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!result.success) {
    console.error("❌ Error de validación en variables de entorno:");
    console.error(result.error.format());
    throw new Error(
      "Variables de entorno inválidas. Revisa tu archivo .env o .env.local"
    );
  }

  return result.data;
}

export const env = getParsedEnv();
