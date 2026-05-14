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
    google: "google-site-verification-pending",
  },
  other: {
    "impact-site-verification": "a2ed06ca-23b5-4d41-ba60-3435a0d22d61",
    "google-adsense-account": "ca-pub-4927026308242118",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {/* Skimlinks — auto-monetize product links (publisher 302910X1790935) */}
      <script
        type="text/javascript"
        src="https://s.skimresources.com/js/302910X1790935.skimlinks.js"
        async
      />
    </>
  );
}
