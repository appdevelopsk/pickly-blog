"use client";

import { useEffect, useState } from "react";

/**
 * テーマ切替。実際の色は globals.css の CSS 変数が持っていて、
 * ここは <html> の .dark クラスと localStorage を面倒見るだけ。
 * 初期適用は layout.tsx の <head> インラインスクリプト(FOUC防止)が行うので、
 * このコンポーネントは既に付いているクラスを読み取って状態を合わせる。
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    setReady(true);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* private mode 等では保存できないが、当該セッションの切替は効く */
    }
    window.gtag?.("event", "theme_toggle", { theme: next ? "dark" : "light" });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={dark}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-brand-50 hover:text-brand-600 transition-colors ${className}`}
    >
      {/* SSR時は light 相当を描いておき、マウント後に実状態へ差し替える */}
      {ready && dark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
