import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { LOCALES } from "@/lib/i18n/locales";
import { Link } from "@/lib/i18n/navigation";
import { listArticlesForLocale } from "@/lib/articles/registry";
import { loadArticleCardMeta } from "@/lib/i18n/loader";
import { CATALOG } from "@/lib/affiliates/catalog";
import { hasApprovedAds } from "@/lib/affiliates/has-ads";
import { getOfferImageUrl } from "@/lib/affiliates/images";
import { OG_BASE_URL, DEFAULT_OG_IMAGES } from "@/lib/og";
import { CategoryPlaceholder } from "@/components/CategoryPlaceholder";
import { ArticleCardImage } from "@/components/ArticleCardImage";
import type { ArticleMeta } from "@/lib/articles/types";
import type { AffiliateOffer } from "@/lib/affiliates/types";
import { localeAlternates } from "@/lib/i18n/alternates";
import { serpTitle } from "@/lib/seo/title";
import {
  VALID_BUDGETS,
  type Budget,
  type ParsedPrice,
  parsePrice,
  fitsBudget,
  currencyForLocale,
  budgetAmountLabel,
  formatPrice,
} from "@/lib/affiliates/budget";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

const CATEGORY_ICONS: Record<string, string> = {
  fitness: "🏋️", food: "🍳", tech: "💻", beauty: "✨", home: "🏠",
  fashion: "👗", finance: "💰", travel: "✈️", parenting: "👶", pets: "🐾",
};
const TYPE_LABELS: Record<string, string> = {
  comparison: "Comparison", review: "Review", guide: "Guide",
};

/**
 * 記事の最安オファーを返す。ロケールの表示通貨に一致するオファーだけを見る。
 * カタログの price は通貨混在フィールドで、円建ては JP専売オファーの別価格。
 * 通貨をまたいで min を取ると「$29 の記事」が ja で ¥9,000 として並ぶので比較しない。
 */
function minPrice(a: ArticleMeta, currency: string): ParsedPrice | null {
  let min: ParsedPrice | null = null;
  for (const id of a.offerIds) {
    const o = CATALOG.find((x) => x.id === id);
    if (!o) continue;
    // Try price, then priceMin
    const p = parsePrice(o.price) ?? parsePrice(o.priceMin);
    if (!p || p.currency !== currency) continue;
    if (min === null || p.amount < min.amount) min = p;
  }
  return min;
}

function getThumbnail(a: ArticleMeta, locale: string): string | null {
  for (const id of a.offerIds) {
    const o = CATALOG.find((x) => x.id === id);
    if (!o) continue;
    const img = getOfferImageUrl(o);
    if (img) return img;
  }
  if (a.ogImage && a.ogImage !== "auto") return `${OG_BASE_URL}${a.ogImage}-${locale}.png`;
  return null;
}
function firstOffer(a: ArticleMeta): AffiliateOffer | null {
  for (const id of a.offerIds) {
    const o = CATALOG.find((x) => x.id === id);
    if (o) return o;
  }
  return null;
}

export function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    VALID_BUDGETS.map((budget) => ({ locale, budget })),
  );
}

interface Props { params: Promise<{ locale: string; budget: string }> }

export default async function UnderBudgetPage({ params }: Props) {
  const { locale, budget } = await params;
  setRequestLocale(locale);

  // 旧ルートは `under-[budget]` という「部分的な動的セグメント」だった。Next 15 は
  // generateStaticParams からのパス生成(=/en/under-50/ の出力)はできるのに、
  // リクエスト時に params.budget を undefined で渡す。その結果 VALID_BUDGETS の判定が
  // 必ず落ちて notFound() → 静的エクスポートでは「HTTP 200 なのに中身は404ページ」という
  // ソフト404を全ロケール分(8×4=32URL)書き出し、しかもsitemapとフッターが全ページから
  // それを参照していた。ルートを `under/[budget]` の正規セグメントに作り直して根治
  // (2026-07-29)。旧URLは _redirects で301。
  const budgetKey = budget.replace(/^under-/, "");
  if (!VALID_BUDGETS.includes(budgetKey as Budget)) notFound();

  const t = await getTranslations();
  // ★同上。空文字が返るので catch では拾えない。
  const tt = (key: string, fallback: string, values?: Record<string, string | number>): string => {
    const v = t(key, values);
    return v ? v : fallback;
  };
  const currency = currencyForLocale(locale);
  const amountLabel = budgetAmountLabel(budgetKey as Budget, locale);

  const all = listArticlesForLocale(locale).filter((a) => hasApprovedAds(a, locale));
  const articles = all
    .filter((a) => {
      const p = minPrice(a, currency);
      return p !== null && fitsBudget(p, budgetKey as Budget);
    })
    .sort((a, b) => (minPrice(a, currency)?.amount ?? 0) - (minPrice(b, currency)?.amount ?? 0));

  // Group by category
  const byCategory: Record<string, ArticleMeta[]> = {};
  for (const a of articles) {
    if (!byCategory[a.category]) byCategory[a.category] = [] as ArticleMeta[];
    byCategory[a.category]!.push(a);
  }
  const categories = Object.entries(byCategory).sort((a, b) => b[1].length - a[1].length);

  let siteName = "Pickly";
  try { siteName = t("site.name"); } catch { /* missing */ }

  const heading = tt("pages.underHeading", `Best products under $${amountLabel}`, { budget: amountLabel });
  const lead = tt(
    "pages.underLead",
    `${articles.length} reviews where the top pick costs less than $${amountLabel}. Sorted by price, lowest first.`,
    { budget: amountLabel, count: articles.length },
  );

  const listSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: heading,
    url: `${SITE_URL}/${locale}/under/${budgetKey}`,
    numberOfItems: articles.length,
    itemListElement: articles.slice(0, 10).map((a, i) => {
      const { title } = loadArticleCardMeta(a.slug, locale);
      return { "@type": "ListItem", position: i + 1, name: title, url: `${SITE_URL}/${locale}/articles/${a.slug}` };
    }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }} />

      <div className="mx-auto max-w-5xl px-4 pb-20">

        <nav className="mt-6 flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-600 transition-colors">{siteName}</Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">{heading}</span>
        </nav>

        <section className="py-10 md:py-14">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-4 py-1.5 text-xs font-bold text-green-700">
            💰 Budget picks
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            {heading}
          </h1>
          <p className="mt-3 max-w-xl text-base text-slate-500 leading-relaxed">
            {lead}
          </p>
        </section>

        {/* Other budget links */}
        <nav className="mb-10 flex flex-wrap gap-2">
          {VALID_BUDGETS.filter((b) => b !== budgetKey).map((b) => (
            <Link
              key={b}
              href={`/under/${b}`}
              className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-500 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition-colors"
            >
              {tt("pages.underHeading", `Best products under $${budgetAmountLabel(b, locale)}`, {
                budget: budgetAmountLabel(b, locale),
              })}
            </Link>
          ))}
        </nav>

        {articles.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center">
            <p className="text-2xl mb-3">💸</p>
            <p className="font-semibold text-slate-700">{tt("pages.noBudgetResults", "No results in this budget range yet.")}</p>
          </div>
        ) : (
          <div>
            {categories.map(([cat, catArticles]) => {
              let catLabel: string = cat;
              try { catLabel = t(`category.${cat}`); } catch { /* missing */ }
              return (
                <section key={cat} className="mb-12">
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
                    <span aria-hidden>{CATEGORY_ICONS[cat] ?? "📋"}</span>
                    {catLabel}
                    <span className="text-sm font-normal text-slate-400">({catArticles.length})</span>
                  </h2>
                  <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {catArticles.map((a) => {
                      const { title, description } = loadArticleCardMeta(a.slug, locale);
                      const imgSrc = getThumbnail(a, locale);
                      const isProductImg = imgSrc && !imgSrc.includes("/og/");
                      const offer = firstOffer(a);
                      const p = minPrice(a, currency);
                      return (
                        <li key={a.slug}>
                          <Link
                            href={`/articles/${a.slug}`}
                            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-brand-200 hover:shadow-lg"
                          >
                            <div className="relative shrink-0 overflow-hidden bg-slate-100" style={{ aspectRatio: "4/3" }}>
                              <ArticleCardImage src={imgSrc} alt={title}
                                className={`h-full w-full transition-transform duration-300 group-hover:scale-105 ${isProductImg ? "object-contain p-4" : "object-cover"}`}>
                                <CategoryPlaceholder category={a.category} title={title} />
                              </ArticleCardImage>
                              {p !== null && (
                                <span className="absolute bottom-2.5 right-2.5 rounded-full bg-white/95 border border-green-200 px-2.5 py-0.5 text-xs font-bold text-green-700 shadow-sm">
                                  {tt("pages.priceFrom", `from ${formatPrice(p)}`, { price: formatPrice(p) })}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-1 flex-col p-4">
                              {offer?.badge && !/^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(offer.badge) && <p className="mb-1 truncate text-[11px] font-semibold text-amber-600">🏆 {offer.badge}</p>}
                              <h3 className="text-sm font-bold leading-snug text-slate-900 group-hover:text-brand-700 transition-colors line-clamp-2">
                                {title}
                              </h3>
                              {description && <p className="mt-1.5 flex-1 text-xs text-slate-400 line-clamp-2">{description}</p>}
                              <div className="mt-3 flex items-center justify-between">
                                <span className="text-[11px] text-slate-400">{tt(`home.type${a.type.charAt(0).toUpperCase()}${a.type.slice(1)}`, TYPE_LABELS[a.type] ?? a.type)} · {tt("home.picks", `${a.offerIds.length} picks`, { count: a.offerIds.length })}</span>
                                <span className="text-[11px] font-semibold text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">{tt("home.read", "Read →")}</span>
                              </div>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
        )}

      </div>
    </>
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale, budget } = await params;
  const budgetKey = budget.replace(/^under-/, "");
  if (!VALID_BUDGETS.includes(budgetKey as Budget)) return {};
  // ★バンド境界はロケール通貨で出す。ja は円ラダー、他は USD (2026-08-28)。
  const amountLabel = budgetAmountLabel(budgetKey as Budget, locale);
  // ★本文は 17 言語で出しているのに metadata だけ英語直書きだった (2026-08-04)。
  const t = await getTranslations({ locale });
  // ★同上。空文字が返るので catch では拾えない。
  const tt = (key: string, fallback: string, values?: Record<string, string | number>): string => {
    const v = t(key, values);
    return v ? v : fallback;
  };
  const title = tt("pages.underTitle", `Best products under $${amountLabel} in 2026`, { budget: amountLabel });
  const description = tt(
    "pages.underDesc",
    `Comparisons where every top pick stays under $${amountLabel}.`,
    { budget: amountLabel },
  );
  const url = `${SITE_URL}/${locale}/under/${budgetKey}`;
  return {
    title: serpTitle(title), description,
    alternates: localeAlternates(`/under/${budgetKey}`, locale),
    openGraph: { images: DEFAULT_OG_IMAGES, type: "website", title, description, url, siteName: "Pickly" },
    twitter: { card: "summary", title, description },
  };
}
