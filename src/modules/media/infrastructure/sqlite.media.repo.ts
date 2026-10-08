import { getSqliteDb } from "@/shared/db/sqlite.driver";
import { MediaItem, IMediaRepository, MediaType } from "../domain/media.entity";

interface MediaRow {
  id: string;
  local_id: string;
  tipo: string;
  url: string;
  orden: number;
  created_at: string;
}

function rowToEntity(row: MediaRow): MediaItem {
  return {
    id: row.id,
    local_id: row.local_id,
    tipo: row.tipo as MediaType,
    url: row.url,
    orden: row.orden,
    created_at: row.created_at,
  };
}

export class SqliteMediaRepository implements IMediaRepository {
  async findByLocalId(localId: string): Promise<MediaItem[]> {
    const db = getSqliteDb();
    const rows = db
      .prepare("SELECT * FROM media WHERE local_id = ? ORDER BY orden ASC, created_at ASC")
      .all(localId) as MediaRow[];
    return rows.map(rowToEntity);
  }

  async create(item: Omit<MediaItem, "created_at">): Promise<MediaItem> {
    const db = getSqliteDb();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO media (id, local_id, tipo, url, orden, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(item.id, item.local_id, item.tipo, item.url, item.orden, now);

    return {
      ...item,
      created_at: now,
    };
  }

  async delete(id: string): Promise<boolean> {
    const db = getSqliteDb();
    const res = db.prepare("DELETE FROM media WHERE id = ?").run(id);
    return res.changes > 0;
  }
}
