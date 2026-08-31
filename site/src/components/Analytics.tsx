"use client";
import Script from "next/script";
import { useEffect, useState } from "react";
import { isAutomatedClient } from "@/lib/analytics/bot-gate";

// NOTE: Microsoft Clarity is injected directly in <head> of [locale]/layout.tsx,
// NOT here. `next/script` afterInteractive INLINE scripts are silently dropped by
// Next.js static export (`output: export`), so a Clarity branch here would never
// load. (GA's inline init has the same limitation; GA pageviews are sent by
// PageViewTracker instead.) Keep only GA's external gtag.js loader here.
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-M7SF83B60R";

export function Analytics() {
  // ヘッドレスブラウザには gtag.js 自体をロードさせない。inline script は
  // static export で落ちるので、ゲートは「ロードするかどうか」でしか
  // 掛けられない (2026-08-31、bot が全セッションの約半分を占めていた)。
  // SSG された HTML には常に <script> が出るが、判定はマウント後なので
  // 初期 HTML には出さず、人間と判定できた場合のみ挿入する。
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!isAutomatedClient()) setAllowed(true);
  }, []);

  if (!GA_ID || !allowed) return null;

  return (
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
  );
}
