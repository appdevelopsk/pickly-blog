"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { useState } from "react";

const CATEGORY_LINKS = [
  { key: "fitness", href: "/articles#fitness" },
  { key: "food",    href: "/articles#food" },
  { key: "tech",    href: "/articles#tech" },
  { key: "beauty",  href: "/articles#beauty" },
  { key: "home",    href: "/articles#home" },
];

export function SiteHeader() {
  const t = useTranslations();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      {/* Main bar */}
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-black tracking-tight text-brand-600">
          {t("site.name")}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/articles" className="text-slate-700 hover:text-brand-600 transition-colors">
            {t("nav.articles")}
          </Link>
          <Link href="/disclosure" className="text-slate-500 hover:text-brand-600 transition-colors">
            {t("nav.disclosure")}
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="flex flex-col gap-1.5 p-1 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="menu"
        >
          <span className={`block h-0.5 w-6 bg-slate-600 transition-transform ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block h-0.5 w-6 bg-slate-600 transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-6 bg-slate-600 transition-transform ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </div>

      {/* Category strip */}
      <div className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 py-1.5 scrollbar-none">
          {CATEGORY_LINKS.map(({ key, href }) => {
            let label = key;
            try { label = t(`category.${key}`); } catch { /* missing */ }
            return (
              <Link
                key={key}
                href={href}
                className="shrink-0 rounded-full px-3 py-1 text-xs font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition-colors whitespace-nowrap"
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-3 text-sm font-medium">
            <Link href="/articles" className="text-slate-700" onClick={() => setMenuOpen(false)}>
              {t("nav.articles")}
            </Link>
            <Link href="/disclosure" className="text-slate-500" onClick={() => setMenuOpen(false)}>
              {t("nav.disclosure")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
