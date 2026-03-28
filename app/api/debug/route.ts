export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const cwd = process.cwd();
  const checks: Record<string, unknown> = { cwd };

  // Check various paths
  const paths = [
    path.join(cwd, "public", "data", "xactions.db"),
    path.join(cwd, ".next", "server", "public", "data", "xactions.db"),
    "/var/task/public/data/xactions.db",
    "/var/task/.next/server/public/data/xactions.db",
  ];

  for (const p of paths) {
    try {
      const exists = fs.existsSync(p);
      const size = exists ? fs.statSync(p).size : 0;
      checks[p] = { exists, size };
    } catch (e: unknown) {
      checks[p] = { error: e instanceof Error ? e.message : String(e) };
    }
  }

  // Try listing directories
  try {
    checks["cwd_ls"] = fs.readdirSync(cwd);
  } catch (e: unknown) {
    checks["cwd_ls"] = { error: e instanceof Error ? e.message : String(e) };
  }

  try {
    checks["public_ls"] = fs.readdirSync(path.join(cwd, "public"));
  } catch (e: unknown) {
    checks["public_ls"] = { error: e instanceof Error ? e.message : String(e) };
  }

  // Try sql.js import
  try {
    const initSqlJs = (await import("sql.js")).default;
    checks["sqljs_import"] = "ok";
    const SQL = await initSqlJs();
    checks["sqljs_init"] = "ok";
  } catch (e: unknown) {
    checks["sqljs_error"] = e instanceof Error ? e.message : String(e);
  }

  // Try VERCEL_URL
  checks["VERCEL_URL"] = process.env.VERCEL_URL || "not set";

  return NextResponse.json(checks, { status: 200 });
}
