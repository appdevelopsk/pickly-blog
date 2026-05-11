import { useLocale, useTranslations } from "next-intl";
import { pickLink } from "@/lib/affiliates/catalog";
import { buildAffiliateUrl } from "@/lib/affiliates/asp";
import { inferMarketFromLocale } from "@/lib/i18n/locales";
import type { AffiliateOffer } from "@/lib/affiliates/types";

interface Props {
  offer: AffiliateOffer;
  note?: string;
  variant?: "card" | "inline" | "button";
  hideBadge?: boolean;
}

export function AffiliateLink({ offer, note, variant = "card", hideBadge = false }: Props) {
  const locale = useLocale();
  const t = useTranslations();
  const market = inferMarketFromLocale(locale);
  const link = pickLink(offer, market, { onlyApproved: false });

  const name = offer.name[locale as keyof typeof offer.name] ?? offer.name.en ?? offer.id;
  const desc = offer.description[locale as keyof typeof offer.description] ?? offer.description.en ?? "";

  if (!link) {
    const amazonHost = amazonHostForMarket(market);
    const fallbackUrl = `${amazonHost}/s?k=${encodeURIComponent(name)}`;

    if (variant === "button") {
      return (
        <a
          href={fallbackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-400 transition-colors"
        >
          {t("offer.searchOnAmazon")} →
        </a>
      );
    }

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
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
        <p className="mb-2 font-semibold text-slate-700">{name}</p>
        {desc && <p className="mb-3 text-sm text-slate-500">{desc}</p>}
        {note && <p className="mb-2 text-xs italic text-slate-400">{note}</p>}
        <p className="mb-2 text-xs text-slate-400">{t("offer.regionFallback")}</p>
        <a
          href={fallbackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-slate-600 underline-offset-2 hover:underline"
        >
          {t("offer.searchOnAmazon")} →
        </a>
      </div>
    );
  }

  const ctaLabel = offer.cta?.[locale as keyof typeof offer.cta] ?? offer.cta?.en ?? t("offer.defaultCta");
  const isApproved = link.approved;
  const href = isApproved ? buildAffiliateUrl({ link, productName: offer.name.en ?? name }) : "#";

  if (variant === "button") {
    return isApproved ? (
      <a
        href={href}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className="inline-flex items-center gap-1 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
      >
        {ctaLabel} →
      </a>
    ) : (
      <span className="text-xs italic text-slate-400">{t("offer.pending")}</span>
    );
  }

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
      <span className="italic text-slate-500">{name}</span>
    );
  }

  return (
    <div
      className={
        "rounded-lg border p-4 " +
        (isApproved
          ? "border-slate-200 bg-white hover:border-brand-400 hover:shadow-sm transition-shadow"
          : "cursor-not-allowed border-dashed border-slate-300 bg-slate-50 opacity-60")
      }
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-semibold text-slate-900">{name}</span>
          {!hideBadge && offer.badge && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
              {offer.badge}
            </span>
          )}
        </div>
        <span className="shrink-0 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
          PR
        </span>
      </div>
      {desc && <p className="mb-3 text-sm leading-relaxed text-slate-600">{desc}</p>}
      {note && <p className="mb-2 text-xs italic text-slate-400">{note}</p>}
      {isApproved ? (
        <a
          href={href}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          {ctaLabel} →
        </a>
      ) : (
        <span className="text-xs italic text-slate-400">{t("offer.pending")}</span>
      )}
    </div>
  );
}

function amazonHostForMarket(market: string): string {
  switch (market) {
    case "JP": return "https://www.amazon.co.jp";
    case "US": return "https://www.amazon.com";
    case "UK": return "https://www.amazon.co.uk";
    case "EU": return "https://www.amazon.de";
    case "CN": return "https://www.amazon.cn";
    default:   return "https://www.amazon.com";
  }
}
