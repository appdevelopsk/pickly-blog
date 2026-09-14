import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { LOCALES } from "@/lib/i18n/locales";
import { Link } from "@/lib/i18n/navigation";
import { CategorySidebar } from "@/components/layout/CategorySidebar";
import { listArticlesForLocale } from "@/lib/articles/registry";
import { loadArticleCardMeta } from "@/lib/i18n/loader";
import { CATALOG } from "@/lib/affiliates/catalog";
import { hasApprovedAds } from "@/lib/affiliates/has-ads";
import { getOfferImageUrl } from "@/lib/affiliates/images";
import { OG_BASE_URL, DEFAULT_OG_IMAGES } from "@/lib/og";
import { CategoryPlaceholder } from "@/components/CategoryPlaceholder";
import { ArticleCardImage } from "@/components/ArticleCardImage";
import { SUBCATEGORIES, SUBCATEGORIES_BY_PARENT, matchesSubcategory } from "@/lib/pages/subcategory-config";
import type { ArticleMeta } from "@/lib/articles/types";
import type { AffiliateOffer } from "@/lib/affiliates/types";
import type { ArticleCategory } from "@/lib/articles/types";
import { localeAlternates } from "@/lib/i18n/alternates";
import { resolvePrice } from "@/lib/affiliates/price";
import { seoDescription } from "@/lib/seo/meta-description";

// 品目ページ(価格.com 型の最下層)。
//
// なぜ作るか(2026-09-14): 品目は 61 件あるのに導線が `?sub=` のクエリだけで、
// 静的エクスポートではクエリはビルド時に落ちる。つまり検索エンジンから見ると
// 61 品目は「存在しないページ」で、手動マッピングした分類情報が回遊にしか
// 効いていなかった。価格.com は品目ごとに実URLを持つのが集客の要なので揃える。
//
// ★描画はカテゴリページと同型にしてある。差分は「記事集合を matchesSubcategory で
//   絞る」ことと「パンくずに品目を足す」ことだけ。ここで独自の見た目を作ると
//   カテゴリ層と品目層で体裁が食い違う。
// ★SubcategoryFilter は置かない。この階層では品目が既に確定しているので、
//   同じ絞り込みを二重に出すと「今どこにいるか」が壊れる。

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

const CATEGORY_ICONS: Record<string, string> = {
  fitness: "🏋️", food: "🍳", tech: "💻", beauty: "✨", home: "🏠",
  fashion: "👗", finance: "💰", travel: "✈️", parenting: "👶", pets: "🐾",
};

const TYPE_LABELS: Record<string, string> = {
  comparison: "Comparison", review: "Review", guide: "Guide",
};

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

// ── Static params ─────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    SUBCATEGORIES.map((s) => ({ locale, category: s.parent, sub: s.slug }))
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ locale: string; category: string; sub: string }>;
}

export default async function SubcategoryPage({ params }: Props) {
  const { locale, category, sub } = await params;
  setRequestLocale(locale);

  const config = SUBCATEGORIES.find((s) => s.slug === sub && s.parent === category);
  if (!config) notFound();

  const t = await getTranslations();
  // ★t() は欠損キーで throw せず空文字を返すので、catch では拾えない。
  const tt = (key: string, fallback: string, values?: Record<string, string | number>): string => {
    const v = t(key, values);
    return v ? v : fallback;
  };

  // 並びは「更新日の新しい順」。REGISTRY の定義順は登録の都合であって読者にとって
  // 意味のある順序ではない(実測で ja 790件中38箇所が日付の逆順。coffee-tea では
  // 最新の3件が38件の中に埋もれ5月の記事が先頭に来ていた)。
  // updatedAt は同日が多いので(coffee-tea は38件で7種類)、同点は slug で tie-break
  // して固定する。入れないと並びがビルドごとに揺れて無意味な差分が出る。
  const articles = listArticlesForLocale(locale)
    .filter((a) => a.category === category)
    .filter((a) => hasApprovedAds(a, locale))
    .filter((a) => matchesSubcategory(a.slug, config))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.slug.localeCompare(b.slug));

  let catLabel = category;
  try { catLabel = t(`category.${category}`); } catch { /* missing */ }
  const subLabel = tt(`subcategory.${config.slug}`, config.label);

  const icon = CATEGORY_ICONS[category] ?? "📋";
  const siblings = (SUBCATEGORIES_BY_PARENT[category as ArticleCategory] ?? [])
    .filter((s) => s.slug !== config.slug);
  // ★{sub} に値を渡すこと。渡さないと空文字が返って全ロケール英語になる。
  const lead = tt(
    "pages.subDesc",
    `Compare the best ${config.label.toLowerCase()} of 2026 — independent reviews, prices, and top picks.`,
    { sub: subLabel },
  );

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: tt("pages.subTitle", `Best ${subLabel} 2026`, { sub: subLabel }),
    description: seoDescription(lead),
    url: `${SITE_URL}/${locale}/category/${category}/${config.slug}/`,
    numberOfItems: articles.length,
    itemListElement: articles.slice(0, 20).map((a, i) => {
      const { title } = loadArticleCardMeta(a.slug, locale);
      return {
        "@type": "ListItem",
        position: i + 1,
        name: title,
        url: `${SITE_URL}/${locale}/articles/${a.slug}`,
      };
    }),
  };

  const breadcrumb = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Pickly", item: `${SITE_URL}/${locale}/` },
      { "@type": "ListItem", position: 2, name: catLabel, item: `${SITE_URL}/${locale}/category/${category}/` },
      { "@type": "ListItem", position: 3, name: subLabel, item: `${SITE_URL}/${locale}/category/${category}/${config.slug}/` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

      <div className="mx-auto max-w-6xl px-4 pb-20">
        <div className="gap-8 pt-2 lg:grid lg:grid-cols-[200px_minmax(0,1fr)]">
          <CategorySidebar active={category} />
          <main>

        {/* ── Breadcrumb ──────────────────────────────── */}
        <nav className="mt-6 flex items-center gap-2 text-xs text-slate-400" aria-label="breadcrumb">
          <Link href="/" className="hover:text-slate-600 transition-colors">
            {t("site.name")}
          </Link>
          <span>/</span>
          <Link href={`/category/${category}`} className="hover:text-slate-600 transition-colors">
            {catLabel}
          </Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">{subLabel}</span>
        </nav>

        {/* ── Hero ────────────────────────────────────── */}
        <section className="py-10 md:py-14">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl" aria-hidden="true">{icon}</span>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                {subLabel}
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                {tt("pages.reviewsLangs", `${articles.length} reviews · 17 languages`, { count: articles.length, languages: 17 })}
              </p>
            </div>
          </div>
          <p className="max-w-2xl text-base text-slate-500 leading-relaxed">
            {lead}
          </p>
        </section>

        {/* ── Articles grid ───────────────────────────── */}
        {articles.length === 0 ? (
          <div className="rounded-xl bg-amber-50 p-8 text-center text-amber-800">
            <p className="font-semibold">{tt("pages.subEmpty", "No articles in this subcategory yet.")}</p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => {
              const { title, description } = loadArticleCardMeta(a.slug, locale);
              const imgSrc = getThumbnail(a, locale);
              const isProductImg = imgSrc && !imgSrc.includes("/og/");
              const offer = getFirstOffer(a);
              const badge = offer?.badge;
              const price = (offer && resolvePrice(offer, locale));
              const picksCount = a.offerIds.length;
              const typeLabel = TYPE_LABELS[a.type] ?? a.type;
              return (
                <li key={a.slug}>
                  <Link
                    href={`/articles/${a.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-brand-200 hover:shadow-lg"
                  >
                    <div
                      className="relative shrink-0 overflow-hidden bg-slate-100"
                      style={{ aspectRatio: "4/3" }}
                    >
                      <ArticleCardImage
                        src={imgSrc}
                        alt={title}
                        className={`h-full w-full transition-transform duration-300 group-hover:scale-105 ${isProductImg ? "object-contain p-4" : "object-cover"}`}
                      >
                        <CategoryPlaceholder category={a.category} title={title} />
                      </ArticleCardImage>
                      {price && (
                        <span className="absolute bottom-2.5 right-2.5 rounded-full bg-white/95 border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-800 shadow-sm">
                          {price}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      {badge && (
                        <p className="mb-1 truncate text-[11px] font-semibold text-amber-600">
                          {badge && !/^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(badge) ? <>🏆 {badge}</> : null}
                        </p>
                      )}
                      <h2 className="text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-brand-700 line-clamp-2">
                        {title}
                      </h2>
                      {description && (
                        <p className="mt-1.5 flex-1 text-xs leading-relaxed text-slate-400 line-clamp-2">
                          {description}
                        </p>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          {tt(`home.type${a.type.charAt(0).toUpperCase()}${a.type.slice(1)}`, typeLabel)} · {tt("home.picks", `${picksCount} picks`, { count: picksCount })}
                        </span>
                        <span className="text-[11px] font-semibold text-brand-600 opacity-0 transition-opacity group-hover:opacity-100">
                          {tt("pages.read", "Read →")}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {/* ── 同じカテゴリの他品目 ─────────────────────
            行き止まりにしない。品目ページは記事数が少ないので、
            隣の品目への横移動が無いと直帰する。 */}
        {siblings.length > 0 && (
          <section className="mt-14 border-t border-slate-200 pt-8">
            <h2 className="mb-4 text-sm font-bold text-slate-900">
              {catLabel}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {siblings.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/category/${category}/${s.slug}`}
                    className="inline-block rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[13px] text-slate-600 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                  >
                    {tt(`subcategory.${s.slug}`, s.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

          </main>
        </div>
      </div>
    </>
  );
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props) {
  const { locale, category, sub } = await params;
  setRequestLocale(locale);

  const config = SUBCATEGORIES.find((s) => s.slug === sub && s.parent === category);
  if (!config) return {};

  const t = await getTranslations();
  const raw = t(`subcategory.${config.slug}`);
  const subLabel = raw ? raw : config.label;

  // ★{sub} は ICU 引数。値を渡さずに t() を呼ぶと空文字が返り、17ロケール全部が
  //   英語フォールバックになる(同じ罠を pages.subFiltered で踏んでいる)。
  //   ここで解決してから使うこと。
  const tt = (key: string, fallback: string, values?: Record<string, string | number>): string => {
    const v = t(key, values);
    return v ? v : fallback;
  };

  const title = tt("pages.subTitle", `Best ${subLabel} 2026`, { sub: subLabel });
  const description = tt(
    "pages.subDesc",
    `Compare the best ${config.label.toLowerCase()} of 2026 — independent reviews, prices, and top picks.`,
    { sub: subLabel },
  );
  const canonicalUrl = `${SITE_URL}/${locale}/category/${category}/${config.slug}/`;

  return {
    title,
    description: seoDescription(description),
    alternates: localeAlternates(`/category/${category}/${config.slug}`, locale),
    openGraph: {
      images: DEFAULT_OG_IMAGES,
      type: "website",
      title,
      description: seoDescription(description),
      url: canonicalUrl,
      siteName: "Pickly",
    },
    twitter: { card: "summary", title, description },
  };
}
