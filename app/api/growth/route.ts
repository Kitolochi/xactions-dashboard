export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getGrowthReport } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const days = parseInt(request.nextUrl.searchParams.get("days") || "30", 10);
  const category = request.nextUrl.searchParams.get("category") || undefined;
  const results = await getGrowthReport(days, category);
  return NextResponse.json({ days, results });
}
