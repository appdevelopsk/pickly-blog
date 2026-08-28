/**
 * 予算バンド(/under/50|100|200|500)の通貨対応。
 *
 * カタログの `price` は「オファーごとに通貨が違う単一フィールド」。
 * USD建て("$29.99" / "~$80" / 素の "28")と JPY建て("¥9,000")が同じ列に混在し、
 * 円建ては moshimo/rakuten の JP専売オファー(markets:["JP"])に付く。
 * つまり円価格は USD価格の「日本語版」ではなく別商品の値段なので、
 * 為替でデータ側を換算してはいけない。換算していいのは**バンドの境界だけ**。
 *
 * 旧 parseUsdPrice は `^\$` と素の数値しか見ず、`~$80`(195件)と`¥8,000`(238件)を
 * 黙って null にしていた。カタログ1,486件のうち433件(29%)が /under/* から
 * 不可視だった (2026-08-28)。
 */

export type Currency = "USD" | "JPY";

export interface ParsedPrice {
  amount: number;
  currency: Currency;
}

/**
 * 価格文字列を通貨付きで解釈する。
 * 対応: "$29.99" / "$1,299" / "~$80" / "約$80" / "29.99" / "¥9,000" / "¥430/月"
 * 非対応(意図的に null): "€5/月", "5.24% APR" — 予算バンドの対象外。
 */
export function parsePrice(price: string | undefined): ParsedPrice | null {
  if (!price) return null;
  const s = price.trim();

  // 円建て。"¥9,000" / "¥430/月" / 全角￥
  const mYen = s.match(/^[~約]?\s*[¥￥]\s*([0-9,]+(?:\.[0-9]+)?)/);
  if (mYen) return { amount: parseFloat(mYen[1]!.replace(/,/g, "")), currency: "JPY" };

  // ドル建て。先頭の "~"(約) を許容する。US$ 表記にも耐える。
  // 他通貨の $ 記号(R$/NT$/A$)は先頭一致しないので自然に落ちる。
  const mDollar = s.match(/^[~約]?\s*(?:US)?\$\s*([0-9,]+(?:\.[0-9]+)?)/);
  if (mDollar) return { amount: parseFloat(mDollar[1]!.replace(/,/g, "")), currency: "USD" };

  // 記号なしの素の数値は USD (catalog-additions がこの形で入れている)
  const mNumeric = s.match(/^([0-9]+(?:\.[0-9]+)?)$/);
  if (mNumeric) return { amount: parseFloat(mNumeric[1]!), currency: "USD" };

  return null;
}

export const VALID_BUDGETS = ["50", "100", "200", "500"] as const;
export type Budget = (typeof VALID_BUDGETS)[number];

/**
 * バンドごとの通貨別しきい値。
 * JPY側はユーザー指定の梯子(5,000 / 10,000 / 30,000 / 50,000円)。
 * 為替の厳密な等価ではなく「日本の読者にとって切りのいい価格帯」を優先している。
 */
export const BUDGET_THRESHOLDS: Record<Budget, Record<Currency, number>> = {
  "50":  { USD: 50,  JPY: 5000 },
  "100": { USD: 100, JPY: 10000 },
  "200": { USD: 200, JPY: 30000 },
  "500": { USD: 500, JPY: 50000 },
};

/** その価格がバンドに収まるか。通貨をまたいだ比較はしない。 */
export function fitsBudget(p: ParsedPrice, budget: Budget): boolean {
  return p.amount < BUDGET_THRESHOLDS[budget][p.currency];
}

/** ロケール別の表示通貨。未定義のロケールは USD 表示のまま。 */
const LOCALE_CURRENCY: Record<string, Currency> = {
  ja: "JPY",
};

export function currencyForLocale(locale: string): Currency {
  return LOCALE_CURRENCY[locale] ?? "USD";
}

/**
 * バンド境界の「数値だけ」を表示形式で返す。例: "50" (USD) / "5,000" (JPY)。
 * 通貨記号を付けないのは、messages/*.json の underTitle 等が各言語で
 * 通貨語（"$" / "ドル" / "美元" / "دولار"）を文中に持っているため。
 * ここで記号を足すと "$5,000円" のように二重になる。
 */
export function budgetAmountLabel(budget: Budget, locale: string): string {
  const currency = currencyForLocale(locale);
  return BUDGET_THRESHOLDS[budget][currency].toLocaleString("en-US");
}

/** 単一価格の表示用文字列。オファー自身の通貨で出す(ロケールでは変えない)。 */
export function formatPrice(p: ParsedPrice): string {
  return p.currency === "JPY"
    ? `¥${p.amount.toLocaleString("en-US")}`
    : `$${p.amount}`;
}
