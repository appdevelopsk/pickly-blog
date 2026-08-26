import { getDirection } from "@/lib/i18n/locales";

/**
 * ブランド動画 30秒（17ロケール分を public/videos/ に同梱）。
 *
 * 設計上の決定（2026-08-27）:
 * - autoplay / muted / loop は付けない。トップの初回読み込みを重くすると
 *   滞在率改善の意図に反するため、ポスター画像＋クリック再生にする。
 * - preload="none" で動画バイト列は再生されるまで一切取りに行かない。
 * - ファイル名サフィックスは locales.ts の LOCALE_DEFS のコードと完全一致
 *   （en / ja / zh-CN / pt-BR ... すべて）なのでマッピングは不要。
 */
export default function BrandVideo({ locale }: { locale: string }) {
  const src = `/videos/pickly_brand_30s_${locale}.mp4`;
  const poster = `/videos/pickly_brand_30s_${locale}.jpg`;

  return (
    <section className="mb-12" dir={getDirection(locale)}>
      <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
        <video
          className="block aspect-video w-full bg-slate-900"
          src={src}
          poster={poster}
          controls
          preload="none"
          playsInline
          width={1920}
          height={1080}
        />
      </div>
    </section>
  );
}
