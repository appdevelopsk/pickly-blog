"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { useState } from "react";

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
        <nav className="hidden items-center gap-5 text-sm font-medium md:flex">
          <Link href="/popular" className="text-slate-600 hover:text-slate-900 transition-colors">
            Popular
          </Link>
          <Link href="/compare" className="text-slate-600 hover:text-slate-900 transition-colors">
            ⚖️ Compare
          </Link>
          <Link href="/gifts" className="text-slate-600 hover:text-slate-900 transition-colors">
            🎁 Gifts
          </Link>
          <Link href="/search" className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-slate-500 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 transition-colors">
            <span aria-hidden>🔍</span> Search
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="flex flex-col gap-1.5 rounded-md p-2 hover:bg-slate-100 transition-colors md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="menu"
        >
          <span className={`block h-0.5 w-5 bg-slate-700 transition-transform origin-center ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block h-0.5 w-5 bg-slate-700 transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-5 bg-slate-700 transition-transform origin-center ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </div>

      {/* Category strip */}
      <div className="border-t border-slate-100">
        <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 py-1.5 scrollbar-none">
          {CATEGORY_LINKS.map(({ key, href }) => {
            let label = key;
            try { label = t(`category.${key}`); } catch { /* missing */ }
            return (
              <Link
                key={key}
                href={href}
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
            <Link href="/search" className="text-slate-700 hover:text-brand-600 transition-colors" onClick={() => setMenuOpen(false)}>
              🔍 Search
            </Link>
            <Link href="/popular" className="text-slate-700 hover:text-brand-600 transition-colors" onClick={() => setMenuOpen(false)}>
              🏆 Popular
            </Link>
            <Link href="/compare" className="text-slate-700 hover:text-brand-600 transition-colors" onClick={() => setMenuOpen(false)}>
              ⚖️ Compare
            </Link>
            <Link href="/gifts" className="text-slate-700 hover:text-brand-600 transition-colors" onClick={() => setMenuOpen(false)}>
              🎁 Gift guides
            </Link>
            <Link href="/tags" className="text-slate-700 hover:text-brand-600 transition-colors" onClick={() => setMenuOpen(false)}>
              🏷️ Browse tags
            </Link>
            <Link href="/articles" className="text-slate-700 hover:text-brand-600 transition-colors" onClick={() => setMenuOpen(false)}>
              {t("nav.articles")}
            </Link>
            <Link href="/disclosure" className="text-slate-400 hover:text-slate-600 transition-colors" onClick={() => setMenuOpen(false)}>
              {t("nav.disclosure")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
