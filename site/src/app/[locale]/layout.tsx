import type { Viewport } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { LOCALES, getDirection, type Locale } from "@/lib/i18n/locales";
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
    <html lang={locale} dir={dir}>
      <head>
        <link rel="preconnect" href="https://fundingchoicesmessages.google.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="alternate" type="application/rss+xml" title="Pickly — Latest Reviews (EN)" href={`${SITE_URL}/feed.xml`} />
        <link rel="alternate" type="application/rss+xml" title="Pickly — 最新レビュー (日本語)" href={`${SITE_URL}/feed-ja.xml`} />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4927026308242118"
          crossOrigin="anonymous"
        />
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
