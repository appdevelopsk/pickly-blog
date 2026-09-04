/**
 * 商品ページ用データ生成器 (build-time)
 *
 * 出力: site/public/data/products-<locale>.json  ×17ロケール
 *   → out/data/ へそのまま同梱され、Pages Function から fetch で読まれる
 *     (`/data/*` は _routes.json の exclude なので静的配信されるが fetch は可能)
 *
 * 設計上の固定点:
 *  - 商品名は **en 固定**(offer.name.en)。カタログの現地語化は en/ja 止まりで、
 *    非en/jaは2%未満しか無いため、名前だけ言語が混ざるのを避ける(案3)。
 *  - description は locale → en のフォールバック。将来ここに翻訳層を足す。
 *  - 価格は **resolvePrice() の解決済み文字列だけ** を載せる。price/priceMin/priceMax の
 *    生フィールドを載せると Function 側で通貨ゲートを再実装する羽目になり必ずズレる。
 *  - 候補判定は pickLink(o, market, { onlyApproved: true, allowFallback: false }) !== null。
 *    allowFallback を既定(true)のままにすると localAmazonFallback が
 *    { approved: true } を無条件で合成するため onlyApproved が効かず、
 *    「提携がある」の意味が壊れる。false を明示すること。
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { CATALOG, pickLink } from "@/lib/affiliates/catalog";
import { resolvePrice } from "@/lib/affiliates/price";
import { LOCALES, inferMarketFromLocale } from "@/lib/i18n/locales";
import { listArticles } from "@/lib/articles/registry";
import type { Locale } from "@/lib/i18n/locales";

interface ProductEntry {
  id: string;
  /** en 固定 */
  name: string;
  description: string;
  category: string;
  imageUrl?: string;
  rating?: number;
  /** resolvePrice の解決済み表示文字列。市場と通貨が合わなければ null */
  price: string | null;
  /** この商品を扱う記事 slug(当該ロケールで公開されているものだけ) */
  articleSlugs: string[];
}

const OUT_DIR = join(process.cwd(), "public", "data");

/** offer id → その offer を扱う記事(slug と公開ロケール) の逆引き */
function buildReverseIndex(): Map<string, { slug: string; locales: Locale[] }[]> {
  const idx = new Map<string, { slug: string; locales: Locale[] }[]>();
  for (const a of listArticles()) {
    for (const offerId of a.offerIds) {
      const bucket = idx.get(offerId);
      const entry = { slug: a.slug, locales: a.locales };
      if (bucket) bucket.push(entry);
      else idx.set(offerId, [entry]);
    }
  }
  return idx;
}

function main() {
  const reverse = buildReverseIndex();
  mkdirSync(OUT_DIR, { recursive: true });

  const summary: string[] = [];
  for (const locale of LOCALES) {
    const market = inferMarketFromLocale(locale);
    const entries: ProductEntry[] = [];

    for (const o of CATALOG) {
      // 候補判定: 承認済みの実提携リンクが1本もなければページを作らない
      if (pickLink(o, market, { onlyApproved: true, allowFallback: false }) === null) continue;

      const articleSlugs = (reverse.get(o.id) ?? [])
        .filter((a) => a.locales.includes(locale as Locale))
        .map((a) => a.slug);

      entries.push({
        id: o.id,
        name: o.name.en ?? o.id,
        description: o.description[locale] ?? o.description.en ?? "",
        category: o.category,
        ...(o.imageUrl ? { imageUrl: o.imageUrl } : {}),
        ...(o.rating !== undefined ? { rating: o.rating } : {}),
        price: resolvePrice(o, locale),
        articleSlugs,
      });
    }

    const path = join(OUT_DIR, `products-${locale}.json`);
    const body = JSON.stringify({ locale, count: entries.length, products: entries });
    writeFileSync(path, body);
    summary.push(`${locale}\t${entries.length}\t${body.length}`);
  }

  console.log("locale\tproducts\tbytes");
  for (const line of summary) console.log(line);
}

main();
