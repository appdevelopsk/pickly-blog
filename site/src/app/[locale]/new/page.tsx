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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

const CATEGORY_ICONS: Record<string, string> = {
  fitness: "🏋️", food: "🍳", tech: "💻", beauty: "✨", home: "🏠",
  fashion: "👗", finance: "💰", travel: "✈️", parenting: "👶", pets: "🐾",
};
const TYPE_LABELS: Record<string, string> = {
  comparison: "Comparison", review: "Review", guide: "Guide",
};

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
  return LOCALES.map((locale) => ({ locale }));
}

interface Props { params: Promise<{ locale: string }> }

export default async function NewPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const all = listArticlesForLocale(locale).filter((a) => hasApprovedAds(a, locale));

  // Sort newest first; group into this-week / this-month / older
  const sorted = [...all].sort((a, b) =>
    a.publishedAt < b.publishedAt ? 1 : -1,
  );

  const now = new Date("2026-06-10"); // deterministic for SSG
  const weekAgo  = new Date(now); weekAgo.setDate(now.getDate() - 7);
  const monthAgo = new Date(now); monthAgo.setDate(now.getDate() - 30);

  const thisWeek  = sorted.filter((a) => new Date(a.publishedAt) >= weekAgo);
  const thisMonth = sorted.filter((a) => new Date(a.publishedAt) >= monthAgo && new Date(a.publishedAt) < weekAgo);
  const older     = sorted.filter((a) => new Date(a.publishedAt) < monthAgo).slice(0, 24);

  const breadcrumb = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Pickly", item: `${SITE_URL}/${locale}/` },
      { "@type": "ListItem", position: 2, name: "New Reviews", item: `${SITE_URL}/${locale}/new/` },
    ],
  };

  let siteName = "Pickly";
  try { siteName = t("site.name"); } catch { /* missing */ }

  function Grid({ articles, rank }: { articles: ArticleMeta[]; rank?: boolean }) {
    return (
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a, idx) => {
          const { title, description } = loadArticleCardMeta(a.slug, locale);
          const imgSrc = getThumbnail(a, locale);
          const isProductImg = imgSrc && !imgSrc.includes("/og/");
          const offer = firstOffer(a);
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
                  {rank && (
                    <span className="absolute left-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-[10px] font-black text-white shadow">
                      NEW
                    </span>
                  )}
                  {offer?.price && (
                    <span className="absolute bottom-2.5 right-2.5 rounded-full bg-white/95 border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-800 shadow-sm">
                      {offer.price}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  {offer?.badge && <p className="mb-1 truncate text-[11px] font-semibold text-amber-600">🏆 {offer.badge}</p>}
                  <h2 className="text-sm font-bold leading-snug text-slate-900 group-hover:text-brand-700 transition-colors line-clamp-2">
                    {title}
                  </h2>
                  {description && <p className="mt-1.5 flex-1 text-xs text-slate-400 line-clamp-2">{description}</p>}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {CATEGORY_ICONS[a.category]} &nbsp;
                      {TYPE_LABELS[a.type] ?? a.type} · {a.offerIds.length} picks
                    </span>
                    <span className="text-xs text-slate-300">{a.publishedAt}</span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    <div className="mx-auto max-w-5xl px-4 pb-20">
      <nav className="mt-6 flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-slate-600 transition-colors">{siteName}</Link>
        <span>/</span>
        <span className="text-slate-600 font-medium">New</span>
      </nav>

      <section className="py-10 md:py-12">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-4 py-1.5 text-xs font-bold text-green-700">
          🆕 Latest reviews
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
          New this month
        </h1>
        <p className="mt-2 text-base text-slate-500">
          Recently published reviews and comparisons — {all.length} total across 10 categories.
        </p>
      </section>

      {thisWeek.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-900">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            This week
            <span className="text-sm font-normal text-slate-400">({thisWeek.length})</span>
          </h2>
          <Grid articles={thisWeek} rank />
        </section>
      )}

      {thisMonth.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-black text-slate-900">
            This month
            <span className="ml-2 text-sm font-normal text-slate-400">({thisMonth.length})</span>
          </h2>
          <Grid articles={thisMonth} />
        </section>
      )}

      {older.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-black text-slate-900">
            Earlier
            <span className="ml-2 text-sm font-normal text-slate-400">({older.length} shown)</span>
          </h2>
          <Grid articles={older} />
        </section>
      )}
    </div>
    </>
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const title = "New Reviews 2026 | Pickly";
  const description = "Recently published product reviews and comparisons — updated regularly across fitness, tech, home, beauty, and more.";
  const url = `${SITE_URL}/${locale}/new`;
  return {
    title, description,
    alternates: { canonical: url, languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}/new`])) },
    openGraph: { type: "website", title, description, url, siteName: "Pickly" },
  };
}
