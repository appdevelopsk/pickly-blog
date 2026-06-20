/**
 * YouTube Data API v3 — レビュー動画検索クライアント（2026-06-20）。
 *
 * ★サーバー/スクリプト専用（APIキーをクライアントバンドルに混ぜない）。
 *  サイト本体はこれを呼ばず、`scripts/fetch-youtube.ts` が事前取得した
 *  `lib/affiliates/youtube-cache.json`(videoId) を読んで iframe 埋め込み。
 *  → ビルド時のみAPI使用・サイトにキーは出ない。
 *
 * クォータ: search.list = 100 units / 1日10,000 = 約100検索/日。キャッシュで再利用。
 */

const SEARCH = "https://www.googleapis.com/youtube/v3/search";

export interface YoutubeVideo {
  videoId: string;
  title: string;
  channel: string;
}

export interface QuotaExceeded {
  quotaExceeded: true;
}

function apiKey(): string {
  const k = process.env.YOUTUBE_API_KEY ?? "";
  if (!k) throw new Error("YOUTUBE_API_KEY が未設定です");
  return k;
}

/**
 * 「{query} レビュー/review」で検索し、関連性の高い候補を最大 max 件返す。
 * クォータ超過時は {quotaExceeded:true} を返す（呼び出し側で停止判断）。
 */
export async function searchReviewVideos(
  query: string,
  opts: { locale?: string; max?: number; key?: string } = {},
): Promise<YoutubeVideo[] | QuotaExceeded> {
  const locale = opts.locale ?? "ja";
  const term = locale === "ja" ? "レビュー" : "review";
  const params = new URLSearchParams({
    part: "snippet",
    q: `${query} ${term}`,
    type: "video",
    maxResults: String(opts.max ?? 5),
    safeSearch: "strict",
    videoEmbeddable: "true", // 埋め込み可能な動画だけ
    order: "relevance",
    key: opts.key ?? apiKey(),
    ...(locale === "ja" ? { relevanceLanguage: "ja", regionCode: "JP" } : {}),
  });
  const res = await fetch(`${SEARCH}?${params.toString()}`);
  // クォータ超過は 403 または 429 で返る（どちらも graceful 停止）。
  if (res.status === 403 || res.status === 429) {
    const body = await res.text();
    if (/quota/i.test(body)) return { quotaExceeded: true };
    throw new Error(`YouTube ${res.status}: ${body.slice(0, 200)}`);
  }
  if (!res.ok) throw new Error(`YouTube ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as {
    items?: Array<{ id?: { videoId?: string }; snippet?: { title?: string; channelTitle?: string } }>;
  };
  const out: YoutubeVideo[] = [];
  for (const it of data.items ?? []) {
    if (!it.id?.videoId) continue;
    out.push({
      videoId: it.id.videoId,
      title: it.snippet?.title ?? "",
      channel: it.snippet?.channelTitle ?? "",
    });
  }
  return out;
}
