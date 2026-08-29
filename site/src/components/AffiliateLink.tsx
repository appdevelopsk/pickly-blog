"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { pickLink, pickAllLinks } from "@/lib/affiliates/catalog";
import { buildAffiliateUrl, directGoesToAmazon } from "@/lib/affiliates/asp";
import { rakutenSearchUrl, rakutenProductMatch, youtubeReviewSearchUrl } from "@/lib/affiliates/rakuten";
import { getReviewVideo } from "@/lib/affiliates/youtube";
import { getYahooMatch } from "@/lib/affiliates/yahoo";
import { ReviewVideo } from "@/components/ReviewVideo";
import { inferMarketFromLocale } from "@/lib/i18n/locales";
import { inferGeoMarket } from "@/lib/affiliates/geo-market";
import type { AffiliateOffer, AspNetwork } from "@/lib/affiliates/types";
import type { Market } from "@/lib/affiliates/types";

const GEO_MARKETS = new Set<Market>(["UK", "CA"]);

function useMarket(localeMarket: Market): Market {
  const [market, setMarket] = useState<Market>(localeMarket);
  useEffect(() => {
    // cookie は「サーバ側で geo を確定できる環境」用の上書き経路として残すが、
    // ★静的エクスポートの本サイトには cookie を設定する処理が存在しない。
    //   実際の判定はタイムゾーン+ブラウザ言語のクライアント推定で行う
    //   (2026-08-06 まで UK 訪問者に amazon.com が出続けていた)。
    const match = document.cookie.match(/(?:^|;\s*)x-market=([^;]+)/);
    const cookieGeo = match?.[1] as Market | undefined;
    if (cookieGeo && GEO_MARKETS.has(cookieGeo)) {
      setMarket(cookieGeo);
      return;
    }
    // 推定は「en ページ(=US市場)」でのみ行う。/ja/ を読む在英者の Amazon を
    // 勝手に UK に振らない(その読者は日本語商品情報を求めており、リンク先の
    // 品揃えが変わると本文と食い違う)。
    if (localeMarket !== "US") return;
    const inferred = inferGeoMarket(
      navigator.languages ?? [navigator.language],
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    );
    // CA は当初「タグ未取得」として見送ったが、アカウントは実在した
    //   (pickly056-20・2026-08-06 ダッシュボード実確認)。UK と同様に適用する。
    if (inferred === "UK" || inferred === "CA") setMarket(inferred);
  }, [localeMarket]);
  return market;
}

const AMAZON_NETWORKS = new Set<AspNetwork>([
  "amazon-jp", "amazon-us", "amazon-uk", "amazon-de",
  "amazon-fr", "amazon-es", "amazon-it", "amazon-ca", "moshimo",
]);

function storeLabel(network: AspNetwork): string {
  if (AMAZON_NETWORKS.has(network)) return "Amazon";
  if (network === "rakuten-affiliate") return "楽天";
  if (network === "valuecommerce") return "Yahoo!";
  if (network === "direct") return "公式";
  if (network === "a8") return "A8";
  return "Buy";
}

interface Props {
  offer: AffiliateOffer;
  note?: string;
  variant?: "card" | "inline" | "button" | "stores";
  hideBadge?: boolean;
}

export function AffiliateLink({ offer, note, variant = "card", hideBadge = false }: Props) {
  const locale = useLocale();
  const t = useTranslations();
  const localeMarket = inferMarketFromLocale(locale);
  const market = useMarket(localeMarket);
  // ★承認済みを先に探す。onlyApproved:false だけで引くと、承認前の案件
  //   (impact/cj 等の placeholder) が先に当たり、その商品は href="#" の
  //   「準備中」カードになる。実際に踏めるリンクを持っているのに踏めない状態で、
  //   日本語記事では 24枚中 2枚しか買い口が無かった (2026-08-05 実測)。
  //   承認済みが1つも無いときだけ、従来どおり準備中表示にフォールバックする。
  const link =
    pickLink(offer, market) ?? pickLink(offer, market, { onlyApproved: false });
  // ★rel="sponsored" は「金銭的対価のあるリンク」に付けるもの。
  //   network:"direct" はメーカー公式への素リンクで報酬が発生しないため、
  //   sponsored を付けると検索エンジンにも読者にも事実と異なる申告になる
  //   (2026-08-04: 金融/SaaS 55記事を公式リンクで公開したときに顕在化)。
  const isMonetised = link != null && link.network !== "direct";
  const linkRel = isMonetised ? "sponsored nofollow noopener noreferrer" : "noopener noreferrer";

  const name = offer.name[locale as keyof typeof offer.name] ?? offer.name.en ?? offer.id;
  const desc = offer.description[locale as keyof typeof offer.description] ?? offer.description.en ?? "";

  // JP市場では全商品に「楽天で見る」(商品名検索アフィリンク)を追加。カタログに
  // 楽天個別リンクが無くても成果報酬導線が付く（hgcリダイレクト動作確認済）。
  const rakutenQuery = offer.name.ja ?? offer.name.en ?? name;
  // 確信できる実商品マッチがあれば特定商品リンク＋価格、無ければ検索リンク。
  const rakutenMatch =
    market === "JP" ? rakutenProductMatch(offer.id, offer.name.en, offer.name.ja) : null;
  const rakutenHref = rakutenMatch?.url ?? rakutenSearchUrl(rakutenQuery);
  const rakutenLabel = (() => {
    if (!rakutenMatch) return "楽天で見る";
    const { priceMin, priceMax, price } = rakutenMatch;
    const yen = (n: number) => `¥${n.toLocaleString("ja-JP")}`;
    // 関連商品で価格に妥当な幅(最大≤最安×3)があれば「¥X〜¥Y」。
    // 幅が異常(外れ値混入)なら単一の代表価格にフォールバック。
    if (
      priceMin != null &&
      priceMax != null &&
      priceMax > priceMin &&
      priceMax <= priceMin * 3
    ) {
      return `楽天 ${yen(priceMin)}〜${yen(priceMax)}`;
    }
    const p = price ?? priceMin;
    return p != null ? `楽天 ${yen(p)}〜` : "楽天で見る";
  })();
  const rakutenButton =
    market === "JP" ? (
      <a
        href={rakutenHref}
        target="_blank"
        referrerPolicy="no-referrer-when-downgrade"
        rel="sponsored nofollow noopener noreferrer"
        data-offer-id={offer.id}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[#bf0000]/40 bg-white px-4 py-2 text-sm font-semibold text-[#bf0000] hover:bg-[#bf0000]/5 transition-all"
      >
        {rakutenLabel} →
      </a>
    ) : null;

  // Yahoo!ショッピング（JP3本目）。確信マッチ時のみ価格レンジ付き、無ければ非表示。
  // URLは affiliate_type=vc 取得＝VCでYahoo!ショッピング提携承認後に成果計上。
  const yahooMatch = market === "JP" ? getYahooMatch(offer.id, offer.name.en, offer.name.ja) : null;
  const yahooButton = yahooMatch ? (
    <a
      href={yahooMatch.url}
      target="_blank"
      referrerPolicy="no-referrer-when-downgrade"
      rel="sponsored nofollow noopener noreferrer"
      data-offer-id={offer.id}
      className="inline-flex items-center gap-1.5 rounded-lg border border-[#FF0033]/40 bg-white px-4 py-2 text-sm font-semibold text-[#FF0033] hover:bg-[#FF0033]/5 transition-all"
    >
      {(() => {
        const { priceMin, priceMax, price } = yahooMatch;
        const yen = (n: number) => `¥${n.toLocaleString("ja-JP")}`;
        if (priceMin != null && priceMax != null && priceMax > priceMin && priceMax <= priceMin * 3) {
          return `Yahoo! ${yen(priceMin)}〜${yen(priceMax)}`;
        }
        const p = price ?? priceMin;
        return p != null ? `Yahoo! ${yen(p)}〜` : "Yahoo!で見る";
      })()} →
    </a>
  ) : null;

  // 楽天レビュー★評価・件数（社会的証明）と YouTube レビュー動画リンク（購買後押し）。
  const reviewStars =
    market === "JP" && rakutenMatch && rakutenMatch.reviewCount > 0 ? (
      <span className="inline-flex items-center gap-1 text-xs text-amber-600">
        ★{rakutenMatch.reviewAverage.toFixed(1)}
        <span className="text-slate-400">（楽天{rakutenMatch.reviewCount.toLocaleString("ja-JP")}件）</span>
      </span>
    ) : null;
  // 該当商品のレビュー動画がキャッシュ済みなら埋め込み(facade)。無ければ検索リンク。
  // 動画=最大の滞留レバー。★選択は market ではなく locale で行う(2026-08-12)。
  // market だと de/fr/ko どれも「非JP」でひとまとめ＝英語動画になり、本文の
  // 言語と動画の言語が食い違っていた。キャッシュ未取得の言語は en に落ちる。
  const reviewVideo = getReviewVideo(offer.id, locale);
  const youtubeLink = !reviewVideo ? (
    <a
      href={youtubeReviewSearchUrl(offer.name.en ?? name, locale)}
      target="_blank"
      referrerPolicy="no-referrer-when-downgrade"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-[#FF0000] transition-colors"
    >
      ▶ {t("offer.videoReview")}
    </a>
  ) : null;
  const reviewRow =
    reviewStars || youtubeLink ? (
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        {reviewStars}
        {youtubeLink}
      </div>
    ) : null;
  const videoBlock = reviewVideo ? (
    <ReviewVideo videoId={reviewVideo.videoId} title={reviewVideo.title} label={t("offer.videoReview")} />
  ) : null;

  if (!link) {
    const fallbackUrl = buildAffiliateUrl({
      link: { network: amazonNetworkForMarket(market), productId: name,
              markets: [market], approved: true },
      productName: offer.name.en ?? name,
      market,
    });

    if (variant === "button") {
      const amazonBtn = (
        <a
          href={fallbackUrl}
          data-offer-id={offer.id}
          target="_blank"
          referrerPolicy="no-referrer-when-downgrade"
          rel="sponsored nofollow noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-400 transition-colors"
        >
          {t("offer.searchOnAmazon")} →
        </a>
      );
      return rakutenButton ? (
        <div className="flex flex-wrap items-center gap-2">{amazonBtn}{rakutenButton}{yahooButton}</div>
      ) : amazonBtn;
    }

    if (variant === "inline") {
      return (
        <a
          href={fallbackUrl}
          data-offer-id={offer.id}
          target="_blank"
          referrerPolicy="no-referrer-when-downgrade"
          rel="sponsored nofollow noopener noreferrer"
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
        {note && <p className="mb-2 text-xs italic text-slate-500">{note}</p>}
        <p className="mb-2 text-xs text-slate-500">{t("offer.regionFallback")}</p>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={fallbackUrl}
            data-offer-id={offer.id}
            target="_blank"
            referrerPolicy="no-referrer-when-downgrade"
            rel="noopener noreferrer"
            className="text-sm font-medium text-slate-600 underline-offset-2 hover:underline"
          >
            {t("offer.searchOnAmazon")} →
          </a>
          {rakutenButton}
          {yahooButton}
        </div>
      </div>
    );
  }

  const ctaLabel = offer.cta?.[locale as keyof typeof offer.cta] ?? offer.cta?.en ?? t("offer.defaultCta");
  const isApproved = link.approved;
  // category を渡す理由: network:"direct" を自国Amazon検索へ寄せるかの判定に使う
  // (finance/travel は Amazon に商品が無いので直リンクのまま)。
  const href = isApproved ? buildAffiliateUrl({ link, productName: offer.name.en ?? name, market, category: offer.category, siblings: offer.links }) : "#";

  if (variant === "stores") {
    const allLinks = pickAllLinks(offer, market, { onlyApproved: true });
    // Deduplicate by store label so we don't show two "Amazon" buttons
    const byLabel = new Map<string, typeof allLinks[0]>();
    for (const l of allLinks) {
      // direct が Amazon 検索に化ける場合は「Amazon」として数える。
      // ここで元の "公式" のまま重複排除すると、同じ Amazon 行きのボタンが2つ並ぶ。
      const label = l.network === "direct" && directGoesToAmazon(offer.category, offer.name.en ?? name)
        ? "Amazon"
        : storeLabel(l.network);
      if (!byLabel.has(label)) byLabel.set(label, l);
    }
    const storeLinks = [...byLabel.entries()];
    // byLabel のキーは重複排除の識別子なので日本語のまま保持し、
    // 表示だけロケールに合わせる ("公式" が全17ロケールに漏れていた)。
    const displayLabel = (label: string) => (label === "公式" ? t("offer.storeOfficial") : label);
    if (storeLinks.length === 0) {
      const amazonHost = amazonHostForMarket(market);
      return (
        <div className="flex flex-wrap gap-2">
          {/* ★タグを必ず通す。ここは素の検索URLを直接組み立てていて、
              踏まれても報酬にならない導線だった (2026-08-05)。 */}
          <a href={buildAffiliateUrl({
                link: { network: amazonNetworkForMarket(market), productId: name,
                        markets: [market], approved: true },
                productName: offer.name.en ?? name, market })}
            data-offer-id={offer.id}
            target="_blank"
        referrerPolicy="no-referrer-when-downgrade" rel="sponsored nofollow noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-400 transition-colors">
            {t("offer.searchOnAmazon")} →
          </a>
          {rakutenButton}
          {yahooButton}
        </div>
      );
    }
    return (
      <div>
        <div className="flex flex-wrap gap-2">
          {storeLinks.map(([label, l], i) => {
            const storeHref = buildAffiliateUrl({ link: l, productName: offer.name.en ?? name, market, category: offer.category, siblings: offer.links });
            return (
              <a
                key={label}
                href={storeHref}
                target="_blank"
                referrerPolicy="no-referrer-when-downgrade"
                // Amazon検索に化けた direct は成果報酬リンクなので sponsored を付ける
                rel={l.network === "direct" && !directGoesToAmazon(offer.category, offer.name.en ?? name)
                  ? "noopener noreferrer"
                  : "sponsored nofollow noopener noreferrer"}
                data-offer-id={offer.id}
                className={
                  i === 0
                    ? "inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-brand-700 hover:shadow-md transition-all"
                    : "inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-brand-400 hover:text-brand-600 transition-all"
                }
              >
                {displayLabel(label)} →
              </a>
            );
          })}
          {!byLabel.has("楽天") && rakutenButton}
          {!byLabel.has("Yahoo!") && yahooButton}
        </div>
        {reviewRow}
        {videoBlock}
      </div>
    );
  }

  if (variant === "button") {
    const mainBtn = isApproved ? (
      <a
        href={href}
        target="_blank"
        referrerPolicy="no-referrer-when-downgrade"
        rel={linkRel}
        data-offer-id={offer.id}
        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-brand-700 hover:shadow-md transition-all"
      >
        {ctaLabel} →
      </a>
    ) : (
      <span className="text-xs italic text-slate-500">{t("offer.pending")}</span>
    );
    return rakutenButton ? (
      <div className="flex flex-wrap items-center gap-2">{mainBtn}{rakutenButton}{yahooButton}</div>
    ) : mainBtn;
  }

  if (variant === "inline") {
    return isApproved ? (
      <a
        href={href}
        target="_blank"
        referrerPolicy="no-referrer-when-downgrade"
        rel={linkRel}
        data-offer-id={offer.id}
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
      {note && <p className="mb-2 text-xs italic text-slate-500">{note}</p>}
      <div className="flex flex-wrap items-center gap-2">
        {isApproved ? (
          <a
            href={href}
            target="_blank"
            referrerPolicy="no-referrer-when-downgrade"
            rel={linkRel}
            data-offer-id={offer.id}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-700 hover:shadow-md transition-all"
          >
            {ctaLabel} →
          </a>
        ) : (
          <span className="text-xs italic text-slate-500">{t("offer.pending")}</span>
        )}
        {rakutenButton}
        {yahooButton}
      </div>
      {reviewRow}
      {videoBlock}
    </div>
  );
}

/** market → その国の Amazon ASP。素の検索URLを組み立てる代わりにこれを通して
 *  buildAffiliateUrl に渡すと、必ずアフィリエイトタグが付く。
 *  ★ここを通さない素の `${host}/s?k=...` が3箇所あり、踏まれても報酬に
 *    ならない導線になっていた (2026-08-05)。 */
function amazonNetworkForMarket(market: string): AspNetwork {
  switch (market) {
    case "JP": return "amazon-jp";
    case "UK": return "amazon-uk";
    case "EU": return "amazon-de";
    case "FR": return "amazon-fr";
    case "ES": return "amazon-es";
    case "IT": return "amazon-it";
    case "CA": return "amazon-ca";
    default:   return "amazon-us";
  }
}

function amazonHostForMarket(market: string): string {
  switch (market) {
    case "JP": return "https://www.amazon.co.jp";
    case "US": return "https://www.amazon.com";
    case "UK": return "https://www.amazon.co.uk";
    case "EU": return "https://www.amazon.de";
    case "FR": return "https://www.amazon.fr";
    case "ES": return "https://www.amazon.es";
    case "IT": return "https://www.amazon.it";
    case "CA": return "https://www.amazon.ca";
    case "CN": return "https://www.amazon.cn";
    default:   return "https://www.amazon.com";
  }
}
