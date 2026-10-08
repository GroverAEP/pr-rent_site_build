-- Semilla básica para Supabase Postgres

-- 1. Admin inicial
INSERT INTO users (id, role, nombre, email, password_hash, telefono_whatsapp, nombre_negocio, estado)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'admin',
  'Administrador LocalVista',
  'admin@localvista.pe',
  '$2a$10$v7g9L7H6z544W44oIiqULeYvPcfD70p6QGg04X5i1GZ.q2yEw6z4q',
  '+51999999999',
  'LocalVista Core',
  'activo'
) ON CONFLICT (email) DO NOTHING;

-- 2. Propietario inicial
INSERT INTO users (id, role, nombre, email, password_hash, telefono_whatsapp, nombre_negocio, estado)
VALUES (
  'b0000000-0000-0000-0000-000000000002',
  'owner',
  'Carlos Mendoza Ramos',
  'carlos.mendoza@inmobiliariacentro.pe',
  '$2a$10$v7g9L7H6z544W44oIiqULeYvPcfD70p6QGg04X5i1GZ.q2yEw6z4q',
  '+51981234567',
  'Inmobiliaria Centro Lima',
  'activo'
) ON CONFLICT (email) DO NOTHING;
