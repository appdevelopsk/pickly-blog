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
import { resolvePrice, classify } from "@/lib/affiliates/price";
import { buildAffiliateUrl } from "@/lib/affiliates/asp";
import { rakutenProductMatch } from "@/lib/affiliates/rakuten";
import { getYahooMatch } from "@/lib/affiliates/yahoo";
import type { AffiliateOffer } from "@/lib/affiliates/types";
import { LOCALES, INDEXED_LOCALES, inferMarketFromLocale, getLocaleDef } from "@/lib/i18n/locales";
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
  /**
   * この商品が候補として存在する **INDEXED_LOCALES のうちの** ロケール一覧。
   * 候補判定は市場依存なので商品ごとに違う(実測: 全11揃うのは1,571件、
   * 5ロケールだけが1,636件、ja単独が241件)。hreflang の alternate 集合は
   * ここから作る。全11を無条件に並べると存在しないURLへ alternate を張ることになり、
   * クラスタが成立しない(src/lib/i18n/alternates.ts の2026-08-01の教訓)。
   * Function 側(ページ metadata)と sitemap の両方がこの同じ配列を読むこと。
   */
  locales: string[];
  /**
   * ja(市場JP)限定: Amazon.co.jp / 楽天 / Yahoo! の店舗別価格。
   * US/EU は Amazon 単一で「最安」を名乗れないので出さない。
   * price は表示文字列、amount は比較用の円整数(不明なら null)。
   */
  stores?: StoreOffer[];
  /** stores のうち amount 最小の network。amount を持つ店舗が2つ以上ある時だけ入る */
  cheapest?: StoreOffer["network"] | null;
}

interface StoreOffer {
  network: "amazon-jp" | "rakuten" | "yahoo";
  label: string;
  url: string;
  price: string | null;
  amount: number | null;
}

/**
 * JP 3店舗の店舗名と最安バッジ。ja 専用の文字列なので messages に新規キーを足さず
 * ここで持つ(src/components/AffiliateLink.tsx の storeLabel が「楽天」「Yahoo!」を
 * 直書きしているのと同じ扱い)。
 */
const JP_STORE_LABEL: Record<StoreOffer["network"], string> = {
  "amazon-jp": "Amazon.co.jp",
  rakuten: "楽天市場",
  yahoo: "Yahoo!ショッピング",
};
const JP_CHEAPEST_BADGE = "最安値";

const yen = (n: number) => `¥${n.toLocaleString("ja-JP")}`;

/** 楽天/Yahoo キャッシュの price/priceMin/priceMax を AffiliateLink.tsx と同じ規則で整形 */
function rangePrice(price: number | null, priceMin: number | null, priceMax: number | null): { display: string | null; amount: number | null } {
  if (priceMin != null && priceMax != null && priceMax > priceMin && priceMax <= priceMin * 3) {
    return { display: `${yen(priceMin)}〜${yen(priceMax)}`, amount: priceMin };
  }
  const p = price ?? priceMin;
  return p != null ? { display: `${yen(p)}〜`, amount: p } : { display: null, amount: null };
}

/** resolvePrice の表示文字列から比較用の円整数を取る(JPY 以外は null) */
function yenAmount(display: string | null): number | null {
  if (!display) return null;
  if (classify(display).currency !== "JPY") return null;
  const m = display.replace(/,/g, "").match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

function buildJpStores(o: AffiliateOffer, price: string | null): { stores: StoreOffer[]; cheapest: StoreOffer["network"] | null } {
  const stores: StoreOffer[] = [];
  const link = pickLink(o, "JP", { onlyApproved: true, allowFallback: false });
  if (link && link.network === "amazon-jp") {
    stores.push({
      network: "amazon-jp",
      label: JP_STORE_LABEL["amazon-jp"],
      url: buildAffiliateUrl({ link, productName: o.name.en, market: "JP", category: o.category }),
      price,
      amount: yenAmount(price),
    });
  }
  const rk = rakutenProductMatch(o.id, o.name.en, o.name.ja);
  if (rk) {
    const r = rangePrice(rk.price, rk.priceMin, rk.priceMax);
    stores.push({ network: "rakuten", label: JP_STORE_LABEL.rakuten, url: rk.url, price: r.display, amount: r.amount });
  }
  const yh = getYahooMatch(o.id, o.name.en, o.name.ja);
  if (yh) {
    const r = rangePrice(yh.price, yh.priceMin, yh.priceMax);
    stores.push({ network: "yahoo", label: JP_STORE_LABEL.yahoo, url: yh.url, price: r.display, amount: r.amount });
  }
  const priced = stores.filter((s) => s.amount != null);
  let cheapest: StoreOffer["network"] | null = null;
  if (priced.length >= 2) {
    cheapest = priced.reduce((a, b) => ((b.amount as number) < (a.amount as number) ? b : a)).network;
  }
  return { stores, cheapest };
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
  /** 店舗別価格ブロックの見出し(article.offersHeading) */
  offersHeading: string;
  /** 店舗ボタンの文言(offer.productPage) */
  productPage: string;
  /** ja 限定: 最安バッジ文言 */
  cheapestBadge?: string;
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
    offersHeading: pick("article", "offersHeading"),
    productPage: pick("offer", "productPage"),
    ...(locale === "ja" ? { cheapestBadge: JP_CHEAPEST_BADGE } : {}),
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

/**
 * id → その商品が候補として成立する INDEXED_LOCALES の一覧。
 *
 * 候補判定 pickLink(o, market, ...) は市場(=ロケール)にしか依存しないので、
 * 本体ループより前にこの一枚を作れる。Function は自ロケールのJSONしか読めず、
 * 11ロケール分を毎リクエスト fetch するのは非現実的なので、ここで焼き込む。
 */
function buildIndexedLocaleMap(): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const locale of INDEXED_LOCALES) {
    const market = inferMarketFromLocale(locale);
    for (const o of CATALOG) {
      if (pickLink(o, market, { onlyApproved: true, allowFallback: false }) === null) continue;
      const bucket = map.get(o.id);
      // 同一idの重複登録があるので、同じロケールを二重に積まない。
      if (bucket) {
        if (bucket[bucket.length - 1] !== locale) bucket.push(locale);
      } else {
        map.set(o.id, [locale]);
      }
    }
  }
  return map;
}

function main() {
  const reverse = buildReverseIndex();
  const indexedLocales = buildIndexedLocaleMap();
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
        if (locale === "ja" && (prev.stores?.length ?? 0) === 0) {
          const jp = buildJpStores(o, price);
          if (jp.stores.length) {
            prev.stores = jp.stores;
            prev.cheapest = jp.cheapest;
          }
        }
        continue;
      }

      const jp = locale === "ja" ? buildJpStores(o, price) : null;

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
        locales: indexedLocales.get(o.id) ?? [],
        ...(jp && jp.stores.length ? { stores: jp.stores, cheapest: jp.cheapest } : {}),
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
