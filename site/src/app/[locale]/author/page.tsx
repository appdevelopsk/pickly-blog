import { setRequestLocale, getTranslations } from "next-intl/server";
import { LOCALES } from "@/lib/i18n/locales";
import { Link } from "@/lib/i18n/navigation";
import { listArticlesForLocale } from "@/lib/articles/registry";
import { hasApprovedAds } from "@/lib/affiliates/has-ads";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

const CATEGORY_ICONS: Record<string, string> = {
  fitness: "🏋️", food: "🍳", tech: "💻", beauty: "✨", home: "🏠",
  fashion: "👗", finance: "💰", travel: "✈️", parenting: "👶", pets: "🐾",
};

const EXPERTISE = [
  { icon: "🧪", title: "Hands-on testing",        text: "We test products personally or analyze verified purchase reviews from 500+ real users before making any pick." },
  { icon: "📊", title: "Structured criteria",      text: "Each category uses 4–6 specific scoring dimensions. Fitness shoes are judged differently from espresso machines." },
  { icon: "🔄", title: "Regular updates",          text: "Rankings are revisited when manufacturers refresh products or stronger competitors launch. Dates are honest." },
  { icon: "🔍", title: "Transparent affiliates",   text: "We earn a commission when you buy through our links. Rankings reflect real performance — not commission rates." },
];

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AuthorPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const allArticles = listArticlesForLocale(locale).filter((a) => hasApprovedAds(a, locale));

  const categoryCounts: Record<string, number> = {};
  for (const a of allArticles) {
    categoryCounts[a.category] = (categoryCounts[a.category] ?? 0) + 1;
  }
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Pickly Editorial Team",
    url: `${SITE_URL}/${locale}/author`,
    description: "A multilingual product review team testing and comparing consumer goods across 10 categories and 17 languages.",
    sameAs: [
      `${SITE_URL}`,
    ],
    knowsAbout: Object.keys(categoryCounts),
    numberOfEmployees: { "@type": "QuantitativeValue", minValue: 3, maxValue: 10 },
    publishingPrinciples: `${SITE_URL}/${locale}/disclosure`,
  };

  let siteName = "Pickly";
  try { siteName = t("site.name"); } catch { /* missing */ }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />

      <div className="mx-auto max-w-3xl px-4 pb-20">

        {/* Breadcrumb */}
        <nav className="mt-6 flex items-center gap-2 text-xs text-slate-400" aria-label="breadcrumb">
          <Link href="/" className="hover:text-slate-600 transition-colors">{siteName}</Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">Editorial team</span>
        </nav>

        {/* Hero */}
        <section className="py-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-3xl shadow-lg shadow-brand-900/20">
              📋
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 md:text-3xl">
                Pickly Editorial Team
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                {allArticles.length} reviews · 17 languages · 10 categories
              </p>
            </div>
          </div>
          <p className="text-base text-slate-600 leading-relaxed">
            We're a product research team focused on one goal: helping people buy the right thing the first time. We research, test, and compare consumer products across 10 categories — writing in 17 languages so our findings reach readers worldwide.
          </p>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            We don't accept payment for placement. If we can't recommend something honestly, we leave it out. If a product is dominant in its category, it's because our testing confirmed it — not because the brand paid us.
          </p>
        </section>

        {/* How we work */}
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-black text-slate-900">How we work</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {EXPERTISE.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-2xl" aria-hidden>{item.icon}</span>
                  <h3 className="font-bold text-slate-900">{item.title}</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Coverage */}
        <section className="mb-12">
          <h2 className="mb-5 text-xl font-black text-slate-900">What we cover</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {topCategories.map(([cat, count]) => {
              let label = cat;
              try { label = t(`category.${cat}`); } catch { /* missing */ }
              return (
                <Link
                  key={cat}
                  href={`/category/${cat}`}
                  className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-all hover:border-brand-200 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl" aria-hidden>{CATEGORY_ICONS[cat] ?? "📋"}</span>
                    <span className="font-semibold text-slate-800">{label}</span>
                  </div>
                  <span className="text-sm text-slate-400 group-hover:text-brand-600 transition-colors">
                    {count} reviews →
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Disclosure callout */}
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="mb-2 font-bold text-amber-900">Affiliate disclosure</h2>
          <p className="text-sm text-amber-800 leading-relaxed">
            Pickly participates in affiliate programs including Amazon Associates, ShareASale, CJ, Impact, and others. When you buy through our links, we may earn a commission at no extra cost to you. This funds our research. Rankings are never influenced by affiliate rates.
          </p>
          <Link
            href="/disclosure"
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-amber-700 hover:text-amber-900 transition-colors"
          >
            Full disclosure policy →
          </Link>
        </section>

      </div>
    </>
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const title = "Pickly Editorial Team | About Our Reviews";
  const description = "Meet the Pickly editorial team — how we test products, our scoring criteria, and our affiliate disclosure policy.";
  const canonicalUrl = `${SITE_URL}/${locale}/author`;
  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}/author`])),
    },
    openGraph: { type: "profile", title, description, url: canonicalUrl, siteName: "Pickly" },
    twitter: { card: "summary", title, description },
  };
}
