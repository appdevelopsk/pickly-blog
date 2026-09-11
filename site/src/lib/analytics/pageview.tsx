"use client";
import { useEffect } from "react";

// GA4 補助イベント送信。初回 page_view は layout.tsx の
// gtag('config', …, {send_page_view:true}) が送っているので、ここでは送らない
// （二重計上になる）。滞在/回遊の診断に必要な3つを足す（2026-08-22）:
//   scroll_depth  … 25/50/75/90% を1ページ1回ずつ
//   toc_click     … 目次クリック（モバイル箱 / デスクトップサイドバー両方）
//   related_click … 関連記事クリック（インライン / サイドバー / 末尾グリッド）
// 2026-09-08 追加: セッション再入場 page_view。静的サイトはタブ復帰や bfcache 復元で
// ページが再ロードされないため、30分の GA4 セッションタイムアウト後に戻ってきた閲覧が
// 新セッションとして page_view を持たず「Unassigned / (not set)」に落ちていた。
const THRESHOLDS = [25, 50, 75, 90] as const;
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 1800000ms = GA4 既定のセッション切れ
// layout.tsx の <head> 直書き config と同じ測定ID解決（両者がズレると config が別IDに飛ぶ）。
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-M7SF83B60R";

type GtagParams = Record<string, string | number | boolean | undefined>;

// gtag 未ロード（広告ブロッカー / GA_ID 未設定）でも安全に no-op にする。
function send(name: string, params: GtagParams): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

// 再入場時のセッション起点。event スコープの page_view はページコンテキストを
// 張り直さないため、GA4 は新セッションのランディングページ/チャネルを決定できず
// 「(not set) / Unassigned」に落ちる（2026-09-08 の修正が逆効果だった原因）。
// config を再実行してページコンテキストごと張り直す。
function reconfigPageView(): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  if (!GA_ID) return;
  window.gtag("config", GA_ID, {
    send_page_view: true,
    page_location: window.location.href,
    page_path: window.location.pathname,
    page_title: document.title,
  });
}

export function PageViewTracker() {
  useEffect(() => {
    const fired = new Set<number>();
    let ticking = false;
    let lastActivity = Date.now();

    const measure = () => {
      ticking = false;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const pct = ((window.scrollY + window.innerHeight) / doc.scrollHeight) * 100;
      for (const t of THRESHOLDS) {
        if (pct >= t && !fired.has(t)) {
          fired.add(t);
          send("scroll_depth", {
            percent_scrolled: t,
            page_path: window.location.pathname,
          });
        }
      }
    };

    const onScroll = () => {
      lastActivity = Date.now();
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(measure);
    };

    const onClick = (e: MouseEvent) => {
      lastActivity = Date.now();
      const target = e.target as Element | null;
      if (!target) return;
      const link = target.closest("a") as HTMLAnchorElement | null;
      if (!link) return;

      // 目次は同一ページ内アンカー（#section-N / #offer-xxx）。
      const href = link.getAttribute("href") ?? "";
      if (href.startsWith("#")) {
        send("toc_click", {
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
        send("related_click", {
          placement,
          target_path: new URL(link.href, window.location.origin).pathname,
          page_path: window.location.pathname,
        });
      }
    };

    // 最終操作から 30 分以上経ってページに戻ってきたら、新セッションの起点として
    // page_view を送り直す（GA4 は page_view の無いセッションをチャネル判定できない）。
    const reenter = () => {
      const now = Date.now();
      if (now - lastActivity >= SESSION_TIMEOUT_MS) {
        reconfigPageView();
      }
      lastActivity = now;
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") reenter();
    };
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) reenter();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onPageShow);
    measure(); // 初期表示で既に下端まで見えている短いページを取りこぼさない
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);
  return null;
}
