"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#3b82f6", "#22c55e", "#a855f7", "#f97316", "#ef4444", "#06b6d4", "#ec4899"];

interface TimeSeriesChartProps {
  data: Record<string, unknown>[];
  lines: string[];
  xKey?: string;
  label?: string;
  height?: number;
}

export function TimeSeriesChart({
  data,
  lines,
  xKey = "date",
  label,
  height = 300,
}: TimeSeriesChartProps) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
      {label && <p className="text-sm text-[var(--text-secondary)] mb-4">{label}</p>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ left: 10, right: 20 }}>
          <XAxis
            dataKey={xKey}
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
            tickFormatter={(v: string) => {
              if (!v) return "";
              const d = new Date(v);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
          />
          <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              background: "#1a1d27",
              border: "1px solid #2a2e3a",
              borderRadius: "8px",
              color: "#e4e4e7",
            }}
          />
          {lines.length > 1 && <Legend />}
          {lines.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
