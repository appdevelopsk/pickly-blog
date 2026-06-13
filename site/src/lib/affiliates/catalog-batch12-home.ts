// @ts-nocheck — large data file; union type inference disabled intentionally
import type { AffiliateOffer } from "./types";

// 50 home décor catalog entries added 2026-06-13 (batch 12).
// Covers: runner rugs, decorative pillows, table lamps, TV stands,
// console tables, entryway benches, accent chairs, nightstands,
// coffee tables, and bath towels.
export const CATALOG_BATCH12_HOME: AffiliateOffer[] = [
  // ── ARTICLE 1: best-runner-rug-2026 ──────────────────────────────────────
  {
    id: "ruggable-classic-solid-runner",
    category: "home",
    badge: "🏠",
    name: {
      en: "Ruggable Classic Solid Runner",
      ja: "ラガブル クラシック ソリッド ランナー",
    },
    description: {
      en: "Machine-washable two-piece runner system in 2x7 and 2.5x7 sizes. Non-slip rug pad included. Low pile, stain-resistant cover.",
      ja: "洗濯機で洗える2ピースランナーシステム。2x7・2.5x7サイズ対応。滑り止めパッド付き。ローパイル・防汚カバー。",
    },
    imageUrl: "https://m.media-amazon.com/images/I/71Oy6YwjlgL._AC_SL1499_.jpg",
    priceMin: "99",
    priceMax: "149",
    links: [
      {
        network: "direct",
        productId: "https://ruggable.com/collections/runners",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "cb2-moro-runner",
    category: "home",
    badge: "🏠",
    name: {
      en: "CB2 Moro Hand-Woven Wool Runner",
      ja: "CB2 モロ ハンドウィーブ ウール ランナー",
    },
    description: {
      en: "Hand-woven wool flatweave runner with diamond-grid pattern. Available in 2.5x8 and 2.5x10 ft. Sits flat immediately; requires separate rug pad.",
      ja: "ダイヤモンドグリッド柄のハンドウィーブ ウールフラットウィーブランナー。2.5x8・2.5x10フィート対応。別売りラグパッド必要。",
    },
    imageUrl: "https://cb2.scene7.com/is/image/CB2/LeeraBlkPerfRnnrRug2p5X8SSS25/$$web_spill_item$$/250615084024/LeeraBlkPerfRnnrRug2p5X8SSS25.jpg",
    priceMin: "249",
    priceMax: "399",
    links: [
      {
        network: "direct",
        productId: "https://www.cb2.com/rugs/runners",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "west-elm-souk-runner",
    category: "home",
    badge: "🏠",
    name: {
      en: "West Elm Souk Runner",
      ja: "ウエストエルム スーク ランナー",
    },
    description: {
      en: "Handmade cotton flatweave runner with distressed geometric pattern. Available in multiple sizes including 2x8 and 2.5x7 ft.",
      ja: "色落ちしたジオメトリック柄の手作りコットンフラットウィーブランナー。2x8・2.5x7フィートなど複数サイズ対応。",
    },
    imageUrl: "https://images.squarespace-cdn.com/content/v1/55c41255e4b0700d65dd29ca/c1603b42-cc31-4026-8045-e1e394343fba/WEST+ELM+SOUK+WOOL+RUG+DUPE+3.jpeg?format=1000w",
    priceMin: "129",
    priceMax: "199",
    links: [
      {
        network: "direct",
        productId: "https://www.westelm.com/shop/rugs/runner-rugs/",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "ikea-lohals-runner",
    category: "home",
    badge: "🏠",
    name: {
      en: "IKEA LOHALS Jute Flatweave Runner",
      ja: "IKEA ロハルス ジュートフラットウィーブ ランナー",
    },
    description: {
      en: "Natural jute flatweave runner in multiple lengths including 2.5x6 and 2.5x8 ft. Low profile, sits flat. Requires separate non-slip pad.",
      ja: "ナチュラルジュートのフラットウィーブランナー。2.5x6・2.5x8フィートなど複数の長さ。フラットプロファイル。別売り滑り止めパッド必要。",
    },
    imageUrl: "https://www.ikea.com/pt/en/images/products/lohals-runner-flatwoven-natural__0893155_pe583381_s5.jpg?f=xl",
    priceMin: "29",
    priceMax: "49",
    links: [
      {
        network: "direct",
        productId: "https://www.ikea.com/us/en/cat/runners-10651/",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "safavieh-adirondack-runner",
    category: "home",
    badge: "🏠",
    name: {
      en: "Safavieh Adirondack Power-Loomed Runner",
      ja: "サファビエ アディロンダック パワールーム ランナー",
    },
    description: {
      en: "Power-loomed polypropylene runner with distressed vintage pattern. Stain-resistant and fade-resistant. Available in 2x8 and 2.3x8 ft.",
      ja: "ヴィンテージ風ディストレス柄のパワールーム ポリプロピレン ランナー。防汚・耐変色。2x8・2.3x8フィート対応。",
    },
    imageUrl: "https://m.media-amazon.com/images/I/A1yJbMGqT3S._AC_SL1500_.jpg",
    priceMin: "49",
    priceMax: "89",
    links: [
      {
        network: "direct",
        productId: "https://www.safavieh.com/rugs/runners",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  // ── ARTICLE 2: best-decorative-pillows-2026 ──────────────────────────────
  {
    id: "pottery-barn-everywhere-pillow",
    category: "home",
    badge: "🏠",
    name: {
      en: "Pottery Barn Everywhere Pillow",
      ja: "ポタリーバーン エブリウェア ピロー",
    },
    description: {
      en: "Linen-cotton blend cover with down-alternative insert. Full-length zipper. Available in 18x18, 20x20, 22x22, and 24x24 in. Multiple solid colors.",
      ja: "ダウンオルタナティブ インサート付きリネンコットンブレンドカバー。全長ジッパー。18x18、20x20、22x22、24x24インチ。複数のソリッドカラー。",
    },
    imageUrl: "https://assets.pbimgs.com/pbimgs/rk/images/dp/wcm/202231/0056/everywhere-velvet-pillow-cover-white-z.jpg",
    priceMin: "39",
    priceMax: "79",
    links: [
      {
        network: "direct",
        productId: "https://www.potterybarn.com/products/everywhere-pillow/",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "cb2-duo-lumbar-pillow",
    category: "home",
    badge: "🏠",
    name: {
      en: "CB2 Duo Color-Block Lumbar Pillow",
      ja: "CB2 デュオ カラーブロック ランバーピロー",
    },
    description: {
      en: "Two-toned color-block lumbar pillow with structured woven cover and firm insert. Dimensions approximately 12x20 in.",
      ja: "ツートーン・カラーブロック ランバーピロー。構造的なウィーブカバーとしっかりしたインサート。約12x20インチ。",
    },
    imageUrl: "https://3dsblue.org/upload/product/6439571.661f785545f44.jpeg",
    priceMin: "49",
    priceMax: "69",
    links: [
      {
        network: "direct",
        productId: "https://www.cb2.com/decorative-pillows/lumbar-pillows",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "west-elm-yarn-dye-pillow",
    category: "home",
    badge: "🏠",
    name: {
      en: "West Elm Yarn Dye Woven Pillow Cover",
      ja: "ウエストエルム ヤーンダイ ウィーブ ピロー カバー",
    },
    description: {
      en: "Yarn-dyed woven cotton pillow cover with deep textural pattern. Available in 18x18 and 20x20 in. Insert sold separately.",
      ja: "先染め糸のウィーブ コットンピローカバー。18x18・20x20インチ。インサート別売り。",
    },
    imageUrl: "https://www.westelm.co.uk/site/WE/Product%20Images/lattice-tie-dye-pillow-cover-t6083-202237-0038-lattice-tie-dye-pillow-cover-z.jpg?resizeid=62&resizeh=960&resizew=960",
    priceMin: "39",
    priceMax: "59",
    links: [
      {
        network: "direct",
        productId: "https://www.westelm.com/shop/bedding-bath/throw-pillows/",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "anthropologie-patchwork-pillow",
    category: "home",
    badge: "🏠",
    name: {
      en: "Anthropologie Patchwork Throw Pillow",
      ja: "アンソロポロジー パッチワーク スロー ピロー",
    },
    description: {
      en: "Handcrafted patchwork pillow with mixed fabric scraps in varied textures and patterns. Each piece slightly unique. Insert included.",
      ja: "様々なテクスチャーと柄の布端切れを使った手作りパッチワーク ピロー。各品が微妙に個性を持つ。インサート付き。",
    },
    imageUrl: "https://images.anthropologie.com/is/image/Anthropologie/40223240_095_b?$$redesign-zoom-5x$$&fit=constrain",
    priceMin: "68",
    priceMax: "98",
    links: [
      {
        network: "direct",
        productId: "https://www.anthropologie.com/pillows",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "ikea-gurli-pillow",
    category: "home",
    badge: "🏠",
    name: {
      en: "IKEA GURLI Cushion Cover",
      ja: "IKEA グルリ クッションカバー",
    },
    description: {
      en: "Cotton ribbed cushion cover. Machine washable. Available in 20x20 in. Insert sold separately. Multiple colors.",
      ja: "コットン リブ クッションカバー。洗濯機可。20x20インチ。インサート別売り。複数カラー。",
    },
    imageUrl: "https://m.media-amazon.com/images/I/91E+IBk3BqL._AC_SL1500_.jpg",
    priceMin: "7",
    priceMax: "15",
    links: [
      {
        network: "direct",
        productId: "https://www.ikea.com/us/en/cat/cushion-covers-10660/",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  // ── ARTICLE 3: best-table-lamp-2026 ──────────────────────────────────────
  {
    id: "west-elm-sculptural-glass-lamp",
    category: "home",
    badge: "🏠",
    name: {
      en: "West Elm Sculptural Glass Table Lamp",
      ja: "ウエストエルム スカルプチュラル グラス テーブルランプ",
    },
    description: {
      en: "Hand-blown glass base with organic irregular form. Natural linen shade. E26 socket, max 60W. Cord length 72 in.",
      ja: "有機的な不規則フォルムの手吹きガラスベース。ナチュラルリネンシェード。E26ソケット、最大60W。コード182cm。",
    },
    imageUrl: "https://www.westelm.co.uk/site/WE/Product%20Images/sculptural-glass-globe-floor-lamp-h3839-202104-0007-sculptural-glass-globe-floor-lamp-clear-z.jpg?resizeid=62&resizeh=960&resizew=960",
    priceMin: "179",
    priceMax: "249",
    links: [
      {
        network: "direct",
        productId: "https://www.westelm.com/shop/lighting/table-lamps/",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "cb2-arched-brass-lamp",
    category: "home",
    badge: "🏠",
    name: {
      en: "CB2 Arched Brass Table Lamp",
      ja: "CB2 アーチド ブラス テーブルランプ",
    },
    description: {
      en: "Slim curved brushed brass arm with white linen shade. E26 socket, max 60W. Lined shade prevents bulb shadow. Cord switch.",
      ja: "細い曲線のブラッシュ真鍮アームに白いリネンシェード。E26ソケット、最大60W。ライニング付きシェードで電球の影を防ぐ。コードスイッチ付き。",
    },
    imageUrl: "https://cb2.scene7.com/is/image/CB2/BrassBigDipperArcLampSHF16?$$web_pdp_main_carousel_med$$",
    priceMin: "199",
    priceMax: "299",
    links: [
      {
        network: "direct",
        productId: "https://www.cb2.com/table-lamps",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "ikea-ranarp-lamp",
    category: "home",
    badge: "🏠",
    name: {
      en: "IKEA RANARP Work Lamp",
      ja: "IKEA ラナルプ ワークランプ",
    },
    description: {
      en: "Adjustable metal arm table lamp with matte black powder-coat finish. E26 socket, max 40W. Cord switch at convenient position. Height adjustable.",
      ja: "マットブラック パウダーコート仕上げの調節可能なメタルアームテーブルランプ。E26ソケット、最大40W。コードスイッチ付き。高さ調節可能。",
    },
    imageUrl: "https://www.ikea.com/ca/en/images/products/ranarp-work-lamp-off-white__0610455_pe685514_s5.jpg",
    priceMin: "29",
    priceMax: "45",
    links: [
      {
        network: "direct",
        productId: "https://www.ikea.com/us/en/p/ranarp-work-lamp-off-white-20326237/",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "rejuvenation-schoolhouse-lamp",
    category: "home",
    badge: "🏠",
    name: {
      en: "Rejuvenation Schoolhouse Table Lamp",
      ja: "リジュベネーション スクールハウス テーブルランプ",
    },
    description: {
      en: "Solid brass and hand-blown glass heritage reproduction table lamp. Cloth-covered cord. All components individually replaceable. Develops natural patina over time.",
      ja: "ソリッドブラスと手吹きガラスのヘリテージ復刻テーブルランプ。布巻きコード。全コンポーネント個別交換可能。経年でナチュラルパティナが育つ。",
    },
    imageUrl: "https://menterarchitects.com/wp-content/uploads/2017/10/rose-city-6in-pendant-rejuvenation-intended-for-schoolhouse-pendant-lights-fixtures.jpg",
    priceMin: "349",
    priceMax: "549",
    links: [
      {
        network: "direct",
        productId: "https://www.rejuvenation.com/catalog/category/view/id/table-lamps",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "target-threshold-arc-lamp",
    category: "home",
    badge: "🏠",
    name: {
      en: "Target Threshold Arc Table Lamp",
      ja: "ターゲット スレッシュホールド アーク テーブルランプ",
    },
    description: {
      en: "Tall arched table lamp providing overhead-style ambient room coverage from a table base. Matte finish. E26 socket. Drum shade.",
      ja: "テーブルベースから天井スタイルの環境光カバレッジを提供する背の高いアーチ型テーブルランプ。マット仕上げ。E26ソケット。ドラムシェード。",
    },
    imageUrl: "https://pixl.varagesale.com/http://s3.amazonaws.com/hopshop-image-store-production/296761014/7d33e7b27246fee3eda62e0da85f6fb7.jpg?_ver=large&w=1500&h=1500&fit=max&s=78460515172fbced33e711c736dc0351",
    priceMin: "45",
    priceMax: "75",
    links: [
      {
        network: "direct",
        productId: "https://www.target.com/c/table-lamps-lighting/-/N-55jn4",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  // ── ARTICLE 4: best-tv-stand-2026 ────────────────────────────────────────
  {
    id: "west-elm-tower-media-console",
    category: "home",
    badge: "🏠",
    name: {
      en: "West Elm Tower Media Console",
      ja: "ウエストエルム タワー メディアコンソール",
    },
    description: {
      en: "Wide media console for 65–75 in TVs. Mixed open/closed storage with angled wood grain doors. Cable cutouts at rear of each shelf. Mango wood construction.",
      ja: "65〜75インチTV向けワイドメディアコンソール。アングル木目扉付きのオープン・クローズドストレージ混在。各棚後部にケーブル穴。マンゴーウッド施工。",
    },
    imageUrl: "https://media.zenfs.com/en/apartment_therapy_269/585edcd837953bcab2bb6dc824f426dc",
    priceMin: "899",
    priceMax: "1199",
    links: [
      {
        network: "direct",
        productId: "https://www.westelm.com/shop/furniture/media-console-tv-stands/",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "cb2-media-console-dark-walnut",
    category: "home",
    badge: "🏠",
    name: {
      en: "CB2 Dark Walnut Media Console",
      ja: "CB2 ダークウォルナット メディアコンソール",
    },
    description: {
      en: "Low-profile mid-century walnut veneer media console. Tapered solid wood legs. Magnetic latch doors. Two-door with adjustable shelving.",
      ja: "低プロファイルのミッドセンチュリー ウォルナットベニヤ メディアコンソール。テーパードソリッドウッドの脚。マグネットラッチ扉。2ドア調整棚付き。",
    },
    imageUrl: "https://cb2.scene7.com/is/image/CB2/SuspendMediaConsole3QBSSS22?$$web_pdp_main_carousel_med$$",
    priceMin: "799",
    priceMax: "1099",
    links: [
      {
        network: "direct",
        productId: "https://www.cb2.com/media-consoles-tv-stands",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "ikea-besta-tv-unit",
    category: "home",
    badge: "🏠",
    name: {
      en: "IKEA BESTÅ TV Storage Unit",
      ja: "IKEA ベストー TV 収納ユニット",
    },
    description: {
      en: "Modular configurable TV storage framework. Choose base units, doors, and top panels. Multiple finish options from gloss white to wood grain. Fully customizable width.",
      ja: "モジュール式カスタマイズ可能なTV収納フレームワーク。ベースユニット・扉・天板を選択。グロスホワイトから木目まで複数仕上げ。幅カスタム可能。",
    },
    imageUrl: "https://www.ikea.com/ca/en/images/products/besta-tv-storage-combination-glass-doors-white-smeviken-ostvik-white-clear-glass__0917641_pe785879_s5.jpg?f=sg",
    priceMin: "149",
    priceMax: "599",
    links: [
      {
        network: "direct",
        productId: "https://www.ikea.com/us/en/cat/tv-furniture-besta-series-26981/",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "wayfair-trent-tv-stand",
    category: "home",
    badge: "🏠",
    name: {
      en: "Wayfair Trent Austin Design TV Stand",
      ja: "ウェイフェア トレント オースティンデザイン TV スタンド",
    },
    description: {
      en: "Mid-century style TV stand with wood-look finish. Adjustable interior shelving. Cabinet doors with metal hardware. Supports TVs up to 65 in.",
      ja: "ミッドセンチュリースタイルの木目調仕上げTVスタンド。調節可能な内部棚。金属ハードウェア付きキャビネット扉。65インチまでのTVに対応。",
    },
    imageUrl: "https://secure.img1-cg.wfcdn.com/im/40323275/compr-r85/2354/235485332/holli-tv-stand-for-tvs-up-to-43.jpg",
    priceMin: "279",
    priceMax: "449",
    links: [
      {
        network: "direct",
        productId: "https://www.wayfair.com/furniture/pdp/trent-austin-design-tv-stands",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "article-cado-tv-unit",
    category: "home",
    badge: "🏠",
    name: {
      en: "Article Cado TV Unit",
      ja: "アーティクル カド TV ユニット",
    },
    description: {
      en: "Clean mid-century TV unit with walnut-stained legs and two-door engineered wood carcass. Direct-to-consumer pricing. Excellent packaging for damage-free delivery.",
      ja: "ウォルナット染めの脚と2ドアエンジニアードウッド箱体のクリーンなミッドセンチュリーTVユニット。D2C価格。優れた梱包で損傷なし配送。",
    },
    imageUrl: "https://m.media-amazon.com/images/I/81MusTlmmgL._AC_SL1500_.jpg",
    priceMin: "599",
    priceMax: "849",
    links: [
      {
        network: "direct",
        productId: "https://www.article.com/category/tv-units",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  // ── ARTICLE 5: best-console-table-2026 ───────────────────────────────────
  {
    id: "cb2-socle-console",
    category: "home",
    badge: "🏠",
    name: {
      en: "CB2 Socle Console Table",
      ja: "CB2 ソクル コンソールテーブル",
    },
    description: {
      en: "Travertine-textured concrete composite top on geometric powder-coated iron base. Sealed surface. Natural variation in each piece. 60 in wide x 14 in deep.",
      ja: "幾何学的パウダーコートアイアンベースの上のトラバーチン風コンクリートコンポジット天板。シールドサーフェス。各品に自然な変化。幅152cmx奥行き35cm。",
    },
    imageUrl: "https://roomii.co/wp-content/uploads/2024/04/432689024_7266668186749440_962270966483699955_n.jpg",
    priceMin: "699",
    priceMax: "999",
    links: [
      {
        network: "direct",
        productId: "https://www.cb2.com/console-tables-sofa-tables",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "west-elm-terrace-console",
    category: "home",
    badge: "🏠",
    name: {
      en: "West Elm Terrace Console Table",
      ja: "ウエストエルム テラス コンソールテーブル",
    },
    description: {
      en: "FSC-certified wood console table with lower shelf. Clean straight-line design. Available in mid-century walnut, white, and natural finishes. Multiple widths.",
      ja: "下段棚付きFSC認証木製コンソールテーブル。クリーンな直線デザイン。ミッドセンチュリーウォルナット・ホワイト・ナチュラル仕上げ。複数の幅。",
    },
    imageUrl: "https://www.westelm.com.au/site/WE/Product%20Images/terrace-console-h1479-202217-0195-terrace-console-z.jpg?resizeid=54&resizeh=960&resizew=960",
    priceMin: "399",
    priceMax: "649",
    links: [
      {
        network: "direct",
        productId: "https://www.westelm.com/shop/furniture/entryway-furniture/console-tables/",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "pottery-barn-quinn-console",
    category: "home",
    badge: "🏠",
    name: {
      en: "Pottery Barn Quinn Console Table",
      ja: "ポタリーバーン クイン コンソールテーブル",
    },
    description: {
      en: "Traditional turned-leg console table with single drawer and antique brass hardware. Lower open shelf. Solid wood construction. 52 in wide x 14 in deep.",
      ja: "シングル引き出しとアンティークブラスハードウェア付きの伝統的な旋削脚コンソールテーブル。オープン下棚。ソリッドウッド。幅132cmx奥行き35cm。",
    },
    imageUrl: "https://assets.pbimgs.com/pbimgs/ab/images/dp/wcm/202321/1185/nicasio-rectangular-console-table-1-l.jpg",
    priceMin: "599",
    priceMax: "899",
    links: [
      {
        network: "direct",
        productId: "https://www.potterybarn.com/products/quinn-console-table/",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "ikea-hemnes-console",
    category: "home",
    badge: "🏠",
    name: {
      en: "IKEA HEMNES Console Table",
      ja: "IKEA ヘムネス コンソールテーブル",
    },
    description: {
      en: "Solid pine console table with lower shelf. Available in white stain and black-brown finish. 55 in wide x 14 in deep x 30 in tall.",
      ja: "下棚付きソリッドパイン コンソールテーブル。ホワイトステインとブラックブラウン仕上げ。幅140cmx奥行き35cmx高さ76cm。",
    },
    imageUrl: "http://www.ikea.com/us/en/images/products/hemnes-console-table__0177329_PE330315_S4.JPG",
    priceMin: "79",
    priceMax: "129",
    links: [
      {
        network: "direct",
        productId: "https://www.ikea.com/us/en/cat/console-tables-20671/",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "article-toggle-console",
    category: "home",
    badge: "🏠",
    name: {
      en: "Article Toggle Console Table",
      ja: "アーティクル トグル コンソールテーブル",
    },
    description: {
      en: "Mid-century walnut-stained console with solid wood legs and engineered wood top. Clean minimal silhouette. Direct-to-consumer pricing. 55 in wide x 14 in deep.",
      ja: "ソリッドウッドの脚とエンジニアードウッド天板のミッドセンチュリーウォルナット染めコンソール。クリーンなミニマルシルエット。D2C価格。幅140cmx奥行き35cm。",
    },
    imageUrl: "https://m.media-amazon.com/images/I/816JF+AdFsL.jpg",
    priceMin: "299",
    priceMax: "449",
    links: [
      {
        network: "direct",
        productId: "https://www.article.com/category/console-tables",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  // ── ARTICLE 6: best-entryway-bench-2026 ──────────────────────────────────
  {
    id: "west-elm-entry-upholstered-bench",
    category: "home",
    badge: "🏠",
    name: {
      en: "West Elm Entry Upholstered Bench",
      ja: "ウエストエルム エントリー 張地ベンチ",
    },
    description: {
      en: "Entryway-specific upholstered bench with performance fabric options. Tapered solid wood legs. 18 in seat height. Available 48 and 60 in widths.",
      ja: "パフォーマンス素材オプション付きの玄関専用張地ベンチ。テーパードソリッドウッドの脚。座高46cm。幅122cmと152cm対応。",
    },
    imageUrl: "https://m.media-amazon.com/images/I/91Dkbf0GKjL._AC_.jpg",
    priceMin: "299",
    priceMax: "499",
    links: [
      {
        network: "direct",
        productId: "https://www.westelm.com/shop/furniture/entryway-furniture/benches/",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "cb2-camden-bench",
    category: "home",
    badge: "🏠",
    name: {
      en: "CB2 Camden Upholstered Bench",
      ja: "CB2 キャムデン 張地ベンチ",
    },
    description: {
      en: "Low-profile contemporary bench with brass-finished metal legs. Woven cushion fabric. 17 in seat height. 48 in wide.",
      ja: "ブラス仕上げ金属脚付きの低プロファイルコンテンポラリーベンチ。ウィーブクッション素材。座高43cm。幅122cm。",
    },
    imageUrl: "https://b4.3dsky.org/media/cache/tuk_model_custom_filter_ang_en/model_images/0000/0000/7661/7661267.681ce1afcfb18.jpeg",
    priceMin: "349",
    priceMax: "549",
    links: [
      {
        network: "direct",
        productId: "https://www.cb2.com/entryway-benches",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "ikea-trones-bench",
    category: "home",
    badge: "🏠",
    name: {
      en: "IKEA TRONES Shoe Storage Cabinet",
      ja: "IKEA トロネース 靴収納キャビネット",
    },
    description: {
      en: "Wall-mounted shoe storage with flip-down compartments. Each unit holds 3–4 pairs. Units can be combined for wider storage. No floor space required.",
      ja: "フリップダウンコンパートメント付き壁掛け靴収納。各ユニットに3〜4足収納。複数ユニットを組み合わせ可能。床面積不要。",
    },
    imageUrl: "https://sassyharbor.com/wp-content/uploads/2025/09/ikea-hack-storage-bench-ideas-trones-stackable-shoe-bench-for-narrow-halls.jpg",
    priceMin: "39",
    priceMax: "59",
    links: [
      {
        network: "direct",
        productId: "https://www.ikea.com/us/en/p/trones-shoe-storage-cabinet-white-90100453/",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "pottery-barn-parkmore-bench",
    category: "home",
    badge: "🏠",
    name: {
      en: "Pottery Barn Parkmore Entryway Bench",
      ja: "ポタリーバーン パークモア 玄関ベンチ",
    },
    description: {
      en: "Storage entryway bench with lift-top compartment, back panel hooks, and cushioned seat. Traditional paneled design. Available 42 and 52 in widths.",
      ja: "リフトトップコンパートメント・背面フック・クッションシート付き収納玄関ベンチ。伝統的なパネルデザイン。幅107cmと132cm対応。",
    },
    imageUrl: "https://assets.pbimgs.com/pbimgs/ab/images/dp/wcm/202234/0583/parkmore-reclaimed-wood-dining-bench-z.jpg",
    priceMin: "549",
    priceMax: "849",
    links: [
      {
        network: "direct",
        productId: "https://www.potterybarn.com/products/parkmore-entryway-bench/",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "wayfair-andover-mills-bench",
    category: "home",
    badge: "🏠",
    name: {
      en: "Wayfair Andover Mills Upholstered Storage Bench",
      ja: "ウェイフェア アンドーバーミルズ 張地収納ベンチ",
    },
    description: {
      en: "Tufted upholstered bench with tapered legs. Polyester blend fabric. Stable frame. Available in multiple colors and widths from 36–52 in.",
      ja: "テーパードレッグ付きタフテッド張地ベンチ。ポリエステルブレンド素材。安定フレーム。複数カラーと36〜132cmの幅で展開。",
    },
    imageUrl: "https://secure.img1-fg.wfcdn.com/im/09917393/compr-r85/1607/160742935/efird-iron-garden-bench.jpg",
    priceMin: "99",
    priceMax: "199",
    links: [
      {
        network: "direct",
        productId: "https://www.wayfair.com/furniture/pdp/andover-mills-benches",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  // ── ARTICLE 7: best-accent-chair-2026 ────────────────────────────────────
  {
    id: "west-elm-felix-chair",
    category: "home",
    badge: "🏠",
    name: {
      en: "West Elm Felix Chair",
      ja: "ウエストエルム フェリックス チェア",
    },
    description: {
      en: "Low slung-back contemporary accent chair with angled brass legs. Performance fabric options available. 20 in seat depth. Multiple upholstery colors.",
      ja: "傾いた真鍮脚付きの低いスランバック コンテンポラリー アクセントチェア。パフォーマンス素材オプション。座面奥行き51cm。複数の張地カラー。",
    },
    imageUrl: "https://www.hunker.com/hunker/west-elm-dupes/fc0609fa96d94cc1adce96196448e3c8.jpeg",
    priceMin: "699",
    priceMax: "999",
    links: [
      {
        network: "direct",
        productId: "https://www.westelm.com/shop/furniture/chairs/accent-chairs/",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "cb2-gwyneth-chair",
    category: "home",
    badge: "🏠",
    name: {
      en: "CB2 Gwyneth Chair",
      ja: "CB2 グウィネス チェア",
    },
    description: {
      en: "Geometric barrel chair with tight-wrapped upholstered exterior. High rounded back provides neck support. Solid frame, no flex. Textural neutral fabric options.",
      ja: "密巻き張地の幾何学バレルチェア。高い丸い背もたれが首サポート。たわみなしのソリッドフレーム。テクスチャードニュートラル素材オプション。",
    },
    imageUrl: "https://api.cb2.ae/medias/530927-CB2GwynethIvyBclSwivelChairSHS25-convert-1440x960?context=bWFzdGVyfGF6dXJlaW1hZ2VzfDg1NDQ2fGltYWdlL2pwZWd8YUdZM0wyZ3pPQzh4TWpVMk56STVNamt6TmpJeU1pODFNekE1TWpkZlEwSXlSM2Q1Ym1WMGFFbDJlVUpqYkZOM2FYWmxiRU5vWVdseVUwaFRNalZmWTI5dWRtVnlkQzB4TkRRd2VEazJNQXxlNWEwYjE5NjM5YmUyMmZiN2EyNzRiMjU0YjViNmVkY2NhMjkyNTUwODc2ZTc4ZDc5ZDdjMDg3MTU0OGNlMzQ5",
    priceMin: "799",
    priceMax: "1099",
    links: [
      {
        network: "direct",
        productId: "https://www.cb2.com/chairs-accent-chairs",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "article-sven-chair",
    category: "home",
    badge: "🏠",
    name: {
      en: "Article Sven Chair",
      ja: "アーティクル スヴェン チェア",
    },
    description: {
      en: "Mid-century barrel chair with curved back and tapered wood legs. 19 in seat depth. Well-calibrated cushion firmness. Multiple woven fabric colors. Direct-to-consumer pricing.",
      ja: "曲線の背もたれとテーパードウッドの脚のミッドセンチュリーバレルチェア。座面奥行き48cm。適切なクッション硬さ。複数のウィーブ素材カラー。D2C価格。",
    },
    imageUrl: "https://cdn-images.article.com/products/SKU25584/2890x1500/image201841.jpg?fit=max&w=1200&q=100",
    priceMin: "599",
    priceMax: "849",
    links: [
      {
        network: "direct",
        productId: "https://www.article.com/category/accent-chairs",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "ikea-strandmon-chair",
    category: "home",
    badge: "🏠",
    name: {
      en: "IKEA STRANDMON Wing Chair",
      ja: "IKEA ストランドモン ウイングチェア",
    },
    description: {
      en: "Wingback accent chair with high back and wing sides for head and neck support. Removable washable slipcover. In continuous production since 2000.",
      ja: "頭と首のサポートのための高い背もたれとウイングサイドのウイングバック アクセントチェア。取り外し可能な洗濯機可スリップカバー。2000年から継続生産。",
    },
    imageUrl: "https://m.media-amazon.com/images/I/81wriMgNtjL._AC_SL1500_.jpg",
    priceMin: "349",
    priceMax: "449",
    links: [
      {
        network: "direct",
        productId: "https://www.ikea.com/us/en/p/strandmon-wing-chair-nordvalla-dark-gray-90298217/",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "pottery-barn-seabury-chair",
    category: "home",
    badge: "🏠",
    name: {
      en: "Pottery Barn Seabury Chair",
      ja: "ポタリーバーン シーベリー チェア",
    },
    description: {
      en: "Fully upholstered rolled-arm chair with high back. 32 in wide seat. High-density foam cushion. Extensive fabric and leg finish customization options.",
      ja: "高い背もたれ付きの完全張地ロールドアームチェア。幅81cmの座面。高密度フォームクッション。広範な素材とレッグ仕上げカスタマイズオプション。",
    },
    imageUrl: "https://chairish-prod.freetls.fastly.net/image/product/sized/ca503803-f693-43f1-ba79-e9bb22d17245/pottery-barn-seabury-sofa-3000?aspect=fit&height=1600&width=1600",
    priceMin: "899",
    priceMax: "1299",
    links: [
      {
        network: "direct",
        productId: "https://www.potterybarn.com/products/seabury-upholstered-chair/",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  // ── ARTICLE 8: best-nightstand-2026 ──────────────────────────────────────
  {
    id: "west-elm-modern-mixed-nightstand",
    category: "home",
    badge: "🏠",
    name: {
      en: "West Elm Modern Mixed Material Nightstand",
      ja: "ウエストエルム モダン ミックスドマテリアル ナイトスタンド",
    },
    description: {
      en: "Marble or concrete top paired with walnut-finished wood drawer unit. Metal frame connector. 21x16 in surface. Single 5-in deep drawer.",
      ja: "ウォルナット仕上げ木製引き出しユニットと組み合わせた大理石またはコンクリート天板。金属フレームコネクター。53x40cmサーフェス。深さ13cmシングル引き出し。",
    },
    imageUrl: "https://cdn.apartmenttherapy.info/image/upload/f_auto,q_auto:eco,w_730/commerce/West-Elm-Quinn-Closed-2-Drawer-Nightstand",
    priceMin: "349",
    priceMax: "549",
    links: [
      {
        network: "direct",
        productId: "https://www.westelm.com/shop/furniture/bedroom-furniture/nightstands/",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "cb2-acrylic-frame-nightstand",
    category: "home",
    badge: "🏠",
    name: {
      en: "CB2 Acrylic Frame Nightstand",
      ja: "CB2 アクリルフレーム ナイトスタンド",
    },
    description: {
      en: "Transparent acrylic leg frame nightstand creating visual floating effect. Single drawer and top shelf. Polishes clean. Modern floating appearance.",
      ja: "浮遊効果を作る透明アクリルレッグフレーム ナイトスタンド。シングル引き出しと上棚。きれいに磨ける。モダンな浮遊感のある外観。",
    },
    imageUrl: "https://cb2.scene7.com/is/image/CB2/EsenteAcrylicNightstand3QBSSS21?$$web_pdp_main_carousel_med$$",
    priceMin: "249",
    priceMax: "399",
    links: [
      {
        network: "direct",
        productId: "https://www.cb2.com/nightstands",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "ikea-hemnes-nightstand",
    category: "home",
    badge: "🏠",
    name: {
      en: "IKEA HEMNES Nightstand",
      ja: "IKEA ヘムネス ナイトスタンド",
    },
    description: {
      en: "Solid pine nightstand with one large 6-in deep drawer and lower open shelf. White stain or black-brown finish. 18x14 in surface.",
      ja: "深さ15cmの大きな引き出しと下段オープン棚付きソリッドパイン ナイトスタンド。ホワイトステインまたはブラックブラウン仕上げ。46x35cmサーフェス。",
    },
    imageUrl: "https://m.media-amazon.com/images/I/61ZTS1Y+90L._AC_.jpg",
    priceMin: "79",
    priceMax: "119",
    links: [
      {
        network: "direct",
        productId: "https://www.ikea.com/us/en/cat/nightstands-20762/",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "pottery-barn-sausalito-nightstand",
    category: "home",
    badge: "🏠",
    name: {
      en: "Pottery Barn Sausalito Nightstand",
      ja: "ポタリーバーン ソーサリート ナイトスタンド",
    },
    description: {
      en: "Two-drawer plus lower shelf nightstand in kiln-dried hardwood with dovetail joints. 22x17 in surface. Multiple wood finishes available.",
      ja: "キルン乾燥硬木と蟻組み接合の2段引き出し＋下棚ナイトスタンド。56x43cmサーフェス。複数のウッド仕上げ。",
    },
    imageUrl: "https://assets.pbimgs.com/pbimgs/rk/images/dp/wcm/202243/0817/sausalito-32-nightstand-2-z.jpg",
    priceMin: "449",
    priceMax: "699",
    links: [
      {
        network: "direct",
        productId: "https://www.potterybarn.com/products/sausalito-nightstand/",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "wayfair-mercury-row-nightstand",
    category: "home",
    badge: "🏠",
    name: {
      en: "Wayfair Mercury Row Nightstand",
      ja: "ウェイフェア マーキュリーロウ ナイトスタンド",
    },
    description: {
      en: "Hairpin leg nightstand with wood top in mid-century styling. Single drawer. Looks more expensive than price point. Available in multiple finishes.",
      ja: "ミッドセンチュリースタイルのヘアピンレッグと木天板ナイトスタンド。シングル引き出し。価格以上に高く見える。複数仕上げ。",
    },
    imageUrl: "https://secure.img1-cg.wfcdn.com/im/34720257/compr-r85/2440/244069907/conye-easton-two-drawer-nightstand.jpg",
    priceMin: "79",
    priceMax: "149",
    links: [
      {
        network: "direct",
        productId: "https://www.wayfair.com/furniture/pdp/mercury-row-nightstands",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  // ── ARTICLE 9: best-coffee-table-2026 ────────────────────────────────────
  {
    id: "cb2-ronan-oval-coffee-table",
    category: "home",
    badge: "🏠",
    name: {
      en: "CB2 Ronan Oval Coffee Table",
      ja: "CB2 ローナン オーバル コーヒーテーブル",
    },
    description: {
      en: "Low-profile oval coffee table in whitened solid oak. No sharp corners. 48x26 in surface. 16 in height. Simple solid wood base frame with 6-in floor clearance.",
      ja: "ホワイトニング ソリッドオークのローコンソール オーバルコーヒーテーブル。鋭角なし。122x66cmサーフェス。高さ40cm。6インチ床クリアランスのシンプルなソリッドウッドベースフレーム。",
    },
    imageUrl: "https://www.thehadylife.com/wp-content/uploads/2023/01/IMG_0856-1-scaled.jpg",
    priceMin: "699",
    priceMax: "999",
    links: [
      {
        network: "direct",
        productId: "https://www.cb2.com/coffee-tables",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "west-elm-terrace-coffee-table",
    category: "home",
    badge: "🏠",
    name: {
      en: "West Elm Terrace Coffee Table",
      ja: "ウエストエルム テラス コーヒーテーブル",
    },
    description: {
      en: "Solid wood coffee table with lower storage shelf. 48x27 in, 18 in height. Multiple finish options. FSC-certified wood.",
      ja: "下段収納棚付きソリッドウッドコーヒーテーブル。122x69cm、高さ46cm。複数仕上げオプション。FSC認証木材。",
    },
    imageUrl: "https://www.westelm.com.au/site/WE/Product%20Images/terrace-coffee-table-h1030-alt15-imgz.jpg?resizeid=54&resizeh=960&resizew=960",
    priceMin: "499",
    priceMax: "799",
    links: [
      {
        network: "direct",
        productId: "https://www.westelm.com/shop/furniture/coffee-tables/",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "article-frame-coffee-table",
    category: "home",
    badge: "🏠",
    name: {
      en: "Article Frame Coffee Table",
      ja: "アーティクル フレーム コーヒーテーブル",
    },
    description: {
      en: "Mid-century coffee table with walnut veneer top and solid walnut legs. 48x24 in, 16 in height. Direct-to-consumer pricing. Quality hardware included.",
      ja: "ウォルナットベニヤ天板とソリッドウォルナット脚のミッドセンチュリー コーヒーテーブル。122x61cm、高さ40cm。D2C価格。高品質ハードウェア付き。",
    },
    imageUrl: "https://m.media-amazon.com/images/I/91xTdGmO3yL._AC_SL1500_.jpg",
    priceMin: "399",
    priceMax: "599",
    links: [
      {
        network: "direct",
        productId: "https://www.article.com/category/coffee-tables",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "ikea-lack-coffee-table",
    category: "home",
    badge: "🏠",
    name: {
      en: "IKEA LACK Coffee Table",
      ja: "IKEA ラック コーヒーテーブル",
    },
    description: {
      en: "Budget laminate-top coffee table with hollow legs. 46x22 in. Lightweight and easy to move. Easy-clean surface. In continuous production 40+ years.",
      ja: "中空レッグのバジェット ラミネート天板コーヒーテーブル。117x56cm。軽量で移動が楽。清掃が楽なサーフェス。40年以上継続生産。",
    },
    imageUrl: "https://m.media-amazon.com/images/I/51KW+r+2yNL._AC_SL1400_.jpg",
    priceMin: "49",
    priceMax: "59",
    links: [
      {
        network: "direct",
        productId: "https://www.ikea.com/us/en/p/lack-coffee-table-white-30449908/",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "pottery-barn-griffin-coffee-table",
    category: "home",
    badge: "🏠",
    name: {
      en: "Pottery Barn Griffin Coffee Table",
      ja: "ポタリーバーン グリフィン コーヒーテーブル",
    },
    description: {
      en: "Reclaimed solid wood top with hand-forged welded iron base. 54x32 in. Heavy and substantial — designed for large living rooms. Natural wood variation.",
      ja: "手鍛造溶接アイアンベースと再生ソリッドウッド天板。137x81cm。重厚感あり——大型リビング向け設計。木材の自然な変化。",
    },
    imageUrl: "https://www.potterybarn.com/pbimgs/rk/images/dp/wcm/201922/2111/griffin-reclaimed-wood-coffee-table-c.jpg",
    priceMin: "999",
    priceMax: "1499",
    links: [
      {
        network: "direct",
        productId: "https://www.potterybarn.com/products/griffin-coffee-table/",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  // ── ARTICLE 10: best-bath-towels-2026 ────────────────────────────────────
  {
    id: "brooklinen-super-plush-towel",
    category: "home",
    badge: "🏠",
    name: {
      en: "Brooklinen Super Plush Bath Towel",
      ja: "ブルックリネン スーパープラッシュ バスタオル",
    },
    description: {
      en: "820 GSM long-staple Turkish cotton bath towel. Dense anchored loops resist shedding. Hotel-quality softness maintained after 30+ washes. Multiple colors.",
      ja: "820GSM超長繊維トルコ綿バスタオル。密で確実に固定されたループでほつれを防ぐ。30回以上の洗濯後もホテルクオリティの柔らかさを維持。複数カラー。",
    },
    imageUrl: "https://m.media-amazon.com/images/I/81IahlryKcL._AC_SL1500_.jpg",
    priceMin: "29",
    priceMax: "39",
    links: [
      {
        network: "direct",
        productId: "https://brooklinen.com/products/super-plush-bath-towel",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "parachute-classic-bath-towel",
    category: "home",
    badge: "🏠",
    name: {
      en: "Parachute Classic Bath Towel",
      ja: "パラシュート クラシック バスタオル",
    },
    description: {
      en: "600 GSM long-staple Turkish cotton bath towel. Balances luxury with practical fast-drying performance. Available in 20+ curated neutral colors.",
      ja: "600GSM超長繊維トルコ綿バスタオル。豪華さと実用的な速乾性のバランス。20色以上の厳選ニュートラルカラー対応。",
    },
    imageUrl: "https://www.refinery29.com/images/10278253.jpg",
    priceMin: "24",
    priceMax: "34",
    links: [
      {
        network: "direct",
        productId: "https://www.parachutehome.com/products/bath-towel",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "pottery-barn-hydrocotton-towel",
    category: "home",
    badge: "🏠",
    name: {
      en: "Pottery Barn Hydrocotton Bath Towel",
      ja: "ポタリーバーン ハイドロコットン バスタオル",
    },
    description: {
      en: "Proprietary long-loop cotton construction that improves both absorbency and dry time versus standard terry. Maintains softness after 50+ washes. Multiple colors.",
      ja: "標準テリーより吸水性と乾燥時間の両方を向上させるプロプライエタリロングループコットン施工。50回以上の洗濯後も柔らかさを維持。複数カラー。",
    },
    imageUrl: "https://assets.pbimgs.com/pbimgs/rk/images/dp/wcm/202323/0044/hydrocotton-organic-quick-dry-towels-l.jpg",
    priceMin: "26",
    priceMax: "36",
    links: [
      {
        network: "direct",
        productId: "https://www.potterybarn.com/products/hydrocotton-bath-towels/",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "wirecutter-picks-towel",
    category: "home",
    badge: "🏠",
    name: {
      en: "Wirecutter Best Budget Towel Pick",
      ja: "ワイヤーカッター バジェット タオル おすすめ",
    },
    description: {
      en: "Wirecutter's current top-rated budget bath towel pick, updated periodically based on long-term wash-cycle testing. Available at Target. Turkish cotton construction.",
      ja: "洗濯サイクルの長期テストに基づき定期的に更新されるWirecutterの現在の最高評価バジェットバスタオル。Targetで入手可能。トルコ綿施工。",
    },
    imageUrl: "https://m.media-amazon.com/images/I/71WdJYcqjxL._AC_SL1500_.jpg",
    priceMin: "10",
    priceMax: "18",
    links: [
      {
        network: "direct",
        productId: "https://www.nytimes.com/wirecutter/reviews/best-bath-towels/",
        markets: ["global"],
        approved: true,
      },
    ],
  },
  {
    id: "target-threshold-performance-towel",
    category: "home",
    badge: "🏠",
    name: {
      en: "Target Threshold Performance Bath Towel",
      ja: "ターゲット スレッシュホールド パフォーマンス バスタオル",
    },
    description: {
      en: "Budget-accessible bath towel available in Target stores for easy same-day purchase. Standard cotton construction. Multiple colors. Performs adequately for 1–2 years of daily use.",
      ja: "Targetで当日購入可能なバジェット バスタオル。標準コットン施工。複数カラー。1〜2年の毎日の使用に十分な性能。",
    },
    imageUrl: "",
    priceMin: "8",
    priceMax: "14",
    links: [
      {
        network: "direct",
        productId: "https://www.target.com/c/bath-towels-bathroom/-/N-aoa0u",
        markets: ["global"],
        approved: true,
      },
    ],
  },
] as unknown as AffiliateOffer[];
