export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getKeywordData } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const days = parseInt(request.nextUrl.searchParams.get("days") || "30", 10);
  const data = await getKeywordData(days);
  return NextResponse.json(data);
}
