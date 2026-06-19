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

/** 商品名から楽天市場の検索アフィリエイトリンクを作る。 */
export function rakutenSearchUrl(query: string): string {
  const q = query.trim();
  if (!q) return `https://hb.afl.rakuten.co.jp/hgc/${RAKUTEN_AFFILIATE_ID}/?pc=${encodeURIComponent("https://www.rakuten.co.jp/")}`;
  const search = `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(q)}/`;
  const enc = encodeURIComponent(search);
  // pc=PC向け / m=モバイル向け（同じ検索結果に飛ばす）
  return `https://hb.afl.rakuten.co.jp/hgc/${RAKUTEN_AFFILIATE_ID}/?pc=${enc}&m=${enc}`;
}
