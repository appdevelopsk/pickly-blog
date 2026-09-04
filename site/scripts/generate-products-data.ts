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
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { CATALOG, pickLink } from "@/lib/affiliates/catalog";
import { resolvePrice } from "@/lib/affiliates/price";
import { LOCALES, inferMarketFromLocale, getLocaleDef } from "@/lib/i18n/locales";
import { listArticles } from "@/lib/articles/registry";
import type { Locale } from "@/lib/i18n/locales";

interface ProductEntry {
  id: string;
  /** en 固定 */
  name: string;
  description: string;
  /** 同一idが複数カテゴリに重複登録されているため配列で全部持つ */
  categories: string[];
  imageUrl?: string;
  rating?: number;
  /** resolvePrice の解決済み表示文字列。市場と通貨が合わなければ null */
  price: string | null;
  /** この商品を扱う記事(当該ロケールで公開されているものだけ)。記事ハブ本文の導線。 */
  articles: { slug: string; title: string }[];
}

const OUT_DIR = join(process.cwd(), "public", "data");
const ARTICLES_DIR = join(process.cwd(), "src", "articles");
const MESSAGES_DIR = join(process.cwd(), "src", "messages");

/**
 * 記事タイトルは ArticleMeta に無く src/articles/<slug>/messages/<locale>.json の
 * `title` にしか存在しない。Function 側からは記事JSONを引けない(数千ファイル)ので
 * ここで解決して products-<locale>.json に焼き込む。
 * 当該ロケールのファイルが無い/title が空なら en にフォールバックし、それも無ければ
 * その記事はリンクを出さない(slug をそのまま見出しにすると英語スラッグが露出する)。
 */
const titleCache = new Map<string, string | null>();
function articleTitle(slug: string, locale: string): string | null {
  const key = `${slug}\u0000${locale}`;
  const hit = titleCache.get(key);
  if (hit !== undefined) return hit;
  let title: string | null = null;
  for (const loc of [locale, "en"]) {
    const p = join(ARTICLES_DIR, slug, "messages", `${loc}.json`);
    if (!existsSync(p)) continue;
    try {
      const t = JSON.parse(readFileSync(p, "utf-8")).title;
      if (typeof t === "string" && t.trim() !== "") {
        title = t;
        break;
      }
    } catch {
      // 壊れた記事JSONで生成器ごと落とさない。リンクが1本消えるだけに留める。
    }
  }
  titleCache.set(key, title);
  return title;
}

/**
 * 商品ページのUI文字列。
 *
 * Pages Function は Cloudflare 上で動くので src/messages/<locale>.json を読めない
 * (ビルド出力に入るのは /data/* だけ)。よって共通i18nカタログからここで抜き出して
 * products-<locale>.json に同梱する。Function 側に英語を直書きしないための層であり、
 * prebuild の check-hardcoded-ui.mjs を通すためにも必須。
 *
 * 参照先は既存キーだけに限る(新規キーを17ロケールに足す運用を増やさない):
 *   category.*          カテゴリ名10種
 *   discover.categories 「カテゴリー」→ 事実表のカテゴリ行の見出し
 *   article.related     「関連記事」→ 商品を扱う記事一覧の見出しに流用
 *   article.tablePrice / tableRating  価格・評価のラベル
 *   offer.defaultCta / disclosureNote CTAと開示文
 *   site.name / nav.articles
 */
interface ProductUi {
  siteName: string;
  /** 記事一覧への導線ラベル */
  articles: string;
  /** 「この商品を扱う記事」見出し */
  related: string;
  price: string;
  rating: string;
  /** 事実表のカテゴリ行の見出し */
  categoriesLabel: string;
  cta: string;
  disclosure: string;
  /** カテゴリキー → 現地語ラベル */
  categories: Record<string, string>;
}

function loadUi(locale: string): ProductUi {
  // en は必ず存在する。壊れていたらここで落ちて良い(全ロケール共通の前提が壊れている)。
  const read = (loc: string) => JSON.parse(readFileSync(join(MESSAGES_DIR, `${loc}.json`), "utf-8"));
  const m = read(locale);
  const en = locale === "en" ? m : read("en");
  const pick = (section: string, key: string): string => {
    const v = m?.[section]?.[key];
    if (typeof v === "string" && v.trim() !== "") return v;
    return en[section][key];
  };
  const categories: Record<string, string> = {};
  for (const [k, v] of Object.entries({ ...en.category, ...m.category })) {
    if (typeof v === "string" && v.trim() !== "") categories[k] = v;
  }
  return {
    siteName: pick("site", "name"),
    articles: pick("nav", "articles"),
    related: pick("article", "related"),
    price: pick("article", "tablePrice"),
    rating: pick("article", "tableRating"),
    categoriesLabel: pick("discover", "categories"),
    cta: pick("offer", "defaultCta"),
    disclosure: pick("offer", "disclosureNote"),
    categories,
  };
}

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
    // 同一idが複数カテゴリに重複登録されている(カタログ全体で208件、候補通過後は12件前後)。
    // URLは /<locale>/products/<id> なので1商品1エントリにマージする。
    //   price: 非nullを優先(片方だけ通貨ゲートを通ることが多い)
    //   name / description / imageUrl / rating: 先勝ち(CATALOG宣言順)
    //   categories: 全カテゴリを配列で保持(記事ハブの導線に使う)
    const byId = new Map<string, ProductEntry>();

    for (const o of CATALOG) {
      // 候補判定: 承認済みの実提携リンクが1本もなければページを作らない
      if (pickLink(o, market, { onlyApproved: true, allowFallback: false }) === null) continue;

      const price = resolvePrice(o, locale);
      const prev = byId.get(o.id);
      if (prev) {
        if (!prev.categories.includes(o.category)) prev.categories.push(o.category);
        if (prev.price === null && price !== null) prev.price = price;
        if (prev.description === "" && o.description[locale]) prev.description = o.description[locale];
        if (prev.imageUrl === undefined && o.imageUrl) prev.imageUrl = o.imageUrl;
        if (prev.rating === undefined && o.rating !== undefined) prev.rating = o.rating;
        continue;
      }

      const articles = (reverse.get(o.id) ?? [])
        .filter((a) => a.locales.includes(locale as Locale))
        .map((a) => ({ slug: a.slug, title: articleTitle(a.slug, locale) }))
        .filter((a): a is { slug: string; title: string } => a.title !== null);

      byId.set(o.id, {
        id: o.id,
        name: o.name.en ?? o.id,
        description: o.description[locale] ?? o.description.en ?? "",
        categories: [o.category],
        ...(o.imageUrl ? { imageUrl: o.imageUrl } : {}),
        ...(o.rating !== undefined ? { rating: o.rating } : {}),
        price,
        articles,
      });
    }

    const entries = [...byId.values()];

    const path = join(OUT_DIR, `products-${locale}.json`);
    const def = getLocaleDef(locale);
    const body = JSON.stringify({
      locale,
      dir: def?.dir ?? "ltr",
      ui: loadUi(locale),
      count: entries.length,
      products: entries,
    });
    writeFileSync(path, body);
    summary.push(`${locale}\t${entries.length}\t${body.length}`);
  }

  console.log("locale\tproducts\tbytes");
  for (const line of summary) console.log(line);
}

main();
