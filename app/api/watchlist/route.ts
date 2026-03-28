export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getWatchlist, getCategories } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category") || undefined;
  const [accounts, categories] = await Promise.all([
    getWatchlist(category),
    getCategories(),
  ]);

  return NextResponse.json({ accounts, categories });
}
