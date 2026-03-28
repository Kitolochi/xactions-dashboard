export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getTrending } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const days = parseInt(request.nextUrl.searchParams.get("days") || "7", 10);
  const threshold = parseFloat(
    request.nextUrl.searchParams.get("threshold") || "2.0"
  );
  const trending = await getTrending(days, threshold);
  return NextResponse.json({ days, threshold, trending });
}
