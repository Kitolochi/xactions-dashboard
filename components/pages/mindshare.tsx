"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DynamicLineChart as TimeSeriesChart } from "@/components/charts/dynamic";
import { TrendBadge } from "@/components/ui/badge";

interface KeywordRow {
  keyword: string;
  tweet_count: number;
  total_likes: number;
  total_retweets: number;
  avg_engagement: number;
  captured_at: string;
}

interface TrendingItem {
  keyword: string;
  recent_avg_volume: number;
  earlier_avg_volume: number;
  volume_ratio: number;
  recent_avg_engagement: number;
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export default function MindsharePage() {
  const [keywords, setKeywords] = useState<KeywordRow[]>([]);
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetch(`/api/keywords?days=${days}`).then((r) => r.json()).then(setKeywords);
    fetch(`/api/trending?days=${days}`).then((r) => r.json()).then((d) => setTrending(d.trending));
  }, [days]);

  // Build chart data: group by date, one line per keyword
  const allKeywords = [...new Set(keywords.map((k) => k.keyword))];
  const byDate: Record<string, Record<string, unknown>> = {};
  for (const row of keywords) {
    const date = row.captured_at?.split("T")[0] || row.captured_at;
    if (!byDate[date]) byDate[date] = { date };
    byDate[date][row.keyword] = ((byDate[date][row.keyword] as number) || 0) + row.tweet_count;
  }
  const chartData = Object.values(byDate).sort((a, b) =>
    (a.date as string).localeCompare(b.date as string)
  );

  // Aggregate table data
  const agg: Record<string, { tweets: number; likes: number; retweets: number; eng: number; count: number }> = {};
  for (const row of keywords) {
    if (!agg[row.keyword]) agg[row.keyword] = { tweets: 0, likes: 0, retweets: 0, eng: 0, count: 0 };
    agg[row.keyword].tweets += row.tweet_count;
    agg[row.keyword].likes += row.total_likes;
    agg[row.keyword].retweets += row.total_retweets;
    agg[row.keyword].eng += row.avg_engagement;
    agg[row.keyword].count += 1;
  }

  const trendingMap: Record<string, number> = {};
  for (const t of trending) trendingMap[t.keyword] = t.volume_ratio;

  const tableRows = Object.entries(agg)
    .map(([keyword, v]) => ({
      keyword,
      tweets: v.tweets,
      likes: v.likes,
      retweets: v.retweets,
      avg_engagement: v.count > 0 ? Math.round((v.eng / v.count) * 100) / 100 : 0,
      trending_ratio: trendingMap[keyword] || 0,
    }))
    .sort((a, b) => b.avg_engagement - a.avg_engagement);

  return (
    <>
      <PageHeader title="Mindshare" sub="Keyword volume and engagement tracking" />

      <div className="mb-6 flex gap-2">
        {[7, 14, 30].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              days === d
                ? "bg-blue-600 text-white"
                : "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)]"
            }`}
          >
            {d}d
          </button>
        ))}
      </div>

      {chartData.length > 0 && allKeywords.length <= 10 && (
        <div className="mb-8">
          <TimeSeriesChart
            data={chartData}
            lines={allKeywords}
            label="Tweet volume by keyword"
            height={350}
          />
        </div>
      )}

      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-color)] text-left text-[var(--text-secondary)]">
              <th className="px-4 py-3">Keyword</th>
              <th className="px-4 py-3 text-right">Tweets</th>
              <th className="px-4 py-3 text-right">Likes</th>
              <th className="px-4 py-3 text-right">Retweets</th>
              <th className="px-4 py-3 text-right">Avg Engagement</th>
              <th className="px-4 py-3">Trend</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row) => (
              <tr key={row.keyword} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-card-hover)]">
                <td className="px-4 py-3 font-medium">{row.keyword}</td>
                <td className="px-4 py-3 text-right font-mono">{formatNum(row.tweets)}</td>
                <td className="px-4 py-3 text-right font-mono">{formatNum(row.likes)}</td>
                <td className="px-4 py-3 text-right font-mono">{formatNum(row.retweets)}</td>
                <td className="px-4 py-3 text-right font-mono text-green-400">{row.avg_engagement}</td>
                <td className="px-4 py-3">
                  <TrendBadge ratio={row.trending_ratio} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
