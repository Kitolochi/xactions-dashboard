import initSqlJs, { Database } from "sql.js";
import path from "path";
import fs from "fs";

let db: Database | null = null;

const WASM_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/sql-wasm.wasm";

async function loadWasm(): Promise<Buffer> {
  // Try local node_modules first
  const localPath = path.join(
    process.cwd(),
    "node_modules",
    "sql.js",
    "dist",
    "sql-wasm.wasm"
  );
  try {
    if (fs.existsSync(localPath)) {
      return fs.readFileSync(localPath);
    }
  } catch {
    // Fall through to fetch
  }

  // Fetch from CDN
  const res = await fetch(WASM_URL);
  if (!res.ok) throw new Error(`Failed to fetch WASM: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

export async function getDb(): Promise<Database> {
  if (db) return db;

  const wasmBinary = await loadWasm();
  const SQL = await initSqlJs({ wasmBinary });

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
