import { setRequestLocale, getTranslations } from "next-intl/server";
import { LOCALES } from "@/lib/i18n/locales";
import { Link } from "@/lib/i18n/navigation";
import { TAGS } from "@/lib/pages/tag-config";
import { localeAlternates } from "@/lib/i18n/alternates";
import { serpTitle } from "@/lib/seo/title";
import { DEFAULT_OG_IMAGES } from "@/lib/og";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface Props { params: Promise<{ locale: string }> }

export default async function TagsIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  // ★同上。空文字が返るので catch では拾えない。
  const tt = (key: string, fallback: string, values?: Record<string, string | number>): string => {
    const v = t(key, values);
    return v ? v : fallback;
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20">
      <section className="py-10 md:py-14">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">{tt("pages.tagsHeading", "Browse by Tag")}</h1>
        <p className="mt-3 max-w-xl text-base text-slate-500 leading-relaxed">
          {tt("pages.tagsLead", "Find products by style, need, or feature — from wireless to eco-friendly, budget to premium.")}
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TAGS.map((tag) => (
          <Link key={tag.slug} href={`/tag/${tag.slug}`}
            className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-teal-300 hover:shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden>{tag.icon}</span>
              <h2 className="text-base font-black text-slate-900 group-hover:text-teal-700 transition-colors">{tt(`tagPages.${tag.slug}.label`, tag.label)}</h2>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{tt(`tagPages.${tag.slug}.description`, tag.description)}</p>
            <div className="mt-auto pt-1">
              <span className="text-xs font-semibold text-teal-600 group-hover:underline">{tt("pages.browseTag", `Browse ${tag.label.toLowerCase()} →`, { tag: tt(`tagPages.${tag.slug}.label`, tag.label) })}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  // ★本文は 17 言語で出しているのに metadata だけ英語直書きだった (2026-08-04)。
  const t = await getTranslations({ locale });
  // ★同上。空文字が返るので catch では拾えない。
  const tt = (key: string, fallback: string, values?: Record<string, string | number>): string => {
    const v = t(key, values);
    return v ? v : fallback;
  };
  const title = tt("pages.tagsHeading", "Browse by Tag");
  const description = tt("pages.tagsLead", "Find products by style, need, or feature.");
  const url = `${SITE_URL}/${locale}/tags`;
  return {
    title: serpTitle(title), description,
    alternates: localeAlternates("/tags", locale),
    openGraph: { images: DEFAULT_OG_IMAGES, type: "website", title, description, url, siteName: "Pickly" },
  };
}
