"use client";
import Script from "next/script";

// NOTE: Microsoft Clarity is injected directly in <head> of [locale]/layout.tsx,
// NOT here. `next/script` afterInteractive INLINE scripts are silently dropped by
// Next.js static export (`output: export`), so a Clarity branch here would never
// load. (GA's inline init has the same limitation; GA pageviews are sent by
// PageViewTracker instead.) Keep only GA's external gtag.js loader here.
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-M7SF83B60R";

export function Analytics() {
  if (!GA_ID) return null;
  return (
    <>
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">{`
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());
gtag('config','${GA_ID}',{send_page_view:true});
          `}</Script>
        </>
      )}
    </>
  );
}
