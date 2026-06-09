import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { LOCALES } from "@/lib/i18n/locales";
import { Link } from "@/lib/i18n/navigation";
import { listArticlesForLocale } from "@/lib/articles/registry";
import { loadArticleCardMeta } from "@/lib/i18n/loader";
import { CATALOG } from "@/lib/affiliates/catalog";
import { hasApprovedAds } from "@/lib/affiliates/has-ads";
import { getOfferImageUrl } from "@/lib/affiliates/images";
import { CategoryPlaceholder } from "@/components/CategoryPlaceholder";
import { ArticleCardImage } from "@/components/ArticleCardImage";
import { SALE_EVENTS, SALE_EVENT_MAP } from "@/lib/pages/sale-config";
import type { ArticleMeta } from "@/lib/articles/types";
import type { AffiliateOffer } from "@/lib/affiliates/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";
const CATEGORY_ICONS: Record<string,string> = { fitness:"🏋️",food:"🍳",tech:"💻",beauty:"✨",home:"🏠",fashion:"👗",finance:"💰",travel:"✈️",parenting:"👶",pets:"🐾" };
const TYPE_LABELS: Record<string,string> = { comparison:"Comparison",review:"Review",guide:"Guide" };

function getThumbnail(a: ArticleMeta, locale: string): string | null {
  for (const id of a.offerIds) { const o = CATALOG.find((x) => x.id === id); if (!o) continue; const img = getOfferImageUrl(o); if (img) return img; }
  if (a.ogImage && a.ogImage !== "auto") return `${a.ogImage}-${locale}.png`;
  return null;
}
function firstOffer(a: ArticleMeta): AffiliateOffer | null {
  for (const id of a.offerIds) { const o = CATALOG.find((x) => x.id === id); if (o) return o; } return null;
}

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => SALE_EVENTS.map((e) => ({ locale, event: e.slug })));
}

interface Props { params: Promise<{ locale: string; event: string }> }

export default async function SalePage({ params }: Props) {
  const { locale, event: eventSlug } = await params;
  setRequestLocale(locale);
  const config = SALE_EVENT_MAP[eventSlug];
  if (!config) notFound();
  const t = await getTranslations();

  const all = listArticlesForLocale(locale).filter((a) => hasApprovedAds(a, locale));
  const articles = all
    .filter((a) => config.categories.includes(a.category))
    .sort((a, b) => b.offerIds.length - a.offerIds.length)
    .slice(0, 36);

  // Group by category
  const byCategory: Record<string, ArticleMeta[]> = {};
  for (const a of articles) {
    if (!byCategory[a.category]) byCategory[a.category] = [] as ArticleMeta[];
    byCategory[a.category]!.push(a);
  }
  const cats = config.categories.filter((c) => byCategory[c]?.length);

  const schema = {
    "@context": "https://schema.org", "@type": "ItemList",
    name: config.title, url: `${SITE_URL}/${locale}/sale/${eventSlug}`,
    numberOfItems: articles.length,
    itemListElement: articles.slice(0, 10).map((a, i) => {
      const { title } = loadArticleCardMeta(a.slug, locale);
      return { "@type": "ListItem", position: i + 1, name: title, url: `${SITE_URL}/${locale}/articles/${a.slug}` };
    }),
  };

  const breadcrumb = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Pickly", item: `${SITE_URL}/${locale}/` },
      { "@type": "ListItem", position: 2, name: config.title, item: `${SITE_URL}/${locale}/sale/${eventSlug}/` },
    ],
  };

  let siteName = "Pickly";
  try { siteName = t("site.name"); } catch { /* missing */ }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <div className="mx-auto max-w-5xl px-4 pb-20">
        <nav className="mt-6 flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-600 transition-colors">{siteName}</Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">{config.icon} {config.title}</span>
        </nav>

        <section className="py-10 md:py-14">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 border border-orange-200 px-4 py-1.5 text-xs font-bold text-orange-700">
            {config.icon} Sale guide
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">{config.title}</h1>
          <p className="mt-3 max-w-xl text-base text-slate-500 leading-relaxed">{config.description}</p>
        </section>

        {/* Jump nav */}
        <nav className="mb-10 flex flex-wrap gap-2">
          {cats.map((cat) => {
            let label: string = cat;
            try { label = t(`category.${cat}`); } catch { /* missing */ }
            return (
              <a key={cat} href={`#${cat}`} className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-500 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 transition-colors">
                {CATEGORY_ICONS[cat]} {label}
              </a>
            );
          })}
        </nav>

        {/* Other events */}
        <div className="mb-10 flex flex-wrap gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <span className="text-xs font-semibold text-slate-400 self-center">Other events:</span>
          {SALE_EVENTS.filter((e) => e.slug !== eventSlug).map((e) => (
            <Link key={e.slug} href={`/sale/${e.slug}`} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 hover:border-orange-300 hover:text-orange-700 transition-colors">
              {e.icon} {e.title.replace(" 2026","").replace(" Deals","").replace(" Picks","").replace(" Sale","")}
            </Link>
          ))}
        </div>

        {/* Sections by category */}
        {cats.map((cat) => {
          const catArticles = byCategory[cat] ?? [];
          let catLabel: string = cat;
          try { catLabel = t(`category.${cat}`); } catch { /* missing */ }
          return (
            <section key={cat} id={cat} className="mb-12 scroll-mt-20">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
                <span aria-hidden>{CATEGORY_ICONS[cat]}</span>{catLabel}
              </h2>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {catArticles.map((a) => {
                  const { title, description } = loadArticleCardMeta(a.slug, locale);
                  const imgSrc = getThumbnail(a, locale);
                  const isProductImg = imgSrc && !imgSrc.includes("/og/");
                  const offer = firstOffer(a);
                  return (
                    <li key={a.slug}>
                      <Link href={`/articles/${a.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-brand-200 hover:shadow-lg">
                        <div className="relative shrink-0 overflow-hidden bg-slate-100" style={{ aspectRatio: "4/3" }}>
                          <ArticleCardImage src={imgSrc} alt={title} className={`h-full w-full transition-transform duration-300 group-hover:scale-105 ${isProductImg ? "object-contain p-4" : "object-cover"}`}>
                            <CategoryPlaceholder category={a.category} title={title} />
                          </ArticleCardImage>
                          {offer?.price && <span className="absolute bottom-2.5 right-2.5 rounded-full bg-white/95 border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-800 shadow-sm">{offer.price}</span>}
                        </div>
                        <div className="flex flex-1 flex-col p-4">
                          {offer?.badge && <p className="mb-1 truncate text-[11px] font-semibold text-amber-600">🏆 {offer.badge}</p>}
                          <h3 className="text-sm font-bold leading-snug text-slate-900 group-hover:text-brand-700 transition-colors line-clamp-2">{title}</h3>
                          {description && <p className="mt-1.5 flex-1 text-xs text-slate-400 line-clamp-2">{description}</p>}
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-[11px] text-slate-400">{TYPE_LABELS[a.type] ?? a.type} · {a.offerIds.length} picks</span>
                            <span className="text-[11px] font-semibold text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">Read →</span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale, event } = await params;
  const config = SALE_EVENT_MAP[event];
  if (!config) return {};
  const title = `${config.title} | Pickly`;
  const url = `${SITE_URL}/${locale}/sale/${event}`;
  return {
    title, description: config.description,
    alternates: { canonical: url, languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}/sale/${event}`])) },
    openGraph: { type: "website", title, description: config.description, url, siteName: "Pickly" },
    twitter: { card: "summary_large_image", title, description: config.description },
  };
}
