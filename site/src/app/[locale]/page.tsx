import { setRequestLocale, getTranslations } from "next-intl/server";
import { LOCALES } from "@/lib/i18n/locales";
import { Link } from "@/lib/i18n/navigation";
import { CategorySidebar } from "@/components/layout/CategorySidebar";
import { listArticlesForLocale } from "@/lib/articles/registry";
import { loadArticleCardMeta } from "@/lib/i18n/loader";
import { CATALOG } from "@/lib/affiliates/catalog";
import { hasApprovedAds } from "@/lib/affiliates/has-ads";
import { getOfferImageUrl, resizeAmazonImageUrl } from "@/lib/affiliates/images";
import { OG_BASE_URL, DEFAULT_OG_IMAGES } from "@/lib/og";
import { CategoryPlaceholder } from "@/components/CategoryPlaceholder";
import { ArticleCardImage } from "@/components/ArticleCardImage";
import BrandVideo from "@/components/BrandVideo";
import { COMPARISONS } from "@/lib/pages/compare-config";
import { USE_CASES } from "@/lib/pages/usecase-config";
import { OCCASIONS } from "@/lib/pages/gift-config";
import { VALID_BUDGETS, budgetAmountLabel } from "@/lib/affiliates/budget";
import { TAGS } from "@/lib/pages/tag-config";
import type { ArticleMeta } from "@/lib/articles/types";
import type { AffiliateOffer } from "@/lib/affiliates/types";
import { localeAlternates } from "@/lib/i18n/alternates";
import { resolvePrice } from "@/lib/affiliates/price";
import { seoDescription } from "@/lib/seo/meta-description";
import { shortTitle, stripYear } from "@/lib/articles/short-title";

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

// 表示順。記事数ではなく固定順にして、ビルドごとに並びが動かないようにする。
const CATEGORY_ORDER = [
  "food", "fitness", "home", "tech", "beauty",
  "fashion", "travel", "pets", "finance", "parenting",
];

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

  // ── カテゴリ表(価格.com 型) ─────────────────────────────────────────────
  // ★ピル(上位6件)では travel/parenting/pets/finance がトップ本文から漏れていた。
  //   全10カテゴリを常に出し、各カテゴリ直下に品目リンクを更新日順で並べる。
  const DIRECTORY_ITEMS_PER_CATEGORY = 8;
  const byCategory: Record<string, ArticleMeta[]> = {};
  for (const a of articles) {
    (byCategory[a.category] ??= []).push(a);
  }
  // 人気ランキング: /popular と同じ基準(比較商品数の多い順)に揃える。
  const ranking = [...articles]
    .sort((a, b) => b.offerIds.length - a.offerIds.length)
    .slice(0, 10);

  // 新着: 公開日の新しい順。カードでなく1行リストにして密度を上げる。
  // ★素直に日付順だけで切ると、同じ日に一括投入されたカテゴリ(parenting 等)が
  //   12件中9件を占めて「新着」が1カテゴリの羅列になる。カテゴリごとに順番に
  //   拾うラウンドロビンで散らす。
  const newestSorted = [...articles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const newestQueues = new Map<string, ArticleMeta[]>();
  for (const a of newestSorted) {
    const q = newestQueues.get(a.category);
    if (q) q.push(a);
    else newestQueues.set(a.category, [a]);
  }
  const newest: ArticleMeta[] = [];
  while (newest.length < 12) {
    let picked = false;
    for (const q of newestQueues.values()) {
      const next = q.shift();
      if (!next) continue;
      newest.push(next);
      picked = true;
      if (newest.length >= 12) break;
    }
    if (!picked) break;
  }
  // 新着リストに出した記事をカードで二度出さない(価格.com 型は重複を嫌う)。
  const newestSlugs = new Set(newest.map((a) => a.slug));

  const directory = CATEGORY_ORDER.filter((cat) => (byCategory[cat]?.length ?? 0) > 0).map((category) => {
    const list = [...(byCategory[category] ?? [])].sort((a, b) =>
      (b.updatedAt ?? b.publishedAt).localeCompare(a.updatedAt ?? a.publishedAt),
    );
    return {
      category,
      total: list.length,
      items: list.slice(0, DIRECTORY_ITEMS_PER_CATEGORY).map((a) => ({
        slug: a.slug,
        name: shortTitle(loadArticleCardMeta(a.slug, locale).title),
      })),
    };
  });

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
  let navArticles = "Browse all reviews";
  try { heading = t("home.heading"); } catch { /* missing */ }
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

      {/* ── Brand video (17ロケール・フルブリード自動再生) ── */}
      <BrandVideo locale={locale} />

      <div className="mx-auto max-w-6xl px-4 pb-20">
        <div className="gap-8 pt-6 md:pt-8 lg:grid lg:grid-cols-[200px_minmax(0,1fr)]">

          {/* ── 左サイドバー: 全カテゴリ常設(価格.com 同様) ────────────── */}
          {/* 全ページ共通コンポーネントへ切り出し済み(2026-09-13)。
              トップは件数を持っているので counts を渡して数字も出す。 */}
          <CategorySidebar counts={Object.fromEntries(directory.map((d) => [d.category, d.total]))} />

          {/* ── メインカラム ─────────────────────────────────────────── */}
          <main>

        {/* ── Category directory (価格.com 型: カテゴリ×品目の2階層) ── */}
        <section>
          <div className="mb-6 flex items-baseline justify-between gap-3">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
              {heading}
            </h1>
            <span className="shrink-0 text-xs font-medium text-slate-500">
              {tt("home.heroStats", `${articles.length} reviews · 17 languages`, { count: articles.length, languages: 17 })}
            </span>
          </div>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 md:grid-cols-2 lg:grid-cols-3">
            {directory.map(({ category, items, total }) => {
              let label = category;
              try { label = t(`category.${category}`); } catch { /* missing */ }
              return (
                <div key={category} className="bg-white p-4 md:p-5">
                  <Link
                    href={`/category/${category}`}
                    data-related="home-category"
                    className="flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-brand-700"
                  >
                    {CATEGORY_ICONS[category] && <span aria-hidden>{CATEGORY_ICONS[category]}</span>}
                    <span>{label}</span>
                    <span className="text-xs font-medium text-slate-400">({total})</span>
                  </Link>
                  <ul className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5">
                    {items.map((it) => (
                      <li key={it.slug}>
                        <Link
                          href={`/articles/${it.slug}`}
                          data-related="home-directory"
                          className="text-[13px] leading-snug text-slate-600 underline-offset-2 hover:text-brand-700 hover:underline"
                        >
                          {it.name}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link
                        href={`/category/${category}`}
                        data-related="home-directory-more"
                        className="text-[13px] font-semibold leading-snug text-brand-600 hover:text-brand-700"
                      >
                        {tt("pages.viewAll", "View all →")}
                      </Link>
                    </li>
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 人気ランキング + 新着(価格.com 型の2枠並び) ───────────── */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2">

          {/* 人気ランキング */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h2 className="text-base font-black text-slate-900">
                🏆 {tt("home.popularTitle", "Most popular")}
              </h2>
              <Link href="/popular" data-related="home-ranking-more" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                {tt("pages.viewAll", "View all →")}
              </Link>
            </div>
            <ol className="space-y-1">
              {ranking.map((a, i) => {
                const { title, catLabel } = getArticleText(a);
                return (
                  <li key={a.slug}>
                    <Link
                      href={`/articles/${a.slug}`}
                      data-related="home-ranking"
                      className="flex items-baseline gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-50"
                    >
                      <span
                        className={`w-5 shrink-0 text-center text-xs font-black ${i < 3 ? "text-brand-600" : "text-slate-400"}`}
                      >
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[13px] text-slate-700">
                        {shortTitle(title)}
                      </span>
                      <span className="hidden shrink-0 text-[11px] text-slate-400 sm:inline">{catLabel}</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* 新着レビュー(リスト形式) */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h2 className="text-base font-black text-slate-900">
                🆕 {tt("pages.newTitle", "New this month")}
              </h2>
              <Link href="/new" data-related="home-newest-more" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                {tt("pages.viewAll", "View all →")}
              </Link>
            </div>
            <ul className="space-y-1">
              {newest.map((a) => {
                const { title, catLabel } = getArticleText(a);
                return (
                  <li key={a.slug}>
                    <Link
                      href={`/articles/${a.slug}`}
                      data-related="home-newest"
                      className="flex items-baseline gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-50"
                    >
                      <span className="min-w-0 flex-1 truncate text-[13px] text-slate-700">
                        {shortTitle(title)}
                      </span>
                      {isNew(a) && (
                        <span className="shrink-0 rounded bg-rose-50 px-1.5 text-[10px] font-bold text-rose-600">
                          NEW
                        </span>
                      )}
                      <span className="hidden shrink-0 text-[11px] text-slate-400 sm:inline">{catLabel}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

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
                  data-related="home-featured"
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
              {gridArticles.filter((a) => !newestSlugs.has(a.slug)).slice(0, 6).map((a) => {
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
                      data-related="home-grid"
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
                          <span className="absolute right-2.5 top-2.5 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-pure shadow-sm">
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
              data-related="home-viewall"
              className="inline-flex items-center gap-2 rounded-full border-2 border-brand-600 px-8 py-3 text-sm font-bold text-brand-600 transition-all hover:bg-brand-600 hover:text-white"
            >
              {navArticles} ({articles.length}) →
            </Link>
          </div>
        )}

        {/* ── こだわり検索(価格.com 型: カードでなくリンク直置き) ───────── */}
        <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-base font-black text-slate-900">{tt("home.moreWays", "More ways to browse")}</h2>
          <dl className="space-y-3">
            {/* 価格帯 — 4段階すべてを出す(従来は /under/100 の1本だけだった) */}
            <div className="flex flex-col gap-1.5 border-b border-slate-100 pb-3 sm:flex-row sm:gap-4">
              <dt className="w-32 shrink-0 text-[13px] font-bold text-slate-500">
                💰 {tt("home.budgetTitle", "Best under $100")}
              </dt>
              <dd className="flex flex-wrap gap-x-3 gap-y-1.5">
                {VALID_BUDGETS.map((b) => (
                  <Link
                    key={b}
                    href={`/under/${b}`}
                    data-related="home-facet-budget"
                    className="text-[13px] text-slate-600 underline-offset-2 hover:text-brand-700 hover:underline"
                  >
                    {locale === "ja"
                      ? `${budgetAmountLabel(b, locale)}円以下`
                      : `< $${budgetAmountLabel(b, locale)}`}
                  </Link>
                ))}
              </dd>
            </div>

            {/* 用途 */}
            <div className="flex flex-col gap-1.5 border-b border-slate-100 pb-3 sm:flex-row sm:gap-4">
              <dt className="w-32 shrink-0 text-[13px] font-bold text-slate-500">
                🎯 {tt("home.purposeTitle", "Browse by purpose")}
              </dt>
              <dd className="flex flex-wrap gap-x-3 gap-y-1.5">
                {USE_CASES.slice(0, 8).map((u) => (
                  <Link
                    key={u.slug}
                    href={`/for/${u.slug}`}
                    data-related="home-facet-purpose"
                    className="text-[13px] text-slate-600 underline-offset-2 hover:text-brand-700 hover:underline"
                  >
                    {stripYear(tt(`usecasePages.${u.slug}.title`, u.title))}
                  </Link>
                ))}
                <Link href="/purpose" data-related="home-facet-more" className="text-[13px] font-semibold text-brand-600 hover:text-brand-700">
                  {tt("pages.viewAll", "View all →")}
                </Link>
              </dd>
            </div>

            {/* 比較 */}
            <div className="flex flex-col gap-1.5 border-b border-slate-100 pb-3 sm:flex-row sm:gap-4">
              <dt className="w-32 shrink-0 text-[13px] font-bold text-slate-500">
                ⚖️ {tt("home.compareTitle", "Head-to-head comparisons")}
              </dt>
              <dd className="flex flex-wrap gap-x-3 gap-y-1.5">
                {COMPARISONS.slice(0, 6).map((c) => (
                  <Link
                    key={c.slug}
                    href={`/compare/${c.slug}`}
                    data-related="home-facet-compare"
                    className="text-[13px] text-slate-600 underline-offset-2 hover:text-brand-700 hover:underline"
                  >
                    {stripYear(tt(`comparePages.${c.slug}.title`, c.title))}
                  </Link>
                ))}
                <Link href="/compare" data-related="home-facet-more" className="text-[13px] font-semibold text-brand-600 hover:text-brand-700">
                  {tt("pages.viewAll", "View all →")}
                </Link>
              </dd>
            </div>

            {/* タグ */}
            <div className="flex flex-col gap-1.5 border-b border-slate-100 pb-3 sm:flex-row sm:gap-4">
              <dt className="w-32 shrink-0 text-[13px] font-bold text-slate-500">
                🏷️ {tt("home.tagsTitle", "Browse by tag")}
              </dt>
              <dd className="flex flex-wrap gap-x-3 gap-y-1.5">
                {TAGS.slice(0, 10).map((tg) => (
                  <Link
                    key={tg.slug}
                    href={`/tag/${tg.slug}`}
                    data-related="home-facet-tag"
                    className="text-[13px] text-slate-600 underline-offset-2 hover:text-brand-700 hover:underline"
                  >
                    {tt(`tagPages.${tg.slug}.label`, tg.label)}
                  </Link>
                ))}
                <Link href="/tags" data-related="home-facet-more" className="text-[13px] font-semibold text-brand-600 hover:text-brand-700">
                  {tt("pages.viewAll", "View all →")}
                </Link>
              </dd>
            </div>

            {/* 特集 */}
            <div className="flex flex-col gap-1.5 sm:flex-row sm:gap-4">
              <dt className="w-32 shrink-0 text-[13px] font-bold text-slate-500">
                ✨ {tt("home.giftsTitle", "Gift guides")}
              </dt>
              <dd className="flex flex-wrap gap-x-3 gap-y-1.5">
                {OCCASIONS.slice(0, 6).map((g) => (
                  <Link
                    key={g.slug}
                    href={`/gifts/${g.slug}`}
                    data-related="home-facet-gift"
                    className="text-[13px] text-slate-600 underline-offset-2 hover:text-brand-700 hover:underline"
                  >
                    {stripYear(tt(`giftPages.${g.slug}.title`, g.title))}
                  </Link>
                ))}
                <Link href="/best-2026" data-related="home-facet-more" className="text-[13px] font-semibold text-brand-600 hover:text-brand-700">
                  {tt("home.bestofTitle", "Best of 2026")} →
                </Link>
              </dd>
            </div>
          </dl>
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
          </main>
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
