import { getSqliteDb } from "@/shared/db/sqlite.driver";
import {
  User,
  IUserRepository,
  UserRole,
  UserStatus,
} from "../domain/user.entity";

interface UserRow {
  id: string;
  role: string;
  nombre: string;
  email: string;
  password_hash: string;
  telefono_whatsapp: string;
  nombre_negocio: string | null;
  estado: string;
  created_at: string;
  updated_at: string;
}

function rowToEntity(row: UserRow): User {
  return {
    id: row.id,
    role: row.role as UserRole,
    nombre: row.nombre,
    email: row.email,
    password_hash: row.password_hash,
    telefono_whatsapp: row.telefono_whatsapp,
    nombre_negocio: row.nombre_negocio,
    estado: row.estado as UserStatus,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export class SqliteUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const db = getSqliteDb();
    const row = db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(id) as UserRow | undefined;
    return row ? rowToEntity(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const db = getSqliteDb();
    const row = db
      .prepare("SELECT * FROM users WHERE LOWER(email) = LOWER(?)")
      .get(email) as UserRow | undefined;
    return row ? rowToEntity(row) : null;
  }

  async findAdmin(): Promise<User | null> {
    const db = getSqliteDb();
    const row = db
      .prepare("SELECT * FROM users WHERE role = 'admin' LIMIT 1")
      .get() as UserRow | undefined;
    return row ? rowToEntity(row) : null;
  }

  async countAdmins(): Promise<number> {
    const db = getSqliteDb();
    const result = db
      .prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'")
      .get() as { count: number };
    return result.count;
  }

  async create(user: Omit<User, "created_at" | "updated_at">): Promise<User> {
    const db = getSqliteDb();

    // Regla de dominio estricta: Solo puede existir 1 administrador
    if (user.role === "admin") {
      const adminCount = await this.countAdmins();
      if (adminCount >= 1) {
        throw new Error(
          "Violación de regla de negocio: Solo puede existir un único administrador en la plataforma."
        );
      }
    }

    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO users (
        id, role, nombre, email, password_hash, telefono_whatsapp,
        nombre_negocio, estado, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      user.id,
      user.role,
      user.nombre,
      user.email.toLowerCase(),
      user.password_hash,
      user.telefono_whatsapp,
      user.nombre_negocio || null,
      user.estado,
      now,
      now
    );

    return {
      ...user,
      email: user.email.toLowerCase(),
      created_at: now,
      updated_at: now,
    };
  }

  async update(id: string, partial: Partial<Omit<User, "id">>): Promise<User> {
    const db = getSqliteDb();
    const current = await this.findById(id);
    if (!current) {
      throw new Error(`Usuario con id ${id} no encontrado.`);
    }

    // Si se intenta promover a admin, verificar si ya existe otro
    if (partial.role === "admin" && current.role !== "admin") {
      const adminCount = await this.countAdmins();
      if (adminCount >= 1) {
        throw new Error(
          "Violación de regla de negocio: Ya existe un administrador registrado."
        );
      }
    }

    const updated: User = {
      ...current,
      ...partial,
      email: partial.email ? partial.email.toLowerCase() : current.email,
      updated_at: new Date().toISOString(),
    };

    const stmt = db.prepare(`
      UPDATE users SET
        role = ?,
        nombre = ?,
        email = ?,
        password_hash = ?,
        telefono_whatsapp = ?,
        nombre_negocio = ?,
        estado = ?,
        updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      updated.role,
      updated.nombre,
      updated.email,
      updated.password_hash,
      updated.telefono_whatsapp,
      updated.nombre_negocio,
      updated.estado,
      updated.updated_at,
      id
    );

    return updated;
  }

  async list(filter?: {
    role?: UserRole;
    estado?: UserStatus;
    search?: string;
  }): Promise<User[]> {
    const db = getSqliteDb();
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (filter?.role) {
      conditions.push("role = ?");
      params.push(filter.role);
    }

    if (filter?.estado) {
      conditions.push("estado = ?");
      params.push(filter.estado);
    }

    if (filter?.search) {
      conditions.push("(nombre LIKE ? OR email LIKE ? OR nombre_negocio LIKE ?)");
      const term = `%${filter.search}%`;
      params.push(term, term, term);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const query = `SELECT * FROM users ${whereClause} ORDER BY created_at DESC`;

    const rows = db.prepare(query).all(...params) as UserRow[];
    return rows.map(rowToEntity);
  }
}
