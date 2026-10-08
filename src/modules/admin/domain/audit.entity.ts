export interface AuditLog {
  id: string;
  actor_id: string;
  accion: string;
  entidad: "users" | "locales" | "system";
  entidad_id: string;
  detalle: Record<string, unknown> | null;
  created_at: string;
}

export interface IAuditLogRepository {
  create(log: Omit<AuditLog, "created_at">): Promise<AuditLog>;
  listRecent(limit?: number): Promise<AuditLog[]>;
}
