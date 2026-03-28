"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { CategoryBadge } from "@/components/ui/badge";
import { DynamicLineChart as TimeSeriesChart } from "@/components/charts/dynamic";

interface AccountData {
  account: {
    username: string;
    name: string;
    category: string;
    description: string;
  };
  snapshots: { followers: number; following: number; captured_at: string }[];
  delta: number;
  growth_pct: number;
  influence: {
    follower_score: number;
    growth_score: number;
    engagement_score: number;
    composite_score: number;
  } | null;
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-[var(--text-secondary)] w-28">{label}</span>
      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-mono w-12 text-right">{pct}%</span>
    </div>
  );
}

export default function AccountPage() {
  const params = useParams();
  const username = params.username as string;
  const [data, setData] = useState<AccountData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/account/${username}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setData)
      .catch(() => setError(true));
  }, [username]);

  if (error) {
    return (
      <>
        <PageHeader title="Account not found" />
        <p className="text-[var(--text-secondary)]">
          @{username} is not in the watchlist.{" "}
          <Link href="/watchlist" className="text-blue-400 hover:text-blue-300">
            Back to watchlist
          </Link>
        </p>
      </>
    );
  }

  if (!data) return <div className="text-[var(--text-secondary)]">Loading...</div>;

  const { account, snapshots, delta, growth_pct, influence } = data;
  const latest = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;

  const chartData = snapshots.map((s) => ({
    date: s.captured_at,
    followers: s.followers,
    following: s.following,
  }));

  return (
    <>
      <div className="mb-2">
        <Link href="/watchlist" className="text-sm text-blue-400 hover:text-blue-300">
          &larr; Watchlist
        </Link>
      </div>

      <PageHeader
        title={`@${account.username}`}
        sub={account.name || undefined}
      />

      <div className="flex items-center gap-3 mb-8">
        {account.category && <CategoryBadge category={account.category} />}
        {account.description && (
          <span className="text-sm text-[var(--text-secondary)]">{account.description}</span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Followers" value={latest ? formatNum(latest.followers) : "--"} color="blue" />
        <StatCard label="Following" value={latest ? formatNum(latest.following) : "--"} color="purple" />
        <StatCard
          label="Growth"
          value={delta >= 0 ? `+${formatNum(delta)}` : formatNum(delta)}
          sub={`${growth_pct >= 0 ? "+" : ""}${growth_pct}%`}
          color="green"
        />
        <StatCard
          label="Influence Score"
          value={influence ? influence.composite_score.toFixed(1) : "--"}
          sub="composite"
          color="orange"
        />
      </div>

      {chartData.length > 1 && (
        <div className="mb-8">
          <TimeSeriesChart
            data={chartData}
            lines={["followers"]}
            label="Follower growth over time"
            height={300}
          />
        </div>
      )}

      {influence && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
          <p className="text-sm text-[var(--text-secondary)] mb-4">Influence Breakdown</p>
          <div className="space-y-3">
            <ScoreBar label="Follower Scale" value={influence.follower_score} color="bg-blue-500" />
            <ScoreBar label="Growth Velocity" value={influence.growth_score} color="bg-green-500" />
            <ScoreBar label="Engagement Proxy" value={influence.engagement_score} color="bg-purple-500" />
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex justify-between">
            <span className="text-sm text-[var(--text-secondary)]">Composite Score</span>
            <span className="text-xl font-bold text-orange-400">{influence.composite_score.toFixed(1)}</span>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-[var(--text-secondary)]">
        {snapshots.length} snapshots captured
      </div>
    </>
  );
}
