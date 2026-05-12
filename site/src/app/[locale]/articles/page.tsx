import { setRequestLocale, getTranslations } from "next-intl/server";
import { LOCALES } from "@/lib/i18n/locales";
import { Link } from "@/lib/i18n/navigation";
import { listArticlesForLocale } from "@/lib/articles/registry";
import { CATALOG } from "@/lib/affiliates/catalog";
import type { ArticleMeta } from "@/lib/articles/types";
import { CategoryPlaceholder } from "@/components/CategoryPlaceholder";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface Props {
  params: Promise<{ locale: string }>;
}

const CATEGORY_COLORS: Record<string, string> = {
  fitness: "bg-red-50 text-red-700 border-red-200",
  food:    "bg-green-50 text-green-700 border-green-200",
  tech:    "bg-blue-50 text-blue-700 border-blue-200",
  beauty:  "bg-pink-50 text-pink-700 border-pink-200",
  home:    "bg-amber-50 text-amber-700 border-amber-200",
};

const CATEGORY_ORDER = ["fitness", "food", "tech", "beauty", "home"];

function getCategoryColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? "bg-slate-50 text-slate-700 border-slate-200";
}

/** Returns best available thumbnail: OG image → first product image → null */
function getThumbnail(article: ArticleMeta, locale: string): string | null {
  if (article.ogImage && article.ogImage !== "auto") {
    return `${article.ogImage}-${locale}.png`;
  }
  for (const offerId of article.offerIds) {
    const offer = CATALOG.find((o) => o.id === offerId);
    if (offer?.imageUrl) return offer.imageUrl;
  }
  return null;
}

function ArticleCard({
  article,
  locale,
  title,
  description,
  catLabel,
}: {
  article: ArticleMeta;
  locale: string;
  title: string;
  description: string;
  catLabel: string;
}) {
  const color = getCategoryColor(article.category);
  const imgSrc = getThumbnail(article, locale);
  const isProductImg = imgSrc && !imgSrc.includes("/og/");

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group flex flex-col rounded-xl border border-slate-200 overflow-hidden bg-white hover:border-brand-400 hover:shadow-md transition-all duration-200"
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden bg-slate-50" style={{ aspectRatio: isProductImg ? "1/1" : "16/9" }}>
        {imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgSrc}
            alt={title}
            className={`w-full h-full transition-transform duration-300 group-hover:scale-105 ${isProductImg ? "object-contain p-3" : "object-cover"}`}
            loading="lazy"
          />
        ) : (
          <CategoryPlaceholder category={article.category} title={title} />
        )}
        <span className={`absolute left-2 top-2 rounded-full border px-2 py-0.5 text-[11px] font-semibold bg-white/95 shadow-sm ${color}`}>
          {catLabel}
        </span>
      </div>
      {/* Text */}
      <div className="flex flex-col flex-1 p-3">
        <h3 className="text-[13px] font-bold leading-snug text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-3">
          {title}
        </h3>
        {description && (
          <p className="mt-1.5 text-[11px] text-slate-500 line-clamp-2 flex-1">{description}</p>
        )}
      </div>
    </Link>
  );
}

export default async function ArticlesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const articles = listArticlesForLocale(locale);

  const byCategory = articles.reduce<Record<string, typeof articles>>(
    (acc, a) => { (acc[a.category] ??= []).push(a); return acc; },
    {},
  );

  const sortedCategories = [
    ...CATEGORY_ORDER.filter((c) => byCategory[c]),
    ...Object.keys(byCategory).filter((c) => !CATEGORY_ORDER.includes(c)).sort(),
  ];

  let pageTitle = "Articles";
  try { pageTitle = t("nav.articles"); } catch { /* missing */ }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 mb-2">{pageTitle}</h1>
        <p className="text-slate-500">
          {articles.length} reviews &amp; comparisons · {sortedCategories.length} categories
        </p>
      </div>

      {/* Category jump links — text only, no emoji */}
      <div className="flex flex-wrap gap-2 mb-10">
        {sortedCategories.map((cat) => {
          let label = cat;
          try { label = t(`category.${cat}`); } catch { /* missing */ }
          const color = getCategoryColor(cat);
          return (
            <a
              key={cat}
              href={`#${cat}`}
              className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-opacity hover:opacity-70 ${color}`}
            >
              {label}
              <span className="ml-1.5 opacity-60 text-xs">({byCategory[cat]?.length ?? 0})</span>
            </a>
          );
        })}
      </div>

      {/* Category sections */}
      {sortedCategories.map((category) => {
        const items = byCategory[category] ?? [];
        let catLabel = category;
        try { catLabel = t(`category.${category}`); } catch { /* missing */ }

        return (
          <section key={category} id={category} className="mb-14 scroll-mt-6">
            <div className="flex items-baseline gap-3 mb-5 border-b border-slate-200 pb-3">
              <h2 className="text-xl font-black text-slate-900">{catLabel}</h2>
              <span className="text-sm text-slate-400">{items.length}件</span>
            </div>
            <ul className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((a) => {
                let title = a.slug;
                try { title = t(`articles.${a.slug}.title`); } catch { /* missing */ }
                let description = "";
                try { description = t(`articles.${a.slug}.description`); } catch { /* missing */ }
                return (
                  <li key={a.slug}>
                    <ArticleCard
                      article={a}
                      locale={locale}
                      title={title}
                      description={description}
                      catLabel={catLabel}
                    />
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  let title = "Articles";
  try { title = t("nav.articles"); } catch { /* missing */ }
  let siteName = "Pickly";
  try { siteName = t("site.name"); } catch { /* missing */ }
  return {
    title: `${title} | ${siteName}`,
    description: `Browse all reviews and comparisons on ${siteName}.`,
  };
}
