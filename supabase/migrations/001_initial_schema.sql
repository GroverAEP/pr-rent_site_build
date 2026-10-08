-- 1. Tabla users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(20) NOT NULL CHECK(role IN ('admin', 'owner')),
  nombre VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  telefono_whatsapp VARCHAR(20) NOT NULL,
  nombre_negocio VARCHAR(150),
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK(estado IN ('pendiente', 'activo', 'suspendido')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_single_admin ON users(role) WHERE role = 'admin';
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_estado ON users(estado);

-- 2. Tabla locales
CREATE TABLE IF NOT EXISTS locales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  slug VARCHAR(255) NOT NULL UNIQUE,
  titulo VARCHAR(200) NOT NULL,
  operacion VARCHAR(20) NOT NULL CHECK(operacion IN ('alquiler', 'venta', 'traspaso')),
  precio NUMERIC(12,2) NOT NULL,
  moneda VARCHAR(3) NOT NULL CHECK(moneda IN ('PEN', 'USD')),
  area_m2 NUMERIC(8,2) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  distrito VARCHAR(100) NOT NULL,
  ciudad VARCHAR(100) NOT NULL DEFAULT 'Lima',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  descripcion TEXT NOT NULL,
  caracteristicas JSONB NOT NULL DEFAULT '{}'::jsonb,
  rubros_sugeridos JSONB NOT NULL DEFAULT '[]'::jsonb,
  estado VARCHAR(20) NOT NULL DEFAULT 'borrador' CHECK(estado IN ('borrador', 'en_revision', 'publicado', 'rechazado', 'suspendido')),
  portada_url TEXT NOT NULL,
  tour_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  tour_glb_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_locales_owner ON locales(owner_id);
CREATE INDEX IF NOT EXISTS idx_locales_slug ON locales(slug);
CREATE INDEX IF NOT EXISTS idx_locales_estado ON locales(estado);
CREATE INDEX IF NOT EXISTS idx_locales_distrito ON locales(distrito);
CREATE INDEX IF NOT EXISTS idx_locales_operacion ON locales(operacion);
CREATE INDEX IF NOT EXISTS idx_locales_precio ON locales(precio);

-- 3. Tabla media
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id UUID NOT NULL REFERENCES locales(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL CHECK(tipo IN ('foto', 'glb', 'panorama')),
  url TEXT NOT NULL,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_media_local ON media(local_id);

-- 4. Tabla leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id UUID NOT NULL REFERENCES locales(id) ON DELETE CASCADE,
  origen VARCHAR(20) NOT NULL CHECK(origen IN ('detalle', 'tour3d', 'listado')),
  user_agent_hash VARCHAR(64) NOT NULL,
  ip_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leads_local ON leads(local_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

-- 5. Tabla audit_log
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES users(id),
  accion VARCHAR(50) NOT NULL,
  entidad VARCHAR(50) NOT NULL,
  entidad_id VARCHAR(50) NOT NULL,
  detalle JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_entidad ON audit_log(entidad, entidad_id);
