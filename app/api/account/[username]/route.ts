export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getAccountData } from "@/lib/queries";

export async function GET(
  _request: Request,
  { params }: { params: { username: string } | Promise<{ username: string }> }
) {
  const resolved = params instanceof Promise ? await params : params;
  const { username } = resolved;
  const data = await getAccountData(username);

  if (!data) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
