import { getSqliteDb } from "@/shared/db/sqlite.driver";
import { Lead, ILeadRepository, LeadOrigin } from "../domain/lead.entity";

interface LeadRow {
  id: string;
  local_id: string;
  origen: string;
  user_agent_hash: string;
  ip_hash: string;
  created_at: string;
}

function rowToEntity(row: LeadRow): Lead {
  return {
    id: row.id,
    local_id: row.local_id,
    origen: row.origen as LeadOrigin,
    user_agent_hash: row.user_agent_hash,
    ip_hash: row.ip_hash,
    created_at: row.created_at,
  };
}

export class SqliteLeadRepository implements ILeadRepository {
  async create(lead: Omit<Lead, "created_at">): Promise<Lead> {
    const db = getSqliteDb();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO leads (id, local_id, origen, user_agent_hash, ip_hash, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      lead.id,
      lead.local_id,
      lead.origen,
      lead.user_agent_hash,
      lead.ip_hash,
      now
    );

    return {
      ...lead,
      created_at: now,
    };
  }

  async countByLocalId(localId: string): Promise<number> {
    const db = getSqliteDb();
    const row = db
      .prepare("SELECT COUNT(*) as count FROM leads WHERE local_id = ?")
      .get(localId) as { count: number };
    return row ? row.count : 0;
  }

  async countByOwnerId(ownerId: string): Promise<number> {
    const db = getSqliteDb();
    const row = db
      .prepare(`
        SELECT COUNT(l.id) as count
        FROM leads l
        INNER JOIN locales loc ON l.local_id = loc.id
        WHERE loc.owner_id = ?
      `)
      .get(ownerId) as { count: number };
    return row ? row.count : 0;
  }

  async getRecentByLocalId(localId: string, limit = 10): Promise<Lead[]> {
    const db = getSqliteDb();
    const rows = db
      .prepare(
        "SELECT * FROM leads WHERE local_id = ? ORDER BY created_at DESC LIMIT ?"
      )
      .all(localId, limit) as LeadRow[];
    return rows.map(rowToEntity);
  }

  async getStatsSummary(): Promise<{ totalLeads: number; last7Days: number }> {
    const db = getSqliteDb();
    const totalRow = db
      .prepare("SELECT COUNT(*) as count FROM leads")
      .get() as { count: number };

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const last7Row = db
      .prepare("SELECT COUNT(*) as count FROM leads WHERE created_at >= ?")
      .get(sevenDaysAgo) as { count: number };

    return {
      totalLeads: totalRow ? totalRow.count : 0,
      last7Days: last7Row ? last7Row.count : 0,
    };
  }
}
