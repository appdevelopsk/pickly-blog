import { listArticles } from "@/lib/articles/registry";
import { loadArticleCardMeta, isArticleBodyTranslated } from "@/lib/i18n/loader";
import { ogImageUrl } from "@/lib/og";
import { LOCALES, LOCALE_DEFS } from "@/lib/i18n/locales";

export const dynamic = "force-static";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

const CHANNEL_META: Record<string, { title: string; description: string }> = {
  en:      { title: "Pickly — Product Reviews & Comparisons",          description: "Curated product reviews and buyer's guides." },
  ja:      { title: "Pickly — 製品レビュー・比較",                       description: "家電・美容・フィットネス・食品などの比較レビューと購入ガイド。" },
  "zh-CN": { title: "Pickly — 产品评测与比较",                           description: "精选产品评测和购买指南。" },
  "zh-TW": { title: "Pickly — 產品評測與比較",                           description: "精選產品評測和購買指南。" },
  ko:      { title: "Pickly — 제품 리뷰 & 비교",                        description: "엄선된 제품 리뷰와 구매 가이드." },
  es:      { title: "Pickly — Reseñas y comparativas de productos",     description: "Reseñas y guías de compra curadas." },
  "pt-BR": { title: "Pickly — Avaliações e comparações de produtos",    description: "Avaliações e guias de compra selecionados." },
  fr:      { title: "Pickly — Tests et comparatifs produits",           description: "Tests produits et guides d'achat sélectionnés." },
  de:      { title: "Pickly — Produkttests & Vergleiche",               description: "Kuratierte Produkttests und Kaufratgeber." },
  it:      { title: "Pickly — Recensioni e confronti prodotti",         description: "Recensioni e guide all'acquisto selezionate." },
  ru:      { title: "Pickly — Обзоры и сравнения товаров",              description: "Отобранные обзоры товаров и руководства покупателя." },
  ar:      { title: "Pickly — مراجعات ومقارنات المنتجات",               description: "مراجعات المنتجات وأدلة الشراء المنتقاة." },
  hi:      { title: "Pickly — उत्पाद समीक्षाएं और तुलनाएं",             description: "चुनिंदा उत्पाद समीक्षाएं और खरीदारी गाइड।" },
  id:      { title: "Pickly — Ulasan & Perbandingan Produk",            description: "Ulasan produk dan panduan pembelian terkurasi." },
  th:      { title: "Pickly — รีวิวและเปรียบเทียบสินค้า",               description: "รีวิวสินค้าและคู่มือซื้อที่คัดสรรแล้ว" },
  vi:      { title: "Pickly — Đánh giá & So sánh sản phẩm",            description: "Đánh giá sản phẩm và hướng dẫn mua hàng tuyển chọn." },
  tr:      { title: "Pickly — Ürün İncelemeleri & Karşılaştırmaları",  description: "Seçilmiş ürün incelemeleri ve alıcı kılavuzları." },
};

function esc(s: string): string {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c] ?? c),
  );
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const localeDef = LOCALE_DEFS.find((l) => l.code === locale);
  const lang = localeDef?.code ?? "en";
  const ch = CHANNEL_META[locale] ?? CHANNEL_META["en"]!;

  const articles = [...listArticles()]
    .filter((a) => a.locales.includes(locale as never) && isArticleBodyTranslated(a.slug, locale))
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, 50);

  const items = articles
    .map((a) => {
      const { title, description } = loadArticleCardMeta(a.slug, locale);
      const url = `${SITE_URL}/${locale}/articles/${a.slug}/`;
      const date = new Date(a.publishedAt).toUTCString();
      const img = ogImageUrl(a.slug, locale);
      return `    <item>
      <title>${esc(title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${date}</pubDate>
      <description>${esc(description)}</description>
      <enclosure url="${esc(img)}" type="image/png" />
      <media:content url="${esc(img)}" type="image/png" medium="image" width="1000" height="1500" />
      <media:thumbnail url="${esc(img)}" width="1000" height="1500" />
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${esc(ch.title)}</title>
    <link>${SITE_URL}/${locale}/</link>
    <description>${esc(ch.description)}</description>
    <language>${lang}</language>
    <atom:link href="${SITE_URL}/${locale}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
