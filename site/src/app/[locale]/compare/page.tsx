import { setRequestLocale, getTranslations } from "next-intl/server";
import { LOCALES } from "@/lib/i18n/locales";
import { Link } from "@/lib/i18n/navigation";
import { COMPARISONS } from "@/lib/pages/compare-config";
import { listArticlesForLocale } from "@/lib/articles/registry";
import { hasApprovedAds } from "@/lib/affiliates/has-ads";
import { localeAlternates } from "@/lib/i18n/alternates";
import { serpTitle } from "@/lib/seo/title";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface Props { params: Promise<{ locale: string }> }

export default async function CompareIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // 詳細ページは compare/[pair] の generateStaticParams で「比較対象2記事のどちらかが
  // そのロケールで出せる場合」のみ生成される。一覧が COMPARISONS 全件を貼っていたため、
  // 生成されない組み合わせへのリンクが 14種125箇所の内部404になっていた (2026-08-01)。
  const availableSlugs = new Set(
    listArticlesForLocale(locale)
      .filter((a) => hasApprovedAds(a, locale))
      .map((a) => a.slug),
  );
  const available = COMPARISONS.filter(
    (c) => availableSlugs.has(c.slugA) || availableSlugs.has(c.slugB),
  );
  const t = await getTranslations();
  const tt = (key: string, fallback: string, values?: Record<string, string | number>): string => {
    try { return t(key, values); } catch { return fallback; }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20">
      <section className="py-10 md:py-14">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-200 px-4 py-1.5 text-xs font-bold text-indigo-700">
          ⚖️ {tt("home.compareTitle", "Head-to-head comparisons")}
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">{tt("pages.compareHeading", "Compare Products")}</h1>
        <p className="mt-3 max-w-xl text-base text-slate-500 leading-relaxed">
          {tt("pages.compareLead", "Not sure which to choose? Our side-by-side comparisons help you pick the right product without the guesswork.")}
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {available.map((c) => (
          <Link key={c.slug} href={`/compare/${c.slug}`}
            className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden>⚖️</span>
              <h2 className="text-sm font-black text-slate-900 group-hover:text-indigo-700 transition-colors leading-snug">{tt(`comparePages.${c.slug}.title`, c.title)}</h2>
            </div>
            <p className="flex-1 text-xs text-slate-500 leading-relaxed line-clamp-3">{tt(`comparePages.${c.slug}.description`, c.description)}</p>
            <span className="text-xs font-semibold text-indigo-600 group-hover:underline">{tt("pages.compareNow", "Compare now →")}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  // ★本文は pages.compareHeading / pages.compareLead を 17 言語で出しているのに、
  //   metadata だけ英語直書きだった。SERP に出るのは metadata の方なので、そこを揃える。
  const t = await getTranslations({ locale });
  const tt = (key: string, fallback: string): string => {
    try { return t(key); } catch { return fallback; }
  };
  const title = tt("pages.compareHeading", "Compare Products");
  const description = tt("pages.compareLead",
    "Side-by-side product comparisons — air fryer vs Instant Pot, robot vacuum vs stick vacuum, and more. Make confident buying decisions.");
  const url = `${SITE_URL}/${locale}/compare`;
  return {
    title: serpTitle(title), description,
    alternates: localeAlternates("/compare", locale),
    openGraph: { type: "website", title, description, url, siteName: "Pickly" },
  };
}
