"use client";

export function PageHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold">{title}</h1>
      {sub && <p className="text-sm text-[var(--text-secondary)] mt-1">{sub}</p>}
    </div>
  );
}
