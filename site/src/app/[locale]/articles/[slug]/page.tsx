import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { LOCALES, DEFAULT_LOCALE, inferMarketFromLocale, isIndexedLocale } from "@/lib/i18n/locales";
import { listArticles, getArticle, getAdjacentArticles } from "@/lib/articles/registry";
import { isDeindexed } from "@/lib/articles/deindexed-slugs";
import { getVerifiedSpecs } from "@/lib/articles/specs";
import { CATALOG, pickLink } from "@/lib/affiliates/catalog";
import { hasApprovedAds } from "@/lib/affiliates/has-ads";
import { narrowOffersForLocale } from "@/lib/affiliates/narrow";
import { ArticleBody } from "@/components/articles/ArticleBody";
import { ArticleCrossLinks } from "@/components/articles/ArticleCrossLinks";
import { RelatedArticles } from "@/components/articles/RelatedArticles";
import { ArticleNav } from "@/components/articles/ArticleNav";
import { Comments } from "@/components/articles/Comments";
import { getRelatedCards } from "@/components/articles/related-data";
import { SisterSiteCta } from "@/components/SisterSiteCta";
import { AffiliateClickTracker } from "@/components/AffiliateClickTracker";
import { ScrollProgress } from "@/components/ScrollProgress";
import { BackToTop } from "@/components/BackToTop";
import { loadArticleContent, isArticleBodyTranslated } from "@/lib/i18n/loader";
import { withEnglishGeoAlternates } from "@/lib/i18n/alternates";
import { OG_BASE_URL } from "@/lib/og";
import type { ArticleContent } from "@/lib/articles/types";
import { seoDescription } from "@/lib/seo/meta-description";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

type RawMessages = Record<string, unknown>;

function safeStr(obj: RawMessages, key: string, fallback = ""): string {
  const v = obj[key];
  return typeof v === "string" ? v : fallback;
}

function safeArr<T>(obj: RawMessages, ...keys: string[]): T[] {
  for (const k of keys) {
    if (Array.isArray(obj[k])) return obj[k] as T[];
  }
  return [];
}

function safeObj(obj: RawMessages, key: string): RawMessages | undefined {
  const v = obj[key];
  return v && typeof v === "object" && !Array.isArray(v) ? v as RawMessages : undefined;
}

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of LOCALES) {
    for (const a of listArticles()) {
      if (!a.locales.includes(locale)) continue;
      if (!hasApprovedAds(a, locale)) continue;
      params.push({ locale, slug: a.slug });
    }
  }
  return params;
}

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const meta = getArticle(slug);
  if (!meta) notFound();

  // 未翻訳ロケールは英語版へ送る。
  // ★ここは元々 redirect() を呼んでいたが、**静的エクスポートでは meta-refresh にならず**、
  // NEXT_REDIRECT が処理されずに「HTTP 200 なのに中身は __next_error__ ページ」という
  // ソフト404を書き出していた(全ロケール計1104URL。うちja/de/es/fr/it/pt-BR/ruは
  // インデックス対象なので実害大)。コメントが述べていた本来の意図どおり、
  // meta-refresh を自前で描画する。canonicalとrobotsは generateMetadata 側で英語に寄せる。
  // (2026-07-29)
  // 英語版が生成されないと meta-refresh 先が404になる。英語で出せる場合だけ飛ばし、
  // 出せない場合は(noindexのまま)その場で本文を表示する (2026-08-02)。
  const enAvailable =
    meta.locales.includes(DEFAULT_LOCALE as never) && hasApprovedAds(meta, DEFAULT_LOCALE);
  if (locale !== DEFAULT_LOCALE && !isArticleBodyTranslated(slug, locale) && enAvailable) {
    const target = `/${DEFAULT_LOCALE}/articles/${slug}/`;
    return (
      <>
        <meta httpEquiv="refresh" content={`0; url=${target}`} />
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <p className="text-slate-600">
            Redirecting to the English version…{" "}
            <a href={target} className="underline">
              Continue
            </a>
          </p>
        </div>
      </>
    );
  }

  // Load only this article's messages (not all 575) — keeps RSC payload small
  const msg = await loadArticleContent(slug, locale);

  const rawSections = safeArr<RawMessages>(msg, "sections");
  let sections: ArticleContent["sections"] = [];
  let products: ArticleContent["products"];

  if (rawSections.length > 0) {
    sections = rawSections.map((s) => ({
      heading: safeStr(s, "heading") || safeStr(s, "title"),
      paragraphs: safeArr<string>(s, "paragraphs") || (s.body ? [s.body as string] : []),
      subsections: s.subsections as ArticleContent["sections"][number]["subsections"],
    }));
  }

  // Products: array format [{offerId, badge, review, pros, cons, grade, scores, specs}]
  // or object format {"offerId": {...}}. Parsed regardless of whether the article also
  // has a `sections` array — many comparison articles carry both, and the rich per-product
  // specs table + per-criteria scores (high-value for AI citation & SEO) were previously
  // dropped. Score data was normalized to a 0-5 scale (ArticleBody renders score/5).
  const parseProduct = (offerId: string, p: RawMessages): NonNullable<ArticleContent["products"]>[number] => ({
    offerId,
    badge: safeStr(p, "badge"),
    review: safeStr(p, "review"),
    pros: safeArr<string>(p, "pros"),
    cons: safeArr<string>(p, "cons"),
    grade: safeStr(p, "grade") || undefined,
    scores: safeObj(p, "scores") as Record<string, number> | undefined,
    // 検証済み実spec(出典付き)を最優先。無い商品は従来の未検証specにフォールバック（厳選展開で順次置換）。
    specs: getVerifiedSpecs(offerId, locale) ?? (safeObj(p, "specs") as Record<string, string> | undefined),
  });
  const rawProductsArr = Array.isArray(msg.products) ? msg.products as RawMessages[] : null;
  if (rawProductsArr) {
    products = rawProductsArr.map((p) => parseProduct(safeStr(p, "offerId"), p));
  } else {
    const rawProductsObj = safeObj(msg, "products");
    if (rawProductsObj) {
      products = Object.entries(rawProductsObj).map(([id, p]) => parseProduct(id, p as RawMessages));
    }
  }

  // buyingGuide → synthesized section, only when the article has no explicit sections
  if (rawSections.length === 0) {
    const rawGuide = safeObj(msg, "buyingGuide");
    if (rawGuide) {
      const factors = rawGuide.factors as Array<{ name: string; detail: string }> | undefined;
      if (Array.isArray(factors) && factors.length > 0) {
        sections.push({
          heading: safeStr(rawGuide, "title"),
          paragraphs: rawGuide.intro ? [rawGuide.intro as string] : [],
          subsections: factors.map((f) => ({ heading: f.name, paragraphs: [f.detail] })),
        });
      }
    }
  }

  const faqs: ArticleContent["faqs"] = safeArr<RawMessages>(msg, "faqs", "faq").map((f) => ({
    q: safeStr(f, "q") || safeStr(f, "question"),
    a: safeStr(f, "a") || safeStr(f, "answer"),
  }));

  const lede = safeStr(msg, "lede") || safeStr(msg, "intro");

  const conclusion = msg.conclusion;
  if (conclusion && typeof conclusion === "string") {
    sections.push({ heading: "", paragraphs: [conclusion] });
  }

  const title = safeStr(msg, "title") || slug;
  const description = safeStr(msg, "description");

  const content: ArticleContent = {
    title,
    description: seoDescription(description),
    lede,
    sections,
    faqs,
    products,
    offerNotes: (msg.offerNotes ?? {}) as Record<string, string>,
    methodology: typeof msg.methodology === "string" ? msg.methodology : undefined,
    recommendedFor: Array.isArray(msg.recommendedFor)
      ? (msg.recommendedFor as ArticleContent["recommendedFor"])
      : undefined,
  };

  const market = inferMarketFromLocale(locale);
  const offers = CATALOG
    .filter((o) => meta.offerIds.includes(o.id) && pickLink(o, market) !== null)
    .sort((a, b) => meta.offerIds.indexOf(a.id) - meta.offerIds.indexOf(b.id));

  // 未翻訳ロケールは英語版の複製(meta-refreshで送る)なので、canonicalを英語に寄せて
  // noindexにする。放置すると重複＋言語ミスマッチとして評価される。
  const untranslated = locale !== DEFAULT_LOCALE && !isArticleBodyTranslated(slug, locale);
  // canonical も同じ理由で、英語版が生成される場合だけ英語に寄せる。
  // 生成されない英語URLを canonical にすると 404 を正規URLとして宣言してしまう。
  const enCanonical =
    meta.locales.includes(DEFAULT_LOCALE as never) && hasApprovedAds(meta, DEFAULT_LOCALE);
  const canonicalUrl =
    untranslated && enCanonical
      ? `${SITE_URL}/${DEFAULT_LOCALE}/articles/${slug}/`
      : `${SITE_URL}/${locale}/articles/${slug}/`;
  const ogImageUrl = meta.ogImage
    ? meta.ogImage === "auto"
      ? `${OG_BASE_URL}/og/${slug}-${locale}.png`
      : `${OG_BASE_URL}${meta.ogImage}-${locale}.png`
    : null;

  const AUTHOR_PERSON = {
    "@type": "Person",
    name: "Pickly Editorial",
    url: SITE_URL,
    sameAs: ["https://www.pinterest.com/appdevelopsk/", SITE_URL],
  };

  // client component へ渡す分は、当該ロケールで読まれないロケール文字列を落とす。
  // (RSC ペイロードに全ロケールが載り、英語ページに日本語が混入するため)
  const clientOffers = narrowOffersForLocale(offers, locale, market);

  // JSON-LD: ItemList for comparison articles (ranked product list rich result)
  const itemListSchema = meta.type === "comparison" && offers.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    numberOfItems: offers.length,
    itemListElement: offers.map((o, i) => {
      const product = content.products?.find((p) => p.offerId === o.id);
      const offerName = (o.name as Record<string, string>)[locale] ?? o.name.en ?? o.id;
      const offerDesc = ((o.description as Record<string, string>)[locale] ?? o.description.en) ?? "";
      const imgUrl = o.imageUrl && !o.imageUrl.includes("/images/P/") ? o.imageUrl : undefined;
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          name: offerName,
          url: `${canonicalUrl}#offer-${o.id}`,
          ...(offerDesc ? { description: offerDesc } : {}),
          ...(imgUrl ? { image: imgUrl } : {}),
          ...(o.rating || product?.review ? {
            review: {
              "@type": "Review",
              ...(product?.review ? { reviewBody: product.review } : {}),
              ...(o.rating ? { reviewRating: { "@type": "Rating", ratingValue: o.rating, bestRating: 5, worstRating: 1 } } : {}),
              author: AUTHOR_PERSON,
            },
          } : {}),
        },
      };
    }),
  } : null;

  // JSON-LD: Article + FAQPage + BreadcrumbList
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: seoDescription(description),
    datePublished: meta.publishedAt,
    dateModified: meta.updatedAt,
    url: canonicalUrl,
    ...(ogImageUrl ? { image: ogImageUrl } : {}),
    author: AUTHOR_PERSON,
    publisher: { "@type": "Organization", name: "Pickly", url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.png` } },
    inLanguage: locale,
  };

  const faqSchema = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  } : null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Pickly", item: `${SITE_URL}/${locale}/` },
      { "@type": "ListItem", position: 2, name: "Articles", item: `${SITE_URL}/${locale}/articles/` },
      { "@type": "ListItem", position: 3, name: title, item: canonicalUrl },
    ],
  };

  // 回遊導線用の関連ガイド。インライン（本文中）と末尾グリッドは **別集合** にする。
  // 以前は同じ4件を両方に流していたため、1記事から出るユニーク導線が4本しか無かった。
  // インライン3 + グリッド6 + prev/next 2 = 最大11本まで拡張（2026-08-22）。
  const inlineRelated = getRelatedCards(slug, meta.category, locale, 3);
  const inlineSlugs = inlineRelated.map((c) => c.slug);
  // デスクトップ右サイドバー用（インラインとも末尾グリッドとも別集合）。
  const sidebarRelated = getRelatedCards(slug, meta.category, locale, 4, inlineSlugs);
  const sidebarSlugs = sidebarRelated.map((c) => c.slug);
  const { prev, next } = getAdjacentArticles(slug, meta.category, locale);

  return (
    <>
      <ScrollProgress />
      <BackToTop />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {itemListSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      )}
      <ArticleBody
        meta={meta}
        content={content}
        offers={clientOffers}
        related={inlineRelated}
        sidebarRelated={sidebarRelated}
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {meta.category === "finance" && <SisterSiteCta />}
        <ArticleCrossLinks slug={slug} category={meta.category} />
        <Comments slug={slug} locale={locale} />
        <RelatedArticles
          slug={slug}
          category={meta.category}
          locale={locale}
          exclude={[...inlineSlugs, ...sidebarSlugs]}
          limit={6}
        />
        <ArticleNav prev={prev} next={next} locale={locale} />
      </div>
      <AffiliateClickTracker slug={slug} />
    </>
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const meta = getArticle(slug);
  if (!meta) return {};

  const msg = await loadArticleContent(slug, locale);
  const title = safeStr(msg, "title") || slug;
  const description = safeStr(msg, "description");

  // 未翻訳ロケールは英語版の複製(meta-refreshで送る)なので、canonicalを英語に寄せて
  // noindexにする。放置すると重複＋言語ミスマッチとして評価される。
  const untranslated = locale !== DEFAULT_LOCALE && !isArticleBodyTranslated(slug, locale);
  // 英語版が生成されない記事で canonical を /en/ に寄せると 404 を正規URLとして
  // 宣言してしまう。出せる場合だけ英語に寄せる (2026-08-02)。
  const enCanonical =
    meta.locales.includes(DEFAULT_LOCALE as never) && hasApprovedAds(meta, DEFAULT_LOCALE);
  const canonicalUrl =
    untranslated && enCanonical
      ? `${SITE_URL}/${DEFAULT_LOCALE}/articles/${slug}/`
      : `${SITE_URL}/${locale}/articles/${slug}/`;
  // OG画像は messages/<locale>.json が存在するぶんしか生成されない。未翻訳ロケールは
  // 本文も英語で英語版へ meta-refresh するので、カードも英語版の画像を指す。
  // (以前は存在しない <slug>-<locale>.png を指し、1,058ページで og:image が404だった。
  //  いずれも noindex ページだが、URLを共有された際にカードが壊れる) (2026-08-01)
  const ogLocale = untranslated && enCanonical ? DEFAULT_LOCALE : locale;
  const ogImageUrl = meta.ogImage
    ? meta.ogImage === "auto"
      ? `${OG_BASE_URL}/og/${slug}-${ogLocale}.png`
      : `${OG_BASE_URL}${meta.ogImage}-${ogLocale}.png`
    : null;

  return {
    // ルートlayoutの template "%s | Pickly" を記事ページでは外す(2026-08-01)。
    // タイトルを60字に収めても接尾辞9字ぶんが足されてSERPで切れ、しかも切れる先が
    // 無名ブランド名という最悪の形になっていた。absolute で本文タイトルに全枠を使う。
    title: { absolute: title },
    description: seoDescription(description),
    // 厳選(2026-06-29): 需要ゼロ〜微小の死蔵記事は noindex,follow でサイト全体の
    // 品質評価(AdSense低価値/HCU)から外す。ページ自体はライブ維持(Pinterest用)。可逆。
    ...(isDeindexed(slug) || untranslated ? { robots: { index: false, follow: true } } : {}),
    alternates: {
      canonical: canonicalUrl,
      // hreflang は sitemap.ts と完全に同じ3条件で絞る(2026-08-01)。
      // 以前は isArticleBodyTranslated だけで絞っていたため、
      //   ・hasApprovedAds を通らず生成されないURL → 404 を指す alternate 2,326件
      //   ・isIndexedLocale 外(ar/hi/id/th/vi/tr、layoutでサイト全体noindex)  → 8,695件
      // が宣言され、全33,403件のうち33%が無効という sitemap との三者不一致になっていた。
      languages: (() => {
        const ls = meta.locales.filter(
          (l) =>
            isIndexedLocale(l) &&
            hasApprovedAds(meta, l) &&
            isArticleBodyTranslated(slug, l),
        );
        return withEnglishGeoAlternates({
          ...Object.fromEntries(ls.map((l) => [l, `${SITE_URL}/${l}/articles/${slug}/`])),
          // 英語版が生成されない記事(ja限定など)で x-default を出すと 404 を指す。
          // 実際に出せる場合だけ宣言する (2026-08-02、3記事で発生していた)。
          ...(ls.includes(DEFAULT_LOCALE)
            ? { "x-default": `${SITE_URL}/${DEFAULT_LOCALE}/articles/${slug}/` }
            : {}),
        });
      })(),
    },
    openGraph: {
      type: "article",
      title,
      description: seoDescription(description),
      url: canonicalUrl,
      siteName: "Pickly",
      publishedTime: meta.publishedAt,
      modifiedTime: meta.updatedAt,
      locale,
      ...(ogImageUrl ? {
        images: [{ url: ogImageUrl, width: 1000, height: 1500, alt: title }],
      } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: seoDescription(description),
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
  };
}
