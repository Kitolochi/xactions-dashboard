"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { CategoryBadge } from "@/components/ui/badge";

interface Account {
  username: string;
  name: string;
  category: string;
  description: string;
  followers: number;
  following: number;
  captured_at: string;
}

type SortKey = "followers" | "following" | "username";

function formatNum(n: number | null): string {
  if (n === null || n === undefined) return "--";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export default function WatchlistPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<{ category: string }[]>([]);
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("followers");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    const params = filter ? `?category=${filter}` : "";
    fetch(`/api/watchlist${params}`)
      .then((r) => r.json())
      .then((d) => {
        setAccounts(d.accounts);
        setCategories(d.categories);
      });
  }, [filter]);

  const sorted = [...accounts].sort((a, b) => {
    const av = a[sortKey] ?? 0;
    const bv = b[sortKey] ?? 0;
    if (typeof av === "string") return sortAsc ? (av as string).localeCompare(bv as string) : (bv as string).localeCompare(av as string);
    return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  }

  const SortArrow = ({ k }: { k: SortKey }) =>
    sortKey === k ? <span className="ml-1">{sortAsc ? "\u25B2" : "\u25BC"}</span> : null;

  return (
    <>
      <PageHeader title="Watchlist" sub={`${accounts.length} accounts tracked`} />

      <div className="mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-[var(--bg-card)] border border-[var(--border-color)] text-sm rounded-lg px-3 py-2 text-[var(--text-primary)]"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.category} value={c.category}>{c.category}</option>
          ))}
        </select>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-color)] text-left text-[var(--text-secondary)]">
              <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort("username")}>
                Account <SortArrow k="username" />
              </th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 cursor-pointer text-right" onClick={() => toggleSort("followers")}>
                Followers <SortArrow k="followers" />
              </th>
              <th className="px-4 py-3 cursor-pointer text-right" onClick={() => toggleSort("following")}>
                Following <SortArrow k="following" />
              </th>
              <th className="px-4 py-3 text-right">Ratio</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((a) => (
              <tr
                key={a.username}
                className="border-b border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-colors"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/accounts/${a.username}`}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    @{a.username}
                  </Link>
                  {a.name && <p className="text-xs text-[var(--text-secondary)]">{a.name}</p>}
                </td>
                <td className="px-4 py-3">
                  {a.category && <CategoryBadge category={a.category} />}
                </td>
                <td className="px-4 py-3 text-right font-mono">{formatNum(a.followers)}</td>
                <td className="px-4 py-3 text-right font-mono">{formatNum(a.following)}</td>
                <td className="px-4 py-3 text-right font-mono text-[var(--text-secondary)]">
                  {a.followers && a.following
                    ? (a.followers / a.following).toFixed(1)
                    : "--"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
