"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AffiliateLink } from "@/components/AffiliateLink";
import { getOfferImageUrl } from "@/lib/affiliates/images";
import type { AffiliateOffer } from "@/lib/affiliates/types";

interface Props {
  offer: AffiliateOffer;
  /** 監視するアンカー要素の id（この要素を通り過ぎたら表示する）。 */
  anchorId: string;
}

/**
 * モバイル専用のスティッキー CTA（2026-08-22）。
 * mobile は engaged 40% と desktop より高いのに pv/session 1.09 で、
 * 「読み進めた先に行動導線が無いまま記事が終わる」状態だった。
 * リンク生成・市場推定・クリック計測は AffiliateLink に一本化する
 * （URL をここで組み直すと geo 推定が二重実装になる）。
 */
export function StickyOfferCta({ offer, anchorId }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const anchor = document.getElementById(anchorId);
    if (!anchor) return;
    // アンカーが画面上端より上に流れたら表示。IntersectionObserver の
    // boundingClientRect.top で「上に抜けた」と「まだ下にある」を区別する。
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 },
    );
    io.observe(anchor);
    return () => io.disconnect();
  }, [anchorId]);

  const name = offer.name[locale as keyof typeof offer.name] ?? offer.name.en ?? offer.id;
  const img = getOfferImageUrl(offer);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 py-2 shadow-[0_-2px_12px_rgba(0,0,0,0.08)] backdrop-blur transition-transform duration-200 lg:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!visible}
    >
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt="" loading="lazy" className="h-10 w-10 shrink-0 object-contain" />
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-brand-600">
            {t("article.topPick")}
          </p>
          <p className="truncate text-xs font-bold text-slate-900">{name}</p>
        </div>
        <div className="shrink-0">
          <AffiliateLink offer={offer} variant="button" hideBadge />
        </div>
      </div>
    </div>
  );
}
