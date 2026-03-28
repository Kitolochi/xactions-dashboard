export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getInfluenceScores } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category") || undefined;
  const results = await getInfluenceScores(category);
  return NextResponse.json(results);
}
