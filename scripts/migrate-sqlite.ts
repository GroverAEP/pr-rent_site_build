import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

export function runSqliteMigrations(dbPath?: string) {
  const targetPath =
    dbPath || path.resolve(process.cwd(), "data", "dev.sqlite");
  const dataDir = path.dirname(targetPath);

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  console.log(`🚀 Ejecutando migraciones SQLite en: ${targetPath}`);
  const db = new Database(targetPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    -- 1. Tabla de Usuarios
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL CHECK(role IN ('admin', 'owner')),
      nombre TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      telefono_whatsapp TEXT NOT NULL,
      nombre_negocio TEXT,
      estado TEXT NOT NULL DEFAULT 'pendiente' CHECK(estado IN ('pendiente', 'activo', 'suspendido')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_single_admin ON users(role) WHERE role = 'admin';
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_estado ON users(estado);

    -- 2. Tabla de Locales Comerciales
    CREATE TABLE IF NOT EXISTS locales (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      slug TEXT NOT NULL UNIQUE,
      titulo TEXT NOT NULL,
      operacion TEXT NOT NULL CHECK(operacion IN ('alquiler', 'venta', 'traspaso')),
      precio REAL NOT NULL,
      moneda TEXT NOT NULL CHECK(moneda IN ('PEN', 'USD')),
      area_m2 REAL NOT NULL,
      direccion TEXT NOT NULL,
      distrito TEXT NOT NULL,
      ciudad TEXT NOT NULL DEFAULT 'Lima',
      lat REAL,
      lng REAL,
      descripcion TEXT NOT NULL,
      caracteristicas TEXT NOT NULL,
      rubros_sugeridos TEXT NOT NULL,
      estado TEXT NOT NULL DEFAULT 'borrador' CHECK(estado IN ('borrador', 'en_revision', 'publicado', 'rechazado', 'suspendido')),
      portada_url TEXT NOT NULL,
      tour_config TEXT NOT NULL,
      tour_glb_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_locales_owner ON locales(owner_id);
    CREATE INDEX IF NOT EXISTS idx_locales_slug ON locales(slug);
    CREATE INDEX IF NOT EXISTS idx_locales_estado ON locales(estado);
    CREATE INDEX IF NOT EXISTS idx_locales_distrito ON locales(distrito);
    CREATE INDEX IF NOT EXISTS idx_locales_operacion ON locales(operacion);
    CREATE INDEX IF NOT EXISTS idx_locales_precio ON locales(precio);

    -- 3. Tabla de Medios Multimedia
    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      local_id TEXT NOT NULL REFERENCES locales(id) ON DELETE CASCADE,
      tipo TEXT NOT NULL CHECK(tipo IN ('foto', 'glb', 'panorama')),
      url TEXT NOT NULL,
      orden INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_media_local ON media(local_id);

    -- 4. Tabla de Leads (Clics a WhatsApp)
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      local_id TEXT NOT NULL REFERENCES locales(id) ON DELETE CASCADE,
      origen TEXT NOT NULL CHECK(origen IN ('detalle', 'tour3d', 'listado')),
      user_agent_hash TEXT NOT NULL,
      ip_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_leads_local ON leads(local_id);
    CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

    -- 5. Tabla de Auditoría
    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      actor_id TEXT NOT NULL REFERENCES users(id),
      accion TEXT NOT NULL,
      entidad TEXT NOT NULL,
      entidad_id TEXT NOT NULL,
      detalle TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor_id);
    CREATE INDEX IF NOT EXISTS idx_audit_entidad ON audit_log(entidad, entidad_id);
  `);

  console.log("✅ Migraciones completadas exitosamente.");
  db.close();
}

if (process.argv[1]?.includes("migrate-sqlite")) {
  runSqliteMigrations();
}
