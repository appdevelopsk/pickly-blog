import { setRequestLocale, getTranslations } from "next-intl/server";
import { LOCALES } from "@/lib/i18n/locales";
import { Link } from "@/lib/i18n/navigation";
import { listArticlesForLocale } from "@/lib/articles/registry";
import { CategoryPlaceholder } from "@/components/CategoryPlaceholder";

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
      <div className="mx-auto max-w-5xl px-4 py-12">
        {/* Hero */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-slate-900">{heading}</h1>
          <p className="mx-auto max-w-xl text-xl text-slate-500">{subheading}</p>
          <div className="mt-6 flex items-center justify-center gap-3 text-sm text-slate-400">
            <span className="font-semibold text-slate-700">{articles.length}</span> reviews
            <span>·</span>
            <span className="font-semibold text-slate-700">17</span> languages
            <span>·</span>
            <Link href="/articles" className="font-medium text-brand-600 hover:underline">
              {navArticles} →
            </Link>
          </div>
        </div>

        {/* Recent articles grid */}
        {recent.length === 0 ? (
          <p className="rounded-md bg-amber-50 p-6 text-amber-800">
            {t("home.empty")}
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((a) => {
              let title = a.slug;
              try { title = t(`articles.${a.slug}.title`); } catch { /* missing */ }
              let description = "";
              try { description = t(`articles.${a.slug}.description`); } catch { /* missing */ }
              let catLabel: string = a.category;
              try { catLabel = t(`category.${a.category}`); } catch { /* missing */ }
              const imgSrc = a.ogImage && a.ogImage !== "auto"
                ? `${a.ogImage}-${locale}.png`
                : null;

              return (
                <li key={a.slug}>
                  <Link
                    href={`/articles/${a.slug}`}
                    className="group flex flex-col rounded-xl border border-slate-200 overflow-hidden hover:border-brand-500 hover:shadow-md transition-all duration-200"
                  >
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
                        <CategoryPlaceholder category={a.category} />
                      )}
                    </div>
                    <div className="p-4">
                      <span className="text-xs font-medium uppercase tracking-wide text-brand-600">
                        {catLabel}
                      </span>
                      <h2 className="mt-1 font-semibold leading-snug text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                        {title}
                      </h2>
                      {description && (
                        <p className="mt-1 text-sm text-slate-500 line-clamp-2">{description}</p>
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
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-6 py-3 text-sm font-medium hover:border-brand-500 hover:text-brand-600 transition-colors"
            >
              {navArticles} ({articles.length} total) →
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
