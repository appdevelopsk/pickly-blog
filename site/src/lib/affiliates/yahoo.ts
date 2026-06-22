// scripts/fetch-yahoo.ts が取得した Yahoo!ショッピング商品キャッシュをサイトから読む。
import yahooCache from "./yahoo-cache.json";

type YhEntry = { url: string | null; price: number | null; priceMin?: number | null; priceMax?: number | null; image: string | null; review?: number; reviewCount?: number; name?: string };
const YH = yahooCache as Record<string, YhEntry>;

export interface YahooProduct {
  url: string;
  price: number | null;
  priceMin: number | null;
  priceMax: number | null;
  image: string | null;
  review: number;
  reviewCount: number;
}

function norm(s: string): string { return s.toLowerCase().replace(/[\s　・,，.。:：()（）[\]【】|/_–—-]+/g, ""); }

// 関連性ガード（楽天と同様）。デジタル/サブスクは物販モールで誤マッチするため除外。
const DIGITAL_RE = /\b(vpn|antivirus|anti-virus|password manager|web host|hosting|cloud storage|streaming|software|saas|subscription|email service)\b/i;

export function getYahooMatch(offerId: string, nameEn?: string, nameJa?: string): YahooProduct | null {
  const e = YH[offerId];
  if (!e || !e.url || !e.name) return null;
  if (DIGITAL_RE.test(nameEn ?? "") || DIGITAL_RE.test(nameJa ?? "")) return null;
  const itemNorm = norm(e.name);
  const tokens: string[] = [];
  const enFirst = (nameEn ?? "").trim().split(/\s+/)[0] ?? "";
  if (enFirst.length >= 3) tokens.push(norm(enFirst));
  if (nameJa) { const j = norm(nameJa); if (j.length >= 3) tokens.push(j.slice(0, 5)); }
  if (!tokens.some((t) => t.length >= 3 && itemNorm.includes(t))) return null;
  return { url: e.url, price: e.price, priceMin: e.priceMin ?? null, priceMax: e.priceMax ?? null, image: e.image, review: e.review ?? 0, reviewCount: e.reviewCount ?? 0 };
}
