"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DynamicLineChart as TimeSeriesChart } from "@/components/charts/dynamic";

interface Topic {
  name: string;
  keywords: string[];
  description: string;
  latest_volume: number;
  latest_engagement: number;
}

interface TopicVolume {
  topic: string;
  description: string;
  keywords: string[];
  volume: { date: string; volume: number; engagement: number }[];
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [volumeData, setVolumeData] = useState<TopicVolume | null>(null);

  useEffect(() => {
    fetch("/api/topics").then((r) => r.json()).then(setTopics);
  }, []);

  function toggleTopic(name: string) {
    if (expanded === name) {
      setExpanded(null);
      setVolumeData(null);
      return;
    }
    setExpanded(name);
    fetch(`/api/topics?topic=${encodeURIComponent(name)}`)
      .then((r) => r.json())
      .then(setVolumeData);
  }

  return (
    <>
      <PageHeader title="Topics" sub={`${topics.length} topics tracked`} />

      <div className="grid gap-4">
        {topics.map((t) => (
          <div key={t.name}>
            <button
              onClick={() => toggleTopic(t.name)}
              className="w-full text-left bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 hover:bg-[var(--bg-card-hover)] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{t.name}</h3>
                  {t.description && (
                    <p className="text-sm text-[var(--text-secondary)] mt-1">{t.description}</p>
                  )}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {t.keywords.map((k) => (
                      <span
                        key={k}
                        className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-xs"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0 ml-6">
                  <p className="text-2xl font-bold text-purple-400">{t.latest_volume}</p>
                  <p className="text-xs text-[var(--text-secondary)]">tweets</p>
                  <p className="text-sm text-green-400 mt-1">{t.latest_engagement} avg eng</p>
                </div>
              </div>
            </button>

            {expanded === t.name && volumeData && volumeData.volume.length > 0 && (
              <div className="mt-2">
                <TimeSeriesChart
                  data={volumeData.volume}
                  lines={["volume", "engagement"]}
                  label={`${t.name} — volume over time`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
