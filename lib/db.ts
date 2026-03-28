import initSqlJs, { Database } from "sql.js";
import path from "path";
import fs from "fs";

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs();

  // Try filesystem first (works locally and during build)
  const candidates = [
    path.join(process.cwd(), "public", "data", "xactions.db"),
    path.join(process.cwd(), ".next", "server", "public", "data", "xactions.db"),
    "/var/task/public/data/xactions.db",
  ];

  let buffer: Buffer | null = null;
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        buffer = fs.readFileSync(p);
        break;
      }
    } catch {
      // Try next path
    }
  }

  // Fallback: fetch from own public URL
  if (!buffer) {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/data/xactions.db`);
    if (!res.ok) throw new Error(`Failed to fetch DB: ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  }

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
