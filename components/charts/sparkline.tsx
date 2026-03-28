"use client";

import { LineChart, Line, ResponsiveContainer } from "recharts";

interface SparklineProps {
  data: { value: number }[];
  color?: string;
  width?: number;
  height?: number;
}

export function Sparkline({ data, color = "#3b82f6", width = 80, height = 30 }: SparklineProps) {
  if (data.length < 2) return <span className="text-xs text-[var(--text-secondary)]">--</span>;

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
