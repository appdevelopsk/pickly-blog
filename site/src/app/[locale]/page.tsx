import { setRequestLocale, getTranslations } from "next-intl/server";
import { LOCALES } from "@/lib/i18n/locales";
import { Link } from "@/lib/i18n/navigation";
import { listArticlesForLocale } from "@/lib/articles/registry";
import { loadArticleCardMeta } from "@/lib/i18n/loader";
import { CATALOG } from "@/lib/affiliates/catalog";
import { hasApprovedAds } from "@/lib/affiliates/has-ads";
import { getOfferImageUrl, resizeAmazonImageUrl } from "@/lib/affiliates/images";
import { OG_BASE_URL, DEFAULT_OG_IMAGES } from "@/lib/og";
import { CategoryPlaceholder } from "@/components/CategoryPlaceholder";
import { ArticleCardImage } from "@/components/ArticleCardImage";
import { COMPARISONS } from "@/lib/pages/compare-config";
import { TAGS } from "@/lib/pages/tag-config";
import type { ArticleMeta } from "@/lib/articles/types";
import type { AffiliateOffer } from "@/lib/affiliates/types";
import { localeAlternates } from "@/lib/i18n/alternates";
import { resolvePrice } from "@/lib/affiliates/price";
import { seoDescription } from "@/lib/seo/meta-description";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getThumbnail(article: ArticleMeta, locale: string): string | null {
  for (const offerId of article.offerIds) {
    const offer = CATALOG.find((o) => o.id === offerId);
    if (!offer) continue;
    const img = getOfferImageUrl(offer);
    if (img) return img;
  }
  if (article.ogImage && article.ogImage !== "auto") return `${OG_BASE_URL}${article.ogImage}-${locale}.png`;
  return null;
}

function getFirstOffer(article: ArticleMeta): AffiliateOffer | null {
  for (const offerId of article.offerIds) {
    const offer = CATALOG.find((o) => o.id === offerId);
    if (offer) return offer;
  }
  return null;
}

function isNew(article: ArticleMeta): boolean {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  return new Date(article.publishedAt) >= cutoff;
}

const TYPE_LABELS: Record<string, string> = {
  comparison: "Comparison",
  review: "Review",
  guide: "Guide",
};

// ── Constants ─────────────────────────────────────────────────────────────────

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

const CATEGORY_ICONS: Record<string, string> = {
  fitness: "🏋️",
  food: "🍳",
  tech: "💻",
  beauty: "✨",
  home: "🏠",
  fashion: "👗",
  finance: "💰",
  travel: "✈️",
  parenting: "👶",
  pets: "🐾",
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface Props {
  params: Promise<{ locale: string }>;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  // ローカライズ済みUI文字列(キー欠落ロケールでも英語フォールバックで壊れない)
  // ★同上。空文字が返るので catch では拾えない。
  const tt = (key: string, fallback: string, values?: Record<string, string | number>): string => {
    const v = t(key, values);
    return v ? v : fallback;
  };
  const typeLabels: Record<string, string> = {
    comparison: tt("home.typeComparison", "Comparison"),
    review: tt("home.typeReview", "Review"),
    guide: tt("home.typeGuide", "Guide"),
  };

  const allArticles = listArticlesForLocale(locale);
  const articles = allArticles.filter((a) => hasApprovedAds(a, locale));
  // Only surface articles that have a real product image — no icon placeholders on the top page
  const withImage = articles.filter((a) => getThumbnail(a, locale) !== null);
  const pool = withImage.length >= 8 ? withImage : articles; // fallback to all if images are scarce
  // 「最近更新した記事」を先頭に出す。
  // ★従来はレジストリの末尾16件(=追加順)固定で、記事を改善しても
  //   トップページからのリンクは一切変わらなかった。更新日順にすることで、
  //   手を入れた記事へ内部リンクが自動で集まり、鮮度もトップに反映される。
  const recent = [...pool]
    .sort((a, b) => (b.updatedAt ?? b.publishedAt).localeCompare(a.updatedAt ?? a.publishedAt))
    .slice(0, 16);
  const [featured, ...gridArticles] = recent;

  const categoryCounts: Record<string, number> = {};
  for (const a of allArticles) {
    categoryCounts[a.category] = (categoryCounts[a.category] ?? 0) + 1;
  }
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([cat]) => cat);

  const orgSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "Pickly",
        url: SITE_URL,
        description: seoDescription(tt("home.siteDesc", "Curated reviews and comparisons across 17 languages.")),
        publisher: { "@id": `${SITE_URL}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/${locale}/articles/`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Pickly",
        url: SITE_URL,
        description: seoDescription(tt("home.siteDesc", "Curated reviews and comparisons across 17 languages.")),
        sameAs: ["https://www.pinterest.com/appdevelopsk/"],
      },
    ],
  };

  let heading = "Real reviews, no filler.";
  let subheading = "Honest comparisons and buyer's guides across 17 languages.";
  let navArticles = "Browse all reviews";
  try { heading = t("home.heading"); } catch { /* missing */ }
  try { subheading = t("home.subheading"); } catch { /* missing */ }
  try { navArticles = t("nav.articles"); } catch { /* missing */ }

  function getArticleText(a: ArticleMeta) {
    const { title, description } = loadArticleCardMeta(a.slug, locale);
    let catLabel: string = a.category;
    try { catLabel = t(`category.${a.category}`); } catch { /* missing */ }
    return { title, description, catLabel };
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />

      <div className="mx-auto max-w-5xl px-4 pb-20">

        {/* ── Hero ──────────────────────────────────────── */}
        <section className="py-14 text-center md:py-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-500 tracking-wide shadow-sm">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            {tt("home.heroStats", `${articles.length} reviews · 17 languages`, { count: articles.length, languages: 17 })}
          </div>
          <h1 className="mx-auto mb-4 max-w-2xl text-4xl font-black tracking-tight text-slate-900 [word-break:keep-all] md:text-5xl lg:text-6xl">
            {heading}
          </h1>
          <p className="mx-auto max-w-lg text-base leading-relaxed text-slate-500 md:text-lg">
            {subheading}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/ranking"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lg"
            >
              🏆 Rankings →
            </Link>
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:border-brand-300 hover:text-brand-700"
            >
              {navArticles}
            </Link>
          </div>
        </section>

        {/* ── Category pills ────────────────────────────── */}
        {topCategories.length > 0 && (
          <nav className="mb-12 flex flex-wrap justify-center gap-2">
            {topCategories.map((cat) => {
              let label = cat;
              try { label = t(`category.${cat}`); } catch { /* missing */ }
              return (
                <Link
                  key={cat}
                  href={`/category/${cat}`}
                  className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                >
                  {CATEGORY_ICONS[cat] && <span>{CATEGORY_ICONS[cat]}</span>}
                  <span>{label}</span>
                  <span className="text-xs text-slate-500">({categoryCounts[cat]})</span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* ── How we choose products (E-E-A-T / trust) ─────── */}
        {(() => {
          let trustTitle = "";
          let trustIntro = "";
          try { trustTitle = t("home.trustTitle"); } catch { /* missing */ }
          try { trustIntro = t("home.trustIntro"); } catch { /* missing */ }
          if (!trustTitle) return null;
          const items: { titleKey: string; textKey: string; icon: string }[] = [
            { titleKey: "home.trustTestedTitle", textKey: "home.trustTestedText", icon: "🧪" },
            { titleKey: "home.trustCriteriaTitle", textKey: "home.trustCriteriaText", icon: "📊" },
            { titleKey: "home.trustDisclosureTitle", textKey: "home.trustDisclosureText", icon: "🔍" },
            { titleKey: "home.trustUpdatedTitle", textKey: "home.trustUpdatedText", icon: "🔄" },
          ];
          return (
            <section className="mb-12 rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-8">
              <h2 className="text-xl font-bold text-slate-900">{trustTitle}</h2>
              <p className="mt-2 text-sm text-slate-600">{trustIntro}</p>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                {items.map((it) => {
                  let title = ""; let text = "";
                  try { title = t(it.titleKey); } catch { /* missing */ }
                  try { text = t(it.textKey); } catch { /* missing */ }
                  if (!title) return null;
                  return (
                    <div key={it.titleKey}>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                        <span aria-hidden>{it.icon}</span>
                        {title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600 leading-relaxed">{text}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })()}

        {/* ── Content ───────────────────────────────────── */}
        {recent.length === 0 ? (
          <p className="rounded-xl bg-amber-50 p-6 text-amber-800">{t("home.empty")}</p>
        ) : (
          <>
            {/* ── Featured card ── */}
            {featured && (() => {
              const { title, description, catLabel } = getArticleText(featured);
              const imgSrcRaw = getThumbnail(featured, locale);
              const imgSrc = imgSrcRaw ? resizeAmazonImageUrl(imgSrcRaw, 800) : null;
              const isProductImg = imgSrc && !imgSrc.includes("/og/");
              const offer = getFirstOffer(featured);
              const rawBadge = offer?.badge;
                const badge = rawBadge && /^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(rawBadge) ? null : rawBadge; // 生スラッグ(top-pick等)は非表示
              const price = (offer && resolvePrice(offer, locale));
              const typeLabel = typeLabels[featured.type] ?? featured.type;
              const picksCount = featured.offerIds.length;
              return (
                <Link
                  href={`/articles/${featured.slug}`}
                  className="group mb-5 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-brand-200 hover:shadow-xl sm:flex-row"
                >
                  {/* Image */}
                  <div
                    className="relative shrink-0 overflow-hidden bg-slate-100 sm:w-2/5"
                    style={{ aspectRatio: isProductImg ? "1/1" : "3/2" }}
                  >
                    <ArticleCardImage
                      src={imgSrc}
                      alt={title}
                      priority
                      className={`h-full w-full transition-transform duration-500 group-hover:scale-105 ${isProductImg ? "object-contain p-6" : "object-cover"}`}
                    >
                      <CategoryPlaceholder category={featured.category} title={title} />
                    </ArticleCardImage>
                    {/* Category badge */}
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                      {CATEGORY_ICONS[featured.category] ?? ""} {catLabel}
                    </span>
                    {/* Price chip */}
                    {price && (
                      <span className="absolute bottom-3 right-3 rounded-full bg-white/95 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-800 shadow-sm">
                        from {price}
                      </span>
                    )}
                  </div>
                  {/* Text */}
                  <div className="flex flex-1 flex-col justify-center p-6 sm:p-8">
                    {/* Type + picks meta */}
                    <div className="mb-3 flex items-center gap-2">
                      <span className="rounded-full bg-brand-50 border border-brand-200 px-2.5 py-0.5 text-[11px] font-bold text-brand-700 uppercase tracking-wide">
                        {tt("home.featured", "Featured")}
                      </span>
                      <span className="text-xs text-slate-500">{typeLabel} · {tt("home.picks", `${picksCount} picks`, { count: picksCount })}</span>
                    </div>
                    {/* Editor badge */}
                    {badge && (
                      <p className="mb-1.5 text-xs font-semibold text-amber-600">
                        🏆 {badge}
                      </p>
                    )}
                    <h2 className="mb-3 text-xl font-black leading-snug text-slate-900 transition-colors group-hover:text-brand-700 sm:text-2xl">
                      {title}
                    </h2>
                    {description && (
                      <p className="text-sm leading-relaxed text-slate-500 line-clamp-3">
                        {description}
                      </p>
                    )}
                    <p className="mt-5 text-sm font-semibold text-brand-600 group-hover:underline">
                      {tt("home.readReview", "Read review →")}
                    </p>
                  </div>
                </Link>
              );
            })()}

            {/* ── Article grid ── */}
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gridArticles.slice(0, 12).map((a) => {
                const { title, description, catLabel } = getArticleText(a);
                const imgSrcRaw = getThumbnail(a, locale);
                const imgSrc = imgSrcRaw ? resizeAmazonImageUrl(imgSrcRaw) : null;
                const isProductImg = imgSrc && !imgSrc.includes("/og/");
                const offer = getFirstOffer(a);
                const rawBadge = offer?.badge;
                const badge = rawBadge && /^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(rawBadge) ? null : rawBadge; // 生スラッグ(top-pick等)は非表示
                const price = (offer && resolvePrice(offer, locale));
                const picksCount = a.offerIds.length;
                const typeLabel = typeLabels[a.type] ?? a.type;
                const newArticle = isNew(a);
                return (
                  <li key={a.slug}>
                    <Link
                      href={`/articles/${a.slug}`}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-brand-200 hover:shadow-lg"
                    >
                      {/* Thumbnail */}
                      <div className="relative shrink-0 overflow-hidden bg-slate-100" style={{ aspectRatio: "4/3" }}>
                        <ArticleCardImage
                          src={imgSrc}
                          alt={title}
                          className={`h-full w-full transition-transform duration-300 group-hover:scale-105 ${isProductImg ? "object-contain p-4" : "object-cover"}`}
                        >
                          <CategoryPlaceholder category={a.category} title={title} />
                        </ArticleCardImage>
                        {/* Category */}
                        <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700 shadow-sm">
                          {catLabel}
                        </span>
                        {/* NEW badge */}
                        {newArticle && (
                          <span className="absolute right-2.5 top-2.5 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                            NEW
                          </span>
                        )}
                        {/* Price chip */}
                        {price && (
                          <span className="absolute bottom-2.5 right-2.5 rounded-full bg-white/95 border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-800 shadow-sm">
                            {price}
                          </span>
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex flex-1 flex-col p-4">
                        {/* Editor badge */}
                        {badge && (
                          <p className="mb-1 truncate text-[11px] font-semibold text-amber-600">
                            🏆 {badge}
                          </p>
                        )}
                        <h2 className="text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-brand-700 line-clamp-2">
                          {title}
                        </h2>
                        {description && (
                          <p className="mt-1.5 flex-1 text-xs leading-relaxed text-slate-500 line-clamp-2">
                            {description}
                          </p>
                        )}
                        {/* Footer meta */}
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500">
                            {typeLabel} · {tt("home.picks", `${picksCount} picks`, { count: picksCount })}
                          </span>
                          <span className="text-[11px] font-semibold text-brand-600 opacity-0 transition-opacity group-hover:opacity-100">
                            {tt("home.read", "Read →")}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {/* ── View all CTA ──────────────────────────────── */}
        {articles.length > 13 && (
          <div className="mt-14 text-center">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 rounded-full border-2 border-brand-600 px-8 py-3 text-sm font-bold text-brand-600 transition-all hover:bg-brand-600 hover:text-white"
            >
              {navArticles} ({articles.length}) →
            </Link>
          </div>
        )}

        {/* ── Ways to browse ────────────────────────────── */}
        <section className="mt-16 border-t border-slate-100 pt-12">
          <h2 className="mb-6 text-xl font-black text-slate-900">{tt("home.moreWays", "More ways to browse")}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* By Purpose */}
            <Link href="/purpose" className="group flex items-start gap-4 rounded-2xl border border-brand-100 bg-brand-50 p-5 transition-all hover:border-brand-300 hover:shadow-md">
              <span className="shrink-0 text-2xl" aria-hidden>🎯</span>
              <div>
                <p className="mb-1 font-black text-slate-900 group-hover:text-brand-700 transition-colors">{tt("home.purposeTitle", "Browse by purpose")}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{tt("home.purposeDesc", "Gifting · Workout · Skincare · Home office · Cooking · Sleep and more")}</p>
              </div>
            </Link>
            {/* Compare */}
            <Link href="/compare" className="group flex items-start gap-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-5 transition-all hover:border-indigo-300 hover:shadow-md">
              <span className="shrink-0 text-2xl" aria-hidden>⚖️</span>
              <div>
                <p className="mb-1 font-black text-slate-900 group-hover:text-indigo-700 transition-colors">{tt("home.compareTitle", "Head-to-head comparisons")}</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {tt("home.compareMore", `${COMPARISONS.slice(0, 2).map((c) => tt(`comparePages.${c.slug}.title`, c.title)).join(" · ")} and ${COMPARISONS.length - 2} more`, { list: COMPARISONS.slice(0, 2).map((c) => tt(`comparePages.${c.slug}.title`, c.title)).join(" · "), count: COMPARISONS.length - 2 })}
                </p>
              </div>
            </Link>
            {/* Gift guides */}
            <Link href="/gifts" className="group flex items-start gap-4 rounded-2xl border border-pink-100 bg-pink-50 p-5 transition-all hover:border-pink-300 hover:shadow-md">
              <span className="shrink-0 text-2xl" aria-hidden>🎁</span>
              <div>
                <p className="mb-1 font-black text-slate-900 group-hover:text-pink-700 transition-colors">{tt("home.giftsTitle", "Gift guides")}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{tt("home.giftsDesc", "For every occasion — birthday, anniversary, holiday, and more")}</p>
              </div>
            </Link>
            {/* Tags */}
            <Link href="/tags" className="group flex items-start gap-4 rounded-2xl border border-teal-100 bg-teal-50 p-5 transition-all hover:border-teal-300 hover:shadow-md">
              <span className="shrink-0 text-2xl" aria-hidden>🏷️</span>
              <div>
                <p className="mb-1 font-black text-slate-900 group-hover:text-teal-700 transition-colors">{tt("home.tagsTitle", "Browse by tag")}</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {tt("home.tagsMore", `${TAGS.slice(0, 4).map((x) => tt(`tagPages.${x.slug}.label`, x.label)).join(" · ")} and more`, { list: TAGS.slice(0, 4).map((x) => tt(`tagPages.${x.slug}.label`, x.label)).join(" · ") })}
                </p>
              </div>
            </Link>
            {/* Budget */}
            <Link href="/under/100" className="group flex items-start gap-4 rounded-2xl border border-green-100 bg-green-50 p-5 transition-all hover:border-green-300 hover:shadow-md">
              <span className="shrink-0 text-2xl" aria-hidden>💰</span>
              <div>
                <p className="mb-1 font-black text-slate-900 group-hover:text-green-700 transition-colors">{tt("home.budgetTitle", "Best under $100")}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{tt("home.budgetDesc", "Max value, minimal spend — also available: under $50, $200, $500")}</p>
              </div>
            </Link>
            {/* Best of 2026 */}
            <Link href="/best-2026" className="group flex items-start gap-4 rounded-2xl border border-amber-100 bg-amber-50 p-5 transition-all hover:border-amber-300 hover:shadow-md">
              <span className="shrink-0 text-2xl" aria-hidden>✨</span>
              <div>
                <p className="mb-1 font-black text-slate-900 group-hover:text-amber-700 transition-colors">{tt("home.bestofTitle", "Best of 2026")}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{tt("home.bestofDesc", "Our top picks for the year, organized by category")}</p>
              </div>
            </Link>
            {/* Popular */}
            <Link href="/popular" className="group flex items-start gap-4 rounded-2xl border border-purple-100 bg-purple-50 p-5 transition-all hover:border-purple-300 hover:shadow-md">
              <span className="shrink-0 text-2xl" aria-hidden>🏆</span>
              <div>
                <p className="mb-1 font-black text-slate-900 group-hover:text-purple-700 transition-colors">{tt("home.popularTitle", "Most popular")}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{tt("home.popularDesc", "The reviews readers keep coming back to")}</p>
              </div>
            </Link>
          </div>
        </section>

        {/* ── Trust strip ───────────────────────────────── */}
        <div className="mt-20 flex flex-wrap justify-center gap-8 border-t border-slate-100 pt-10 text-center">
          {[
            { num: articles.length.toString(), label: tt("home.statReviews", "Curated reviews") },
            { num: "17", label: tt("home.statLanguages", "Languages") },
            { num: "5+", label: tt("home.statAsps", "ASPs monitored") },
          ].map(({ num, label }) => (
            <div key={label}>
              <p className="text-3xl font-black text-slate-900">{num}</p>
              <p className="mt-0.5 text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const articles = listArticlesForLocale(locale);

  // ★site.name だけを返すと root layout の `%s | Pickly` が付いて
  //   <title> が「Pickly | Pickly」になっていた(全17ロケール)。
  //   absolute でテンプレートを外し、ロケールごとの見出しを添える (2026-08-04)。
  let siteName = "Pickly";
  let tagline = "Real reviews, no filler.";
  let description = "Curated reviews and comparisons across 17 languages.";
  try { siteName = t("site.name"); } catch { /* missing */ }
  try { tagline = t("home.heading"); } catch { /* missing */ }
  try { description = `${t("home.heading")} ${t("home.subheading")}`; } catch { /* missing */ }
  const title = `${siteName} — ${tagline}`;

  const canonicalUrl = `${SITE_URL}/${locale}/`;

  return {
    title: { absolute: title },
    description: seoDescription(description),
    alternates: {
      canonical: canonicalUrl,
      languages: localeAlternates("", locale).languages,
    },
    openGraph: {
      images: DEFAULT_OG_IMAGES,
      type: "website",
      title,
      description: seoDescription(description),
      url: canonicalUrl,
      siteName: "Pickly",
      locale,
    },
    twitter: { card: "summary", title, description },
    other: { "article:count": String(articles.length) },
  };
}
