import { useLocale, useTranslations } from "next-intl";
import { pickLink } from "@/lib/affiliates/catalog";
import { buildAffiliateUrl } from "@/lib/affiliates/asp";
import { inferMarketFromLocale } from "@/lib/i18n/locales";
import type { AffiliateOffer } from "@/lib/affiliates/types";

interface Props {
  offer: AffiliateOffer;
  /** Optional: per-offer note from the article */
  note?: string;
  /** Compact rendering for in-line use vs card style */
  variant?: "card" | "inline";
}

/**
 * 1 offer = 1 affiliate link card/button.
 * - 自動でロケール→市場推定→最適なASPリンク選択
 * - rel="sponsored noopener noreferrer" 必須（SEO + ASP規約）
 * - approved=false のリンクは disabled 表示
 * - リンクが当該市場に存在しない場合は「ご利用地域では未対応」表示 + Amazonローカル検索リンク提供
 */
export function AffiliateLink({ offer, note, variant = "card" }: Props) {
  const locale = useLocale();
  const t = useTranslations();
  const market = inferMarketFromLocale(locale);
  const link = pickLink(offer, market, { onlyApproved: false });

  const name = offer.name[locale] ?? offer.name.en ?? offer.id;
  const desc = offer.description[locale] ?? offer.description.en ?? "";

  // リンクが見つからない = この market 用 ASP リンク未整備
  // → Amazon ローカル検索でフォールバック (報酬発生せずだが UX 維持)
  if (!link) {
    const amazonHost = amazonHostForMarket(market);
    const fallbackUrl = `${amazonHost}/s?k=${encodeURIComponent(name)}`;

    if (variant === "inline") {
      return (
        <a
          href={fallbackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-slate-600 underline-offset-2 hover:underline"
        >
          {name}
        </a>
      );
    }
    return (
      <article className="flex h-full flex-col rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
        <header className="mb-2 flex items-start gap-2">
          {offer.badge && <span aria-hidden className="text-xl leading-none">{offer.badge}</span>}
          <h3 className="flex-1 text-base font-semibold">{name}</h3>
        </header>
        <p className="flex-1 text-sm text-slate-600">{desc}</p>
        {note && <p className="mt-2 text-xs text-slate-500 italic">{note}</p>}
        <p className="mt-3 text-xs text-slate-500">{t("offer.regionFallback")}</p>
        <a
          href={fallbackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex w-fit items-center gap-1 text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
        >
          {t("offer.searchOnAmazon")} →
        </a>
      </article>
    );
  }

  const ctaLabel = offer.cta?.[locale] ?? offer.cta?.en ?? t("offer.defaultCta");
  const isApproved = link.approved;
  const href = isApproved ? buildAffiliateUrl({ link }) : "#";

  if (variant === "inline") {
    return isApproved ? (
      <a
        href={href}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className="font-medium text-brand-600 underline-offset-2 hover:underline"
      >
        {name}
      </a>
    ) : (
      <span className="text-slate-500 italic">{name}</span>
    );
  }

  return (
    <article
      className={
        "flex h-full flex-col rounded-lg border p-4 " +
        (isApproved
          ? "border-slate-200 bg-white hover:border-brand-500 hover:bg-brand-50"
          : "cursor-not-allowed border-dashed border-slate-300 bg-slate-50 opacity-70")
      }
    >
      <header className="mb-2 flex items-start gap-2">
        {offer.badge && (
          <span aria-hidden className="text-xl leading-none">{offer.badge}</span>
        )}
        <h3 className="flex-1 text-base font-semibold">{name}</h3>
        <span className="rounded-sm bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700">
          {t("offer.disclosureBadge")}
        </span>
      </header>
      <p className="flex-1 text-sm text-slate-600">{desc}</p>
      {note && <p className="mt-2 text-xs text-slate-500 italic">{note}</p>}
      {isApproved ? (
        <a
          href={href}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="mt-3 inline-flex w-fit items-center gap-1 rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          {ctaLabel} →
        </a>
      ) : (
        <span className="mt-3 inline-block text-xs italic text-slate-500">
          {t("offer.pending")}
        </span>
      )}
    </article>
  );
}

function amazonHostForMarket(market: string): string {
  switch (market) {
    case "JP": return "https://www.amazon.co.jp";
    case "US": return "https://www.amazon.com";
    case "UK": return "https://www.amazon.co.uk";
    case "EU": return "https://www.amazon.de";
    case "CN": return "https://www.amazon.cn";
    default: return "https://www.amazon.com";
  }
}
