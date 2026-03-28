export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getTopics, getTopicVolume } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const topicName = request.nextUrl.searchParams.get("topic");
  const days = parseInt(request.nextUrl.searchParams.get("days") || "30", 10);

  if (topicName) {
    const data = await getTopicVolume(topicName, days);
    return NextResponse.json(data);
  }

  const topics = await getTopics();
  return NextResponse.json(topics);
}
