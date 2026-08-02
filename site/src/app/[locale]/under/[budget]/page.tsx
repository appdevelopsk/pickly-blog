import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { LOCALES } from "@/lib/i18n/locales";
import { Link } from "@/lib/i18n/navigation";
import { listArticlesForLocale } from "@/lib/articles/registry";
import { loadArticleCardMeta } from "@/lib/i18n/loader";
import { CATALOG } from "@/lib/affiliates/catalog";
import { hasApprovedAds } from "@/lib/affiliates/has-ads";
import { getOfferImageUrl } from "@/lib/affiliates/images";
import { OG_BASE_URL } from "@/lib/og";
import { CategoryPlaceholder } from "@/components/CategoryPlaceholder";
import { ArticleCardImage } from "@/components/ArticleCardImage";
import type { ArticleMeta } from "@/lib/articles/types";
import type { AffiliateOffer } from "@/lib/affiliates/types";
import { localeAlternates } from "@/lib/i18n/alternates";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

const VALID_BUDGETS = ["50", "100", "200", "500"] as const;
type Budget = (typeof VALID_BUDGETS)[number];

const BUDGET_LABELS: Record<Budget, string> = {
  "50":  "Under $50",
  "100": "Under $100",
  "200": "Under $200",
  "500": "Under $500",
};

const CATEGORY_ICONS: Record<string, string> = {
  fitness: "🏋️", food: "🍳", tech: "💻", beauty: "✨", home: "🏠",
  fashion: "👗", finance: "💰", travel: "✈️", parenting: "👶", pets: "🐾",
};
const TYPE_LABELS: Record<string, string> = {
  comparison: "Comparison", review: "Review", guide: "Guide",
};

/** Parse a price value to a USD number. Handles "$29.99", "29.99", "29", and "$1,299". */
function parseUsdPrice(price: string | undefined): number | null {
  if (!price) return null;
  // "$29.99" or "$1,299" format
  const mDollar = price.match(/^\$([0-9,]+(?:\.[0-9]+)?)/);
  if (mDollar) return parseFloat(mDollar[1]!.replace(/,/g, ""));
  // bare numeric string "28" or "28.5" (catalog-additions uses USD without symbol)
  const mNumeric = price.match(/^([0-9]+(?:\.[0-9]+)?)$/);
  if (mNumeric) return parseFloat(mNumeric[1]!);
  return null;
}

/** Returns the lowest USD price among an article's offers, or null. */
function minPrice(a: ArticleMeta): number | null {
  let min: number | null = null;
  for (const id of a.offerIds) {
    const o = CATALOG.find((x) => x.id === id);
    if (!o) continue;
    // Try price, then priceMin
    const p = parseUsdPrice(o.price) ?? parseUsdPrice(o.priceMin);
    if (p !== null && (min === null || p < min)) min = p;
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
  const tt = (key: string, fallback: string, values?: Record<string, string | number>): string => {
    try { return t(key, values); } catch { return fallback; }
  };
  const threshold = parseInt(budgetKey, 10);
  const label = BUDGET_LABELS[budgetKey as Budget];

  const all = listArticlesForLocale(locale).filter((a) => hasApprovedAds(a, locale));
  const articles = all
    .filter((a) => {
      const p = minPrice(a);
      return p !== null && p < threshold;
    })
    .sort((a, b) => (minPrice(a) ?? 0) - (minPrice(b) ?? 0));

  // Group by category
  const byCategory: Record<string, ArticleMeta[]> = {};
  for (const a of articles) {
    if (!byCategory[a.category]) byCategory[a.category] = [] as ArticleMeta[];
    byCategory[a.category]!.push(a);
  }
  const categories = Object.entries(byCategory).sort((a, b) => b[1].length - a[1].length);

  let siteName = "Pickly";
  try { siteName = t("site.name"); } catch { /* missing */ }

  const listSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Best Products ${label}`,
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
          <span className="text-slate-600 font-medium">{label}</span>
        </nav>

        <section className="py-10 md:py-14">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-4 py-1.5 text-xs font-bold text-green-700">
            💰 Budget picks
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            Best products {label}
          </h1>
          <p className="mt-3 max-w-xl text-base text-slate-500 leading-relaxed">
            {articles.length} reviews where the top-ranked option costs less than ${budgetKey}. Sorted by price, lowest first.
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
              {BUDGET_LABELS[b as Budget]}
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
                      const p = minPrice(a);
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
                                  from ${p}
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
  const label = BUDGET_LABELS[budgetKey as Budget];
  const title = `Best Products ${label} in 2026`;
  const description = `Tested product reviews where top picks cost less than $${budgetKey}. Fitness, tech, home, beauty, and more — all ${label}.`;
  const url = `${SITE_URL}/${locale}/under/${budgetKey}`;
  return {
    title, description,
    alternates: localeAlternates(`/under/${budgetKey}`, locale),
    openGraph: { type: "website", title, description, url, siteName: "Pickly" },
    twitter: { card: "summary", title, description },
  };
}
