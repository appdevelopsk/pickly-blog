import type { Viewport } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { LOCALES, getDirection, isIndexedLocale, type Locale } from "@/lib/i18n/locales";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Suspense } from "react";
import { Analytics } from "@/components/Analytics";
import { PageViewTracker } from "@/lib/analytics/pageview";

const SITE_URL = "https://pickly.blog";

// Microsoft Clarity (heatmaps + session replay). Injected directly in <head>
// because `next/script` afterInteractive INLINE scripts are dropped by Next.js
// static export (`output: export`) — only external-src scripts survive, so the
// Analytics.tsx Clarity branch never shipped. A plain head <script> is the
// canonical Clarity install and is guaranteed to appear in the static HTML.
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ?? "wqatyufkhb";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

// 非インデックス対象ロケール（実クリック0の死蔵言語）はサイト全体を noindex。
// 子ページは robots を上書きしないため、このロケール層の指定が全ページに継承される
// （follow は維持し内部リンクの評価は流す）。詳細は locales.ts の INDEXED_LOCALES。
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const index = isIndexedLocale(locale);
  return {
    robots: {
      index,
      follow: true,
      googleBot: { index, follow: true, "max-image-preview": "large" },
    },
  };
}

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!(LOCALES as readonly string[]).includes(locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = getDirection(locale);

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        {/* テーマ初期適用。output: export なのでサーバーは配色を知り得ず、
            React マウント後に付けると必ず白フラッシュが出る。
            レンダーブロッキングのインライン script で先に <html> へ .dark を載せる。 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})();`,
          }}
        />
        {/* AdSense アカウントは 2026-07-28 に無効トラフィックで無効化された。
            配信タグを残すと、無効化されたアカウントに対して閲覧・クロールのたびに
            広告リクエストが発生し続ける。再審査の申立てでも「全サイトからタグを撤去済み」
            と説明する以上、実体を合わせておく必要がある。復活したら戻す (2026-08-02)。 */}
        <link rel="alternate" type="application/rss+xml" title="Pickly — Latest Reviews (EN)" href={`${SITE_URL}/feed.xml`} />
        <link rel="alternate" type="application/rss+xml" title="Pickly — 最新レビュー (日本語)" href={`${SITE_URL}/feed-ja.xml`} />
        {CLARITY_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");`,
            }}
          />
        )}
      </head>
      <body className={`${inter.variable} min-h-screen flex flex-col`}>
        <NextIntlClientProvider locale={locale as Locale} messages={messages}>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </NextIntlClientProvider>
        <Analytics />
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
      </body>
    </html>
  );
}
