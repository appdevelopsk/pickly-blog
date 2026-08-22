"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { useState } from "react";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";

// 発見系ハブ(/ranking /best-2026 /gifts /compare /under/50)は実装済みだが
// フッターからしか辿れず、平均スクロール26%の実態では事実上到達不能だった。
// カテゴリ帯の先頭に置いて、ファーストビューから回遊できるようにする(2026-08-22)。
const DISCOVER_LINKS = [
  { key: "rankings",   href: "/ranking" },
  { key: "bestOf",     href: "/best-2026" },
  { key: "newReviews", href: "/new" },
  { key: "gifts",      href: "/gifts" },
  { key: "compare",    href: "/compare" },
  { key: "under50",    href: "/under/50" },
];

const CATEGORY_LINKS = [
  { key: "fitness",   href: "/category/fitness" },
  { key: "food",      href: "/category/food" },
  { key: "tech",      href: "/category/tech" },
  { key: "beauty",    href: "/category/beauty" },
  { key: "home",      href: "/category/home" },
  { key: "fashion",   href: "/category/fashion" },
  { key: "finance",   href: "/category/finance" },
  { key: "travel",    href: "/category/travel" },
  { key: "parenting", href: "/category/parenting" },
  { key: "pets",      href: "/category/pets" },
];

export function SiteHeader() {
  const t = useTranslations();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      {/* Main bar */}
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="group flex items-center gap-1.5">
          <span className="text-2xl font-black tracking-tight text-brand-600 group-hover:text-brand-700 transition-colors">
            {t("site.name")}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <Link href="/articles" className="text-slate-600 hover:text-slate-900 transition-colors">
            {t("nav.articles")}
          </Link>
          {/* 検索導線 — /search と SearchUI は実装済みだったが入口が無く到達不能だった（2026-08-22）。 */}
          <Link
            href="/search"
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
            {t("discover.search")}
          </Link>
          <Link
            href="/disclosure"
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            {t("nav.disclosure")}
          </Link>
          <ThemeToggle />
          <LocaleSwitcher />
        </nav>

        {/* Mobile: 検索アイコン + ハンバーガー */}
        <div className="flex items-center gap-1 md:hidden">
          <Link
            href="/search"
            aria-label={t("discover.search")}
            className="rounded-md p-2 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
          </Link>
        <button
          className="flex flex-col gap-1.5 rounded-md p-2 hover:bg-slate-100 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="menu"
        >
          <span className={`block h-0.5 w-5 bg-slate-700 transition-transform origin-center ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block h-0.5 w-5 bg-slate-700 transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-5 bg-slate-700 transition-transform origin-center ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
        </div>
      </div>

      {/* Category strip */}
      <div className="border-t border-slate-100">
        <div className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-4 py-1.5 scrollbar-none">
          {DISCOVER_LINKS.map(({ key, href }) => {
            let label = key;
            try { label = t(`discover.${key}`); } catch { /* missing */ }
            return (
              <Link
                key={key}
                href={href}
                data-related="nav"
                className="shrink-0 rounded-full bg-brand-50 px-3.5 py-1 text-xs font-bold text-brand-600 hover:bg-brand-100 transition-colors whitespace-nowrap"
              >
                {label}
              </Link>
            );
          })}
          <span className="mx-1 h-4 w-px shrink-0 bg-slate-200" aria-hidden="true" />
          {CATEGORY_LINKS.map(({ key, href }) => {
            let label = key;
            try { label = t(`category.${key}`); } catch { /* missing */ }
            return (
              <Link
                key={key}
                href={href}
                data-related="nav"
                className="shrink-0 rounded-full px-3.5 py-1 text-xs font-semibold text-slate-500 hover:bg-brand-50 hover:text-brand-600 transition-colors whitespace-nowrap"
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4 text-sm font-medium">
            <Link href="/articles" className="text-slate-700 hover:text-brand-600 transition-colors" onClick={() => setMenuOpen(false)}>
              {t("nav.articles")}
            </Link>
            <Link href="/search" className="text-slate-700 hover:text-brand-600 transition-colors" onClick={() => setMenuOpen(false)}>
              {t("discover.search")}
            </Link>
            <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
              {DISCOVER_LINKS.map(({ key, href }) => {
                let label = key;
                try { label = t(`discover.${key}`); } catch { /* missing */ }
                return (
                  <Link
                    key={key}
                    href={href}
                    data-related="nav"
                    className="rounded-lg bg-brand-50 px-3 py-2 text-xs font-bold text-brand-600 hover:bg-brand-100 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
            <Link href="/disclosure" className="text-slate-500 hover:text-slate-700 transition-colors" onClick={() => setMenuOpen(false)}>
              {t("nav.disclosure")}
            </Link>
            <div className="flex items-center gap-2 pt-1">
              <LocaleSwitcher />
              <ThemeToggle />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
