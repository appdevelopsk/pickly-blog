"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { GRADE_ORDER, gradeBadgeClass, type Grade } from "@/lib/articles/grades";
import { ArticleCardImage } from "@/components/ArticleCardImage";
import { CategoryPlaceholder } from "@/components/CategoryPlaceholder";

/**
 * 一覧ページの絞り込み/並べ替え。
 *
 * 軸は **category と grade の2つだけ**。2026-09-13 に ja 790本を実測したところ、
 * 価格.com が持つ他の軸は pickly にはデータが無い:
 *   type は comparison 788/790 で実質単一値、価格は記事の 21.5% しか出ず、
 *   publishedAt は distinct 15 値しかないので「新着順」が成立しない。
 * 軸を足す前に必ず投入率を実測すること(rating を型宣言だけで「ある」と誤認した前科)。
 *
 * ★カードの描画はこの中で完結させる。呼び出し側から関数(children)を渡す設計は
 *   output: export で成立しない — Server Component から Client Component へ関数は
 *   渡せず、prerender が
 *     "Functions cannot be passed directly to Client Components"
 *   で落ちてビルドが通らなかった (2026-09-13)。表示に要る値はすべてサーバー側で
 *   解決し、シリアライズ可能な配列だけを渡すこと(SearchUI と同じ作法)。
 */

export interface FacetItem {
  slug: string;
  category: string;
  catLabel: string;
  /** 掲載製品のうち最高評点。未評価は undefined で「評点あり」絞り込みから外れる。 */
  grade?: Grade;
  // ── 以下はカード表示用。すべてサーバー側で解決済みの値を渡す ──
  title: string;
  description: string;
  imgSrc: string | null;
  /** 商品画像なら true(object-contain)、OG画像なら false(object-cover)。 */
  isProductImg: boolean;
  price: string | null;
  /** slug 形式のものは呼び出し側で除外済みの前提。 */
  badge: string | null;
  typeLabel: string;
  type: string;
  offerCount: number;
}

type SortKey = "default" | "grade";

interface Props {
  items: FacetItem[];
  /** カテゴリ選択を出すか。カテゴリ別ページのように既に単一カテゴリなら false。 */
  showCategory?: boolean;
  /** カテゴリバッジにアイコンを出すか(タグ/ブランド等の横断ページ)。 */
  showCategoryIcon?: boolean;
  /**
   * フッター右の「続きを読む」文言。ページごとに出自が違うので呼び出し側で決める。
   * tag は直書き "Read →"、for は tt("home.read") と、元々揃っていなかった。
   * ここで片方に寄せると結線ついでの文言変更になるので、各ページの現状を渡す。
   */
  readLabel?: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  fitness: "🏋️", food: "🍳", tech: "💻", beauty: "✨", home: "🏠",
  fashion: "👗", finance: "💰", travel: "✈️", parenting: "👶", pets: "🐾",
};

export function ArticleFacets({ items, showCategory = true, showCategoryIcon = true, readLabel = "Read →" }: Props) {
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
    return list;
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

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/articles/${item.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-brand-200 hover:shadow-lg"
            >
              <div className="relative shrink-0 overflow-hidden bg-slate-100" style={{ aspectRatio: "4/3" }}>
                {/* 画像フォールバックは各ページと同じ CategoryPlaceholder を使う。
                    SearchUI は絵文字だが、あれは検索専用の見た目で一覧の作法ではない。 */}
                <ArticleCardImage
                  src={item.imgSrc}
                  alt={item.title}
                  className={`h-full w-full transition-transform duration-300 group-hover:scale-105 ${item.isProductImg ? "object-contain p-4" : "object-cover"}`}
                >
                  <CategoryPlaceholder category={item.category} title={item.title} />
                </ArticleCardImage>
                <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700 shadow-sm">
                  {showCategoryIcon ? `${CATEGORY_ICONS[item.category] ?? ""} ` : ""}{item.catLabel}
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
                  <p className="mt-1.5 flex-1 text-xs text-slate-400 line-clamp-2">{item.description}</p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {tt(`home.type${item.type.charAt(0).toUpperCase()}${item.type.slice(1)}`, item.typeLabel)} · {tt("home.picks", `${item.offerCount} picks`, { count: item.offerCount })}
                  </span>
                  <span className="text-[11px] font-semibold text-brand-600 opacity-0 transition-opacity group-hover:opacity-100">{readLabel}</span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
