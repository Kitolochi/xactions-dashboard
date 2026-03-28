import dynamic from "next/dynamic";

export const DynamicBarChart = dynamic(
  () => import("./bar-chart").then((m) => m.SimpleBarChart),
  { ssr: false, loading: () => <div className="h-[220px] bg-[var(--bg-card)] rounded-xl animate-pulse" /> }
);

export const DynamicLineChart = dynamic(
  () => import("./line-chart").then((m) => m.TimeSeriesChart),
  { ssr: false, loading: () => <div className="h-[300px] bg-[var(--bg-card)] rounded-xl animate-pulse" /> }
);

export const DynamicSparkline = dynamic(
  () => import("./sparkline").then((m) => m.Sparkline),
  { ssr: false }
);
