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
