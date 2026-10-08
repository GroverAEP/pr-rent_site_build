-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE locales ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- 1. Políticas de USERS
-- Los administradores pueden leer y modificar todo
CREATE POLICY "Admins full access users"
  ON users FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin' OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Propietarios pueden leer y editar su propio perfil
CREATE POLICY "Owners read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Owners update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = 'owner');

-- Registro público de nuevos propietarios
CREATE POLICY "Public can register new owner"
  ON users FOR INSERT
  TO anon, authenticated
  WITH CHECK (role = 'owner');

-- 2. Políticas de LOCALES
-- El público puede leer solo locales 'publicado' pertenecientes a propietarios 'activo'
CREATE POLICY "Public read published locales"
  ON locales FOR SELECT
  TO anon, authenticated
  USING (
    estado = 'publicado' AND
    EXISTS (SELECT 1 FROM users WHERE users.id = locales.owner_id AND users.estado = 'activo')
  );

-- Propietarios pueden leer y editar sus propios locales
CREATE POLICY "Owners manage own locales"
  ON locales FOR ALL
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Admins pueden gestionar todos los locales
CREATE POLICY "Admins manage all locales"
  ON locales FOR ALL
  TO authenticated
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- 3. Políticas de MEDIA
-- Público puede ver fotos y modelos de locales publicados
CREATE POLICY "Public read media of published locales"
  ON media FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (SELECT 1 FROM locales WHERE locales.id = media.local_id AND locales.estado = 'publicado')
  );

-- Propietarios pueden gestionar media de sus locales
CREATE POLICY "Owners manage media of own locales"
  ON media FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM locales WHERE locales.id = media.local_id AND locales.owner_id = auth.uid())
  );

-- 4. Políticas de LEADS
-- Cualquiera puede registrar un lead (al hacer clic en WhatsApp)
CREATE POLICY "Public insert leads"
  ON leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Propietarios pueden ver los leads de sus propios locales
CREATE POLICY "Owners view own leads"
  ON leads FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM locales WHERE locales.id = leads.local_id AND locales.owner_id = auth.uid())
  );

-- Admins pueden ver todos los leads
CREATE POLICY "Admins view all leads"
  ON leads FOR SELECT
  TO authenticated
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- 5. Políticas de AUDIT_LOG
-- Solo admins pueden ver la auditoría
CREATE POLICY "Admins manage audit log"
  ON audit_log FOR ALL
  TO authenticated
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');
