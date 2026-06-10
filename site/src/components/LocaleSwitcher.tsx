"use client";

import { useRef, useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { LOCALE_DEFS } from "@/lib/i18n/locales";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function switchLocale(code: string) {
    setOpen(false);
    router.replace(pathname, { locale: code });
  }

  const current = LOCALE_DEFS.find((l) => l.code === locale);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 transition-colors"
      >
        <span aria-hidden className="text-sm">🌐</span>
        <span className="hidden sm:inline">{current?.code.toUpperCase() ?? locale.toUpperCase()}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 max-h-72 w-44 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {LOCALE_DEFS.map((l) => (
            <button
              key={l.code}
              onClick={() => switchLocale(l.code)}
              className={`flex w-full items-center justify-between px-3.5 py-2 text-left text-sm transition-colors hover:bg-brand-50 hover:text-brand-600 ${
                l.code === locale ? "font-semibold text-brand-600" : "text-slate-700"
              }`}
            >
              <span>{l.native}</span>
              {l.code === locale && <span className="text-xs text-brand-400">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
