// scripts/fetch-youtube.ts が事前取得したレビュー動画キャッシュをサイトから読む。
// ビルド時API呼び出し無し・キーはサイトに出ない。
import youtubeCache from "./youtube-cache.json";

type YtEntry = { videoId: string | null; title?: string; channel?: string };
const YT = youtubeCache as Record<string, YtEntry>;

export interface ReviewVideoMeta {
  videoId: string;
  title: string;
}

/** offer に紐づくレビュー動画（無ければ null）。 */
export function getReviewVideo(offerId: string): ReviewVideoMeta | null {
  const e = YT[offerId];
  if (!e || !e.videoId) return null;
  return { videoId: e.videoId, title: e.title ?? "" };
}
