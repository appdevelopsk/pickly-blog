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
import type { ArticleCategory } from "@/lib/articles/types";
import { localeAlternates } from "@/lib/i18n/alternates";
import { resolvePrice } from "@/lib/affiliates/price";

// ── Constants ─────────────────────────────────────────────────────────────────

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

const VALID_CATEGORIES: ArticleCategory[] = [
  "fitness", "food", "tech", "beauty", "home",
  "fashion", "finance", "travel", "parenting", "pets",
];

const CATEGORY_ICONS: Record<string, string> = {
  fitness: "🏋️", food: "🍳", tech: "💻", beauty: "✨", home: "🏠",
  fashion: "👗", finance: "💰", travel: "✈️", parenting: "👶", pets: "🐾",
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  fitness:   "Compare the best fitness equipment, supplements, and workout gear for 2026.",
  food:      "Top-rated kitchen appliances, cooking tools, and food products reviewed for 2026.",
  tech:      "Curated tech reviews: gadgets, software, and electronics compared for 2026.",
  beauty:    "Honest skincare and beauty product comparisons — independent, not sponsored — for 2026.",
  home:      "Best home appliances, furniture, and décor products reviewed for 2026.",
  fashion:   "Top clothing, accessories, and footwear picks compared on quality and value.",
  finance:   "Best financial services, credit cards, and investment platforms compared for 2026.",
  travel:    "Top travel gear, booking platforms, and accessories reviewed for 2026.",
  parenting: "Best baby products, toys, and parenting gear reviewed for 2026.",
  pets:      "Top pet food, accessories, and health products reviewed for 2026.",
};

const TYPE_LABELS: Record<string, string> = {
  comparison: "Comparison", review: "Review", guide: "Guide",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getThumbnail(article: ArticleMeta, locale: string): string | null {
  for (const offerId of article.offerIds) {
    const offer = CATALOG.find((o) => o.id === offerId);
    if (!offer) continue;
    const img = getOfferImageUrl(offer);
    if (img) return img;
  }
  if (article.ogImage && article.ogImage !== "auto") return `${OG_BASE_URL}${article.ogImage}-${locale}.png`;
  return null;
}

function getFirstOffer(article: ArticleMeta): AffiliateOffer | null {
  for (const offerId of article.offerIds) {
    const offer = CATALOG.find((o) => o.id === offerId);
    if (offer) return offer;
  }
  return null;
}

// ── Static params ─────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    VALID_CATEGORIES.map((category) => ({ locale, category }))
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ locale: string; category: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const { locale, category } = await params;
  setRequestLocale(locale);

  if (!VALID_CATEGORIES.includes(category as ArticleCategory)) notFound();

  const t = await getTranslations();
  // ★同上。空文字が返るので catch では拾えない。
  const tt = (key: string, fallback: string, values?: Record<string, string | number>): string => {
    const v = t(key, values);
    return v ? v : fallback;
  };

  const allInCat = listArticlesForLocale(locale).filter((a) => a.category === category);
  const articles = allInCat.filter((a) => hasApprovedAds(a, locale));

  let catLabel = category;
  try { catLabel = t(`category.${category}`); } catch { /* missing */ }

  const icon = CATEGORY_ICONS[category] ?? "📋";
  const desc = CATEGORY_DESCRIPTIONS[category] ?? `Best ${catLabel} products reviewed.`;

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Best ${catLabel} Products 2026`,
    description: desc,
    url: `${SITE_URL}/${locale}/category/${category}`,
    numberOfItems: articles.length,
    itemListElement: articles.slice(0, 20).map((a, i) => {
      const { title } = loadArticleCardMeta(a.slug, locale);
      return {
        "@type": "ListItem",
        position: i + 1,
        name: title,
        url: `${SITE_URL}/${locale}/articles/${a.slug}`,
      };
    }),
  };

  const breadcrumb = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Pickly", item: `${SITE_URL}/${locale}/` },
      { "@type": "ListItem", position: 2, name: catLabel, item: `${SITE_URL}/${locale}/category/${category}/` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <div className="mx-auto max-w-5xl px-4 pb-20">

        {/* ── Breadcrumb ──────────────────────────────── */}
        <nav className="mt-6 flex items-center gap-2 text-xs text-slate-400" aria-label="breadcrumb">
          <Link href="/" className="hover:text-slate-600 transition-colors">
            {t("site.name")}
          </Link>
          <span>/</span>
          <Link href="/articles" className="hover:text-slate-600 transition-colors">
            {t("nav.articles")}
          </Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">{catLabel}</span>
        </nav>

        {/* ── Hero ────────────────────────────────────── */}
        <section className="py-10 md:py-14">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl" aria-hidden="true">{icon}</span>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                {catLabel}
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                {articles.length} reviews &nbsp;·&nbsp; 17 languages
              </p>
            </div>
          </div>
          <p className="max-w-2xl text-base text-slate-500 leading-relaxed">
            {desc}
          </p>
        </section>

        {/* ── Category pills (sibling categories) ─────── */}
        <nav className="mb-10 flex flex-wrap gap-2" aria-label="categories">
          {VALID_CATEGORIES.filter((c) => c !== category).map((c) => {
            let label: string = c;
            try { label = t(`category.${c}`); } catch { /* missing */ }
            return (
              <Link
                key={c}
                href={`/category/${c}`}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-500 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition-colors"
              >
                {CATEGORY_ICONS[c] && <span aria-hidden>{CATEGORY_ICONS[c]}</span>}
                {label}
              </Link>
            );
          })}
        </nav>

        {/* ── Articles grid ───────────────────────────── */}
        {articles.length === 0 ? (
          <div className="rounded-xl bg-amber-50 p-8 text-center text-amber-800">
            <p className="font-semibold">Articles coming soon for {catLabel}.</p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => {
              const { title, description } = loadArticleCardMeta(a.slug, locale);
              const imgSrc = getThumbnail(a, locale);
              const isProductImg = imgSrc && !imgSrc.includes("/og/");
              const offer = getFirstOffer(a);
              const badge = offer?.badge;
              const price = (offer && resolvePrice(offer, locale));
              const picksCount = a.offerIds.length;
              const typeLabel = TYPE_LABELS[a.type] ?? a.type;
              return (
                <li key={a.slug}>
                  <Link
                    href={`/articles/${a.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-brand-200 hover:shadow-lg"
                  >
                    <div
                      className="relative shrink-0 overflow-hidden bg-slate-100"
                      style={{ aspectRatio: "4/3" }}
                    >
                      <ArticleCardImage
                        src={imgSrc}
                        alt={title}
                        className={`h-full w-full transition-transform duration-300 group-hover:scale-105 ${isProductImg ? "object-contain p-4" : "object-cover"}`}
                      >
                        <CategoryPlaceholder category={a.category} title={title} />
                      </ArticleCardImage>
                      {price && (
                        <span className="absolute bottom-2.5 right-2.5 rounded-full bg-white/95 border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-800 shadow-sm">
                          {price}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      {badge && (
                        <p className="mb-1 truncate text-[11px] font-semibold text-amber-600">
                          {badge && !/^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(badge) ? <>🏆 {badge}</> : null}
                        </p>
                      )}
                      <h2 className="text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-brand-700 line-clamp-2">
                        {title}
                      </h2>
                      {description && (
                        <p className="mt-1.5 flex-1 text-xs leading-relaxed text-slate-400 line-clamp-2">
                          {description}
                        </p>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          {tt(`home.type${a.type.charAt(0).toUpperCase()}${a.type.slice(1)}`, typeLabel)} · {tt("home.picks", `${picksCount} picks`, { count: picksCount })}
                        </span>
                        <span className="text-[11px] font-semibold text-brand-600 opacity-0 transition-opacity group-hover:opacity-100">
                          Read →
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

      </div>
    </>
  );
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props) {
  const { locale, category } = await params;
  setRequestLocale(locale);

  if (!VALID_CATEGORIES.includes(category as ArticleCategory)) return {};

  const t = await getTranslations();
  let catLabel = category;
  try { catLabel = t(`category.${category}`); } catch { /* missing */ }

  const title = `Best ${catLabel} Products 2026`;
  const description = CATEGORY_DESCRIPTIONS[category] ?? `Best ${catLabel} products reviewed.`;
  const canonicalUrl = `${SITE_URL}/${locale}/category/${category}`;

  return {
    title,
    description,
    alternates: localeAlternates(`/category/${category}`, locale),
    openGraph: {
      type: "website",
      title,
      description,
      url: canonicalUrl,
      siteName: "Pickly",
    },
    twitter: { card: "summary", title, description },
  };
}
