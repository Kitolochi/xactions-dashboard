import initSqlJs, { Database } from "sql.js";
import path from "path";
import fs from "fs";

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (db) return db;

  // Use CDN WASM on Vercel (no local .wasm file in serverless)
  const SQL = await initSqlJs({
    locateFile: () =>
      "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/sql-wasm.wasm",
  });

  const dbPath = path.join(process.cwd(), "public", "data", "xactions.db");
  const buffer = fs.readFileSync(dbPath);
  db = new SQL.Database(buffer);
  return db;
}

export async function dbAll(
  sql: string,
  params: (string | number)[] = []
): Promise<Record<string, unknown>[]> {
  const database = await getDb();
  const stmt = database.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }
  const rows: Record<string, unknown>[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as Record<string, unknown>);
  }
  stmt.free();
  return rows;
}

export async function dbGet(
  sql: string,
  params: (string | number)[] = []
): Promise<Record<string, unknown> | null> {
  const rows = await dbAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}
