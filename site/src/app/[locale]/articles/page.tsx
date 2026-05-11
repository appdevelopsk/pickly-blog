import { setRequestLocale, getTranslations } from "next-intl/server";
import { LOCALES } from "@/lib/i18n/locales";
import { Link } from "@/lib/i18n/navigation";
import { listArticlesForLocale } from "@/lib/articles/registry";
import type { ArticleMeta } from "@/lib/articles/types";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface Props {
  params: Promise<{ locale: string }>;
}

// Category display order and emoji
const CATEGORY_META: Record<string, { emoji: string; color: string }> = {
  fitness: { emoji: "💪", color: "bg-orange-50 text-orange-700 border-orange-200" },
  food:    { emoji: "🍽️", color: "bg-green-50 text-green-700 border-green-200" },
  tech:    { emoji: "💻", color: "bg-blue-50 text-blue-700 border-blue-200" },
  beauty:  { emoji: "✨", color: "bg-pink-50 text-pink-700 border-pink-200" },
  home:    { emoji: "🏠", color: "bg-amber-50 text-amber-700 border-amber-200" },
};

const CATEGORY_ORDER = ["fitness", "food", "tech", "beauty", "home"];

function getCategoryMeta(cat: string) {
  return CATEGORY_META[cat] ?? { emoji: "📋", color: "bg-slate-50 text-slate-700 border-slate-200" };
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
  const cm = getCategoryMeta(article.category);
  const imgSrc = article.ogImage ? `${article.ogImage}-${locale}.png` : null;

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group flex flex-col rounded-xl border border-slate-200 overflow-hidden hover:border-brand-500 hover:shadow-md transition-all duration-200"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[2/3] bg-slate-100 overflow-hidden">
        {imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgSrc}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            {cm.emoji}
          </div>
        )}
        <span className={`absolute top-2 left-2 rounded-full border px-2 py-0.5 text-xs font-semibold ${cm.color}`}>
          {catLabel}
        </span>
      </div>
      {/* Text */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-semibold leading-snug text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-3">
          {title}
        </h3>
        {description && (
          <p className="mt-2 text-sm text-slate-500 line-clamp-2 flex-1">{description}</p>
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

  // Group by category
  const byCategory = articles.reduce<Record<string, typeof articles>>(
    (acc, a) => { (acc[a.category] ??= []).push(a); return acc; },
    {},
  );

  // Sort categories by preferred order, then alphabetically for unknowns
  const sortedCategories = [
    ...CATEGORY_ORDER.filter((c) => byCategory[c]),
    ...Object.keys(byCategory).filter((c) => !CATEGORY_ORDER.includes(c)).sort(),
  ];

  let pageTitle = "Articles";
  try { pageTitle = t("nav.articles"); } catch { /* missing */ }
  let siteName = "Pickly";
  try { siteName = t("site.name"); } catch { /* missing */ }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900 mb-3">{pageTitle}</h1>
        <p className="text-slate-500 text-lg">
          {articles.length} reviews &amp; comparisons
          {" · "}
          {sortedCategories.length} categories
          {" · "}
          {siteName}
        </p>
      </div>

      {/* Category jump links */}
      <div className="flex flex-wrap gap-2 mb-10">
        {sortedCategories.map((cat) => {
          let label = cat;
          try { label = t(`category.${cat}`); } catch { /* missing */ }
          const cm = getCategoryMeta(cat);
          return (
            <a
              key={cat}
              href={`#${cat}`}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors hover:opacity-80 ${cm.color}`}
            >
              <span>{cm.emoji}</span>
              <span>{label}</span>
              <span className="ml-0.5 opacity-60">({byCategory[cat]?.length ?? 0})</span>
            </a>
          );
        })}
      </div>

      {/* Category sections */}
      {sortedCategories.map((category) => {
        const items = byCategory[category] ?? [];
        let catLabel = category;
        try { catLabel = t(`category.${category}`); } catch { /* missing */ }
        const cm = getCategoryMeta(category);

        return (
          <section key={category} id={category} className="mb-16 scroll-mt-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">{cm.emoji}</span>
              <h2 className="text-2xl font-bold text-slate-900">{catLabel}</h2>
              <span className="ml-auto text-sm text-slate-400">{items.length} articles</span>
            </div>
            <ul className="grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
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
