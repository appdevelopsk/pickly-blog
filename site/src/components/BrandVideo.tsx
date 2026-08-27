import { getDirection } from "@/lib/i18n/locales";

/**
 * ブランド動画 30秒（17ロケール分を public/videos/ に同梱）。
 *
 * 設計上の決定（2026-08-27 改訂）:
 * - fxea365 (EA/website の [locale]/page.tsx ヒーロー) と同形式の
 *   **フルブリード自動再生帯**にする。autoPlay / muted / loop / playsInline、
 *   controls なし・オーバーレイなし・装飾枠なし。無音素材なので muted で欠落なし。
 * - 以前は preload="none" + ポスター＋クリック再生だったが、ユーザー指示により
 *   自動再生へ変更（初回に動画バイト列を取りに行くトレードオフは承知の上）。
 * - 設置箇所は max-w-5xl コンテナの**外**（page.tsx のトップレベル）。
 *   負マージン(-ml-[50vw])だとクラシックなスクロールバー環境で横溢れするため。
 * - ファイル名サフィックスは locales.ts の LOCALE_DEFS のコードと完全一致
 *   （en / ja / zh-CN / pt-BR ... すべて）なのでマッピングは不要。
 */
export default function BrandVideo({ locale }: { locale: string }) {
  const src = `/videos/pickly_brand_30s_${locale}.mp4`;
  const poster = `/videos/pickly_brand_30s_${locale}.jpg`;

  return (
    <div className="relative w-full overflow-hidden bg-slate-900" dir={getDirection(locale)}>
      <video
        autoPlay
        muted
        loop
        playsInline
        poster={poster}
        aria-hidden="true"
        className="block h-[46vh] min-h-[280px] w-full object-cover md:h-[62vh]"
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}
