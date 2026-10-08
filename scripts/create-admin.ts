import { hashSync } from "bcrypt-ts";
import { getSqliteDb } from "../src/shared/db/sqlite.driver";
import { env } from "../src/shared/config/env";
import { runSqliteMigrations } from "./migrate-sqlite";

export async function createAdmin() {
  runSqliteMigrations();
  const db = getSqliteDb();

  const existingAdmin = db
    .prepare("SELECT * FROM users WHERE role = 'admin' LIMIT 1")
    .get() as { id: string; email: string } | undefined;

  const adminEmail = env.ADMIN_EMAIL.toLowerCase();
  const adminPasswordHash = hashSync(env.ADMIN_PASSWORD, 10);
  const now = new Date().toISOString();

  if (existingAdmin) {
    console.log(
      `ℹ️ Ya existe un administrador registrado (ID: ${existingAdmin.id}, Email: ${existingAdmin.email}).`
    );
    console.log("Actualizando contraseña según variables de entorno...");
    db.prepare(`
      UPDATE users SET
        email = ?,
        password_hash = ?,
        updated_at = ?
      WHERE id = ?
    `).run(adminEmail, adminPasswordHash, now, existingAdmin.id);
    console.log(`✅ Administrador actualizado: ${adminEmail}`);
    return;
  }

  const adminId = "usr-admin-001";
  db.prepare(`
    INSERT INTO users (id, role, nombre, email, password_hash, telefono_whatsapp, nombre_negocio, estado, created_at, updated_at)
    VALUES (?, 'admin', 'Administrador LocalVista', ?, ?, '+51999999999', 'LocalVista Core', 'activo', ?, ?)
  `).run(adminId, adminEmail, adminPasswordHash, now, now);

  console.log(`✅ Administrador único creado exitosamente: ${adminEmail}`);
}

if (process.argv[1]?.includes("create-admin")) {
  createAdmin().catch((err) => {
    console.error("❌ Error al crear admin:", err);
    process.exit(1);
  });
}
