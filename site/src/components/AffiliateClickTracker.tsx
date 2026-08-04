"use client";
import { useEffect } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    clarity?: (cmd: string, ...args: unknown[]) => void;
  }
}

export function AffiliateClickTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      // rel=sponsored は direct(公式サイト)リンクに付かなくなったため、
      // 計測は data-offer-id 基準にする(全オファーリンクが持つ)。
      const link = (e.target as Element).closest("a[data-offer-id]") as HTMLAnchorElement | null;
      if (!link) return;
      const offerId = link.dataset.offerId ?? "unknown";
      window.gtag?.("event", "affiliate_click", {
        article_slug: slug,
        offer_id: offerId,
        link_url: link.href,
      });
      window.clarity?.("event", "affiliate_click");
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [slug]);
  return null;
}
