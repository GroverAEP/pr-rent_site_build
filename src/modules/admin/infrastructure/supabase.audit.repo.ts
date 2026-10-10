import { getSupabaseServiceClient } from "@/shared/db/supabase.driver";
import { AuditLog, IAuditLogRepository } from "../domain/audit.entity";

export class SupabaseAuditLogRepository implements IAuditLogRepository {
  private get db() {
    return getSupabaseServiceClient();
  }

  async create(log: Omit<AuditLog, "created_at">): Promise<AuditLog> {
    const now = new Date().toISOString();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(log.actor_id)) {
      throw new Error("Error al registrar auditoría: actor_id debe ser un UUID válido.");
    }
    const { id: suppliedId, ...auditFields } = log;
    void suppliedId;
    const row = { ...auditFields, created_at: now };

    const { data, error } = await this.db
      .from("audit_log")
      .insert(row)
      .select()
      .single();

    if (error)
      throw new Error(`Error al registrar auditoría: ${error.message}`);

    return {
      id: data.id,
      actor_id: data.actor_id,
      accion: data.accion,
      entidad: data.entidad as AuditLog["entidad"],
      entidad_id: data.entidad_id,
      detalle: data.detalle,
      created_at: data.created_at,
    };
  }

  async listRecent(limit = 50): Promise<AuditLog[]> {
    const { data, error } = await this.db
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error)
      throw new Error(`Error al obtener auditoría: ${error.message}`);

    return (data || []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      actor_id: row.actor_id as string,
      accion: row.accion as string,
      entidad: row.entidad as AuditLog["entidad"],
      entidad_id: row.entidad_id as string,
      detalle: (row.detalle as Record<string, unknown>) || null,
      created_at: row.created_at as string,
    }));
  }
}
