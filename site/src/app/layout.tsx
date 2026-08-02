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
  alternates: {
    types: { "application/rss+xml": `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog"}/feed.xml` },
  },
  twitter: {
    card: "summary_large_image",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION_CODE ?? undefined,
  },
  other: {
    "impact-site-verification": "a2ed06ca-23b5-4d41-ba60-3435a0d22d61",
    // "google-adsense-account": AdSense無効化(2026-07-28)に伴い撤去。復活時に戻す。
    "p:domain_verify": "afe3c49894176a386ad08c4a83767a0c",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {/* Analytics (GA4 + Microsoft Clarity) is wired in src/components/Analytics.tsx,
          rendered from [locale]/layout.tsx — do NOT add a second GA tag here. */}
      {/* Skimlinks — auto-monetize product links (publisher 302910X1790935) */}
      <script
        type="text/javascript"
        src="https://s.skimresources.com/js/302910X1790935.skimlinks.js"
        async
      />
    </>
  );
}
