/**
 * 楽天アフィリエイト 検索リンク生成（2026-06-20）。
 *
 * pickly のカタログには楽天の個別商品リンクが無い（2.5万行を手編集しない方針）。
 * その代わり JP 市場では「商品名で楽天市場を検索するアフィリエイトリンク」を
 * 全商品に動的付与する。`hb.afl.rakuten.co.jp/hgc/{affiliateId}/` 経由なので
 * 成果報酬が計上される（302リダイレクト動作確認済み 2026-06-20）。
 *
 * affiliateId は「公開ID」（ユーザーが貼る全アフィリリンクに含まれる）なので
 * 定数で持つ（秘密ではない）。env で上書き可能。RWS API（商品データ取得）は
 * 別系統で、こちらはAPI不要・レート制限なし・ビルド/クライアント両対応。
 */
const RAKUTEN_AFFILIATE_ID =
  process.env.NEXT_PUBLIC_RAKUTEN_AFFILIATE_ID ?? "53e47703.78b3c1ac.53e47704.15517b06";

/** 任意の楽天URLを自前 hgc アフィリリンク（自分のID）で包む。 */
function wrapHgc(targetUrl: string): string {
  const enc = encodeURIComponent(targetUrl);
  return `https://hb.afl.rakuten.co.jp/hgc/${RAKUTEN_AFFILIATE_ID}/?pc=${enc}&m=${enc}`;
}

/** 商品名から楽天市場の検索アフィリエイトリンクを作る（フォールバック）。 */
export function rakutenSearchUrl(query: string): string {
  const q = query.trim();
  if (!q) return wrapHgc("https://www.rakuten.co.jp/");
  return wrapHgc(`https://search.rakuten.co.jp/search/mall/${encodeURIComponent(q)}/`);
}

// RWS で事前取得した実商品データ（scripts/fetch-rakuten.ts が生成）。
// サイトはこのキャッシュを読むだけ＝ビルド時API呼び出し無し。
import rakutenCache from "./rakuten-cache.json";
type RkEntry = {
  itemUrl: string | null;
  price: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
  image: string | null;
  name?: string;
};
const RK = rakutenCache as Record<string, RkEntry>;

export interface RakutenProduct {
  url: string; // 自前hgcで包んだ特定商品リンク（自分のID＝計上正常）
  price: number | null; // 円（関連性最上位）
  priceMin: number | null; // 関連商品の最安（価格レンジ）
  priceMax: number | null; // 関連商品の最高
  image: string | null;
}

function norm(s: string): string {
  return s.toLowerCase().replace(/[\s　・,，.。:：()（）[\]【】|/_–—-]+/g, "");
}

// 物販モール(楽天市場)に実体が無い/不確実なデジタル・サービス商材。
// これらは型番一致が取れず無関係品に誤マッチするため、特定商品リンクを作らず
// 検索リンクのみにする（例: mullvad VPN → 同綴りの書籍に誤マッチを防ぐ）。
const DIGITAL_RE =
  /\b(vpn|antivirus|anti-virus|password manager|web host|hosting|cloud storage|streaming|software|saas|subscription|email service)\b/i;

/**
 * offer に対する楽天の「特定商品」マッチを返す。**関連性ガード**で、
 * マッチ商品名に商品の主要トークン(ブランド/最初の語)が含まれる時だけ採用。
 * 自信が無ければ null（呼び出し側は検索リンクにフォールバック）。
 * → デジタル/別商品への誤リンクを防ぐ（楽天は物販モールで型番一致が不確実なため）。
 */
export function rakutenProductMatch(
  offerId: string,
  nameEn?: string,
  nameJa?: string,
): RakutenProduct | null {
  const e = RK[offerId];
  if (!e || !e.itemUrl || !e.name) return null;
  if (DIGITAL_RE.test(nameEn ?? "") || DIGITAL_RE.test(nameJa ?? "")) return null; // デジタルは検索リンクのみ
  const itemNorm = norm(e.name);
  const tokens: string[] = [];
  const enFirst = (nameEn ?? "").trim().split(/\s+/)[0] ?? "";
  if (enFirst.length >= 3) tokens.push(norm(enFirst));
  if (nameJa) {
    const j = norm(nameJa);
    if (j.length >= 3) tokens.push(j.slice(0, 5));
  }
  const confident = tokens.some((t) => t.length >= 3 && itemNorm.includes(t));
  if (!confident) return null;
  return {
    url: wrapHgc(e.itemUrl),
    price: e.price,
    priceMin: e.priceMin ?? null,
    priceMax: e.priceMax ?? null,
    image: e.image,
  };
}
