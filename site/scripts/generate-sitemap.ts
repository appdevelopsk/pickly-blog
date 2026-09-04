/**
 * 商品ページ用の静的 sitemap 群を public/sitemaps/ に生成する。
 *
 * なぜ静的ファイルなのか:
 *   `_routes.json` が *.xml を exclude しているので Functions では sitemap を出せない
 *   (拡張子なしの /<locale>/products/<id> だけが Functions に通る)。
 *   public/ 配下に置けば next build がそのまま out/ へコピーする
 *   (generate-web-stories.ts と同じ手口)。
 *
 * なぜ分割なのか:
 *   掲載対象は INDEXED_LOCALES=11 ロケール分で計 27,367 URL。単一 sitemap は
 *   実測で約29,000URL/12.2MB が上限。alternates を持つと1URLあたりが重いので
 *   ロケール単位に割り、sitemap index から束ねる。
 *
 * hreflang:
 *   alternate 集合は **商品ごと** に違う(products-<locale>.json の `locales`)。
 *   ページ側 metadata (functions/products/[id].ts) と完全に同じ集合を出すこと。
 *   食い違うとクラスタが成立しない(src/lib/i18n/alternates.ts 2026-08-01 の教訓)。
 *   en-GB / en-CA は en の URL へ多重化する(同 2026-08-11)。
 *
 * lastmod:
 *   商品エントリは updatedAt を持たないので出さない。嘘の日付を出すくらいなら
 *   省くのが正しい(src/app/sitemap.ts の INFO_PATHS と同じ判断)。
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { INDEXED_LOCALES, DEFAULT_LOCALE } from "@/lib/i18n/locales";

const ROOT = join(__dirname, "..");
const DATA_DIR = join(ROOT, "public/data");
const OUT_DIR = join(ROOT, "public/sitemaps");
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog";

function esc(s: string): string {
  return String(s ?? "").replace(
    /[<>&'"]/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&#39;", '"': "&quot;" })[c] ?? c,
  );
}

function productUrl(locale: string, id: string): string {
  // Function 側の canonical と1文字も違ってはいけない(末尾スラッシュ必須)。
  return `${SITE_URL}/${locale}/products/${encodeURIComponent(id)}/`;
}

type Entry = { id: string; locales?: string[] };

function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const files: string[] = [];
  const summary: string[] = [];
  let total = 0;

  for (const locale of INDEXED_LOCALES) {
    const doc = JSON.parse(readFileSync(join(DATA_DIR, `products-${locale}.json`), "utf8")) as {
      products: Entry[];
    };
    const urls: string[] = [];
    for (const p of doc.products) {
      const alts = (p.locales ?? []).filter((l) => (INDEXED_LOCALES as string[]).includes(l));
      // 自ロケールが alternate 集合に居ない = そのロケールでは候補不成立。
      // 配信はされる(17ロケール)が noindex なので sitemap には載せない。
      if (!alts.includes(locale)) continue;
      const links = alts.map(
        (l) => `<xhtml:link rel="alternate" hreflang="${esc(l)}" href="${esc(productUrl(l, p.id))}"/>`,
      );
      const xDefault = alts.includes(DEFAULT_LOCALE) ? DEFAULT_LOCALE : alts[0];
      links.push(
        `<xhtml:link rel="alternate" hreflang="x-default" href="${esc(productUrl(xDefault, p.id))}"/>`,
      );
      if (alts.includes(DEFAULT_LOCALE)) {
        for (const geo of ["en-GB", "en-CA"]) {
          links.push(
            `<xhtml:link rel="alternate" hreflang="${geo}" href="${esc(productUrl(DEFAULT_LOCALE, p.id))}"/>`,
          );
        }
      }
      urls.push(`<url><loc>${esc(productUrl(locale, p.id))}</loc>${links.join("")}</url>`);
    }
    const name = `products-${locale}.xml`;
    const body =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">` +
      urls.join("") +
      `</urlset>`;
    writeFileSync(join(OUT_DIR, name), body);
    files.push(name);
    total += urls.length;
    summary.push(`${locale}\t${urls.length}\t${body.length}`);
  }

  const index =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    files.map((f) => `<sitemap><loc>${SITE_URL}/sitemaps/${f}</loc></sitemap>`).join("") +
    `</sitemapindex>`;
  writeFileSync(join(OUT_DIR, "products.xml"), index);

  console.log("locale\turls\tbytes");
  console.log(summary.join("\n"));
  console.log(`total\t${total}`);
}

main();
