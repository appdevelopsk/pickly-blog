import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog"),
  title: { default: "Pickly", template: "%s | Pickly" },
  description: "Curated reviews and comparisons across 17 languages.",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    siteName: "Pickly",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION_CODE ?? undefined,
  },
  other: {
    "impact-site-verification": "a2ed06ca-23b5-4d41-ba60-3435a0d22d61",
    "google-adsense-account": "ca-pub-4927026308242118",
    "p:domain_verify": "afe3c49894176a386ad08c4a83767a0c",
  },
};

// Analytics — gated on env so the build stays clean when unset.
// GA4 activates the existing affiliate_click tracking (AffiliateClickTracker)
// + gives traffic / referrer / per-page data. Clarity adds heatmaps + recordings.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}

      {/* Google Analytics 4 (pageviews, referrers/channels, affiliate_click events) */}
      {GA_ID && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`,
            }}
          />
        </>
      )}

      {/* Microsoft Clarity (heatmaps + session recordings; free) */}
      {CLARITY_ID && (
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");`,
          }}
        />
      )}

      {/* Skimlinks — auto-monetize product links (publisher 302910X1790935) */}
      <script
        type="text/javascript"
        src="https://s.skimresources.com/js/302910X1790935.skimlinks.js"
        async
      />
    </>
  );
}
