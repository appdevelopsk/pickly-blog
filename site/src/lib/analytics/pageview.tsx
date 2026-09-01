"use client";
import { useEffect } from "react";

// GA4 補助イベント送信。page_view 自体は Analytics.tsx の
// gtag('config', …, {send_page_view:true}) が送っているので、ここでは送らない
// （二重計上になる）。滞在/回遊の診断に必要な3つだけを足す（2026-08-22）:
//   scroll_depth  … 25/50/75/90% を1ページ1回ずつ
//   toc_click     … 目次クリック（モバイル箱 / デスクトップサイドバー両方）
//   related_click … 関連記事クリック（インライン / サイドバー / 末尾グリッド）
const THRESHOLDS = [25, 50, 75, 90] as const;

export function PageViewTracker() {
  useEffect(() => {
    const fired = new Set<number>();
    let ticking = false;

    const measure = () => {
      ticking = false;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const pct = ((window.scrollY + window.innerHeight) / doc.scrollHeight) * 100;
      for (const t of THRESHOLDS) {
        if (pct >= t && !fired.has(t)) {
          fired.add(t);
          window.gtag?.("event", "scroll_depth", {
            percent_scrolled: t,
            page_path: window.location.pathname,
          });
        }
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(measure);
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target) return;
      const link = target.closest("a") as HTMLAnchorElement | null;
      if (!link) return;

      // 目次は同一ページ内アンカー（#section-N / #offer-xxx）。
      const href = link.getAttribute("href") ?? "";
      if (href.startsWith("#")) {
        window.gtag?.("event", "toc_click", {
          anchor: href.slice(1),
          page_path: window.location.pathname,
        });
        return;
      }

      // 回遊導線は data-related に配置箇所が入る。記事内(hero/inline/sidebar/grid/nav-*)に加え、
      // 2026-09-01 にトップページ(home-*)と ArticleCrossLinks(cross-*)を計装した。
      // それまで回遊データは記事ページ内の枠しか見えておらず、どの導線が生きているか
      // 測定自体が不可能だった（pv/session 1.14 固着の改修対象を決めるための前提整備）。
      const placement = link.dataset.related;
      if (placement) {
        window.gtag?.("event", "related_click", {
          placement,
          target_path: new URL(link.href, window.location.origin).pathname,
          page_path: window.location.pathname,
        });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick);
    measure(); // 初期表示で既に下端まで見えている短いページを取りこぼさない
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick);
    };
  }, []);
  return null;
}
