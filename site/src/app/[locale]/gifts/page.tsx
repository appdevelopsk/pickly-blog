import { setRequestLocale, getTranslations } from "next-intl/server";
import { LOCALES } from "@/lib/i18n/locales";
import { Link } from "@/lib/i18n/navigation";
import { OCCASIONS } from "@/lib/pages/gift-config";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface Props { params: Promise<{ locale: string }> }

export default async function GiftsIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const tt = (key: string, fallback: string, values?: Record<string, string | number>): string => {
    try { return t(key, values); } catch { return fallback; }
  };

  let siteName = "Pickly";
  try { siteName = t("site.name"); } catch { /* missing */ }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20">
      <nav className="mt-6 flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-slate-600 transition-colors">{siteName}</Link>
        <span>/</span>
        <span className="text-slate-600 font-medium">{tt("home.giftsTitle", "Gift guides")}</span>
      </nav>

      <section className="py-10 md:py-14">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-rose-50 border border-rose-200 px-4 py-1.5 text-xs font-bold text-rose-700">
          🎁 {tt("home.giftsTitle", "Gift guides")}
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
          {tt("pages.giftsSub", "Gift ideas for every occasion")}
        </h1>
        <p className="mt-3 max-w-xl text-base text-slate-500 leading-relaxed">
          Tested, honest gift picks for every occasion — Christmas, birthdays, Mother's Day, and more. No filler, no sponsored placements.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {OCCASIONS.map((o) => (
          <Link
            key={o.slug}
            href={`/gifts/${o.slug}`}
            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-rose-200 hover:shadow-lg"
          >
            <span className="mb-3 text-3xl" aria-hidden>{o.icon}</span>
            <h2 className="mb-2 text-base font-black text-slate-900 group-hover:text-brand-700 transition-colors">
              {tt(`giftPages.${o.slug}.title`, o.title)}
            </h2>
            <p className="flex-1 text-sm text-slate-400 leading-relaxed line-clamp-2">
              {tt(`giftPages.${o.slug}.description`, o.description)}
            </p>
            <p className="mt-4 text-sm font-semibold text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity">
              See picks →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const title = "Gift Guides 2026 | Pickly";
  const description = "Tested gift ideas for every occasion — Christmas, Mother's Day, birthdays, graduations, and more. Honest picks, no filler.";
  const url = `${SITE_URL}/${locale}/gifts`;
  return {
    title, description,
    alternates: { canonical: url, languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}/gifts`])) },
    openGraph: { type: "website", title, description, url, siteName: "Pickly" },
    twitter: { card: "summary_large_image", title, description },
  };
}
