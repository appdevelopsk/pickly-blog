// scripts/fetch-youtube.ts が事前取得したレビュー動画キャッシュをサイトから読む。
// ビルド時API呼び出し無し・キーはサイトに出ない。
//
// 2026-08-12: ja / en の2本だけだったキャッシュを 17 言語ぶんに分けた。
// それまでは「JP=日本語動画 / 非JP=英語動画」で、独・仏・韓… の読者には
// 本文と言語の違う動画が出ていた。読む順は locale → (地域無し基語) → en。
// 各ロケールのキャッシュは未取得ぶんが空なので、埋まるまでは従来どおり
// en にフォールバックする（表示が消えることはない）。
import ytJa from "./youtube-cache.json";
import ytEn from "./youtube-cache-en.json";
import ytZhCN from "./youtube-cache-zh-CN.json";
import ytZhTW from "./youtube-cache-zh-TW.json";
import ytKo from "./youtube-cache-ko.json";
import ytEs from "./youtube-cache-es.json";
import ytPtBR from "./youtube-cache-pt-BR.json";
import ytFr from "./youtube-cache-fr.json";
import ytDe from "./youtube-cache-de.json";
import ytIt from "./youtube-cache-it.json";
import ytRu from "./youtube-cache-ru.json";
import ytAr from "./youtube-cache-ar.json";
import ytHi from "./youtube-cache-hi.json";
import ytId from "./youtube-cache-id.json";
import ytTh from "./youtube-cache-th.json";
import ytVi from "./youtube-cache-vi.json";
import ytTr from "./youtube-cache-tr.json";

type YtEntry = { videoId: string | null; title?: string; channel?: string };
type YtCache = Record<string, YtEntry>;

const CACHES: Record<string, YtCache> = {
  ja: ytJa as YtCache,
  en: ytEn as YtCache,
  "zh-CN": ytZhCN as YtCache,
  "zh-TW": ytZhTW as YtCache,
  ko: ytKo as YtCache,
  es: ytEs as YtCache,
  "pt-BR": ytPtBR as YtCache,
  fr: ytFr as YtCache,
  de: ytDe as YtCache,
  it: ytIt as YtCache,
  ru: ytRu as YtCache,
  ar: ytAr as YtCache,
  hi: ytHi as YtCache,
  id: ytId as YtCache,
  th: ytTh as YtCache,
  vi: ytVi as YtCache,
  tr: ytTr as YtCache,
};

export interface ReviewVideoMeta {
  videoId: string;
  title: string;
  /** 実際に採用したキャッシュのロケール（要求と違えばフォールバック済み）。 */
  lang: string;
}

/** locale に対して読むキャッシュの優先順（例: pt-BR → pt → en）。 */
function chain(locale: string): string[] {
  const base = locale.split("-")[0];
  // ja は自前キャッシュが埋まっている（1,086本）ので en に落とさない。
  // 落とすと日本語記事に英語動画が出る＝今回直している不一致そのものになる。
  const order = base === "ja" ? ["ja"] : [locale, base, "en"];
  return order.filter((l, i) => l in CACHES && order.indexOf(l) === i);
}

/** offer に紐づくレビュー動画（無ければ null）。locale の言語を優先し、無ければ en。 */
export function getReviewVideo(offerId: string, locale: string = "ja"): ReviewVideoMeta | null {
  for (const lang of chain(locale)) {
    const e = CACHES[lang]?.[offerId];
    if (e?.videoId) return { videoId: e.videoId, title: e.title ?? "", lang };
  }
  return null;
}
