"use client";

import { useState } from "react";

/**
 * レビュー動画の遅延埋め込み（facade）。初期はサムネ画像＋再生ボタンのみ＝軽量。
 * クリックで初めて YouTube iframe を読み込む（ページ表示を重くしない）。
 * 動画は他者のレビュー（YouTube）で、プライバシー強化ドメイン youtube-nocookie を使用。
 */
export function ReviewVideo({
  videoId,
  title,
  // 呼び出し側が t("offer.videoReview") を渡す。既定は言語非依存の英語
  // （以前は日本語固定で、非日本語ページにも「レビュー動画」と出ていた）。
  label = "Video review",
}: {
  videoId: string;
  title?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const thumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  if (open) {
    return (
      <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-lg border border-slate-200">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title || "Review video"}
          allow="accelerated-tracking; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={label}
      className="group relative mt-3 block aspect-video w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumb}
        alt={title || label}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
      />
      <span className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
        <span className="flex h-12 w-16 items-center justify-center rounded-xl bg-[#FF0000]/90 shadow-lg">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
      <span className="absolute bottom-1 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
        ▶ {label}
      </span>
    </button>
  );
}
