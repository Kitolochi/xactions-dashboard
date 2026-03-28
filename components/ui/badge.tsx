"use client";

const CATEGORY_COLORS: Record<string, string> = {
  "frontier-lab": "bg-blue-500/20 text-blue-400",
  researcher: "bg-purple-500/20 text-purple-400",
  builder: "bg-green-500/20 text-green-400",
  vc: "bg-orange-500/20 text-orange-400",
  "open-source": "bg-teal-500/20 text-teal-400",
  commentator: "bg-pink-500/20 text-pink-400",
  founder: "bg-yellow-500/20 text-yellow-400",
  policy: "bg-red-500/20 text-red-400",
};

export function CategoryBadge({ category }: { category: string }) {
  const colors = CATEGORY_COLORS[category] || "bg-gray-500/20 text-gray-400";
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colors}`}>
      {category}
    </span>
  );
}

export function TrendBadge({ ratio }: { ratio: number }) {
  if (ratio >= 3)
    return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">Hot</span>;
  if (ratio >= 2)
    return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">Trending</span>;
  return null;
}
