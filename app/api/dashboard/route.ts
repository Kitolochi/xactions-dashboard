export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import {
  getDashboardStats,
  getTopGrowing,
  getTopKeywords,
  getEngagementActivity,
} from "@/lib/queries";

export async function GET() {
  const [stats, topGrowing, topKeywords, engagement] = await Promise.all([
    getDashboardStats(),
    getTopGrowing(30, 5),
    getTopKeywords(5),
    getEngagementActivity(7),
  ]);

  return NextResponse.json({ stats, topGrowing, topKeywords, engagement });
}
