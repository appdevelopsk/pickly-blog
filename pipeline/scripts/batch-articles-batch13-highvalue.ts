import type { ArticleDef, NewOffer, Translation } from "./batch-articles-types";

/**
 * batch13 高単価バッチ (2026-08-17)
 *
 * batch12 の続き。選定根拠は同じく
 * `~/Dropbox/00_集客統合/growth/winnable-value-queue.mjs` の実測キューで、
 * batch12 で上位3本(portable AC / window AC / smith machine)を出した残りの5本:
 *   catio / electric fireplace / evaporative cooler /
 *   bidet toilet seat / hack squat machine
 *
 * 狙いは batch12 と同一 — **勝てる粒度のまま価格帯だけ上げる**。
 * 一般名詞の head (mattress, treadmill) は新規ドメインでは順位が付かないが、
 * 「用途が限定された $150〜1,500 の単品」は表示が取れており、かつ成約単価が高い。
 * カテゴリ料率も効く: home/pets/garden 8%、fitness 3%。
 *
 * ★methodology は buildTranslations を使わない。あの共通ヘルパは全言語に
 *   「N日間テストした」を焼き込むが、pickly は一次試験をしていない。
 *   過去に同じ書き方で153記事・2,290箇所を修正している。
 */

const METHOD_EN =
  "We did not run our own testing on any of these products. Doing it honestly would need an instrumented enclosure for the catios, a calibrated wet-bulb rig for the evaporative coolers, and a loaded sled with a force plate for the hack squat machines — none of which we have. What we did instead: pulled every published specification from each manufacturer's own product page and manual, cross-checked current pricing against major retailer listings, and read owner reviews at volume, filtering for reports that describe a measurable failure or a repeated complaint rather than a first-week impression. Where a number is a manufacturer claim rather than an independent measurement, we say so in the text.";

const METHOD_JA =
  "これらの製品について自前の試験は行っていません。正直にやるならキャティオは計測器を入れた囲い、気化式冷風機は湿球温度を測れる校正済みの治具、ハックスクワットマシンはフォースプレート付きの荷重台が要りますが、どれも持っていません。代わりに行ったのは、各メーカーの製品ページとマニュアルから公表仕様を全て拾い、主要小売の掲載価格で現在価格を突き合わせ、購入者レビューを大量に読むことです。レビューは初週の感想ではなく、測定可能な不具合や繰り返し出てくる苦情に絞って採用しています。数値がメーカー公称であって独立した実測ではない場合は、本文中でそう明記しています。";

export const BATCH13_HIGHVALUE_OFFERS: NewOffer[] = [
  // --- best-catio-2026 ---
  {
    id: "aivituvin-outdoor-cat-house-catio",
    nameEn: "Aivituvin Outdoor Cat House Catio",
    nameJa: "Aivituvin 屋外キャットハウス キャティオ",
    descEn: "Fir-frame walk-in catio with an enclosed sleeping box, multiple platform levels and an asphalt-felt roof. Comes as a flat-pack kit; the run and the shelter are one structure rather than separate pieces.",
    descJa: "モミ材フレームのウォークイン型キャティオ。囲いのある寝箱、複数段のステップ、アスファルトフェルト屋根付き。フラットパックのキットで、走り回るスペースとシェルターが分かれておらず一体構造。",
    priceMin: "$260", priceMax: "$420", category: "pets", badge: "🏆",
    url: "https://www.amazon.com/s?k=Aivituvin+Outdoor+Cat+House+Catio",
  },
  {
    id: "petsfit-outdoor-cat-enclosure",
    nameEn: "Petsfit Outdoor Cat Enclosure",
    nameJa: "Petsfit 屋外キャットエンクロージャー",
    descEn: "Two-storey wooden cat enclosure with a ramp between levels and a hinged roof panel for access. Smaller footprint than a walk-in catio, aimed at a balcony or a patio corner.",
    descJa: "2階建ての木製キャットエンクロージャー。階層間はスロープ、屋根は開閉式で手が入る。ウォークイン型より設置面積が小さく、ベランダやテラスの一角向け。",
    priceMin: "$180", priceMax: "$300", category: "pets", badge: "🏡",
    url: "https://www.amazon.com/s?k=Petsfit+Outdoor+Cat+Enclosure",
  },
  {
    id: "pawhut-wooden-catio",
    nameEn: "PawHut Wooden Catio",
    nameJa: "PawHut 木製キャティオ",
    descEn: "Wire-and-fir catio in a tall, narrow format with several shelves stacked vertically. The vertical layout gives more usable cat space per square foot of ground than a low run.",
    descJa: "金網とモミ材による縦長のキャティオ。棚が垂直方向に複数段。低い走り回り型より、設置面積あたりの猫が使える空間が広い。",
    priceMin: "$150", priceMax: "$280", category: "pets", badge: "💰",
    url: "https://www.amazon.com/s?k=PawHut+Wooden+Catio",
  },
  {
    id: "kitty-city-outdoor-cat-run",
    nameEn: "Kitty City Outdoor Cat Run",
    nameJa: "Kitty City 屋外キャットラン",
    descEn: "Soft-sided modular tunnel-and-cube system that clips together. Not a permanent structure — it packs down, which makes it the option for renters and for travel rather than for year-round outdoor housing.",
    descJa: "布製のトンネルとキューブを連結するモジュール式。恒久的な構造物ではなく畳めるので、賃貸住まいや旅行向け。通年の屋外飼育用ではない。",
    priceMin: "$70", priceMax: "$140", category: "pets", badge: "🎒",
    url: "https://www.amazon.com/s?k=Kitty+City+Outdoor+Cat+Run",
  },
  {
    id: "trixie-natura-cat-home-with-terrace",
    nameEn: "Trixie Natura Cat Home with Terrace",
    nameJa: "Trixie Natura キャットホーム テラス付き",
    descEn: "Insulated pine cat house with a covered terrace and a raised floor. Built as weather shelter first and enclosure second — the run area is small, so it suits a cat that already has a fenced garden.",
    descJa: "断熱材入りの松材キャットハウス。屋根付きテラスと高床構造。囲いというより第一に雨風のシェルターで、走り回る面積は狭い。既に囲いのある庭がある場合向け。",
    priceMin: "$200", priceMax: "$350", category: "pets", badge: "❄️",
    url: "https://www.amazon.com/s?k=Trixie+Natura+Cat+Home+with+Terrace",
  },

  // --- best-electric-fireplace-2026 ---
  {
    id: "dimplex-revillusion-rbf30",
    nameEn: "Dimplex Revillusion RBF30",
    nameJa: "Dimplex Revillusion RBF30",
    descEn: "Built-in electric firebox using Dimplex's mirror-free flame system, so the flame reads as three-dimensional from an angle rather than only head-on. Includes a resin log set and a fan-forced heater.",
    descJa: "ミラーを使わない炎表現方式を採用したビルトイン型電気暖炉。正面からだけでなく斜めから見ても炎が立体的に見える。樹脂製の薪セットとファン式ヒーターを内蔵。",
    priceMin: "$900", priceMax: "$1,400", category: "home", badge: "🏆",
    url: "https://www.amazon.com/s?k=Dimplex+Revillusion+RBF30",
  },
  {
    id: "touchstone-sideline-50",
    nameEn: "Touchstone Sideline 50",
    nameJa: "Touchstone Sideline 50",
    descEn: "Recessed or wall-mounted linear electric fireplace, 50 inches, with a crystal and log media option and multiple flame colours. Hardwire or plug-in; the heater can be run independently of the flame.",
    descJa: "埋め込みまたは壁掛けのリニア型電気暖炉、50インチ。クリスタル/薪の演出を選択でき炎色も複数。直結・コンセントどちらも可で、ヒーターは炎表示と独立して運転できる。",
    priceMin: "$600", priceMax: "$900", category: "home", badge: "🖼️",
    url: "https://www.amazon.com/s?k=Touchstone+Sideline+50+electric+fireplace",
  },
  {
    id: "duraflame-dfi-5010",
    nameEn: "Duraflame DFI-5010 Infrared Quartz Stove",
    nameJa: "Duraflame DFI-5010 赤外線クオーツストーブ",
    descEn: "Freestanding stove-style heater with an infrared quartz element rather than a conventional fan coil. Portable, needs no installation, and the metal body itself gets warm — worth knowing if there are small children.",
    descJa: "据え置き型のストーブ調ヒーター。一般的なファンコイルではなく赤外線クオーツ式。設置工事不要で移動可能。金属外装自体が温まるので、小さな子どもがいる場合は要注意。",
    priceMin: "$180", priceMax: "$300", category: "home", badge: "🔥",
    url: "https://www.amazon.com/s?k=Duraflame+DFI-5010+infrared+quartz+stove",
  },
  {
    id: "puraflame-western-insert",
    nameEn: "PuraFlame Western Electric Fireplace Insert",
    nameJa: "PuraFlame Western 電気暖炉インサート",
    descEn: "Insert designed to drop into an existing masonry fireplace opening, with a glass front and a log set. The cheapest honest route to converting a dead chimney into a working heat source.",
    descJa: "既存の暖炉の開口部に落とし込むインサート型。ガラス前面と薪セット付き。使われていない煙突を暖房として使えるようにする、最も安価で現実的な方法。",
    priceMin: "$300", priceMax: "$500", category: "home", badge: "💰",
    url: "https://www.amazon.com/s?k=PuraFlame+Western+Electric+Fireplace+Insert",
  },
  {
    id: "rwflame-50-inch-electric-fireplace",
    nameEn: "R.W.FLAME 50 inch Electric Fireplace",
    nameJa: "R.W.FLAME 50インチ 電気暖炉",
    descEn: "Budget 50-inch recessed linear unit with adjustable flame colour and brightness and a remote. Same format as the premium linears at roughly half the price; the compromise is in trim finish and flame realism.",
    descJa: "50インチの廉価なリニア埋め込み型。炎の色と明るさを調整可能でリモコン付き。高価格帯のリニア型と同じ形式で価格は約半分、妥協点は枠の仕上げと炎のリアリティ。",
    priceMin: "$250", priceMax: "$400", category: "home", badge: "💵",
    url: "https://www.amazon.com/s?k=R.W.FLAME+50+inch+electric+fireplace",
  },

  // --- best-evaporative-cooler-2026 ---
  {
    id: "hessaire-mc37m",
    nameEn: "Hessaire MC37M",
    nameJa: "Hessaire MC37M",
    descEn: "Portable evaporative cooler with a 10.3-gallon tank and a rated 3,100 CFM, on castors with a garden-hose fill connection. Sized for a garage, workshop or covered patio rather than a sealed room.",
    descJa: "タンク容量約39L、公称風量3,100CFMの可搬式気化式冷風機。キャスター付きで散水ホース直結の給水口あり。密閉した室内ではなくガレージ・作業場・屋根付きテラス向け。",
    priceMin: "$250", priceMax: "$400", category: "home", badge: "🏆",
    url: "https://www.amazon.com/s?k=Hessaire+MC37M+evaporative+cooler",
  },
  {
    id: "hessaire-mc61m",
    nameEn: "Hessaire MC61M",
    nameJa: "Hessaire MC61M",
    descEn: "The larger Hessaire, rated 5,300 CFM with a 20.6-gallon tank. Same design language as the MC37M, aimed at open shop floors and outdoor events where the air is being exchanged continuously.",
    descJa: "Hessaire の大型機。公称5,300CFM、タンク約78L。MC37M と同じ設計思想で、空気が常に入れ替わる広い作業場や屋外イベント向け。",
    priceMin: "$400", priceMax: "$600", category: "home", badge: "🏭",
    url: "https://www.amazon.com/s?k=Hessaire+MC61M+evaporative+cooler",
  },
  {
    id: "honeywell-co60pm",
    nameEn: "Honeywell CO60PM",
    nameJa: "Honeywell CO60PM",
    descEn: "Indoor-oriented evaporative cooler with a 15.8-gallon tank, oscillating louvres and a remote. Quieter and better finished than the shop-grade units, and correspondingly less powerful.",
    descJa: "室内向けの気化式冷風機。タンク約60L、ルーバー首振り、リモコン付き。作業場向けの機種より静かで仕上げも良い代わりに、能力は低い。",
    priceMin: "$280", priceMax: "$420", category: "home", badge: "🏠",
    url: "https://www.amazon.com/s?k=Honeywell+CO60PM+evaporative+cooler",
  },
  {
    id: "newair-af-1000w",
    nameEn: "NewAir AF-1000W",
    nameJa: "NewAir AF-1000W",
    descEn: "Compact tower-format evaporative cooler for a single room, with a small tank and an ice compartment. The smallest realistic unit here and the one most likely to disappoint if bought for a hot garage.",
    descJa: "1部屋向けのコンパクトなタワー型。タンクは小さく、氷を入れる区画あり。この中で最も小型で、暑いガレージ用に買うと最も期待外れになりやすい機種。",
    priceMin: "$150", priceMax: "$250", category: "home", badge: "💵",
    url: "https://www.amazon.com/s?k=NewAir+AF-1000W+evaporative+cooler",
  },
  {
    id: "portacool-cyclone-130",
    nameEn: "Portacool Cyclone 130",
    nameJa: "Portacool Cyclone 130",
    descEn: "Commercial-grade evaporative cooler built around Portacool's thicker Kuul media pad. Heavier and more expensive than the consumer units; the pad is the reason, and it is also the part that wears.",
    descJa: "業務用の気化式冷風機。Portacool の厚い Kuul メディアパッドが中核。民生機より重く高価だが、その理由がこのパッドであり、消耗するのもこのパッド。",
    priceMin: "$450", priceMax: "$700", category: "home", badge: "🛠️",
    url: "https://www.amazon.com/s?k=Portacool+Cyclone+130",
  },

  // --- best-bidet-toilet-seat-2026 ---
  {
    id: "toto-washlet-s550e",
    nameEn: "TOTO Washlet S550e",
    nameJa: "TOTO ウォシュレット S550e",
    descEn: "TOTO's flagship seat: instant (tankless) heating, automatic lid, air deodoriser, warm-air dryer and the EWATER+ misting system. Requires a GFCI outlet within reach of the toilet.",
    descJa: "TOTO の最上位モデル。瞬間式(タンクレス)加温、自動開閉フタ、脱臭、温風乾燥、きれい除菌水を搭載。トイレ付近に漏電遮断付きコンセントが必要。",
    priceMin: "$1,000", priceMax: "$1,600", category: "home", badge: "🏆",
    url: "https://www.amazon.com/s?k=TOTO+Washlet+S550e",
  },
  {
    id: "bio-bidet-bb-2000-bliss",
    nameEn: "Bio Bidet BB-2000 Bliss",
    nameJa: "Bio Bidet BB-2000 Bliss",
    descEn: "Tankless heated seat with a three-in-one stainless nozzle, oscillating and pulsating wash modes and a wireless remote. The usual alternative to a Washlet at a substantially lower price.",
    descJa: "タンクレス式の暖房便座。ステンレス製3in1ノズル、ムーブ・リズム洗浄、ワイヤレスリモコン。ウォシュレットの代替として定番で、価格は大幅に安い。",
    priceMin: "$500", priceMax: "$800", category: "home", badge: "🥈",
    url: "https://www.amazon.com/s?k=Bio+Bidet+BB-2000+Bliss",
  },
  {
    id: "brondell-swash-1400",
    nameEn: "Brondell Swash 1400",
    nameJa: "Brondell Swash 1400",
    descEn: "Tankless seat with dual stainless nozzles and a stated focus on a quieter, warmer seat. Positioned between the budget seats and the Washlet, without the automatic lid.",
    descJa: "タンクレス式、ステンレス製ダブルノズル。静音性と便座の暖かさを重視した設計。廉価機とウォシュレットの中間の位置付けで、自動開閉フタは非搭載。",
    priceMin: "$450", priceMax: "$700", category: "home", badge: "🔇",
    url: "https://www.amazon.com/s?k=Brondell+Swash+1400",
  },
  {
    id: "kohler-purewash-e930",
    nameEn: "Kohler PureWash E930",
    nameJa: "Kohler PureWash E930",
    descEn: "Heated seat with a UV-cleaned nozzle and a self-cleaning wand cycle. Kohler's fit tolerances are tight to their own bowls, which is worth checking before ordering for a non-Kohler toilet.",
    descJa: "UV でノズルを除菌する暖房便座、ノズル自動洗浄機能付き。Kohler は自社便器に合わせた寸法設計なので、他社便器に付ける場合は事前確認が必要。",
    priceMin: "$500", priceMax: "$750", category: "home", badge: "🧼",
    url: "https://www.amazon.com/s?k=Kohler+PureWash+E930",
  },
  {
    id: "tushy-classic-3-0",
    nameEn: "TUSHY Classic 3.0",
    nameJa: "TUSHY Classic 3.0",
    descEn: "Non-electric bidet attachment that clamps under the existing seat and taps the toilet's fill line. No outlet, no heated seat, no dryer — it does the one function and nothing else.",
    descJa: "電源不要のシャワー機能後付けユニット。既存の便座下に挟み込み、便器の給水管から分岐する。コンセント不要・便座暖房なし・乾燥なしで、洗浄機能だけに絞った製品。",
    priceMin: "$80", priceMax: "$150", category: "home", badge: "💵",
    url: "https://www.amazon.com/s?k=TUSHY+Classic+3.0+bidet",
  },

  // --- best-hack-squat-machine-2026 ---
  {
    id: "body-solid-glph1100",
    nameEn: "Body-Solid GLPH1100",
    nameJa: "Body-Solid GLPH1100",
    descEn: "Plate-loaded combination leg press and hack squat on one frame, with a 2x3-inch 11-gauge steel mainframe. Converting between the two movements means moving the back pad and the footplate, not rebuilding the machine.",
    descJa: "1つのフレームでレッグプレスとハックスクワットを兼ねるプレートロード式。11ゲージ・2×3インチ角鋼のメインフレーム。2種目の切替は背もたれとフットプレートの移動だけで済み、組み直しは不要。",
    priceMin: "$1,300", priceMax: "$1,900", category: "fitness", badge: "🏆",
    url: "https://www.amazon.com/s?k=Body-Solid+GLPH1100+leg+press+hack+squat",
  },
  {
    id: "titan-fitness-plate-loaded-hack-squat",
    nameEn: "Titan Fitness Plate-Loaded Hack Squat",
    nameJa: "Titan Fitness プレートロード式ハックスクワット",
    descEn: "Dedicated hack squat sled with a fixed carriage angle, linear bearings and multiple safety catch positions. No leg press conversion, which is why it costs less and takes less floor space than a combo unit.",
    descJa: "ハックスクワット専用のスレッド。キャリッジ角度は固定、リニアベアリング、セーフティ位置は複数段。レッグプレス兼用ではないぶん、コンボ機より安く設置面積も小さい。",
    priceMin: "$800", priceMax: "$1,200", category: "fitness", badge: "💰",
    url: "https://www.amazon.com/s?k=Titan+Fitness+plate+loaded+hack+squat",
  },
  {
    id: "powertec-compact-leg-sled",
    nameEn: "Powertec Compact Leg Sled",
    nameJa: "Powertec コンパクトレッグスレッド",
    descEn: "Short-footprint sled that runs both hack squat and leg press patterns in a frame designed to fit a garage bay. The trade is range of travel — the carriage path is shorter than on a full-size machine.",
    descJa: "設置面積の小さいスレッド。ガレージ1台分に収まる寸法で、ハックスクワットとレッグプレスの両方の動作に対応。代償は可動域で、キャリッジの移動距離はフルサイズ機より短い。",
    priceMin: "$1,100", priceMax: "$1,600", category: "fitness", badge: "📐",
    url: "https://www.amazon.com/s?k=Powertec+Compact+Leg+Sled",
  },
  {
    id: "valor-fitness-cc-10",
    nameEn: "Valor Fitness CC-10",
    nameJa: "Valor Fitness CC-10",
    descEn: "Hack squat and deadlift shrug frame in one, with the carriage running on the outside of the uprights so the bar path clears the body. Lighter-gauge steel than the Body-Solid, and priced accordingly.",
    descJa: "ハックスクワットとデッドリフト/シュラッグを兼ねるフレーム。キャリッジが支柱の外側を通るのでバー軌道が身体と干渉しない。鋼材は Body-Solid より薄く、価格もそれに応じて安い。",
    priceMin: "$600", priceMax: "$950", category: "fitness", badge: "🔁",
    url: "https://www.amazon.com/s?k=Valor+Fitness+CC-10+hack+squat",
  },
  {
    id: "tds-premier-hack-squat",
    nameEn: "TDS Premier Hack Squat",
    nameJa: "TDS Premier ハックスクワット",
    descEn: "Commercial-pattern hack squat with a wide, deeply knurled footplate and heavy-gauge uprights. Built for a gym floor rather than a spare room — check ceiling height and door width before ordering.",
    descJa: "業務用設計のハックスクワット。広く深いローレット加工のフットプレートと厚肉の支柱。空き部屋ではなくジム床向けの寸法なので、天井高と扉幅を発注前に確認すること。",
    priceMin: "$1,400", priceMax: "$2,200", category: "fitness", badge: "🏋️",
    url: "https://www.amazon.com/s?k=TDS+Premier+hack+squat+machine",
  },
];

/**
 * 15ロケール分の {title, description, lede}。
 * ★共通ヘルパ buildTranslations は使わない（「N日間テストした」を全言語に入れてしまう）。
 */
function tr(
  title: Record<string, string>,
  description: Record<string, string>,
  lede: Record<string, string>,
): ArticleDef["translations"] {
  const locales = ["zh-CN", "zh-TW", "ko", "es", "pt-BR", "fr", "de", "it", "ru", "ar", "hi", "id", "th", "vi", "tr"] as const;
  const out = {} as Record<string, Translation>;
  for (const l of locales) out[l] = { title: title[l], description: description[l], lede: lede[l] };
  return out as ArticleDef["translations"];
}

const CATIO_TR = tr(
  {
    "zh-CN": "2026年最佳猫笼阳台（Catio）：5款对比",
    "zh-TW": "2026年最佳貓咪外出籠（Catio）：5款比較",
    ko: "2026 최고의 캣티오(고양이 야외 울타리): 5종 비교",
    es: "Mejor catio 2026: 5 recintos para gatos comparados",
    "pt-BR": "Melhor catio 2026: 5 recintos para gatos comparados",
    fr: "Meilleur catio 2026 : 5 enclos pour chats comparés",
    de: "Bestes Catio 2026: 5 Katzengehege im Vergleich",
    it: "Miglior catio 2026: 5 recinti per gatti a confronto",
    ru: "Лучший катио 2026: сравнение 5 вольеров для кошек",
    ar: "أفضل كاتيو 2026: مقارنة 5 أقفاص خارجية للقطط",
    hi: "2026 का सर्वश्रेष्ठ कैटियो: 5 बिल्ली बाड़ों की तुलना",
    id: "Catio Terbaik 2026: Perbandingan 5 Kandang Kucing",
    th: "Catio ที่ดีที่สุด 2026: เปรียบเทียบ 5 รุ่น",
    vi: "Catio tốt nhất 2026: So sánh 5 chuồng mèo ngoài trời",
    tr: "En İyi Catio 2026: 5 Kedi Kafesi Karşılaştırması",
  },
  {
    "zh-CN": "Aivituvin、Petsfit、PawHut、Kitty City、Trixie 五款对比。重点是逃脱防护、屋顶排水与垂直空间——决定猫是否真的会用的三件事。",
    "zh-TW": "Aivituvin、Petsfit、PawHut、Kitty City、Trixie 五款比較。重點在防脫逃、屋頂排水與垂直空間——決定貓是否真的會用的三件事。",
    ko: "Aivituvin, Petsfit, PawHut, Kitty City, Trixie 5종 비교. 탈출 방지, 지붕 배수, 수직 공간 — 고양이가 실제로 사용할지를 결정하는 세 가지를 중심으로 정리했습니다.",
    es: "Aivituvin, Petsfit, PawHut, Kitty City y Trixie comparados en seguridad antifugas, drenaje del techo y espacio vertical: lo que decide si el gato lo usa.",
    "pt-BR": "Aivituvin, Petsfit, PawHut, Kitty City e Trixie comparados em segurança contra fugas, drenagem do teto e espaço vertical — o que decide se o gato usa.",
    fr: "Aivituvin, Petsfit, PawHut, Kitty City et Trixie comparés sur l'anti-évasion, l'écoulement du toit et l'espace vertical — ce qui décide si le chat s'en sert.",
    de: "Aivituvin, Petsfit, PawHut, Kitty City und Trixie im Vergleich: Ausbruchsicherheit, Dachentwässerung und vertikaler Raum — was entscheidet, ob die Katze es nutzt.",
    it: "Aivituvin, Petsfit, PawHut, Kitty City e Trixie a confronto su antifuga, drenaggio del tetto e spazio verticale — ciò che decide se il gatto lo usa.",
    ru: "Aivituvin, Petsfit, PawHut, Kitty City и Trixie: защита от побега, водоотвод крыши и вертикальное пространство — от чего зависит, будет ли кошка им пользоваться.",
    ar: "مقارنة بين Aivituvin وPetsfit وPawHut وKitty City وTrixie من حيث منع الهروب وتصريف السقف والمساحة الرأسية.",
    hi: "Aivituvin, Petsfit, PawHut, Kitty City और Trixie की तुलना — भागने से सुरक्षा, छत की निकासी और ऊर्ध्वाधर जगह।",
    id: "Aivituvin, Petsfit, PawHut, Kitty City, dan Trixie dibandingkan dari sisi anti-kabur, drainase atap, dan ruang vertikal.",
    th: "เปรียบเทียบ Aivituvin, Petsfit, PawHut, Kitty City และ Trixie ในเรื่องกันหนี การระบายน้ำหลังคา และพื้นที่แนวตั้ง",
    vi: "So sánh Aivituvin, Petsfit, PawHut, Kitty City và Trixie về chống thoát, thoát nước mái và không gian theo chiều dọc.",
    tr: "Aivituvin, Petsfit, PawHut, Kitty City ve Trixie; kaçış güvenliği, çatı drenajı ve dikey alan açısından karşılaştırıldı.",
  },
  {
    "zh-CN": "猫笼阳台失败的原因几乎从不是尺寸，而是三点：缝隙、积水的屋顶，以及只有水平面没有高度。",
    "zh-TW": "貓咪外出籠失敗的原因幾乎從不是尺寸，而是三點：縫隙、積水的屋頂，以及只有水平面沒有高度。",
    ko: "캣티오가 실패하는 이유는 거의 크기가 아닙니다. 틈새, 물이 고이는 지붕, 그리고 높이 없이 바닥만 있는 구조 — 이 세 가지입니다.",
    es: "Un catio casi nunca falla por el tamaño. Falla por tres cosas: huecos, un techo que acumula agua y un diseño con superficie pero sin altura.",
    "pt-BR": "Um catio quase nunca falha pelo tamanho. Falha por três coisas: frestas, um teto que acumula água e um projeto com área mas sem altura.",
    fr: "Un catio échoue rarement à cause de sa taille. Il échoue pour trois raisons : les interstices, un toit qui retient l'eau, et une surface sans hauteur.",
    de: "Ein Catio scheitert fast nie an der Größe. Es scheitert an drei Dingen: Spalten, einem Dach, auf dem Wasser steht, und Fläche ohne Höhe.",
    it: "Un catio quasi mai fallisce per le dimensioni. Fallisce per tre cose: le fessure, un tetto che trattiene l'acqua e superficie senza altezza.",
    ru: "Катио почти никогда не подводит из-за размера. Подводят три вещи: щели, крыша, на которой стоит вода, и площадь без высоты.",
    ar: "نادراً ما يفشل الكاتيو بسبب الحجم. يفشل لثلاثة أسباب: الفجوات، سقف يحتجز الماء، ومساحة بلا ارتفاع.",
    hi: "कैटियो लगभग कभी आकार की वजह से विफल नहीं होता। तीन वजहें होती हैं: दरारें, पानी रोकने वाली छत, और ऊँचाई के बिना सिर्फ़ ज़मीन।",
    id: "Catio hampir tidak pernah gagal karena ukuran. Gagalnya karena tiga hal: celah, atap yang menahan air, dan luas tanpa ketinggian.",
    th: "Catio แทบไม่เคยล้มเหลวเพราะขนาด แต่ล้มเหลวเพราะสามอย่าง: ช่องโหว่ หลังคาที่ขังน้ำ และพื้นที่ที่ไม่มีความสูง",
    vi: "Catio hầu như không bao giờ hỏng vì kích thước. Nó hỏng vì ba thứ: khe hở, mái đọng nước, và diện tích mà không có chiều cao.",
    tr: "Bir catio neredeyse hiçbir zaman boyut yüzünden başarısız olmaz. Üç şey yüzünden olur: boşluklar, su tutan bir çatı ve yüksekliği olmayan alan.",
  },
);

const FIREPLACE_TR = tr(
  {
    "zh-CN": "2026年最佳电壁炉：5款对比（嵌入式与独立式）",
    "zh-TW": "2026年最佳電壁爐：5款比較（嵌入式與獨立式）",
    ko: "2026 최고의 전기 벽난로: 5종 비교 (매립형 vs 스탠드형)",
    es: "Mejor chimenea eléctrica 2026: 5 modelos comparados",
    "pt-BR": "Melhor lareira elétrica 2026: 5 modelos comparados",
    fr: "Meilleure cheminée électrique 2026 : 5 modèles comparés",
    de: "Bester Elektrokamin 2026: 5 Modelle im Vergleich",
    it: "Miglior camino elettrico 2026: 5 modelli a confronto",
    ru: "Лучший электрокамин 2026: сравнение 5 моделей",
    ar: "أفضل مدفأة كهربائية 2026: مقارنة 5 موديلات",
    hi: "2026 का सर्वश्रेष्ठ इलेक्ट्रिक फायरप्लेस: 5 मॉडल की तुलना",
    id: "Perapian Listrik Terbaik 2026: Perbandingan 5 Model",
    th: "เตาผิงไฟฟ้าที่ดีที่สุด 2026: เปรียบเทียบ 5 รุ่น",
    vi: "Lò sưởi điện tốt nhất 2026: So sánh 5 mẫu",
    tr: "En İyi Elektrikli Şömine 2026: 5 Model Karşılaştırması",
  },
  {
    "zh-CN": "Dimplex Revillusion、Touchstone Sideline 50、Duraflame DFI-5010、PuraFlame Western、R.W.FLAME 对比。为何 1,500W 是所有插电机型的共同上限。",
    "zh-TW": "Dimplex Revillusion、Touchstone Sideline 50、Duraflame DFI-5010、PuraFlame Western、R.W.FLAME 比較。為何 1,500W 是所有插電機型的共同上限。",
    ko: "Dimplex Revillusion, Touchstone Sideline 50, Duraflame DFI-5010, PuraFlame Western, R.W.FLAME 비교. 콘센트형 제품이 모두 1,500W에서 멈추는 이유도 설명합니다.",
    es: "Dimplex Revillusion, Touchstone Sideline 50, Duraflame DFI-5010, PuraFlame Western y R.W.FLAME comparados, y por qué todos los modelos enchufables se detienen en 1.500 W.",
    "pt-BR": "Dimplex Revillusion, Touchstone Sideline 50, Duraflame DFI-5010, PuraFlame Western e R.W.FLAME comparados, e por que todo modelo de tomada para em 1.500 W.",
    fr: "Dimplex Revillusion, Touchstone Sideline 50, Duraflame DFI-5010, PuraFlame Western et R.W.FLAME comparés, et pourquoi tous les modèles sur prise plafonnent à 1 500 W.",
    de: "Dimplex Revillusion, Touchstone Sideline 50, Duraflame DFI-5010, PuraFlame Western und R.W.FLAME im Vergleich — und warum jedes Steckdosenmodell bei 1.500 W endet.",
    it: "Dimplex Revillusion, Touchstone Sideline 50, Duraflame DFI-5010, PuraFlame Western e R.W.FLAME a confronto, e perché ogni modello a spina si ferma a 1.500 W.",
    ru: "Dimplex Revillusion, Touchstone Sideline 50, Duraflame DFI-5010, PuraFlame Western и R.W.FLAME в сравнении, и почему все розеточные модели упираются в 1 500 Вт.",
    ar: "مقارنة بين Dimplex Revillusion وTouchstone Sideline 50 وDuraflame DFI-5010 وPuraFlame Western وR.W.FLAME، ولماذا تتوقف كل الموديلات القابسة عند 1500 واط.",
    hi: "Dimplex Revillusion, Touchstone Sideline 50, Duraflame DFI-5010, PuraFlame Western और R.W.FLAME की तुलना — और हर प्लग-इन मॉडल 1,500W पर क्यों रुकता है।",
    id: "Dimplex Revillusion, Touchstone Sideline 50, Duraflame DFI-5010, PuraFlame Western, dan R.W.FLAME dibandingkan, serta alasan semua model colokan berhenti di 1.500 W.",
    th: "เปรียบเทียบ Dimplex Revillusion, Touchstone Sideline 50, Duraflame DFI-5010, PuraFlame Western และ R.W.FLAME พร้อมเหตุผลที่รุ่นเสียบปลั๊กทุกตัวหยุดที่ 1,500W",
    vi: "So sánh Dimplex Revillusion, Touchstone Sideline 50, Duraflame DFI-5010, PuraFlame Western và R.W.FLAME, cùng lý do mọi mẫu cắm điện đều dừng ở 1.500W.",
    tr: "Dimplex Revillusion, Touchstone Sideline 50, Duraflame DFI-5010, PuraFlame Western ve R.W.FLAME karşılaştırıldı — ve neden her prizli model 1.500 W'ta duruyor.",
  },
  {
    "zh-CN": "所有插电式电壁炉的发热量都一样。价格差异买到的是外观，不是暖度——先接受这一点，选择就简单了。",
    "zh-TW": "所有插電式電壁爐的發熱量都一樣。價格差異買到的是外觀，不是暖度——先接受這一點，選擇就簡單了。",
    ko: "콘센트에 꽂는 전기 벽난로는 발열량이 전부 같습니다. 가격 차이로 사는 것은 온기가 아니라 겉모습입니다. 이것만 받아들이면 선택은 단순해집니다.",
    es: "Todas las chimeneas eléctricas enchufables calientan lo mismo. La diferencia de precio compra apariencia, no calor. Acepta eso y la elección se simplifica.",
    "pt-BR": "Todas as lareiras elétricas de tomada aquecem igual. A diferença de preço compra aparência, não calor. Aceite isso e a escolha fica simples.",
    fr: "Toutes les cheminées électriques sur prise chauffent pareil. L'écart de prix achète l'apparence, pas la chaleur. Acceptez-le et le choix devient simple.",
    de: "Alle Elektrokamine mit Stecker heizen gleich. Der Preisunterschied kauft Aussehen, nicht Wärme. Wer das akzeptiert, hat die Wahl schnell getroffen.",
    it: "Tutti i camini elettrici a spina scaldano allo stesso modo. La differenza di prezzo compra l'aspetto, non il calore. Accettato questo, la scelta si semplifica.",
    ru: "Все электрокамины, работающие от розетки, греют одинаково. Разница в цене покупает внешний вид, а не тепло. Примите это — и выбор станет простым.",
    ar: "كل المدافئ الكهربائية التي تعمل بالقابس تعطي التدفئة نفسها. فرق السعر يشتري المظهر لا الدفء. تقبّل ذلك، ويصبح الاختيار بسيطاً.",
    hi: "प्लग से चलने वाले सभी इलेक्ट्रिक फायरप्लेस बराबर गर्मी देते हैं। कीमत का अंतर दिखावट खरीदता है, गर्मी नहीं। यह मान लें तो चुनाव आसान है।",
    id: "Semua perapian listrik berkabel colok menghasilkan panas yang sama. Selisih harga membeli tampilan, bukan kehangatan. Terima itu, pilihannya jadi sederhana.",
    th: "เตาผิงไฟฟ้าแบบเสียบปลั๊กทุกตัวให้ความร้อนเท่ากัน ส่วนต่างของราคาซื้อรูปลักษณ์ ไม่ใช่ความอบอุ่น เข้าใจข้อนี้แล้วการเลือกจะง่ายขึ้น",
    vi: "Mọi lò sưởi điện cắm ổ đều toả nhiệt như nhau. Chênh lệch giá mua vẻ ngoài, không phải hơi ấm. Chấp nhận điều đó thì việc chọn trở nên đơn giản.",
    tr: "Prize takılan tüm elektrikli şömineler aynı ısıyı verir. Fiyat farkı görünüm satın alır, sıcaklık değil. Bunu kabul edince seçim basitleşir.",
  },
);

const SWAMP_TR = tr(
  {
    "zh-CN": "2026年最佳蒸发式冷风机：5款对比",
    "zh-TW": "2026年最佳水冷扇（蒸發式）：5款比較",
    ko: "2026 최고의 증발식 냉풍기: 5종 비교",
    es: "Mejor climatizador evaporativo 2026: 5 modelos comparados",
    "pt-BR": "Melhor climatizador evaporativo 2026: 5 modelos comparados",
    fr: "Meilleur rafraîchisseur d'air 2026 : 5 modèles comparés",
    de: "Bester Luftkühler 2026: 5 Verdunstungskühler im Vergleich",
    it: "Miglior raffrescatore evaporativo 2026: 5 modelli a confronto",
    ru: "Лучший испарительный охладитель 2026: сравнение 5 моделей",
    ar: "أفضل مبرد هواء تبخيري 2026: مقارنة 5 موديلات",
    hi: "2026 का सर्वश्रेष्ठ एयर कूलर: 5 मॉडल की तुलना",
    id: "Air Cooler Terbaik 2026: Perbandingan 5 Model",
    th: "พัดลมไอเย็นที่ดีที่สุด 2026: เปรียบเทียบ 5 รุ่น",
    vi: "Máy làm mát hơi nước tốt nhất 2026: So sánh 5 mẫu",
    tr: "En İyi Buharlaşmalı Soğutucu 2026: 5 Model Karşılaştırması",
  },
  {
    "zh-CN": "Hessaire MC37M/MC61M、Honeywell CO60PM、NewAir AF-1000W、Portacool Cyclone 130 对比。先看湿度：湿度决定这类机器有没有用。",
    "zh-TW": "Hessaire MC37M/MC61M、Honeywell CO60PM、NewAir AF-1000W、Portacool Cyclone 130 比較。先看濕度：濕度決定這類機器有沒有用。",
    ko: "Hessaire MC37M/MC61M, Honeywell CO60PM, NewAir AF-1000W, Portacool Cyclone 130 비교. 먼저 습도를 보세요 — 습도가 이 방식의 성패를 결정합니다.",
    es: "Hessaire MC37M/MC61M, Honeywell CO60PM, NewAir AF-1000W y Portacool Cyclone 130 comparados. Empieza por la humedad: decide si esta tecnología sirve.",
    "pt-BR": "Hessaire MC37M/MC61M, Honeywell CO60PM, NewAir AF-1000W e Portacool Cyclone 130 comparados. Comece pela umidade: ela decide se essa tecnologia serve.",
    fr: "Hessaire MC37M/MC61M, Honeywell CO60PM, NewAir AF-1000W et Portacool Cyclone 130 comparés. Commencez par l'humidité : elle décide si la technologie fonctionne.",
    de: "Hessaire MC37M/MC61M, Honeywell CO60PM, NewAir AF-1000W und Portacool Cyclone 130 im Vergleich. Zuerst die Luftfeuchte — sie entscheidet, ob das Prinzip überhaupt trägt.",
    it: "Hessaire MC37M/MC61M, Honeywell CO60PM, NewAir AF-1000W e Portacool Cyclone 130 a confronto. Parti dall'umidità: decide se la tecnologia funziona.",
    ru: "Hessaire MC37M/MC61M, Honeywell CO60PM, NewAir AF-1000W и Portacool Cyclone 130 в сравнении. Начните с влажности — она решает, работает ли этот принцип.",
    ar: "مقارنة بين Hessaire MC37M/MC61M وHoneywell CO60PM وNewAir AF-1000W وPortacool Cyclone 130. ابدأ من الرطوبة: هي التي تحدد جدوى هذه التقنية.",
    hi: "Hessaire MC37M/MC61M, Honeywell CO60PM, NewAir AF-1000W और Portacool Cyclone 130 की तुलना। पहले नमी देखें — वही तय करती है कि यह तकनीक काम करेगी या नहीं।",
    id: "Hessaire MC37M/MC61M, Honeywell CO60PM, NewAir AF-1000W, dan Portacool Cyclone 130 dibandingkan. Mulai dari kelembapan: itu penentu teknologi ini berguna atau tidak.",
    th: "เปรียบเทียบ Hessaire MC37M/MC61M, Honeywell CO60PM, NewAir AF-1000W และ Portacool Cyclone 130 เริ่มจากความชื้น เพราะความชื้นตัดสินว่าเทคโนโลยีนี้ใช้ได้หรือไม่",
    vi: "So sánh Hessaire MC37M/MC61M, Honeywell CO60PM, NewAir AF-1000W và Portacool Cyclone 130. Bắt đầu từ độ ẩm: nó quyết định công nghệ này có dùng được không.",
    tr: "Hessaire MC37M/MC61M, Honeywell CO60PM, NewAir AF-1000W ve Portacool Cyclone 130 karşılaştırıldı. Önce neme bakın: bu teknolojinin işe yarayıp yaramayacağını nem belirler.",
  },
  {
    "zh-CN": "蒸发式冷风机不是空调。它靠蒸发水来降温，因此空气越潮湿，它能做的越少——在关窗的房间里它甚至会让人更难受。",
    "zh-TW": "蒸發式冷風機不是空調。它靠蒸發水來降溫，因此空氣越潮濕，它能做的越少——在關窗的房間裡甚至會讓人更難受。",
    ko: "증발식 냉풍기는 에어컨이 아닙니다. 물을 증발시켜 온도를 낮추므로 공기가 습할수록 할 수 있는 일이 줄어들고, 창문을 닫은 방에서는 오히려 불쾌해집니다.",
    es: "Un climatizador evaporativo no es un aire acondicionado. Enfría evaporando agua, así que cuanto más húmedo está el aire menos puede hacer — y en una habitación cerrada empeora la sensación.",
    "pt-BR": "Um climatizador evaporativo não é ar-condicionado. Ele resfria evaporando água, então quanto mais úmido o ar, menos ele faz — e num cômodo fechado piora a sensação.",
    fr: "Un rafraîchisseur évaporatif n'est pas un climatiseur. Il refroidit en évaporant de l'eau : plus l'air est humide, moins il agit — et dans une pièce fermée, il aggrave la sensation.",
    de: "Ein Verdunstungskühler ist keine Klimaanlage. Er kühlt durch verdunstendes Wasser: je feuchter die Luft, desto weniger bringt er — im geschlossenen Raum verschlechtert er das Empfinden sogar.",
    it: "Un raffrescatore evaporativo non è un condizionatore. Raffredda evaporando acqua: più l'aria è umida, meno può fare — e in una stanza chiusa peggiora la sensazione.",
    ru: "Испарительный охладитель — не кондиционер. Он охлаждает за счёт испарения воды: чем влажнее воздух, тем меньше эффект, а в закрытой комнате становится только хуже.",
    ar: "المبرد التبخيري ليس مكيفاً. يبرّد عبر تبخير الماء، فكلما زادت رطوبة الهواء قلّ أثره — وفي غرفة مغلقة يزيد الإحساس بالضيق.",
    hi: "एयर कूलर एसी नहीं है। यह पानी के वाष्पीकरण से ठंडक देता है, इसलिए हवा जितनी नम होगी उतना कम काम करेगा — और बंद कमरे में यह और असहज कर देता है।",
    id: "Air cooler bukan AC. Ia mendinginkan dengan menguapkan air, jadi makin lembap udaranya makin kecil efeknya — dan di ruangan tertutup malah terasa lebih tidak nyaman.",
    th: "พัดลมไอเย็นไม่ใช่แอร์ มันทำความเย็นด้วยการระเหยน้ำ ยิ่งอากาศชื้นก็ยิ่งทำงานได้น้อย และในห้องปิดจะยิ่งอึดอัดกว่าเดิม",
    vi: "Máy làm mát hơi nước không phải máy lạnh. Nó làm mát bằng cách bay hơi nước, nên không khí càng ẩm thì tác dụng càng ít — và trong phòng kín còn khó chịu hơn.",
    tr: "Buharlaşmalı soğutucu bir klima değildir. Suyu buharlaştırarak serinletir; hava ne kadar nemliyse o kadar az iş görür — kapalı bir odada durumu daha da kötüleştirir.",
  },
);

const BIDET_TR = tr(
  {
    "zh-CN": "2026年最佳智能马桶盖：5款对比（含免电款）",
    "zh-TW": "2026年最佳免治馬桶座：5款比較（含免電款）",
    ko: "2026 최고의 비데 변기 시트: 5종 비교 (비전기식 포함)",
    es: "Mejor asiento de bidé 2026: 5 modelos comparados",
    "pt-BR": "Melhor assento com bidê 2026: 5 modelos comparados",
    fr: "Meilleur abattant japonais 2026 : 5 modèles comparés",
    de: "Bester Dusch-WC-Aufsatz 2026: 5 Modelle im Vergleich",
    it: "Miglior sedile bidet 2026: 5 modelli a confronto",
    ru: "Лучшая крышка-биде 2026: сравнение 5 моделей",
    ar: "أفضل مقعد شطاف 2026: مقارنة 5 موديلات",
    hi: "2026 की सर्वश्रेष्ठ बिडेट टॉयलेट सीट: 5 मॉडल की तुलना",
    id: "Dudukan Toilet Bidet Terbaik 2026: Perbandingan 5 Model",
    th: "ฝารองนั่งชำระที่ดีที่สุด 2026: เปรียบเทียบ 5 รุ่น",
    vi: "Nắp bồn cầu thông minh tốt nhất 2026: So sánh 5 mẫu",
    tr: "En İyi Taharet Klozet Kapağı 2026: 5 Model Karşılaştırması",
  },
  {
    "zh-CN": "TOTO S550e、Bio Bidet BB-2000、Brondell Swash 1400、Kohler PureWash E930、TUSHY Classic 3.0 对比。安装前必须确认的两件事：插座与马桶形状。",
    "zh-TW": "TOTO S550e、Bio Bidet BB-2000、Brondell Swash 1400、Kohler PureWash E930、TUSHY Classic 3.0 比較。安裝前必須確認的兩件事：插座與馬桶形狀。",
    ko: "TOTO S550e, Bio Bidet BB-2000, Brondell Swash 1400, Kohler PureWash E930, TUSHY Classic 3.0 비교. 설치 전 반드시 확인할 두 가지 — 콘센트와 변기 형상.",
    es: "TOTO S550e, Bio Bidet BB-2000, Brondell Swash 1400, Kohler PureWash E930 y TUSHY Classic 3.0 comparados. Dos cosas que confirmar antes de instalar: el enchufe y la forma de la taza.",
    "pt-BR": "TOTO S550e, Bio Bidet BB-2000, Brondell Swash 1400, Kohler PureWash E930 e TUSHY Classic 3.0 comparados. Duas coisas a confirmar antes de instalar: a tomada e o formato do vaso.",
    fr: "TOTO S550e, Bio Bidet BB-2000, Brondell Swash 1400, Kohler PureWash E930 et TUSHY Classic 3.0 comparés. Deux vérifications avant pose : la prise et la forme de la cuvette.",
    de: "TOTO S550e, Bio Bidet BB-2000, Brondell Swash 1400, Kohler PureWash E930 und TUSHY Classic 3.0 im Vergleich. Vorher prüfen: Steckdose und Beckenform.",
    it: "TOTO S550e, Bio Bidet BB-2000, Brondell Swash 1400, Kohler PureWash E930 e TUSHY Classic 3.0 a confronto. Due verifiche prima di installare: presa e forma del vaso.",
    ru: "TOTO S550e, Bio Bidet BB-2000, Brondell Swash 1400, Kohler PureWash E930 и TUSHY Classic 3.0 в сравнении. Перед установкой проверьте две вещи: розетку и форму чаши.",
    ar: "مقارنة بين TOTO S550e وBio Bidet BB-2000 وBrondell Swash 1400 وKohler PureWash E930 وTUSHY Classic 3.0. تحقق قبل التركيب من أمرين: المقبس وشكل المرحاض.",
    hi: "TOTO S550e, Bio Bidet BB-2000, Brondell Swash 1400, Kohler PureWash E930 और TUSHY Classic 3.0 की तुलना। लगाने से पहले दो चीज़ें जाँचें: सॉकेट और सीट का आकार।",
    id: "TOTO S550e, Bio Bidet BB-2000, Brondell Swash 1400, Kohler PureWash E930, dan TUSHY Classic 3.0 dibandingkan. Dua hal yang wajib dicek sebelum pasang: stopkontak dan bentuk kloset.",
    th: "เปรียบเทียบ TOTO S550e, Bio Bidet BB-2000, Brondell Swash 1400, Kohler PureWash E930 และ TUSHY Classic 3.0 สองสิ่งที่ต้องเช็กก่อนติดตั้ง: ปลั๊กไฟและรูปทรงโถ",
    vi: "So sánh TOTO S550e, Bio Bidet BB-2000, Brondell Swash 1400, Kohler PureWash E930 và TUSHY Classic 3.0. Hai thứ phải kiểm tra trước khi lắp: ổ điện và hình dáng bồn cầu.",
    tr: "TOTO S550e, Bio Bidet BB-2000, Brondell Swash 1400, Kohler PureWash E930 ve TUSHY Classic 3.0 karşılaştırıldı. Montajdan önce iki şeyi doğrulayın: priz ve klozet şekli.",
  },
  {
    "zh-CN": "买智能马桶盖时最常见的失败，与喷嘴或水温无关：是马桶旁边没有插座，或马桶形状对不上。",
    "zh-TW": "買免治馬桶座時最常見的失敗，與噴嘴或水溫無關：是馬桶旁邊沒有插座，或馬桶形狀對不上。",
    ko: "비데를 살 때 가장 흔한 실패는 노즐이나 수온과 무관합니다. 변기 옆에 콘센트가 없거나, 변기 형상이 맞지 않는 것입니다.",
    es: "El fallo más común al comprar un asiento de bidé no tiene que ver con la boquilla ni con la temperatura: es que no hay enchufe junto al inodoro, o que la forma no coincide.",
    "pt-BR": "A falha mais comum ao comprar um assento com bidê não tem a ver com o bico nem com a temperatura: é não haver tomada perto do vaso, ou o formato não bater.",
    fr: "L'échec le plus fréquent à l'achat d'un abattant lavant n'a rien à voir avec la buse ni la température : c'est l'absence de prise près des WC, ou une forme de cuvette qui ne correspond pas.",
    de: "Der häufigste Fehlkauf bei Dusch-WC-Aufsätzen hat nichts mit Düse oder Wassertemperatur zu tun: Es fehlt die Steckdose neben dem WC, oder die Beckenform passt nicht.",
    it: "L'errore più comune nell'acquisto di un sedile bidet non riguarda l'ugello né la temperatura: è l'assenza di una presa vicino al water, o una forma del vaso che non combacia.",
    ru: "Самая частая неудача при покупке крышки-биде связана не с форсункой и не с температурой: рядом с унитазом нет розетки или не совпадает форма чаши.",
    ar: "أكثر أسباب الفشل شيوعاً عند شراء مقعد شطاف لا علاقة له بالفوهة ولا بحرارة الماء: عدم وجود مقبس بجوار المرحاض، أو عدم تطابق الشكل.",
    hi: "बिडेट सीट खरीदते समय सबसे आम विफलता नोज़ल या पानी के तापमान से नहीं जुड़ी: टॉयलेट के पास सॉकेट न होना, या सीट का आकार मेल न खाना।",
    id: "Kegagalan paling umum saat membeli dudukan bidet bukan soal nosel atau suhu air: tidak ada stopkontak dekat kloset, atau bentuk klosetnya tidak cocok.",
    th: "ความผิดพลาดที่พบบ่อยที่สุดเวลาซื้อฝารองนั่งชำระ ไม่เกี่ยวกับหัวฉีดหรืออุณหภูมิน้ำ แต่คือไม่มีปลั๊กไฟใกล้โถ หรือรูปทรงโถไม่ตรงกัน",
    vi: "Thất bại phổ biến nhất khi mua nắp bồn cầu thông minh không liên quan đến vòi hay nhiệt độ nước: không có ổ điện gần bồn cầu, hoặc hình dáng bồn không khớp.",
    tr: "Taharet kapağı alırken en sık yapılan hata başlıkla ya da su sıcaklığıyla ilgili değil: klozetin yanında priz olmaması ya da klozet şeklinin uymaması.",
  },
);

const HACK_SQUAT_TR = tr(
  {
    "zh-CN": "2026年最佳哈克深蹲机：5款对比",
    "zh-TW": "2026年最佳哈克深蹲機：5款比較",
    ko: "2026 최고의 핵 스쿼트 머신: 5종 비교",
    es: "Mejor máquina de hack squat 2026: 5 modelos comparados",
    "pt-BR": "Melhor máquina de hack squat 2026: 5 modelos comparados",
    fr: "Meilleure machine à hack squat 2026 : 5 modèles comparés",
    de: "Beste Hackenschmidt-Maschine 2026: 5 Modelle im Vergleich",
    it: "Miglior macchina hack squat 2026: 5 modelli a confronto",
    ru: "Лучший гакк-тренажёр 2026: сравнение 5 моделей",
    ar: "أفضل جهاز هاك سكوات 2026: مقارنة 5 موديلات",
    hi: "2026 की सर्वश्रेष्ठ हैक स्क्वाट मशीन: 5 मॉडल की तुलना",
    id: "Mesin Hack Squat Terbaik 2026: Perbandingan 5 Model",
    th: "เครื่องแฮ็คสควอทที่ดีที่สุด 2026: เปรียบเทียบ 5 รุ่น",
    vi: "Máy hack squat tốt nhất 2026: So sánh 5 mẫu",
    tr: "En İyi Hack Squat Makinesi 2026: 5 Model Karşılaştırması",
  },
  {
    "zh-CN": "Body-Solid GLPH1100、Titan、Powertec、Valor CC-10、TDS Premier 对比。滑轨角度、踏板位置与占地面积——这三项决定它是否装得进你的空间。",
    "zh-TW": "Body-Solid GLPH1100、Titan、Powertec、Valor CC-10、TDS Premier 比較。滑軌角度、踏板位置與佔地面積——這三項決定它是否裝得進你的空間。",
    ko: "Body-Solid GLPH1100, Titan, Powertec, Valor CC-10, TDS Premier 비교. 슬레드 각도, 발판 위치, 설치 면적 — 이 세 가지가 공간에 들어가는지를 결정합니다.",
    es: "Body-Solid GLPH1100, Titan, Powertec, Valor CC-10 y TDS Premier comparados. Ángulo del carro, posición de la plataforma y huella: eso decide si cabe.",
    "pt-BR": "Body-Solid GLPH1100, Titan, Powertec, Valor CC-10 e TDS Premier comparados. Ângulo do carro, posição da plataforma e área ocupada: é isso que decide se cabe.",
    fr: "Body-Solid GLPH1100, Titan, Powertec, Valor CC-10 et TDS Premier comparés. Angle du chariot, position du plateau et encombrement : voilà ce qui décide.",
    de: "Body-Solid GLPH1100, Titan, Powertec, Valor CC-10 und TDS Premier im Vergleich. Schlittenwinkel, Fußplattenlage und Stellfläche entscheiden, ob es passt.",
    it: "Body-Solid GLPH1100, Titan, Powertec, Valor CC-10 e TDS Premier a confronto. Angolo del carrello, posizione della pedana e ingombro: sono questi a decidere.",
    ru: "Body-Solid GLPH1100, Titan, Powertec, Valor CC-10 и TDS Premier в сравнении. Угол каретки, положение платформы и занимаемая площадь решают, встанет ли он.",
    ar: "مقارنة بين Body-Solid GLPH1100 وTitan وPowertec وValor CC-10 وTDS Premier. زاوية الزلاجة وموضع المنصة والمساحة المشغولة هي ما يحسم الأمر.",
    hi: "Body-Solid GLPH1100, Titan, Powertec, Valor CC-10 और TDS Premier की तुलना। स्लेड का कोण, फुटप्लेट की स्थिति और जगह — यही तय करते हैं कि यह समाएगी या नहीं।",
    id: "Body-Solid GLPH1100, Titan, Powertec, Valor CC-10, dan TDS Premier dibandingkan. Sudut sled, posisi footplate, dan luas pijakan — itu penentunya.",
    th: "เปรียบเทียบ Body-Solid GLPH1100, Titan, Powertec, Valor CC-10 และ TDS Premier มุมรางเลื่อน ตำแหน่งแป้นเหยียบ และพื้นที่ติดตั้ง คือสิ่งที่ตัดสิน",
    vi: "So sánh Body-Solid GLPH1100, Titan, Powertec, Valor CC-10 và TDS Premier. Góc bàn trượt, vị trí bàn đạp và diện tích chiếm chỗ mới là thứ quyết định.",
    tr: "Body-Solid GLPH1100, Titan, Powertec, Valor CC-10 ve TDS Premier karşılaştırıldı. Kızak açısı, ayaklık konumu ve kapladığı alan belirleyici olan şeyler.",
  },
  {
    "zh-CN": "哈克深蹲机的差别不在最大负重——家用几乎不会碰到上限。差别在滑轨角度和它在你房间里放不放得下。",
    "zh-TW": "哈克深蹲機的差別不在最大負重——家用幾乎不會碰到上限。差別在滑軌角度和它在你房間裡放不放得下。",
    ko: "핵 스쿼트 머신의 차이는 최대 중량이 아닙니다. 가정용에서 한계에 닿는 일은 거의 없습니다. 차이는 슬레드 각도와, 그 방에 실제로 들어가는지입니다.",
    es: "Las máquinas de hack squat no se diferencian por su carga máxima — en casa casi nunca se alcanza. Se diferencian por el ángulo del carro y por si caben en la habitación.",
    "pt-BR": "As máquinas de hack squat não se distinguem pela carga máxima — em casa quase nunca se chega lá. Distinguem-se pelo ângulo do carro e por caberem ou não no cômodo.",
    fr: "Les machines à hack squat ne se distinguent pas par leur charge maximale — chez soi, on ne l'atteint presque jamais. Elles se distinguent par l'angle du chariot et par la place qu'elles prennent.",
    de: "Hackenschmidt-Maschinen unterscheiden sich nicht in der Maximallast — zu Hause erreicht man sie fast nie. Sie unterscheiden sich im Schlittenwinkel und darin, ob sie in den Raum passen.",
    it: "Le macchine hack squat non si distinguono per il carico massimo — a casa non ci si arriva quasi mai. Si distinguono per l'angolo del carrello e per l'ingombro.",
    ru: "Гакк-тренажёры различаются не максимальной нагрузкой — дома до неё почти не доходят. Они различаются углом каретки и тем, встанут ли они в комнату.",
    ar: "أجهزة الهاك سكوات لا تختلف في الحمل الأقصى — نادراً ما تصل إليه في المنزل. تختلف في زاوية الزلاجة وفيما إذا كانت تتسع للغرفة.",
    hi: "हैक स्क्वाट मशीनें अधिकतम वज़न से अलग नहीं होतीं — घर पर वह सीमा शायद ही छूती है। फर्क स्लेड के कोण का है, और इसका कि वह कमरे में समाती है या नहीं।",
    id: "Mesin hack squat tidak dibedakan oleh beban maksimum — di rumah nyaris tak pernah tercapai. Yang membedakan adalah sudut sled dan apakah muat di ruangan.",
    th: "เครื่องแฮ็คสควอทไม่ได้ต่างกันที่น้ำหนักสูงสุด เพราะที่บ้านแทบไม่เคยถึงเพดานนั้น สิ่งที่ต่างคือมุมรางเลื่อน และมันวางในห้องคุณได้หรือไม่",
    vi: "Máy hack squat không khác nhau ở tải trọng tối đa — ở nhà gần như không bao giờ chạm tới. Khác nhau ở góc bàn trượt và ở chỗ nó có vừa phòng bạn không.",
    tr: "Hack squat makineleri maksimum yükle ayrışmaz — evde o sınıra neredeyse hiç gelinmez. Ayrışma kızak açısında ve odanıza sığıp sığmadığındadır.",
  },
);

export const BATCH13_HIGHVALUE: ArticleDef[] = [
  {
    slug: "best-catio-2026",
    category: "pets",
    offers: [
      { id: "aivituvin-outdoor-cat-house-catio" }, { id: "petsfit-outdoor-cat-enclosure" },
      { id: "pawhut-wooden-catio" }, { id: "kitty-city-outdoor-cat-run" },
      { id: "trixie-natura-cat-home-with-terrace" },
    ],
    en: {
      title: "Best Catio 2026: 5 Cat Enclosures Compared",
      description:
        "Aivituvin, Petsfit, PawHut, Kitty City and Trixie compared on escape-proofing, roof drainage, vertical space and how the flat-pack actually goes together — the four things that decide whether the cat uses it.",
      lede:
        "A catio almost never fails on size. It fails on three things: the gaps, a roof that holds water, and a design that gives the cat floor area but no height.",
      methodology: METHOD_EN,
      sections: [
        {
          heading: "Escape-proofing is a gap problem, not a height problem",
          paragraphs: [
            "Cats do not usually escape a catio by climbing out of the top. They escape through the seam where a hinged door meets the frame, through the gap under a base panel that has settled unevenly on soft ground, or by working loose a wire panel that is stapled rather than screwed. Everything else about the enclosure matters less than how those three junctions are made.",
            "When reading a listing, look for how the wire is attached. Staples into softwood are the common cost-saving and the common failure — they pull out over a season of weather and pressure. Screwed batten strips holding the wire against the frame are the better construction, and they are visible in the product photos if you look at the frame edges rather than the overall shape.",
            "The other check is the door latch. A single spring catch is enough for most cats; a determined one will learn a simple lift latch. If the enclosure is going somewhere unsupervised, a barrel bolt or a padlock hasp is worth adding regardless of what the kit ships with.",
          ],
        },
        {
          heading: "Roofs: the part that decides whether it survives the winter",
          paragraphs: [
            "The roofing on flat-pack catios is usually asphalt felt over thin plywood, and it is almost always the first thing to fail. The failure is not the felt itself but the pitch: a roof that is close to flat holds standing water, the water finds the fastener holes, and the plywood delaminates from the inside where you cannot see it.",
            "Aivituvin and Trixie both ship pitched roofs with a meaningful slope, which is the main structural reason they cost more than the flat-topped budget enclosures. If you buy a nearly flat-roofed unit, plan on adding a slope with a batten under one edge before it goes outside — it is a ten-minute job at assembly and effectively impossible afterwards.",
          ],
        },
        {
          heading: "Vertical space beats floor space",
          paragraphs: [
            "Cats use enclosures in three dimensions. A tall, narrow catio with four stacked shelves gives a cat more usable territory than a low run with twice the ground area, because a cat's idea of a good spot is a high one with a view. This is the single biggest difference between an enclosure the cat lives in and one it walks through once.",
            "The PawHut vertical format is the clearest example of this trade in the group: it occupies less ground than the walk-in units but offers more perching levels. The counterpoint is human access — you cannot walk into it, so cleaning is done through hatches, which is slower.",
          ],
        },
        {
          heading: "Permanent structure vs packable",
          paragraphs: [
            "The wooden enclosures here are semi-permanent. Once assembled and weathered they do not move easily, and disassembly usually costs you some fasteners and some panel edges. That is the right choice for an owned garden.",
            "The Kitty City system is the opposite: soft-sided, clips together, packs into a bag. It is not weatherproof and it is not secure against a determined cat left alone, but it is the only thing here that works for a rented balcony or for taking to a holiday let. Buying it expecting year-round outdoor housing is the common disappointment.",
          ],
        },
      ],
      faqs: [
        { q: "Does a catio need a floor?", a: "Not necessarily, but an open-bottomed enclosure on grass needs a buried wire skirt or a paver border, because cats dig at the perimeter. A solid floor solves that at the cost of drainage — you then need the floor to sit above ground on feet, not flat on soil." },
        { q: "How big does a catio need to be?", a: "Height and levels matter more than footprint. As a working minimum, one cat needs enough room to stretch fully on a shelf, turn around on it, and reach at least two different levels. Two cats need two separate high spots, not one wider one." },
        { q: "Can a catio be used in winter?", a: "As unheated shelter, only if it has an insulated sleeping box off the ground and out of the wind — the Trixie is the only one here built primarily for that. The wire enclosures are warm-season structures unless you add a heated bed and windbreak panels." },
        { q: "How long does assembly take?", a: "Plan on two to four hours for the wooden flat-pack units with two people, and expect the pre-drilled holes not to all line up. The soft-sided Kitty City system is minutes. Assembly time is where owner reviews are most consistent, and most negative." },
      ],
      products: {
        "aivituvin-outdoor-cat-house-catio": { badge: "🏆 Best overall", review: "The Aivituvin is the pick because it does the two structurally important things at once: a properly pitched felt roof and an enclosed, raised sleeping box inside the run. That combination is what turns an enclosure into somewhere a cat will actually settle rather than pass through. It is a large flat-pack and the assembly is the weak point — set aside an afternoon and expect to re-drill a hole or two.", pros: ["Pitched roof with real drainage", "Enclosed raised sleeping box inside the run", "Walk-in height makes cleaning practical"], cons: ["Long assembly, holes not always aligned", "Large footprint", "Softwood needs re-treating annually"] },
        "petsfit-outdoor-cat-enclosure": { badge: "🏡 Best for small spaces", review: "The Petsfit is the two-storey answer for a patio corner or a balcony where a walk-in unit will not fit. The ramp between levels gives the vertical movement that makes an enclosure interesting to a cat, and the hinged roof panel means you can reach in without dismantling anything. The trade is that at this size there is no room for both a shelter and a run — it is one or the other.", pros: ["Fits a balcony or patio corner", "Two levels with a ramp", "Hinged roof for access"], cons: ["Too small to combine shelter and run", "Limited weather protection", "Ramp is steep for older cats"] },
        "pawhut-wooden-catio": { badge: "💰 Best value", review: "The PawHut is the cheapest way to get genuine vertical territory. The tall, narrow format stacks several shelves in the ground area of a small side table, which is exactly the geometry cats prefer. It is also the unit where the roof is closest to flat, so adding a slope at assembly is worth the ten minutes. Access is through hatches only.", pros: ["Most vertical space per square foot", "Lowest price of the wooden units", "Narrow enough for a side return or alley"], cons: ["Near-flat roof holds water as shipped", "Hatch-only access slows cleaning", "Lighter frame than the Aivituvin"] },
        "kitty-city-outdoor-cat-run": { badge: "🎒 Best portable", review: "The Kitty City is not a catio in the structural sense and should not be bought as one. It is a soft modular tunnel system that clips together, packs down and travels — which makes it the only realistic option for a rented balcony or a holiday let. Supervised use in mild weather is what it is for. Left out in rain or left alone with a determined cat, it will not hold.", pros: ["Packs down and travels", "No assembly tools", "Cheapest here by a wide margin"], cons: ["Not weatherproof", "Not secure unsupervised", "Fabric wears where cats claw"] },
        "trixie-natura-cat-home-with-terrace": { badge: "❄️ Best cold-weather shelter", review: "The Trixie reads as a house with a terrace rather than as an enclosure, and that is how to buy it. The insulated pine body and raised floor make it the only unit here that is genuinely a cold-weather shelter. But the run area is small, so it works as the sleeping end of an already-fenced garden rather than as the whole containment solution.", pros: ["Insulated body and raised floor", "Genuine cold-weather shelter", "Solid pine construction"], cons: ["Very small run area", "Not a containment solution on its own", "Heaviest unit here"] },
      },
      offerNotes: {
        "aivituvin-outdoor-cat-house-catio": "Aivituvin sells several sizes under similar names — match the external dimensions, not the product title.",
        "petsfit-outdoor-cat-enclosure": "Listed in both two-storey and single-storey versions; confirm the ramp is included.",
        "pawhut-wooden-catio": "Shelf count varies between listings of the same model — check the photos rather than the title.",
        "kitty-city-outdoor-cat-run": "Sold as individual modules and as bundles; the bundle is the cheaper route if you want more than one tunnel.",
        "trixie-natura-cat-home-with-terrace": "The Natura line has several roof styles; the terrace version is a distinct SKU.",
      },
      pinDescription: "A catio almost never fails on size. It fails on gaps, a roof that holds water, and floor area with no height. Five enclosures compared on the things that decide whether the cat actually uses it.",
    },
    ja: {
      title: "キャティオのおすすめ2026：屋外猫小屋5製品を比較",
      description:
        "Aivituvin、Petsfit、PawHut、Kitty City、Trixie を脱走防止・屋根の排水・垂直方向の広さ・組立性で比較。猫が実際に使うかを決めるのはこの4点です。",
      lede:
        "キャティオが失敗する理由は、ほとんどの場合サイズではありません。隙間、水が溜まる屋根、そして床面積はあるのに高さがない設計——この3つです。",
      methodology: METHOD_JA,
      sections: [
        {
          heading: "脱走対策は「高さ」ではなく「隙間」の問題",
          paragraphs: [
            "猫がキャティオから逃げるとき、天面をよじ登って出ることは普通ありません。逃げ道になるのは、開き戸とフレームの合わせ目、地面が柔らかくて基礎パネルが沈んでできた下の隙間、そしてステープル留めの金網が緩んだ箇所です。この3つの接合部の作りに比べれば、他の要素の重要度は下がります。",
            "商品ページでは金網の固定方法を見てください。軟材へのステープル留めはコスト削減の定番であり、故障の定番でもあります。一季節の風雨と猫の圧力で抜けます。桟でフレームに押さえてネジ留めしてある方が正解で、全体の形ではなくフレームの縁を見れば写真から判別できます。",
            "もう1つは扉のラッチです。多くの猫にはスプリング式の掛け金で十分ですが、粘り強い個体は持ち上げ式のラッチを覚えます。人が見ていない場所に置くなら、キットの標準品に関わらずラッチ錠か南京錠用の金具を追加する価値があります。",
          ],
        },
        {
          heading: "屋根——冬を越せるかを決める部分",
          paragraphs: [
            "フラットパック型キャティオの屋根は薄いベニヤにアスファルトフェルトを張ったものが一般的で、ほぼ必ず最初に傷みます。原因はフェルト自体ではなく勾配です。ほぼ水平な屋根は水が溜まり、水は釘穴を伝い、ベニヤは見えない内側から剥離します。",
            "Aivituvin と Trixie はどちらもしっかり勾配のある屋根で、フラット天面の廉価機より高い構造上の理由がここにあります。ほぼ水平な屋根の製品を買うなら、屋外に出す前に片側に桟を入れて勾配を付ける前提で計画してください。組立時なら10分の作業ですが、後からでは事実上不可能です。",
          ],
        },
        {
          heading: "床面積より垂直方向",
          paragraphs: [
            "猫は囲いを立体的に使います。棚を4段積んだ縦長のキャティオは、床面積が倍ある低い走り回り型より広い縄張りを猫に与えます。猫にとっての良い場所とは、見晴らしの利く高い場所だからです。ここが「猫が住み着く囲い」と「一度通り抜けただけの囲い」の最大の差です。",
            "この中では PawHut の縦型がこのトレードオフを最も分かりやすく体現しています。ウォークイン型より接地面積が小さい一方、止まり木になる段は多い。引き換えになるのは人間側の出入りで、中に入れないため掃除は開口部越しになり時間がかかります。",
          ],
        },
        {
          heading: "常設か、畳めるか",
          paragraphs: [
            "ここに挙げた木製の囲いは準常設です。組んで雨風に当たった後は簡単には動かせず、解体すると金具とパネルの縁が何割か犠牲になります。持ち家の庭ならそれが正解です。",
            "Kitty City はその逆で、布製、連結式、袋に畳めます。防水性はなく、粘り強い猫を1匹で置いておける強度もありませんが、賃貸のベランダや旅行先で使える唯一の選択肢です。通年の屋外飼育を期待して買うと落胆します。",
          ],
        },
      ],
      faqs: [
        { q: "キャティオに床は必要ですか？", a: "必須ではありませんが、芝生の上に底なしで置く場合は埋め込みの防獣ワイヤーか敷石の縁取りが要ります。猫は外周を掘るためです。床板を付ければ解決しますが今度は排水が問題になるので、土に直置きせず脚で浮かせる必要があります。" },
        { q: "どのくらいの大きさが必要ですか？", a: "接地面積より高さと段数が効きます。実用上の最低ラインは、猫1匹が棚の上で体を伸ばしきれ、その上で向きを変えられ、少なくとも2つの高さを行き来できること。2匹なら「1つの広い高所」ではなく「別々の高所が2つ」必要です。" },
        { q: "冬も使えますか？", a: "無暖房のシェルターとして使うなら、地面から浮いていて風の当たらない断熱寝箱がある場合に限ります。この中でそれを主目的に作られているのは Trixie だけです。金網型は暖房付きベッドと風よけパネルを足さない限り、暖候期用の構造物です。" },
        { q: "組立時間はどのくらいですか？", a: "木製フラットパックは2人で2〜4時間を見てください。下穴が全部きれいに合うことは期待しない方がよいです。布製の Kitty City は数分です。購入者レビューで最も評価が一致していて、最も否定的なのがこの組立時間の項目です。" },
      ],
      products: {
        "aivituvin-outdoor-cat-house-catio": { badge: "🏆 総合best", review: "Aivituvin を選ぶ理由は、構造上重要な2点を同時に満たしているからです。勾配のあるフェルト屋根と、走り回るスペースの中に組み込まれた高床の囲い寝箱。この組み合わせが「通り抜けるだけの囲い」を「猫が落ち着く場所」に変えます。大型のフラットパックで、弱点は組立です。半日を確保し、穴を1〜2箇所開け直す前提で臨んでください。", pros: ["排水の効く勾配屋根", "走り回るスペース内に高床の囲い寝箱", "ウォークイン高で掃除が現実的"], cons: ["組立が長く、下穴が合わないことがある", "設置面積が大きい", "軟材なので年1回の再塗装が要る"] },
        "petsfit-outdoor-cat-enclosure": { badge: "🏡 狭い場所best", review: "ウォークイン型が入らないテラスの角やベランダに対する2階建ての回答です。階層間のスロープが猫にとって面白い立体移動を作り、開閉式の屋根パネルのおかげで分解せずに手を入れられます。引き換えに、このサイズではシェルターと走り回るスペースを両立する余地がありません。どちらか一方です。", pros: ["ベランダやテラスの角に収まる", "スロープ付きの2層構造", "屋根が開いて手が入る"], cons: ["シェルターと運動スペースの両立は無理", "雨風の保護は限定的", "高齢猫にはスロープが急"] },
        "pawhut-wooden-catio": { badge: "💰 コスパbest", review: "本物の垂直方向の縄張りを最も安く手に入れる方法です。縦長の形状によって、サイドテーブル程度の接地面積に複数段の棚が積まれます。これは猫が好む幾何そのものです。一方でこの中では屋根が最も水平に近いので、組立時に勾配を付ける10分は投資する価値があります。出入りは開口部のみ。", pros: ["接地面積あたりの垂直空間が最大", "木製機の中で最安", "細い通路や家の脇にも置ける"], cons: ["出荷状態の屋根はほぼ水平で水が溜まる", "開口部のみのアクセスで掃除が遅い", "Aivituvin よりフレームが華奢"] },
        "kitty-city-outdoor-cat-run": { badge: "🎒 携帯性best", review: "構造物としてのキャティオではないので、そのつもりで買ってはいけません。連結して畳んで持ち運べる布製モジュールで、だからこそ賃貸のベランダや旅行先で使える唯一の現実解です。用途は「穏やかな天気に、人が見ている状態で使う」こと。雨に出しっぱなしにしたり、粘り強い猫を1匹で置いたりすれば持ちません。", pros: ["畳んで持ち運べる", "工具不要", "この中で圧倒的に安い"], cons: ["防水性なし", "無人では強度不足", "爪の当たる箇所から生地が傷む"] },
        "trixie-natura-cat-home-with-terrace": { badge: "❄️ 寒冷期シェルターbest", review: "囲いというよりテラス付きの家であり、そう理解して買うべき製品です。断熱材入りの松材ボディと高床構造により、この中で唯一の本格的な寒冷期シェルターになっています。ただし走り回る面積は狭いので、「囲い全体の解決策」ではなく「既に柵のある庭の寝床側」として機能します。", pros: ["断熱ボディと高床構造", "本物の寒冷期シェルター", "しっかりした松材"], cons: ["運動スペースが非常に狭い", "単体では脱走防止にならない", "この中で最も重い"] },
      },
      offerNotes: {
        "aivituvin-outdoor-cat-house-catio": "Aivituvin は似た名前で複数サイズを出しています。商品名ではなく外形寸法で合わせてください。",
        "petsfit-outdoor-cat-enclosure": "2階建て版と平屋版の両方が出品されています。スロープ付属かを確認してください。",
        "pawhut-wooden-catio": "同一型番でも出品によって棚の段数が違います。タイトルではなく写真で確認を。",
        "kitty-city-outdoor-cat-run": "単品モジュールとセットの両方があります。トンネルを複数使うならセットの方が安価です。",
        "trixie-natura-cat-home-with-terrace": "Natura シリーズには複数の屋根形状があり、テラス付きは別SKUです。",
      },
      pinDescription: "キャティオが失敗する理由はサイズではありません。隙間、水が溜まる屋根、高さのない床面積——猫が実際に使うかを決める要素で5製品を比較しました。",
    },
    translations: CATIO_TR,
  },

  {
    slug: "best-electric-fireplace-2026",
    category: "home",
    offers: [
      { id: "dimplex-revillusion-rbf30" }, { id: "touchstone-sideline-50" },
      { id: "duraflame-dfi-5010" }, { id: "puraflame-western-insert" },
      { id: "rwflame-50-inch-electric-fireplace" },
    ],
    en: {
      title: "Best Electric Fireplace 2026: 5 Compared",
      description:
        "Dimplex Revillusion, Touchstone Sideline 50, Duraflame DFI-5010, PuraFlame Western and R.W.FLAME compared on flame realism, installation type and heat output — starting with why every plug-in model stops at 1,500 W.",
      lede:
        "Every plug-in electric fireplace produces the same amount of heat. The price difference buys appearance, not warmth. Once you accept that, the choice gets simple.",
      methodology: METHOD_EN,
      sections: [
        {
          heading: "The 1,500-watt ceiling, and what it means for sizing",
          paragraphs: [
            "A standard North American 120 V circuit caps a portable appliance at 1,500 watts, which works out to roughly 5,100 BTU per hour. Every plug-in electric fireplace on this page produces that same figure at maximum, whether it costs $250 or $1,400. There is no premium model that heats a room faster on the same outlet, because the outlet is the limit.",
            "In practical terms 1,500 W is supplemental heat for a room of roughly 400 square feet in a mild climate — enough to take the edge off, not enough to be the primary heat source for a cold house. Hardwired 240 V units exist and do exceed this, but they need an electrician and a dedicated circuit, which changes the project from a purchase into an installation.",
            "This is the single most useful thing to know before shopping, because it removes heat output from the comparison entirely. What is left to compare is how the flame looks, how the unit mounts, and how well it is finished.",
          ],
        },
        {
          heading: "How the flame effect is produced — and why it looks flat",
          paragraphs: [
            "Most electric fireplaces generate the flame by shining light onto a rotating rod and reflecting the result off an angled mirror behind the glass. It reads convincingly from directly in front and falls apart from an angle, because you are looking at a two-dimensional projection on a flat surface. This is why cheap units look best in the product photo, which is always shot head-on.",
            "The Dimplex Revillusion line takes a different approach: the flame is projected without the mirror, onto a curved rear surface, which keeps the effect three-dimensional across a wider viewing angle. That is the main thing the premium price buys, and it is genuinely visible if the fireplace sits in an open room where people see it from the side.",
            "For a unit that will be viewed head-on from a sofa, the mirror-based effect is adequate and the money is better spent elsewhere. For a unit in a room divider or an open-plan space, the viewing angle is the whole point.",
          ],
        },
        {
          heading: "Recessed, insert, freestanding: pick the installation first",
          paragraphs: [
            "A recessed linear unit like the Touchstone Sideline 50 goes into a stud wall and sits flush. It looks the most built-in and is the most work — framing, and in most cases a new outlet inside the cavity. It can also be surface-mounted if you accept it standing proud of the wall.",
            "An insert like the PuraFlame Western is designed to drop into an existing masonry fireplace opening. If you already have a dead chimney, this is by a wide margin the cheapest route to a working heat source, because the opening and the surround already exist.",
            "A freestanding stove like the Duraflame DFI-5010 needs nothing but an outlet, and can be moved between rooms. It is the correct choice for a rental, and the only one here that can be undone completely.",
          ],
        },
        {
          heading: "Running cost, and the one safety detail worth knowing",
          paragraphs: [
            "At full output a 1,500 W unit consumes 1.5 kWh per hour. At an electricity price of $0.16 per kWh that is about $0.24 per hour of heating, or roughly $1.90 for an eight-hour evening. Running the flame effect alone, without the heater, costs a small fraction of that — most units draw well under 100 W in flame-only mode, which is why flame-only is the mode most owners end up using year-round.",
            "The safety detail: infrared quartz stoves like the Duraflame warm their metal housing as part of how they work, unlike fan-coil units that stay comparatively cool. That is not a defect, but it matters if there are small children or pets in the room, and it is not usually prominent in the listing.",
          ],
        },
      ],
      faqs: [
        { q: "Can an electric fireplace heat a whole room?", a: "A plug-in one can supplement a room of roughly 400 square feet in a mild climate. It cannot be the primary heat source for a cold house, because the 1,500 W outlet limit caps it at about 5,100 BTU/hr. Hardwired 240 V models exceed this but need a dedicated circuit." },
        { q: "Do they need a vent or a chimney?", a: "No. There is no combustion, so there is nothing to vent. That is what makes an insert into a dead chimney a practical project — the chimney becomes decorative rather than functional." },
        { q: "Which one looks the most realistic?", a: "The mirror-free Dimplex Revillusion system holds up best from an angle, which is where conventional mirror-and-rod effects break down. Head-on, the difference between a premium and a budget unit is much smaller than the price gap suggests." },
        { q: "Is it cheap to run?", a: "The flame effect alone is — most units draw well under 100 W with the heater off. The heater is ordinary resistive heating at roughly $0.24 per hour at $0.16/kWh, which is the same cost as any other 1,500 W space heater." },
      ],
      products: {
        "dimplex-revillusion-rbf30": { badge: "🏆 Best flame effect", review: "The Revillusion is the one unit here where the premium buys something you can actually see. Removing the mirror from the optical path keeps the flame three-dimensional from off to the side, which matters in any room where the fireplace is not viewed strictly head-on. It heats exactly as well as the $250 units — that is not what you are paying for — and it needs a framed opening.", pros: ["Mirror-free flame holds up from an angle", "Best-finished firebox here", "Convincing resin log set"], cons: ["Most expensive by a wide margin", "Requires framing and an outlet in the cavity", "Same 1,500 W heat as the cheapest unit"] },
        "touchstone-sideline-50": { badge: "🖼️ Best built-in look", review: "The Sideline 50 is the linear format done properly: recessed flush into a stud wall, with the heater controllable independently of the flame so it can run as ambience in summer. Media options and flame colours are broader than they need to be, but the underlying build is solid. Budget for the framing work — the unit price is not the project price.", pros: ["Flush recessed installation looks genuinely built-in", "Heater runs independently of the flame", "Hardwire or plug-in"], cons: ["Framing work required for the flush look", "Mirror-based flame flattens from an angle", "Colour options are more gimmick than use"] },
        "duraflame-dfi-5010": { badge: "🔥 Best for renters", review: "The DFI-5010 is the no-installation option: it plugs in, it moves between rooms, and it leaves nothing behind. The infrared quartz element gives a different heat character from a fan coil — more radiant, less blown air. The corollary is that the metal body itself gets warm, which is worth knowing before putting it in a room with a toddler.", pros: ["No installation at all", "Moves between rooms", "Radiant infrared heat rather than blown air"], cons: ["Metal housing gets warm to touch", "Stove aesthetic will not suit every room", "Smallest visible flame area here"] },
        "puraflame-western-insert": { badge: "💰 Best for an existing fireplace", review: "If there is already a masonry opening standing empty, the PuraFlame is the cheapest honest way to make it work again. The surround already exists, so the money goes entirely into the firebox rather than into carpentry. Measure the opening carefully before ordering — insert dimensions are unforgiving, and this is the most common cause of a return in this category.", pros: ["Cheapest route for an existing fireplace opening", "No framing or carpentry", "Glass front and log set included"], cons: ["Opening dimensions must match closely", "Mirror-based flame effect", "Trim finish is basic"] },
        "rwflame-50-inch-electric-fireplace": { badge: "💵 Cheapest linear", review: "The R.W.FLAME gets you the same 50-inch recessed linear format as the premium units for roughly half the money, and the same 1,500 W of heat, because the heat is fixed by the outlet. What you give up is trim finish and flame realism — visible from an angle, and visible up close. In a room where the fireplace is seen head-on from a sofa, that is a reasonable trade.", pros: ["Same linear format at roughly half the price", "Adjustable flame colour and brightness", "Remote included"], cons: ["Flame effect is the weakest here", "Trim finish is noticeably cheaper", "Mixed reports on long-term remote reliability"] },
      },
      offerNotes: {
        "dimplex-revillusion-rbf30": "The Revillusion line includes several widths and both firebox and insert formats — check the model suffix.",
        "touchstone-sideline-50": "Sideline is sold in multiple widths under the same name; the number is the width in inches.",
        "duraflame-dfi-5010": "Duraflame stove model codes change year to year with little functional difference; match the wattage.",
        "puraflame-western-insert": "Measure the masonry opening in three places — old openings are rarely square.",
        "rwflame-50-inch-electric-fireplace": "Listings vary between recessed-only and recessed-or-wall-mount versions of the same size.",
      },
      pinDescription: "Every plug-in electric fireplace makes the same heat — 1,500 W is the outlet limit. So the price difference buys appearance, not warmth. Five compared on flame realism and installation type.",
    },
    ja: {
      title: "電気暖炉のおすすめ2026：5製品を比較",
      description:
        "Dimplex Revillusion、Touchstone Sideline 50、Duraflame DFI-5010、PuraFlame Western、R.W.FLAME を炎の見え方・設置方式・暖房能力で比較。コンセント式が全て1,500Wで頭打ちになる理由から解説します。",
      lede:
        "コンセントに挿す電気暖炉は、どれも発熱量が同じです。価格差が買っているのは見た目であって暖かさではありません。そこを受け入れると、選択は一気に単純になります。",
      methodology: METHOD_JA,
      sections: [
        {
          heading: "1,500Wの上限と、部屋の広さの考え方",
          paragraphs: [
            "北米の一般的な120V回路では、可搬型機器は1,500Wが上限です。熱量に直すと毎時およそ5,100BTU。このページのコンセント式電気暖炉は、$250のものも$1,400のものも、最大出力はこの同じ数字です。同じコンセントでより速く部屋を暖める上位機種は存在しません。上限を決めているのはコンセントだからです。",
            "実用的には、1,500Wは温暖な気候で約37㎡までの部屋の補助暖房です。寒さを和らげるには十分ですが、寒冷地の主暖房にはなりません。直結式の240V機はこれを超えますが、電気工事士と専用回路が必要で、「買い物」ではなく「工事」になります。",
            "買う前に知っておく価値が最も高いのがこの点です。比較項目から暖房能力が丸ごと消えるからです。残るのは、炎の見え方、設置方式、仕上げの質の3つだけになります。",
          ],
        },
        {
          heading: "炎の作り方と、平面的に見える理由",
          paragraphs: [
            "多くの電気暖炉は、回転するロッドに光を当て、ガラスの奥に斜めに置いた鏡で反射させて炎を作ります。真正面からは説得力がありますが、斜めから見ると崩れます。平面に投影された二次元の像を見ているからです。廉価機が商品写真で最も良く見えるのはこのためで、商品写真は必ず正面から撮られています。",
            "Dimplex の Revillusion 系統は方式が違い、鏡を使わずに湾曲した奥面へ投影します。これにより広い視野角で立体感が保たれます。上位価格が買っているのは主にこの点で、開けた部屋に置いて横からも見える環境なら、違いは実際に見て分かります。",
            "ソファから正面だけで見る設置なら、鏡方式で十分であり、予算は他に回した方が合理的です。間仕切りやオープンな空間に置くなら、視野角こそが本題になります。",
          ],
        },
        {
          heading: "埋め込み・インサート・据え置き——先に設置方式を決める",
          paragraphs: [
            "Touchstone Sideline 50 のような埋め込みリニア型は、間柱の壁に入れて面一に納めます。最も造作らしく見え、最も手間がかかります。下地の造作が要り、多くの場合は壁内側の新規コンセントも必要です。壁から出っ張るのを許容すれば、表面付けでも使えます。",
            "PuraFlame Western のようなインサート型は、既存の暖炉開口部に落とし込む設計です。使われていない煙突が既にあるなら、暖房として機能させる最も安価な方法です。開口部も枠も既にあるからです。",
            "Duraflame DFI-5010 のような据え置きストーブ型はコンセント以外何も要らず、部屋間を移動できます。賃貸ならこれが正解で、ここで唯一「完全に元に戻せる」選択肢です。",
          ],
        },
        {
          heading: "電気代と、知っておく価値のある安全上の1点",
          paragraphs: [
            "最大出力では1,500W機は毎時1.5kWhを消費します。電力単価40円/kWhなら1時間あたり約60円、8時間の夜なら約480円です。ヒーターを切って炎の演出だけを動かす場合の消費はごくわずかで、多くの機種は炎のみモードで100Wを大きく下回ります。所有者が結局は通年で炎のみモードを使うようになるのはこのためです。",
            "安全上の1点。Duraflame のような赤外線クオーツ式ストーブは、動作原理として金属筐体自体が温まります。比較的冷たいままのファンコイル式とは異なります。欠陥ではありませんが、小さな子どもやペットがいる部屋では意味を持ちますし、商品ページで目立つように書かれていることは通常ありません。",
          ],
        },
      ],
      faqs: [
        { q: "電気暖炉だけで部屋全体を暖められますか？", a: "コンセント式なら、温暖な気候で約37㎡までの補助暖房になります。1,500Wのコンセント上限により毎時約5,100BTUで頭打ちなので、寒冷地の主暖房にはなりません。直結式の240V機はこれを超えますが専用回路が必要です。" },
        { q: "煙突や換気は必要ですか？", a: "不要です。燃焼が起きないので排気するものがありません。使われていない煙突にインサートを入れる工事が現実的なのはこのためで、煙突は機能部材ではなく装飾になります。" },
        { q: "どれが一番リアルに見えますか？", a: "鏡を使わない Dimplex Revillusion 方式が、斜めから見たときに最も崩れません。従来の鏡+ロッド方式が破綻するのがまさにこの角度です。正面から見る限り、上位機と廉価機の差は価格差ほど大きくありません。" },
        { q: "電気代は安いですか？", a: "炎の演出だけなら安いです。ヒーターを切れば多くの機種で100Wを大きく下回ります。ヒーターは普通の電気抵抗式で、40円/kWhなら1時間あたり約60円。他の1,500W電気ヒーターと同じコストです。" },
      ],
      products: {
        "dimplex-revillusion-rbf30": { badge: "🏆 炎の表現best", review: "上位価格が「実際に目で見える何か」を買っている唯一の機種です。光路から鏡を外したことで、横に外れた位置からも炎が立体的に見えます。正面固定でない部屋ではこれが効きます。暖房能力は$250の機種と全く同じで、そこに金を払っているわけではありません。下地の造作が必要です。", pros: ["鏡を使わない炎表現で斜めからも崩れない", "この中で最も仕上げの良い火室", "説得力のある樹脂製薪セット"], cons: ["圧倒的に高価", "下地造作と壁内コンセントが必要", "発熱量は最安機と同じ1,500W"] },
        "touchstone-sideline-50": { badge: "🖼️ 造作見えbest", review: "リニア型を正攻法でやった製品です。間柱の壁に面一で埋め込め、ヒーターは炎表示と独立して制御できるので夏は演出だけで運転できます。演出素材や炎色の選択肢は必要以上に多いものの、基本の作りはしっかりしています。造作費を予算に入れてください。本体価格は工事費込みの価格ではありません。", pros: ["面一の埋め込みで本当に造作に見える", "ヒーターと炎表示が独立制御", "直結・コンセントどちらも可"], cons: ["面一に納めるには造作工事が必要", "鏡方式なので斜めから平面的に見える", "色の選択肢は実用より演出寄り"] },
        "duraflame-dfi-5010": { badge: "🔥 賃貸best", review: "工事ゼロの選択肢です。挿すだけ、部屋間を移動でき、退去時に何も残りません。赤外線クオーツ素子はファンコイルとは熱の質が違い、送風より輻射寄りです。その裏返しとして金属筐体自体が温まるので、幼児のいる部屋に置く前に知っておく価値があります。", pros: ["設置工事が一切不要", "部屋間を移動できる", "送風でなく輻射による暖かさ"], cons: ["金属外装が触れると温かい", "ストーブ調の見た目は部屋を選ぶ", "炎の見える面積がこの中で最小"] },
        "puraflame-western-insert": { badge: "💰 既存暖炉best", review: "既に空いた組積造の開口部があるなら、それを再び機能させる最も安価で正直な方法です。枠が既にあるので、費用は全額が火室に向かい、造作には向かいません。発注前に開口部を丁寧に採寸してください。インサートは寸法にシビアで、このカテゴリの返品理由として最も多いのがここです。", pros: ["既存開口がある場合の最安ルート", "造作・大工工事が不要", "ガラス前面と薪セット付属"], cons: ["開口寸法が厳密に合う必要がある", "鏡方式の炎表現", "枠の仕上げは簡素"] },
        "rwflame-50-inch-electric-fireplace": { badge: "💵 リニア型最安", review: "上位機と同じ50インチの埋め込みリニア形式が約半額で手に入り、発熱量も同じ1,500Wです。発熱量はコンセントで決まっているからです。妥協点は枠の仕上げと炎のリアリティで、斜めからも近くからも分かります。ソファから正面だけで見る部屋なら、妥当な取引です。", pros: ["同じリニア形式が約半額", "炎の色と明るさを調整可能", "リモコン付属"], cons: ["炎の表現はこの中で最も弱い", "枠の仕上げが明らかに安価", "リモコンの長期耐久性の評価が割れる"] },
      },
      offerNotes: {
        "dimplex-revillusion-rbf30": "Revillusion には複数の幅と、火室型/インサート型の両方があります。型番の接尾辞を確認してください。",
        "touchstone-sideline-50": "Sideline は同じ名前で複数幅が出ています。数字がインチ表記の幅です。",
        "duraflame-dfi-5010": "Duraflame のストーブ型番は毎年変わりますが機能差は小さいので、ワット数で合わせてください。",
        "puraflame-western-insert": "組積造の開口は3箇所測ってください。古い開口が直角であることは稀です。",
        "rwflame-50-inch-electric-fireplace": "同じサイズでも「埋め込み専用」と「埋め込み/壁掛け兼用」の出品が混在します。",
      },
      pinDescription: "コンセント式の電気暖炉は全て発熱量が同じ——1,500Wはコンセントの上限だからです。価格差が買うのは見た目であって暖かさではありません。炎の表現と設置方式で5製品を比較。",
    },
    translations: FIREPLACE_TR,
  },

  {
    slug: "best-evaporative-cooler-2026",
    category: "home",
    offers: [
      { id: "hessaire-mc37m" }, { id: "hessaire-mc61m" }, { id: "honeywell-co60pm" },
      { id: "newair-af-1000w" }, { id: "portacool-cyclone-130" },
    ],
    en: {
      title: "Best Evaporative Cooler 2026: 5 Compared",
      description:
        "Hessaire MC37M and MC61M, Honeywell CO60PM, NewAir AF-1000W and Portacool Cyclone 130 compared on airflow, pad type, tank size and water use — starting with the humidity question that decides whether any of them work.",
      lede:
        "An evaporative cooler is not an air conditioner. It cools by evaporating water, so the more humid the air already is, the less it can do — and in a sealed room it makes things worse, not better.",
      methodology: METHOD_EN,
      sections: [
        {
          heading: "Check your humidity before you check anything else",
          paragraphs: [
            "Evaporative cooling works by turning liquid water into vapour and taking the required latent heat out of the air. The energy has to come from somewhere, and it comes from the air temperature. That means the cooling capacity is set by how much more water the air can still absorb — the gap between the dry-bulb and wet-bulb temperature.",
            "In a dry climate that gap is large and the effect is dramatic: air entering at 38°C and 15% relative humidity can leave the pad noticeably cooler. In a humid climate the gap is small, the water evaporates slowly, and what you get is a fan that also makes the room damp. No amount of spending on a better unit changes this — it is thermodynamics, not build quality.",
            "The practical rule: below roughly 50% relative humidity these units earn their keep; above roughly 70% they do not, regardless of price. Check a local forecast for a typical hot day before buying, not an annual average, because the humidity that matters is the humidity when you need cooling.",
          ],
        },
        {
          heading: "Ventilation is a requirement, not an option",
          paragraphs: [
            "This is the opposite of how an air conditioner works and it is the most common mistake. An AC recirculates air in a sealed room. An evaporative cooler must continuously exhaust the air it has humidified, or the room's humidity climbs until the unit stops cooling and starts merely blowing damp air.",
            "The rule of thumb is an open window or door roughly opposite the unit, sized to let the full airflow out. That is why these units belong in a garage with the door cracked, a workshop, or a covered patio — spaces where the air is being exchanged anyway.",
            "It also explains why the shop-grade units in this group are rated for far more airflow than a room needs. They are designed to move air through a space, not around it.",
          ],
        },
        {
          heading: "Pads, water use and the maintenance nobody budgets for",
          paragraphs: [
            "The cooling pad is the consumable. Thin aspen or cellulose pads on consumer units need replacing roughly annually with regular use; the thicker rigid media on a commercial unit like the Portacool lasts longer and costs more to replace. Either way, a pad that has gone hard with mineral scale stops absorbing water and quietly halves the unit's performance.",
            "Water consumption is real and worth planning for. A mid-size unit running continuously in dry heat will empty a large tank in a day, which is why the hose-fill connection on the Hessaire units matters more than it looks. Manually refilling a 10-gallon tank daily gets old quickly.",
            "In hard-water areas the tank and pump need periodic descaling, and the unit should be run dry — pump off, fan on — for a few minutes before storage, or the pad grows mould over winter. This is the maintenance step most owner complaints trace back to.",
          ],
        },
        {
          heading: "Sizing by CFM, and what the ice compartment is really for",
          paragraphs: [
            "These units are rated in CFM (cubic feet per minute) of airflow rather than in BTU, because their output is not a fixed cooling capacity — it depends on the incoming air. As a starting point, aim for enough CFM to change the air in the space roughly every two minutes: multiply the room's volume in cubic feet by 30 and divide by 60. A two-car garage typically lands somewhere around 3,000 CFM, which is the MC37M's territory.",
            "The ice compartments fitted to smaller units like the NewAir make a small, brief difference. Cooling the water lowers the supply air temperature slightly at first, but the evaporation rate is what does the work, and colder water evaporates more slowly. Treat it as a comfort feature, not a capacity feature.",
          ],
        },
      ],
      faqs: [
        { q: "Will an evaporative cooler work where I live?", a: "Check relative humidity on a typical hot afternoon, not the annual average. Below roughly 50% these units work well; above roughly 70% they mostly add moisture. This is set by physics, so a more expensive unit does not overcome it." },
        { q: "Do I need to leave a window open?", a: "Yes, and this is the most common mistake. Unlike an air conditioner, an evaporative cooler must exhaust the air it has humidified. In a sealed room the humidity climbs until the cooling stops and you are left with a damp fan." },
        { q: "How much water do they use?", a: "A mid-size unit running continuously in dry heat can empty a 10-gallon tank within a day. That is why a garden-hose fill connection matters — daily manual refilling is the thing owners tire of first." },
        { q: "How often do the pads need replacing?", a: "Roughly annually for thin aspen or cellulose pads under regular use; longer for the thicker rigid media on commercial units. A pad stiff with mineral scale stops absorbing water and halves performance without any obvious symptom." },
      ],
      products: {
        "hessaire-mc37m": { badge: "🏆 Best overall", review: "The MC37M is the size most buyers actually need: enough airflow for a two-car garage or a covered patio, a tank large enough to run most of a day, and a garden-hose connection so you are not carrying buckets. It is built to shop standards rather than living-room standards — the finish is plain and it is not quiet. For the space it is designed for, neither matters.", pros: ["Right airflow for a garage or covered patio", "Hose-fill connection removes the daily refill chore", "Large tank relative to price"], cons: ["Loud at high speed", "Utilitarian finish", "Too big and too loud for a bedroom"] },
        "hessaire-mc61m": { badge: "🏭 Best for large spaces", review: "The MC61M is the same design scaled up for open shop floors and outdoor events. Buying it for a domestic space is almost always a mistake — it moves more air than a house can exhaust, which means you cannot actually run it at capacity indoors. Where it fits, the large tank makes unattended all-day running practical.", pros: ["Very high airflow for open spaces", "Large tank supports all-day unattended running", "Same proven design as the MC37M"], cons: ["Far too much airflow for domestic rooms", "Heavy and awkward to reposition", "Highest water consumption here"] },
        "honeywell-co60pm": { badge: "🏠 Best for indoor use", review: "The CO60PM is the one here designed to be looked at and lived with: oscillating louvres, a remote, quieter operation and a finish that suits a room rather than a workshop. The trade is capacity — it moves noticeably less air than the Hessaire units. In a dry climate with a window open it is the right choice for a living room; in a hot garage it will disappoint.", pros: ["Quietest and best-finished here", "Oscillating louvres and remote", "Suits a living space"], cons: ["Lower airflow than the shop-grade units", "Still needs an open window", "Tank is smaller than the airflow implies"] },
        "newair-af-1000w": { badge: "💵 Cheapest", review: "The AF-1000W is a single-room tower with a small tank and an ice compartment. It is the entry point and the unit most likely to be bought for the wrong job — put it in a hot garage and it does effectively nothing. In a small, dry room with airflow through it, it is adequate and cheap. The ice compartment is a comfort feature, not a capacity feature.", pros: ["Lowest price here", "Compact tower footprint", "Simple to move and store"], cons: ["Far too small for a garage or patio", "Small tank needs frequent refilling", "Ice compartment adds little real capacity"] },
        "portacool-cyclone-130": { badge: "🛠️ Best build quality", review: "The Portacool is the commercial-grade option, and the reason is the pad: thicker rigid Kuul media absorbs and holds more water than the thin pads in consumer units, which is what actually determines cooling performance over a long run. It is heavier and more expensive, and the replacement pad is a real line item. For a workshop that runs it all summer, it is the one that holds up.", pros: ["Thicker rigid media pad performs better over long runs", "Commercial build, serviceable parts", "Consistent output through a full day"], cons: ["Most expensive here", "Replacement pads are costly", "Heavy — not something you reposition casually"] },
      },
      offerNotes: {
        "hessaire-mc37m": "Hessaire's MC-series numbers refer to tank and airflow size; MC37M and MC26M look nearly identical in photos.",
        "hessaire-mc61m": "Check the shipping dimensions before ordering — this is a freight-sized item in some listings.",
        "honeywell-co60pm": "Honeywell licenses its name in this category; match the model code rather than the brand alone.",
        "newair-af-1000w": "Sold in white and black variants under slightly different codes with the same specification.",
        "portacool-cyclone-130": "Replacement Kuul pads are a separate purchase — check availability for the specific model before buying.",
      },
      pinDescription: "An evaporative cooler is not an AC. It cools by evaporating water, so humidity decides whether it works at all — and it needs a window open, not a sealed room. Five compared on airflow, pad and tank.",
    },
    ja: {
      title: "気化式冷風機のおすすめ2026：5製品を比較",
      description:
        "Hessaire MC37M/MC61M、Honeywell CO60PM、NewAir AF-1000W、Portacool Cyclone 130 を風量・パッド方式・タンク容量・水の消費量で比較。そもそも効くかどうかを決める湿度の話から始めます。",
      lede:
        "気化式冷風機はエアコンではありません。水を蒸発させて冷やすので、空気が既に湿っているほど働けません。密閉した部屋では涼しくなるどころか状況が悪化します。",
      methodology: METHOD_JA,
      sections: [
        {
          heading: "何より先に自分の地域の湿度を確認する",
          paragraphs: [
            "気化冷却は、液体の水を水蒸気に変え、そのために必要な潜熱を空気から奪う仕組みです。エネルギーはどこかから来なければならず、それが空気の温度です。つまり冷却能力は「空気がまだどれだけ水を吸えるか」——乾球温度と湿球温度の差——で決まります。",
            "乾燥した気候ではこの差が大きく、効果は劇的です。38℃・相対湿度15%で入った空気は、パッドを抜けるとはっきり冷たくなります。湿潤な気候では差が小さく、水はゆっくりしか蒸発せず、結果として得られるのは「部屋を湿らせる扇風機」です。良い機種にいくら払っても変わりません。これは製品の出来ではなく熱力学の話です。",
            "実用的な目安は、相対湿度およそ50%未満なら元が取れ、およそ70%を超えると価格に関係なく効かない、というものです。買う前に年間平均ではなく「暑い日の予報」を確認してください。問題になるのは、冷やしたいときの湿度だからです。",
          ],
        },
        {
          heading: "換気は選択肢ではなく必須条件",
          paragraphs: [
            "ここがエアコンと正反対で、最も多い誤解です。エアコンは密閉した部屋で空気を循環させます。気化式冷風機は、湿らせた空気を絶えず外へ出し続けなければなりません。さもないと室内の湿度が上がり続け、やがて冷却は止まり、湿った風を吹くだけの機械になります。",
            "目安は、機体のほぼ反対側に、風量を逃がせるだけの開口（窓か戸）を確保することです。これらの機種がガレージ（扉を少し開けた状態）・作業場・屋根付きテラスに向くのはこのためで、どれも元々空気が入れ替わる場所です。",
            "この中の作業場向け機種が、部屋に必要な量をはるかに超える風量で設計されている理由も同じです。空気を「room の中で回す」のではなく「room を通して流す」ための設計だからです。",
          ],
        },
        {
          heading: "パッド・水の消費量・誰も予算に入れない保守",
          paragraphs: [
            "冷却パッドは消耗品です。民生機の薄いアスペン材やセルロースのパッドは、常用すればおよそ年1回の交換が必要です。Portacool のような業務機の厚い剛性メディアはもっと持ちますが交換費も高い。いずれにせよ、ミネラル分のスケールで硬くなったパッドは水を吸わなくなり、性能を静かに半減させます。",
            "水の消費は現実的な問題で、計画に入れる価値があります。中型機を乾いた暑さの中で連続運転すると、大型タンクが1日で空になります。Hessaire のホース直結給水口が見た目以上に重要なのはこのためです。40Lのタンクを毎日手で満たす作業はすぐ嫌になります。",
            "硬水地域ではタンクとポンプの定期的な除石灰が必要で、収納前にはポンプを止めてファンだけを数分回し、内部を乾かす必要があります。さもないと冬の間にパッドがカビます。所有者の不満の多くは、この保守工程に行き着きます。",
          ],
        },
        {
          heading: "CFMによるサイズ選定と、氷ポケットの実際の意味",
          paragraphs: [
            "これらの機種はBTUではなくCFM（毎分立方フィート）の風量で表示されます。出力が固定の冷却能力ではなく、入ってくる空気次第で変わるからです。目安として、空間の空気をおよそ2分で入れ替えられる風量を狙います。部屋の容積（立方フィート）×30÷60で概算できます。2台用ガレージなら概ね3,000CFM前後で、これが MC37M の守備範囲です。",
            "NewAir のような小型機に付く氷ポケットは、小さく短時間の差しか生みません。水を冷やせば吹き出し温度は最初こそ少し下がりますが、実際の仕事をしているのは蒸発であり、冷たい水ほど蒸発は遅くなります。能力の機能ではなく快適性の機能と捉えてください。",
          ],
        },
      ],
      faqs: [
        { q: "自分の住んでいる地域で効きますか？", a: "年間平均ではなく、暑い日の午後の相対湿度を見てください。およそ50%未満ならよく効き、およそ70%を超えるとほぼ加湿するだけです。これは物理で決まるので、高価な機種を買っても覆せません。" },
        { q: "窓を開けておく必要がありますか？", a: "必要です。そしてこれが最も多い間違いです。エアコンと違い、気化式冷風機は湿らせた空気を排出し続けなければなりません。密閉した部屋では湿度が上がり続け、冷却が止まって湿った扇風機になります。" },
        { q: "水はどのくらい使いますか？", a: "中型機を乾いた暑さで連続運転すると、40L級のタンクが1日で空になり得ます。散水ホース直結の給水口が効いてくるのはこのためで、所有者が最初に嫌になるのが毎日の手動給水です。" },
        { q: "パッドの交換頻度は？", a: "薄いアスペン/セルロースのパッドは常用でおよそ年1回、業務機の厚い剛性メディアはもっと持ちます。ミネラルのスケールで硬くなったパッドは水を吸わなくなり、目立った症状のないまま性能が半減します。" },
      ],
      products: {
        "hessaire-mc37m": { badge: "🏆 総合best", review: "多くの人が実際に必要とするのはこのサイズです。2台用ガレージや屋根付きテラスに足りる風量、ほぼ1日運転できるタンク容量、そしてバケツを運ばずに済むホース直結の給水口。作業場基準で作られており居間基準ではないので、仕上げは素っ気なく静かでもありません。対象とする場所では、どちらも問題になりません。", pros: ["ガレージや屋根付きテラスに合う風量", "ホース給水で毎日の手動給水が不要", "価格に対してタンクが大きい"], cons: ["強運転はうるさい", "実用一辺倒の仕上げ", "寝室には大きすぎ・うるさすぎ"] },
        "hessaire-mc61m": { badge: "🏭 広い空間best", review: "MC37M と同じ設計を、開けた工場床や屋外イベント向けに拡大した機種です。家庭用に買うのはほぼ必ず間違いで、住宅が排出できる以上の空気を動かすため、屋内では能力どおりに運転できません。適合する場所では、大容量タンクにより終日の無人運転が現実的になります。", pros: ["開けた空間向けの非常に大きな風量", "大容量タンクで終日の無人運転が可能", "MC37M と同じ実績ある設計"], cons: ["家庭の部屋には風量が過大", "重く移動させにくい", "この中で水の消費量が最大"] },
        "honeywell-co60pm": { badge: "🏠 屋内best", review: "この中で唯一、見られること・一緒に暮らすことを前提に設計された機種です。ルーバー首振り、リモコン、静かな運転、そして作業場ではなく部屋に合う仕上げ。引き換えは能力で、Hessaire 機より風量ははっきり小さい。乾燥した気候で窓を開けて使う居間ならこれが正解ですが、暑いガレージでは期待外れになります。", pros: ["この中で最も静かで仕上げが良い", "ルーバー首振りとリモコン", "居住空間に合う"], cons: ["作業場向け機種より風量が小さい", "それでも窓開けは必要", "風量の割にタンクが小さい"] },
        "newair-af-1000w": { badge: "💵 最安", review: "小さなタンクと氷ポケットを持つ1部屋向けのタワー型です。入門機であり、最も用途を間違えて買われやすい機種でもあります。暑いガレージに置けば事実上何もしません。小さく乾いた、風の通る部屋であれば十分かつ安価です。氷ポケットは能力ではなく快適性の機能です。", pros: ["この中で最安", "タワー型で設置面積が小さい", "移動と収納が簡単"], cons: ["ガレージやテラスには小さすぎる", "タンクが小さく頻繁な給水が必要", "氷ポケットは実能力をほとんど上げない"] },
        "portacool-cyclone-130": { badge: "🛠️ 作りの良さbest", review: "業務グレードの選択肢で、その理由はパッドにあります。厚い剛性の Kuul メディアは民生機の薄いパッドより多くの水を吸って保持し、長時間運転での冷却性能を実際に決めるのがこの点です。重く高価で、交換パッドも無視できない費用項目になります。夏じゅう回す作業場なら、持ちこたえるのはこれです。", pros: ["厚い剛性メディアで長時間運転に強い", "業務用の作りで部品交換が可能", "終日を通して出力が安定"], cons: ["この中で最も高価", "交換パッドが高い", "重く、気軽に動かせない"] },
      },
      offerNotes: {
        "hessaire-mc37m": "Hessaire の MC シリーズの数字はタンクと風量の規模を表します。MC37M と MC26M は写真ではほぼ同じに見えます。",
        "hessaire-mc61m": "発注前に配送寸法を確認してください。出品によっては家財便扱いのサイズです。",
        "honeywell-co60pm": "このカテゴリの Honeywell はブランドライセンスです。ブランド名だけでなく型番で合わせてください。",
        "newair-af-1000w": "同一仕様で白と黒があり、型番の末尾がわずかに異なります。",
        "portacool-cyclone-130": "交換用 Kuul パッドは別売です。購入前に該当モデル用の在庫を確認してください。",
      },
      pinDescription: "気化式冷風機はエアコンではありません。水の蒸発で冷やすので効くかどうかは湿度が決め、密閉ではなく窓開けが前提です。風量・パッド・タンクで5製品を比較。",
    },
    translations: SWAMP_TR,
  },

  {
    slug: "best-bidet-toilet-seat-2026",
    category: "home",
    offers: [
      { id: "toto-washlet-s550e" }, { id: "bio-bidet-bb-2000-bliss" },
      { id: "brondell-swash-1400" }, { id: "kohler-purewash-e930" },
      { id: "tushy-classic-3-0" },
    ],
    en: {
      title: "Best Bidet Toilet Seat 2026: 5 Compared",
      description:
        "TOTO Washlet S550e, Bio Bidet BB-2000, Brondell Swash 1400, Kohler PureWash E930 and the non-electric TUSHY Classic 3.0 compared on heating type, nozzle design, fit and what you must check before ordering.",
      lede:
        "The most common failure when buying a bidet seat has nothing to do with the nozzle or the water temperature. It is that there is no outlet next to the toilet, or the bowl shape does not match.",
      methodology: METHOD_EN,
      sections: [
        {
          heading: "Check the outlet and the bowl shape before anything else",
          paragraphs: [
            "Every electric seat here needs mains power within reach of the toilet, and in most jurisdictions that means a GFCI-protected outlet. Bathrooms in older housing frequently have no outlet near the toilet at all. Adding one is an electrician's job, and it is the single most common reason a bidet seat purchase stalls after delivery.",
            "The second check is bowl shape. Seats are sold in elongated and round versions and the two are not interchangeable — an elongated seat on a round bowl overhangs at the front and will not sit flat. Measure from the centre of the seat bolt holes to the front lip of the bowl: roughly 18.5 inches is elongated, roughly 16.5 inches is round.",
            "The third, less obvious check is the water supply. These seats tee off the toilet's fill line with the supplied T-valve, which assumes a standard threaded connection and enough clearance behind the bowl to fit it. Tight installations against a wall are where this becomes fiddly.",
          ],
        },
        {
          heading: "Tank heating vs tankless — the difference you actually notice",
          paragraphs: [
            "A tank-type seat holds a small reservoir of pre-warmed water. It is cheaper to build and works fine until the reservoir runs out, at which point the wash goes cold mid-cycle. For a single user this is rarely a problem; for a household using the seat back to back, it is the complaint that surfaces.",
            "A tankless seat heats water on demand as it passes through, so the wash temperature holds indefinitely. Every seat in this comparison except the non-electric TUSHY is tankless, which is now the norm at this price level and worth insisting on.",
            "Seat heating is a separate system from water heating and is often confused with it in listings. A seat can have a heated seat surface and a cold-water wash — a common combination on cheaper models, and not what most buyers think they are getting.",
          ],
        },
        {
          heading: "Nozzle design, self-cleaning, and what the marketing means",
          paragraphs: [
            "Nozzle material matters mainly for cleaning: stainless steel wipes down and resists scale better than plastic. Most seats in this range use a stainless wand with separate ports for rear and front wash, which is preferable to a single port that switches function, because the ports never touch each other's water.",
            "Self-cleaning is close to universal now, but the implementations differ. The basic version rinses the outside of the wand before and after use. Better versions add a sterilisation step — Kohler uses UV on the PureWash, TOTO applies its EWATER+ electrolysed water misting to both the wand and the bowl. Whether the sterilisation step is worth the price premium is a judgement call; the pre- and post-rinse is not optional and every seat here has it.",
            "Oscillating and pulsating wash modes are standard marketing points and genuinely useful. Adjustable nozzle position is more useful than either, and is the feature most likely to be missing on cheaper seats.",
          ],
        },
        {
          heading: "When the non-electric option is the right answer",
          paragraphs: [
            "The TUSHY and attachments like it do one thing: they route supply-line water through a nozzle. No outlet, no heated seat, no warm air dryer, no remote. Cold water in winter is the honest downside, and it is a meaningful one in a cold house.",
            "But it is the right answer in three situations: a bathroom with no outlet and no route to add one, a rental where the installation must be fully reversible, and a first purchase where you want to find out whether you will actually use a bidet before spending ten times as much. The installation is a fifteen-minute job with no electrical work.",
            "It is worth being explicit about the trade, because the gap in comfort between a cold-water attachment and a heated tankless seat in January is large. If the outlet exists, the seat is the better product. If it does not, the attachment is not a compromise so much as a different category.",
          ],
        },
      ],
      faqs: [
        { q: "Do I need an electrician?", a: "If there is no outlet within reach of the toilet, yes — every electric seat here needs mains power, typically on a GFCI-protected circuit. This is the most common reason a bidet seat sits in its box after delivery. The non-electric TUSHY is the way around it." },
        { q: "How do I know if my toilet fits?", a: "Measure from the centre of the seat bolt holes to the front lip of the bowl. Roughly 18.5 inches is elongated, roughly 16.5 inches is round, and the two seat versions are not interchangeable. Also check for clearance behind the bowl for the supply T-valve." },
        { q: "Tank or tankless?", a: "Tankless, if the budget allows. A tank-type seat holds a limited reservoir of warm water and goes cold mid-wash once it is used up — the complaint that surfaces in households with several users. Every electric seat here is tankless." },
        { q: "Is the warm air dryer actually useful?", a: "Opinions divide sharply, and it is slower than most first-time buyers expect. It is a genuine convenience for users with limited mobility. For most people it is the feature most often paid for and least often used." },
      ],
      products: {
        "toto-washlet-s550e": { badge: "🏆 Best overall", review: "The S550e is the reference product in this category and TOTO's own manufacture rather than a licensed name. Instant heating, automatic lid, deodoriser, dryer and the EWATER+ misting that pre-wets the bowl to reduce what sticks — the feature list is complete and the execution is the most refined here. It is also roughly twice the price of the alternatives, and the value judgement is entirely about how much the refinement is worth to you.", pros: ["Most refined execution in the category", "Instant heating, automatic lid, EWATER+ bowl misting", "TOTO's own manufacture and support"], cons: ["Roughly double the price of the alternatives", "Requires a GFCI outlet", "Remote is feature-dense"] },
        "bio-bidet-bb-2000-bliss": { badge: "🥈 Best value", review: "The BB-2000 is the standard answer to 'a Washlet without the Washlet price'. It is tankless, so the wash stays warm; the three-in-one stainless nozzle covers the functions that matter; and the wireless remote works. Build finish is a step below TOTO and the seat is bulkier at the back. Nothing important is missing.", pros: ["Tankless heating at a much lower price", "Three-in-one stainless nozzle", "Wireless remote included"], cons: ["Bulkier rear housing than the TOTO", "Finish is a step below the premium seats", "No automatic lid"] },
        "brondell-swash-1400": { badge: "🔇 Best seat comfort", review: "The Swash 1400 sits between the budget seats and the Washlet, and its distinguishing pitch is a quieter operation and a warmer seat surface rather than a longer feature list. Dual stainless nozzles are the right design. It omits the automatic lid, which is the main thing separating it from the TOTO besides price.", pros: ["Quieter than most seats at this price", "Dual stainless nozzles", "Comfortable heated seat surface"], cons: ["No automatic lid", "Fewer wash presets than rivals", "Remote mount is flimsy"] },
        "kohler-purewash-e930": { badge: "🧼 Best nozzle hygiene", review: "The E930's distinguishing feature is UV treatment of the nozzle in addition to the standard rinse cycle, which is the strongest hygiene implementation here after TOTO's EWATER+. The important caveat is fit: Kohler designs to its own bowls, so verify the dimensions against your toilet before ordering rather than assuming a standard elongated seat will match.", pros: ["UV nozzle sterilisation plus self-cleaning rinse", "Solid Kohler build", "Clean, uncluttered control layout"], cons: ["Fit is tightest to Kohler's own bowls", "Fewer adjustment steps than Bio Bidet", "Premium price without a dryer on some variants"] },
        "tushy-classic-3-0": { badge: "💵 Best non-electric", review: "The TUSHY is not a compromised version of the seats above — it is a different product. It clamps under the existing seat, taps the fill line, needs no outlet and installs in about fifteen minutes. There is no heated seat, no dryer and, in winter, no warm water. Buy it for a bathroom with no outlet, for a rental, or to find out whether you will use a bidet at all before spending ten times more.", pros: ["No outlet or electrical work needed", "Installs in about fifteen minutes and is fully reversible", "A fraction of the price of any electric seat"], cons: ["Cold water — a real drawback in winter", "No heated seat, dryer or remote", "Adjustment is a manual dial"] },
      },
      offerNotes: {
        "toto-washlet-s550e": "The S550e and S500e differ in lid and wand features; both come in round and elongated versions.",
        "bio-bidet-bb-2000-bliss": "The BB-2000 is listed under both 'Bliss' and the bare model number — same product.",
        "brondell-swash-1400": "The 1400 and 1000 differ mainly in heating type; confirm the listing is the tankless 1400.",
        "kohler-purewash-e930": "Verify seat dimensions against your bowl — Kohler's fit tolerances are tight to their own toilets.",
        "tushy-classic-3-0": "The Classic is cold-water only; the warm-water TUSHY Spa is a separate product requiring a hot supply.",
      },
      pinDescription: "The most common bidet seat failure is not the nozzle or the water temperature — it is no outlet next to the toilet, or a bowl shape that does not match. Five compared, including a non-electric option.",
    },
    ja: {
      title: "温水洗浄便座のおすすめ2026：5製品を比較",
      description:
        "TOTO ウォシュレット S550e、Bio Bidet BB-2000、Brondell Swash 1400、Kohler PureWash E930、電源不要の TUSHY Classic 3.0 を加温方式・ノズル設計・適合寸法で比較。発注前に必ず確認すべき点から解説します。",
      lede:
        "温水洗浄便座で最も多い失敗は、ノズルでも湯温でもありません。便器の横にコンセントが無い、あるいは便器の形状が合わない——この2つです。",
      methodology: METHOD_JA,
      sections: [
        {
          heading: "何より先にコンセントと便器形状を確認する",
          paragraphs: [
            "ここに挙げた電気式の便座はすべて、便器の近くに商用電源が必要です。多くの地域では漏電遮断（GFCI）付き回路が要件になります。古い住宅のトイレには、便器付近にコンセントが全く無いことが珍しくありません。増設は電気工事士の仕事であり、購入後に設置が止まる理由として最も多いのがこれです。",
            "2つ目は便器の形状です。便座には elongated（長円）と round（丸型）があり、互換性はありません。丸型便器に長円の便座を載せると前方がはみ出し、平らに座りません。便座の取付ボルト穴の中心から便器前端までを測ってください。約47cmが長円、約42cmが丸型です。",
            "3つ目はあまり意識されませんが給水です。これらの便座は付属のT字分岐で便器の給水管から分岐しますが、これは標準的なネジ接続であることと、便器の背後に分岐金具を入れる隙間があることを前提にしています。壁ぎりぎりの設置では、ここが厄介になります。",
          ],
        },
        {
          heading: "貯湯式と瞬間式——実際に体感できる差",
          paragraphs: [
            "貯湯式は、あらかじめ温めた少量の湯を溜めておく方式です。製造コストが安く、湯を使い切るまでは問題なく動きますが、使い切った時点で洗浄中に冷たくなります。1人で使うなら問題になることは稀ですが、家族が続けて使う家庭では必ず出てくる不満です。",
            "瞬間式は通過する水をその場で加温するので、湯温が下がりません。この比較の中では電源不要の TUSHY 以外はすべて瞬間式で、この価格帯では既に標準です。譲らない方がよい条件と言えます。",
            "便座の暖房は湯の加温とは別系統ですが、商品ページでは混同されがちです。「便座は温かいが洗浄水は冷たい」という組み合わせは廉価機によくあり、多くの買い手が想定しているものとは違います。",
          ],
        },
        {
          heading: "ノズル設計・自動洗浄と、宣伝文句の意味",
          paragraphs: [
            "ノズルの材質が効いてくるのは主に清掃性です。ステンレスは樹脂より拭き取りやすく、水垢にも強い。この価格帯の多くはステンレス製のノズルに後方用・前方用の別ポートを持ちます。1つのポートが機能を切り替える方式より望ましく、理由は互いの水が触れないことです。",
            "自動洗浄は今やほぼ全機種にありますが、実装は異なります。基本形は使用前後にノズル外周をすすぐだけ。上位はここに除菌工程を足し、Kohler の PureWash は UV、TOTO は「きれい除菌水」をノズルと便器の両方に噴霧します。除菌工程が価格差に見合うかは判断の分かれるところですが、前後のすすぎは省略不可で、ここに挙げた全機種が備えています。",
            "ムーブ洗浄・リズム洗浄は定番の宣伝項目で、実際に有用です。ただしそれ以上に有用なのはノズル位置の調整機能で、廉価機で省かれやすいのもこの機能です。",
          ],
        },
        {
          heading: "電源不要タイプが正解になる場面",
          paragraphs: [
            "TUSHY のような後付けユニットがやることは1つ、給水管の水をノズルに通すことだけです。コンセント不要、便座暖房なし、温風乾燥なし、リモコンなし。冬の水は冷たく、これは正直に言って寒い家では無視できない欠点です。",
            "それでも次の3つの場面では正解になります。コンセントが無く増設もできないトイレ、原状回復が必要な賃貸、そして「10倍の金額を払う前に、そもそも自分が使うのかを確かめたい」という初回購入です。設置は電気工事なしで15分ほどです。",
            "この取引条件は明示しておく価値があります。1月に冷水の後付けユニットと瞬間式の暖房便座を比べたときの快適さの差は大きいからです。コンセントがあるなら便座型が良い製品です。無いなら、後付けユニットは妥協というより別カテゴリの製品です。",
          ],
        },
      ],
      faqs: [
        { q: "電気工事は必要ですか？", a: "便器の手が届く範囲にコンセントが無ければ必要です。ここに挙げた電気式は全て商用電源（通常は漏電遮断付き回路）を要します。届いた便座が箱のままになる理由として最も多いのがこれです。回避策が電源不要の TUSHY です。" },
        { q: "自分の便器に合うかどうかは？", a: "便座の取付ボルト穴の中心から便器前端までを測ってください。約47cmが長円、約42cmが丸型で、この2つに互換性はありません。併せて、給水のT字分岐を入れる便器背後の隙間も確認してください。" },
        { q: "貯湯式と瞬間式のどちらを選ぶべきですか？", a: "予算が許すなら瞬間式です。貯湯式は温水の量が限られており、使い切ると洗浄の途中で冷たくなります。複数人が続けて使う家庭で必ず出てくる不満です。ここに挙げた電気式は全て瞬間式です。" },
        { q: "温風乾燥は実際に役立ちますか？", a: "評価がはっきり分かれる機能で、初めて使う人が想像するより時間がかかります。身体の動きに制約がある方には本当に有用です。多くの人にとっては、最も金を払われ、最も使われない機能です。" },
      ],
      products: {
        "toto-washlet-s550e": { badge: "🏆 総合best", review: "このカテゴリの基準となる製品で、ブランドライセンスではなく TOTO 自社製です。瞬間式加温、自動開閉フタ、脱臭、乾燥、そして便器をあらかじめ濡らして汚れを付きにくくする「きれい除菌水」——機能表は完全で、仕上がりもこの中で最も洗練されています。同時に代替機のおよそ2倍の価格であり、判断はその洗練にいくら払えるかに尽きます。", pros: ["このカテゴリで最も洗練された作り", "瞬間式加温・自動開閉フタ・便器への除菌水噴霧", "TOTO 自社製造とサポート"], cons: ["代替機のおよそ2倍の価格", "漏電遮断付きコンセントが必要", "リモコンの機能が多く煩雑"] },
        "bio-bidet-bb-2000-bliss": { badge: "🥈 コスパbest", review: "「ウォシュレットの価格を払わずにウォシュレット相当を得る」という問いへの定番の答えです。瞬間式なので湯温が下がらず、ステンレス製3in1ノズルは要点を押さえており、ワイヤレスリモコンも問題なく動きます。仕上げは TOTO より一段落ち、後部が厚い。ただし重要な機能で欠けているものはありません。", pros: ["瞬間式加温をはるかに安く実現", "ステンレス製3in1ノズル", "ワイヤレスリモコン付属"], cons: ["TOTO より後部の張り出しが大きい", "仕上げは上位機より一段落ちる", "自動開閉フタなし"] },
        "brondell-swash-1400": { badge: "🔇 便座の快適性best", review: "廉価機とウォシュレットの中間に位置し、売りは機能表の長さではなく「静かさ」と「便座表面の暖かさ」です。ステンレス製ダブルノズルという設計は正しい。自動開閉フタは省かれており、価格以外で TOTO と分かれる主な点がここです。", pros: ["この価格帯では静かな部類", "ステンレス製ダブルノズル", "便座表面の暖かさが快適"], cons: ["自動開閉フタなし", "洗浄プリセットが競合より少ない", "リモコンホルダーが華奢"] },
        "kohler-purewash-e930": { badge: "🧼 ノズル衛生best", review: "標準のすすぎ工程に加えてノズルを UV 処理する点が特徴で、TOTO のきれい除菌水に次ぐ強度の衛生実装です。重要な注意点は寸法適合です。Kohler は自社便器に合わせて設計しているため、「標準的な長円便座なら合うだろう」と仮定せず、発注前に自分の便器の寸法と突き合わせてください。", pros: ["UVによるノズル除菌と自動すすぎ", "Kohler らしい堅実な作り", "操作系が整理されていて分かりやすい"], cons: ["自社便器に対して寸法がシビア", "調整段数が Bio Bidet より少ない", "仕様によっては乾燥機能がなく割高"] },
        "tushy-classic-3-0": { badge: "💵 電源不要best", review: "上位機の劣化版ではなく、別の製品として理解すべきものです。既存の便座下に挟んで給水管から分岐し、コンセント不要、設置は15分程度。便座暖房も乾燥もなく、冬は温水も出ません。コンセントの無いトイレ、賃貸、あるいは「10倍払う前に自分が本当に使うか確かめたい」場合に買う製品です。", pros: ["電源も電気工事も不要", "15分程度で設置でき完全に原状回復できる", "電気式便座の何分の一かの価格"], cons: ["冷水のみ——冬は実際に効く欠点", "便座暖房・乾燥・リモコンなし", "調整は手動ダイヤル"] },
      },
      offerNotes: {
        "toto-washlet-s550e": "S550e と S500e はフタとノズルの機能が異なります。どちらも丸型/長円の両版があります。",
        "bio-bidet-bb-2000-bliss": "BB-2000 は「Bliss」表記と型番のみの表記の両方で出品されていますが同一製品です。",
        "brondell-swash-1400": "1400 と 1000 の主な違いは加温方式です。瞬間式の 1400 であることを確認してください。",
        "kohler-purewash-e930": "自分の便器と寸法を突き合わせてください。Kohler は自社便器に合わせた寸法設計です。",
        "tushy-classic-3-0": "Classic は冷水のみです。温水版の TUSHY Spa は別製品で、給湯配管が必要です。",
      },
      pinDescription: "温水洗浄便座で最も多い失敗はノズルでも湯温でもなく、便器横にコンセントが無いことと便器形状の不一致です。電源不要タイプも含めて5製品を比較。",
    },
    translations: BIDET_TR,
  },

  {
    slug: "best-hack-squat-machine-2026",
    category: "fitness",
    offers: [
      { id: "body-solid-glph1100" }, { id: "titan-fitness-plate-loaded-hack-squat" },
      { id: "powertec-compact-leg-sled" }, { id: "valor-fitness-cc-10" },
      { id: "tds-premier-hack-squat" },
    ],
    en: {
      title: "Best Hack Squat Machine 2026: 5 Compared",
      description:
        "Body-Solid GLPH1100, Titan plate-loaded, Powertec Compact Leg Sled, Valor CC-10 and TDS Premier compared on carriage angle, footplate position, footprint and steel gauge — the things that decide whether it fits and how it feels.",
      lede:
        "Hack squat machines are not separated by their maximum load — at home you will almost never reach it. They are separated by the carriage angle and by whether the thing actually fits in your room.",
      methodology: METHOD_EN,
      sections: [
        {
          heading: "Measure the room before you compare the machines",
          paragraphs: [
            "This is the step most buyers skip and the one that most often ends in a return. A full-size hack squat sled is long, and the length that matters is not the frame length but the length plus the space a person needs to load plates at the back and step clear at the front. Add roughly two feet at each end to the stated footprint.",
            "Ceiling height matters less than on a Smith machine but is not free — the carriage sits at an angle and the top of the shoulder pads at full extension is higher than the frame's static height. A basement with ducts at seven feet will rule out the taller commercial frames.",
            "The last dimension is the doorway. These machines ship as heavy freight in several boxes and are assembled in place, which is fine, but the assembled frame cannot usually be moved through a standard interior door afterwards. Decide where it lives before it arrives.",
          ],
        },
        {
          heading: "Carriage angle and footplate position decide how it feels",
          paragraphs: [
            "The angle of the carriage rails relative to the floor sets how much of the load runs through the quadriceps versus the hips. A steeper angle biases quads more; a shallower angle allows more hip involvement and generally lets a lifter use more weight. Most fixed machines are somewhere around 45 degrees, and none of the machines in this group let you change it.",
            "Footplate position is what you can change, and it does most of the work. Feet higher on the plate shifts load toward the glutes and hamstrings and reduces knee flexion; feet lower and closer together biases quads and increases knee travel. A large plate with deep knurling is worth more than an extra hundred pounds of rated capacity, because it is the adjustment you will make every session.",
            "Combination machines that also do leg press change the effective angle when you convert, which is a genuine advantage in movement variety and the main argument for the Body-Solid over a dedicated sled.",
          ],
        },
        {
          heading: "Plate-loaded vs the rated capacity number",
          paragraphs: [
            "Every machine here is plate-loaded rather than selectorised, which is normal in this category and keeps the price down. Rated capacities in the specifications run from several hundred to over a thousand pounds, and for home use this number is close to irrelevant — the practical ceiling is how many plates physically fit on the pegs, and how many plates you own.",
            "What the steel gauge does affect is rigidity and noise. The 11-gauge 2x3-inch mainframe on the Body-Solid does not flex or rattle under load in the way lighter-gauge frames do. That difference is felt at moderate weights, well below any rated limit, and it is the honest reason to spend more.",
            "Linear bearings versus bushings is the other build distinction. Bearings run smoother and quieter and cost more; bushings are serviceable and cheaper and develop a small amount of play over time. Neither is unsafe. The bearing machines simply feel better on the descent.",
          ],
        },
        {
          heading: "Safety catches, and what to check on delivery",
          paragraphs: [
            "The safety catch mechanism is the part to inspect carefully, because it is the part you rely on at failure. Look for multiple catch positions along the travel rather than one fixed stop, and for a rotating handle that engages positively rather than a hook that must be aligned by feel. Being able to set the catch at a height you can reach while under load, without letting go, is the point.",
            "On delivery, before adding weight: check that the carriage runs the full travel smoothly by hand, that both catch handles engage at every position, and that the frame does not rock on the floor. Frame twist from shipping is not rare and is far easier to correct before the machine is fully torqued down.",
            "Owner reviews across this category converge on two complaints — assembly instructions and shipping damage — rather than on the machines' behaviour in use. Budget several hours and inspect the boxes before the courier leaves.",
          ],
        },
      ],
      faqs: [
        { q: "Do I need a hack squat machine if I already have a squat rack?", a: "Not as a replacement. It is a supplementary movement — the fixed path lets you load the quads with the torso supported, which is useful for volume work and for training around a back issue. As the only leg station in a home gym, a rack is more versatile." },
        { q: "Hack squat or leg press?", a: "The hack squat keeps you upright with the back supported against the pad and moves the load along the spine's axis; the leg press seats you and moves the load away from you. They train the same muscles with different joint angles. A combination machine is the answer if you want both without two frames." },
        { q: "How much space does one need?", a: "Take the stated footprint and add roughly two feet at each end for loading plates and stepping clear. Also confirm the machine cannot be moved through an interior door once assembled — decide its final position before delivery." },
        { q: "Is a higher rated capacity worth paying for?", a: "For home use, rarely. The practical limit is how many plates fit on the pegs and how many you own. What the heavier steel actually buys is rigidity and quiet at moderate weights, which is a different and more honest reason to spend more." },
      ],
      products: {
        "body-solid-glph1100": { badge: "🏆 Best overall", review: "The GLPH1100 is the pick because it solves two problems with one footprint: it is a hack squat and a leg press, and converting between them means moving the back pad and the footplate rather than rebuilding anything. The 11-gauge 2x3-inch mainframe is the other reason — it does not flex or rattle at weights well below its rated limit, which is what you actually feel. It is large and the assembly is long.", pros: ["Hack squat and leg press in one footprint", "11-gauge mainframe is genuinely rigid under load", "Quick conversion between the two movements"], cons: ["Large footprint even for a combo machine", "Long assembly", "Heavier than one person should move alone"] },
        "titan-fitness-plate-loaded-hack-squat": { badge: "💰 Best value", review: "The Titan is the dedicated sled at the price where combination machines are not yet an option. Fixed carriage angle, linear bearings and multiple safety catch positions cover the fundamentals, and dropping the leg press conversion is what buys the lower price and the smaller footprint. Fit and finish is the compromise, and shipping damage is the recurring theme in owner reports — inspect the boxes on delivery.", pros: ["Dedicated sled at a low price", "Linear bearings, smooth travel", "Multiple safety catch positions"], cons: ["No leg press conversion", "Finish quality is inconsistent", "Shipping damage reported more often than average"] },
        "powertec-compact-leg-sled": { badge: "📐 Best for small spaces", review: "The Compact Leg Sled is the answer when the room is the binding constraint. It runs both hack squat and leg press patterns in a frame designed to fit a single garage bay, which is a real engineering achievement in this category. The trade is honest and unavoidable: the carriage travel is shorter than a full-size machine, so the range of motion at the bottom is reduced.", pros: ["Fits a single garage bay", "Both hack squat and leg press patterns", "Well-finished for the price"], cons: ["Shorter carriage travel limits range of motion", "Not as rigid as the Body-Solid", "Loading pegs are tight for wide plates"] },
        "valor-fitness-cc-10": { badge: "🔁 Most versatile frame", review: "The CC-10's distinguishing feature is that the carriage runs outside the uprights, so the bar path clears the body and the same frame handles deadlift and shrug patterns as well as hack squats. That versatility is the reason to choose it. The steel is lighter gauge than the Body-Solid and you can feel it — there is more flex and more noise at the top of a heavy set.", pros: ["Hack squat, deadlift and shrug on one frame", "Carriage outside the uprights clears the body", "Lower price than the combo machines"], cons: ["Lighter-gauge steel flexes noticeably", "Noisier under load", "Shoulder pads are thin"] },
        "tds-premier-hack-squat": { badge: "🏋️ Best commercial build", review: "The TDS is built to gym-floor standards — heavy-gauge uprights, a wide deeply knurled footplate, and the solidity that follows from both. If you train heavy and want the machine to feel like the one at a commercial gym, this is it. The corollary is dimensional: it is sized for a gym floor, so check ceiling height and door width before ordering rather than after.", pros: ["Commercial-grade rigidity", "Wide, deeply knurled footplate", "Feels like a gym-floor machine"], cons: ["Sized for a gym, not a spare room", "Expensive", "Hack squat only — no leg press conversion"] },
      },
      offerNotes: {
        "body-solid-glph1100": "Body-Solid sells the GLPH1100 with and without the calf block; confirm which the listing includes.",
        "titan-fitness-plate-loaded-hack-squat": "Titan revises this frame periodically — check the current listing photos rather than older reviews.",
        "powertec-compact-leg-sled": "Powertec's compact and full-size sleds share naming; match the stated footprint.",
        "valor-fitness-cc-10": "The CC-10 ships in multiple boxes that can arrive separately; confirm all boxes before assembly.",
        "tds-premier-hack-squat": "Freight delivery is typically kerbside — arrange help for moving it inside.",
      },
      pinDescription: "Hack squat machines are not separated by maximum load — at home you will never reach it. They are separated by carriage angle, footplate position and whether the thing fits. Five compared.",
    },
    ja: {
      title: "ハックスクワットマシンのおすすめ2026：5製品を比較",
      description:
        "Body-Solid GLPH1100、Titan プレートロード式、Powertec コンパクトレッグスレッド、Valor CC-10、TDS Premier をキャリッジ角度・フットプレート位置・設置寸法・鋼材の厚みで比較。設置可否と使用感を決めるのはこの4点です。",
      lede:
        "ハックスクワットマシンの差は最大重量ではありません。家庭ではまず上限に届きません。差はキャリッジの角度と、そもそもその部屋に入るかどうかです。",
      methodology: METHOD_JA,
      sections: [
        {
          heading: "マシンを比べる前に部屋を測る",
          paragraphs: [
            "多くの買い手が飛ばす工程であり、返品に至る原因として最も多い工程でもあります。フルサイズのハックスクワットスレッドは長く、しかも効いてくるのはフレームの長さではなく「フレーム長＋後方でプレートを差す人のスペース＋前方で降りるスペース」です。公称の設置寸法の両端におよそ60cmずつ足してください。",
            "天井高はスミスマシンほどシビアではありませんが無視もできません。キャリッジは斜めに走るため、伸展位でのショルダーパッド上端はフレームの静止時高さより高くなります。ダクトが2.1mの高さにある地下室では、背の高い業務用フレームは除外されます。",
            "最後の寸法は出入口です。これらのマシンは複数の箱で重量物として届き、その場で組み立てます。それ自体は問題ありませんが、組み上がったフレームは通常、室内の標準的な扉を通せません。届く前に置き場所を決めてください。",
          ],
        },
        {
          heading: "キャリッジ角度とフットプレート位置が使用感を決める",
          paragraphs: [
            "レールの床に対する角度が、負荷を大腿四頭筋に流すか股関節に流すかを決めます。角度が立っているほど四頭筋寄り、寝ているほど股関節の関与が増え、一般に扱える重量は増えます。固定式の多くは45度前後で、この中のどのマシンも角度は変えられません。",
            "変えられるのはフットプレート上の足の位置で、実際の仕事の大半をここが担います。足を高く置けば殿筋・ハムストリングス寄りになり膝の屈曲は減り、低く狭く置けば四頭筋寄りになり膝の移動量が増えます。定格容量が100kg多いことより、広く深いローレット加工のプレートの方が価値があります。毎回いじるのがこの調整だからです。",
            "レッグプレスを兼ねるコンボ機は、切り替えたときに実効角度が変わります。これは動作バリエーションとして本物の利点であり、専用スレッドではなく Body-Solid を選ぶ主な論拠です。",
          ],
        },
        {
          heading: "プレートロード式と「定格容量」の数字",
          paragraphs: [
            "ここに挙げたマシンは全てウェイトスタックではなくプレートロード式で、このカテゴリでは普通のことであり価格も抑えられます。仕様上の定格容量は数百kgから500kg超まで幅がありますが、家庭用ではこの数字はほぼ無意味です。実際の上限は「ペグに物理的に何枚差せるか」と「自分が何枚持っているか」です。",
            "鋼材の厚みが実際に効くのは剛性と静粛性です。Body-Solid の11ゲージ・2×3インチのメインフレームは、薄い鋼材のフレームのように荷重でたわんだりガタついたりしません。この差は定格の遥か手前、中程度の重量で体感できます。高い方を買う正直な理由はここです。",
            "もう1つの作りの違いはリニアベアリングかブッシュか。ベアリングは滑らかで静かで高価、ブッシュは交換可能で安価ですが時間とともにわずかな遊びが出ます。どちらも危険ではありません。ベアリング機は下降時の感触が単純に良い、という差です。",
          ],
        },
        {
          heading: "セーフティキャッチと、納品時に確認すること",
          paragraphs: [
            "セーフティキャッチ機構は入念に見るべき部分です。潰れたときに頼るのがここだからです。1箇所固定の止まりではなく、可動域に沿って複数のキャッチ位置があること、そして手探りで引っ掛ける方式ではなく確実に噛む回転ハンドル式であることを見てください。要点は「荷重を受けたまま、手を離さずに届く高さでキャッチをかけられる」ことです。",
            "納品時、重量を足す前に確認すべきこと。キャリッジを手で全ストローク滑らかに動かせるか、両側のキャッチハンドルが全位置で噛むか、フレームが床でガタつかないか。輸送によるフレームの歪みは珍しくなく、本締めする前の方が遥かに直しやすいです。",
            "このカテゴリの購入者レビューは、使用感ではなく「組立説明書」と「輸送破損」の2点に不満が集中します。数時間を確保し、配送業者が帰る前に箱を確認してください。",
          ],
        },
      ],
      faqs: [
        { q: "スクワットラックが既にあってもハックスクワットマシンは必要ですか？", a: "置き換えとしては不要です。補助種目のためのマシンで、軌道が固定されているため上体を支えたまま四頭筋に荷重をかけられます。ボリュームを積む用途や腰を避けて脚を鍛える用途で有用です。ホームジムに脚の設備が1つだけなら、ラックの方が汎用性があります。" },
        { q: "ハックスクワットとレッグプレスのどちらを選ぶべきですか？", a: "ハックスクワットは背中をパッドに預けて立った姿勢を保ち、脊柱の軸方向に荷重が動きます。レッグプレスは座って荷重を身体から離す方向に動かします。同じ筋群を異なる関節角度で鍛えます。両方欲しくてフレームを2台置けないならコンボ機が答えです。" },
        { q: "どのくらいの設置スペースが必要ですか？", a: "公称の設置寸法に、プレートを差す側と降りる側でそれぞれ約60cmを足してください。併せて、組み立て後は室内の扉を通せないことを前提に、納品前に最終的な設置位置を決めてください。" },
        { q: "定格容量が大きい方に金を払う価値はありますか？", a: "家庭用ではほとんどありません。実際の上限はペグに差せる枚数と手持ちの枚数です。厚い鋼材が実際に買っているのは中程度の重量での剛性と静粛性であり、こちらの方が高い方を買う正直な理由になります。" },
      ],
      products: {
        "body-solid-glph1100": { badge: "🏆 総合best", review: "1つの設置面積で2つの問題を解くので本命です。ハックスクワットとレッグプレスを兼ね、切り替えは背もたれとフットプレートの移動だけで、組み直しは不要。もう1つの理由は11ゲージ・2×3インチのメインフレームで、定格の遥か手前の重量でもたわまずガタつきません。実際に体感するのはここです。大きく、組立は長時間かかります。", pros: ["1台分の設置面積でハックスクワットとレッグプレス", "11ゲージのメインフレームは荷重下でも本当に剛性がある", "2種目の切替が速い"], cons: ["コンボ機としても設置面積が大きい", "組立が長い", "1人で動かすには重すぎる"] },
        "titan-fitness-plate-loaded-hack-squat": { badge: "💰 コスパbest", review: "コンボ機がまだ選択肢に入らない価格帯における専用スレッドです。固定のキャリッジ角度、リニアベアリング、複数のセーフティキャッチ位置と基本は押さえており、レッグプレス兼用を捨てたことが安さと設置面積の小ささを買っています。妥協点は仕上げの精度で、購入者報告で繰り返し出てくるのが輸送破損です。納品時に箱を確認してください。", pros: ["専用スレッドとして安価", "リニアベアリングで動きが滑らか", "セーフティキャッチ位置が複数"], cons: ["レッグプレス兼用ではない", "仕上げの品質にばらつき", "輸送破損の報告が平均より多い"] },
        "powertec-compact-leg-sled": { badge: "📐 狭い場所best", review: "部屋の広さが制約条件になっている場合の答えです。ガレージ1台分に収まる寸法のフレームで、ハックスクワットとレッグプレスの両方の動作を実現しており、このカテゴリでは本当に立派な設計です。引き換えは正直かつ回避不能で、キャリッジの移動距離がフルサイズ機より短く、ボトムでの可動域が減ります。", pros: ["ガレージ1台分に収まる", "ハックスクワットとレッグプレスの両動作に対応", "価格の割に仕上げが良い"], cons: ["キャリッジ移動が短く可動域が制限される", "Body-Solid ほどの剛性はない", "幅のあるプレートにはペグが窮屈"] },
        "valor-fitness-cc-10": { badge: "🔁 汎用性best", review: "特徴はキャリッジが支柱の外側を走る点で、バー軌道が身体と干渉せず、同じフレームでデッドリフトやシュラッグの動作にも対応します。これを選ぶ理由はこの汎用性です。鋼材は Body-Solid より薄く、それは体感できます。重いセットの終盤ではたわみと音が増えます。", pros: ["1台でハックスクワット・デッドリフト・シュラッグ", "キャリッジが支柱の外側を走り身体と干渉しない", "コンボ機より安い"], cons: ["薄い鋼材のたわみが分かる", "荷重時の音が大きい", "ショルダーパッドが薄い"] },
        "tds-premier-hack-squat": { badge: "🏋️ 業務品質best", review: "ジム床基準で作られています。厚肉の支柱、広く深いローレット加工のフットプレート、そしてその2つから来る堅牢さ。重い重量を扱い、商業ジムにあるマシンと同じ感触が欲しいならこれです。裏返しは寸法で、ジム床向けのサイズなので、発注後ではなく発注前に天井高と扉幅を確認してください。", pros: ["業務グレードの剛性", "広く深いローレットのフットプレート", "商業ジムのマシンと同じ感触"], cons: ["空き部屋ではなくジム床向けの寸法", "高価", "ハックスクワット専用でレッグプレス兼用ではない"] },
      },
      offerNotes: {
        "body-solid-glph1100": "GLPH1100 はカーフブロック付きと無しの両方が売られています。出品にどちらが含まれるか確認してください。",
        "titan-fitness-plate-loaded-hack-squat": "Titan はこのフレームを定期的に改訂しています。古いレビューではなく現行の出品写真を見てください。",
        "powertec-compact-leg-sled": "Powertec のコンパクト版とフルサイズ版は名称が似ています。公称の設置寸法で合わせてください。",
        "valor-fitness-cc-10": "CC-10 は複数の箱で出荷され、別々に届くことがあります。組立前に全ての箱が揃っているか確認を。",
        "tds-premier-hack-squat": "重量物配送は通常、路上渡しです。屋内へ運び入れる人手を手配してください。",
      },
      pinDescription: "ハックスクワットマシンの差は最大重量ではありません。家庭では上限に届きません。差はキャリッジ角度・フットプレート位置・そして部屋に入るかどうかです。5製品を比較。",
    },
    translations: HACK_SQUAT_TR,
  },
];
