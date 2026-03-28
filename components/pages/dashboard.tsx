"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";
import { DynamicBarChart as SimpleBarChart } from "@/components/charts/dynamic";

interface DashboardData {
  stats: { watchlist: number; topics: number; keywords: number; snapshots: number };
  topGrowing: { username: string; name: string; delta: number; growth_pct: number }[];
  topKeywords: { keyword: string; avg_engagement: number; total_tweets: number }[];
  engagement: { action: string; count: number }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <div className="text-[var(--text-secondary)]">Loading...</div>;

  const growthBars = data.topGrowing.map((a) => ({
    name: `@${a.username}`,
    value: a.delta,
  }));

  const keywordBars = data.topKeywords.map((k) => ({
    name: k.keyword,
    value: k.avg_engagement,
  }));

  return (
    <>
      <PageHeader title="Dashboard" sub="AI scene overview" />

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Watchlist Accounts" value={data.stats.watchlist} color="blue" />
        <StatCard label="Topics Tracked" value={data.stats.topics} color="purple" />
        <StatCard label="Keywords" value={data.stats.keywords} color="green" />
        <StatCard label="Snapshots" value={data.stats.snapshots} color="orange" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <SimpleBarChart data={growthBars} label="Top Growing Accounts (follower delta)" color="#3b82f6" />
        <SimpleBarChart data={keywordBars} label="Top Keywords by Avg Engagement" color="#22c55e" />
      </div>

      {data.engagement.length > 0 && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
          <p className="text-sm text-[var(--text-secondary)] mb-4">Engagement Activity (7d)</p>
          <div className="flex gap-6">
            {data.engagement.map((e) => (
              <div key={e.action} className="text-center">
                <p className="text-2xl font-bold text-blue-400">{e.count}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">{e.action}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
