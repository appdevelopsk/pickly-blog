import { setRequestLocale, getTranslations } from "next-intl/server";
import { LOCALES } from "@/lib/i18n/locales";
import { Link } from "@/lib/i18n/navigation";
import { listArticlesForLocale } from "@/lib/articles/registry";
import { CATALOG } from "@/lib/affiliates/catalog";
import { CategoryPlaceholder } from "@/components/CategoryPlaceholder";
import type { ArticleMeta } from "@/lib/articles/types";

function getThumbnail(article: ArticleMeta, locale: string): string | null {
  if (article.ogImage && article.ogImage !== "auto") return `${article.ogImage}-${locale}.png`;
  for (const offerId of article.offerIds) {
    const offer = CATALOG.find((o) => o.id === offerId);
    if (offer?.imageUrl) return offer.imageUrl;
  }
  return null;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const articles = listArticlesForLocale(locale);
  const recent = articles.slice(-12).reverse();

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Pickly",
    url: SITE_URL,
    description: "Curated reviews and comparisons across 17 languages.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/${locale}/articles/`,
      "query-input": "required name=search_term_string",
    },
  };

  let heading = "Real reviews, no filler.";
  let subheading = "Honest comparisons and buyer's guides.";
  try { heading = t("home.heading"); } catch { /* missing */ }
  try { subheading = t("home.subheading"); } catch { /* missing */ }
  let navArticles = "All Articles";
  try { navArticles = t("nav.articles"); } catch { /* missing */ }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Hero */}
        <div className="mb-10 rounded-2xl bg-gradient-to-br from-brand-50 to-white border border-brand-100 px-6 py-10 text-center">
          <h1 className="mb-3 text-4xl font-black tracking-tight text-slate-900 md:text-5xl">{heading}</h1>
          <p className="mx-auto max-w-xl text-lg text-slate-500">{subheading}</p>
          <div className="mt-5 flex items-center justify-center gap-3 text-sm text-slate-400">
            <span><span className="font-bold text-slate-700">{articles.length}</span> reviews</span>
            <span>·</span>
            <Link href="/articles" className="font-semibold text-brand-600 hover:underline">
              {navArticles} →
            </Link>
          </div>
        </div>

        {/* Recent articles grid */}
        {recent.length === 0 ? (
          <p className="rounded-xl bg-amber-50 p-6 text-amber-800">
            {t("home.empty")}
          </p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((a) => {
              let title = a.slug;
              try { title = t(`articles.${a.slug}.title`); } catch { /* missing */ }
              let description = "";
              try { description = t(`articles.${a.slug}.description`); } catch { /* missing */ }
              let catLabel: string = a.category;
              try { catLabel = t(`category.${a.category}`); } catch { /* missing */ }
              const imgSrc = getThumbnail(a, locale);
              const isProductImg = imgSrc && !imgSrc.includes("/og/");

              return (
                <li key={a.slug}>
                  <Link
                    href={`/articles/${a.slug}`}
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
                        <CategoryPlaceholder category={a.category} title={title} />
                      )}
                      <span className="absolute left-2 top-2 rounded-full bg-white/95 border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700 shadow-sm">
                        {catLabel}
                      </span>
                    </div>
                    {/* Text */}
                    <div className="flex flex-col flex-1 p-3">
                      <h2 className="text-[13px] font-bold leading-snug text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-3">
                        {title}
                      </h2>
                      {description && (
                        <p className="mt-1.5 text-[11px] text-slate-500 line-clamp-2 flex-1">{description}</p>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {articles.length > 12 && (
          <div className="mt-10 text-center">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-8 py-3 text-sm font-bold text-white hover:bg-brand-700 transition-colors shadow-sm"
            >
              {navArticles}をすべて見る ({articles.length}件) →
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const articles = listArticlesForLocale(locale);

  let title = "Pickly";
  let description = "Curated reviews and comparisons across 17 languages.";
  try { title = t("site.name"); } catch { /* missing */ }
  try { description = `${t("home.heading")} ${t("home.subheading")}`; } catch { /* missing */ }

  const canonicalUrl = `${SITE_URL}/${locale}/`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        LOCALES.map((l) => [l, `${SITE_URL}/${l}/`]),
      ),
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonicalUrl,
      siteName: "Pickly",
      locale,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    other: {
      "article:count": String(articles.length),
    },
  };
}
