// @ts-nocheck — data file; keeps RAW_CATALOG union inference cheap (same pattern as catalog-additions.ts)
import type { AffiliateOffer } from "./types";

// Smart ring lineup for best-smart-ring-2026 (2026-08-01).
// Leep Ring = Awin advertiser 124208 (application pending — flip approved when the
// partnership is accepted). Ultrahuman = Awin 69428 (already partnered).
export const CATALOG_ADDITIONS_SMARTRINGS = [
  {
    id: "oura-ring-4",
    imageUrl: "https://ourahealth.imgix.net/blue-sky/pop/gen4/hero-final.jpg?ixlib=js-3.8.0&auto=format&fit=crop&fm=png&ar=1%3A1&crop=focalpoint&fp-x=0.5&fp-y=0.5fp-z%3D1&q=70&w=1200&s=8e1c9404ae77149ddc9aa3199d4d1848",
    priceMin: "$349",
    priceMax: "$499",
    category: "tech",
    name: { en: "Oura Ring 4", ja: "Oura Ring 4（オーラリング4）" },
    description: {
      en: "Titanium smart ring with recessed sensors, 18 finishes/sizes 4-15, sleep staging + readiness scores refined over four generations. Requires $5.99/mo membership for full insights.",
      ja: "チタン製スマートリング。センサー埋込設計、睡眠ステージ+コンディションスコアは4世代の蓄積。全機能利用には月額$5.99のメンバーシップが必要。",
    },
    links: [
      { network: "amazon-us", productId: "oura-ring-4", rawUrl: "https://www.amazon.com/s?k=Oura+Ring+4", markets: ["US", "UK", "EU", "global"], approved: true },
      { network: "amazon-jp", productId: "oura-ring-4", rawUrl: "https://www.amazon.co.jp/s?k=Oura+Ring+4", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "leep-ring-1",
    imageUrl: "https://cdn.prod.website-files.com/686bcc7868a0273bceba0e7d/6a5a4c19b9792218b8732c6c_leep_ring_side_web.jpg",
    price: "$199",
    category: "tech",
    name: { en: "Leep Ring 1", ja: "Leep Ring 1（リープリング）" },
    description: {
      en: "British sleep-first smart ring: titanium shell, 2.6mm thin, 8-day battery plus a charging case good for 60+ days, 50m water resistance — and zero subscription fees, at roughly half the price of Oura.",
      ja: "英国発の睡眠特化スマートリング。チタン外殻・薄さ2.6mm・8日バッテリー+60日分の充電ケース・50m防水。サブスク完全無料でOuraの約半額。",
    },
    links: [
      // Awin 124208 application pending. Until accepted, ship the plain brand link
      // (approved:true) so the product card renders; when Awin approves, flip the
      // awin link to true and this direct link to false.
      { network: "awin", productId: "124208", rawUrl: "https://www.awin1.com/cread.php?awinmid=124208&awinaffid=2887303&ued=https%3A%2F%2Fwww.leephealth.com%2F", markets: ["UK", "US", "EU", "global"], approved: false },
      { network: "direct", productId: "https://www.leephealth.com/", rawUrl: "https://www.leephealth.com/", markets: ["global"], approved: true },
    ],
  },
  {
    id: "ultrahuman-ring-air",
    imageUrl: "https://public-web-assets.uh-static.com/web_v2/backgrounds/ring-air-hero.png",
    price: "$349",
    category: "tech",
    name: { en: "Ultrahuman Ring Air", ja: "Ultrahuman Ring Air（ウルトラヒューマン）" },
    description: {
      en: "Featherweight (2.4g) titanium ring with no mandatory subscription. Deep metabolic/recovery analytics, caffeine-timing and circadian tools; optional paid PowerPlugs extend features.",
      ja: "わずか2.4gの超軽量チタンリング。必須サブスク無し。代謝・回復分析やカフェイン摂取タイミング等の独自機能。一部機能は有料PowerPlugsで拡張。",
    },
    links: [
      { network: "awin", productId: "69428", rawUrl: "https://www.awin1.com/cread.php?awinmid=69428&awinaffid=2887303&ued=https%3A%2F%2Fwww.ultrahuman.com%2Fring%2F", markets: ["US", "UK", "EU", "global"], approved: true },
      { network: "amazon-jp", productId: "ultrahuman-ring-air", rawUrl: "https://www.amazon.co.jp/s?k=Ultrahuman+Ring+Air", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "ringconn-gen-2",
    imageUrl: "https://ringconn.com/cdn/shop/files/RingConn_Smart_Ring_Gen_2-Royal_Gold.png?v=1780302336&width=2048",
    price: "$299",
    category: "tech",
    name: { en: "RingConn Gen 2", ja: "RingConn Gen 2（リンコン）" },
    description: {
      en: "Battery king of smart rings: 10-12 days per charge, squircle profile that resists rolling, sleep apnea detection, no subscription. App insights are shallower than Oura's.",
      ja: "スマートリング随一の10〜12日バッテリー。転がりにくいスクエア断面、睡眠時無呼吸検知、サブスク無し。アプリの分析深度はOuraに一歩譲る。",
    },
    links: [
      { network: "amazon-us", productId: "ringconn-gen-2", rawUrl: "https://www.amazon.com/s?k=RingConn+Gen+2+smart+ring", markets: ["US", "UK", "EU", "global"], approved: true },
      { network: "amazon-jp", productId: "ringconn-gen-2", rawUrl: "https://www.amazon.co.jp/s?k=RingConn+Gen+2", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "samsung-galaxy-ring",
    imageUrl: "https://images.samsung.com/is/image/samsung/p6pim/us/sm-q500nzkaxar/gallery/us--sm-q500nzkaxar-550360664?$product-details-jpg$",
    price: "$399",
    category: "tech",
    name: { en: "Samsung Galaxy Ring", ja: "Samsung Galaxy Ring（ギャラクシーリング）" },
    description: {
      en: "Titanium ring with Energy Score, cycle tracking and gesture controls, deeply integrated with Galaxy phones and Samsung Health. Android only — no iOS app — and best features need a Samsung phone.",
      ja: "エナジースコア・ジェスチャー操作を備えたチタンリング。Galaxyスマホ+Samsung Healthと深く統合。Android専用（iOS非対応）で、真価はSamsung端末との併用時。",
    },
    links: [
      { network: "amazon-us", productId: "samsung-galaxy-ring", rawUrl: "https://www.amazon.com/s?k=Samsung+Galaxy+Ring", markets: ["US", "UK", "EU", "global"], approved: true },
      { network: "amazon-jp", productId: "samsung-galaxy-ring", rawUrl: "https://www.amazon.co.jp/s?k=Samsung+Galaxy+Ring", markets: ["JP"], approved: true },
    ],
  },
] as AffiliateOffer[];
