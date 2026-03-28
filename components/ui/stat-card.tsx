"use client";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

export function StatCard({ label, value, sub, color = "blue" }: StatCardProps) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-400",
    green: "text-green-400",
    purple: "text-purple-400",
    orange: "text-orange-400",
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
      <p className="text-sm text-[var(--text-secondary)] mb-1">{label}</p>
      <p className={`text-3xl font-bold ${colorMap[color] || colorMap.blue}`}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {sub && <p className="text-xs text-[var(--text-secondary)] mt-1">{sub}</p>}
    </div>
  );
}
