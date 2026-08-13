import type { Metadata } from "next";
import "../globals.css";

/**
 * 管理画面の layout。
 *
 * ★ ルートの src/app/layout.tsx は <html>/<body> を出さない(フラグメントを返し、
 *   実体は [locale]/layout.tsx が持つ)。/admin は [locale] の外にあるので、
 *   ここで <html>/<body> を用意しないとページが成立しない。
 *
 * noindex にしてあるのは検索避けであると同時に、ビルド出力の門番
 * (scripts/check-built-output.mjs)が noindex ページのタイトル検査を飛ばすため。
 * 管理画面は SERP に出ないので幅制限や翻訳の対象外でよい。
 */
export const metadata: Metadata = {
  title: "Pickly 管理",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-[#fcfcfb] text-[#1b1f24] antialiased dark:bg-[#141922] dark:text-[#e8ecf1]">
        {children}
      </body>
    </html>
  );
}
