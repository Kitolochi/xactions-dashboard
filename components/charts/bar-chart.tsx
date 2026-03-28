"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface SimpleBarChartProps {
  data: { name: string; value: number }[];
  color?: string;
  label?: string;
}

const COLORS = ["#3b82f6", "#22c55e", "#a855f7", "#f97316", "#ef4444", "#06b6d4", "#ec4899", "#eab308"];

export function SimpleBarChart({ data, color, label }: SimpleBarChartProps) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
      {label && <p className="text-sm text-[var(--text-secondary)] mb-4">{label}</p>}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 80, right: 20 }}>
          <XAxis type="number" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "#e4e4e7", fontSize: 12 }}
            width={75}
          />
          <Tooltip
            contentStyle={{
              background: "#1a1d27",
              border: "1px solid #2a2e3a",
              borderRadius: "8px",
              color: "#e4e4e7",
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={color || COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
