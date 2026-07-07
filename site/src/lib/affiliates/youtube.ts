// scripts/fetch-youtube.ts が事前取得したレビュー動画キャッシュをサイトから読む。
// ビルド時API呼び出し無し・キーはサイトに出ない。
import youtubeCache from "./youtube-cache.json";
import youtubeCacheEn from "./youtube-cache-en.json";

type YtEntry = { videoId: string | null; title?: string; channel?: string };
const YT = youtubeCache as Record<string, YtEntry>;
const YT_EN = youtubeCacheEn as Record<string, YtEntry>;

export interface ReviewVideoMeta {
  videoId: string;
  title: string;
}

/** offer に紐づくレビュー動画（無ければ null）。lang="en" はEN向けキャッシュ(英語動画)を参照。 */
export function getReviewVideo(offerId: string, lang: "ja" | "en" = "ja"): ReviewVideoMeta | null {
  const e = lang === "en" ? YT_EN[offerId] : YT[offerId];
  if (!e || !e.videoId) return null;
  return { videoId: e.videoId, title: e.title ?? "" };
}
