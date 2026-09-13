"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { GRADE_ORDER, gradeBadgeClass, type Grade } from "@/lib/articles/grades";

/**
 * 一覧ページの絞り込み/並べ替え。
 *
 * 軸は **category と grade の2つだけ**。2026-09-13 に ja 790本を実測したところ、
 * 価格.com が持つ他の軸は pickly にはデータが無い:
 *   type は comparison 788/790 で実質単一値、価格は記事の 21.5% しか出ず、
 *   publishedAt は distinct 15 値しかないので「新着順」が成立しない。
 * 軸を足す前に必ず投入率を実測すること(rating を型宣言だけで「ある」と誤認した前科)。
 */

export interface FacetItem {
  slug: string;
  category: string;
  catLabel: string;
  /** 掲載製品のうち最高評点。未評価は undefined で「評点あり」絞り込みから外れる。 */
  grade?: Grade;
}

type SortKey = "default" | "grade";

interface Props {
  items: FacetItem[];
  /** カテゴリ選択を出すか。カテゴリ別ページのように既に単一カテゴリなら false。 */
  showCategory?: boolean;
  /** 描画は呼び出し側。絞り込み後の slug 順を受け取って並べ替える。 */
  children: (visibleSlugs: string[]) => React.ReactNode;
}

export function ArticleFacets({ items, showCategory = true, children }: Props) {
  const t = useTranslations();
  // ★ t() は throw せず空文字を返す設定。try/catch は死にコードになるので使わない。
  const tt = (key: string, fallback: string, values?: Record<string, string | number>): string => {
    const v = t(key, values);
    return v ? v : fallback;
  };

  const [category, setCategory] = useState<string>("all");
  const [grade, setGrade] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("default");

  // output: export のため useSearchParams は Suspense 境界が要る(静的ページには無い)。
  // マウント後に location から読めば境界なしで拾える(SearchUI と同じ作法)。
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const c = p.get("category");
      const g = p.get("grade");
      const s = p.get("sort");
      if (c) setCategory(c);
      if (g) setGrade(g);
      if (s === "grade") setSort("grade");
    } catch {
      /* URL が読めない環境では既定のまま = 従来挙動 */
    }
  }, []);

  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const it of items) if (!seen.has(it.category)) seen.set(it.category, it.catLabel);
    return [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [items]);

  const gradesPresent = useMemo(() => {
    const s = new Set(items.map((i) => i.grade).filter(Boolean) as Grade[]);
    return GRADE_ORDER.filter((g) => s.has(g));
  }, [items]);

  const visible = useMemo(() => {
    let list = items;
    if (showCategory && category !== "all") list = list.filter((i) => i.category === category);
    if (grade !== "all") list = list.filter((i) => i.grade === grade);
    if (sort === "grade") {
      // 未評価は末尾。同評点内は元の順序を保つ(安定ソート)。
      const rank = new Map<string, number>(GRADE_ORDER.map((g, i) => [g, i]));
      list = [...list].sort(
        (a, b) =>
          (a.grade ? rank.get(a.grade)! : Number.MAX_SAFE_INTEGER) -
          (b.grade ? rank.get(b.grade)! : Number.MAX_SAFE_INTEGER),
      );
    }
    return list.map((i) => i.slug);
  }, [items, category, grade, sort, showCategory]);

  const pill = (active: boolean) =>
    `rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
      active
        ? "border-brand-300 bg-brand-50 text-brand-700"
        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
    }`;

  const isFiltered = (showCategory && category !== "all") || grade !== "all" || sort !== "default";

  return (
    <>
      <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
        {showCategory && categories.length > 1 && (
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              {tt("facets.category", "Category")}
            </span>
            <button type="button" onClick={() => setCategory("all")} className={pill(category === "all")}>
              {tt("facets.all", "All")}
            </button>
            {categories.map(([slug, label]) => (
              <button key={slug} type="button" onClick={() => setCategory(slug)} className={pill(category === slug)}>
                {label}
              </button>
            ))}
          </div>
        )}

        {gradesPresent.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              {tt("facets.grade", "Grade")}
            </span>
            <button type="button" onClick={() => setGrade("all")} className={pill(grade === "all")}>
              {tt("facets.all", "All")}
            </button>
            {gradesPresent.map((g) => (
              <button key={g} type="button" onClick={() => setGrade(g)} className={pill(grade === g)}>
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-black ${gradeBadgeClass(g)}`}>{g}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">
            {tt("facets.sort", "Sort")}
          </span>
          <button type="button" onClick={() => setSort("default")} className={pill(sort === "default")}>
            {tt("facets.sortDefault", "Recommended")}
          </button>
          <button type="button" onClick={() => setSort("grade")} className={pill(sort === "grade")}>
            {tt("facets.sortGrade", "Highest grade")}
          </button>

          {isFiltered && (
            <button
              type="button"
              onClick={() => { setCategory("all"); setGrade("all"); setSort("default"); }}
              className="ml-auto text-[11px] font-semibold text-slate-400 underline underline-offset-2 hover:text-slate-600"
            >
              {tt("facets.reset", "Reset")}
            </button>
          )}
        </div>

        <p className="mt-3 text-[11px] text-slate-400">
          {tt("facets.count", `${visible.length} of ${items.length} shown`, {
            shown: visible.length,
            total: items.length,
          })}
        </p>
      </div>

      {children(visible)}
    </>
  );
}
