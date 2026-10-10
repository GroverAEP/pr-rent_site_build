import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/shared/config/env";

let anonClient: SupabaseClient | null = null;
let serviceClient: SupabaseClient | null = null;

/**
 * Cliente público (con clave anon). Respeta las políticas RLS.
 * Usado para operaciones públicas y de lectura autenticada con JWT del usuario.
 */
export function getSupabaseClient(): SupabaseClient {
  if (anonClient) return anonClient;
  anonClient = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return anonClient;
}

/**
 * Cliente con clave de service_role. Bypassa RLS completamente.
 * Usado SOLO en el servidor para operaciones administrativas y de backend.
 */
export function getSupabaseServiceClient(): SupabaseClient {
  if (serviceClient) return serviceClient;
  serviceClient = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
  return serviceClient;
}

export function resetSupabaseClients(): void {
  anonClient = null;
  serviceClient = null;
}
