import { setRequestLocale, getTranslations } from "next-intl/server";
import { LOCALES } from "@/lib/i18n/locales";
import { Link } from "@/lib/i18n/navigation";
import { BRANDS } from "@/lib/pages/brand-config";
import { listArticlesForLocale } from "@/lib/articles/registry";
import { CATALOG } from "@/lib/affiliates/catalog";
import { hasApprovedAds } from "@/lib/affiliates/has-ads";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface Props { params: Promise<{ locale: string }> }

export default async function BrandsIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const allArticles = listArticlesForLocale(locale).filter((a) => hasApprovedAds(a, locale));

  const brandsWithCounts = BRANDS.map((b) => {
    const offerIds = new Set(
      CATALOG.filter((o) => b.idPrefixes.some((p) => o.id.startsWith(p))).map((o) => o.id),
    );
    const articleCount = allArticles.filter((a) => a.offerIds.some((id) => offerIds.has(id))).length;
    return { ...b, articleCount, offerCount: offerIds.size };
  }).filter((b) => b.articleCount > 0);

  let siteName = "Pickly";
  try { siteName = t("site.name"); } catch { /* missing */ }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20">
      <nav className="mt-6 flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-slate-600 transition-colors">{siteName}</Link>
        <span>/</span>
        <span className="text-slate-600 font-medium">Brands</span>
      </nav>

      <section className="py-10 md:py-12">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 border border-slate-200 px-4 py-1.5 text-xs font-bold text-slate-600">
          🏷️ Brand reviews
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
          Reviews by brand
        </h1>
        <p className="mt-3 max-w-xl text-base text-slate-500 leading-relaxed">
          Browse our product reviews organized by manufacturer — find out which brands consistently deliver and which ones to skip.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {brandsWithCounts.map((b) => (
          <Link
            key={b.slug}
            href={`/brand/${b.slug}`}
            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-brand-200 hover:shadow-lg"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 group-hover:text-brand-700 transition-colors">
                {b.name}
              </h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500">
                {b.articleCount} reviews
              </span>
            </div>
            <p className="flex-1 text-sm text-slate-400 leading-relaxed line-clamp-2">
              {b.description}
            </p>
            <p className="mt-4 text-sm font-semibold text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
              See {b.name} reviews →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const title = "Product Reviews by Brand 2026 | Pickly";
  const description = "Browse tested product reviews organized by brand — Nike, Dyson, Apple, Philips, Anker, KitchenAid, and more.";
  const url = `${SITE_URL}/${locale}/brands`;
  return {
    title, description,
    alternates: { canonical: url, languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}/brands`])) },
    openGraph: { type: "website", title, description, url, siteName: "Pickly" },
  };
}
