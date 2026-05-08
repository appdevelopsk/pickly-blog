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
  // ───────── Home / Air Purifiers (best-air-purifier-2026) ─────────
  {
    id: "daikin-mck70z",
    category: "home",
    badge: "🌪️",
    name: { en: "Daikin MCK70Z Streamer Humidifying Air Purifier", ja: "ダイキン MCK70Z 加湿ストリーマ空気清浄機" },
    description: {
      en: "60,000 yen flagship. Streamer discharge + 10-year TAFU filter, 31-jo coverage. Fastest pollen recovery in our test.",
      ja: "60,000円のフラッグシップ。ストリーマ放電+10年TAFUフィルター、適用31畳。本テストで花粉復帰最速。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-daikin-mck70z", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%83%80%E3%82%A4%E3%82%AD%E3%83%B3%2BMCK70Z%2F", markets: ["JP"], approved: false },
    ],
  },
  {
    id: "sharp-ki-ns70",
    category: "home",
    badge: "💨",
    name: { en: "Sharp KI-NS70 Plasmacluster Humidifying Air Purifier", ja: "シャープ KI-NS70 プラズマクラスター加湿空気清浄機" },
    description: {
      en: "50,000 yen all-rounder. Plasmacluster 25000 ions, 31-jo coverage, mature COCORO AIR app. Fastest odor removal in our test.",
      ja: "50,000円のオールラウンダー。プラズマクラスター25000、適用31畳、成熟したCOCORO AIRアプリ。本テストで臭い除去最速。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-sharp-ki-ns70", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%82%B7%E3%83%A3%E3%83%BC%E3%83%97%2BKI-NS70%2F", markets: ["JP"], approved: false },
    ],
  },
  {
    id: "panasonic-fvc70xv",
    category: "home",
    badge: "🌿",
    name: { en: "Panasonic F-VC70XV nanoe X Humidifying Air Purifier", ja: "パナソニック F-VC70XV ナノイーX 加湿空気清浄機" },
    description: {
      en: "45,000 yen quiet pick. nanoe X generator, 31-jo coverage, 19 dB on lowest auto. Best for bedroom use.",
      ja: "45,000円の静音派向け。ナノイーX搭載、適用31畳、最弱オート19dB。寝室用途で最適。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-panasonic-fvc70xv", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%83%91%E3%83%8A%E3%82%BD%E3%83%8B%E3%83%83%E3%82%AF%2BF-VC70XV%2F", markets: ["JP"], approved: false },
    ],
  },
  {
    id: "balmuda-pure-a01d",
    category: "home",
    badge: "🤍",
    name: { en: "Balmuda The Pure A01D", ja: "バルミューダ The Pure A01D" },
    description: {
      en: "50,000 yen design choice. Cylindrical column, matte white finish. Looks great in a Tokyo 1K — slowest cooking-spike recovery in our test.",
      ja: "50,000円のデザイン家電。円筒シルエット、マット白仕上げ。都内1Kに映える見た目、調理時の復帰時間は本テスト最遅。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-balmuda-pure-a01d", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%83%90%E3%83%AB%E3%83%9F%E3%83%A5%E3%83%BC%E3%83%80%2BThe%2BPure%2BA01D%2F", markets: ["JP"], approved: false },
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
    id: "iris-ohyama-iap-a85",
    category: "home",
    badge: "💴",
    name: { en: "Iris Ohyama IAP-A85-W", ja: "アイリスオーヤマ IAP-A85-W" },
    description: {
      en: "15,000 yen budget pick. HEPA + activated carbon, 17-jo coverage, no app. Quarter the price of Daikin and works for 6-10 jo bedrooms.",
      ja: "15,000円のコスパ機。HEPA+活性炭、適用17畳、アプリなし。ダイキンの1/4価格で6-10畳寝室なら十分。",
    },
    links: [
      { network: "moshimo", productId: "rakuten-iris-iap-a85", rawUrl: "https://af.moshimo.com/af/c/click?a_id=5538597&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2F%E3%82%A2%E3%82%A4%E3%83%AA%E3%82%B9%E3%82%AA%E3%83%BC%E3%83%A4%E3%83%9E%2BIAP-A85-W%2F", markets: ["JP"], approved: false },
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
