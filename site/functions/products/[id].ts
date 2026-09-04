/**
 * 商品ページ (動的) — /<locale>/products/<id>
 *
 * 静的生成しない理由: 商品候補は 11 INDEXED_LOCALES だけで 27,367 URL あり、
 * 配信は 17 ロケールなので静的化すると軽く4万ファイル増える。out/ は既に 18,359
 * ファイルで Cloudflare Pages の 20,000 上限まで余白 1,641 しか無い(2026-09-04 実測)。
 * よって本文は Function で組み、sitemap 掲載だけビルド時に静的出力する。
 *
 * データ源: /data/products-<locale>.json (生成器 scripts/generate-products-data.ts)。
 * `/data/*` は _routes.json の exclude なので静的配信され、Function からは同一
 * オリジンへの fetch で読める。ここが唯一のデータチャネルで、UI文字列も同梱されている
 * (Function からは src/messages/<locale>.json を読めないため)。
 *
 * 注意点:
 *  - 商品名は en 固定(カタログの現地語化が en/ja 止まりのため。生成器のヘッダ参照)。
 *  - 記事リンクが1本も無い商品が相当数ある(ja 500 / en 478 / ar 963)。記事ハブ構成
 *    でも記事0件で成立する本文にすること。
 *  - noindex は X-Robots-Tag と <meta> の両方。INDEXED_LOCALES 以外の6ロケールは
 *    配信はするが index させない(2026-06-19 の判断)。
 *  - onRequestHead を並べて export しないと HEAD が Pages の静的フォールバックに
 *    落ちて 404 になる(2026-08-23 本番実測)。
 */

interface Env {
  ADMIN_KV?: KVNamespace;
}

interface ProductEntry {
  id: string;
  name: string;
  description: string;
  categories: string[];
  imageUrl?: string;
  rating?: number;
  price: string | null;
  articles: { slug: string; title: string }[];
}

interface ProductUi {
  siteName: string;
  articles: string;
  related: string;
  price: string;
  rating: string;
  categoriesLabel: string;
  cta: string;
  disclosure: string;
  categories: Record<string, string>;
}

interface ProductsDoc {
  locale: string;
  dir: string;
  ui: ProductUi;
  count: number;
  products: ProductEntry[];
}

const LOCALES = [
  "en", "ja", "zh-CN", "zh-TW", "ko", "es", "pt-BR", "fr", "de",
  "it", "ru", "ar", "hi", "id", "th", "vi", "tr",
];

// hreflang と sitemap 掲載はこの11ロケールだけ(配信は17ロケール全部)。
const INDEXED_LOCALES = ["en", "ja", "de", "es", "fr", "it", "ru", "pt-BR", "zh-TW", "zh-CN", "ko"];

const CANONICAL_ORIGIN = "https://pickly.blog";

/** locale → html lang 属性。ロケールコードがそのまま BCP47 として妥当。 */
function htmlLang(locale: string): string {
  return locale;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * products-<locale>.json は最大 1.8MB。毎リクエストで JSON.parse すると重いので
 * Cloudflare の Cache API に fetch レスポンスごと載せる(Pages の静的配信自体も
 * キャッシュされるが、同一 colo 内の再取得を確実にするため cf.cacheTtl も付ける)。
 */
const docCache = new Map<string, ProductsDoc>();

async function loadDoc(origin: string, locale: string): Promise<ProductsDoc | null> {
  const hit = docCache.get(locale);
  if (hit) return hit;
  // cf は Cloudflare ランタイム独自の fetch オプション。@cloudflare/workers-types は
  // 未導入 (rakuten.ts も PagesFunction/KVNamespace を素で使っている) なので、
  // 標準 RequestInit の型に無い分だけキャストで通す。
  const res = await fetch(`${origin}/data/products-${locale}.json`, {
    cf: { cacheTtl: 3600, cacheEverything: true },
  } as RequestInit);
  if (!res.ok) return null;
  const doc = (await res.json()) as ProductsDoc;
  docCache.set(locale, doc);
  return doc;
}

function renderNotFound(locale: string, dir: string): Response {
  // 404 本文は最小限。存在しない商品IDにクロールバジェットを使わせない。
  const body = `<!doctype html><html lang="${esc(htmlLang(locale))}" dir="${esc(dir)}"><head>` +
    `<meta charset="utf-8"><meta name="robots" content="noindex"><title>404</title></head><body></body></html>`;
  return new Response(body, {
    status: 404,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "x-robots-tag": "noindex",
    },
  });
}

function render(locale: string, doc: ProductsDoc, p: ProductEntry): string {
  const ui = doc.ui;
  const lang = htmlLang(locale);
  const dir = doc.dir || "ltr";
  const indexed = INDEXED_LOCALES.includes(locale);
  const url = `${CANONICAL_ORIGIN}/${locale}/products/${encodeURIComponent(p.id)}/`;

  const cats = p.categories
    .map((c) => ui.categories[c])
    .filter((c): c is string => typeof c === "string");

  const hreflang = indexed
    ? INDEXED_LOCALES.map(
        (l) =>
          `<link rel="alternate" hreflang="${esc(l)}" href="${CANONICAL_ORIGIN}/${l}/products/${encodeURIComponent(p.id)}/">`,
      ).join("") +
      `<link rel="alternate" hreflang="x-default" href="${CANONICAL_ORIGIN}/en/products/${encodeURIComponent(p.id)}/">`
    : "";

  // JSON-LD。価格は resolvePrice の解決済み表示文字列しか持っていない(通貨ゲートで
  // null になる)ので offers は出さず、name/description/image/rating だけに留める。
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    url,
  };
  if (p.description) ld.description = p.description;
  if (p.imageUrl) ld.image = p.imageUrl;
  if (p.rating !== undefined) {
    ld.aggregateRating = { "@type": "AggregateRating", ratingValue: p.rating, bestRating: 5, ratingCount: 1 };
  }

  const articleList = p.articles.length
    ? `<section><h2>${esc(ui.related)}</h2><ul>` +
      p.articles
        .map(
          (a) =>
            `<li><a href="/${esc(locale)}/articles/${esc(a.slug)}/">${esc(a.title)}</a></li>`,
        )
        .join("") +
      `</ul></section>`
    : "";

  const facts = [
    p.price ? `<dt>${esc(ui.price)}</dt><dd>${esc(p.price)}</dd>` : "",
    p.rating !== undefined ? `<dt>${esc(ui.rating)}</dt><dd>${esc(String(p.rating))}</dd>` : "",
    cats.length ? `<dt>${esc(ui.categoriesLabel)}</dt><dd>${cats.map(esc).join(" / ")}</dd>` : "",
  ]
    .filter(Boolean)
    .join("");

  return (
    `<!doctype html><html lang="${esc(lang)}" dir="${esc(dir)}"><head>` +
    `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">` +
    `<title>${esc(p.name)} | ${esc(ui.siteName)}</title>` +
    (p.description ? `<meta name="description" content="${esc(p.description.slice(0, 300))}">` : "") +
    `<link rel="canonical" href="${url}">` +
    (indexed ? "" : `<meta name="robots" content="noindex,follow">`) +
    hreflang +
    `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>` +
    `</head><body>` +
    `<main><h1>${esc(p.name)}</h1>` +
    (p.imageUrl ? `<img src="${esc(p.imageUrl)}" alt="${esc(p.name)}" loading="lazy">` : "") +
    (p.description ? `<p>${esc(p.description)}</p>` : "") +
    (facts ? `<dl>${facts}</dl>` : "") +
    articleList +
    `<p><a href="/${esc(locale)}/articles/">${esc(ui.articles)}</a></p>` +
    `<p><small>${esc(ui.disclosure)}</small></p>` +
    `</main></body></html>`
  );
}

const handler: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  // /<locale>/products/<id>/ — 末尾スラッシュあり/なしの両方を受ける。
  const parts = url.pathname.split("/").filter(Boolean);
  const locale = parts[0] ?? "";
  const id = decodeURIComponent(parts[2] ?? "");

  if (!LOCALES.includes(locale) || !id) {
    return renderNotFound(locale || "en", "ltr");
  }

  const doc = await loadDoc(url.origin, locale);
  if (!doc) return renderNotFound(locale, "ltr");

  const p = doc.products.find((x) => x.id === id);
  if (!p) return renderNotFound(locale, doc.dir || "ltr");

  const headers: Record<string, string> = {
    "content-type": "text/html; charset=utf-8",
    // 商品データはビルドごとにしか変わらない。CDN に長めに載せて Function 起動を減らす。
    "cache-control": "public, max-age=300, s-maxage=86400",
  };
  if (!INDEXED_LOCALES.includes(locale)) headers["x-robots-tag"] = "noindex, follow";

  const body = render(locale, doc, p);

  // HEAD は本文を捨てるが Content-Length 等は GET と揃える必要があるので、
  // 同じ Response を作ってから body だけ落とす。
  if (context.request.method === "HEAD") {
    return new Response(null, { status: 200, headers });
  }
  return new Response(body, { status: 200, headers });
};

// GET だけ定義すると HEAD は Pages の静的フォールバックに落ちて 404 になる
// (2026-08-23 本番実測)。リンクチェッカ/プレビュー取得が 404 を見てリンク切れ
// 扱いにしないよう HEAD も同じ挙動にする。
export const onRequestGet = handler;
export const onRequestHead = handler;
