"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import Fuse from "fuse.js";
import { Link } from "@/lib/i18n/navigation";

export interface SearchItem {
  slug: string;
  title: string;
  description: string;
  category: string;
  catLabel: string;
  imgSrc: string | null;
  price: string | null;
  badge: string | null;
  isProductImg: boolean;
  offerCount: number;
  typeLabel: string;
  type?: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  fitness: "🏋️", food: "🍳", tech: "💻", beauty: "✨", home: "🏠",
  fashion: "👗", finance: "💰", travel: "✈️", parenting: "👶", pets: "🐾",
};

interface Props {
  items: SearchItem[];
  totalCount: number;
}

export function SearchUI({ items, totalCount }: Props) {
  const t = useTranslations();
  const tt = (key: string, fallback: string, values?: Record<string, string | number>): string => {
    try { return t(key, values); } catch { return fallback; }
  };
  const [query, setQuery] = useState("");

  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: [
          { name: "title", weight: 3 },
          { name: "description", weight: 1.5 },
          { name: "catLabel", weight: 1 },
        ],
        threshold: 0.35,
        minMatchCharLength: 2,
        includeScore: true,
      }),
    [items],
  );

  const results = query.trim().length >= 2
    ? fuse.search(query.trim()).map((r) => r.item)
    : [];

  const showing = query.trim().length >= 2 ? results : items.slice(0, 18);

  return (
    <div>
      {/* Search input */}
      <div className="relative mb-8">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" aria-hidden>
          🔍
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${totalCount} reviews…`}
          className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-5 text-base text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 transition-all"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Clear"
          >
            ✕
          </button>
        )}
      </div>

      {/* Results meta */}
      <p className="mb-4 text-sm text-slate-400">
        {query.trim().length >= 2
          ? results.length === 0
            ? tt("pages.noResults", `No results for \"${query}\"`, { query })
            : tt("pages.resultsFor", `${results.length} results for \"${query}\"`, { count: results.length, query })
          : tt("pages.searchEmpty", "Showing recent reviews — start typing to search")}
      </p>

      {/* Grid */}
      {showing.length === 0 && query.trim().length >= 2 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center">
          <p className="text-2xl mb-3">🔍</p>
          <p className="font-semibold text-slate-700">Nothing found for "{query}"</p>
          <p className="mt-1 text-sm text-slate-400">{tt("pages.searchHint", "Try a broader term, like \u201ccoffee\u201d or \u201cfitness\u201d.")}</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {showing.map((item) => (
            <li key={item.slug}>
              <Link
                href={`/articles/${item.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-brand-200 hover:shadow-lg"
              >
                <div className="relative shrink-0 overflow-hidden bg-slate-100" style={{ aspectRatio: "4/3" }}>
                  {item.imgSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imgSrc}
                      alt={item.title}
                      className={`h-full w-full transition-transform duration-300 group-hover:scale-105 ${item.isProductImg ? "object-contain p-4" : "object-cover"}`}
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-200">
                      <span className="text-3xl" aria-hidden>{CATEGORY_ICONS[item.category] ?? "📋"}</span>
                    </div>
                  )}
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700 shadow-sm">
                    {CATEGORY_ICONS[item.category]} {item.catLabel}
                  </span>
                  {item.price && (
                    <span className="absolute bottom-2.5 right-2.5 rounded-full bg-white/95 border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-800 shadow-sm">
                      {item.price}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  {item.badge && (
                    <p className="mb-1 truncate text-[11px] font-semibold text-amber-600">🏆 {item.badge}</p>
                  )}
                  <h2 className="text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-brand-700 line-clamp-2">
                    {item.title}
                  </h2>
                  {item.description && (
                    <p className="mt-1.5 flex-1 text-xs leading-relaxed text-slate-400 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {item.type ? tt(`home.type${item.type.charAt(0).toUpperCase()}${item.type.slice(1)}`, item.typeLabel) : item.typeLabel} · {tt("home.picks", `${item.offerCount} picks`, { count: item.offerCount })}
                    </span>
                    <span className="text-[11px] font-semibold text-brand-600 opacity-0 transition-opacity group-hover:opacity-100">
                      Read →
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
