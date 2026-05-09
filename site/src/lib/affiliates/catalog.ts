import type { AffiliateOffer, AffiliatePolicy, AspLink, Market } from "./types";
import { inferMarketFromLocale } from "@/lib/i18n/locales";
import overridesJson from "./catalog-overrides.json";

type OverridesShape = Record<string, { links?: AspLink[] } | undefined> & {
  _comment?: string;
  _version?: number;
};
const OVERRIDES = overridesJson as OverridesShape;

export const POLICY: AffiliatePolicy = {
  maxPerSlot: 5,
  disclosureLabel: {
    en: "Sponsored",
    ja: "広告",
    "zh-CN": "广告",
    "zh-TW": "廣告",
    ko: "광고",
    es: "Patrocinado",
    "pt-BR": "Patrocinado",
    fr: "Sponsorisé",
    de: "Werbung",
    it: "Sponsorizzato",
    ru: "Реклама",
    ar: "إعلان",
    hi: "प्रायोजित",
    id: "Bersponsor",
    th: "ได้รับการสนับสนุน",
    vi: "Tài trợ",
    tr: "Sponsorlu",
  },
};

/**
 * MVP catalog. 実案件は ASP 承認後に `catalog-overrides.json` にCLIで追記される。
 * approved: false のリンクは UI 上「準備中」表示になる。
 *
 * RAW_CATALOG の links は default(全部 approved:false の placeholder)、
 * CATALOG (export) は overrides.json を merge した最終形。
 */
const RAW_CATALOG: AffiliateOffer[] = [
  {
    id: "nordvpn",
    category: "tech",
    badge: "🛡️",
    name: { en: "NordVPN", ja: "NordVPN", "zh-CN": "NordVPN", "zh-TW": "NordVPN", ko: "NordVPN", es: "NordVPN", "pt-BR": "NordVPN", fr: "NordVPN", de: "NordVPN", it: "NordVPN", ru: "NordVPN", ar: "NordVPN", hi: "NordVPN", id: "NordVPN", th: "NordVPN", vi: "NordVPN", tr: "NordVPN" },
    description: {
      en: "6,400+ servers in 111 countries. Threat Protection blocks ads and trackers. Meshnet free for everyone.",
      ja: "111カ国に6,400台以上のサーバー。Threat Protectionで広告とトラッカーをブロック。Meshnetは無料開放。",
    },
    links: [
      { network: "impact", productId: "nordvpn-2026", markets: ["US", "EU", "UK", "global"], approved: false },
      { network: "a8", productId: "nordvpn-jp-2026", markets: ["JP"], approved: false },
    ],
  },
  {
    id: "expressvpn",
    category: "tech",
    badge: "⚡",
    name: { en: "ExpressVPN", ja: "ExpressVPN" },
    description: {
      en: "Lightway protocol delivers consistent 400+ Mbps. 105 countries. The fastest in our 30-day test.",
      ja: "Lightwayプロトコルで安定400Mbps超。105カ国対応。30日のテストで最速。",
    },
    links: [
      { network: "impact", productId: "expressvpn-2026", markets: ["US", "EU", "UK", "global"], approved: false },
      { network: "moshimo", productId: "expressvpn-jp", markets: ["JP"], approved: false },
    ],
  },
  {
    id: "surfshark",
    category: "tech",
    badge: "🦈",
    name: { en: "Surfshark", ja: "Surfshark" },
    description: {
      en: "Unlimited devices on one account. CleanWeb blocks malware. The best price-to-feature ratio at $3.99/mo.",
      ja: "1アカウントで端末数無制限。CleanWebでマルウェア対策。月$3.99の高コスパ。",
    },
    links: [
      { network: "cj", productId: "surfshark-2026", markets: ["US", "EU", "UK", "global"], approved: false },
      { network: "a8", productId: "surfshark-jp", markets: ["JP"], approved: false },
    ],
  },
  {
    id: "protonvpn",
    category: "tech",
    badge: "🔒",
    name: { en: "Proton VPN", ja: "Proton VPN" },
    description: {
      en: "Swiss-based, audited no-logs. Stealth protocol defeats DPI in censored countries. Free tier available.",
      ja: "スイス拠点・監査済みノーログ。Stealthプロトコルで検閲突破。無料プランあり。",
    },
    links: [
      { network: "impact", productId: "protonvpn-2026", markets: ["US", "EU", "UK", "global"], approved: false },
      { network: "direct", productId: "https://protonvpn.com/?ref=affiliatefactory", markets: ["JP"], approved: false },
    ],
  },
  {
    id: "mullvad",
    category: "tech",
    badge: "🐾",
    name: { en: "Mullvad", ja: "Mullvad" },
    description: {
      en: "Flat €5/month, no marketing tricks. Accepts cash and Monero. The most private of the bunch.",
      ja: "月€5固定、プロモーション一切なし。現金・Monero対応。プライバシー最重視。",
    },
    links: [
      { network: "direct", productId: "https://mullvad.net/en/account/create?ref=affiliatefactory", markets: ["US", "EU", "UK", "global", "JP"], approved: false },
    ],
  },
  // ───────── Home / Coffee Grinders (best-coffee-grinder-2026) ─────────
  {
    id: "timemore-c2",
    category: "home",
    badge: "⚙️",
    name: { en: "Timemore C2", ja: "タイムモア C2" },
    description: {
      en: "9,000 yen manual grinder. Stainless steel conical burr. The best home-use manual mill in our test.",
      ja: "9,000円の手挽きミル。ステンレス円錐刃。家庭用手動ミルで最高峰。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-timemore-c2", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2Ftimemore%2Bc2%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "hario-v60-ceramic-slim",
    category: "home",
    badge: "🌱",
    name: { en: "Hario V60 Ceramic Slim", ja: "ハリオ V60 セラミックスリム" },
    description: {
      en: "3,000 yen ceramic burr manual. Beginner-friendly classic. Half the cost of premium options.",
      ja: "3,000円のセラミック刃手挽き。初心者向け定番。プレミアム価格帯の半額以下。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-hario-v60", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FHARIO%2BV60%2B%E3%82%BB%E3%83%A9%E3%83%9F%E3%83%83%E3%82%AF%E3%82%B9%E3%83%AA%E3%83%A0%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "melitta-vario-e",
    category: "home",
    badge: "☕",
    name: { en: "Melitta Vario E", ja: "メリタ バリオ E" },
    description: {
      en: "20,000 yen electric grinder. Stepless adjustment, espresso to French press. Quiet operation.",
      ja: "20,000円の電動ミル。無段階調整、エスプレッソからフレンチプレスまで。静音設計。",
    },
    links: [
      { network: "moshimo", productId: "yahoo-melitta-vario-e", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5539220&p_id=1225&pc_id=1925&pl_id=18502&url=https%3A%2F%2Fstore.shopping.yahoo.co.jp%2Fsearch%3Fp%3D%E3%83%A1%E3%83%AA%E3%82%BF%2B%E3%83%90%E3%83%AA%E3%82%AA%2BE", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "delonghi-kg79j",
    category: "home",
    badge: "🎚️",
    name: { en: "Delonghi KG79J", ja: "デロンギ KG79J" },
    description: {
      en: "7,000 yen electric. Conical burr, 18 grind settings. Best price for drip coffee.",
      ja: "7,000円の電動ミル。円錐刃、18段階粒度設定。ドリップコーヒー目的では最安級の選択。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-delonghi-kg79j", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FDelonghi%2BKG79J%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "fuji-royal-r220",
    category: "home",
    badge: "🏆",
    name: { en: "Fuji Royal R-220 (Mirukko)", ja: "富士ローヤル みるっこ R-220" },
    description: {
      en: "50,000 yen pro-grade. Cast steel cutter, used in cafes. The reference for home enthusiasts.",
      ja: "50,000円の業務用クラス。鋳鋼カッター、カフェ採用実績多数。家庭ホームバリスタ向けの基準機。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-fuji-royal-r220", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%81%BF%E3%82%8B%E3%81%A3%E3%81%93%2BR-220%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Beauty / Electric Toothbrushes (best-electric-toothbrush-2026) ─────────
  {
    id: "philips-sonicare-9300",
    category: "beauty",
    badge: "💎",
    name: { en: "Philips Sonicare DiamondClean Smart 9300", ja: "フィリップス ソニッケアー ダイヤモンドクリーン スマート 9300" },
    description: {
      en: "35,000 yen flagship sonic. 5 modes, app-connected coaching, replaceable brush heads with chip recognition.",
      ja: "35,000円のソニックフラッグシップ。5モード+アプリ連動コーチング、ICチップ認識ブラシヘッド。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-philips-9300", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FPhilips%2BSonicare%2BDiamondClean%2BSmart%2B9300%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "philips-sonicare-4500",
    category: "beauty",
    badge: "✨",
    name: { en: "Philips Sonicare ProtectiveClean 4500", ja: "フィリップス ソニッケアー プロテクトクリーン 4500" },
    description: {
      en: "12,000 yen mid-range sonic. 3 modes, pressure sensor, 14-day battery. Best balance of features and price.",
      ja: "12,000円のミドルクラス・ソニック。3モード、圧力センサー、14日バッテリー。機能と価格のバランス最良。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-philips-4500", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FPhilips%2BSonicare%2BProtectiveClean%2B4500%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "oral-b-pro-1",
    category: "beauty",
    badge: "🦷",
    name: { en: "Oral-B PRO 1", ja: "オーラルB PRO 1" },
    description: {
      en: "5,000 yen entry-level rotating toothbrush. 8,800 oscillations/min, 2-min timer. Cheapest worth-it option.",
      ja: "5,000円のエントリー回転式。1分8,800ストローク、2分タイマー内蔵。買って後悔しない最安帯。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-oral-b-pro-1", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FOral-B%2BPRO%2B1%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "panasonic-doltz-dp35",
    category: "beauty",
    badge: "🇯🇵",
    name: { en: "Panasonic Doltz EW-DP35", ja: "パナソニック ドルツ EW-DP35" },
    description: {
      en: "18,000 yen Japanese linear sonic. 31,000 strokes/min, dual-vibration motion, 22-day battery.",
      ja: "18,000円の国内ブランド・リニア音波。1分31,000ストローク、W音波振動、22日バッテリー。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-doltz-dp35", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FPanasonic%2BDoltz%2BEW-DP35%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "braun-oral-b-io9",
    category: "beauty",
    badge: "🤖",
    name: { en: "BRAUN Oral-B Genius X (iO 9)", ja: "ブラウン オーラルB Genius X (iO 9)" },
    description: {
      en: "50,000 yen flagship. AI brushing detection across 16 zones, magnetic drive, color OLED display.",
      ja: "50,000円のフラッグシップ。16ゾーンAI磨き残し検知、マグネット駆動、カラー OLED ディスプレイ。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-braun-io9", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FBRAUN%2BOral-B%2BGenius%2BX%2BiO%2B9%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Beauty / Electric Toothbrushes 2026 (best-electric-toothbrush-2026) ─────────
  {
    id: "oral-b-io-series-9",
    category: "beauty",
    badge: "🦷",
    name: { en: "Oral-B iO Series 9", ja: "オーラルB iO Series 9" },
    description: {
      en: "Oral-B flagship with magnetic drive, AI 16-zone coaching app, round oscillating head. $300+, app pushes data sharing.",
      ja: "Oral-Bフラッグシップ。マグネットドライブ＋AIアプリ16ゾーンコーチング、回転式丸型ヘッド。3万円超、アプリはデータ共有を積極促進。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-oral-b-io-series-9", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FOral-B%2BiO9%2B%E9%9B%BB%E5%8B%95%E6%AD%AF%E3%83%96%E3%83%A9%E3%82%B7%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "philips-sonicare-diamondclean-9000",
    category: "beauty",
    badge: "💎",
    name: { en: "Philips Sonicare DiamondClean 9000", ja: "フィリップス ソニッケアー ダイヤモンドクリーン 9000" },
    description: {
      en: "Sonic flagship, 4 modes, glass charging cup, premium gift presentation. $250+, charging cup impractical for travel.",
      ja: "音波式フラッグシップ。4モード・ガラス充電カップ・高級ギフト向け演出。2万5千円超、充電カップは旅行に不向き。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-philips-sonicare-diamondclean-9000", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%83%95%E3%82%A3%E3%83%AA%E3%83%83%E3%83%97%E3%82%B9%2B%E3%82%BD%E3%83%8B%E3%83%83%E3%82%B1%E3%82%A2%E3%83%BC%2BDiamondClean%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "panasonic-doltz-ew-dp52",
    category: "beauty",
    badge: "🇯🇵",
    name: { en: "Panasonic Doltz EW-DP52", ja: "パナソニック ドルツ EW-DP52" },
    description: {
      en: "Japan-made slim sonic, pressure sensor, no app required. Harder to source outside Japan.",
      ja: "国内製・細型音波式、圧力センサー搭載、アプリ不要。日本国外では入手しにくい。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-panasonic-doltz-ew-dp52", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%83%91%E3%83%8A%E3%82%BD%E3%83%8B%E3%83%83%E3%82%AF%2B%E3%83%89%E3%83%AB%E3%83%84%2BEW-DP52%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "quip-electric-toothbrush",
    category: "beauty",
    badge: "✈️",
    name: { en: "Quip Electric Toothbrush", ja: "Quip 電動歯ブラシ" },
    description: {
      en: "Minimalist flat profile, AAA battery, ADA-accepted, $5/quarter subscription head. No pressure sensor.",
      ja: "ミニマリスト・フラット形状、単4電池式、ADA認定、750円/四半期ヘッドサブスク。圧力センサーなし。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-quip-electric-toothbrush", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FQuip%2B%E9%9B%BB%E5%8B%95%E6%AD%AF%E3%83%96%E3%83%A9%E3%82%B7%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "oclean-x-pro-elite",
    category: "beauty",
    badge: "📱",
    name: { en: "Oclean X Pro Elite", ja: "オクリーン X Pro エリート" },
    description: {
      en: "~$80 AI coaching, AMOLED display, ultra-quiet piezoelectric motor. App data to Chinese servers.",
      ja: "約1万円のAIコーチング、AMOLEDディスプレイ、超静音圧電モーター。アプリデータは中国サーバーへ。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-oclean-x-pro-elite", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FOclean%2BX%2BPro%2B%E9%9B%BB%E5%8B%95%E6%AD%AF%E3%83%96%E3%83%A9%E3%82%B7%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Beauty / Electric Shavers (best-electric-shaver-2026) ─────────
  {
    id: "philips-series-9000-prestige",
    category: "beauty",
    badge: "top-pick",
    name: { en: "Philips Series 9000 Prestige SP9883", ja: "フィリップス シリーズ9000 プレステージ SP9883" },
    description: {
      en: "~¥50,000 premium rotary shaver. SenseIQ adapts to beard density 125 times per second, 360-degree contour following, wet/dry use, worldwide voltage. Explicit weakness: ¥50,000 is expensive; rotary shaves less close than foil on flat skin areas; round heads harder to clean manually.",
      ja: "約5万円のプレミアム回転式シェーバー。SenseIQがひげ密度を1秒125回読み取り自動適応、360度追従、ウェット/ドライ両用、世界対応電圧。弱点：5万円は高額、平坦部位の剃り残しは往復式に劣る、手動洗浄がしにくい形状。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-philips-series-9000-prestige", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FPhilips%2BSP9883%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "braun-series-9-pro-plus",
    category: "beauty",
    badge: "best-foil",
    name: { en: "Braun Series 9 Pro+ 9565cc", ja: "ブラウン シリーズ9 Pro+ 9565cc" },
    description: {
      en: "~¥45,000 top-tier foil shaver. Five shaving elements, ProLift for flat-lying hairs, AutoSense motor, Clean&Charge station included. Explicit weakness: ongoing cartridge costs; foil struggles on reverse-grain necks.",
      ja: "約4万5千円の最上位往復式シェーバー。5刃要素、寝たひげ対応ProLift、AutoSenseモーター、クリーン&チャージ付属。弱点：カートリッジ継続費用；逆生えのネック部に弱い。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-braun-series-9-pro-plus", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%83%96%E3%83%A9%E3%82%A6%E3%83%B3%2B9565cc%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "panasonic-lamdash-es-ls9a",
    category: "beauty",
    badge: "japan-pick",
    name: { en: "Panasonic ラムダッシュ ES-LS9A", ja: "パナソニック ラムダッシュ ES-LS9A" },
    description: {
      en: "~¥35,000 Japan market No.1 electric shaver. Five-blade foil, skincare mode for sensitive skin, parts available at every major Japan electronics retailer. Explicit weakness: no adaptive motor intelligence; lacks ProLift for flat-lying hairs.",
      ja: "約3万5千円の日本市場No.1電動シェーバー。5枚刃フォイル、肌ケアモード、全国家電量販店で部品入手可。弱点：適応モーター制御なし；寝たひげ対応のProLift相当なし。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-panasonic-lamdash-es-ls9a", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%83%91%E3%83%8A%E3%82%BD%E3%83%8B%E3%83%83%E3%82%AF%2BES-LS9A%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "philips-series-5000-sp5588",
    category: "beauty",
    badge: "budget-pick",
    name: { en: "Philips Series 5000 SP5588", ja: "フィリップス シリーズ5000 SP5588" },
    description: {
      en: "~¥20,000 AquaTouch wet-dry rotary shaver. Foam/gel certified, quick-dry design, SH52/SH53 replacement heads at ¥3,500–5,000/year. Explicit weakness: no SenseIQ; two-head rotary less capable on complex contours; no clean-and-charge option.",
      ja: "約2万円のAquaTouchウェット/ドライ回転式シェーバー。フォーム・ジェル対応、速乾設計、年間替刃費用3,500〜5,000円。弱点：SenseIQなし；2ヘッドで複雑輪郭への追従性が劣る；クリーンスタンドなし。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-philips-series-5000-sp5588", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FPhilips%2BSP5588%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "braun-series-7-71-s7200cc",
    category: "beauty",
    badge: "value-pick",
    name: { en: "Braun Series 7 71-S7200cc", ja: "ブラウン シリーズ7 71-S7200cc" },
    description: {
      en: "~¥25,000 AutoSense foil shaver with Clean&Charge station included. Four shaving elements, motor adapts to beard resistance. Explicit weakness: no ProLift for flat-lying hairs; cartridge costs apply; noticeable step-down from Series 9 on dense beards.",
      ja: "約2万5千円のAutoSense往復式シェーバー、クリーン&チャージ付属。4刃要素でひげ密度に適応。弱点：寝たひげ対応ProLiftなし；カートリッジ費用加算；ひげ濃い人はシリーズ9との差を体感しやすい。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-braun-series-7-71-s7200cc", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%83%96%E3%83%A9%E3%82%A6%E3%83%B3%2BS7200cc%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Beauty / LED Face Masks (best-led-face-mask-2026) ─────────
  {
    id: "currentbody-skin-led",
    category: "beauty",
    badge: "💡",
    name: { en: "CurrentBody Skin LED Light Therapy Mask", ja: "CurrentBody Skin LED ライトセラピーマスク" },
    description: {
      en: "75,000 yen Pinterest favorite. 132 LEDs at 633 nm + 830 nm, silicone flex shell, 10-minute sessions. The default home LED pick.",
      ja: "75,000円のPinterest人気機。LED 132個、633nm+830nmデュアル波長、シリコンフレックス、1回10分。家庭用LEDの定番。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-currentbody-skin-led", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FCurrentBody%2BSkin%2BLED%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "yaman-medi-lift-plus",
    category: "beauty",
    badge: "🇯🇵",
    name: { en: "Yaman Medi Lift Plus", ja: "ヤーマン メディリフトプラス" },
    description: {
      en: "77,000 yen Japanese hybrid. LED + EMS in 10-minute cycles. Visible same-day lift effect on top of long-term LED collagen response.",
      ja: "77,000円の和ブランド・ハイブリッド。LED+EMSの10分サイクル。長期のLED効果に当日のリフトアップ感が乗る。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-yaman-medi-lift-plus", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%83%A4%E3%83%BC%E3%83%9E%E3%83%B3%2B%E3%83%A1%E3%83%87%E3%82%A3%E3%83%AA%E3%83%95%E3%83%88%E3%83%97%E3%83%A9%E3%82%B9%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "dr-arrivo-zeus-2",
    category: "beauty",
    badge: "👑",
    name: { en: "Dr.Arrivo Zeus II", ja: "ドクターアリーヴォ ゼウスII" },
    description: {
      en: "298,000 yen luxury hand-held. Six modalities (LED, EMS, RF, ultrasound, ion, microcurrent), gold-plated electrodes. The home version of a Ginza clinic device.",
      ja: "298,000円のラグジュアリー機。LED・EMS・RF・超音波・イオン・微弱電流の6モード、金メッキ電極。銀座クリニック機の家庭版。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-dr-arrivo-zeus-2", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%83%89%E3%82%AF%E3%82%BF%E3%83%BC%E3%82%A2%E3%83%AA%E3%83%BC%E3%83%B4%E3%82%A9%2B%E3%82%BC%E3%82%A6%E3%82%B9II%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "aduro-7-plus-1",
    category: "beauty",
    badge: "🌈",
    name: { en: "Aduro 7+1 Light Therapy Mask", ja: "Aduro 7+1 ライトセラピーマスク" },
    description: {
      en: "30,000 yen entry mask. 7 colors plus near-infrared, rigid shell, tethered (no battery to fail). Best 'try before you commit' option.",
      ja: "30,000円のエントリー機。7色+近赤外、硬質シェル、電源接続式(電池故障なし)。「お試し」用途で最適。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-aduro-7-plus-1", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FAduro%2B7%2B%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "omnilux-contour-face",
    category: "beauty",
    badge: "🏥",
    name: { en: "Omnilux Contour Face", ja: "オムニルクス コンツアー フェース" },
    description: {
      en: "58,000 yen FDA-cleared mask. 633 nm + 830 nm dual wavelength, silicone flex. The model with the longest published clinical record.",
      ja: "58,000円のFDA認可マスク。633nm+830nmデュアル波長、シリコンフレックス。掲載論文数で最も実績のあるモデル。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-omnilux-contour-face", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FOmnilux%2BContour%2BFace%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Beauty / Shampoo (best-shampoo-2026) ─────────
  {
    id: "and-honey-deep-moist-shampoo",
    category: "beauty",
    badge: "🍯",
    name: { en: "&honey Deep Moist Shampoo", ja: "&honey Deep Moist シャンプー" },
    description: {
      en: "1,400 yen 440 mL drugstore moisture pick. Honey-based sulfate-free moisturizing formula that dominated the Japanese drugstore tier from 2018 onwards, refill pouches at roughly 20 percent cost-per-mL discount, widespread availability at Matsumoto Kiyoshi, Welcia, and Don Quijote. Heavy floral fragrance is the dominant complaint — the honey-and-rose scent lingers on pillows and the fragrance-sensitive crowd finds it overpowering; moisturizer load weighs down fine and limp hair so the volumizing crowd should look elsewhere; sulfate-free claim is real but the formula still includes silicones in moderate ratio so the silicone-free crowd should look at Olaplex No.4 instead.",
      ja: "1,400円440mLのドラッグストア保湿枠。2018年以降日本のドラッグストア枠を支配したハニー ベースの硫酸塩フリー保湿処方、mLあたりコスト約20%割引で詰替パウチ、マツモトキヨシ・ウエルシア・ドン キホーテで広く入手可能。重いフローラル フレグランスが支配的不満 — ハニー&ローズの香りは枕に残りフレグランス敏感層には圧倒的、保湿剤量が細毛と平らな髪を重くしボリュームアップ派は他を見るべき、硫酸塩フリー主張は本物だが処方は中程度の比率でシリコンを含むのでシリコンフリー派はOlaplex No.4を見るべき。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-and-honey-deep-moist-shampoo", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%26honey%2B%E3%82%B7%E3%83%A3%E3%83%B3%E3%83%97%E3%83%BC%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "botanist-damage-care-shampoo",
    category: "beauty",
    badge: "🌿",
    name: { en: "BOTANIST Damage Care Shampoo", ja: "BOTANIST ダメージケア シャンプー" },
    description: {
      en: "1,540 yen 490 mL botanical mid-tier pick. Botanical-positioned damage-care formula with mid-tier price and widespread Japanese drugstore availability, refill pouches at comparable savings, the brand has been a Pinterest-friendly daily-driver since 2015. Silicone-included formula divides reviewers — silicone buildup is heavier on porous and curly hair and clarifying washes every 4-6 weeks are needed to clear it; botanical fragrance fades within hours and the long-lasting fragrance crowd should look at Kerastase instead; formulation has been adjusted multiple times since 2015 and the 2026 version reviews differently from older versions, so older Rakuten reviews are partially out of date.",
      ja: "1,540円490mLのボタニカル中位枠。中位価格と広い日本のドラッグストア入手可能性のボタニカル ポジショニングのダメージ ケア処方、同等の節約で詰替パウチ、ブランドは2015年以降Pinterestフレンドリーな毎日使い。シリコン入り処方がレビュアーを分裂させる — シリコン蓄積はポーラスと巻き毛でより重く4-6週ごとにクラリファイング洗浄が必要、ボタニカル フレグランスは数時間以内に消え長持ちフレグランス派はKerastaseを見るべき、処方は2015年以来複数回調整され2026年版は古い版と異なるレビューを受けるため古い楽天レビューは部分的に古い。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-botanist-damage-care-shampoo", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FBOTANIST%2B%E3%82%B7%E3%83%A3%E3%83%B3%E3%83%97%E3%83%BC%2B%E3%83%80%E3%83%A1%E3%83%BC%E3%82%B8%E3%82%B1%E3%82%A2%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "olaplex-no4-bond-maintenance",
    category: "beauty",
    badge: "🔬",
    name: { en: "Olaplex No.4 Bond Maintenance Shampoo", ja: "Olaplex No.4 Bond Maintenance Shampoo" },
    description: {
      en: "4,840 yen 250 mL salon bond-repair pick. Patented bis-aminopropyl diglycol dimaleate formula re-forms broken disulfide bonds in chemically damaged and bleached hair, sulfate-free, silicone-light, the salon-grade maintenance shampoo paired with No.0 leave-on and No.3 pre-shower for the full bond-repair regimen. 30 dollars-plus per bottle works out to 5-7x the cost-per-wash of the drugstore tier and is only justified for bond-damaged hair — virgin or lightly heat-styled hair is overkill on the chemistry; no fragrance variety across the line so fragrance-sensitive users have no alternative scent option; US-formulation may feel different to Asian hair textures; No.4 alone without No.0 and No.3 underdelivers the bond repair the marketing implies.",
      ja: "4,840円250mLのサロン ボンド リペア枠。化学処理ダメージとブリーチ髪の切断されたジスルフィド結合を再形成する特許化されたビスアミノプロピルジグリコールジマレート処方、硫酸塩フリー、シリコン軽め、フル ボンド リペア レジメン用にNo.0リーブオンとNo.3シャワー前とペアリングするサロン グレード メンテナンス シャンプー。30ドル超/ボトルはドラッグストア枠の1回あたりコストの5-7倍で結合ダメージ髪のみに正当化される — バージンまたは軽く加熱スタイリング髪は化学が過剰、ライン全体でフレグランス バリエーションなし、米国処方はアジア髪テクスチャーには異なる感触の可能性、No.4単独でNo.0とNo.3なしではマーケティングが示唆するボンド リペアを過小提供。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-olaplex-no4-bond-maintenance", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FOlaplex%2BNo.4%2B%E3%82%B7%E3%83%A3%E3%83%B3%E3%83%97%E3%83%BC%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "mediquick-scalp-shampoo",
    category: "beauty",
    badge: "🩺",
    name: { en: "MEDIQUICK H Scalp Shampoo (Medicated)", ja: "メディクイックH 薬用スカルプシャンプー" },
    description: {
      en: "Around 1,800 yen medicated scalp-care pick. Medicated scalp shampoo (MEDIQUICK H or equivalent medicated scalp formula on the Japanese pharmacy market) with zinc pyrithione, piroctone olamine, or equivalent anti-dandruff active, formulated for itchy and flake-prone scalps with seborrheic irritation, available at pharmacy counters as quasi-drug or OTC. Clinical scent is recognizable and not pleasant — not in the same category as fragranced cosmetic shampoos and not for daily lifestyle use; surfactant base is drying for color-treated hair and color-fade is faster on this shampoo than on cosmetic alternatives; persistent scalp conditions deserve a dermatology consultation rather than continued shampoo escalation.",
      ja: "約1,800円の薬用スカルプ ケア枠。ピリチオン亜鉛・ピロクトン オラミンまたは同等の抗フケ有効成分付きの薬用スカルプ シャンプー(MEDIQUICK Hまたは日本の薬局市場上の同等の薬用スカルプ処方)、脂漏性トラブルのかゆい・フケ傾向の頭皮向けに処方、医薬部外品またはOTCとして薬局カウンターで入手可能。臨床的香りは認識可能で快いものではない — フレグランス化粧品シャンプーと同じカテゴリではなく毎日のライフスタイル使用向けではない、界面活性剤ベースはカラー処理髪には乾燥的で色落ちが化粧品代替品より速い、持続的頭皮状態はシャンプー エスカレーション継続より皮膚科診察に値する。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-mediquick-scalp-shampoo", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%82%B9%E3%82%AB%E3%83%AB%E3%83%97%2B%E3%82%B7%E3%83%A3%E3%83%B3%E3%83%97%E3%83%BC%2B%E8%96%AC%E7%94%A8%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "kerastase-bain-densite",
    category: "beauty",
    badge: "💎",
    name: { en: "Kerastase Bain Densite", ja: "ケラスターゼ DS バン デンシフィック" },
    description: {
      en: "5,500 yen 250 mL salon luxury density pick. Paris-luxury density-targeted shampoo from the Kerastase salon-imported line, formulated for thinning or density-concerned hair with hyaluronic acid and gluco-peptides, salon-grade fragrance and packaging, the brand has been a Pinterest-friendly luxury-aesthetic pick since the early 2010s. 5,500 yen for 250 mL works out to roughly 7x the drugstore cost-per-wash and the small bottle is not refill-friendly so the per-year cost is meaningfully higher; heavy perfumed fragrance is recognizable salon-luxury but perfume-sensitive users should sample before committing to the bottle; density claim is about perceived volume from formulation rather than actual hair regrowth and buyers expecting regrowth will be disappointed.",
      ja: "5,500円250mLのサロン ラグジュアリー密度枠。Kerastaseサロン輸入ラインからのパリ ラグジュアリー密度ターゲット シャンプー、ヒアルロン酸とグルコ ペプチドで薄毛または密度を気にする髪向けに処方、サロン グレードのフレグランスとパッケージング、ブランドは2010年代初頭以降Pinterestフレンドリーなラグジュアリー アエスティック ピック。250mLで5,500円はドラッグストアの1回あたりコストの約7倍で小ボトルは詰替フレンドリーでないため年間コストは意味のある高さ、重く香水のフレグランスはサロン ラグジュアリーで認識可能だが香水敏感ユーザーはボトルにコミットする前にサンプルすべき、密度主張は実際の発毛ではなく処方による知覚されるボリュームで再生を期待する買い手は失望。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-kerastase-bain-densite", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FKerastase%2B%E3%82%B7%E3%83%A3%E3%83%B3%E3%83%97%E3%83%BC%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Beauty / Sunscreen (best-sunscreen-2026) ─────────
  {
    id: "anessa-perfect-uv-spf50",
    category: "beauty",
    badge: "☀️",
    name: { en: "Anessa Perfect UV Sunscreen SPF50+ PA++++", ja: "アネッサ パーフェクトUV サンスクリーン SPF50+ PA++++" },
    description: {
      en: "Shiseido's outdoor-sport flagship, SPF50+ PA++++. Smart Response formula tightens into a more water-resistant film on contact with sweat or water. Requires double-cleansing to remove. Explicit weakness: white cast on deeper skin tones, eye sting under heavy perspiration, chalky finish over warm-toned bases.",
      ja: "資生堂のアウトドアスポーツ フラッグシップ、SPF50+ PA++++。汗や水に接触するとより耐水性の高い膜として引き締まるスマートレスポンス処方。ダブルクレンジングで除去必要。明確な弱点：深い肌色に白浮き、激しい発汗中の目のみしみし、温かみのあるベース上では白っぽく見える。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-anessa-perfect-uv-spf50", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%82%A2%E3%83%8D%E3%83%83%E3%82%B5%2B%E3%83%91%E3%83%BC%E3%83%95%E3%82%A7%E3%82%AF%E3%83%88UV%2BSPF50%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "la-roche-posay-anthelios-uvmune",
    category: "beauty",
    badge: "🇫🇷",
    name: { en: "La Roche-Posay Anthelios UVMune 400", ja: "ラロッシュポゼ アンテリオス UVミューン400" },
    description: {
      en: "European flagship SPF50+ with Mexoryl 400 filter blocking ultra-long UVA to 400nm. Fragrance-free, sensitive-skin tested. Now available via Rakuten import. Explicit weakness: ~¥3,500 per 50ml (most expensive in comparison), heavier texture than Japanese formulas, grey-market import availability varies.",
      ja: "超長波UVAを400nmまでブロックするMexoryl 400フィルター搭載の欧州フラッグシップSPF50+。無香料、敏感肌テスト済み。楽天市場の輸入在庫で入手可能。明確な弱点：50mlで約3,500円（比較中最高価格）、日本処方より重いテクスチャー、並行輸入在庫で入手性にばらつきあり。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-la-roche-posay-anthelios-uvmune", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%83%A9%E3%83%AD%E3%83%83%E3%82%B7%E3%83%A5%E3%83%9D%E3%82%BC%2B%E3%82%A2%E3%83%B3%E3%83%86%E3%83%AA%E3%82%AA%E3%82%B9%2BUV%E3%83%9F%E3%83%A5%E3%83%BC%E3%83%8C%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "biore-uv-aqua-rich-essence",
    category: "beauty",
    badge: "💧",
    name: { en: "Biore UV Aqua Rich Watery Essence SPF50+", ja: "ビオレUV アクア リッチ ウォータリーエッセンス SPF50+" },
    description: {
      en: "Kao's best-selling Japanese drugstore SPF50+ PA++++. Ultra-lightweight watery texture using Japan-only UV filter combinations. Under ¥1,000 per 70g. Explicit weakness: not water-resistant, PA++++ not yet PA5+, shorter reapplication interval needed in heavy sweat conditions.",
      ja: "花王の日本ドラッグストア最大ヒット、SPF50+ PA++++。日本限定UVフィルターの組み合わせによる超軽量ウォータリーテクスチャー。70gで1,000円以下。明確な弱点：耐水性なし、PA++++でPA5+未満、激しい発汗条件では標準より短い塗り直し間隔が必要。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-biore-uv-aqua-rich-essence", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%83%93%E3%82%AA%E3%83%AC%2BUV%2B%E3%82%A2%E3%82%AF%E3%82%A2%2B%E3%83%AA%E3%83%83%E3%83%81%2B%E3%82%A6%E3%82%A9%E3%83%BC%E3%82%BF%E3%83%AA%E3%83%BC%E3%82%A8%E3%83%83%E3%82%BB%E3%83%B3%E3%82%B9%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "eltamd-uv-clear-spf46",
    category: "beauty",
    badge: "🩺",
    name: { en: "EltaMD UV Clear SPF46", ja: "EltaMD UV Clear SPF46" },
    description: {
      en: "Dermatologist-recommended US brand with 9% transparent zinc oxide and 5% niacinamide for acne-prone and sensitive skin. Fragrance-free, oil-free. Available on Amazon Japan. Explicit weakness: SPF46 lower than SPF50+ standard, $40+ US pricing, heavier than Japanese watery formulas.",
      ja: "ニキビ肌・敏感肌向けに9%透明酸化亜鉛と5%ナイアシンアミドを配合した米国皮膚科推奨ブランド。無香料、オイルフリー。Amazon Japanで入手可能。明確な弱点：SPF46でSPF50+基準より低い、米国価格40ドル以上、日本のウォータリー処方より重いテクスチャー。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-eltamd-uv-clear-spf46", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FEltaMD%2BUV%2BClear%2BSPF46%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "skin-aqua-tone-up-lavender",
    category: "beauty",
    badge: "💜",
    name: { en: "Skin Aqua Tone Up UV Essence (Lavender)", ja: "スキンアクア トーンアップUVエッセンス ラベンダー" },
    description: {
      en: "Rohto's color-correcting tinted SPF50+ PA++++. Lavender pigment neutralizes yellow and sallow undertones on East Asian complexions for a brightening finish. Under ¥1,000 per 80g. Explicit weakness: lavender tint reads as purple-grey on deeper skin tones (Fitzpatrick IV+), mild water resistance only, no skincare active benefit.",
      ja: "ロートの色補正ティント入りSPF50+ PA++++。ラベンダー顔料が東アジアの肌色の黄色みとくすみを中和して明るい仕上がりを実現。80gで1,000円以下。明確な弱点：フィッツパトリックIV以上の肌色にラベンダーティントが紫がかったグレーに見える、耐水性は軽度のみ、スキンケア有効成分なし。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-skin-aqua-tone-up-lavender", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%82%B9%E3%82%AD%E3%83%B3%E3%82%A2%E3%82%AF%E3%82%A2%2B%E3%83%88%E3%83%BC%E3%83%B3%E3%82%A2%E3%83%83%E3%83%97%2BUV%2B%E3%83%A9%E3%83%99%E3%83%B3%E3%83%80%E3%83%BC%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Beauty / Face Washes (best-face-wash-2026) ─────────
  {
    id: "cerave-hydrating-facial-cleanser",
    category: "beauty",
    badge: "💙",
    name: { en: "CeraVe Hydrating Facial Cleanser", ja: "CeraVe ハイドレーティング フェイシャル クレンザー" },
    description: {
      en: "Non-foaming pump cleanser with ceramide complex (NP, AP, EOP), hyaluronic acid, and niacinamide. AAD-recommended for dry and sensitive skin. Fragrance-free, non-comedogenic. Explicit weakness: non-foam texture fails the sensory expectations of users who equate lather with cleansing; pump nozzle clogs when cleanser dries in the tip; requires prior oil-cleanse for heavy SPF or waterproof makeup removal.",
      ja: "セラミドコンプレックス（NP・AP・EOP）、ヒアルロン酸、ナイアシンアミドの非泡立てポンプ洗顔料。乾燥・敏感肌に米国皮膚科学会（AAD）推奨。無香料・非コメドジェニック。明確な弱点：非泡立てのテクスチャーが洗浄感を求めるユーザーの感覚的期待に応えない；ポンプノズルが先端で詰まりやすい；重SPFや防水メイクには前段のオイルクレンジングが必要。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-cerave-hydrating-facial-cleanser", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FCeraVe%2B%E6%B4%97%E9%A1%94%E6%96%99%2B%E4%BF%9D%E6%B9%BF%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "kose-softymo-speedy-cleansing",
    category: "beauty",
    badge: "🇯🇵",
    name: { en: "Kose Softymo Speedy Cleansing Oil", ja: "コーセー ソフティモ スピーディ クレンジングオイル" },
    description: {
      en: "Japanese drugstore oil cleanser that emulsifies with water to a milky rinse, removing makeup and SPF in one step. Under ¥1,000 for 230ml. Explicit weakness: not suitable for bare no-SPF skin (over-cleansing risk); silicone content divides long-term reviewers; fragrance present — unsuitable for reactive or sensitive skin.",
      ja: "水と混ぜて乳化リンスになり、メイクとSPFをワンステップで除去する日本のドラッグストアのオイルクレンザー。230mlで1,000円以下。明確な弱点：SPFなしの素肌には不適（過洗顔リスク）；シリコン含量が長期レビューで賛否；香料が含まれており反応性・敏感肌には不適。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-kose-softymo-speedy-cleansing", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%82%B3%E3%83%BC%E3%82%BB%E3%83%BC%2B%E3%82%BD%E3%83%95%E3%83%86%E3%82%A3%E3%83%A2%2B%E6%B4%97%E9%A1%94%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "the-ordinary-squalane-cleanser",
    category: "beauty",
    badge: "🌿",
    name: { en: "The Ordinary Squalane Cleanser", ja: "The Ordinary スクワランクレンザー" },
    description: {
      en: "Balm-to-oil cleanser with plant-derived squalane. Removes SPF and waterproof makeup without sulfate surfactants. Fragrance-free, silicone-free, non-comedogenic. Explicit weakness: requires thorough emulsification with wet hands or leaves residue; too heavy for very oily skin as standalone; 50ml tube empties faster than expected.",
      ja: "植物由来スクワランのバームtoオイル洗顔料。硫酸系界面活性剤なしにSPFと防水メイクを除去。無香料・シリコンフリー・非コメドジェニック。明確な弱点：濡れた手でしっかり乳化しないと残留物が出る；非常に油性な肌のスタンドアローン使用には重すぎる；50mlチューブが予想より早く空になる。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-the-ordinary-squalane-cleanser", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FThe%2BOrdinary%2B%E3%82%B9%E3%82%AF%E3%83%AF%E3%83%A9%E3%83%B3%2B%E3%82%AF%E3%83%AC%E3%83%B3%E3%82%B6%E3%83%BC%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "shiseido-senka-perfect-whip",
    category: "beauty",
    badge: "🫧",
    name: { en: "Shiseido Senka Perfect Whip", ja: "専科 パーフェクトホイップ 洗顔料" },
    description: {
      en: "Dense-foam facial cleanser with hydrolyzed collagen and silk extract. Long-running Japanese drugstore bestseller, under ¥700 for 120g. Explicit weakness: fragrance present — unsuitable for reactive skin and rosacea; collagen molecules too large to penetrate skin in a rinse-off product; foam net required for advertised lather but not included.",
      ja: "加水分解コラーゲンとシルクエキス配合の濃密泡洗顔料。日本のドラッグストアで長年のベストセラー、120gで700円以下。明確な弱点：香料が含まれており反応性肌・酒さに不適；洗い流し製品でコラーゲン分子は肌バリアを透過できない；宣伝の泡立てには同梱されていない洗顔ネットが必要。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-shiseido-senka-perfect-whip", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E5%B0%82%E7%A7%91%2B%E3%83%91%E3%83%BC%E3%83%95%E3%82%A7%E3%82%AF%E3%83%88%E3%83%9B%E3%82%A4%E3%83%83%E3%83%97%2B%E6%B4%97%E9%A1%94%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "la-roche-posay-toleriane-cleanser",
    category: "beauty",
    badge: "🇫🇷",
    name: { en: "La Roche-Posay Toleriane Hydrating Gentle Cleanser", ja: "ラロッシュポゼ トレリアン ハイドレーティング ジェントル クレンザー" },
    description: {
      en: "Non-foaming cleanser with thermal spring water, glycerin, and niacinamide. Zero fragrance, zero alcohol, minimal preservatives. Recommended by Japanese dermatologists for sensitized and post-procedure skin. Explicit weakness: ~¥2,500–3,000 for 400ml (most expensive per-ml in comparison); too gentle for heavy SPF or waterproof makeup removal alone; texture feels 'underpowered' to foam-cleanser users.",
      ja: "温泉水・グリセリン・ナイアシンアミドの非泡立てクレンザー。無香料・無アルコール・最小限の防腐剤プロファイル。過敏・施術後の肌に日本の皮膚科医推奨。明確な弱点：400mlで約2,500〜3,000円（比較中1ml当たり最高コスト）；重SPFや防水メイクの単独除去には優しすぎる；泡立てクレンザーのユーザーには「物足りない」テクスチャー。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-la-roche-posay-toleriane-cleanser", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%83%A9%E3%83%AD%E3%83%83%E3%82%B7%E3%83%A5%E3%83%9D%E3%82%BC%2B%E3%83%88%E3%83%AC%E3%83%AA%E3%82%A2%E3%83%B3%2B%E6%B4%97%E9%A1%94%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Home / Air Purifiers (best-air-purifier-2026) ─────────
  {
    id: "dyson-purifier-cool-gen1",
    category: "home",
    badge: "🌪️",
    name: { en: "Dyson Purifier Cool Gen1", ja: "ダイソン ピュリファイアー クール Gen1" },
    description: {
      en: "~80,000 yen HEPA H13 + activated carbon fan-purifier combo. 290° airflow projection, LCD air quality display, auto mode. Weakness: loud at max fan speed, expensive body price, annual filter ~6,000 yen, no humidifying.",
      ja: "約8万円のHEPA H13＋活性炭ファン＋空気清浄一体型。290°気流投射、LCD空気質ディスプレイ、オートモード。弱点：最高速度で騒音あり、本体高価、年間フィルター約6,000円、加湿機能なし。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-dyson-purifier-cool-gen1", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%83%80%E3%82%A4%E3%82%BD%E3%83%B3%2B%E7%A9%BA%E6%B0%97%E6%B8%85%E6%B5%84%E6%A9%9F%2B%E3%83%94%E3%83%A5%E3%83%AA%E3%83%95%E3%82%A1%E3%82%A4%E3%83%A3%E3%83%BC%2B%E3%82%AF%E3%83%BC%E3%83%AB%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "sharp-plasmacluster-fp-j80",
    category: "home",
    badge: "🇯🇵",
    name: { en: "Sharp Plasmacluster FP-J80", ja: "シャープ プラズマクラスター FP-J80" },
    description: {
      en: "~50,000 yen Japanese brand. Plasmacluster ion technology, 24-hour monitoring, pollen/PM2.5 sensor, quiet night mode, 10-year HEPA. Weakness: ion efficacy evidence mostly in-house, larger footprint, 2-3 year deodorising filter.",
      ja: "約5万円の国内ブランド。プラズマクラスターイオン技術、24時間監視、花粉/PM2.5センサー、静音ナイトモード、10年HEPA。弱点：イオン有効性根拠は主に社内研究、大きなフットプリント、2〜3年脱臭フィルター。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-sharp-plasmacluster-fp-j80", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%82%B7%E3%83%A3%E3%83%BC%E3%83%97%2B%E3%83%97%E3%83%A9%E3%82%BA%E3%83%9E%E3%82%AF%E3%83%A9%E3%82%B9%E3%82%BF%E3%83%BC%2BFP-J80%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "panasonic-f-vxu90",
    category: "home",
    badge: "💨",
    name: { en: "Panasonic F-VXU90", ja: "パナソニック F-VXU90 空気清浄機" },
    description: {
      en: "~50,000 yen Japanese brand. nanoe X ion + HEPA, pollen/humidity/PM2.5 triple sensor, slim design, app-connected. Weakness: nanoe X research mostly in-house, mid-range price, 2-year filter interval.",
      ja: "約5万円の国内ブランド。ナノイーX＋HEPA、花粉/湿度/PM2.5トリプルセンサー、スリム設計、アプリ接続。弱点：ナノイーX研究は主に社内、中価格帯、2年フィルター交換。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-panasonic-f-vxu90", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%83%91%E3%83%8A%E3%82%BD%E3%83%8B%E3%83%83%E3%82%AF%2BF-VXU90%2B%E7%A9%BA%E6%B0%97%E6%B8%85%E6%B5%84%E6%A9%9F%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "blueair-blue-max-3250i",
    category: "home",
    badge: "🇸🇪",
    name: { en: "Blueair Blue Max 3250i", ja: "ブルーエア Blue Max 3250i" },
    description: {
      en: "~45,000 yen Swedish brand. HEPASilent dual-filtration (electrostatic + mechanical), ultra-quiet <17dB sleep mode, covers 40m². Weakness: no built-in humidity display, filter ~5,000 yen every 6 months, app setup fiddly.",
      ja: "約4万5,000円のスウェーデンブランド。HEPASilentデュアルフィルタリング（静電＋機械）、超静音17dB未満スリープモード、40m²対応。弱点：湿度ディスプレイなし、フィルター6ヶ月ごと約5,000円、アプリ設定がやや難。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-blueair-blue-max-3250i", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%83%96%E3%83%AB%E3%83%BC%E3%82%A8%E3%82%A2%2BBlue%2BMax%2B3250i%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Tech / Rental servers (conoha-wing-review-2026, best-rental-server-jp-2026) ─────────
  {
    id: "conoha-wing",
    category: "tech",
    badge: "🚀",
    name: { en: "ConoHa WING", ja: "ConoHa WING" },
    description: {
      en: "GMO's high-speed rental server. WordPress kantan setup in 10 minutes, free initial fee, JP datacenter. Beginner-friendly admin panel.",
      ja: "GMOの高速レンタルサーバー。WordPressかんたんセットアップ10分、初期費用無料、国内DC。管理画面が初心者向け。",
    },
    links: [
      { network: "moshimo", productId: "conoha-wing-jp", markets: ["JP"], approved: false },
    ],
  },
  {
    id: "xserver",
    category: "tech",
    badge: "🏛️",
    name: { en: "Xserver", ja: "エックスサーバー" },
    description: {
      en: "Long-running JP shared hosting. Strong uptime track record, 24/7 phone support, KUSANAGI-tuned WordPress.",
      ja: "国内シェアードホスティングの老舗。稼働実績・24時間電話サポート、KUSANAGI最適化WordPress。",
    },
    links: [
      { network: "a8", productId: "xserver-jp", markets: ["JP"], approved: false },
    ],
  },
  {
    id: "lolipop-server",
    category: "tech",
    badge: "💴",
    name: { en: "Lolipop!", ja: "ロリポップ！" },
    description: {
      en: "GMO's budget plan. From 220 yen/month, hi-speed plan at 550 yen. Best for hobbyist blogs and tight budgets.",
      ja: "GMOの低価格プラン。月220円から、ハイスピードプランで月550円。趣味ブログ・低予算向けの定番。",
    },
    links: [
      { network: "moshimo", productId: "lolipop-jp", markets: ["JP"], approved: false },
    ],
  },
  {
    id: "sakura-rentalserver",
    category: "tech",
    badge: "🌸",
    name: { en: "Sakura Rental Server", ja: "さくらのレンタルサーバ" },
    description: {
      en: "JP-domestic veteran since 1996. Standard plan from 425 yen/month. The most-tenured shared host in Japan.",
      ja: "1996年創業の国内老舗。スタンダードで月425円から。日本で最も歴史のある共有ホスティング。",
    },
    links: [
      { network: "a8", productId: "sakura-rentalserver-jp", markets: ["JP"], approved: false },
    ],
  },
  {
    id: "mixhost",
    category: "tech",
    badge: "⚡",
    name: { en: "mixhost", ja: "mixhost" },
    description: {
      en: "LiteSpeed-based JP host. Standard plan ~968 yen/month. Strong on raw HTTP/3 throughput, all-in-one bundling.",
      ja: "LiteSpeed採用の国内ホスト。スタンダードで月968円。HTTP/3の生スループットと一括バンドルが強み。",
    },
    links: [
      { network: "a8", productId: "mixhost-jp", markets: ["JP"], approved: false },
    ],
  },
  {
    id: "coway-airmega-200m",
    category: "home",
    badge: "🇰🇷",
    name: { en: "Coway Airmega 200M", ja: "コウェイ アイレーマ200M" },
    description: {
      en: "~20,000 yen Korean brand. 2-stage True HEPA + carbon, LED air quality ring indicator, 18m² coverage. Weakness: smaller coverage, no ion technology, 6-month filter intervals, lower brand recognition in Japan.",
      ja: "約2万円の韓国ブランド。2段階True HEPA＋活性炭、LEDリングインジケーター、18m²対応。弱点：対応面積小さめ、イオン技術なし、6ヶ月フィルター交換、日本でのブランド認知度低め。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-coway-airmega-200m", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%82%B3%E3%82%A6%E3%82%A7%E3%82%A4%2B%E7%A9%BA%E6%B0%97%E6%B8%85%E6%B5%84%E6%A9%9F%2B%E3%82%A2%E3%82%A4%E3%83%AC%E3%83%BC%E3%83%9E%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Home / Humidifiers (best-humidifier-2026) ─────────
  {
    id: "dyson-purifier-humidify-cool",
    category: "home",
    badge: "💧",
    name: { en: "Dyson Purifier Humidify+Cool Formaldehyde", ja: "ダイソン ピュリファイアー加湿空気清浄機 フォルムアルデヒド" },
    description: {
      en: "~100,000+ yen HEPA H13 purifier + UV-C ultrasonic humidifier + bladeless fan combo. Formaldehyde sensor, auto humidity sensing. Weakness: highest price in category, monthly demineralization cartridge, large footprint, complex three-consumable maintenance.",
      ja: "10万円超のHEPA H13空気清浄機＋UV-C超音波加湿器＋羽根なしファン一体型。ホルムアルデヒドセンサー・自動湿度センシング。弱点：最高価格、月次脱ミネラルカートリッジ交換、大型フットプリント、3種消耗品のメンテナンス複雑性。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-dyson-purifier-humidify-cool", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%83%80%E3%82%A4%E3%82%BD%E3%83%B3%2B%E5%8A%A0%E6%B9%BF%E7%A9%BA%E6%B0%97%E6%B8%85%E6%B5%84%E6%A9%9F%2B%E3%83%95%E3%82%A9%E3%83%AB%E3%83%A0%E3%82%A2%E3%83%AB%E3%83%87%E3%83%92%E3%83%89%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "panasonic-fe-kxu07",
    category: "home",
    badge: "🇯🇵",
    name: { en: "Panasonic FE-KXU07", ja: "パナソニック 加湿器 FE-KXU07" },
    description: {
      en: "Japanese brand ultrasonic-evaporative hybrid with nanoe X ion technology. JEMA-standard humidity labeling, quiet, auto humidity sensing. Weakness: weekly filter cleaning in hard-water areas, nanoe X efficacy debate, Japan-domestic availability.",
      ja: "ナノイーXイオン技術搭載の国内ブランド超音波気化ハイブリッド加湿器。JEMA規格湿度表示・静音・自動湿度センシング。弱点：硬水地域で週次フィルター清掃必要、ナノイーX効果論争、日本国内流通が主流。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-panasonic-fe-kxu07", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%83%91%E3%83%8A%E3%82%BD%E3%83%8B%E3%83%83%E3%82%AF%2B%E5%8A%A0%E6%B9%BF%E5%99%A8%2BFE-KXU07%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "balmuda-rain",
    category: "home",
    badge: "🌧️",
    name: { en: "Balmuda Rain", ja: "バルミューダ レイン 加湿器" },
    description: {
      en: "~35,000 yen iconic Japanese designer evaporative humidifier. No white dust, auto humidity sensing, quiet, beautiful aesthetic. Weakness: coverage capped at 14m², ~3,000 yen/season filter replacement, low output vs price, not for large rooms.",
      ja: "約3万5,000円の日本製デザイナー気化式加湿器。白い粉なし・自動湿度センシング・静音・美しいデザイン。弱点：対応面積最大14m²、1シーズン約3,000円フィルター交換、価格対加湿能力が低め、広い部屋向きでない。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-balmuda-rain", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%83%90%E3%83%AB%E3%83%9F%E3%83%A5%E3%83%BC%E3%83%80%2B%E3%83%AC%E3%82%A4%E3%83%B3%2B%E5%8A%A0%E6%B9%BF%E5%99%A8%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "levoit-classic-300s",
    category: "home",
    badge: "📱",
    name: { en: "Levoit Classic 300S Ultrasonic Humidifier", ja: "Levoit 加湿器 超音波式 Classic 300S" },
    description: {
      en: "~9,000-12,000 yen (Rakuten import) smart ultrasonic, app+voice control, auto mode, 6L tank. Most affordable smart pick. Weakness: white dust from tap water, no UV-C, weekly tank cleaning required, sensor accuracy placement-dependent.",
      ja: "約9,000〜12,000円（楽天輸入）スマート超音波式、アプリ＋音声操作、オートモード、6Lタンク。最も手頃なスマート加湿器。弱点：水道水で白い粉発生、UV-Cなし、週次タンク清掃必要、センサー精度が設置場所依存。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-levoit-classic-300s", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FLevoit%2B%E5%8A%A0%E6%B9%BF%E5%99%A8%2B%E8%B6%85%E9%9F%B3%E6%B3%A2%E5%BC%8F%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "stadler-form-oskar",
    category: "home",
    badge: "🇨🇭",
    name: { en: "Stadler Form Oskar", ja: "Stadler Form オスカー 加湿器" },
    description: {
      en: "~30,000 yen Swiss design evaporative drum humidifier. 45m² coverage, award-winning design (iF, Red Dot), no white dust, quiet for bedroom. Weakness: weekly drum cleaning, large tank hard to fill in narrow sinks, no smart connectivity.",
      ja: "約3万円のスイスデザイン気化式ドラム型加湿器。45m²対応、iF・Red Dot受賞デザイン、白い粉なし、寝室対応の静音性。弱点：週次ドラム清掃、狭い流し台での大型タンク補水が困難、スマート接続なし。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-stadler-form-oskar", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FStadler%2BForm%2B%E3%82%AA%E3%82%B9%E3%82%AB%E3%83%BC%2B%E5%8A%A0%E6%B9%BF%E5%99%A8%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Home / Robot Vacuums (best-robot-vacuum-2026) ─────────
  {
    id: "roborock-s8-pro-ultra",
    category: "home",
    badge: "🤖",
    name: { en: "Roborock S8 Pro Ultra", ja: "ロボロック S8 Pro Ultra" },
    description: {
      en: "179,800 yen flagship. 6,000 Pa suction, dual-spinning mop pads with auto-lift, LiDAR mapping, fully automated dock (self-empty + hot-water mop wash + auto-refill).",
      ja: "179,800円のフラッグシップ。6,000Pa吸引、ラグ上で自動リフトする2連回転モップ、LiDARマッピング、ゴミ捨て+お湯モップ洗浄+自動給水を全自動でこなすドック。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-roborock-s8-pro-ultra", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FRoborock%2BS8%2BPro%2BUltra%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "irobot-roomba-j7-plus",
    category: "home",
    badge: "🐾",
    name: { en: "iRobot Roomba j7+", ja: "iRobot ルンバ j7+" },
    description: {
      en: "99,800 yen pet-household pick. PrecisionVision pet-poop avoidance (best in category), self-empty dock. Note: vacuum-only — Combo j7+ is the mop variant.",
      ja: "99,800円のペット世帯向け本命。PrecisionVisionによるペット排泄物回避はカテゴリ最強、自動ゴミ収集ドック搭載。本機は吸引専用 — 水拭き対応はCombo j7+の別モデル。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-irobot-roomba-j7-plus", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FRoomba%2Bj7%252B%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "eufy-x10-pro-omni",
    category: "home",
    badge: "💪",
    name: { en: "Anker Eufy RoboVac X10 Pro Omni", ja: "Anker Eufy RoboVac X10 Pro Omni" },
    description: {
      en: "99,990 yen value pick. 8,000 Pa suction (highest in this list), dual rotating mops, full self-wash + self-empty dock. Camera+gyro mapping is rougher than LiDAR rivals for first 2-3 runs.",
      ja: "99,990円のコスパ枠。8,000Pa吸引(本リスト最高値)、2連回転モップ、自動洗浄+自動ゴミ収集ドック。カメラ+ジャイロ式マッピングは最初の2-3回はLiDAR勢より粗い。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-eufy-x10-pro-omni", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FEufy%2BX10%2BPro%2BOmni%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "switchbot-k10-plus",
    category: "home",
    badge: "📏",
    name: { en: "SwitchBot K10+", ja: "SwitchBot K10+" },
    description: {
      en: "59,800 yen slim specialist. 9.2 cm body height fits under low Japanese furniture. 2,500 Pa (lowest in this list), self-empty dock, drag-style microfiber mop only.",
      ja: "59,800円の薄型特化機。本体高9.2cmで日本の低めの家具下に入る。2,500Pa(本リスト最弱)、自動ゴミ収集ドック、引きずり式マイクロファイバーモップのみ。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-switchbot-k10-plus", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FSwitchBot%2BK10%252B%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "dyson-360-vis-nav",
    category: "home",
    badge: "🇬🇧",
    name: { en: "Dyson 360 Vis Nav", ja: "Dyson 360 Vis Nav" },
    description: {
      en: "189,200 yen British flagship. 360-degree fisheye camera mapping, twin-channel digital motor suction. No self-empty dock and no mop function at this price.",
      ja: "189,200円の英国フラッグシップ。360度魚眼カメラ・マッピング、デジタルモーターの2系統吸引。この価格帯で自動ゴミ収集ドックなし・水拭き機能なし。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-dyson-360-vis-nav", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FDyson%2B360%2BVis%2BNav%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Beauty / Hair Dryers (best-hair-dryer-2026) ─────────
  {
    id: "dyson-supersonic-nural",
    category: "beauty",
    badge: "💨",
    name: { en: "Dyson Supersonic Nural", ja: "Dyson Supersonic Nural" },
    description: {
      en: "66,000 yen Pinterest favorite. V9 digital motor, scalp-distance sensor that throttles heat in real time, magnetic attachments. Fastest dry on long thick hair — 720 g body fatigues the wrist on 10-minute sessions.",
      ja: "66,000円のPinterest人気機。V9デジタルモーター、頭皮距離センサーがリアルタイムで熱を絞る、マグネット式アタッチメント。長く厚い髪で乾燥時間最短 — 720gボディは10分セッションで手首が疲れる。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-dyson-supersonic-nural", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FDyson%2BSupersonic%2BNural%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "refa-beautech-dryer-pro",
    category: "beauty",
    badge: "✂️",
    name: { en: "ReFa BEAUTECH DRYER PRO", ja: "リファ ビューテック ドライヤー プロ" },
    description: {
      en: "49,500 yen salon-pro pick. Pro-Sense Hybrid Sensor reads temperature 200x per second to keep airflow under hair-damage threshold. Genuinely milder than Dyson — 1-2 minutes longer on cold mornings.",
      ja: "49,500円のサロンプロ機。プロセンス・ハイブリッドセンサーが1秒200回計測し、髪のダメージしきい値を超えないよう熱を制御。Dysonより明らかに優しい温風で、冬の朝は1-2分余分にかかる。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-refa-beautech-dryer-pro", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FReFa%2BBEAUTECH%2BDRYER%2BPRO%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "lepronizer-7d-plus",
    category: "beauty",
    badge: "👑",
    name: { en: "Lepronizer 7D Plus", ja: "レプロナイザー 7D Plus" },
    description: {
      en: "77,000 yen top-of-range. Bioprogramming technology, the brand's proprietary frequency claim. Excellent build with 8-10 year lifespan — but the science behind Bioprogramming is not externally peer-reviewed.",
      ja: "77,000円の最上位機。バイオプログラミング技術、ブランド独自の周波数理論。優れた筐体品質と8-10年寿命 — ただしバイオプログラミングの科学的機序は外部の査読論文では検証されていない。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-lepronizer-7d-plus", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%83%AC%E3%83%97%E3%83%AD%E3%83%8A%E3%82%A4%E3%82%B6%E3%83%BC%2B7D%2BPlus%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "panasonic-nanocare-ehna0j",
    category: "beauty",
    badge: "🇯🇵",
    name: { en: "Panasonic Nanocare EH-NA0J", ja: "パナソニック ナノケア EH-NA0J" },
    description: {
      en: "35,000 yen mainstream value pick. High-Penetration Mineralized Nanoe, scalp mode that holds about 60°C against the skin. Domestic service network is the longest. Nozzle attachments are clunkier than Dyson's magnetic system.",
      ja: "35,000円の国内コスパ枠。高浸透ナノイー、頭皮モードで肌に対し約60℃をキープ。国内サービス網は最長。ノズルアタッチメントは Dyson のマグネット式ほど細かい角度調整ができない。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-panasonic-nanocare-ehna0j", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FPanasonic%2B%E3%83%8A%E3%83%8E%E3%82%B1%E3%82%A2%2BEH-NA0J%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "sharp-plasmacluster-ibwx901",
    category: "beauty",
    badge: "💴",
    name: { en: "Sharp Plasmacluster IB-WX901", ja: "シャープ プラズマクラスター IB-WX901" },
    description: {
      en: "18,000 yen value pick. Plasmacluster ions, drape-flow 60°C mode, lightweight 595 g body. Motor lifespan is the shortest in this list — 2-3 year replacements are common in long-term reviews.",
      ja: "18,000円のコスパ枠。プラズマクラスターイオン、ドレープフロー60℃モード、軽量595gボディ。モーター寿命は本リスト最短 — 長期レビューで2-3年買い替えが珍しくない。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-sharp-plasmacluster-ibwx901", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FSHARP%2B%E3%83%97%E3%83%A9%E3%82%BA%E3%83%9E%E3%82%AF%E3%83%A9%E3%82%B9%E3%82%BF%E3%83%BC%2BIB-WX901%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Beauty / Hair Straighteners (best-hair-straightener-2026) ─────────
  {
    id: "dyson-corrale-straightener",
    category: "beauty",
    badge: "🔋",
    name: { en: "Dyson Corrale", ja: "Dyson Corrale" },
    description: {
      en: "~60,000 yen cordless straightener. Flex plates conform to hair shape for full contact, 30-min battery, universal 100-240V charger. Brand claims 30% less heat damage — from Dyson's own lab, not independently replicated. 30 min is a hard ceiling for long or thick hair.",
      ja: "約60,000円のコードレスアイロン。フレックスプレートが毛束の形状に密着、30分バッテリー、100〜240V対応充電器。「ダメージ30%削減」はDyson自社ラボデータ、独立検証なし。長い・多い髪では30分で終わらない場合あり。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-dyson-corrale-straightener", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FDyson%2BCorrale%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "ghd-platinum-plus",
    category: "beauty",
    badge: "🌡️",
    name: { en: "GHD Platinum+", ja: "GHD Platinum+" },
    description: {
      en: "~35,000 yen professional-standard straightener. Fixed 185°C predictive heating reads temperature 250x per second. Removes temperature decision-making entirely. No domestic Japan service center — warranty via importer.",
      ja: "約35,000円のプロフェッショナル標準機。固定185°C予測ヒーティングが1秒250回計測。温度設定の判断を完全に省ける。日本国内修理センターなし — 保証は輸入代理店経由。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-ghd-platinum-plus", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FGHD%2BPlatinum%2B%E3%83%97%E3%83%A9%E3%82%B9%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "panasonic-nanocare-eh-hs0e",
    category: "beauty",
    badge: "🇯🇵",
    name: { en: "Panasonic Nanocare EH-HS0E", ja: "パナソニック ナノケア EH-HS0E" },
    description: {
      en: "~25,000 yen Japan No.1 pick. Nanoe double-ion moisture delivery, 130-200°C range, domestic service network. 100V only — cannot be used abroad without a voltage converter.",
      ja: "約25,000円の国内人気No.1。ナノイーダブルイオン水分補給、130〜200°C可変、国内サービス網完備。100V専用 — 変圧器なしの海外使用不可。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-panasonic-nanocare-eh-hs0e", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FPanasonic%2B%E3%83%8A%E3%83%8E%E3%82%B1%E3%82%A2%2BEH-HS0E%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "remington-s9500-pearl",
    category: "beauty",
    badge: "💎",
    name: { en: "Remington S9500 Pearl", ja: "Remington S9500 Pearl" },
    description: {
      en: "~8,000 yen entry ceramic pick. 9 heat settings, 230°C max, 60-second heat-up. Ceramic coating wears thin after 12-18 months of daily use — plan to replace.",
      ja: "約8,000円のエントリーセラミック枠。9段階温度設定、最大230°C、60秒加熱。セラミックコーティングは毎日使用で12〜18ヶ月で摩耗 — 買い替え前提の選択。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-remington-s9500-pearl", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FRemington%2BS9500%2BPearl%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "babyliss-st330e",
    category: "beauty",
    badge: "💄",
    name: { en: "BaByliss ST330E", ja: "BaByliss ST330E" },
    description: {
      en: "~15,000 yen ceramic-titanium value pro pick. 235°C max, 60-second heat-up, Amazon JP top seller. Manual temperature only — no predictive tech. 235°C causes rapid damage on fine or color-treated hair without active user restraint.",
      ja: "約15,000円のセラミック+チタン中価格プロ向け。最大235°C、60秒加熱、Amazon JP人気上位。予測技術なし手動温度制御のみ。細い髪・カラーリング毛を235°Cで使うと急速にダメージ。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-babyliss-st330e", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FBaByliss%2BST330E%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Home / Rice Cookers (best-rice-cooker-2026) ─────────
  {
    id: "zojirushi-stan-nw-sa10",
    category: "home",
    badge: "🎨",
    name: { en: "Zojirushi STAN. NW-SA10", ja: "象印 STAN. NW-SA10" },
    description: {
      en: "45,000 yen designer-kitchen 5.5-go IH. Matte black housing, minimal display, sized for a Tokyo 1LDK counter. Inner pot is the thinnest in this list — heat-retention window is shorter at around 4 hours.",
      ja: "45,000円のデザイン家電5.5合IH。マットブラック筐体、最小限のディスプレイ、東京1LDKカウンターサイズ。内釜は本リスト最薄で、保温有効時間は約4時間と短め。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-zojirushi-stan-nw-sa10", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E8%B1%A1%E5%8D%B0%2BSTAN%2BNW-SA10%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "tiger-jpi-y100",
    category: "home",
    badge: "🍚",
    name: { en: "Tiger JPI-Y100 (Tsuchinabe Gohoubi)", ja: "タイガー JPI-Y100(土鍋ご泡火炊き)" },
    description: {
      en: "80,000 yen daily-driver flagship. Genuine clay-pot inner ring + pressure IH gives the glossiest separated-grain texture in this list. 6.3 kg weight is the trade; clay inner pot is brittle to drops.",
      ja: "80,000円の毎日使いフラッグシップ。本物の土鍋内釜+圧力IHで本リスト最も艶のある分離粒食感。6.3kg重量はトレード;土鍋内釜は落下に脆い。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-tiger-jpi-y100", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%82%BF%E3%82%A4%E3%82%AC%E3%83%BC%2BJPI-Y100%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "panasonic-sr-v18ba",
    category: "home",
    badge: "👑",
    name: { en: "Panasonic SR-V18BA (Bistro 1-sho)", ja: "パナソニック SR-V18BA(ビストロ1升)" },
    description: {
      en: "150,000 yen 1-sho (10 go) Bistro. Full pressure-IH with AI heat curve, cooked rice reheats from frozen with the smallest texture loss in this list. 8.7 kg unit dominates a Japanese kitchen counter — overkill for 1-2 person daily use.",
      ja: "150,000円の1升(10合)ビストロ。完全圧力IH+AI熱カーブ、冷凍からの再加熱で食感ロスが本リスト最小。8.7kgは日本のキッチンカウンターを支配 — 1-2人の日常炊飯には過剰。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-panasonic-sr-v18ba", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FPanasonic%2BSR-V18BA%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "vermicular-rp23a",
    category: "home",
    badge: "🔥",
    name: { en: "Vermicular Ricepot RP23A", ja: "バーミキュラ ライスポット RP23A" },
    description: {
      en: "85,000 yen artisan pick. Cast-iron enamel inner pot heated externally by an induction ring — the pot doubles as a stovetop Dutch oven. Kamado-style texture; 60-minute cook cycle is the longest in this list.",
      ja: "85,000円の職人枠。鋳物ホーロー内釜を外部の誘導リングで加熱、ポットはコンロでダッチオーブンとしても使える2ピース構造。かまど食感、60分炊飯サイクルは本リスト最長。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-vermicular-rp23a", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%83%90%E3%83%BC%E3%83%9F%E3%82%AD%E3%83%A5%E3%83%A9%2B%E3%83%A9%E3%82%A4%E3%82%B9%E3%83%9D%E3%83%83%E3%83%88%2BRP23A%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "mitsubishi-honsumigama-nj-awb10",
    category: "home",
    badge: "🪨",
    name: { en: "Mitsubishi Honsumigama KAMADO NJ-AWB10", ja: "三菱 本炭釜 KAMADO NJ-AWB10" },
    description: {
      en: "99,800 yen connoisseur pick. Inner pot is a solid block of pure carbon machined into shape — distinct heat-retention curve, excellent sushi-rice quality. Inner pot is fragile; replacement runs around 38,000 yen with limited supply.",
      ja: "99,800円のコノサー枠。内釜は純粋な炭の塊を釜形状に削り出し — 独特の熱保持カーブ、寿司シャリ品質は優秀。内釜は脆く、交換は約38,000円で供給限定。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-mitsubishi-honsumigama-nj-awb10", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E4%B8%89%E8%8F%B1%2B%E6%9C%AC%E7%82%AD%E9%87%9C%2BNJ-AWB10%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Tech / Noise Cancelling Headphones (best-noise-cancelling-headphones-2026) ─────────
  {
    id: "sony-wh-1000xm5",
    category: "tech",
    badge: "🎧",
    name: { en: "Sony WH-1000XM5", ja: "ソニー WH-1000XM5" },
    description: {
      en: "45,000 yen all-around daily driver. Class-leading ANC tied with Bose for low-frequency cancellation, LDAC for Android hi-res, lightest 250 g among flagships, 30-hour battery. Multipoint Bluetooth is rough; call quality trails Bose; new headband doesn't fold flat.",
      ja: "45,000円の毎日使いオールラウンダー。低周波数キャンセル力でBoseとタイのクラス最強ANC、AndroidハイレゾLDAC対応、フラッグシップ中最軽量250g、30時間バッテリー。マルチポイントBluetoothはラフ、通話品質はBoseに劣後、新ヘッドバンドは折り畳めない。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-sony-wh-1000xm5", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FSony%2BWH-1000XM5%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "bose-quietcomfort-ultra",
    category: "tech",
    badge: "🔇",
    name: { en: "Bose QuietComfort Ultra Headphones", ja: "Bose QuietComfort Ultra Headphones" },
    description: {
      en: "59,400 yen ANC + call-quality leader. CustomTune ear-canal calibration, beamforming microphone array, Immersive Audio for movies. No LDAC; clamp force is firmer than Sony; Immersive Audio drops battery to 17-18 hours real-world.",
      ja: "59,400円のANC+通話品質リーダー。CustomTune耳道較正、ビームフォーミングマイクアレイ、映画用Immersive Audio。LDAC非対応、側圧はSonyより強め、Immersive Audioでバッテリーは実機17-18時間に低下。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-bose-quietcomfort-ultra", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FBose%2BQuietComfort%2BUltra%2BHeadphones%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "apple-airpods-max",
    category: "tech",
    badge: "🍎",
    name: { en: "Apple AirPods Max", ja: "Apple AirPods Max" },
    description: {
      en: "84,800 yen Apple-ecosystem maximalist pick. H1 chip handles seamless iPhone-iPad-Mac switching, premium aluminum and stainless build. 384.8 g is the heaviest by a wide margin; battery is not user-replaceable; outside the Apple ecosystem the magic disappears.",
      ja: "84,800円のAppleエコシステム・マキシマリスト解。H1チップでiPhone-iPad-Macシームレス切替、プレミアムなアルミ+ステンレス筐体。384.8gは大幅最重、バッテリーはユーザー交換不可、Appleエコシステム外では魔法が消える。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-apple-airpods-max", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FApple%2BAirPods%2BMax%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "sennheiser-momentum-4",
    category: "tech",
    badge: "🎵",
    name: { en: "Sennheiser Momentum 4 Wireless", ja: "Sennheiser Momentum 4 Wireless" },
    description: {
      en: "56,000 yen audiophile-leaning pick. Most natural sound signature for music listening, 60-hour battery (longest in this list), LDAC and aptX Adaptive supported. ANC is a step behind Sony XM5 and Bose QC Ultra for low-frequency rejection; Smart Control app is sluggish; build is plastic-heavy.",
      ja: "56,000円のオーディオファイル寄り選択。音楽鑑賞向け最ナチュラル音色、60時間バッテリー(本リスト最長)、LDACとaptX Adaptive対応。ANCはSony XM5とBose QC Ultraに対して低周波数遮断で一段劣る、Smart Controlアプリは動作が遅い、筐体はプラスチック多用。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-sennheiser-momentum-4", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FSennheiser%2BMomentum%2B4%2BWireless%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "anker-soundcore-space-q45",
    category: "tech",
    badge: "💴",
    name: { en: "Anker Soundcore Space Q45", ja: "Anker Soundcore Space Q45" },
    description: {
      en: "14,990 yen value pick. LDAC support (rare in this price tier), 50-hour ANC battery, reliable multipoint Bluetooth across OSes. Call mic is the weakest in this comparison; build is plastic-dominant; long-term reviews flag headband-pivot hinges as the failure point around 18 months.",
      ja: "14,990円のコスパ枠。LDAC対応(この価格帯では珍しい)、ANC有効50時間バッテリー、OS横断で安定動作するマルチポイント。通話マイクは本比較最弱、筐体はプラスチック中心、長期レビューはヘッドバンド回転ヒンジが18ヶ月時点の故障ポイントと指摘。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-anker-soundcore-space-q45", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FAnker%2BSoundcore%2BSpace%2BQ45%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Beauty / Skincare Fridges (best-skincare-fridge-2026) ─────────
  {
    id: "cooluli-mini-fridge-4l",
    category: "beauty",
    badge: "🧊",
    name: { en: "Cooluli Mini Fridge 4L", ja: "Cooluli Mini Fridge 4L" },
    description: {
      en: "9,800 yen Pinterest-default beauty fridge. Pastel colors (white/pink/mint/teal), near-silent Peltier cooling at 9-12°C, USB-C or AC input. 4 liters fills up faster than expected; 250 mL value-size moisturizers don't fit upright; door shelf is shallow.",
      ja: "9,800円のPinterest定番ビューティ冷蔵庫。パステル4色(ホワイト・ピンク・ミント・ティール)、ほぼ無音のペルチェ式9-12°C冷却、USB-CとAC両対応。4Lは思ったより早く埋まる、250mL徳用保湿は直立で入らない、ドアポケットは浅め。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-cooluli-mini-fridge-4l", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FCooluli%2BMini%2BFridge%2B4L%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "astroai-mini-fridge-6l",
    category: "beauty",
    badge: "❄️",
    name: { en: "AstroAI 6L Mini Fridge", ja: "AstroAI 6L Mini Fridge" },
    description: {
      en: "12,800 yen 6L Peltier with warm/cold dual mode. 50% more capacity than Cooluli 4L, fits 12-16 standard serum bottles, doubles as a 60°C warmer for steam towels. Cool-to-warm transition takes ~90 minutes; warming mode is a secondary use case.",
      ja: "12,800円の6L温冷両対応ペルチェ。Cooluli 4Lより容量50%増、標準美容液12-16本収納、60°C保温で蒸しタオル運用も可。冷⇄温切替に約90分、保温は日常的に切り替える機能というよりおまけ用途。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-astroai-mini-fridge-6l", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FAstroAI%2BMini%2BFridge%2B6L%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "cooluli-beauty-fridge-10l",
    category: "beauty",
    badge: "💄",
    name: { en: "The Beauty Fridge by Cooluli 10L", ja: "The Beauty Fridge by Cooluli 10L" },
    description: {
      en: "18,800 yen dedicated 10L beauty fridge. Skincare-shaped interior with taller bottle clearance, LED-lit chamber, magnetic door catch. Fits 25-35 products with ice rollers and tools. 5 kg is heavy for a vanity; cooling depth stabilizes at 11-14°C rather than single digits.",
      ja: "18,800円のスキンケア専用設計10Lビューティ冷蔵庫。下段はトール・ボトル対応高さ、LED内照、マグネット式ドアキャッチ。25-35アイテム+アイスローラーやツール収納可。5kgはドレッサーには重い、冷却深度は11-14°Cで一桁°Cには届かない。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-cooluli-beauty-fridge-10l", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FCooluli%2BBeauty%2BFridge%2B10L%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "twinbird-hr-db07",
    category: "beauty",
    badge: "🇯🇵",
    name: { en: "TWINBIRD HR-DB07", ja: "TWINBIRD HR-DB07" },
    description: {
      en: "24,800 yen Japanese-brand premium pick. Quietest in this comparison at ~21 dB Peltier, 70+ year domestic appliance brand with real service network, 5L capacity. Cooling depth is the weakest in this list (ambient minus ~15°C); on the warm edge for vitamin C in summer.",
      ja: "24,800円の日本ブランド・プレミアム選択。本比較最静音約21dBペルチェ、冷却家電70年以上の国内メーカーで国内サービス網も実在、容量5L。冷却深度は本リスト最弱(周囲マイナス約15°C)、夏場の温度敏感なビタミンC製品にはギリギリ温め寄り。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-twinbird-hr-db07", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FTWINBIRD%2BHR-DB07%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "doshisha-sunruck-sr-r2002",
    category: "beauty",
    badge: "📦",
    name: { en: "DOSHISHA SunRuck SR-R2002", ja: "DOSHISHA SunRuck SR-R2002" },
    description: {
      en: "9,990 yen 20L compressor cold-fridge with the genuinely lowest temperature (5-8°C) in this list. Designed as a general-purpose secondary fridge for drinks, not skincare — interior shelves are drink-can-sized, compressor noise is 38-42 dB, no LED interior, no warm mode.",
      ja: "9,990円の20Lコンプレッサー式で本リストで唯一の本物の冷蔵温度(5-8°C)。ドリンク・軽食用の汎用セカンド冷蔵庫として設計、スキンケア専用ではない — 庫内棚はドリンク缶サイズ、コンプレッサー動作音38-42dB、LED内照なし、保温モードなし。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-doshisha-sunruck-sr-r2002", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FSunRuck%2BSR-R2002%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Home / Air Fryers (best-air-fryer-2026) ─────────
  {
    id: "cosori-pro-ii-6-4l",
    category: "home",
    badge: "🍟",
    name: { en: "COSORI Pro II 6.4L", ja: "COSORI Pro II 6.4L" },
    description: {
      en: "17,800 yen 2-4 person daily-driver. 6.4L square basket, 75-230°C range that genuinely crisps frozen items, 13 presets you'll mostly ignore. 5.4 kg unit needs stable counter space; basket non-stick shows wear by year 3 on daily use.",
      ja: "17,800円の2-4人世帯毎日使い本命。6.4Lスクエアバスケット、温度範囲75-230°Cで冷凍食品を本気でカリッとさせ、プリセット13種(初週以降ほぼ使わない)。本体5.4kgは安定カウンタースペースが必要、毎日使用でバスケット非粘着加工は3年目に摩耗が出る。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-cosori-pro-ii-6-4l", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FCOSORI%2BPro%2BII%2B6.4L%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "ninja-foodi-af400",
    category: "home",
    badge: "👥",
    name: { en: "Ninja Foodi MAX Dual Zone AF400", ja: "Ninja Foodi MAX Dual Zone AF400" },
    description: {
      en: "34,800 yen dual-zone family pick. Two independent 4.75L baskets with Sync cooking, solves the 'two foods at different temps' problem. 41 cm wide and 8.2 kg dominates a Japanese kitchen counter; per-zone capacity is smaller than a single 6L unit.",
      ja: "34,800円のデュアルゾーン家族枠。独立4.75Lバスケット2基+Sync同時調理、「2食材を違う温度で」問題を解決。41cm幅・8.2kgは日本のキッチンカウンターを支配、ゾーンあたり容量はシングル6L機より小さい。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-ninja-foodi-af400", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FNinja%2BFoodi%2BAF400%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "philips-essential-xl-hd9270",
    category: "home",
    badge: "🇳🇱",
    name: { en: "Philips Essential XL HD9270", ja: "Philips Essential XL HD9270" },
    description: {
      en: "29,800 yen premium build pick. Philips originated the air fryer category in 2010, build quality and parts availability are the most mature in this list. 6.2L basket, 80-200°C. Max 200°C is the lowest in this comparison; frozen items don't crisp as aggressively as 230°C rivals.",
      ja: "29,800円のプレミアム作り込み枠。Philipsは2010年にノンフライヤーカテゴリを作った張本人、作り込み品質と部品供給は本リストで最も成熟。バスケット6.2L、80-200°C。最高200°Cは本比較最低、冷凍食品のカリッと感は230°C機ほど激しくならない。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-philips-essential-xl-hd9270", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FPhilips%2BEssential%2BXL%2BHD9270%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "cuisinart-toa-29j",
    category: "home",
    badge: "🍞",
    name: { en: "Cuisinart TOA-29J", ja: "Cuisinart TOA-29J" },
    description: {
      en: "24,800 yen hybrid convection toaster oven — handles toast, small-batch baking, and air-fry mode in one footprint. No perforated basket means surface fat can't drip away; crisping is genuinely weaker than dedicated basket air fryers.",
      ja: "24,800円のコンベクション・トースターオーブン・ハイブリッド — トースト・小バッチお菓子焼き・エアフライモードを1台で。穴あきバスケットがないため食材表面の油が下に落ちず、専用ノンフライヤーよりカリッと感は明確に弱い。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-cuisinart-toa-29j", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FCuisinart%2BTOA-29J%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "yamazen-yaf-c120",
    category: "home",
    badge: "💴",
    name: { en: "Yamazen YAF-C120", ja: "山善 YAF-C120" },
    description: {
      en: "7,980 yen budget single-person pick. 1.2L basket, 22 × 24 × 26 cm, fits the smallest Tokyo kitchens. 80-200°C, analog dial controls. 1.2L is single-portion only; basket non-stick wears at 12-18 months on daily use; 200°C max.",
      ja: "7,980円の予算1人暮らし枠。1.2Lバスケット、22×24×26cm、東京の狭いキッチンに収まる本リスト最小機。80-200°C、アナログダイヤル式。1.2Lは1人前専用、毎日使用でバスケット非粘着加工は12-18ヶ月で摩耗、最高200°C。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-yamazen-yaf-c120", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E5%B1%B1%E5%96%84%2BYAF-C120%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Beauty / Massage Guns (best-massage-gun-2026) ─────────
  {
    id: "theragun-pro-plus",
    category: "beauty",
    badge: "💪",
    name: { en: "Therabody Theragun PRO Plus", ja: "Therabody Theragun PRO Plus" },
    description: {
      en: "79,900 yen professional-grade pick. 16 mm stroke amplitude, 27 kg stall force, triangular grip that reaches the upper back. 1.4 kg weight causes forearm fatigue on long sessions; LED and heated attachments are more marketing than function.",
      ja: "79,900円のプロ仕様枠。ストローク振幅16mm、ストール力27kg、上背部に届く三角グリップ。本体1.4kgで長時間使用時に前腕疲労、LED・温熱アタッチメントは機能よりマーケティング寄り。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-theragun-pro-plus", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FTheragun%2BPRO%2BPlus%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "hypervolt-2-pro",
    category: "beauty",
    badge: "🔫",
    name: { en: "Hyperice Hypervolt 2 Pro", ja: "Hyperice Hypervolt 2 Pro" },
    description: {
      en: "69,300 yen pistol-grip alternative. 14 mm stroke amplitude, 30 kg stall force, app-based pressure feedback. Battery drains faster than spec at maximum speed (90-100 minutes vs claimed 180); slightly louder than the Theragun.",
      ja: "69,300円のピストルグリップ枠。ストローク振幅14mm、ストール力30kg、アプリ連動の圧力フィードバック。最高速時のバッテリー減りがスペックより速い(公称180分に対し実使用90-100分)、Theragunよりやや動作音が大きい。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-hypervolt-2-pro", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FHypervolt%2B2%2BPro%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "bob-and-brad-c2",
    category: "beauty",
    badge: "💴",
    name: { en: "Bob and Brad C2", ja: "Bob and Brad C2" },
    description: {
      en: "9,800 yen budget full-size pick. 10 mm stroke amplitude, 13.6 kg stall force at one-eighth the Theragun price. Stroke is too shallow for dense back/thigh muscle (head visibly skips); battery degrades at 14-18 months on heavy use.",
      ja: "9,800円の予算フルサイズ枠。ストローク振幅10mm、ストール力13.6kgでTheragunの8分の1の価格。背中・太ももの密な筋肉ではストロークが浅すぎてヘッドが目視で滑る、毎日重使用なら14-18ヶ月でバッテリー劣化。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-bob-and-brad-c2", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FBob%2Band%2BBrad%2BC2%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "doctorair-exagun-handy",
    category: "beauty",
    badge: "🇯🇵",
    name: { en: "DOCTORAIR EXAGUN HANDY", ja: "ドクターエア エクサガン ハンディ" },
    description: {
      en: "27,500 yen Japanese-brand handy unit. 280 g, 45 dB at peak, retail-store warranty support through Bic Camera and Yodobashi. 6 mm stroke is a vibration tool with a percussive head shape; does not reach deep muscle tissue, beauty/desk-tension use only.",
      ja: "27,500円の国内ブランドハンディ枠。280g、ピーク45dB、ビックカメラ・ヨドバシなど家電量販店の保証対応。ストローク6mmは打突形状のバイブレーション機で深層筋には届かない、美容・デスク疲労用途のみ。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-doctorair-exagun-handy", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FDOCTORAIR%2BEXAGUN%2BHANDY%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "mytrex-rebive-mini-xs",
    category: "beauty",
    badge: "🧳",
    name: { en: "MYTREX REBIVE MINI XS", ja: "MYTREX REBIVE MINI XS" },
    description: {
      en: "14,800 yen travel-size pick. 220 g (lightest in the comparison), fits in a toiletry bag, USB-C charging, 8 mm stroke amplitude. Cannot reach gluteus/lower back/thigh muscle depth meaningfully; small muscle groups (calf, forearm, neck-side, shoulder-top) only.",
      ja: "14,800円のトラベル枠。220g(本比較最軽量)、トラベルポーチに入るサイズ、USB-C充電、ストローク振幅8mm。お尻・腰・太ももの深層には実用的に届かない、ふくらはぎ・前腕・首の側面・肩の上など小筋群専用。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-mytrex-rebive-mini-xs", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FMYTREX%2BREBIVE%2BMINI%2BXS%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Beauty / Protein Powder (best-protein-powder-2026) ─────────
  {
    id: "optimum-gold-standard-2270g",
    category: "beauty",
    badge: "🏆",
    name: { en: "Optimum Nutrition Gold Standard 100% Whey 2.27 kg", ja: "Optimum Nutrition Gold Standard 100% Whey 2.27kg" },
    description: {
      en: "9,800 yen international premium pick. 24 g protein per 30 g scoop (80% protein by weight) from a blend of whey isolate, concentrate, and peptides, 5.5 g naturally occurring BCAAs per scoop, Informed Choice batch certification, 25-year sport-nutrition track record. 4,300 yen per kg is 30-40% more expensive than Myprotein on per-gram-of-protein basis; sucralose-plus-acesulfame-potassium sweetener combination is overly sweet for some palates; international supply means stock fluctuations through Japanese retail are routine.",
      ja: "9,800円の国際プレミアム枠。30gスクープあたりタンパク質24g(重量比80%)をホエイアイソレート・コンセントレート・ペプチドのブレンドで供給、1スクープあたりホエイ由来天然BCAA 5.5g、Informed Choiceバッチ認証、25年のスポーツ栄養実績。キロあたり4,300円はタンパク質1gあたりベースでMyproteinより30-40%高い、スクラロース+アセスルファムKの甘味料コンビは一部の口に過度に甘い、国際供給は日本小売を通じた在庫変動が日常的。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-optimum-gold-standard-2270g", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FOptimum%2BGold%2BStandard%2BWhey%2B2.27kg%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "myprotein-impact-whey-2500g",
    category: "beauty",
    badge: "💴",
    name: { en: "Myprotein Impact Whey Protein 2.5 kg", ja: "Myprotein Impact ホエイプロテイン 2.5kg" },
    description: {
      en: "7,990 yen European value pick (typical sale price; non-sale list is 9,500-11,000 yen). 20-21 g protein per 25 g scoop (80-84% by weight), Informed Sport certified for select flavours and batches, 60+ flavour SKUs in UK with frequent 40-50% off promotional pricing. International shipping from UK warehouse takes 7-14 business days with intermittent stock-outs; mixability is grittier than ON or SAVAS particularly in cold liquid; only specific flavours and batches carry Informed Sport certification and athletes must verify per batch via Myprotein lot-lookup.",
      ja: "7,990円の欧州バリュー枠(典型的セール価格;非セール定価は9,500-11,000円)。25gスクープあたりタンパク質20-21g(重量比80-84%)、特定フレーバーとバッチでInformed Sport認証、UKで60以上のフレーバーSKUと頻繁な40-50%オフプロモーション価格。UK倉庫からの国際配送が7-14営業日かかり断続的な在庫切れ、混溶性が特に冷たい液体でONやSAVASよりザラつき、特定フレーバーとバッチのみがInformed Sport認証を持ちMyproteinロット検索でバッチごとに検証する必要。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-myprotein-impact-whey-2500g", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FMyprotein%2BImpact%2B%E3%83%9B%E3%82%A7%E3%82%A4%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "dns-whey-g-plus-1kg",
    category: "beauty",
    badge: "🏋️",
    name: { en: "DNS Whey Protein G+ 1 kg", ja: "DNS ホエイプロテイン G+ 1kg" },
    description: {
      en: "4,800 yen Japanese athlete-formulated pick. 22 g protein per 33 g scoop with added 4.5 g BCAAs, 2 g glutamine, and electrolytes, JADA-aligned testing for the Japanese sport-supplement registry, formulated for competitive Japanese athletes (DNS sponsors J-League and rugby teams). Uses sucralose as primary sweetener; 67% protein-by-weight ratio means per-gram-of-protein cost is higher than 80% protein options despite lower retail price; does not carry Informed Sport or NSF certification (only JADA-aligned), insufficient for some international competitions.",
      ja: "4,800円の日本アスリート製剤枠。33gスクープあたりタンパク質22g+追加BCAA 4.5g・グルタミン2g・電解質、日本のスポーツサプリメント登録向けJADAアライン検査、競技日本人アスリートに製剤化(DNSはJリーグやラグビーチームをスポンサー)。主要甘味料としてスクラロースを使用、重量比67%のタンパク質比率は小売価格が低くても80%タンパク質オプションよりタンパク質1gあたりコストが高い、Informed SportやNSF認証なし(JADAアラインのみ)、一部国際大会には不十分な可能性。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-dns-whey-g-plus-1kg", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FDNS%2B%E3%83%9B%E3%82%A7%E3%82%A4%2BG%2Bplus%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "meiji-savas-whey-980g",
    category: "beauty",
    badge: "🇯🇵",
    name: { en: "Meiji SAVAS Whey Protein 100 980 g", ja: "明治 SAVAS ホエイプロテイン100 980g" },
    description: {
      en: "4,980 yen Japanese commodity and senior pick. 15-21 g protein per 21 g scoop depending on SKU (cocoa is 15 g, vanilla and milk are 21 g), added vitamins B/C/D and calcium in select SKUs, JADA-aligned testing, strongest Japanese-domestic distribution through Matsumoto Kiyoshi, Welcia, FamilyMart, Lawson, plus Rakuten and Amazon Japan. 15 g per scoop in cocoa flavour is too low for athlete-grade body recomposition (requires 1.5-2 scoops per shake); SAVAS line includes many SKUs (Whey 100, Aqua Whey, Pro, For Athlete, Mass Up) with meaningfully different formulations and buyers regularly purchase the wrong variant; per-kilogram price of 5,080 yen is similar to D2C tier despite commodity-tier positioning.",
      ja: "4,980円の日本コモディティ&シニア枠。SKUにより21gスクープあたりタンパク質15-21g(ココアは15g、バニラとミルクは21g)、選択SKUに追加ビタミンB/C/Dとカルシウム、JADAアライン検査、マツモトキヨシ・ウエルシア・ファミリーマート・ローソン+楽天とAmazon Japanを通じた本比較最強の日本国内流通。ココア フレーバー1スクープあたり15gはアスリートグレードのボディメイクには低すぎ(1シェイクあたり1.5-2スクープ必要)、SAVASラインは意味あるレベルで異なる製剤の多くのSKU(ホエイ100・アクアホエイ・プロ・For Athlete・マスアップ)を含み購入者が定期的に間違ったバリアントを買う、キロあたり5,080円はコモディティ ティアのポジショニングにもかかわらずD2Cティアと同等。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-meiji-savas-whey-980g", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FSAVAS%2B%E3%83%9B%E3%82%A7%E3%82%A4100%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "inputein-whey-1kg",
    category: "beauty",
    badge: "🌱",
    name: { en: "Inputein Kamikatsu Whey Protein 1 kg", ja: "Inputein 上勝ホエイプロテイン 1kg" },
    description: {
      en: "4,980 yen no-artificial-sweetener D2C pick. 20 g protein per 25 g scoop (80% by weight), 100% Hokkaido domestic raw-milk sourcing with batch traceability, no sucralose, acesulfame potassium, aspartame, or artificial flavours, Tokushima Prefecture upcycling community origin with Pinterest and Instagram-heavy organic reach since the 2024 launch. Only 4-5 flavour SKUs available at any time (flavour fatigue at month 3-4); 5,000 yen per kg is roughly 30-40% more expensive than international tier on per-gram-of-protein basis (Myprotein delivers similar protein content at roughly 3,200 yen per kg on sale); no Informed Sport or NSF certification (not athlete-safe for WADA-tested sport).",
      ja: "4,980円の人工甘味料無添加D2C枠。25gスクープあたりタンパク質20g(重量比80%)、バッチ追跡可能性付き100%北海道国内生乳ソース、スクラロース・アセスルファムK・アスパルテーム・人工香料無添加、徳島県上勝町のアップサイクリングコミュニティ起源で2024年ローンチ以来PinterestとInstagramの組織的リーチ重視。任意の時点で4-5フレーバーSKUのみ(3-4ヶ月目にフレーバー疲労)、キロあたり5,000円はタンパク質1gあたりベースで国際ティアより約30-40%高い(Myproteinはセール時のキロあたり約3,200円で類似タンパク質含有量)、Informed SportやNSF認証なし(WADAテスト対象スポーツに安全ではない)。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-inputein-whey-1kg", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FInputein%2B%E4%B8%8A%E5%8B%9D%E3%83%9B%E3%82%A7%E3%82%A4%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Beauty / Aroma Diffusers (best-aroma-diffuser-2026) ─────────
  {
    id: "muji-aroma-diffuser-mj-adl2",
    category: "beauty",
    badge: "🇯🇵",
    name: { en: "Muji Ultrasonic Aroma Diffuser MJ-ADL2", ja: "無印良品 超音波うるおいアロマディフューザー MJ-ADL2" },
    description: {
      en: "7,990 yen Japanese-design daily-driver pick. 100 mL ultrasonic at around 30 dB with neutral two-LED-brightness design, simple two-button control, available at every Muji store nationwide for same-day pickup with warranty service. 100 mL tank empties in 2-3 hours continuous (shortest in this comparison); scent throw is moderate not strong (covers 6-10 jou); price-per-spec is not the strongest as you pay for Muji brand rather than highest capacity.",
      ja: "7,990円の日本デザイン日常使い枠。100mL超音波で約30dB、ニュートラル2段階LED輝度デザイン、シンプル2ボタン制御、当日ピックアップで全国の無印店舗利用可能と保証サービス。100mLタンクは連続2-3時間で空になる(本比較最短)、芳香拡散は中程度で強くなく(6-10畳をカバー)、スペックあたり価格は最強ではなく無印ブランドに支払う(最高容量ではなく)。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-muji-aroma-diffuser-mj-adl2", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E7%84%A1%E5%8D%B0%E8%89%AF%E5%93%81%2B%E3%82%A2%E3%83%AD%E3%83%9E%E3%83%87%E3%82%A3%E3%83%95%E3%83%A5%E3%83%BC%E3%82%B6%E3%83%BC%2BMJ-ADL2%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "vitruvi-stone-diffuser",
    category: "beauty",
    badge: "🪨",
    name: { en: "Vitruvi Stone Diffuser", ja: "Vitruvi Stone Diffuser" },
    description: {
      en: "18,800 yen Pinterest-aesthetic premium pick. Hand-glazed porcelain ceramic shell in 9 colorways, 90 mL ultrasonic at around 25 dB (one of quietest), Canadian Vitruvi brand dominant on Pinterest beauty-aesthetic boards since 2018. Ceramic shell is fragile (drop = crack) and several long-term buyers report hairline cracks at 12-18 months from thermal cycling; 18,800 yen is roughly 2.5x Muji and 5x InnoGear on the same ultrasonic spec; 90 mL tank suits bedrooms only and underperforms in 16+ jou LDK; international shipping from Canada means routine stock fluctuations and color availability variation.",
      ja: "18,800円のPinterest美学プレミアム枠。9色展開の手釉ポーセリン セラミック外装、90mL超音波で約25dB(最も静かな部類)、2018年以来Pinterest美学ボードを支配するカナダのVitruviブランド。セラミック外装は脆弱(落とすと割れる)で複数の長期購入者が熱サイクルから12-18ヶ月時点で細い亀裂を報告、18,800円は同じ超音波スペックで無印の約2.5倍・InnoGearの約5倍、90mLタンクは寝室のみに合い16+畳LDKでは性能不足、カナダからの国際配送は日常的な在庫変動と色入手性の変動を意味する。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-vitruvi-stone-diffuser", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FVitruvi%2BStone%2BDiffuser%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "treeoflife-mood-air-mini",
    category: "beauty",
    badge: "🌿",
    name: { en: "Tree of Life mood air mini", ja: "生活の木 mood air mini" },
    description: {
      en: "9,900 yen Japanese specialist nebulizer pick. Pure essential oil atomization with Venturi air pump, strong scent throw saturating 15-25 jou rooms, intermittent timer modes, glass nebulizer head, USB-C, Tree of Life domestic brand with established oil ecosystem at Tokyu Hands and Loft. Consumes 3-5 mL of pure oil per hour (5-10x running cost vs ultrasonic); air pump runs at 40-50 dB (interrupts sleep in bedroom); glass head clogs with thick oils requiring weekly disassembly cleaning; warranty technically requires Tree of Life own oil line.",
      ja: "9,900円の日本専門ネブライザー枠。Venturiエアポンプによる純粋精油霧化、15-25畳の部屋を飽和する強い芳香拡散、断続タイマー モード、ガラス ネブライザー ヘッド、USB-C、Tokyu HandsとLoftで確立された精油エコシステムを持つ生活の木国内ブランド。1時間あたり3-5mLの純粋精油を消費(超音波 vs 5-10倍の運用コスト)、エアポンプは40-50dBで稼働(寝室で睡眠を中断)、ガラス ヘッドは厚い精油で詰まり週次の分解清掃を要する、保証は技術的に生活の木自社精油ラインを要求。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-treeoflife-mood-air-mini", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E7%94%9F%E6%B4%BB%E3%81%AE%E6%9C%A8%2Bmood%2Bair%2Bmini%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "at-aroma-pebble",
    category: "beauty",
    badge: "🪴",
    name: { en: "@aroma Aroma Pebble", ja: "@aroma Aroma Pebble" },
    description: {
      en: "14,300 yen Japanese portable D2C pick. Rechargeable battery 4-8 hour runtime per USB-C charge, 30-50 mL ultrasonic at around 28 dB, river-pebble silhouette in stone/mocha/sand/graphite colorways, @aroma proprietary oil ecosystem. Battery runtime is shorter than AC-powered (daily recharging if used daily); small tank suits personal-bubble use only and cannot saturate a room; 14,300 yen is high for 30-50 mL tank ultrasonic; rechargeable battery has finite cycle life and degrades after 300-400 cycles (2-3 years of daily use before runtime drops below practical).",
      ja: "14,300円の日本ポータブルD2C枠。1 USB-C充電あたり4-8時間稼働の充電式バッテリー、30-50mL超音波で約28dB、ストーン/モカ/サンド/グラファイト カラー展開の川石シルエット、@aroma専有精油エコシステム。電池稼働時間はAC電源より短い(日常使用なら毎日充電)、小さなタンクはパーソナルバブル使用専用で部屋を飽和できない、14,300円は30-50mLタンク超音波としては高い、充電式バッテリーには有限のサイクル寿命があり300-400サイクル後に劣化(日常使用2-3年で稼働時間が実用以下に下がる)。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-at-aroma-pebble", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%40aroma%2BAroma%2BPebble%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "innogear-500ml-diffuser",
    category: "beauty",
    badge: "💴",
    name: { en: "InnoGear Aromatherapy Diffuser 500 mL", ja: "InnoGear Aromatherapy Diffuser 500mL" },
    description: {
      en: "3,980 yen budget large-tank pick. 500 mL ultrasonic with 10-12 hour continuous runtime (longest in this comparison), 7-color LED with disable option, mist intensity adjustment, automatic shutoff, remote control included. Build quality is variable with plastic-and-wood-veneer body that several long-term buyers describe as visibly cheap-looking; tank seal water leakage is the most common long-term failure mode at 6-12 month mark; warranty support in Japan is weaker than domestic specialist brands; ceramic plate accumulates mineral scale faster than premium units, requiring weekly cleaning rather than monthly.",
      ja: "3,980円の予算大型タンク枠。連続10-12時間稼働の500mL超音波(本比較最長稼働時間)、無効化オプション付き7色LED、ミスト強度調整、自動シャットオフ、リモコン同梱。製造品質は変動しプラスチック+木目調本体は複数の長期購入者が目視で安っぽく見えると記述、タンク シール水漏れが6-12ヶ月時点での最一般長期故障モード、日本での保証サポートは国内専門ブランドより弱い、セラミック板はプレミアム ユニットより速くミネラル スケールを蓄積し月次ではなく週次清掃を要する。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-innogear-500ml-diffuser", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FInnoGear%2BAromatherapy%2B500ml%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Tech / Smart Watches (best-smart-watch-2026) ─────────
  {
    id: "apple-watch-series-10",
    category: "tech",
    badge: "🍎",
    name: { en: "Apple Watch Series 10", ja: "Apple Watch Series 10" },
    description: {
      en: "64,800 yen iPhone-locked daily-driver pick. Thinnest case yet, 1.96-inch always-on OLED, Suica + Apple Pay + ECG + atrial fibrillation notification, sleep apnea screening, largest third-party app library. 18-22 hour real-world battery means daily charging; pairs only with iPhone.",
      ja: "64,800円のiPhoneロックイン日常使い枠。過去最薄ケース、1.96インチ常時表示OLED、Suica+Apple Pay+ECG+心房細動通知、睡眠時無呼吸スクリーニング、本比較最大のサードパーティアプリライブラリ。実機18-22時間バッテリーで毎日充電前提、iPhone専用でAndroidとはペアリング不可。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-apple-watch-series-10", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FApple%2BWatch%2BSeries%2B10%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "garmin-fenix-8-47mm",
    category: "tech",
    badge: "⛰️",
    name: { en: "Garmin Fenix 8 47mm", ja: "Garmin Fenix 8 47mm" },
    description: {
      en: "149,800 yen endurance-athlete flagship. Sapphire AMOLED, dual-frequency multi-band GPS, topo-map trail navigation, 40 m water rating with dive computer mode, deepest training-load and recovery analytics. Genuine overkill below competitive endurance training; menu has 2-4 week learning curve; 47 mm case is large on wrists under 16 cm.",
      ja: "149,800円のエンデュランスアスリート向けフラッグシップ。サファイアAMOLED、デュアル周波数マルチバンドGPS、地形図トレイルナビ、防水40mでダイブコンピューターモード、本比較最深のトレーニング負荷+リカバリー解析。競技的エンデュランス未満には正直オーバーキル、メニュー体系に2-4週間の学習曲線、47mmケースは手首周囲16cm未満には大きい。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-garmin-fenix-8-47mm", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FGarmin%2BFenix%2B8%2B47mm%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "fitbit-charge-6",
    category: "tech",
    badge: "💴",
    name: { en: "Fitbit Charge 6", ja: "Fitbit Charge 6" },
    description: {
      en: "23,800 yen fitness-tracker value pick. 1.04-inch AMOLED, 6-7 day real-world battery, Google integration with Maps notifications and YouTube Music control, built-in GPS, Fitbit Premium ecosystem. ECG geographically limited and not available in Japan as of May 2026; Google Pay coverage in Japan trails Apple Pay/Suica; tracker form factor with limited watch-face customization.",
      ja: "23,800円のフィットネストラッカーコスパ枠。1.04インチAMOLED、実機6-7日バッテリー、Googleマップ通知とYouTube Music操作のGoogle統合、内蔵GPS、Fitbit Premiumエコシステム。ECGは地理的制約があり2026年5月時点で日本未提供、日本でのGoogle PayカバレッジはApple Pay/Suicaに劣る、トラッカー型でウォッチフェイスのカスタマイズは限定的。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-fitbit-charge-6", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FFitbit%2BCharge%2B6%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "huawei-watch-gt-5",
    category: "tech",
    badge: "🔋",
    name: { en: "HUAWEI Watch GT 5 46mm", ja: "HUAWEI Watch GT 5 46mm" },
    description: {
      en: "36,800 yen long-battery Android-friendly pick. 1.43-inch AMOLED, 12-14 day realistic battery, dual-band GNSS on the 46 mm Pro variant, polished stainless build options. No Google Play Store, no Google Pay, no third-party Strava/Spotify apps — sync via HUAWEI Health adds friction; iOS reply functionality essentially absent; after-sales network in Japan thinner than Apple/Garmin/Fitbit.",
      ja: "36,800円の長バッテリーAndroid向け枠。1.43インチAMOLED、実機12-14日バッテリー、46mm Proバリアントでデュアルバンド GNSS、ステンレス選択肢を含む磨き込まれた筐体。Google Play Storeなし、Google Payなし、サードパーティStrava/Spotifyアプリなし、HUAWEI Health経由同期でフリクション増、iOSの返信機能は事実上不在、日本でのアフターサービス網はApple/Garmin/Fitbitより薄い。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-huawei-watch-gt-5", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FHUAWEI%2BWatch%2BGT%2B5%2B46mm%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "amazfit-gtr-4",
    category: "tech",
    badge: "⌚",
    name: { en: "Amazfit GTR 4", ja: "Amazfit GTR 4" },
    description: {
      en: "29,800 yen design-led value pick. 1.43-inch AMOLED round face, dual-band 5-system GNSS at this price point, 10-12 day realistic battery, 150+ sport modes via Zepp app. Notification reply is the weakest in this comparison (canned responses on Android, essentially absent on iOS); Zepp OS third-party app ecosystem is small; Japan warranty via Rakuten retail rather than flagship brand-store network.",
      ja: "29,800円のデザイン重視コスパ枠。1.43インチAMOLED丸顔、この価格帯でのデュアルバンド5系統GNSS、実機10-12日バッテリー、Zeppアプリ経由で150以上のスポーツモード。通知返信機能は本比較で最も弱く(Androidで定型応答のみ、iOSで事実上不在)、Zepp OSのサードパーティアプリエコシステムは小さい、日本での保証はフラッグシップ・ブランドストア網ではなく楽天小売経由。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-amazfit-gtr-4", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FAmazfit%2BGTR%2B4%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Fitness / Fitness Trackers (best-fitness-tracker-2026) ─────────
  {
    id: "xiaomi-smart-band-9",
    category: "fitness",
    badge: "💴",
    name: { en: "Xiaomi Smart Band 9", ja: "Xiaomi スマートバンド 9" },
    description: {
      en: "~¥5,000 ultra-budget pick. 1.62-inch AMOLED display, 33 g weight (lightest in this comparison), 14-day claimed battery (8–10 days realistic with continuous heart-rate), 150+ sport modes, iOS and Android compatible via Mi Fitness app. Sensor array is smaller than premium trackers — heart-rate accuracy during exercise is lower than Fitbit or Garmin; Mi Fitness analytics ecosystem is thinner than competitors; Xiaomi's after-sales support network in Japan is thin with warranty typically handled through retailer rather than brand service centre.",
      ja: "約¥5,000の超予算枠。1.62インチAMOLED、33g（本比較最軽量）、公称14日間バッテリー（継続HR有効で実機8〜10日）、150以上のスポーツモード、Mi FitnessアプリでiOS・Android対応。センサーアレイがプレミアムトラッカーより小さく運動中のHR精度はFitbit・Garminより劣る、Mi Fitnessの分析エコシステムは競合より薄い、日本のアフターサービスは直営より販売店経由が主体。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-xiaomi-smart-band-9", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FXiaomi%2BSmart%2BBand%2B9%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "garmin-vivosmart-5",
    category: "fitness",
    badge: "🔋",
    name: { en: "Garmin Vivosmart 5", ja: "Garmin Vivosmart 5" },
    description: {
      en: "~¥22,000 health-analytics pick. Body Battery energy management, HRV stress score, SpO2, Garmin sleep analysis, slim band form factor, works equally on Android and iOS via Garmin Connect. No built-in GPS — connected GPS only, which means no route tracking without a phone; unusual price-to-feature trade-off for the category; small display with limited smartwatch notification interaction compared to full smart watches.",
      ja: "約¥22,000の健康分析枠。Body Batteryエネルギー管理・HRVストレススコア・SpO2・Garmin睡眠分析、スリムバンド型、Garmin Connect経由でAndroid・iOS両対応。GPS非内蔵（接続型のみ）でスマートフォンなしのルート追跡不可、この価格帯では異例の価格対機能トレードオフ、フルスマートウォッチと比べて通知操作が限定的な小型ディスプレイ。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-garmin-vivosmart-5", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FGarmin%2BVivosmart%2B5%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "apple-watch-se-2nd",
    category: "fitness",
    badge: "🍎",
    name: { en: "Apple Watch SE 2nd Generation", ja: "Apple Watch SE 第2世代" },
    description: {
      en: "~¥35,000 smartwatch-with-fitness-tracking pick for iPhone users. Crash detection, Emergency SOS, Suica + Apple Pay at every Japanese conbini, full watchOS app store, message replies from the wrist. Requires iPhone — hard dependency, no workaround for Android users. 18-hour real-world battery means daily charging without exception; most expensive option in this comparison by a significant margin.",
      ja: "約¥35,000のiPhoneユーザー向けフィットネス追跡付きスマートウォッチ枠。クラッシュ検知・緊急SOS・日本中のコンビニでSuica+Apple Pay・watchOSアプリストア・手首でのメッセージ返信。iPhoneが必須——Androidユーザーへの回避策なし。18時間実機バッテリーで例外なく毎日充電、本比較で最も高価。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-apple-watch-se-2nd", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FApple%2BWatch%2BSE%2B%E7%AC%AC2%E4%B8%96%E4%BB%A3%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "samsung-galaxy-fit-3",
    category: "fitness",
    badge: "📱",
    name: { en: "Samsung Galaxy Fit 3", ja: "Samsung Galaxy Fit 3" },
    description: {
      en: "~¥8,000 large-screen budget Android tracker. 1.6-inch display (largest in this comparison), 13-day claimed battery (8–11 days realistic), 50 m water resistance, compatible with any Android phone not just Samsung. No built-in GPS (connected only); Galaxy Wearable app's full analytics depth requires a Samsung phone — feature set is reduced on non-Samsung Android; at ¥8,000, sensor quality and software polish reflect the price.",
      ja: "約¥8,000の大画面予算Androidトラッカー。1.6インチ画面（本比較最大）、公称13日間バッテリー（実機8〜11日）、50m防水、Samsung以外のすべてのAndroidスマートフォンに対応。GPS非内蔵（接続型のみ）、Galaxy WearableアプリのフルAnalytics深度はSamsungスマートフォンが必要で非Samsung Androidでは機能制限あり、¥8,000という価格がセンサー品質とソフトウェア完成度に反映されている。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-samsung-galaxy-fit-3", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FSamsung%2BGalaxy%2BFit%2B3%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Fitness / Smart Scales (best-smart-scale-2026) ─────────
  {
    id: "withings-body-comp",
    category: "fitness",
    badge: "❤️",
    name: { en: "Withings Body Comp", ja: "Withings Body Comp" },
    description: {
      en: "~¥30,000 broadest-health-picture pick. Measures body fat, muscle mass, visceral fat index, bone mass, and vascular age (pulse wave velocity) via Health Mate app. Best data export policy in this comparison (CSV export, API access), reliable Apple Health and Google Fit sync. Foot-to-foot BIA shares the same ±3–8% body fat accuracy class as cheaper scales; Withings has undergone multiple ownership changes (Nokia Health, back to Withings) creating long-term software support uncertainty; ¥30,000 is the joint-highest price in this comparison.",
      ja: "約¥30,000の最広健康像把握枠。体脂肪・筋肉量・内臓脂肪指数・骨量・血管年齢（脈波伝播速度）をHealth Mateアプリで計測。本比較最良データエクスポートポリシー（CSVエクスポート・APIアクセス）、Apple HealthとGoogle Fit両方への信頼性の高い同期。足底BIAは安い製品と同じ±3〜8%体脂肪精度クラス、Withingsは複数の所有権変更（Nokia Health・Withings復帰）を経て長期ソフトウェアサポートに不確実性がある、¥30,000は本比較の同率最高価格。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-withings-body-comp", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FWithings%2BBody%2BComp%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "garmin-index-s2",
    category: "fitness",
    badge: "🔵",
    name: { en: "Garmin Index S2", ja: "Garmin Index S2" },
    description: {
      en: "~¥22,000 Garmin Connect integration pick. Supports 16 simultaneous users, syncs body fat, BMI, body water, and bone mass directly to Garmin Connect alongside activities, sleep, and HRV data. Ecosystem premium only valuable if you already use Garmin devices; for non-Garmin users it is a foot-to-foot BIA scale at ¥22,000 with the same accuracy class as the ¥8,000 Eufy P2 Pro; no direct Google Fit integration without a third-party bridge app.",
      ja: "約¥22,000のGarmin Connect連携枠。16ユーザー同時対応、体脂肪・BMI・体水分・骨量をアクティビティ・睡眠・HRVデータと並んでGarmin Connectに直接同期。エコシステムプレミアムは既存Garminデバイス使用者にのみ価値があり、Garmin以外のユーザーには¥22,000の足底BIAスケールで¥8,000のEufy P2 Proと同精度クラス。サードパーティ仲介なしではGoogle Fitへの直接連携なし。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-garmin-index-s2", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FGarmin%2BIndex%2BS2%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "tanita-rd-906",
    category: "fitness",
    badge: "🏥",
    name: { en: "Tanita RD-906", ja: "タニタ RD-906" },
    description: {
      en: "~¥30,000 highest-rigor consumer BIA pick. InBody-licensed multi-frequency four-electrode technology measures arms, legs, and trunk separately (genuine segmental body composition) rather than estimating upper body from foot-to-foot impedance; 50 g resolution; Tanita has clinical credibility in Japan that no foreign brand currently matches — hospitals, clinics, and sports facilities use Tanita professional equipment. Requires holding handle electrodes during each measurement; Health Planet app is Japan-focused and less internationally polished than Withings or Garmin; no vascular age measurement despite price parity with Withings Body Comp.",
      ja: "約¥30,000の最高精度消費者BIA枠。InBodyライセンス多周波数4電極技術が腕・脚・体幹を個別に計測（真の部位別体組成）し、足底インピーダンスからの上半身推定ではない。50g単位計測。タニタは日本で外国ブランドが匹敵できない臨床的信頼性を持ち、病院・クリニック・スポーツ施設がタニタ業務用機器を使用。各計測でハンドル電極を握る必要がある、Health Planetアプリは日本市場中心でWithingsやGarminほど国際的に洗練されていない、Withings Body Compと同価格帯ながら血管年齢計測なし。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-tanita-rd-906", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%82%BF%E3%83%8B%E3%82%BF%2BRD-906%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "xiaomi-body-composition-scale-2",
    category: "fitness",
    badge: "💴",
    name: { en: "Xiaomi Mi Body Composition Scale 2", ja: "Xiaomi 体組成計 2" },
    description: {
      en: "~¥3,000 ultra-budget body fat tracking pick. Measures body fat, BMI, muscle mass, bone mass, and metabolic rate estimates via Bluetooth sync to Mi Fitness; body fat trend data is useful despite wide accuracy margin. Bluetooth-only requires phone nearby during measurement; two-electrode foot-to-foot BIA gives the widest accuracy margin in this comparison; Mi Fitness data export is restricted; Xiaomi's track record of discontinuing products and apps without long transition periods is a legitimate concern for multi-year data tracking.",
      ja: "約¥3,000の超低価格体脂肪追跡枠。Mi FitnessへのBluetooth同期で体脂肪率・BMI・筋肉量・骨量・代謝率推定を計測。広い誤差幅にもかかわらず体脂肪トレンドデータは有用。Bluetoothのみのため計測時に近くにスマートフォンが必要、2電極足底BIAで本比較最大の誤差幅、Mi Fitnessのデータエクスポートが制限的、Xiaomiの移行期間の短い製品・アプリ終了実績は複数年データ追跡への正当な懸念。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-xiaomi-body-composition-scale-2", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FXiaomi%2B%E4%BD%93%E7%B5%84%E6%88%90%E8%A8%88%2B2%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "anker-eufy-smart-scale-p2-pro",
    category: "fitness",
    badge: "📶",
    name: { en: "Anker Eufy Smart Scale P2 Pro", ja: "Anker Eufy スマート体重計 P2 Pro" },
    description: {
      en: "~¥8,000 pragmatic middle pick. Wi-Fi sync (no phone-nearby requirement), Apple Health and Google Fit integration, 16 body metrics, clean Eufy Life app; Anker has strong Japan retail and customer service presence (Akihabara and Osaka stores, direct Japan support line). Most additional metrics beyond weight, body fat, and BMI are derived from the same two-electrode foot-to-foot BIA signal through different regression equations — not independent measurements; Eufy Life app is less mature than Withings Health Mate; brand does not carry Tanita's clinical trust in Japan.",
      ja: "約¥8,000の実用的な中間選択肢。Wi-Fi同期（スマートフォン近接不要）・Apple HealthとGoogle Fit連携・16指標・クリーンなEufy Lifeアプリ。Ankerは日本で充実した小売・顧客サービス体制（秋葉原・大阪ストア・日本語直接サポート）を持つ。体重・体脂肪・BMI以外のほとんどの追加指標は同じ2電極足底BIA信号からの異なる回帰式による導出で独立した計測ではない、Eufy Lifeアプリの成熟度はWithings Health Mateより低い、日本でブランドはタニタの臨床的信頼性を持たない。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-anker-eufy-smart-scale-p2-pro", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FAnker%2BEufy%2B%E4%BD%93%E9%87%8D%E8%A8%88%2BP2%2BPro%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Tech / Tablet Stands (best-tablet-stand-2026) ─────────
  {
    id: "lululook-ipad-stand",
    category: "tech",
    badge: "🧲",
    name: { en: "Lululook Magnetic iPad Stand", ja: "Lululook マグネット式iPadスタンド" },
    description: {
      en: "9,800-12,800 yen aluminum magnetic premium pick. Magnetic puck attaches iPad Pro 11/12.9 directly to the arm with no clamp, 360-degree rotation between portrait and landscape, weighted base for desk stability, brushed-aluminum finish that matches Apple silver/space gray. iPad-only — magnet plate is sized for iPad Pro and iPad Air and does not fit Android tablets, Kindle Fire, or smaller iPad Mini without the separately sold magnetic adapter; magnet pull weakens with the heavier 12.9-inch iPad Pro plus Magic Keyboard combination and the device can detach if knocked; 9,800-12,800 yen is at the top of the desk-stand price band.",
      ja: "9,800-12,800円のアルミ製マグネット プレミアム枠。マグネット式パックがiPad Pro 11/12.9をクランプなしで直接アームに取り付け、縦横360度回転、机上安定性のための重量ベース、Apple シルバー/スペースグレイに合うブラッシュド アルミ仕上げ。iPad専用 — マグネット プレートはiPad ProとiPad Airサイズで、Androidタブレット・Kindle Fire・小型iPad Miniは別売マグネット アダプタなしで装着不可、12.9インチiPad Pro+Magic Keyboardの重い組合せでマグネット保持力が弱まり衝撃でデバイスが外れる可能性、9,800-12,800円は机上スタンド価格帯の上限。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-lululook-ipad-stand", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FLululook%2BiPad%2B%E3%82%B9%E3%82%BF%E3%83%B3%E3%83%89%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "moft-float-stand",
    category: "tech",
    badge: "💼",
    name: { en: "MOFT Float", ja: "MOFT Float" },
    description: {
      en: "8,980 yen ultra-portable foldable pick. Origami-style folding fabric stand that doubles as a laptop and tablet riser, 7 angle stops between 25 and 60 degrees, weighs 280 g and folds to 8 mm thick to slide into a sleeve. Fabric and hinge construction is not as rigid as a metal desk stand — heavy drawing pressure with Apple Pencil flexes the stand visibly and stability for Procreate use is the dominant complaint in long-term reviews; fabric exterior shows wear and pilling around the hinge fold after 12-18 months of daily use; the same product is also sold as a laptop stand, so the tablet-only buyer overpays for laptop angles they may not use.",
      ja: "8,980円の超携帯折りたたみ枠。折り紙式の折りたたみファブリック スタンドがノートPCとタブレット ライザーを兼ね、25-60度の7段階角度、重量280gで8mm厚に折りたたんでスリーブに収納可能。ファブリックとヒンジ構造はメタル机上スタンドほど剛性がない — Apple Pencilでの強い描画圧力でスタンドが目に見えてたわみ、Procreate用途の安定性は長期レビューの支配的不満、ファブリック外装は12-18ヶ月の毎日使用後にヒンジ折り目周辺で摩耗と毛玉、同製品はノートPCスタンドとしても販売されているため、タブレット専用買い手はノートPC用角度に過払いの可能性。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-moft-float-stand", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FMOFT%2BFloat%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "lamicall-tablet-stand",
    category: "tech",
    badge: "🪑",
    name: { en: "Lamicall Adjustable Tablet Stand", ja: "Lamicall 角度調整タブレットスタンド" },
    description: {
      en: "1,680-2,480 yen aluminum desk-stand value pick. Single-piece aluminum body fits 4-13 inch tablets and most phones, single-axis hinge with 270-degree tilt range, silicone pads on the cradle and base prevent scratching, weight tuned to keep iPad Pro 12.9 stable. Single-axis tilt only — no height adjustment and no swivel/rotation, so portrait-to-landscape requires lifting and re-cradling the tablet rather than a smooth rotation; one-piece hinge has no detent stops and any deliberate angle can drift over a long video call as the friction surface wears in; finishing tolerances on the cradle vary unit-to-unit and a small fraction of buyers report iPad rocking in the cradle.",
      ja: "1,680-2,480円のアルミ机上スタンド コスパ枠。一体アルミ ボディが4-13インチのタブレットとほとんどのスマホに対応、270度傾斜範囲のシングル アクシス ヒンジ、クレードルとベースのシリコン パッドが擦り傷を防止、iPad Pro 12.9を安定させる重量調整。シングル アクシス傾斜のみ — 高さ調整なし・スイベル/回転なしで、縦横切り替えにはタブレットを持ち上げて再クレードルする必要があり滑らかな回転はできない、一体ヒンジはデテント ストップなしで長時間ビデオ通話中に摩擦面が摩耗するとどんな意図的な角度もずれる可能性、クレードルの仕上げ精度はユニット間で差があり一部買い手はクレードル内のiPadのがたつきを報告。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-lamicall-tablet-stand", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FLamicall%2B%E3%82%BF%E3%83%96%E3%83%AC%E3%83%83%E3%83%88%E3%82%B9%E3%82%BF%E3%83%B3%E3%83%89%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "uperfect-tablet-floor-stand",
    category: "tech",
    badge: "🛏️",
    name: { en: "UPERFECT Tablet Floor Stand", ja: "UPERFECT タブレット フロアスタンド" },
    description: {
      en: "5,980-8,980 yen tall floor-stand pick for hands-free bed and sofa viewing. Adjustable column extends 90-150 cm tall, gooseneck arm bends to position the tablet directly over the bed or above a recipe surface, weighted footprint base, fits 4.7-12.9 inch tablets and most phones via spring-loaded clamp. Wobble at full extension is the dominant long-term complaint — at 150 cm with an iPad Pro 12.9 the gooseneck flex is visible and even small bumps to the column produce a 5-10 second oscillation that disrupts reading; weighted base footprint takes 35-40 cm of floor space that is awkward in a small Japanese bedroom; spring clamp marks the bezel of metal-edged tablets after repeated mounting and unmounting.",
      ja: "5,980-8,980円のハンズフリー ベッド/ソファ視聴向け背の高いフロアスタンド枠。調整可能カラムが90-150cmまで伸び、グースネック アームがタブレットをベッドの真上やレシピ面の上に配置、重量フットプリント ベース、スプリング式クランプで4.7-12.9インチのタブレットとほとんどのスマホに対応。フル伸長時の揺れが支配的長期不満 — 150cmでiPad Pro 12.9を載せるとグースネックの撓みが目に見え、カラムへの小さな衝撃でも5-10秒の振動が読書を妨げる、重量ベース フットプリントは35-40cmの床面積を取り小さな日本の寝室では扱いにくい、スプリング クランプは繰り返し装着脱着でメタル エッジのタブレットのベゼルにマーキングが残る。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-uperfect-tablet-floor-stand", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%82%BF%E3%83%96%E3%83%AC%E3%83%83%E3%83%88%2B%E3%83%95%E3%83%AD%E3%82%A2%E3%82%B9%E3%82%BF%E3%83%B3%E3%83%89%2B%E3%82%A2%E3%83%BC%E3%83%A0%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "twelve-south-hoverbar-duo",
    category: "tech",
    badge: "✨",
    name: { en: "Twelve South HoverBar Duo", ja: "Twelve South HoverBar Duo" },
    description: {
      en: "11,800-13,800 yen premium clamp/desk arm. Spring-tensioned articulating arm with magnetic puck (separate accessory or built-in depending on year), screw-clamp mounts to desk edges 0-50 mm thick, swing-out reach 35 cm with smooth multi-axis articulation, weighted desk-base option included for non-clampable surfaces. Clamp footprint limits where you can mount — many Japanese desks have an apron that blocks the clamp throat or a thicker top than the 50 mm range, and the desk-base alternative reclaims floor and desk space the arm was supposed to free; iPad-focused magnetic plate sizing means Android tablets and older non-magnetic iPad Mini require a third-party adapter ring; 11,800-13,800 yen plus the magnetic adapter where needed pushes total cost over 15,000 yen.",
      ja: "11,800-13,800円のプレミアム クランプ/机上アーム枠。スプリング張力の関節アーム+マグネット式パック(年式により別アクセサリーまたは内蔵)、0-50mm厚の机縁にネジ クランプ取付、滑らかなマルチアクシス関節で35cmスイング可能、クランプ不可面用の重量机上ベース オプション同梱。クランプ フットプリントが取付場所を制限 — 多くの日本の机はクランプの喉を塞ぐエプロンや50mmレンジを超える厚みを持ち、机上ベース代替肢はアームが解放するはずだった床と机の面積を取り戻す、iPad中心のマグネット プレート サイジングはAndroidタブレットと旧マグネット非対応iPad Miniにサードパーティ アダプタ リングを要求、11,800-13,800円+必要時のマグネット アダプタで合計15,000円超。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-twelve-south-hoverbar-duo", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FTwelve%2BSouth%2BHoverBar%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Tech / Standing Desks (best-standing-desk-2026) ─────────
  {
    id: "flexispot-e7-pro",
    category: "tech",
    badge: "🏋️",
    name: { en: "Flexispot E7 Pro Standing Desk", ja: "Flexispot E7 Pro 昇降デスク" },
    description: {
      en: "Flagship dual-motor electric sit-stand desk with 125kg weight capacity, anti-collision obstacle detection, 4-position memory presets, and C-frame design for knee clearance. Dual motors keep lift quiet and consistent under heavy monitor loads. Weakness: C-frame wobbles more than four-leg frames at full standing height with heavy monitors; ~50kg weight requires two people for assembly (60-90 min).",
      ja: "デュアルモーター電動昇降デスクのフラッグシップ。125kg耐荷重、衝突防止センサー標準、4ポジションメモリープリセット、膝元空間を確保するC型フレーム。弱点：重いモニター使用時の最大立位高でのC型横揺れ；約50kgの重量により2人での組み立て（60〜90分）が必要。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-flexispot-e7-pro", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FFlexispot%2BE7%2BPro%2B%E6%98%87%E9%99%8D%E3%83%87%E3%82%B9%E3%82%AF%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "ikea-bekant-sit-stand",
    category: "tech",
    badge: "🪑",
    name: { en: "IKEA Bekant Sit/Stand Desk", ja: "IKEA ベカント 昇降デスク" },
    description: {
      en: "Entry-level electric sit-stand desk with 70x120cm top, simple two-button hold-to-move control, and a 5-year motor and frame warranty. Available at IKEA Japan stores with walk-in parts access. Weakness: no memory presets (hold button every time); slower and noisier motor than premium alternatives; max height 125cm; more wobble at standing height than premium desks.",
      ja: "70×120cmの天板・シンプルな2ボタンホールド式操作・5年間のモーターとフレーム保証付き入門クラス電動昇降デスク。日本のIKEAストアで予備部品に店頭アクセス可能。弱点：メモリープリセットなし（毎回ボタンホールド）；プレミアム製品より遅く騒音が大きいモーター；最大高125cm；立位時の揺れがプレミアムより顕著。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-ikea-bekant-sit-stand", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FIKEA%2B%E3%83%99%E3%82%AB%E3%83%B3%E3%83%88%2B%E6%98%87%E9%99%8D%E3%83%87%E3%82%B9%E3%82%AF%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "autonomous-smartdesk-pro",
    category: "tech",
    badge: "🤖",
    name: { en: "Autonomous SmartDesk Pro", ja: "Autonomous SmartDesk Pro スタンディングデスク" },
    description: {
      en: "Mid-range programmable sit-stand frame with four memory presets, quieter motor than entry-level alternatives, wide desktop size and material options, and an app with posture reminders and height-change logging. Desktop top sold separately. Weakness: US brand with 2-4 week Japan import lead times; customer support for Japan-based warranty claims has mixed reviews; frame-only price excludes desktop (add ¥15,000-25,000).",
      ja: "4つのメモリープリセット・入門より静かなモーター・幅広い天板サイズ・素材オプション・姿勢リマインダーと高さ変更ログを持つアプリを備えたミドルレンジプログラマブル昇降フレーム。天板は別売。弱点：米国ブランドで日本への配送リードタイム2〜4週間；日本在住買い手の保証対応サポートが賛否両論；フレーム価格は天板を含まず（1万5千〜2万5千円追加）。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-autonomous-smartdesk-pro", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FAutonomous%2BSmartDesk%2BPro%2B%E3%82%B9%E3%82%BF%E3%83%B3%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0%E3%83%87%E3%82%B9%E3%82%AF%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "okamura-swift-desk",
    category: "tech",
    badge: "🇯🇵",
    name: { en: "Okamura Swift Standing Desk", ja: "オカムラ スウィフト 昇降デスク" },
    description: {
      en: "Japanese corporate-grade electric sit-stand desk from Okamura, Japan's dominant office furniture manufacturer. Slim profile, Japanese manufacturing standards, national service and support network, proven reliability in Japanese corporate environments. Weakness: ¥80,000+ entry price is the highest in this comparison; sold primarily through corporate procurement channels, not general retail; conservative feature set vs aggressively-spec'd Chinese alternatives.",
      ja: "日本の主要オフィス家具メーカー、オカムラの企業向け電動昇降デスク。スリムプロフィール・日本製基準・全国サービスネットワーク・日本の企業環境での実証された信頼性。弱点：8万円超の入門価格はこの比較で最高；主に法人調達チャネルで販売され一般小売ではない；積極的なスペックの中国製品と比較してフィーチャー面では保守的。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-okamura-swift-desk", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%82%AA%E3%82%AB%E3%83%A0%E3%83%A9%2B%E3%82%B9%E3%82%A6%E3%82%A3%E3%83%95%E3%83%88%2B%E6%98%87%E9%99%8D%E3%83%87%E3%82%B9%E3%82%AF%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "bamboo-standing-desk",
    category: "tech",
    badge: "🌿",
    name: { en: "Bamboo Top Standing Desk", ja: "竹 スタンディングデスク 昇降" },
    description: {
      en: "Bamboo desktop top paired with an electric sit-stand frame, offering natural material aesthetics, anti-bacterial surface (bamboo-kun natural antimicrobial compound), and home-office warmth that melamine and MDF-core tops cannot replicate. Weakness: bamboo warps in sustained high-humidity environments — Japan's summer months (June-September, 70-90% RH) can cause cupping and edge-lift within 1-2 seasons in apartments without year-round climate control; heavier than MDF-core tops, reducing usable motor payload; ¥10,000-20,000 premium over MDF-core.",
      ja: "電動昇降フレームに合わせた竹天板。天然素材の美観・抗菌表面（天然抗菌成分バンブーくん）・メラミンやMDFコアが実現できない温かいホームオフィスの雰囲気。弱点：持続高湿度環境での反り — 年中空調なし日本の夏（6〜9月、湿度70〜90%）では1〜2シーズンで湾曲・端部浮きが生じる可能性；MDFコアより重くモーター耐荷重を減少；MDFコアへの1万〜2万円プレミアム。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-bamboo-standing-desk", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E7%AB%B9%2B%E3%82%B9%E3%82%BF%E3%83%B3%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0%E3%83%87%E3%82%B9%E3%82%AF%2B%E6%98%87%E9%99%8D%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Tech / Wireless Chargers (best-wireless-charger-2026) ─────────
  {
    id: "apple-magsafe-charger-usb-c",
    category: "tech",
    badge: "🍎",
    name: { en: "Apple MagSafe Charger (USB-C, 2m)", ja: "Apple MagSafe充電器（USB-C、2m）" },
    description: {
      en: "Apple's official MagSafe Charger with USB-C connector and 2m cable. 15W on iPhone 12 and later with a 20W+ USB-C PD adapter, magnetic alignment ring for reliable coil coupling, MFi-certified. Weakness: cable only, no adapter included — 15W requires a 20W+ USB-C PD adapter purchased separately (~¥2,780); charges one device only; 7.5W Qi for non-MagSafe devices; ~¥4,980 is expensive per watt versus third-party Qi2 alternatives.",
      ja: "Apple公式MagSafe充電器、USB-Cコネクター・2mケーブル付き。20W以上のUSB-C PDアダプターでiPhone 12以降に15W供給、確実なコイルカップリングのための磁気アライメントリング、MFi認証済み。弱点：ケーブルのみ同梱でアダプターなし — 15Wには別途約2,780円の20W以上のUSB-C PDアダプターが必要；1台のみ充電；MagSafe非対応端末は7.5W Qi；約4,980円はサードパーティのQi2代替品と比べ1Wあたりのコストが高い。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-apple-magsafe-charger-usb-c", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FApple%2BMagSafe%2B%E5%85%85%E9%9B%BB%E5%99%A8%2BUSB-C%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "anker-maggo-3in1-station",
    category: "tech",
    badge: "⚡",
    name: { en: "Anker MagGo 3-in-1 Charging Station", ja: "Anker MagGo 3in1充電ステーション" },
    description: {
      en: "MagSafe-certified 3-in-1 charging station with foldable design. Simultaneous 15W MagSafe iPhone, MFi Apple Watch fast charge, and 5W AirPods Qi pad. Weakness: 30W USB-C PD adapter required for full simultaneous charging not included (~¥2,000–4,000 extra); non-Apple devices charge at basic Qi rates; folded size larger and heavier than single-device travel options; Apple Watch arm is fixed-angle.",
      ja: "折りたたみ式のMagSafe認証済み3in1充電ステーション。iPhone 15W MagSafe・MFi認証Apple Watchクイック充電・AirPods 5W Qiパッドを同時充電。弱点：3台フル同時充電に必要な30W USB-C PDアダプター不含（追加2,000〜4,000円）；非Appleデバイスは基本Qi速度；折りたたみ後も単体旅行用より大きく重い；Apple Watchアームが固定角。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-anker-maggo-3in1-station", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FAnker%2BMagGo%2B3in1%2B%E5%85%85%E9%9B%BB%E5%99%A8%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "belkin-boostcharge-pro-3in1",
    category: "tech",
    badge: "💎",
    name: { en: "Belkin BoostCharge Pro 3-in-1", ja: "Belkin BoostCharge Pro 3in1 MagSafe" },
    description: {
      en: "MFi MagSafe 3-in-1 charging station with 15W iPhone MagSafe, MFi Apple Watch fast charge arm (5W, Series 7+), 5W AirPods Qi pad, premium fabric-wrap and aluminium build. Weakness: ~¥15,000 is the most expensive in this comparison; Apple Watch arm protrudes awkwardly, making travel packing difficult; no USB-C pass-through port; price premium over Anker MagGo is primarily build quality — charging specs are essentially identical.",
      ja: "MFi MagSafe 3in1充電ステーション。iPhone 15W MagSafe・MFi認証Apple Watchクイック充電（5W、Series 7以降）・AirPods 5W Qiパッド、プレミアムビルド。弱点：約1万5千円で本比較最高額；Apple Watchアームが旅行収納に不便な固定角で突き出す；USB-Cパススルーポートなし；Anker MagGoとの価格差は主にビルドクオリティのみ — 充電速度はほぼ同等。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-belkin-boostcharge-pro-3in1", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FBelkin%2BBoostCharge%2BPro%2B3in1%2BMagSafe%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "anker-313-wireless-charger",
    category: "tech",
    badge: "📱",
    name: { en: "Anker 313 Wireless Charger (Qi, 10W)", ja: "Anker 313 ワイヤレス充電器（Qi、10W）" },
    description: {
      en: "Budget Qi wireless charging pad. 10W for compatible Android, 7.5W for iPhone, 5W universal Qi, flat pad with USB-A cable included, minimalist black rubber surface, LED charging indicator. Weakness: Qi only, no magnetic alignment — phone must be positioned carefully within coil sweet spot; 7.5W iPhone is slowest in this comparison; flat design makes glancing at charging phone less comfortable; no Apple Watch charging.",
      ja: "格安Qiワイヤレス充電パッド。Android対応10W・iPhone 7.5W・汎用Qi 5W、USB-Aケーブル付属フラットパッド、ミニマルデザイン、LED充電インジケーター。弱点：Qiのみで磁気アライメントなし — コイルスイートスポット内に正確な位置決めが必要；iPhone 7.5Wは本比較最遅；フラットデザインで充電中の端末確認が不便；Apple Watch充電非対応。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-anker-313-wireless-charger", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FAnker%2B%E3%83%AF%E3%82%A4%E3%83%A4%E3%83%AC%E3%82%B9%E5%85%85%E9%9B%BB%E5%99%A8%2BQi%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "esr-halolock-2in1-travel",
    category: "tech",
    badge: "✈️",
    name: { en: "ESR HaloLock 2-in-1 Travel Wireless Charger", ja: "ESR HaloLock 2in1 旅行用ワイヤレス充電器" },
    description: {
      en: "Foldable MagSafe-compatible 2-in-1 travel wireless charger. MagSafe magnet ring for iPhone alignment, secondary 5W Qi AirPods pad, folds to credit-card footprint at ~12mm, USB-C input, ~¥4,000. Weakness: 7.5W iPhone only (not full 15W MagSafe — uses compatible magnets without Qi2 certification); AirPods pad is 5W Qi only; no Apple Watch spot; build quality less premium than Belkin or Anker MagGo.",
      ja: "折りたたみ式MagSafe互換2in1旅行用ワイヤレス充電器。iPhoneアライメント用MagSafe磁石リング・5W AirPods Qiサブパッド・クレジットカードサイズに折りたたみ（厚さ約12mm）・USB-C入力・約4,000円。弱点：iPhone最大7.5W（Qi2認証なしのMagSafe互換磁石のため15W MagSafeではない）；AirPodsパッドは5W Qiのみ；Apple Watchスポットなし；ビルドクオリティがBelkinやAnker MagGoより劣る。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-esr-halolock-2in1-travel", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FESR%2BHaloLock%2B%E3%83%AF%E3%82%A4%E3%83%A4%E3%83%AC%E3%82%B9%E5%85%85%E9%9B%BB%E5%99%A8%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Tech / Desk Lamps (best-desk-lamp-2026) ─────────
  {
    id: "benq-screenbar-halo",
    category: "tech",
    badge: "💡",
    name: { en: "BenQ ScreenBar Halo", ja: "BenQ ScreenBar Halo モニターライト" },
    description: {
      en: "Monitor-mounted LED bar with asymmetric optics (desk illumination without screen glare), back-glow bias lighting for eye strain reduction, ambient light sensor, wireless controller, CRI 95+ claimed, 2,700–6,500K. Explicit weakness: ¥30,000+ price is a 6x multiple over Baseus for the core function; monitor-mount only, no desk stand; back-glow can be distracting in bright rooms; requires powered USB port from monitor.",
      ja: "非対称光学系でデスク面を照らしスクリーングレアを排除するモニター装着型LEDバー。バックグローバイアスライティング・照度センサー・ワイヤレスコントローラー・CRI 95以上（主張）・2,700〜6,500K。明確な弱点：3万円超はBaseusの6倍のプレミアム；モニター専用装着でデスクスタンドなし；明るい室内ではバックグローが眩しい場合がある；モニターの給電USBポートが必要。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-benq-screenbar-halo", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FBenQ%2BScreenBar%2BHalo%2B%E3%83%A2%E3%83%8B%E3%82%BF%E3%83%BC%E3%83%A9%E3%82%A4%E3%83%88%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "elgato-key-light",
    category: "tech",
    badge: "🎬",
    name: { en: "Elgato Key Light", ja: "Elgato Key Light クリエイター向けLEDパネル" },
    description: {
      en: "2,500 lux LED panel for content creators, streamers, and video call professionals. 2,900–7,000K, app and Stream Deck control, soft-panel diffused output for face illumination, desk clamp mount. Explicit weakness: ¥30,000+ for face illumination only, not desk-surface lighting; requires Elgato app for meaningful control; large clamp needs desk edge 6cm+ thick.",
      ja: "コンテンツクリエイター・配信者・ビデオ会議プロ向けの2,500ルクスLEDパネル。2,900〜7,000K・アプリとStream Deck操作・顔照明向けソフトパネル出力・クランプ装着。明確な弱点：顔照明専用で3万円超はカメラ前に立つ機会が少ない人には正当化が難しい；実質的な操作にElgatoアプリが必要；クランプはデスク端6cm以上が必要。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-elgato-key-light", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FElgato%2BKey%2BLight%2B%E3%82%AF%E3%83%AA%E3%82%A8%E3%82%A4%E3%82%BF%E3%83%BC%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "dyson-solarcycle-morph",
    category: "tech",
    badge: "🌞",
    name: { en: "Dyson Solarcycle Morph", ja: "Dyson Solarcycle Morph デスクランプ" },
    description: {
      en: "Articulated desk lamp with task, ambient, and indirect light modes. Personalized light schedule, 150,000-hour LED life claim, CRI 98 claimed, 2,700–6,500K, Dyson Link app control. Explicit weakness: ¥90,000+ is ~3x the next most expensive product; heat pipe cooling requires designed angle ranges; heavy base makes repositioning effortful.",
      ja: "タスク・アンビエント・間接照明の3モード切り替え可動デスクランプ。パーソナライズ光スケジュール・15万時間LED寿命主張・CRI 98主張・2,700〜6,500K・Dyson Linkアプリ操作。明確な弱点：9万円超は次点製品の約3倍；ヒートパイプ冷却は設計角度内での使用前提；重いベースは位置変更が面倒。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-dyson-solarcycle-morph", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%83%80%E3%82%A4%E3%82%BD%E3%83%B3%2BSolarcycle%2BMorph%2B%E3%83%87%E3%82%B9%E3%82%AF%E3%83%A9%E3%83%B3%E3%83%97%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "panasonic-led-desk-lamp-wireless",
    category: "tech",
    badge: "🇯🇵",
    name: { en: "Panasonic LED Desk Lamp (Wireless Charging)", ja: "Panasonic LEDデスクスタンド ワイヤレス充電" },
    description: {
      en: "Japanese domestic brand, five color temperature presets, stepless dimming, USB-C output, 5W Qi wireless charging pad in base, compact footprint for Japanese desk environments. Explicit weakness: 5W Qi is slow by 2026 standards (3–4x slower than MagSafe); no app or smart home integration; CRI approx 85–90, below 90+ for color-accurate creative work.",
      ja: "国内ブランド・5段階色温度プリセット・無段階調光・USB-C出力・ベース一体型5W Qiワイヤレス充電パッド・日本の机環境向けコンパクト設計。明確な弱点：5W Qiは2026年基準で遅い（MagSafeの3〜4倍の充電時間）；アプリやスマートホーム連携なし；CRI約85〜90でクリエイティブ作業の推奨90以上に届かない。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-panasonic-led-desk-lamp-wireless", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%83%91%E3%83%8A%E3%82%BD%E3%83%8B%E3%83%83%E3%82%AF%2BLED%E3%83%87%E3%82%B9%E3%82%AF%E3%82%B9%E3%82%BF%E3%83%B3%E3%83%89%2B%E3%83%AF%E3%82%A4%E3%83%A4%E3%83%AC%E3%82%B9%E5%85%85%E9%9B%BB%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "baseus-monitor-light-bar",
    category: "tech",
    badge: "💰",
    name: { en: "Baseus i-wok Monitor Light Bar", ja: "Baseus i-wok モニターライト" },
    description: {
      en: "Budget BenQ ScreenBar alternative under ¥5,000. USB-C powered, touch control strip, asymmetric optic for desk illumination without screen glare, clip mount for monitor bezels. Explicit weakness: lighter build than BenQ, no bias back-glow, no ambient sensor, CRI not prominently specified (likely below 80 at cool temperatures).",
      ja: "5,000円以下のBenQ ScreenBar代替。USB-C給電・バー上タッチコントロール・グレアなし非対称光学設計・モニターベゼルクリップ装着。明確な弱点：BenQよりビルドが軽くクリップの固定力が低い；バイアスライティング（バックグロー）なし；照度センサーなし；CRIは目立つ形で非公表でクールな色温度でCRI 80以下の可能性が高い。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-baseus-monitor-light-bar", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FBaseus%2B%E3%83%A2%E3%83%8B%E3%82%BF%E3%83%BC%E3%83%A9%E3%82%A4%E3%83%88%2B%E3%83%87%E3%82%B9%E3%82%AF%E3%83%A9%E3%83%B3%E3%83%97%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Tech / Mechanical Keyboards (best-mechanical-keyboard-2026) ─────────
  {
    id: "keychron-q1-pro",
    category: "tech",
    badge: "⌨️",
    name: { en: "Keychron Q1 Pro", ja: "Keychron Q1 Pro メカニカルキーボード" },
    description: {
      en: "Gasket-mounted 75% layout, Bluetooth 5.1 and 2.4GHz wireless, QMK/VIA programmable firmware, full aluminum body (~2kg), south-facing RGB, hot-swap MX-compatible sockets, ~¥30,000. Explicit weakness: 2kg weight unsuitable for travel; volume knob absent on base model (knob upgrade variant only); QMK firmware has a genuine learning curve; ¥30,000 expensive for a 75% without included switches in barebones configurations.",
      ja: "ガスケットマウント75%レイアウト、Bluetooth 5.1 + 2.4GHzワイヤレス、QMK/VIA対応ファームウェア、フルアルミボディ（約2kg）、サウスフェーシングRGB、ホットスワップMX互換ソケット、約3万円。明確な弱点：約2kgで旅行・持ち運び不適、ボリュームノブはベースモデル非搭載（ノブ変種のみ）、QMKは本物の学習曲線あり、ベアボーン構成ではスイッチ別途購入が必要で3万円は高価。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-keychron-q1-pro", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FKeychron%2BQ1%2BPro%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "hhkb-professional-hybrid-type-s",
    category: "tech",
    badge: "🏛️",
    name: { en: "HHKB Professional Hybrid Type-S", ja: "HHKB Professional Hybrid Type-S" },
    description: {
      en: "Electrostatic capacitive Topre switches with silenced domes, ultra-quiet 60% layout, Bluetooth + USB-C, ¥35,000+. Explicit weakness: no RGB, no hot-swap, no QMK, Bluetooth-only wireless (no 2.4GHz dongle), Topre non-MX keycap stems limit aftermarket options, 60% layout requires adjustment period.",
      ja: "静電容量無接点Topreサイレントドーム、超静音60%レイアウト、Bluetooth + USB-C、3.5万円以上。明確な弱点：RGBなし・ホットスワップなし・QMKなし・Bluetoothのみ（2.4GHzドングルなし）・Topre専用軸でキーキャップ選択肢限定・60%レイアウトは慣れが必要。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-hhkb-professional-hybrid-type-s", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FHHKB%2BProfessional%2BHybrid%2BType-S%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "logicool-mx-keys-s",
    category: "tech",
    badge: "💼",
    name: { en: "Logicool MX Keys S", ja: "Logicool MX Keys S ワイヤレスキーボード" },
    description: {
      en: "Scissor-switch (not mechanical), low-profile, Bluetooth and Logi Bolt 2.4GHz wireless, per-key backlight, Flow multi-device switching (up to 3 devices), ~¥17,000–¥20,000. Explicit weakness: NOT a mechanical keyboard — scissor mechanism categorically different from MX or Topre; limited programmability beyond Logi Options+ macros; 1.8mm key travel divides preference.",
      ja: "シザー方式（メカニカルではない）、薄型、Bluetooth + Logi Bolt 2.4GHz、キー個別バックライト、Flowマルチデバイス切り替え（最大3台）、約1.7〜2万円。明確な弱点：メカニカルキーボードではない — シザー機構はMXやTopreとは根本的に異なる、Logi Options+以上のカスタマイズ不可、1.8mmストロークは好み次第。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-logicool-mx-keys-s", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FLogicool%2BMX%2BKeys%2BS%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "nuphy-air75-v2",
    category: "tech",
    badge: "🪶",
    name: { en: "Nuphy Air75 V2", ja: "Nuphy Air75 V2 低プロファイルキーボード" },
    description: {
      en: "Ultra-slim gasket-mounted 75%, low-profile mechanical switches, Bluetooth 5.1 and 2.4GHz wireless, aluminum chassis, hot-swap MX low-profile compatible sockets, ~¥20,000. Explicit weakness: ~2.5–3mm low-profile travel divides opinion vs standard 4mm MX; smaller enthusiast community than Keychron; shorter battery life with RGB on; slower firmware update cadence.",
      ja: "超薄型ガスケットマウント75%、低プロファイルメカニカル、Bluetooth 5.1 + 2.4GHzワイヤレス、アルミシャシー、ホットスワップ低プロファイル互換ソケット、約2万円。明確な弱点：2.5〜3mmの低プロファイルストロークは標準4mmMXと好み分かれ、Keychronよりコミュニティ小さい、RGBオン時バッテリー短め、ファームウェア更新ペース遅め。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-nuphy-air75-v2", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FNuphy%2BAir75%2BV2%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "realforce-r3",
    category: "tech",
    badge: "🇯🇵",
    name: { en: "Realforce R3", ja: "Realforce R3 静電容量キーボード" },
    description: {
      en: "Electrostatic capacitive Topre, full-size (104-key) and TKL (87-key), actuation point changer (1.5–3mm), made in Japan by Topre Corp, PBT keycaps, JIS and US ANSI layouts, ¥40,000+. Explicit weakness: no wireless on most variants, no RGB comparable to competition, heavy full-size footprint, Topre keycap ecosystem limits aftermarket, APC software requires setup.",
      ja: "静電容量無接点Topre、フルサイズ（104キー）とTKL（87キー）展開、アクチュエーションポイント変更機能（1.5〜3mm）、東プレ社の日本製、PBTキーキャップ、JIS/USレイアウト、4万円以上。明確な弱点：ほとんどの変種でワイヤレスなし、競合比較でRGB見劣り、フルサイズは重くデスク面積大、Topreキーキャップエコシステム制限あり、APCソフトウェア設定必要。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-realforce-r3", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FRealforce%2BR3%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Tech / Gaming Mice (best-gaming-mouse-2026) ─────────
  {
    id: "logicool-g-pro-x-superlight-2",
    category: "tech",
    badge: "🖱️",
    name: { en: "Logicool G Pro X Superlight 2", ja: "Logicool G Pro X Superlight 2" },
    description: {
      en: "~¥20,000 ultra-lightweight competitive gaming mouse. 60g, HERO 25K sensor, 2000Hz polling, dual-mode Bluetooth+2.4GHz, zero clicks required to confirm pairing. Explicit weakness: ¥20,000 is premium for a mouse; right-handed only shape; zero side buttons; battery life 95 hours (less than competitors at similar prices).",
      ja: "約2万円の超軽量競技向けゲーミングマウス。60g・HERO 25Kセンサー・2000Hzポーリング・2.4GHzワイヤレス。明確な弱点：2万円はマウスとして高額、右手専用形状、サイドボタンなし、電池寿命95時間(同価格帯比較で少なめ)。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-logicool-g-pro-x-superlight-2", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FLogicool%2BG%2BPro%2BX%2BSuperlight%2B2%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "razer-deathadder-v3",
    category: "tech",
    badge: "🐍",
    name: { en: "Razer DeathAdder V3", ja: "Razer DeathAdder V3" },
    description: {
      en: "~¥8,000 right-handed ergonomic gaming mouse. 59g, Focus Pro 30K sensor, wired-only standard (wireless HyperSpeed version extra), proven DeathAdder shape for medium-large right hands. Explicit weakness: wired base model only (wireless V3 HyperSpeed costs more); right-hand only; 30K DPI is marketing headroom most users never touch above 3200.",
      ja: "約8,000円の右手用エルゴノミクスゲーミングマウス。59g・Focus Pro 30Kセンサー・基本有線モデル（ワイヤレスはHyperSpeed別売）。明確な弱点：有線モデルのみ、右手専用、30K DPIは実使用で3200以上使わない。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-razer-deathadder-v3", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FRazer%2BDeathAdder%2BV3%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "logicool-mx-master-3s",
    category: "tech",
    badge: "🏆",
    name: { en: "Logicool MX Master 3S", ja: "Logicool MX Master 3S" },
    description: {
      en: "~¥15,000 productivity mouse. MagSpeed electromagnetic scroll wheel, 8000 DPI, Flow multi-device, USB-C charging, works on glass surfaces. Explicit weakness: 141g is heavy compared to gaming mice; not for competitive gaming; MagSpeed scroll requires adjustment period; Logi Options+ required for full customization.",
      ja: "約1.5万円の生産性向け多機能マウス。MagSpeed電磁スクロール・8000 DPI・Flowマルチデバイス・USB-C充電・ガラス面対応。明確な弱点：141gはゲーミングマウス比較で重い、競技ゲーム非推奨、MagSpeedスクロールは慣れが必要、フル機能にLogi Options+必須。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-logicool-mx-master-3s", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FLogicool%2BMX%2BMaster%2B3S%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "elecom-m-xgm20dlbk",
    category: "tech",
    badge: "🇯🇵",
    name: { en: "Elecom HUGE EX M-XGM20DLBK", ja: "エレコム HUGE EX M-XGM20DLBK" },
    description: {
      en: "~¥8,000 Japanese ergonomic large gaming mouse. Designed for large-hand Japanese office+game hybrid use, trackball-compatible chassis design option, 25600 DPI, USB receiver. Explicit weakness: not well-known outside Japan so limited international community support; large size limits portability; software is Japanese-market focused.",
      ja: "約8,000円の日本向けエルゴノミクス大型ゲーミングマウス。大きい手向けオフィス＋ゲーム兼用設計、25600DPI、USB受信機。明確な弱点：海外コミュニティが少なく国際情報が限定的、大型ゆえ持ち運び不便、ソフトウェアが日本市場向け。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-elecom-m-xgm20dlbk", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%82%A8%E3%83%AC%E3%82%B3%E3%83%A0%2BHUГЕ%2BEX%2FM-XGM20DLBK%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "microsoft-arc-mouse",
    category: "tech",
    badge: "🌙",
    name: { en: "Microsoft Arc Mouse", ja: "Microsoft Arc Mouse" },
    description: {
      en: "~¥8,000 ultra-thin foldable travel mouse. Bluetooth only, folds flat for bag carry, touch scroll strip, 1-year battery, works on most surfaces, pairs instantly with Surface and Windows. Explicit weakness: Bluetooth-only means no 2.4GHz reliability; click mechanism has limited tactile feedback; not suitable for precision gaming; the fold mechanism wears over 2-3 years of heavy travel use.",
      ja: "約8,000円の超薄型折りたたみトラベルマウス。Bluetoothのみ、フラット折りたたみ、タッチスクロール、電池1年、Surface/Windowsとの即ペアリング。明確な弱点：Bluetoothのみで2.4GHzの安定性なし、クリック感が限定的、精密ゲーミング不向き、2〜3年ヘビー使用でヒンジが摩耗。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-microsoft-arc-mouse", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FMicrosoft%2BArc%2BMouse%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Tech / Webcams (best-webcam-2026) ─────────
  {
    id: "logitech-brio-505",
    category: "tech",
    badge: "📷",
    name: { en: "Logitech Brio 505", ja: "Logicool Brio 505" },
    description: {
      en: "~¥18,000 1080p AI webcam. 60fps, AI auto-framing tracks face movement, Show Mode for document display, USB-C, dual omnidirectional mics. Explicit weakness: 1080p not 4K despite ¥18,000 price; AI framing can jitter when moving fast; Show Mode requires specific desk angle.",
      ja: "約1.8万円の1080p AIウェブカメラ。60fps・AI自動フレーミング・Show Mode・USB-C・デュアルマイク。明確な弱点：1.8万円で4Kではなく1080p、AI自動フレーミングは動きが速いと追跡がぶれる、Show Modeは特定の角度が必要。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-logitech-brio-505", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FLogicool%2BBrio%2B505%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "anker-powerconf-c200",
    category: "tech",
    badge: "💰",
    name: { en: "Anker PowerConf C200", ja: "Anker PowerConf C200" },
    description: {
      en: "~¥7,000 2K 30fps value webcam. Dual microphone with noise cancellation, autofocus, USB-A, compact design. Explicit weakness: 30fps (not 60fps); no AI framing; USB-A cable (non-detachable); noise cancellation less effective than dedicated mics.",
      ja: "約7,000円の2K 30fps コスパウェブカメラ。デュアルノイズキャンセルマイク・オートフォーカス・USB-A・コンパクト。明確な弱点：30fps（60fpsでない）・AI自動フレームなし・USB-Aケーブル非脱着・専用マイク比較でノイキャン弱め。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-anker-powerconf-c200", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FAnker%2BPowerConf%2BC200%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "elgato-facecam-pro",
    category: "tech",
    badge: "🎬",
    name: { en: "Elgato Facecam Pro", ja: "Elgato Facecam Pro" },
    description: {
      en: "~¥42,000 4K 60fps streamer webcam. Sony STARVIS 2 sensor, large aperture f/2.0, manual focus ring, no built-in mic (by design), Elgato Hub integration, Camera Hub software. Explicit weakness: ¥42,000 is 6x Anker for the same function in Zoom calls; no built-in mic requires separate mic investment; 4K streaming requires 20Mbps+ upload; Camera Hub software only.",
      ja: "約4.2万円の4K 60fpsストリーマー向けウェブカメラ。Sony STARVIS 2センサー・f/2.0大口径・マニュアルフォーカスリング・マイク非内蔵（仕様）・Elgato Hub連携。明確な弱点：4.2万円はZoom会議用途でAnkerの6倍、マイク非内蔵で別途マイク購入必須、4K配信は20Mbps+のアップロード必要、Camera Hubソフトウェア依存。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-elgato-facecam-pro", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FElgato%2BFacecam%2BPro%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "elecom-ucam-cz30fbk",
    category: "tech",
    badge: "🇯🇵",
    name: { en: "Elecom UCAM-CZ30FBKF", ja: "エレコム UCAM-CZ30FBKF" },
    description: {
      en: "~¥5,000 Japanese domestic brand 1080p webcam. Built-in mic, USB-A, plug-and-play, domestic warranty and support, compatible with Japanese video call software. Explicit weakness: 30fps 1080p is baseline spec for 2026; minimal software features; no AI capabilities; international community support limited.",
      ja: "約5,000円の国産ブランド1080pウェブカメラ。マイク内蔵・USB-A・プラグアンドプレイ・国内保証・国産ビデオ会議ソフト対応。明確な弱点：2026年基準では30fps/1080pは最低限スペック、ソフト機能最小限、AI機能なし、海外コミュニティ情報少ない。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-elecom-ucam-cz30fbk", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%82%A8%E3%83%AC%E3%82%B3%E3%83%A0%2BUCAM-CZ30FBKF%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "microsoft-lifecam-studio",
    category: "tech",
    badge: "💼",
    name: { en: "Microsoft LifeCam Studio", ja: "Microsoft LifeCam Studio" },
    description: {
      en: "~¥6,000-8,000 Microsoft 1080p webcam for Teams/Office use. True Color Technology, autofocus, USB-A, seamless Teams integration, Microsoft's own video processing. Explicit weakness: aging product line with no 2026 refresh; no 4K or 60fps option; software features tied to Windows/Teams ecosystem; premium pricing for a 1080p webcam in 2026.",
      ja: "約6,000〜8,000円のMicrosoft Teams/Office向け1080pウェブカメラ。True Color Technology・オートフォーカス・USB-A・Teamsとのシームレス連携。明確な弱点：2026年更新なしの旧製品ライン、4Kや60fps非対応、Windowsエコシステム依存、2026年に1080pで高め。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-microsoft-lifecam-studio", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FMicrosoft%2BLifeCam%2BStudio%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Tech / Portable Speakers (best-portable-speaker-2026) ─────────
  {
    id: "jbl-flip-6",
    category: "tech",
    badge: "🔊",
    name: { en: "JBL Flip 6", ja: "JBL Flip 6" },
    description: {
      en: "~¥15,000 IP67 portable speaker. 12-hour battery, PartyBoost multi-speaker linking, 360-degree passive radiator configuration. Explicit weakness: 12-hour battery is short for all-day outdoor use; passive radiator is not true omnidirectional; PartyBoost is JBL-only.",
      ja: "約¥15,000のIP67ポータブルスピーカー。12時間バッテリー、PartyBoostマルチスピーカー連結、360度パッシブラジエーター構成。明確な弱点：12時間は終日屋外使用には短い；パッシブラジエーターは真の全指向性ではない；PartyBoostはJBL専用。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-jbl-flip-6", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FJBL%2BFlip%2B6%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "sony-srs-xb33",
    category: "tech",
    badge: "🔊",
    name: { en: "Sony SRS-XB33", ja: "Sony SRS-XB33" },
    description: {
      en: "~¥12,000 IP67 portable speaker. 24-hour battery, EXTRA BASS DSP mode, multi-color LED lighting, built-in microphone. Explicit weakness: EXTRA BASS causes distortion at high volumes; LED lighting reduces battery life significantly; larger and heavier than competitors.",
      ja: "約¥12,000のIP67ポータブルスピーカー。24時間バッテリー、EXTRA BASS DSPモード、マルチカラーLEDライティング、マイク内蔵。明確な弱点：EXTRA BASSは大音量で歪みを生じる；LEDでバッテリーが大幅に短縮；競合より大きく重い。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-sony-srs-xb33", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FSony%2BSRS-XB33%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "ultimate-ears-boom-3",
    category: "tech",
    badge: "🔊",
    name: { en: "Ultimate Ears BOOM 3", ja: "Ultimate Ears BOOM 3" },
    description: {
      en: "~¥15,000 IP67 portable speaker. True 360-degree omnidirectional drivers, 15-hour battery, MagicButton one-tap playback shortcut, floats in water. Explicit weakness: cylindrical form rolls on uneven surfaces; bass less punchy than JBL Flip 6; floats on side not face-up.",
      ja: "約¥15,000のIP67ポータブルスピーカー。真の360度全指向性ドライバー、15時間バッテリー、MagicButton1タップ再生ショートカット、水に浮く。明確な弱点：円筒形が不安定面で転がる；バスはJBL Flip 6より弱い；横向きで浮く（正面向きではない）。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-ultimate-ears-boom-3", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FUltimate%2BEars%2BBOOM%2B3%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "bose-soundlink-flex",
    category: "tech",
    badge: "🔊",
    name: { en: "Bose SoundLink Flex", ja: "Bose SoundLink Flex" },
    description: {
      en: "~¥20,000 IP67 outdoor speaker. PositionIQ adaptive EQ adjusts to placement, 12-hour battery, floats right-side-up in water, outdoor acoustic tuning. Explicit weakness: ¥20,000 premium; 12-hour battery is tied for shortest; no large multi-speaker chain protocol.",
      ja: "約¥20,000のIP67アウトドアスピーカー。PositionIQ置き方適応EQ、12時間バッテリー、水面で正面向き浮遊、アウトドア音響チューニング。明確な弱点：¥20,000のプレミアム価格；12時間は本比較で最短クラス；大規模マルチスピーカーチェーン非対応。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-bose-soundlink-flex", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FBose%2BSoundLink%2BFlex%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "anker-soundcore-3",
    category: "tech",
    badge: "🔊",
    name: { en: "Anker Soundcore 3", ja: "Anker Soundcore 3" },
    description: {
      en: "~¥5,000 IPX7 budget speaker. 24-hour battery, stereo pairing with second unit, titanium composite drivers. Explicit weakness: audible audio quality gap vs premium options at high volumes; lower maximum output; IPX7 only (no dust protection); stereo pairing only.",
      ja: "約¥5,000のIPX7バジェットスピーカー。24時間バッテリー、2台目とのステレオペアリング、チタン複合ドライバー。明確な弱点：大音量での高価格帯との音質差は明確；最大出力が低い；防塵対応なしのIPX7のみ；ステレオペアリングのみ。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-anker-soundcore-3", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FAnker%2BSoundcore%2B3%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Home / Mattresses (best-mattress-2026) ─────────
  {
    id: "tempur-original-supreme",
    category: "home",
    badge: "🛌",
    name: { en: "Tempur Original Supreme", ja: "テンピュール オリジナル スプリーム" },
    description: {
      en: "154,000 yen memory-foam flagship. Original NASA-derived viscoelastic foam, deepest pressure conformance in this comparison, 10-year warranty, longest empirical durability record. 30 kg single-size weight makes delivery, rotation, and disposal a real ergonomic problem; sleeps hot in Japanese summer without air conditioning.",
      ja: "154,000円のメモリーフォーム フラッグシップ。元祖NASA由来の粘弾性フォーム、本比較最深の体圧分散コンフォーマンス、10年保証、本比較最長の実証耐久性記録。シングルで30kg重量により配送・回転・処分が本物のエルゴノミクス問題、エアコンなしの日本の夏で暑く寝る。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-tempur-original-supreme", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FTempur%2BOriginal%2BSupreme%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "nishikawa-air-si",
    category: "home",
    badge: "🟦",
    name: { en: "Nishikawa [AiR] SI", ja: "西川 [エアー] SI" },
    description: {
      en: "66,000 yen Japanese point-pressure pick. Refined ten-de-sasaeru construction, 460+ year brand heritage, most extensive after-sales network in Japan, antimicrobial cover, 24 cm thickness for bedframe or tatami direct use. Firmer than typical Western memory foam; side sleepers over 75 kg report hip-sinking discomfort over time; warranty and after-sales are essentially Japan-only.",
      ja: "66,000円の日本式点で支える枠。磨き込まれた点で支える構造、460年超のブランド歴史、日本最大級のアフターサービス網、抗菌カバー、24cm厚みでベッドフレーム/畳直敷き両用。典型的西洋メモリーフォームより硬め、75kg超の側臥位寝者は時間とともに腰沈みすぎ違和感をレポート、保証とアフターサービスは事実上日本のみ。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-nishikawa-air-si", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E8%A5%BF%E5%B7%9D%2B%E3%82%A8%E3%82%A2%E3%83%BC%2BSI%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "coala-new-mattress",
    category: "home",
    badge: "🐨",
    name: { en: "Coala (New Coala) Mattress", ja: "コアラ(ニューコアラ)マットレス" },
    description: {
      en: "69,900 yen D2C trial-friendly pick. Three-layer foam construction, 120-day in-home trial with free pickup return, 10-year warranty, ships compressed in a box. Foam softness does not specifically excel for heavier sleepers (over 85 kg) or stomach sleepers; trial requires keeping packaging and mattress in returnable condition; not built for athletic recovery or aggressive lumbar support.",
      ja: "69,900円のD2Cトライアル重視枠。3層フォーム構造、120日自宅トライアル+無料引取返品、10年保証、圧縮箱で出荷。フォームの柔らかさは重い寝者(85kg超)や伏臥位寝者には突出して優れていない、トライアルは梱包とマットレスを返品可能状態に保つ必要、アスリートのリカバリーや積極的腰部サポート向けには作られていない。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-coala-new-mattress", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%82%B3%E3%82%A2%E3%83%A9%E3%83%9E%E3%83%83%E3%83%88%E3%83%AC%E3%82%B9%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "casper-original",
    category: "home",
    badge: "🛏️",
    name: { en: "Casper Original", ja: "キャスパー オリジナル" },
    description: {
      en: "99,000 yen international D2C design pick. Four-layer foam with three-zone gradation, perforated top for airflow, 25 cm thickness, recognised Pinterest-staple aesthetic. Foam-dominant 25 cm height feels harder than expected for back sleepers under 70 kg; sleeps warm in Japanese summer without air conditioning; Japan after-sales coverage concentrated in Tokyo and Osaka.",
      ja: "99,000円の国際D2Cデザイン枠。3ゾーングラデーションの4層フォーム、通気のための穿孔トップ、25cm厚み、認知されたPinterest定番美学。フォーム主体25cm高さは70kg未満の仰臥位寝者には想定より硬く感じる、エアコンなしの日本の夏で暑く寝る、日本のアフターサービス カバレッジは東京と大阪に集中。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-casper-original", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FCasper%2BOriginal%2B%E3%83%9E%E3%83%83%E3%83%88%E3%83%AC%E3%82%B9%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "nell-mattress",
    category: "home",
    badge: "🌀",
    name: { en: "NELL Mattress", ja: "NELL マットレス" },
    description: {
      en: "75,000 yen hybrid pocket-coil + foam pick. 13-layer construction, pocket-coil core with three-zone gradation, 120-day in-home trial, 10-year warranty, strong motion isolation for couples. Heaviest in this comparison at roughly 30 kg making setup and disposal harder; brand has only 6 years of field data as of 2026, so the 10-year claim is not yet fully validated empirically; hybrid construction has more potential failure points than pure foam.",
      ja: "75,000円のハイブリッド ポケットコイル+フォーム枠。13層構造、3ゾーングラデーションのポケットコイル コア、120日自宅トライアル、10年保証、カップル向け強い振動分離。約30kgで本比較最重量、セットアップと処分が難しい、ブランドは2026年時点で6年のフィールドデータしかなく10年保証主張は完全実証されていない、ハイブリッド構造は純フォームより潜在的故障点が多い。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-nell-mattress", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FNELL%2B%E3%83%9E%E3%83%83%E3%83%88%E3%83%AC%E3%82%B9%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Home / Coffee Makers (best-coffee-maker-2026) ─────────
  {
    id: "breville-barista-pro-bes878",
    category: "home",
    badge: "☕",
    name: { en: "Breville Barista Pro BES878", ja: "ブレビル バリスタ プロ BES878" },
    description: {
      en: "119,800 yen prosumer enthusiast espresso pick. 15-bar pump, 30-setting conical-burr built-in grinder, ThermoJet sub-4-second warm-up, PID temperature control, real steam wand for milk texturing. Weekly backflushing required and not optional; 2-4 week learning curve before reliably pulling balanced shots; 32 cm wide footprint dominates a Japanese apartment kitchen counter.",
      ja: "119,800円のプロシューマー愛好家エスプレッソ枠。15-bar ポンプ、30段階の円錐バー内蔵グラインダー、ThermoJetで4秒未満の予熱、PID 温度制御、ミルクテクスチャリング用本物スチームワンド。週次バックフラッシュは必須でオプションでない、バランスショットを安定して引けるまで2-4週間の学習曲線、幅32cmのフットプリントが日本のアパート キッチン カウンターを支配。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-breville-barista-pro-bes878", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FBreville%2BBarista%2BPro%2BBES878%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "delonghi-magnifica-start-ecam22020",
    category: "home",
    badge: "🤖",
    name: { en: "De'Longhi Magnifica Start ECAM22020B", ja: "デロンギ マニフィカ スタート ECAM22020B" },
    description: {
      en: "98,000 yen super-automatic one-touch espresso pick. 15-bar pump, 13-setting conical-burr built-in grinder, programmable espresso and lungo, 1.8 L tank for 60+ cups before refill. Built-in grinder runs at 78-82 dB and reliably wakes a sleeping partner through a Japanese apartment wall; uses proprietary De'Longhi water filter cartridges (Brita-incompatible); base ECAM22020B trim is manual-frother, not LatteCrema automatic milk system.",
      ja: "98,000円の全自動ワンタッチ エスプレッソ枠。15-bar ポンプ、13段階の円錐バー内蔵グラインダー、プログラム可能エスプレッソとルンゴ、給水60+杯の1.8L タンク。内蔵グラインダーは78-82dBで稼働し日本のアパートの壁越しに寝ているパートナーを確実に起こす、デロンギ独自浄水カートリッジ(Brita非対応)を使用、ベース ECAM22020Bグレードは手動フローサーでLatteCrema自動ミルクシステムではない。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-delonghi-magnifica-start-ecam22020", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FDelonghi%2BMagnifica%2BStart%2BECAM22020B%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "balmuda-the-brew-k06a",
    category: "home",
    badge: "🫖",
    name: { en: "Balmuda The Brew K06A", ja: "バルミューダ ザ・ブリュー K06A" },
    description: {
      en: "66,000 yen design-drip pick. Programmable 30-second bloom, controlled spiral drip pattern mimicking hand pour, stainless-and-glass aesthetic for Pinterest-grade kitchen photography. Brews one cup at a time with no batch capacity; carafe is uninsulated and brewed coffee drops to lukewarm within 6-8 minutes; 66,000 yen is design-tax-heavy for a single-cup drip machine compared to functional Japanese-brand alternatives.",
      ja: "66,000円のデザイン ドリップ枠。30秒プログラム可能ブルーム、ハンドドリップを模倣する制御スパイラル ドリップ パターン、Pinterest級キッチン写真用のステンレス・ガラス美学。1度に1杯ずつ抽出でバッチ容量なし、カラフェは断熱なしで抽出されたコーヒーが6-8分以内にぬるく落ちる、機能等価の国内ブランド代替肢比1杯ドリップ機に66,000円はデザインタックス重い。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-balmuda-the-brew-k06a", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FBalmuda%2BThe%2BBrew%2BK06A%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "nespresso-vertuo-next",
    category: "home",
    badge: "🟫",
    name: { en: "Nespresso Vertuo Next", ja: "ネスプレッソ ヴァーチュオ ネクスト" },
    description: {
      en: "21,800 yen capsule convenience pick. 30-second cup-to-button time, no grinder, no portafilter, no skill required, automatic barcode-driven brew parameter selection. Vertuo capsules at 110-140 yen each push monthly running cost to 6,600-8,400 yen for two-cup-per-day households (highest in this comparison); capsule waste is aluminium and most owners do not actually use the recycling program; format lock-in means no third-party capsule alternative.",
      ja: "21,800円のカプセル利便性枠。ボタンからカップまで30秒、グラインダーなし、ポルタフィルターなし、技術不要、自動バーコード駆動の抽出パラメーター選択。ヴァーチュオ カプセル1個110-140円で1日2杯世帯の月運用コストを6,600-8,400円(本比較最高)に押し上げる、カプセル廃棄物はアルミニウムでほとんどのオーナーは実際にはリサイクル プログラムを使わない、形式ロックインでサードパーティ カプセル代替肢なし。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-nespresso-vertuo-next", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FNespresso%2BVertuo%2BNext%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "tiger-acc-a060",
    category: "home",
    badge: "🐯",
    name: { en: "Tiger ACC-A060 PCO-A", ja: "タイガー ACC-A060 PCO-A" },
    description: {
      en: "32,800 yen practical Japanese drip pick. Bloom function, stainless thermos carafe holding drinkable temperature for 4-6 hours, 0.81 L capacity for 6 cups per cycle, removable mesh filter, full Tiger Japan after-sales network. Bloom time is on the short side (15-20 seconds versus Balmuda's 30 seconds) and limits cup quality with light-roast specialty beans; built-in grinder (where included) is flat-blade not conical-burr with less uniform particle distribution; design is functional-Japanese-appliance, not Pinterest-photogenic.",
      ja: "32,800円の実用日本ドリップ枠。蒸らし機能、4-6時間飲み頃温度を保つステンレス サーモス カラフェ、サイクル6杯の0.81L 容量、取り外し可能メッシュ フィルター、タイガー日本全国アフターサービス網。蒸らし時間が短め(15-20秒、バルミューダの30秒に対し)でライト ロースト スペシャルティ豆ではカップ品質を制限、内蔵グラインダー(含まれる場合)はフラット ブレード型で円錐バーではなく粒度分布が均一でない、デザインは機能的-日本家電でPinterest映えしない。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-tiger-acc-a060", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FTiger%2BACC-A060%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Home / Espresso Machines (best-espresso-machine-2026) ─────────
  {
    id: "delonghi-dedica-ec685",
    category: "home",
    badge: "☕",
    name: { en: "De'Longhi Dedica EC685", ja: "デロンギ Dedica EC685" },
    description: {
      en: "25,000 yen slim semi-automatic entry point at 15 cm wide — the narrowest in this comparison. 15-bar pump, accepts ground coffee and ESE pods. Ships with pressurised basket that masks grind errors but limits shot quality ceiling; no built-in grinder.",
      ja: "25,000円のスリム半自動エントリー、幅15cm — 本比較最小幅。15barポンプ、グラウンドコーヒーとESEポッド両対応。グラインドエラーを隠すが品質天井を制限する加圧式バスケット付属、内蔵グラインダーなし。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-delonghi-dedica-ec685", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FDelonghi%2BDedica%2BEC685%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "breville-barista-express-bes870",
    category: "home",
    badge: "🔧",
    name: { en: "Breville Barista Express BES870", ja: "ブレビル バリスタ エクスプレス BES870" },
    description: {
      en: "90,000 yen enthusiast semi-automatic with PID temperature control, 16-setting conical burr grinder, 54mm portafilter. Highest shot quality ceiling in this comparison when dialed in. Sold in Japan through Branca. Single boiler requires 30-45s wait between espresso and steam; 2-4 week dialing-in period.",
      ja: "90,000円の愛好家向け半自動機、PID温度制御・16段階円錐バーグラインダー・54mmポルタフィルター搭載。ダイヤルイン時の本比較最高ショット品質。ブランカ経由で日本販売。シングルボイラーは抽出とスチームの切り替えに30-45秒待機、安定ショットまで2-4週間のダイヤルイン期間。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-breville-barista-express-bes870", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FBreville%2BBarista%2BExpress%2BBES870%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "delonghi-magnifica-s-ecam22110",
    category: "home",
    badge: "🤖",
    name: { en: "De'Longhi Magnifica S ECAM22.110", ja: "デロンギ マグニフィカS ECAM22.110" },
    description: {
      en: "65,000 yen fully automatic bean-to-cup pick. One button press from whole beans to espresso shot. 7-setting grinder, manual Pannarello steam wand for milk drinks. Grinder runs at 75-78 dB; daily auto-rinse cycle on startup adds wait. De'Longhi Japan after-sales support strongest in this comparison.",
      ja: "65,000円の全自動豆から1杯ピック。ホールビーンからエスプレッソショットまでワンボタン。7段階グラインダー、手動パナレロ スチームワンド付き。グラインダーは75-78dBで稼働、起動時の自動リンサイクルが待機を追加。デロンギ日本のアフターサービスが本比較最充実。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-delonghi-magnifica-s-ecam22110", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FDelonghi%2BMagnifica%2BS%2BECAM22%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "philips-series-2200-ep2220",
    category: "home",
    badge: "💧",
    name: { en: "Philips Series 2200 EP2220/14", ja: "フィリップス シリーズ2200 EP2220/14" },
    description: {
      en: "45,000 yen compact fully automatic with AquaClean filter eliminating descaling when maintained. 12-setting ceramic grinder (quieter and cooler than steel burrs). No LatteGo automatic milk system — manual steam wand only. AquaClean cartridge replacement (1,500-2,000 yen every 2-3 months) replaces descaling as primary maintenance.",
      ja: "45,000円のコンパクト全自動機、メンテ維持時にデスケーリング不要なAquaCleanフィルター付き。12段階セラミックグラインダー(スチールバーより静かで低温)。LatteGo自動ミルクシステムなし — 手動スチームワンドのみ。AquaCleanカートリッジ交換(¥1,500-2,000/2-3ヶ月)がデスケーリングに代わる主要メンテ。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-philips-series-2200-ep2220", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FPhilips%2BEP2220%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Home / Tea Kettles (best-tea-kettle-2026) ─────────
  {
    id: "balmuda-the-pot",
    category: "home",
    badge: "🫖",
    name: { en: "Balmuda The Pot", ja: "バルミューダ ザ・ポット" },
    description: {
      en: "~¥15,000 design-first 600 ml gooseneck kettle. Matte stainless exterior, ultra-narrow spout, IH and gas compatible. No temperature control, no keep-warm. 600 ml is constraining for households of 2+.",
      ja: "約¥15,000のデザイン重視600mlグースネックケトル。マットステンレス外装・超細スパウト・IH/ガス対応。温度調節なし・保温なし。2人以上の家庭には600mlが制約的。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-balmuda-the-pot", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%83%90%E3%83%AB%E3%83%9F%E3%83%A5%E3%83%BC%E3%83%80%2B%E3%82%B6%E3%83%9D%E3%83%83%E3%83%88%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "hario-v60-buono-kettle",
    category: "home",
    badge: "☕",
    name: { en: "Hario V60 Drip Kettle Buono", ja: "ハリオ V60 ドリップケトル" },
    description: {
      en: "Classic stove-top gooseneck pour-over kettle. 1.2 L stainless steel, IH and gas compatible, reference kettle for pour-over coffee and Japanese tea ceremony. No electric keep-warm; handle heats on gas burners.",
      ja: "クラシックなコンロ用グースネックポアオーバーケトル。1.2Lステンレス・IH/ガス対応、日本のポアオーバーコミュニティの参照ケトル。電気保温なし、ガスコンロでハンドルが熱くなる。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-hario-v60-buono-kettle", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%83%8F%E3%83%AA%E3%82%AA%2BV60%2B%E3%83%89%E3%83%AA%E3%83%83%E3%83%97%E3%82%B1%E3%83%88%E3%83%AB%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "delonghi-icona-vintage-kettle",
    category: "home",
    badge: "🏺",
    name: { en: "De'Longhi Icona Vintage Electric Kettle", ja: "デロンギ アイコナ ヴィンテージ 電気ケトル" },
    description: {
      en: "Retro-styled 1.7 L rapid-boil electric kettle. 360-degree cordless base, drip-free spout, automatic shutoff. Heavy when full (~2.5 kg); plastic interior builds lime-scale faster in hard-water areas; wide spout unsuitable for pour-over.",
      ja: "レトロスタイルの1.7L急速沸騰電気ケトル。360度コードレスベース・液だれなしスパウト・自動シャットオフ。満タン時に重い（約2.5kg）、プラスチック内部は硬水で石灰スケールが速い、広口はポアオーバーに不向き。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-delonghi-icona-vintage-kettle", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%83%87%E3%83%AD%E3%83%B3%E3%82%AE%2B%E9%9B%BB%E6%B0%97%E3%82%B1%E3%83%88%E3%83%AB%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "zojirushi-keep-warm-pot",
    category: "home",
    badge: "🇯🇵",
    name: { en: "Zojirushi CV-GB22 Keep Warm Electric Pot", ja: "象印 CV-GB22 電気ポット 保温" },
    description: {
      en: "2.2 L all-day keep-warm dispenser pot. Four temperature settings (60/70/80/98°C), pump dispense, auto re-boil, child-safety lid lock, PSE certified. Stationary and bulkier than any kettle-style pick; descaling required every 1–2 months in hard-water areas.",
      ja: "2.2L終日保温ディスペンサーポット。4段階温度設定（60/70/80/98°C）・ポンプディスペンス・自動再沸騰・子ども安全ふたロック・PSE認証。据え置き型でどのケトルより嵩張る、硬水地域では1〜2ヶ月ごとの除石灰が必要。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-zojirushi-keep-warm-pot", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E8%B1%A1%E5%8D%B0%2B%E9%9B%BB%E6%B0%97%E3%83%9D%E3%83%83%E3%83%88%2B%E4%BF%9D%E6%B8%A9%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "fellow-stagg-ekg",
    category: "home",
    badge: "🎯",
    name: { en: "Fellow Stagg EKG Electric Kettle", ja: "Fellow Stagg EKG ケトル" },
    description: {
      en: "Precision pour-over electric gooseneck benchmark. 0.9 L, counterbalanced handle, continuous temperature dial (~60–100°C), 60-min keep-warm, matte black. US$165+ import price; 0.9 L tight for back-to-back brews; Japan availability varies with multi-week stockouts.",
      ja: "精密ポアオーバー電気グースネックベンチマーク。0.9L・カウンターバランスハンドル・連続温度ダイヤル（約60〜100°C）・60分保温・マットブラック。US$165+の輸入価格、連続注ぎには0.9Lが手狭、日本での入手可能性は変動し複数週間の在庫切れあり。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-fellow-stagg-ekg", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FFellow%2BStagg%2BEKG%2B%E3%82%B1%E3%83%88%E3%83%AB%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Home / Blenders (best-blender-2026) ─────────
  {
    id: "vitamix-a3500i",
    category: "home",
    badge: "🥤",
    name: { en: "Vitamix A3500i", ja: "Vitamix A3500i" },
    description: {
      en: "143,000 yen prosumer countertop pick. 1500 W peak / 1100-1200 W continuous brushless motor with 7-year warranty including motor coverage, 2.0 L Tritan container, laser-cut hammermill 4-blade assembly, smart pairing program presets via Bluetooth, the only blender in this comparison that does all five common tasks (smoothies, hot soup via friction heating, nut butter, ice crushing, dry grain) competently. 143,000 yen is firmly into the prosumer investment tier and overkill for households that do not blend daily; 2.0 L container is too large for one-person smoothies (cavitation when underfilled below 500 mL); 22×21×44 cm footprint with 11.8 kg weight dominates a Japanese apartment counter; operating noise reaches 88-92 dB at full speed during ice crushing.",
      ja: "143,000円のプロシューマー カウンタートップ枠。モーター カバー含む7年保証付き1500Wピーク/1100-1200W連続ブラシレス モーター、2.0L Tritan容器、レーザーカット ハマーミル4枚ブレード アセンブリ、Bluetooth経由スマート ペアリング プログラム プリセット、本比較で全5一般タスク(スムージー・摩擦加熱による温かいスープ・ナッツバター・かき氷・乾物)を器用にこなす唯一のブレンダー。143,000円はプロシューマー投資ティアに明確に入り毎日ブレンドしない家庭にはオーバーキル、2.0L容器は1人用スムージーには大きすぎ500mL未満で過充填するとキャビテーション、22×21×44cmフットプリントと11.8kg重量が日本のアパート カウンターを支配、動作音はかき氷フルスピードで88-92dBに達する。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-vitamix-a3500i", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FVitamix%2BA3500i%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "vitantonio-vbl-100",
    category: "home",
    badge: "🍓",
    name: { en: "Vitantonio My Bottle Blender VBL-100", ja: "ビタントニオ マイボトルブレンダー VBL-100" },
    description: {
      en: "7,500 yen personal-bottle blend-and-drink pick. 350 mL Tritan bottle with screw-on blade base, 200 W brushed motor with push-to-blend interlock, four pastel colorways tuned for the Pinterest morning-smoothie aesthetic, dishwasher-safe Tritan parts, direct distribution at Plaza, Loft, PayPay Mall, and Rakuten with Vitantonio Japan after-sales support. 350 mL capacity is the smallest in this comparison and one bottle equals one person's smoothie (not scalable to two-person households); 200 W motor cannot crush ice and the manual explicitly warns against it, cannot fully liquefy fibrous greens or hard-frozen fruit; 1-year warranty and brushed motor design imply 2-3 year practical lifespan with daily use; threading pattern at the bottle mouth collects pulp and yogurt requiring brush cleaning.",
      ja: "7,500円のパーソナル ボトル ブレンド&ドリンク枠。ねじ込みブレード ベース付き350mL Tritanボトル、押下げブレンド インターロックの200Wブラシ式モーター、Pinterest朝スムージー美学に調整された4色パステル、食洗機対応Tritanパーツ、Plaza・Loft・PayPay Mall・楽天での直接配給とビタントニオ ジャパン アフター サポート。350mL容量は本比較で最小、1ボトル=1人分スムージー(2人世帯にスケールしない)、200Wモーターは氷を割れずマニュアルが明示的に警告、繊維質の葉物や硬い冷凍フルーツを完全液化できない、1年保証とブラシ式モーター設計は毎日使用2-3年の実用寿命を含意、ボトル口のねじ込みパターンが果肉とヨーグルトを集めブラシ清掃を要する。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-vitantonio-vbl-100", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FVitantonio%2BVBL-100%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "tescom-tm856",
    category: "home",
    badge: "🇯🇵",
    name: { en: "TESCOM Pure Natura TM856", ja: "テスコム ピュアナチュラ TM856" },
    description: {
      en: "9,900 yen mid-tier glass-jar pick. 1.0 L heat-resistant glass jar accepts hot stovetop soup directly (rated 60-80°C input, briefly 90°C), 6-blade stainless-steel ice-crush assembly, 600 W brushed motor sufficient for routine smoothies and soups, four program presets, variable-speed knob with pulse, TESCOM Japan domestic service network, 1-year manufacturer warranty. Glass jar weighs 1.5 kg empty and 2.5-3.0 kg full (one-handed lifting awkward for users with weak grip strength); 600 W brushed motor cannot sustain nut butter blends and manual specifies 90-second maximum continuous run with mandatory 1-minute rest cycles; glass jar shatters on tile-floor drops with 2-3 meter cleanup radius; 200-500 hour brush life implies 4-6 year practical lifespan with moderate household use.",
      ja: "9,900円のミッドティア ガラスジャー枠。コンロからの熱スープを直接受け入れる1.0L耐熱ガラスジャー(60-80°C入力定格、瞬間的に90°C)、6枚ステンレス スチール かき氷ブレード アセンブリ、ルーティン スムージーとスープに十分な600Wブラシ式モーター、4プログラム プリセット、パルス付き可変速ノブ、テスコム ジャパン国内サービス網、1年メーカー保証。ガラスジャーは空1.5kg、満杯2.5-3.0kg(握力が弱いユーザーには片手リフトが扱いにくい)、600Wブラシ式モーターはナッツバター ブレンドを維持できずマニュアルが1分の必須休止サイクル付き90秒最大連続稼働を指定、ガラスジャーはタイル床落下で2-3メートル清掃半径で割れる、200-500時間ブラシ寿命は中程度の家庭使用4-6年の実用寿命を含意。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-tescom-tm856", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FTESCOM%2BTM856%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "oxo-on-compact-blender",
    category: "home",
    badge: "🇺🇸",
    name: { en: "OXO On Compact Blender", ja: "OXO On Compact Blender" },
    description: {
      en: "39,800 yen design-compact pick. 1.0 L Tritan container with OXO signature non-slip silicone base, 600 W brushless DC motor (only sub-Vitamix blender in this comparison with brushless durability), three program presets, OXO Good Grips usability detailing dominant on Pinterest US-kitchen-aesthetic since 2018, dishwasher-safe top-rack Tritan, 2-year limited warranty backed by OXO Japan distribution at Tokyu Hands and Loft. 39,800 yen is roughly 4x TESCOM TM856 on broadly equivalent functional spec — paying for OXO brand, brushless motor, and design polish rather than performance step-change; 1.0 L container is borderline-too-small for family meal-prep batches and borderline-too-large for one-person smoothies; US-import distribution in Japan means stock fluctuations on specific colorways with 4-8 week stockout and 2-3 week replacement-part lead times; 600 W motor cannot match Vitamix 1500 W for sustained ice crushing or nut butter.",
      ja: "39,800円のデザイン コンパクト枠。OXOシグネチャーの滑り止めシリコーン ベース付き1.0L Tritan容器、600Wブラシレス DCモーター(本比較でVitamix未満の唯一のブラシレス耐久性ブレンダー)、3プログラム プリセット、2018年以来Pinterest米キッチン美学を支配するOXO Good Grips使い勝手細部、食洗機対応上段Tritan、Tokyu HandsとLoftでのOXO ジャパン配給バックの2年限定保証。39,800円は広く等価な機能スペックでテスコム TM856の約4倍 — 性能のステップ チェンジではなくOXOブランド・ブラシレス モーター・デザイン磨きに支払う、1.0L容器は家族の食事準備バッチには境界線で小さすぎ1人用スムージーには境界線で大きすぎ、日本での米輸入配給は特定カラーで4-8週間在庫切れと2-3週間交換部品リード タイムを意味する、600Wモーターは持続的かき氷やナッツバターでVitamixの1500Wに匹敵できない。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-oxo-on-compact-blender", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FOXO%2BOn%2BCompact%2BBlender%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "iris-ohyama-ifm-s30g",
    category: "home",
    badge: "💴",
    name: { en: "Iris Ohyama Mill Blender IFM-S30G", ja: "アイリスオーヤマ ミルサー IFM-S30G" },
    description: {
      en: "4,378 yen budget mill-blender pick. 250 mL mill cup with standard 4-blade pattern, 200 W brushed motor with push-to-blend single-button operation, dry-grain capability for sesame/dry herbs/dried fish/small-batch coffee, baby food portion size, dishwasher-safe cup parts, Iris Ohyama nationwide retail and after-sales network at every home center, Aeon, and Don Quijote. 200 W brushed motor is the lowest-power in this comparison — cannot crush ice, cannot blend hard-frozen fruit, cannot produce nut butter, cannot heat soup, cannot make blends larger than 250 mL cup capacity; 200-500 hour brush life and budget construction imply 2-4 year practical lifespan; 250 mL cup is too small for any task larger than a one-person snack portion and overflows trip the safety interlock; build quality reflects the 4,378 yen price with white-only colorway and visibly budget plastic body.",
      ja: "4,378円の予算ミルブレンダー枠。標準4枚ブレード パターン付き250mLミルカップ、押下げブレンド シングル ボタン操作の200Wブラシ式モーター、ゴマ/乾燥ハーブ/乾物魚/小バッチ コーヒー用乾物対応、離乳食ポーション サイズ、食洗機対応カップ パーツ、日本の全ホーム センター・イオン・ドン・キホーテで入手可能なアイリスオーヤマ全国小売とアフターサービス網。200Wブラシ式モーターは本比較で最低出力 — 氷を割れず、硬い冷凍フルーツをブレンドできず、ナッツバターを生み出せず、スープを加熱できず、250mLカップ容量より大きいブレンドを作れない、200-500時間ブラシ寿命と予算構造は2-4年の実用寿命を含意、250mLカップは1人スナック ポーションより大きい任意のタスクには小さすぎ過充填で安全インターロックを跳ね上げる、構造品質は4,378円の価格を反映し白のみのカラーと目視で予算的なプラスチック本体。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-iris-ohyama-ifm-s30g", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%82%A2%E3%82%A4%E3%83%AA%E3%82%B9%E3%82%AA%E3%83%BC%E3%83%A4%E3%83%9E%2BIFM-S30G%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Home / Baby Monitors (best-baby-monitor-2026) ─────────
  {
    id: "cubo-ai-plus",
    category: "home",
    badge: "👶",
    name: { en: "Cubo Ai Plus", ja: "Cubo Ai Plus" },
    description: {
      en: "39,800 yen AI premium pick plus 1,400-1,800 yen/month Cubo Ai Plus Care subscription after 6-12 month free trial. 1080p video at 130-degree field of view, AI face-covered detection, AI rollover detection, AI danger-zone detection, AI cry classification, 18-piece lullaby library, two-way audio, manual privacy shutter, smartphone app as primary parent unit. Subscription is mandatory for the AI features that justify the price gap — without subscription, Cubo Ai degrades to a 1080p motion-alert camera that competitors sell for 17,000 yen; total 5-year cost is approximately 39,800 + (1,500 × 60) = 129,800 yen, roughly double the box price. WiFi-cloud architecture means complete dependency on Cubo Ai's cloud service (multi-day outage in 2024 locked thousands of parents out of remote viewing). AI false-positive rate produces 1-3 alerts per night for typical 6-12 month olds and parents report alert fatigue; security model requires strong password and 2FA discipline (2022 Australia credential-stuffing incident).",
      ja: "39,800円のAIプレミアム枠と6-12ヶ月無料試用後の月1,400-1,800円Cubo Ai Plus Careサブスク。1080pビデオ130度視野角、AI顔覆われ検知、AI寝返り検知、AI危険ゾーン検知、AI泣き声分類、18曲子守唄ライブラリ、双方向オーディオ、手動プライバシー シャッター、主要親ユニットとしてのスマホ アプリ。サブスクは価格差を正当化するAI機能のため必須 — サブスクなしではCubo Aiは競合が17,000円で売る1080pモーション アラート カメラに劣化、5年合計コストは約39,800 + (1,500 × 60) = 129,800円で箱価格の2倍。WiFiクラウド アーキテクチャはCubo Aiクラウド サービスへの完全依存を意味(2024年複数日障害が数千の親をリモート視聴からロック アウト)。AI誤検知率は典型6-12ヶ月児で1晩1-3アラートを生み親はアラート疲労を報告、セキュリティ モデルは強いパスワードと2FA規律を要求(2022年オーストラリア資格情報スタッフィング事案)。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-cubo-ai-plus", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FCubo%2BAi%2BPlus%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "eufy-spaceview-pro",
    category: "home",
    badge: "📡",
    name: { en: "Anker Eufy SpaceView Pro", ja: "Anker Eufy SpaceView Pro" },
    description: {
      en: "17,800 yen WiFi-free mid-tier pick. 5-inch dedicated parent screen on closed 2.4 GHz radio link, 720p video, 110-degree pan-and-tilt camera with 4x digital zoom, infrared night vision rated 4-5 meters, two-way audio with VOX, 8 lullaby presets, expandable to 4 cameras on a single screen, no WiFi, no app, no cloud, no subscription. Zero remote viewing — cannot check on the baby from outside the radio range (50 meters line-of-sight, less through walls); 720p resolution is below the WiFi-camera tier and visible on the 5-inch screen at 2-4 meter distances; no AI face-down or rollover detection; parent screen is a single failure point with no app fallback and replacement screens are 8,000-12,000 yen with frequent stockouts.",
      ja: "17,800円のWiFiなしミッドティア枠。閉じた2.4 GHz無線リンク上の5型専用親画面、720pビデオ、4倍デジタル ズーム付き110度パンチルト カメラ、4-5メートル定格赤外線暗視、VOX付き双方向オーディオ、8つの子守唄プリセット、1画面に4台のカメラに拡張可能、WiFiなし・アプリなし・クラウドなし・サブスクなし。ゼロ リモート視聴 — 無線範囲外(50メートル見通し、壁を通すとそれ以下)から赤ちゃんを確認できない、720p解像度はWiFiカメラ ティアより低く5型画面の2-4m距離で見える、AIうつぶせまたは寝返り検知なし、親画面はアプリ フォールバックなしの単一故障点で交換画面は8,000-12,000円で頻繁な在庫切れ。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-eufy-spaceview-pro", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FEufy%2BSpaceView%2BPro%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "nanit-pro-smart-camera",
    category: "home",
    badge: "📊",
    name: { en: "Nanit Pro Smart Camera", ja: "Nanit Pro Smart Camera" },
    description: {
      en: "45,000 yen data-analytics premium pick plus 1,500-2,500 yen/month Nanit Insights subscription. 1080p HDR video at 130-degree field of view, AI breathing-motion detection (requires Nanit Breathing Wear sold separately at 4,500-6,500 yen per garment outgrown every 3-4 months), AI sleep-quality scoring, growth-tracking via Smart Sheet, two-way audio, Apple HomeKit and Google Home integration. Breathing-motion detection requires the dedicated Nanit Breathing Wear that is sold separately and outgrown every 3-4 months — hidden recurring cost most reviews skip; growth-tracking via Smart Sheet requires actively photographing the baby on the sheet with wildly variable accuracy depending on photo angle (clinicians do not accept Nanit measurements as substitute for in-clinic measurement); Nanit Insights subscription unlocks sleep-analytics features that justify the price gap; wall-mount installation requires drilling above the crib and Japanese rental apartments often prohibit this.",
      ja: "45,000円のデータ分析プレミアム枠と月1,500-2,500円Nanit Insightsサブスク。1080p HDRビデオ130度視野角、AI呼吸モーション検知(別売Nanit Breathing Wearを1着4,500-6,500円・3-4ヶ月毎に大きくなって脱ぐ必要)、AI睡眠品質スコアリング、Smart Sheet経由成長記録、双方向オーディオ、Apple HomeKitとGoogle Home統合。呼吸モーション検知は別売で3-4ヶ月毎に脱ぐ専用Nanit Breathing Wearを必要 — ほとんどのレビューがスキップする隠れた繰り返しコスト、Smart Sheet経由成長記録は写真角度と赤ちゃんのポーズで極めて変動する精度で能動的に赤ちゃんを撮影することを必要(臨床医はNanit測定をクリニック内測定の代替として受け入れない)、Nanit Insightsサブスクは価格差を正当化する睡眠分析機能を解放、wall-mountインストールはcrib上の壁穴開けを必要で日本の賃貸アパートはしばしば禁止。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-nanit-pro-smart-camera", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FNanit%2BPro%2BSmart%2BCamera%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "owlet-cam-2",
    category: "home",
    badge: "🦉",
    name: { en: "Owlet Cam 2", ja: "Owlet Cam 2" },
    description: {
      en: "28,800 yen streaming-video WiFi camera pick plus optional 800-1,500 yen/month Owlet Premium subscription for cloud video history. 1080p HDR video at 130-degree field of view, two-way audio, motion and sound alerts with configurable sensitivity, infrared night vision rated 3-4 meters, smartphone app as primary parent unit, Apple HomeKit integration, integrates with Owlet Dream Sock if purchased separately for pulse-oximetry tracking. WiFi is required for camera-to-app connection — no local-only mode and a router outage means camera is unreachable even on same home WiFi (intermittent app-disconnect with 30-60-second alert delays during WiFi congestion is dominant complaint in long-term reviews); company history includes 2021 FDA warning letter and 2-year re-launch period and parents should read FDA's letter and Owlet's response before purchasing — current Cam 2 is FDA-cleared as wellness consumer electronics not as SIDS-prevention or medical-monitoring device; no AI face-covered or rollover detection.",
      ja: "28,800円のストリーミング ビデオWiFiカメラ枠とオプションの月800-1,500円Owlet Premiumサブスク クラウド ビデオ履歴。1080p HDRビデオ130度視野角、双方向オーディオ、設定可能感度のモーションと音アラート、3-4メートル定格赤外線暗視、主要親ユニットとしてのスマホ アプリ、Apple HomeKit統合、別購入時のパルス オキシメトリ追跡用Owlet Dream Sockとの統合。WiFiはカメラ-アプリ接続に必須 — ローカルのみモードなし、ルーター障害は同じ家庭WiFi上でもカメラが到達不可を意味(WiFi混雑期間中30-60秒アラート遅延の間欠的アプリ切断は長期レビューの支配的不満)、会社履歴は2021年FDA警告書と2年再ローンチ期間を含み親は購入前にFDAの書簡とOwletの応答を読むべき — 現Cam 2はSIDS予防または医療監視デバイスではなくウェルネス家電としてFDA認可、AI顔覆われや寝返り検知なし。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-owlet-cam-2", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FOwlet%2BCam%2B2%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "babysense-v65",
    category: "home",
    badge: "📺",
    name: { en: "Babysense V65 5-inch", ja: "Babysense V65 5型" },
    description: {
      en: "18,900 yen budget WiFi-free pick. 5-inch dedicated parent screen, 720p video, 110-degree fixed-position camera (no pan-and-tilt), infrared night vision rated 3-4 meters, two-way audio with VOX, 8 lullaby presets, temperature sensor, expandable to 4 cameras, no WiFi, no app, no cloud, no subscription. No AI features whatsoever — streaming video monitor with motion alerts and audio activation only; 720p resolution and fixed-position camera mean you set the camera angle once at installation and accept the baby may move out of frame as they grow into crawling; parent screen battery rated 8 hours degrades to 4-5 hours after 12-18 months of use with replacement screens at 7,000-9,000 yen and frequent stockouts; brand recognition in Japan is weaker than Anker Eufy or Cubo Ai with mixed after-sales support reviews (1-3 week support-ticket response times).",
      ja: "18,900円の予算WiFiなし枠。5型専用親画面、720pビデオ、110度固定位置カメラ(パンチルトなし)、3-4メートル定格赤外線暗視、VOX付き双方向オーディオ、8つの子守唄プリセット、温度センサー、4台拡張可能、WiFiなし・アプリなし・クラウドなし・サブスクなし。AI機能ゼロ — モーション アラートと音声起動のみのストリーミング ビデオ モニター、720p解像度と固定位置カメラはインストール時に1度カメラ角度を設定し赤ちゃんが這う段階に成長するとframe外に出るかもしれないことを受け入れることを意味、8時間定格親画面バッテリーは12-18ヶ月使用後に4-5時間に劣化し交換画面は7,000-9,000円で頻繁な在庫切れ、日本でのブランド認知度はAnker EufyやCubo Aiより弱く混在するアフターサービス サポート レビュー(1-3週間サポート チケット応答時間)。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-babysense-v65", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FBabysense%2BV65%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Home / Pet Cameras (best-pet-camera-2026) ─────────
  {
    id: "furbo-360-dog-camera",
    category: "home",
    badge: "🐶",
    name: { en: "Furbo 360° Dog Camera", ja: "Furbo 360° ドッグカメラ" },
    description: {
      en: "Roughly 28,000 yen treat-tossing dog-focused premium pick with 360-degree rotation, 1080p HD video, AI bark and activity alerts, treat dispense triggered from the smartphone app, two-way audio, dog-trained AI models, the category-defining premium pet camera since the original 2017 launch and refreshed across multiple iterations. Furbo Dog Nanny subscription at roughly 700-1,400 yen per month is required for the AI features that justify the box-price premium — without subscription the camera degrades to a 1080p camera with manual treat-toss and the 5-year cost works out to roughly 88,000 yen total when subscription is included; treat slot can jam roughly every 2-4 weeks depending on kibble shape and humidity; dog-only design means cats almost universally ignore the treat dispense and the bark-detection AI is irrelevant for cats; cloud architecture means privacy surface includes Furbo's cloud servers and any future incident affecting the brand.",
      ja: "約28,000円のおやつトス犬特化プレミアム枠、360度回転・1080p HDビデオ・AI吠え声と活動アラート・スマホ アプリからトリガーされるおやつディスペンサー・双方向オーディオ・犬訓練AIモデル、オリジナル2017年発売以来カテゴリを定義したプレミアム ペットカメラで複数の反復にわたってリフレッシュ。Furbo Dog Nannyサブスクが月約700-1,400円で箱価格プレミアムを正当化するAI機能のため必須 — サブスクなしではカメラは手動おやつトス付きの1080pカメラに劣化、サブスク含む5年合計コストは約88,000円; おやつスロットはキブル形状と湿度によって2-4週間に1回程度詰まる可能性; 犬専用設計は猫がほとんど普遍的におやつディスペンサーを無視し吠え声検知AIが猫には無関係であることを意味; クラウド アーキテクチャはプライバシー表面がFurboのクラウド サーバーとブランドに影響する将来の事案を含むことを意味。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-furbo-360-dog-camera", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FFurbo%2B360%2B%E3%83%89%E3%83%83%E3%82%B0%E3%82%AB%E3%83%A1%E3%83%A9%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "petcube-cam",
    category: "home",
    badge: "🐾",
    name: { en: "Petcube Cam", ja: "Petcube Cam" },
    description: {
      en: "Roughly 12,000 yen affordable pet-specific starter pick with 1080p video, two-way audio, basic motion and sound alerts, simple base model from the Petcube line, more affordable than Furbo because the treat-toss and laser-pointer hardware is reserved for the higher-end Petcube Bites and Petcube Play models. No treat dispense or laser pointer on the base Petcube Cam — those are premium-tier features on the Bites and Play models that cost meaningfully more; motion alerts can be noisy with frequent false positives that some reviewers report reaching alert fatigue within the first month; 110-degree field of view is narrower than Furbo's 360 and not enough for a large room without strategic placement; Petcube Care subscription gates the cloud video history and pet-recognition AI similar to Furbo Nanny.",
      ja: "約12,000円の手頃なペット特化スターター枠、1080pビデオ・双方向オーディオ・基本モーションと音アラート・Petcubeラインのシンプルなベース モデル、おやつトスとレーザー ポインター ハードウェアが高価のPetcube BitesとPetcube Playモデルに予約されているためFurboより手頃。ベースのPetcube Camにはおやつディスペンサーまたはレーザー ポインターなし — それらはより意味的に高コストのBitesとPlayモデルのプレミアム ティア機能; モーション アラートは騒がしくいくつかのレビュアーは最初の月内にアラート疲労に達したと報告する頻繁な誤検知; 110度視野角はFurboの360より狭く戦略的配置なしでは大きな部屋に十分でない; Petcube CareサブスクはFurbo Nannyに類似してクラウド ビデオ履歴とペット認識AIをゲート。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-petcube-cam", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FPetcube%2BCam%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "wyze-cam-v3",
    category: "home",
    badge: "📹",
    name: { en: "Wyze Cam v3", ja: "Wyze Cam v3" },
    description: {
      en: "Roughly 4,800 yen repurposed-security-cam budget pick with 1080p video, color night vision, two-way audio, weather-resistant for outdoor use, microSD local storage, the cheapest competent indoor camera that consistently appears on budget pet-camera lists. Not pet-specific — no bark detection, no treat dispense, no pet-aimed audio profile, the AI is trained on person-and-package classification with pet detection as a secondary feature; recent privacy and CSAM-moderation controversies in 2022-2023 plus a 2024 account-mixup incident damaged the brand reputation in the pet-camera community and any buyer should read the public reporting before committing; cloud event history requires Wyze Cam Plus at roughly 250 yen per month per camera which most budget-tier buyers skip and accept the 12-second cooldown between cloud events.",
      ja: "約4,800円の流用セキュリティ カメラ予算枠、1080pビデオ・カラー暗視・双方向オーディオ・屋外使用向け耐候性・microSDローカル ストレージ、予算ペットカメラ リストに一貫して登場する最も安価な有能な屋内カメラ。ペット特化ではない — 吠え声検知なし・おやつディスペンサーなし・ペット狙いオーディオ プロファイルなし、AIはペット検出を二次機能として人物と荷物分類で訓練; 2022-2023年の最近のプライバシーとCSAMモデレーション問題に加えて2024年アカウント混在事案がペットカメラ コミュニティでブランド評判を損ない買い手はコミットする前に公的報道を読むべき; クラウド イベント履歴はカメラごと月約250円のWyze Cam Plusを必要としほとんどの予算枠買い手はスキップしクラウド イベント間の12秒クールダウンを受け入れる。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-wyze-cam-v3", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FWyze%2BCam%2Bv3%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "pawbo-pet-camera",
    category: "home",
    badge: "🎯",
    name: { en: "Pawbo Pet Camera", ja: "Pawbo ペットカメラ" },
    description: {
      en: "Roughly 18,000 yen mid-tier treat-dispenser pick (or PetSafe equivalent depending on Japan availability) with 720p video, treat dispense from the smartphone app, two-way audio, scheduled treat-toss, sits between the cheap generic security cams and the premium Furbo. Lower video quality than Furbo with 720p versus 1080p which is meaningfully visible on tablet and laptop viewing; app reliability is mixed in long-term reviews with several reviewers reporting periodic crashes and pairing issues that persisted across firmware updates; treat-refill access on the unit is awkward enough that several reviewers report giving up on the daily refill ritual after a few months; dog-specific AI is absent or rudimentary compared to Furbo's bark-detection and activity scoring.",
      ja: "約18,000円の中位枠おやつディスペンサー枠(または日本での入手可能性に応じてPetSafe同等品)、720pビデオ・スマホ アプリからのおやつディスペンサー・双方向オーディオ・スケジュールされたおやつトス、安価な汎用セキュリティ カメラとプレミアムなFurboの間に座る。Furboより720p対1080pで低い動画品質はタブレットとラップトップ視聴で意味的に見える; アプリ信頼性は長期レビューで混在しいくつかのレビュアーがファームウェア アップデートを通じて持続した定期的なクラッシュとペアリング問題を報告; ユニット上のおやつ補充アクセスが厄介でいくつかのレビュアーは数か月後に毎日の補充儀式を諦めたと報告; 犬特化AIはFurboの吠え声検知と活動スコアリングと比較して不在または初歩的。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-pawbo-pet-camera", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FPawbo%2B%E3%83%9A%E3%83%83%E3%83%88%E3%82%AB%E3%83%A1%E3%83%A9%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "eufy-indoor-cam-2k-pan-tilt",
    category: "home",
    badge: "🏠",
    name: { en: "Anker Eufy Indoor Cam 2K Pan & Tilt", ja: "Anker Eufy Indoor Cam 2K Pan & Tilt" },
    description: {
      en: "Roughly 9,800 yen no-subscription local-storage indoor pick with 2K video, 360-degree pan and 96-degree tilt to find the pet wherever it is napping, person-and-pet motion detection, two-way audio, microSD local storage with no subscription required, Apple HomeKit Secure Video integration, the strongest local-storage indoor pick in the sub-15,000-yen band. No pet-specific AI — motion detection classifies person versus pet but does not provide bark detection, dog activity scoring, or any of the pet-trained AI features that justify the Furbo premium; no treat dispense or laser-pointer hardware so the interactive features that some pet owners want are absent; built-in speaker is thin and the audio quality on two-way conversations is meaningfully worse than the Furbo or Petcube speakers; designed as general-purpose indoor security and not as a pet camera so the marketing copy and the customer service assume a homeowner not a pet owner.",
      ja: "約9,800円のサブスク不要のローカル ストレージ屋内枠、2Kビデオ・ペットがどこで昼寝していても見つける360度パンと96度チルト・人物とペットのモーション検知・双方向オーディオ・サブスク不要のmicroSDローカル ストレージ・Apple HomeKit Secure Video統合、15,000円未満帯で最強のローカル ストレージ屋内枠。ペット特化AIなし — モーション検知は人物対ペットを分類するが吠え声検知・犬活動スコアリング・Furboプレミアムを正当化するペット訓練AI機能のいずれも提供しない; おやつディスペンサーまたはレーザー ポインター ハードウェアなしなので一部のペット オーナーが欲しいインタラクティブ機能は不在; 内蔵スピーカーは薄く双方向会話のオーディオ品質はFurboまたはPetcubeスピーカーより意味的に悪い; 汎用屋内セキュリティとして設計されペットカメラとしてではないためマーケティング コピーとカスタマー サービスはペット オーナーではなく住宅所有者を仮定。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-eufy-indoor-cam-2k-pan-tilt", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FEufy%2BIndoor%2BCam%2B2K%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Home / Toasters (best-toaster-2026) ─────────
  {
    id: "balmuda-the-toaster-k11a",
    category: "home",
    badge: "🍞",
    name: { en: "Balmuda The Toaster K11A", ja: "バルミューダ ザ・トースター K11A" },
    description: {
      en: "30,800 yen design-and-steam pick. 5 ml water-cup steam injection that pioneered the category, five preset bread modes (toast, sandwich, pastry, French, oven), 35.7 cm wide compact footprint, iconic Balmuda industrial design. Interior is hard to clean — cavity is small, heater coils are positioned where a damp cloth cannot easily reach, and the steam-injection nozzle requires periodic descaling that the manual minimizes; 5 ml water cup must be filled before every use; 4-6 year realistic lifespan with steam-mechanism failure as the dominant end-of-life mode.",
      ja: "30,800円のデザイン&スチーム枠。カテゴリを開拓した5ml水カップ スチーム注入、5プリセット パン モード(トースト・サンドイッチ・ペストリー・フランス・オーブン)、幅35.7cmコンパクト設置面積、象徴的なバルミューダ工業デザイン。内部が清掃しにくい — キャビティが小さく、ヒーター コイルがダンプ クロスが容易に届かない位置に配置、スチーム注入ノズルが取説が最小化する定期脱スケールを必要とする、5ml水カップを毎回使用前に満たす必要、スチーム機構故障を支配的寿命終了モードとする4-6年の現実的寿命。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-balmuda-the-toaster-k11a", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FBalmuda%2BThe%2BToaster%2BK11A%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "aladdin-aet-gs13c",
    category: "home",
    badge: "🔥",
    name: { en: "Aladdin Graphite Grill & Toaster AET-GS13C", ja: "アラジン グラファイト グリル&トースター AET-GS13C" },
    description: {
      en: "17,600 yen graphite-tube hard-crust pick. Front-and-rear graphite tubes hit 250 degrees Celsius in 0.2 seconds, accommodates a 25 cm pizza or a baguette laid diagonally, 13-minute timer with continuous temperature dial from low to 280 degrees Celsius, retro-British aesthetic. No bottom heater — graphite tubes are top-front and top-rear only and two-side bread browning requires manual mid-toast flipping; tubes run hot enough to char any crumb that lands on them and the smoke-smell appears faster than any other machine in this comparison; thinner after-sales network than Panasonic or Zojirushi with graphite-tube replacement at 8,000-12,000 yen plus service-center shipping.",
      ja: "17,600円のグラファイト管ハード クラスト枠。0.2秒で250度Cに到達する前後グラファイト管、25cmピザまたは斜めに置いたバゲットを収容、低温から280度Cまでの連続温度ダイヤル付き13分タイマー、レトロ ブリティッシュ美学。底面ヒーターなし — グラファイト管が上部前面と上部後面のみで両面褐変のための手動トースト中ひっくり返しが必要、管が落ちたクズを焦がすのに十分熱く煙臭が本比較の他のどのマシンより速く現れる、パナソニックや象印より薄いアフター サービス網でグラファイト管交換は8,000-12,000円+サービス センター送料。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-aladdin-aet-gs13c", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%82%A2%E3%83%A9%E3%82%B8%E3%83%B3%2BAET-GS13C%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "mitsubishi-bread-oven-to-st1",
    category: "home",
    badge: "🥖",
    name: { en: "Mitsubishi Bread Oven TO-ST1-T", ja: "三菱 ブレッドオーブン TO-ST1-T" },
    description: {
      en: "34,000 yen single-slice extreme-focus pick. Closed-cavity design for one 1.4 cm-thick shokupan slice with interior crumb moisture preserved at near-fresh-from-the-bakery level, 4-minute single-slice cycle, full Mitsubishi nationwide after-sales support. Makes one slice at a time and the cycle is 4 minutes — wrong for families of four (16+ minutes serial); closed-cavity format does not accommodate baguette, hard-crust loaves, frozen pizza, kashi-pan, or anything other than shokupan; 34,000 yen is high for a single-purpose single-bread-type machine and only works for solo households or staggered-breakfast couples.",
      ja: "34,000円の1枚特化枠。厚さ1.4cmの食パン1枚を内部クラム水分が焼きたてベーカリー レベルに近い状態で保つ閉鎖キャビティ設計、4分の1枚サイクル、三菱の全国アフター サポート。1度に1枚作りサイクルが4分 — 4人家族に間違い(16分以上の直列時間)、閉鎖キャビティ フォーマットがバゲット・ハード クラスト パン・冷凍ピザ・菓子パン・食パン以外の何も収容しない、34,000円は単一目的単一パン タイプ マシンには高く単身世帯またはずらした朝食カップルでのみ機能する。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-mitsubishi-bread-oven-to-st1", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E4%B8%89%E8%8F%B1%2B%E3%83%96%E3%83%AC%E3%83%83%E3%83%89%E3%82%AA%E3%83%BC%E3%83%96%E3%83%B3%2BTO-ST1%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "panasonic-bistro-nt-d700",
    category: "home",
    badge: "🍕",
    name: { en: "Panasonic Bistro NT-D700", ja: "パナソニック ビストロ NT-D700" },
    description: {
      en: "42,000 yen convection-multi-function pick. Convection fan plus dual heating elements covering 100-260 degrees Celsius, 30 cm internal cavity that accommodates a 25 cm frozen pizza or a small whole chicken thigh, programmable presets for toast and pizza and gratin and frozen-food reheat, the strongest after-sales support in this comparison through Panasonic's nationwide service network. 39.8 cm wide and 32.5 cm deep footprint is genuinely large for a Japanese apartment kitchen counter; convection fan adds 50-55 dB whir during operation; multi-function role means cavity catches cooking oil from chicken and gratin sessions and fan-blade grease accumulation is a real maintenance burden.",
      ja: "42,000円のコンベクション マルチ機能枠。コンベクション ファン+100-260度Cをカバーするデュアル加熱素子、25cm冷凍ピザまたは小型ロースト チキン もも肉を収容する30cm内部キャビティ、トーストとピザとグラタンと冷凍食品リヒート用のプログラマブル プリセット、パナソニック全国サービス網による本比較最強アフター サポート。幅39.8cm × 奥行32.5cmの設置面積が日本アパート キッチン カウンターに本気で大きい、コンベクション ファンが稼働中50-55dBの唸り音を追加、マルチ機能の役割はキャビティがチキンとグラタン セッションから調理油をキャッチしファン ブレード油汚れ蓄積が本物のメンテ負担。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-panasonic-bistro-nt-d700", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FPanasonic%2B%E3%83%93%E3%82%B9%E3%83%88%E3%83%AD%2BNT-D700%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "zojirushi-kongari-et-wma22",
    category: "home",
    badge: "💴",
    name: { en: "Zojirushi Kongari Club ET-WMA22", ja: "象印 こんがり倶楽部 ET-WMA22" },
    description: {
      en: "9,900 yen practical commodity pick. 1300 W heater with five preset modes (toast, frozen toast, kashi-pan, croissant reheat, manual temperature), 22 cm internal width that accommodates two slices side-by-side, 7-10 year realistic lifespan and 8-10 year parts availability post-discontinuation through Zojirushi nationwide after-sales, 32 cm wide compact footprint. No steam injection — plain toast comes out noticeably drier than steam-injected machines and habitual shokupan eaters notice the difference within a week; preset modes are basic and the temperature dial does not extend above 250 degrees Celsius limiting frozen-pizza and high-temperature gratin use; design is functional Japanese-appliance and does not earn its counter spot on aesthetics.",
      ja: "9,900円の実用コモディティ枠。5プリセット モード付き1300Wヒーター(トースト・冷凍トースト・菓子パン・クロワッサン リヒート・手動温度)、2枚を並べて収容する22cm内部幅、象印全国アフター サービスによる7-10年現実的寿命と廃止後8-10年部品可用性、幅32cmコンパクト設置面積。スチーム注入なし — プレーン トーストはスチーム注入マシンより目に見えて乾いた状態で出てきて習慣的な食パン愛好者は1週間以内に違いに気付く、プリセット モードが基本的で温度ダイヤルが250度Cを超えず冷凍ピザと高温グラタン使用を制限、デザインが機能的日本家電で美学でカウンター スポットを獲得しない。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-zojirushi-kongari-et-wma22", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E8%B1%A1%E5%8D%B0%2B%E3%81%93%E3%82%93%E3%81%8C%E3%82%8A%E5%80%B6%E6%A5%BD%E9%83%A8%2BET-WMA22%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Home / Cordless Stick Vacuums (best-cordless-vacuum-2026) ─────────
  {
    id: "dyson-v15-detect-absolute",
    category: "home",
    badge: "🔦",
    name: { en: "Dyson V15 Detect Absolute", ja: "ダイソン V15 Detect Absolute" },
    description: {
      en: "98,780 yen premium-power cordless stick pick. 240 air-watt Hyperdymium digital motor (highest sustained suction in this comparison), green diode laser dust illumination on hardwood, piezo acoustic particle counter for auto-suction adjustment, 0.77 L bin (largest non-auto-empty option), HEPA-grade sealed filtration. 3.0 kg main-body weight fatigues smaller users on extended overhead or stair work; 82-84 dB max-mode noise wakes sleeping family through Japanese apartment walls; ongoing 4,000-5,500 yen filter and 12,000-15,000 yen battery replacement costs.",
      ja: "98,780円のプレミアム パワー コードレス スティック枠。240エアワット Hyperdymium デジタルモーター(本比較最高の持続吸引力)、フローリング上の緑ダイオード レーザー ダスト照射、自動吸引調整用ピエゾ音響パーティクル カウンター、0.77L容器(非自動排出オプションで最大)、HEPA級シール封濾過。3.0kgメインボディ重量が拡張頭上または階段ワークで小柄なユーザーを疲労させる、日本のアパート壁越しに寝ている家族を起こす82-84dB最大モード騒音、4,000-5,500円のフィルターと12,000-15,000円のバッテリ交換の継続コスト。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-dyson-v15-detect-absolute", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FDyson%2BV15%2BDetect%2BAbsolute%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "eufy-mach-v1",
    category: "home",
    badge: "💧",
    name: { en: "Anker Eufy MACH V1", ja: "Anker Eufy MACH V1" },
    description: {
      en: "45,800 yen hybrid cordless stick value pick. Interchangeable dry-vacuum and wet-mop heads, roughly 16,000 Pa-equivalent dry suction, self-cleaning station for the roller-mop, replaces both stick vacuum and Floor Wiper for 80%+ hardwood-or-tile homes. 35-minute standard-mode runtime is short for 100+ m² homes and forces recharge breaks mid-session; wet-mop function does not replace a real mop session for sticky kitchen splatter or dried coffee; hybrid maintenance burden adds weekly cleaning-station deep-clean to prevent biofilm and sour-water odor.",
      ja: "45,800円のハイブリッド コードレス スティック コスパ枠。交換可能ドライ吸引とウェットモップ ヘッド、約16,000Pa相当のドライ吸引、ローラーモップ用自動清掃ステーション、80%以上フローリング・タイル住宅でステック掃除機とフロアワイパー両方を置き換え。35分標準モード稼働時間が100m²以上の家で短くセッション中盤のリチャージ ブレイクを強制、ウェットモップ機能は粘っこいキッチン油汚れや乾いたコーヒーには本物のモップセッションを置き換えない、ハイブリッド メンテ負担が週次清掃ステーション深部清掃をバイオフィルムと酸性水臭の防止のために追加。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-eufy-mach-v1", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FEufy%2BMACH%2BV1%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "shark-cs501j",
    category: "home",
    badge: "🦈",
    name: { en: "Shark EVOPOWER SYSTEM iQ+ CS501J", ja: "シャーク EVOPOWER SYSTEM iQ+ CS501J" },
    description: {
      en: "69,800 yen auto-empty cordless stick pick. Self-emptying station pulls debris from stick bin into 0.6 L sealed bag every redock, self-cleaning brush roll uses built-in comb to free wrapped hair, self-standing main body stays upright when set down, 40-minute eco-mode runtime. Dock footprint of 25-30 cm wide and 40-50 cm deep dominates Japanese apartment hallways; recurring bag-consumable cost of 6,000-12,000 yen per year on top of filter and battery replacement; dock cycle noise of 80-85 dB for 6-10 seconds at every redock wakes a baby and disturbs late-evening cleaning sessions.",
      ja: "69,800円の自動排出コードレス スティック枠。自動排出ステーションが再ドックの度にスティック容器から0.6L 密封バッグへゴミを引き込む、自動清掃ブラシロールが内蔵コームで巻き付いた髪を解放、自立メインボディが置いた時にも倒れない、ECOモード40分の稼働時間。幅25-30cm × 奥行40-50cmのドック フットプリントが日本のアパート廊下を支配、年6,000-12,000円のバッグ消耗品恒常コストがフィルターとバッテリ交換の上に、再ドックの度に80-85dB×6-10秒のドックサイクル騒音が赤ちゃんを起こし深夜清掃セッションを邪魔する。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-shark-cs501j", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FShark%2BCS501J%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "tineco-pure-one-s15-pet",
    category: "home",
    badge: "🐾",
    name: { en: "Tineco Pure One S15 Pet", ja: "Tineco Pure One S15 Pet" },
    description: {
      en: "69,800 yen pet-household cordless stick pick. iLoop dust sensor for AI-driven auto-suction adjustment, anti-tangle brush geometry with tapered roll and side-positioned hair-cut grooves, LED display showing battery and dust density, 0.6 L bin, 40-minute eco-mode runtime. Hybrid plumbing requires deep-cleaning the cleaning station every 2-4 weeks to prevent biofilm and sour-water odor even if you only use dry-vacuum function; Tineco's Japan after-sales network has 3-5 week warranty parts turnaround versus 1-2 weeks for Dyson Japan; some advanced settings require the Tineco app rather than on-unit controls.",
      ja: "69,800円のペット世帯コードレス スティック枠。iLoopダスト センサーによるAI駆動自動吸引調整、テーパー ロールとサイド配置毛切りグルーブ付き絡まり防止ブラシ ジオメトリ、バッテリとダスト密度を表示するLEDディスプレイ、0.6L容器、ECOモード40分の稼働時間。ハイブリッド配管が本体に統合されているためドライ吸引機能のみ使用しても2-4週毎の清掃ステーション深部清掃が必要(バイオフィルムと酸性水臭防止)、Tinecoの日本アフターサービス網は保証部品で3-5週間ターンアラウンド(ダイソン日本の1-2週間に対し)、一部の高度設定が本体コントロールではなくTinecoアプリ必須。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-tineco-pure-one-s15-pet", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FTineco%2BPure%2BOne%2BS15%2BPet%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "hitachi-pv-bl3k",
    category: "home",
    badge: "🪶",
    name: { en: "Hitachi PV-BL3K", ja: "日立 PV-BL3K" },
    description: {
      en: "45,800 yen lightweight Japanese-brand cordless stick pick. 1.5 kg main body (lightest in this comparison and roughly half Dyson V15's 3.0 kg), powerbrush smart head with auto surface-type adjustment, 0.2 L bin, 30-minute standard-mode runtime, full Hitachi nationwide after-sales network with parts availability outlasting imported brands by 2-3 years. 30-minute standard-mode runtime drops to roughly 8-10 minutes on boost mode needed for rugs deeper than 5 mm pile; 0.2 L bin is smallest in this comparison and requires emptying every 2-3 cleaning sessions; spec-sheet suction does not reach Dyson V15's debris-pickup level on thick rugs or pet-hair-laden surfaces.",
      ja: "45,800円の軽量国内ブランド コードレス スティック枠。1.5kgメインボディ(本比較最軽量でダイソン V15の3.0kgの約半分)、自動表面タイプ調整付きパワーブラシ スマート ヘッド、0.2L容器、標準モード30分の稼働時間、輸入ブランドを2-3年上回る部品可用性を持つ日立全国アフターサービス網。30分標準モード稼働時間が5mm毛足以上のラグに必要なブースト モードで約8-10分まで落ちる、0.2L容器が本比較で最小で2-3クリーニング セッション毎の空けが必要、スペックシート吸引力が厚手ラグやペット毛だらけの面でダイソン V15のゴミ ピックアップ レベルに到達しない。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-hitachi-pv-bl3k", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E6%97%A5%E7%AB%8B%2BPV-BL3K%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Beauty / Yoga Mats (best-yoga-mat-2026) ─────────
  {
    id: "manduka-pro-6mm",
    category: "beauty",
    badge: "🧘",
    name: { en: "Manduka PRO Mat 6mm", ja: "Manduka PRO Mat 6mm" },
    description: {
      en: "17,600 yen industry-standard pick. 6 mm cushion thickness, dense closed-cell PVC, dot-pattern bottom for studio-floor grip, 71 × 180 cm long mat option, lifetime manufacturer warranty against splitting and peeling. 3.4 kg weight is heavy for daily commute to a studio; closed-cell surface needs a 2-3 week break-in period before grip reaches advertised level (sweat-on, salt-and-water-rinse cycle); not the best pick for hot yoga where surface grip matters more than cushion.",
      ja: "17,600円の業界標準枠。クッション厚6mm、密度の高いクローズドセルPVC、スタジオ床のグリップ用ドットパターン底面、71×180cmロングサイズ展開、剥離・割れに対するメーカー終身保証。3.4kgはスタジオ通いには重い、クローズドセル表面は公称グリップに到達するまで2-3週間のブレイクイン(汗をかく+塩水拭きサイクル)が必要、表面グリップがクッションより重要なホットヨガには第一候補ではない。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-manduka-pro-6mm", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FManduka%2BPRO%2BMat%2B6mm%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "lululemon-take-form-5mm",
    category: "beauty",
    badge: "🌿",
    name: { en: "lululemon Take Form Mat 5mm", ja: "lululemon Take Form Mat 5mm" },
    description: {
      en: "13,200 yen new-generation grip pick. 5 mm thickness with a polyurethane top layer over natural rubber base, the wettest grip in this comparison straight out of the wrap, no break-in period, 66 × 180 cm. PU top scratches and shows visible wear at 8-12 months on daily mat-burn pose practice (chaturanga, plank holds); 5 mm cushion is on the firmer side and feels thin for tabletop or kneeling-heavy hatha sequences; natural-rubber base means latex-allergy users should not buy.",
      ja: "13,200円の新世代グリップ枠。厚み5mm、天然ゴムベースに ポリウレタン トップ層、本比較で開封即一番濡れた状態でも効くグリップ、ブレイクイン期間不要、66×180cm。PUトップは毎日のマットバーン姿勢(チャトランガ、プランクホールド)で8-12ヶ月で擦り傷と目視可能な摩耗、5mmクッションは硬めでテーブルトップや膝重視のハタヨガには薄く感じる、天然ゴムベースなのでラテックスアレルギーの人は購入不可。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-lululemon-take-form-5mm", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2Flululemon%2BTake%2BForm%2BMat%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "liforme-original-4-2mm",
    category: "beauty",
    badge: "📐",
    name: { en: "Liforme Original Yoga Mat 4.2mm", ja: "Liforme Original Yoga Mat 4.2mm" },
    description: {
      en: "22,800 yen UK-brand alignment pick. 4.2 mm thickness, eco-polyurethane top over natural-rubber base, the AlignForMe etched alignment-line system on the surface (centerline, hip-line, foot-placement marks), 73 × 185 cm extra-long-and-wide. Highest price in this comparison and overkill for a beginner who has not yet decided whether yoga is a long-term practice; cleaning instructions are strict (water only or Liforme's own spray, no alcohol or vinegar) and ignoring them voids the warranty; alignment lines are useful for early practitioners but become visual noise once asana memory is internalized.",
      ja: "22,800円の英国ブランド アライメント枠。厚み4.2mm、天然ゴムベースにエコポリウレタン トップ、表面に AlignForMe エッチング アライメントラインシステム(中央線・腰幅線・足配置マーク)、73×185cmロング&ワイドサイズ。本比較最高価格、ヨガを長期練習にするか未決の初心者にはオーバーキル、クリーニング指定が厳しく(水のみまたはLiforme純正スプレーのみ、アルコール・酢不可)違反すると保証無効、アライメントラインは練習初期は有用だがアサナが体に入った後は視覚ノイズになる。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-liforme-original-4-2mm", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FLiforme%2BOriginal%2BYoga%2BMat%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "sukala-yoga-mat-pu",
    category: "beauty",
    badge: "🇯🇵",
    name: { en: "SUKALA Yoga Mat (PU type)", ja: "SUKALA ヨガマット PUタイプ" },
    description: {
      en: "9,900 yen Japanese women's-studio-brand balance pick. 6 mm thickness, polyurethane top over PER (polymer environmental resin) base — phthalate-free and latex-free, designed by the LAVA-affiliated SUKALA studio team for hot yoga and 65 × 185 cm. Carry strap is sold separately at 1,650 yen, which is annoying for a 9,900 yen mat that obviously needs one; PU surface absorbs sweat and requires same-day wipe-down or it develops a sweat odor within 2-3 weeks; PER base is firmer than natural rubber and transmits hardwood floor through more on knees-down poses.",
      ja: "9,900円の日本女性向けスタジオブランド バランス枠。厚み6mm、PER(ポリマー環境樹脂)ベースに ポリウレタン トップ — フタル酸エステル類フリー&ラテックスフリー、LAVA系列のSUKALAスタジオチームがホットヨガ向けに設計、65×185cm。持ち手用ストラップは別売(1,650円)、9,900円のマットでストラップ別売は不満点、PU表面は汗を吸収し当日中に拭かないと2-3週間で汗臭が発生、PERベースは天然ゴムより硬く膝立ち系ポーズでフローリングの硬さが伝わりやすい。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-sukala-yoga-mat-pu", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FSUKALA%2B%E3%83%A8%E3%82%AC%E3%83%9E%E3%83%83%E3%83%88%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "funcy-yoga-mat-8mm",
    category: "beauty",
    badge: "💴",
    name: { en: "FUNCY Yoga Mat 8mm Thick", ja: "FUNCY ヨガマット 8mm 厚手" },
    description: {
      en: "3,180 yen budget beginner pick. 8 mm thick NBR (nitrile butadiene rubber) cushion (the thickest in this comparison and the most knee-forgiving), 61 × 183 cm, ships with a carry strap and a mesh storage bag, available in 8+ colorways suited to Pinterest-style home-studio aesthetics. NBR has a strong manufacturing odor that takes 2-4 weeks of airing-out to fade; 8 mm thickness sinks too far on standing balance poses (tree, warrior III) and feels unstable for ashtanga or vinyasa flow; surface durability is the lowest in this comparison with visible peeling at 8-14 months on daily use.",
      ja: "3,180円の予算初心者枠。8mm厚NBR(ニトリルブタジエンゴム)クッション(本比較最厚で最も膝に優しい)、61×183cm、持ち手用ストラップとメッシュ収納バッグ付属、Pinterest映えする自宅スタジオ系の8色以上展開。NBRは製造時のウレタン臭が強く消えるまで2-4週間の換気が必要、8mm厚は立位バランス系ポーズ(木のポーズ、ウォリアー III)で沈み込みが大きくアシュタンガやヴィンヤサフローでは不安定、表面耐久性は本比較で最低で毎日使用なら8-14ヶ月で目視剥離。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-funcy-yoga-mat-8mm", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FFUNCY%2B%E3%83%A8%E3%82%AC%E3%83%9E%E3%83%83%E3%83%88%2B8mm%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Home / Office Chairs 2026 (best-office-chair-2026) ─────────
  {
    id: "herman-miller-aeron",
    category: "home",
    badge: "🏆",
    name: { en: "Herman Miller Aeron", ja: "ハーマンミラー アーロン" },
    description: {
      en: "~200,000 yen world-standard ergonomic flagship. 8ZonedSupport Pellicle mesh, PostureFit SL dual sacral-lumbar support, 4D armrests, 12-year warranty. Three sizes (A/B/C) — must select correct size. Explicit weakness: price requires genuine long-term WFH commitment; wrong size negates all ergonomic benefit; aesthetic divides opinion in home environments; 12-year warranty non-transferable in Japan.",
      ja: "約¥200,000の世界標準エルゴノミクス フラッグシップ。8ゾーンサポート ペリクルメッシュ、PostureFit SL2点仙骨腰椎サポート、4Dアームレスト、12年保証。A/B/Cの3サイズ展開 — 正しいサイズ選択必須。弱点：価格は長期テレワーク継続なしには正当化困難；誤サイズだとエルゴノミクス機能を発揮しない；自宅環境では賛否分かれる外観；日本では12年保証は転売不可。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-herman-miller-aeron", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%83%8F%E3%83%BC%E3%83%9E%E3%83%B3%E3%83%9F%E3%83%A9%E3%83%BC%2B%E3%82%A2%E3%83%BC%E3%83%AD%E3%83%B3%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "steelcase-leap-v2",
    category: "home",
    badge: "🔄",
    name: { en: "Steelcase Leap V2", ja: "スティールケース リープV2" },
    description: {
      en: "~150,000 yen LiveBack flexible spine mechanism flagship. Back changes shape as you move, natural glide seat pan, upper/lower back adjustment, 12-year warranty. Best for users who shift posture constantly. Explicit weakness: LiveBack advantage unused by static sitters; Japan availability primarily corporate/premium retail; mechanism complexity confuses some users.",
      ja: "約¥150,000のライブバック可動脊椎機構フラッグシップ。動きに合わせて背もたれが変形、ナチュラルグライド座面、上下背もたれ調整、12年保証。姿勢を常に変える方に最適。弱点：硬直着座ではライブバックの優位性を活かせない；日本では主に法人・プレミアム小売での入手；機構が複雑でわかりにくいという声もある。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-steelcase-leap-v2", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%82%B9%E3%83%86%E3%82%A3%E3%83%BC%E3%83%AB%E3%82%B1%E3%83%BC%E3%82%B9%2B%E3%83%AA%E3%83%BC%E3%83%97V2%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "okamura-contessa-seconda",
    category: "home",
    badge: "🇯🇵",
    name: { en: "Okamura Contessa Seconda", ja: "オカムラ コンテッサ セコンダ" },
    description: {
      en: "~100,000 yen peak of Japanese domestic mesh chair engineering. Designed for Japanese body proportions, national Okamura service network, standard and large sizes. Explicit weakness: price-tier faces Herman Miller/Steelcase competition; primary sales channel is corporate procurement; back mechanism less dynamically responsive than Leap V2's LiveBack.",
      ja: "約¥100,000の国産メッシュ最高峰。日本人体型に最適化設計、全国オカムラサービスネットワーク、標準・大サイズ展開。弱点：同価格帯にハーマンミラー・スティールケースが競合；主要販売チャネルが法人調達；背もたれ機構はリープV2のライブバックより動的対応性が低い。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-okamura-contessa-seconda", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%82%AA%E3%82%AB%E3%83%A0%E3%83%A9%2B%E3%82%B3%E3%83%B3%E3%83%86%E3%83%83%E3%82%B5%2B%E3%82%BB%E3%82%B3%E3%83%B3%E3%83%80%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "flexispot-ej2-ergonomic",
    category: "home",
    badge: "💴",
    name: { en: "Flexispot OC3 Ergonomic Chair", ja: "フレキシスポット OC3 エルゴノミクスチェア" },
    description: {
      en: "~30,000 yen budget ergonomic pick with adjustable lumbar support, reclining, height adjustment. Available via Amazon Japan Prime. Explicit weakness: foam seat compression expected within 12-24 months of heavy use; lumbar pad (not structural mechanism); build quality not in same class as premium picks; 3-year warranty with email-only support.",
      ja: "約¥30,000の予算エルゴノミクス枠。調整可能ランバーサポート・リクライニング・高さ調整搭載。Amazon Japan Primeで入手可能。弱点：重使用12〜24か月でウレタン座面のへたりが予想される；ランバーはパッド式で構造的機構ではない；ビルド品質はプレミアム製品と同クラスにない；3年保証でサポートはメール対応のみ。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-flexispot-oc3", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FFlexispot%2BOC3%2B%E3%82%A8%E3%83%AB%E3%82%B4%E3%83%8E%E3%83%9F%E3%82%AF%E3%82%B9%E3%83%81%E3%82%A7%E3%82%A2%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "ikea-markus",
    category: "home",
    badge: "🪑",
    name: { en: "IKEA Markus", ja: "IKEA マルクス" },
    description: {
      en: "~25,000 yen IKEA entry-level with fixed built-in lumbar support, height adjustment, 10-year IKEA guarantee. Available at IKEA Japan stores. Explicit weakness: fixed lumbar either fits your spine or it does not — no adjustment path; foam compression in long-term heavy use; no armrest width/pivot adjustment; not appropriate for 7+ hour daily use or existing back problems.",
      ja: "約¥25,000のIKEA入門モデル。固定内蔵ランバーサポート・高さ調整・IKEA品質保証10年。IKEA Japan店舗で入手可能。弱点：固定ランバーは体型に合うか合わないかで調整の余地なし；長期重使用でのウレタンへたり；アームレストの幅・ピボット調整なし；1日7時間以上の着座や既存腰背部問題がある方には不適。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-ikea-markus", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FIKEA%2B%E3%83%9E%E3%83%AB%E3%82%AF%E3%82%B9%2B%E3%82%AA%E3%83%95%E3%82%A3%E3%82%B9%E3%83%81%E3%82%A7%E3%82%A2%2F", markets: ["JP"], approved: true },
    ],
  },
  // ───────── Home / Air Quality Monitors (best-air-quality-monitor-2026) ─────────
  {
    id: "awair-element",
    category: "home",
    badge: "🌬️",
    name: { en: "Awair Element", ja: "Awair Element 空気質モニター" },
    description: {
      en: "~30,000 yen 5-sensor air quality monitor (CO2 NDIR, VOC Sensirion SGP40, laser PM2.5, temperature, humidity). Awair Score composite dashboard, HomeKit/Alexa/Google Home, API access. Weakness: Awair Score hides which sensor is degraded; VOC is relative index not absolute TVOC; HomeKit is cloud-dependent and breaks on router reboots.",
      ja: "約3万円の5センサー空気質モニター（CO2 NDIR・VOC Sensirion SGP40・レーザーPM2.5・温度・湿度）。Awairスコアコンポジットダッシュボード、HomeKit/Alexa/Google Home、API連携。弱点：Awairスコアはどのセンサーが悪化しているか隠す。VOCは相対インデックスで絶対TVOC濃度ではない。HomeKitはクラウド依存でルーター再起動後に切断。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-awair-element", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FAwair%2BElement%2B%E7%A9%BA%E6%B0%97%E8%B3%AA%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "iqair-airvisual-node",
    category: "home",
    badge: "🔬",
    name: { en: "IQAir AirVisual Node", ja: "IQAir AirVisual Node" },
    description: {
      en: "~45,000 yen professional-grade air quality monitor. Laser PM2.5, NDIR CO2, temperature, humidity, outdoor AQI station data overlay. Highest PM2.5 accuracy in this comparison. Weakness: no smart home integration (no HomeKit/Alexa/Google Home), most expensive in comparison, dated interface.",
      ja: "約4万5,000円のプロフェッショナルグレード空気質モニター。レーザーPM2.5・NDIR CO2・温湿度・屋外AQI観測局データ重ね表示。この比較で最高のPM2.5精度。弱点：スマートホーム連携なし（HomeKit/Alexa/Google Homeなし）。比較最高価格。インターフェース設計が古い。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-iqair-airvisual-node", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FIQAir%2BAirVisual%2BNode%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "inkbird-iam-t1",
    category: "home",
    badge: "💴",
    name: { en: "Inkbird IAM-T1", ja: "Inkbird IAM-T1 CO2モニター" },
    description: {
      en: "~5,000 yen NDIR CO2 + temperature + humidity monitor. Large readable display, button battery 6-12 months, Amazon Japan bestseller. Weakness: button battery gaps overnight; temperature reads 2-4°C high near heat sources; no PM2.5 or VOC sensor; no smart home integration.",
      ja: "約5,000円のNDIR CO2＋温度＋湿度モニター。大型読みやすいディスプレイ、ボタン電池6〜12ヶ月、Amazon Japan人気製品。弱点：ボタン電池切れで夜間ギャップが生じる可能性。熱源近くで温度が2〜4°C高くなる。PM2.5センサーなし・VOCセンサーなし。スマートホーム連携なし。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-inkbird-iam-t1", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FInkbird%2BIAM-T1%2B%E4%BA%8C%E9%85%B8%E5%8C%96%E7%82%AD%E7%B4%A0%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "govee-air-quality-monitor",
    category: "home",
    badge: "📊",
    name: { en: "Govee Air Quality Monitor H5106", ja: "Govee 空気質モニター H5106" },
    description: {
      en: "~4,000 yen CO2 + PM2.5 + temperature + humidity. Best sensor-count-per-yen in this comparison. Govee app integration. Weakness: no HomeKit/Google Home/Alexa; PM2.5 accuracy more variable than Awair or Kaiterra per user reports; sensor datasheets not published; small display.",
      ja: "約4,000円のCO2＋PM2.5＋温度＋湿度。この比較でセンサー数/円の最高コスパ。Goveeアプリ連携。弱点：HomeKit/Google Home/Alexaなし。ユーザー報告でPM2.5精度がAwairやKaiterraより変動大きい。センサーデータシート非公開。小型ディスプレイ。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-govee-h5106", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FGovee%2B%E7%A9%BA%E6%B0%97%E8%B3%AA%E3%83%A2%E3%83%8B%E3%82%BF%E3%83%BC%2BH5106%2F", markets: ["JP"], approved: true },
    ],
  },
  {
    id: "kaiterra-laser-egg-co2",
    category: "home",
    badge: "🥚",
    name: { en: "Kaiterra Laser Egg+ CO2", ja: "Kaiterra Laser Egg+ CO2" },
    description: {
      en: "~15,000 yen laser PM2.5 + NDIR CO2 + temperature + humidity. Best standalone display readability in this comparison. Japanese language support. Works without app. Weakness: HomeKit is cloud-dependent (Kaiterra bridge server, periodic outages); no VOC sensor; PM2.5 calibration algorithm not documented.",
      ja: "約1万5,000円のレーザーPM2.5＋NDIR CO2＋温度＋湿度。この比較で最も読みやすいスタンドアロン表示。日本語対応。アプリなしで動作。弱点：HomeKitはクラウド依存（Kaiterraブリッジサーバー、定期的な停止あり）。VOCセンサーなし。PM2.5校正アルゴリズム非公開。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-kaiterra-laser-egg-co2", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FKaiterra%2BLaser%2BEgg%2BCO2%2F", markets: ["JP"], approved: true },
    ],
  },
];

/**
 * RAW_CATALOG に catalog-overrides.json を mergeした最終 CATALOG。
 *
 * Override 仕様:
 *   - offerId をキーに { links: AspLink[] } を渡すと、その offer の既存 links に追記される
 *     (同じ network+productId があれば override 側で上書き)
 *   - approved: true がある link はUI上で実際にクリックできるようになる
 *
 * これにより、catalog.ts はTSで型・default構造を持ち続けつつ、
 * CLI が overrides.json だけを書き換えれば proper deploy 可能。
 */
export const CATALOG: AffiliateOffer[] = RAW_CATALOG.map((offer) => {
  const override = OVERRIDES[offer.id];
  if (!override?.links?.length) return offer;
  const overrideKeys = new Set(override.links.map((l) => `${l.network}:${l.productId}`));
  const merged: AspLink[] = [
    ...override.links,
    ...offer.links.filter((l) => !overrideKeys.has(`${l.network}:${l.productId}`)),
  ];
  return { ...offer, links: merged };
});

/**
 * カテゴリ + ロケール + マーケット に合致する offer を抽出。
 * 各 offer の links から該当 market のものだけ選別する。
 */
export function getOffersFor(
  category: string,
  locale: string,
  opts: { onlyApproved?: boolean } = {},
): AffiliateOffer[] {
  const market = inferMarketFromLocale(locale);
  const onlyApproved = opts.onlyApproved ?? true;

  return CATALOG.filter((o) => {
    if (o.category !== category) return false;
    // pickLink が null を返す = この market では使えない → 一覧から除外
    return pickLink(o, market, { onlyApproved }) !== null;
  }).slice(0, POLICY.maxPerSlot);
}

/**
 * Offer から、指定marketで使える最良のASPリンクを1つ選ぶ。
 * 優先順: 完全market一致 > "global"フォールバック。
 *
 * 重要: 異なる market のリンク (例: 米国ユーザーに楽天JPリンク)
 * は返さない。間違ったリージョンの店舗に飛ばすと UX 悪化 + 報酬発生せず。
 * その場合は呼び出し側で「あなたの地域では未対応」表示する。
 */
export function pickLink(
  offer: AffiliateOffer,
  market: Market,
  opts: { onlyApproved?: boolean } = {},
) {
  const approved = opts.onlyApproved ?? true;
  const candidates = offer.links.filter((l) => (approved ? l.approved : true));
  return (
    candidates.find((l) => l.markets.includes(market)) ??
    candidates.find((l) => l.markets.includes("global")) ??
    null
  );
}
