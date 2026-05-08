import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Pickly", template: "%s | Pickly" },
  description: "Curated reviews and comparisons across 17 languages.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickly.blog"),
  other: {
    "impact-site-verification": "a2ed06ca-23b5-4d41-ba60-3435a0d22d61",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
