import { setRequestLocale } from "next-intl/server";
import { LOCALES } from "@/lib/i18n/locales";
import { Link } from "@/lib/i18n/navigation";
import { COMPARISONS } from "@/lib/pages/compare-config";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface Props { params: Promise<{ locale: string }> }

export default async function CompareIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20">
      <section className="py-10 md:py-14">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-200 px-4 py-1.5 text-xs font-bold text-indigo-700">
          ⚖️ Head-to-head comparisons
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Compare Products</h1>
        <p className="mt-3 max-w-xl text-base text-slate-500 leading-relaxed">
          Not sure which to choose? Our side-by-side comparisons help you pick the right product without the guesswork.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {COMPARISONS.map((c) => (
          <Link key={c.slug} href={`/compare/${c.slug}`}
            className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden>⚖️</span>
              <h2 className="text-sm font-black text-slate-900 group-hover:text-indigo-700 transition-colors leading-snug">{c.title}</h2>
            </div>
            <p className="flex-1 text-xs text-slate-500 leading-relaxed line-clamp-3">{c.description}</p>
            <span className="text-xs font-semibold text-indigo-600 group-hover:underline">Compare now →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const title = "Product Comparisons | Pickly";
  const description = "Side-by-side product comparisons — air fryer vs Instant Pot, robot vacuum vs stick vacuum, and more. Make confident buying decisions.";
  const url = `${SITE_URL}/${locale}/compare`;
  return {
    title, description,
    alternates: { canonical: url, languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}/compare`])) },
    openGraph: { type: "website", title, description, url, siteName: "Pickly" },
  };
}
