import { getSqliteDb } from "@/shared/db/sqlite.driver";
import { AuditLog, IAuditLogRepository } from "../domain/audit.entity";

interface AuditLogRow {
  id: string;
  actor_id: string;
  accion: string;
  entidad: string;
  entidad_id: string;
  detalle: string | null;
  created_at: string;
}

function rowToEntity(row: AuditLogRow): AuditLog {
  let detalle: Record<string, unknown> | null = null;
  if (row.detalle) {
    try {
      detalle = JSON.parse(row.detalle);
    } catch {
      detalle = { raw: row.detalle };
    }
  }

  return {
    id: row.id,
    actor_id: row.actor_id,
    accion: row.accion,
    entidad: row.entidad as AuditLog["entidad"],
    entidad_id: row.entidad_id,
    detalle,
    created_at: row.created_at,
  };
}

export class SqliteAuditLogRepository implements IAuditLogRepository {
  async create(log: Omit<AuditLog, "created_at">): Promise<AuditLog> {
    const db = getSqliteDb();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO audit_log (id, actor_id, accion, entidad, entidad_id, detalle, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      log.id,
      log.actor_id,
      log.accion,
      log.entidad,
      log.entidad_id,
      log.detalle ? JSON.stringify(log.detalle) : null,
      now
    );

    return {
      ...log,
      created_at: now,
    };
  }

  async listRecent(limit = 50): Promise<AuditLog[]> {
    const db = getSqliteDb();
    const rows = db
      .prepare("SELECT * FROM audit_log ORDER BY created_at DESC LIMIT ?")
      .all(limit) as AuditLogRow[];
    return rows.map(rowToEntity);
  }
}
