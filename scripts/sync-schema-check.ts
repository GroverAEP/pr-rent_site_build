import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { runSqliteMigrations } from "./migrate-sqlite";

function extractColumnsFromSql(sqlContent: string): Map<string, Set<string>> {
  const tableColumns = new Map<string, Set<string>>();

  // Expresión regular para capturar bloques CREATE TABLE [IF NOT EXISTS] <nombre> ( ... );
  const tableRegex =
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\);/gi;

  let match: RegExpExecArray | null;
  while ((match = tableRegex.exec(sqlContent)) !== null) {
    const tableName = match[1].toLowerCase();
    const body = match[2];

    const columns = new Set<string>();
    const lines = body.split("\n");

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("--")) continue;

      // Ignorar restricciones de tabla (CONSTRAINT, PRIMARY KEY (...), CHECK (...), etc.)
      if (
        /^(CONSTRAINT|PRIMARY\s+KEY|FOREIGN\s+KEY|CHECK|UNIQUE)\b/i.test(line)
      ) {
        continue;
      }

      // El primer token suele ser el nombre de la columna
      const colMatch = /^([a-zA-Z0-9_]+)\s+[A-Za-z]/i.exec(line);
      if (colMatch) {
        columns.add(colMatch[1].toLowerCase());
      }
    }

    tableColumns.set(tableName, columns);
  }

  return tableColumns;
}

export function checkSchemaParity(): boolean {
  console.log("🔍 Verificando paridad de esquemas (SQLite vs Supabase SQL)...");

  // 1. Obtener columnas de SQLite
  const tempDb = new Database(":memory:");
  runSqliteMigrations(tempDb.name);

  // También cargar las tablas de SQLite en memoria
  const sqliteTables = ["users", "locales", "media", "leads", "audit_log"];
  const sqliteColumns = new Map<string, Set<string>>();

  const diskDb = new Database(
    path.resolve(process.cwd(), "data", "dev.sqlite")
  );

  for (const table of sqliteTables) {
    interface ColInfo {
      name: string;
    }
    const cols = diskDb
      .prepare(`PRAGMA table_info(${table})`)
      .all() as ColInfo[];
    sqliteColumns.set(
      table,
      new Set(cols.map((c) => c.name.toLowerCase()))
    );
  }
  diskDb.close();

  // 2. Extraer columnas de Supabase
  const supabaseSqlPath = path.resolve(
    process.cwd(),
    "supabase",
    "migrations",
    "001_initial_schema.sql"
  );
  if (!fs.existsSync(supabaseSqlPath)) {
    console.error(`❌ Archivo Supabase no encontrado: ${supabaseSqlPath}`);
    return false;
  }

  const supabaseSql = fs.readFileSync(supabaseSqlPath, "utf-8");
  const supabaseTableColumns = extractColumnsFromSql(supabaseSql);

  let hasErrors = false;

  for (const table of sqliteTables) {
    const sqCols = sqliteColumns.get(table) || new Set<string>();
    const suCols = supabaseTableColumns.get(table) || new Set<string>();

    if (suCols.size === 0) {
      console.error(
        `❌ Tabla '${table}' no encontrada en las migraciones de Supabase.`
      );
      hasErrors = true;
      continue;
    }

    // Columnas en SQLite que faltan en Supabase
    for (const col of sqCols) {
      if (!suCols.has(col)) {
        console.error(
          `❌ [${table}] Columna '${col}' existe en SQLite pero falta en Supabase.`
        );
        hasErrors = true;
      }
    }

    // Columnas en Supabase que faltan en SQLite
    for (const col of suCols) {
      if (!sqCols.has(col)) {
        console.error(
          `❌ [${table}] Columna '${col}' existe en Supabase pero falta en SQLite.`
        );
        hasErrors = true;
      }
    }

    if (!hasErrors) {
      console.log(
        `✅ Tabla '${table}': ${sqCols.size} columnas coinciden perfectamente.`
      );
    }
  }

  if (hasErrors) {
    console.error("❌ Los esquemas han divergido. Corrige las diferencias.");
    return false;
  }

  console.log("🎉 Paridad de esquemas 100% verificada con éxito.");
  return true;
}

if (process.argv[1]?.includes("sync-schema-check")) {
  const success = checkSchemaParity();
  process.exit(success ? 0 : 1);
}
