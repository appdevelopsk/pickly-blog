import { setRequestLocale, getTranslations } from "next-intl/server";
import { LOCALES } from "@/lib/i18n/locales";
import { Link } from "@/lib/i18n/navigation";
import { listArticlesForLocale } from "@/lib/articles/registry";
import { CATALOG } from "@/lib/affiliates/catalog";
import { hasApprovedAds } from "@/lib/affiliates/has-ads";
import { getOfferImageUrl } from "@/lib/affiliates/images";
import { CategoryPlaceholder } from "@/components/CategoryPlaceholder";
import type { ArticleMeta } from "@/lib/articles/types";

function getThumbnail(article: ArticleMeta, locale: string): string | null {
  if (article.ogImage && article.ogImage !== "auto") return `${article.ogImage}-${locale}.png`;
  for (const offerId of article.offerIds) {
    const offer = CATALOG.find((o) => o.id === offerId);
    if (!offer) continue;
    const img = getOfferImageUrl(offer);
    if (img) return img;
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
  const articles = listArticlesForLocale(locale).filter((a) => hasApprovedAds(a, locale));
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
        <div className="mb-12 overflow-hidden rounded-3xl bg-slate-900 px-8 py-14 text-center relative">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-600/25 via-transparent to-transparent" />
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-brand-600/10 blur-3xl" />
          <div className="relative">
            <h1 className="mb-4 text-5xl font-black tracking-tight text-white md:text-6xl">
              {heading}
            </h1>
            <p className="mx-auto max-w-xl text-lg leading-relaxed text-slate-400">{subheading}</p>
            <div className="mt-8 flex items-center justify-center gap-4 text-sm">
              <span className="text-slate-400">
                <span className="font-bold text-white text-base">{articles.length}</span>
                {" "}reviews
              </span>
              <span className="text-slate-700">·</span>
              <Link
                href="/articles"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2 text-sm font-bold text-white hover:bg-brand-500 transition-colors shadow-lg shadow-brand-900/30"
              >
                {navArticles} →
              </Link>
            </div>
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
                    className="group flex flex-col rounded-2xl border border-slate-200 overflow-hidden bg-white hover:border-brand-300 hover:shadow-lg transition-all duration-200"
                  >
                    {/* Thumbnail */}
                    <div className="relative overflow-hidden bg-slate-50" style={{ aspectRatio: isProductImg ? "1/1" : "16/9" }}>
                      {imgSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imgSrc}
                          alt={title}
                          className={`w-full h-full transition-transform duration-300 group-hover:scale-105 ${isProductImg ? "object-contain p-4" : "object-cover"}`}
                          loading="lazy"
                        />
                      ) : (
                        <CategoryPlaceholder category={a.category} title={title} />
                      )}
                      <span className="absolute left-3 top-3 rounded-full bg-white/95 border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700 shadow-sm">
                        {catLabel}
                      </span>
                    </div>
                    {/* Text */}
                    <div className="flex flex-col flex-1 p-4">
                      <h2 className="text-sm font-bold leading-snug text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-3">
                        {title}
                      </h2>
                      {description && (
                        <p className="mt-2 text-xs leading-relaxed text-slate-500 line-clamp-2 flex-1">{description}</p>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {articles.length > 12 && (
          <div className="mt-12 text-center">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-8 py-3 text-sm font-bold text-white hover:bg-brand-700 transition-colors shadow-md"
            >
              {navArticles} ({articles.length}) →
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
