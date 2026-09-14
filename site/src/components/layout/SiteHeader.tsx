"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { useState } from "react";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SUBCATEGORIES_BY_PARENT } from "@/lib/pages/subcategory-config";

/**
 * 価格.com 型の3段ヘッダー(2026-09-13 全面改修)。
 *
 * 旧実装は発見系6件とカテゴリ10件を「同じ丸ピル」で1本の横スクロール帯に
 * 詰め込んでいた。16個が等価に並ぶので視線の止まりどころが無く、スマホでは
 * 大半が画面外に隠れる。階層を与えて見つけやすさを優先する。
 *
 *  1段目: ロゴ / 常設検索窓 / 言語・テーマ
 *  2段目: カテゴリ10件だけ(サイトの背骨。均等配置)
 *  3段目: 特集・発見系(補助。細く小さく)
 */

const DISCOVER_LINKS = [
  { key: "rankings",   href: "/ranking" },
  { key: "bestOf",     href: "/best-2026" },
  { key: "newReviews", href: "/new" },
  { key: "gifts",      href: "/gifts" },
  { key: "compare",    href: "/compare" },
  { key: "under50",    href: "/under/50" },
];

const CATEGORY_LINKS = [
  { key: "food",      href: "/category/food",      icon: "🍳" },
  { key: "fitness",   href: "/category/fitness",   icon: "🏋️" },
  { key: "home",      href: "/category/home",      icon: "🏠" },
  { key: "tech",      href: "/category/tech",      icon: "💻" },
  { key: "beauty",    href: "/category/beauty",    icon: "✨" },
  { key: "fashion",   href: "/category/fashion",   icon: "👗" },
  { key: "travel",    href: "/category/travel",    icon: "✈️" },
  { key: "pets",      href: "/category/pets",      icon: "🐾" },
  { key: "finance",   href: "/category/finance",   icon: "💰" },
  { key: "parenting", href: "/category/parenting", icon: "👶" },
];

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

export function SiteHeader() {
  const t = useTranslations();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  // getMessageFallback が "" を返す設定(lib/i18n/request.ts)なので、
  // 欠落キーは throw せず空文字になる。try/catch では拾えない。
  const tt = (key: string, fallback: string): string => {
    const v = t(key);
    return v ? v : fallback;
  };

  // /search は静的書き出しのクライアント検索(SearchUI)。クエリは ?q= で渡し、
  // 受け取り側が未対応でも検索ページ自体は開くので導線として成立する。
  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
    setMenuOpen(false);
  };

  const searchLabel = tt("discover.search", "Search");
  const searchPlaceholder = tt("nav.searchPlaceholder", "Search products and categories");

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      {/* ── 1段目: ロゴ / 検索 / ユーティリティ ── */}
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2.5">
        <Link href="/" className="group flex shrink-0 items-center gap-1.5">
          <span className="text-2xl font-black tracking-tight text-brand-600 transition-colors group-hover:text-brand-700">
            {t("site.name")}
          </span>
        </Link>

        {/* 常設検索窓(価格.com と同じくヘッダー中央)。md 以上で表示 */}
        <form onSubmit={submitSearch} role="search" className="hidden min-w-0 flex-1 md:block">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchLabel}
              className="w-full rounded-full border border-slate-300 bg-slate-50 py-2 pl-9 pr-20 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-brand-600 px-4 py-1.5 text-xs font-bold text-pure transition-colors hover:bg-brand-700"
            >
              {searchLabel}
            </button>
          </div>
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-1 md:ml-0 md:gap-2">
          <Link
            href="/disclosure"
            className="hidden text-xs text-slate-500 transition-colors hover:text-slate-700 lg:inline"
          >
            {t("nav.disclosure")}
          </Link>
          <ThemeToggle />
          <LocaleSwitcher />

          {/* モバイル: 検索アイコン + ハンバーガー */}
          <Link
            href="/search"
            aria-label={searchLabel}
            className="rounded-md p-2 text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
          >
            <SearchIcon className="h-5 w-5" />
          </Link>
          <button
            className="flex flex-col gap-1.5 rounded-md p-2 transition-colors hover:bg-slate-100 md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={tt("nav.menu", "Menu")}
            aria-expanded={menuOpen}
          >
            <span className={`block h-0.5 w-5 bg-slate-700 origin-center transition-transform ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-5 bg-slate-700 transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 bg-slate-700 origin-center transition-transform ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── 2段目: カテゴリ(サイトの背骨。均等配置で1行に収める) ──
          カーソルを置くと品目(サブカテゴリ)のドロップダウンを出す
          (2026-09-14, ken 指示)。価格.com と同じで、上位10カテゴリに
          留まらずその場で品目へ飛べる。開閉は group-hover / group-focus-within
          の CSS だけで行い useState を増やさない。JS 状態にすると
          ポインタが項目とパネルの隙間を通った瞬間に閉じる対策が要るうえ、
          静的書き出しの初期表示で開いたパネルが一瞬見えることがある。
          hidden ではなく invisible + opacity にしてあるのは、パネル自体に
          マウスが乗り続けている間も開いたままにするため(display:none だと
          ホバー対象が消えて自分で自分を閉じる)。 */}
      <div className="relative hidden border-t border-slate-100 bg-white md:block">
        <nav className="mx-auto flex max-w-6xl items-stretch px-4" aria-label={tt("nav.allCategories", "Browse categories")}>
          {CATEGORY_LINKS.map(({ key, href, icon }) => {
            const subs = SUBCATEGORIES_BY_PARENT[key as keyof typeof SUBCATEGORIES_BY_PARENT] ?? [];
            return (
              <div key={key} className="group relative flex flex-1">
                <Link
                  href={href}
                  data-related="nav"
                  className="flex w-full items-center justify-center gap-1.5 border-b-2 border-transparent px-1 py-2.5 text-[13px] font-semibold text-slate-700 transition-colors group-hover:border-brand-600 group-hover:bg-brand-50 group-hover:text-brand-700 group-focus-within:border-brand-600 group-focus-within:bg-brand-50"
                >
                  <span aria-hidden className="text-sm">{icon}</span>
                  <span className="truncate">{tt(`category.${key}`, key)}</span>
                </Link>

                {subs.length > 0 && (
                  <div className="invisible absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 opacity-0 transition-opacity duration-100 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <ul className="mt-0 overflow-hidden rounded-b-lg border border-t-0 border-slate-200 bg-white py-1 shadow-lg">
                      {subs.map((sub) => (
                        <li key={sub.slug}>
                          <Link
                            href={`/category/${key}/${sub.slug}`}
                            data-related="nav-subcategory"
                            className="block truncate px-3 py-1.5 text-[13px] text-slate-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
                          >
                            {tt(`subcategory.${sub.slug}`, sub.label)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* ── 3段目: 特集・発見系(補助導線として細く) ── */}
      <div className="hidden border-t border-slate-100 bg-slate-50 md:block">
        <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-1 scrollbar-none">
          <span className="mr-1 shrink-0 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {tt("discover.features", "Featured collections")}
          </span>
          {DISCOVER_LINKS.map(({ key, href }) => (
            <Link
              key={key}
              href={href}
              data-related="nav"
              className="shrink-0 whitespace-nowrap rounded px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-white hover:text-brand-700"
            >
              {tt(`discover.${key}`, key)}
            </Link>
          ))}
        </div>
      </div>

      {/* ── モバイルメニュー ── */}
      {menuOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
          <form onSubmit={submitSearch} role="search" className="mb-4">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchLabel}
                className="w-full rounded-full border border-slate-300 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </form>

          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            {tt("pages.sidebarHeading", "Categories")}
          </p>
          <div className="mb-4 grid grid-cols-2 gap-1.5">
            {CATEGORY_LINKS.map(({ key, href, icon }) => (
              <Link
                key={key}
                href={href}
                data-related="nav"
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
                onClick={() => setMenuOpen(false)}
              >
                <span aria-hidden>{icon}</span>
                <span className="truncate">{tt(`category.${key}`, key)}</span>
              </Link>
            ))}
          </div>

          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            {tt("discover.features", "Featured collections")}
          </p>
          <div className="mb-4 grid grid-cols-2 gap-1.5">
            {DISCOVER_LINKS.map(({ key, href }) => (
              <Link
                key={key}
                href={href}
                data-related="nav"
                className="rounded-lg bg-brand-50 px-3 py-2 text-xs font-bold text-brand-600 transition-colors hover:bg-brand-100"
                onClick={() => setMenuOpen(false)}
              >
                {tt(`discover.${key}`, key)}
              </Link>
            ))}
          </div>

          <nav className="flex flex-col gap-3 border-t border-slate-100 pt-3 text-sm font-medium">
            <Link href="/articles" className="text-slate-700 transition-colors hover:text-brand-600" onClick={() => setMenuOpen(false)}>
              {t("nav.articles")}
            </Link>
            <Link href="/disclosure" className="text-slate-500 transition-colors hover:text-slate-700" onClick={() => setMenuOpen(false)}>
              {t("nav.disclosure")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
