import { setRequestLocale, getTranslations } from "next-intl/server";
import { LOCALES } from "@/lib/i18n/locales";
import { Link } from "@/lib/i18n/navigation";
import { listArticlesForLocale } from "@/lib/articles/registry";
import { hasApprovedAds } from "@/lib/affiliates/has-ads";
import { PURPOSE_TAGS } from "@/lib/pages/tag-config";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface Props { params: Promise<{ locale: string }> }

export default async function PurposePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const tt = (key: string, fallback: string, values?: Record<string, string | number>): string => {
    try { return t(key, values); } catch { return fallback; }
  };

  const allArticles = listArticlesForLocale(locale).filter((a) => hasApprovedAds(a, locale));

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20">
      <section className="py-10 md:py-14">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
          {tt("pages.purposeHeading", "Browse by Purpose")}
        </h1>
        <p className="mt-3 max-w-xl text-base text-slate-500 leading-relaxed">
          {tt("pages.purposeLead", "Not sure where to start? Find the right products by what you need them for.")}
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PURPOSE_TAGS.map((tag) => {
          const count = allArticles.filter(
            (a) =>
              tag.categories.includes(a.category) &&
              tag.slugKeywords.some((kw) => a.slug.toLowerCase().includes(kw))
          ).length;

          return (
            <Link
              key={tag.slug}
              href={`/tag/${tag.slug}`}
              className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-brand-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl" aria-hidden>{tag.icon}</span>
                {count > 0 && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                    {tt("pages.reviewsCount", `${count} reviews`, { count })}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 group-hover:text-brand-700 transition-colors">
                  {tt(`tagPages.${tag.slug}.label`, tag.label)}
                </h2>
                <p className="mt-1.5 text-sm text-slate-500 leading-relaxed line-clamp-2">
                  {tt(`tagPages.${tag.slug}.description`, tag.description)}
                </p>
              </div>
              <span className="mt-auto text-xs font-semibold text-brand-600 group-hover:underline">
                {tt("pages.seeRecs", "See recommendations →")}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-16 border-t border-slate-100 pt-10">
        <h2 className="mb-6 text-lg font-black text-slate-900">{tt("pages.otherFilters", "Browse by other filters")}</h2>
        <div className="flex flex-wrap gap-2">
          {(["wireless","smart-home","beginner-friendly","compact","eco-friendly","ergonomic","budget","premium","travel-friendly"] as const).map((slug) => (
            <Link
              key={slug}
              href={`/tag/${slug}`}
              className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              {tt(`tagPages.${slug}.label`, slug.replace(/-/g, " "))}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const title = "Browse by Purpose | Pickly";
  const description = "Find the right products by what you need them for — gifting, workout, skincare, home office, cooking, and more.";
  const url = `${SITE_URL}/${locale}/purpose`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}/purpose`])),
    },
    openGraph: { type: "website", title, description, url, siteName: "Pickly" },
  };
}
