import { getSqliteDb } from "@/shared/db/sqlite.driver";
import {
  Local,
  ILocalRepository,
  LocalSearchFilter,
  Operacion,
  Moneda,
  LocalStatus,
  TourConfig,
  LocalCaracteristicas,
} from "../domain/local.entity";

interface LocalRow {
  id: string;
  owner_id: string;
  slug: string;
  titulo: string;
  operacion: string;
  precio: number;
  moneda: string;
  area_m2: number;
  direccion: string;
  distrito: string;
  ciudad: string;
  lat: number | null;
  lng: number | null;
  descripcion: string;
  caracteristicas: string;
  rubros_sugeridos: string;
  estado: string;
  portada_url: string;
  tour_config: string;
  tour_glb_url: string | null;
  created_at: string;
  updated_at: string;
}

function rowToEntity(row: LocalRow): Local {
  let caracteristicas: LocalCaracteristicas;
  try {
    caracteristicas = JSON.parse(row.caracteristicas);
  } catch {
    caracteristicas = {
      banos: 1,
      estacionamiento: false,
      vitrina: false,
      aire_acondicionado: false,
      nivel: 1,
    };
  }

  let rubros: string[];
  try {
    rubros = JSON.parse(row.rubros_sugeridos);
  } catch {
    rubros = [];
  }

  let tourConfig: TourConfig;
  try {
    tourConfig = JSON.parse(row.tour_config);
  } catch {
    tourConfig = {
      version: 1,
      dimensions: { width: 6, depth: 10, height: 3 },
      architecture: {
        wallColor: "#E2E8F0",
        wallTexture: "smooth",
        floorMaterial: "ceramic",
        floorColor: "#CBD5E1",
        ceilingColor: "#F8FAFC",
        doorPosition: { wall: "front", offset: 0, width: 1.2, height: 2.4 },
        windows: [],
      },
      lighting: { ambientIntensity: 0.8, mode: "day", spotlights: [] },
      preset: "empty",
      hotspots: [],
      camera: {
        initialPosition: [0, 1.6, 4],
        initialTarget: [0, 1.5, 0],
        fov: 60,
      },
    };
  }

  return {
    id: row.id,
    owner_id: row.owner_id,
    slug: row.slug,
    titulo: row.titulo,
    operacion: row.operacion as Operacion,
    precio: row.precio,
    moneda: row.moneda as Moneda,
    area_m2: row.area_m2,
    direccion: row.direccion,
    distrito: row.distrito,
    ciudad: row.ciudad,
    lat: row.lat,
    lng: row.lng,
    descripcion: row.descripcion,
    caracteristicas,
    rubros_sugeridos: rubros,
    estado: row.estado as LocalStatus,
    portada_url: row.portada_url,
    tour_config: tourConfig,
    tour_glb_url: row.tour_glb_url,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export class SqliteLocalRepository implements ILocalRepository {
  async findById(id: string): Promise<Local | null> {
    const db = getSqliteDb();
    const row = db
      .prepare("SELECT * FROM locales WHERE id = ?")
      .get(id) as LocalRow | undefined;
    return row ? rowToEntity(row) : null;
  }

  async findBySlug(slug: string): Promise<Local | null> {
    const db = getSqliteDb();
    const row = db
      .prepare("SELECT * FROM locales WHERE slug = ?")
      .get(slug) as LocalRow | undefined;
    return row ? rowToEntity(row) : null;
  }

  async findByOwnerId(ownerId: string): Promise<Local[]> {
    const db = getSqliteDb();
    const rows = db
      .prepare("SELECT * FROM locales WHERE owner_id = ? ORDER BY created_at DESC")
      .all(ownerId) as LocalRow[];
    return rows.map(rowToEntity);
  }

  async create(local: Omit<Local, "created_at" | "updated_at">): Promise<Local> {
    const db = getSqliteDb();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO locales (
        id, owner_id, slug, titulo, operacion, precio, moneda, area_m2,
        direccion, distrito, ciudad, lat, lng, descripcion, caracteristicas,
        rubros_sugeridos, estado, portada_url, tour_config, tour_glb_url,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      local.id,
      local.owner_id,
      local.slug,
      local.titulo,
      local.operacion,
      local.precio,
      local.moneda,
      local.area_m2,
      local.direccion,
      local.distrito,
      local.ciudad,
      local.lat,
      local.lng,
      local.descripcion,
      JSON.stringify(local.caracteristicas),
      JSON.stringify(local.rubros_sugeridos),
      local.estado,
      local.portada_url,
      JSON.stringify(local.tour_config),
      local.tour_glb_url,
      now,
      now
    );

    return {
      ...local,
      created_at: now,
      updated_at: now,
    };
  }

  async update(id: string, partial: Partial<Omit<Local, "id">>): Promise<Local> {
    const db = getSqliteDb();
    const current = await this.findById(id);
    if (!current) {
      throw new Error(`Local con id ${id} no encontrado.`);
    }

    const updated: Local = {
      ...current,
      ...partial,
      updated_at: new Date().toISOString(),
    };

    const stmt = db.prepare(`
      UPDATE locales SET
        owner_id = ?,
        slug = ?,
        titulo = ?,
        operacion = ?,
        precio = ?,
        moneda = ?,
        area_m2 = ?,
        direccion = ?,
        distrito = ?,
        ciudad = ?,
        lat = ?,
        lng = ?,
        descripcion = ?,
        caracteristicas = ?,
        rubros_sugeridos = ?,
        estado = ?,
        portada_url = ?,
        tour_config = ?,
        tour_glb_url = ?,
        updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      updated.owner_id,
      updated.slug,
      updated.titulo,
      updated.operacion,
      updated.precio,
      updated.moneda,
      updated.area_m2,
      updated.direccion,
      updated.distrito,
      updated.ciudad,
      updated.lat,
      updated.lng,
      updated.descripcion,
      JSON.stringify(updated.caracteristicas),
      JSON.stringify(updated.rubros_sugeridos),
      updated.estado,
      updated.portada_url,
      JSON.stringify(updated.tour_config),
      updated.tour_glb_url,
      updated.updated_at,
      id
    );

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const db = getSqliteDb();
    const result = db.prepare("DELETE FROM locales WHERE id = ?").run(id);
    return result.changes > 0;
  }

  async search(
    filter?: LocalSearchFilter
  ): Promise<{ items: Local[]; total: number }> {
    const db = getSqliteDb();
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (filter?.operacion) {
      conditions.push("operacion = ?");
      params.push(filter.operacion);
    }

    if (filter?.distrito && filter.distrito !== "todos") {
      conditions.push("distrito = ?");
      params.push(filter.distrito);
    }

    if (filter?.estado) {
      conditions.push("estado = ?");
      params.push(filter.estado);
    }

    if (filter?.owner_id) {
      conditions.push("owner_id = ?");
      params.push(filter.owner_id);
    }

    if (filter?.minPrecio !== undefined) {
      conditions.push("precio >= ?");
      params.push(filter.minPrecio);
    }

    if (filter?.maxPrecio !== undefined) {
      conditions.push("precio <= ?");
      params.push(filter.maxPrecio);
    }

    if (filter?.minArea !== undefined) {
      conditions.push("area_m2 >= ?");
      params.push(filter.minArea);
    }

    if (filter?.maxArea !== undefined) {
      conditions.push("area_m2 <= ?");
      params.push(filter.maxArea);
    }

    if (filter?.search) {
      conditions.push(
        "(titulo LIKE ? OR descripcion LIKE ? OR direccion LIKE ? OR distrito LIKE ?)"
      );
      const term = `%${filter.search}%`;
      params.push(term, term, term, term);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countQuery = `SELECT COUNT(*) as count FROM locales ${whereClause}`;
    const totalResult = db.prepare(countQuery).get(...params) as {
      count: number;
    };
    const total = totalResult ? totalResult.count : 0;

    let orderByClause = "ORDER BY created_at DESC";
    if (filter?.orderBy === "precio_asc") {
      orderByClause = "ORDER BY precio ASC";
    } else if (filter?.orderBy === "precio_desc") {
      orderByClause = "ORDER BY precio DESC";
    } else if (filter?.orderBy === "area_desc") {
      orderByClause = "ORDER BY area_m2 DESC";
    }

    const limit = filter?.limit ?? 20;
    const offset = filter?.offset ?? 0;

    const query = `
      SELECT * FROM locales
      ${whereClause}
      ${orderByClause}
      LIMIT ? OFFSET ?
    `;

    const rows = db.prepare(query).all(...params, limit, offset) as LocalRow[];

    return {
      items: rows.map(rowToEntity),
      total,
    };
  }
}
