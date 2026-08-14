import type { ArticleDef, NewOffer, Translation } from "./batch-articles-types";

/**
 * batch12 高単価バッチ (2026-08-14)
 *
 * 選定根拠: `~/Dropbox/00_集客統合/growth/winnable-value-queue.mjs` の実測。
 *   pickly は「一般名詞の head」では順位が付かない(mattress は需要80,529に対し
 *   Bing表示2)。表示が取れているのは具体的な単品テーマ。しかしその帯は単価が低く、
 *   1クリック¥8 に留まっていた。
 *   → **勝てる粒度のまま価格帯だけ上げる**のがこのバッチの狙い。
 *   portable AC (需要8,455 / 成約単価$40)、window AC (7,242 / $32)、
 *   smith machine (5,002 / $36) が需要実測の上位3本。
 *
 * ★methodology は buildTranslations を使わない。あの共通ヘルパは全言語に
 *   「N日間テストした」という文言を焼き込むが、pickly は一次試験をしていない。
 *   過去に同じ書き方で153記事・2,290箇所を修正している。ここでは
 *   「何を見て、何を見ていないか」を正直に書く。
 */

export const BATCH12_HIGHVALUE_OFFERS: NewOffer[] = [
  // --- best-portable-air-conditioner-2026 ---
  {
    id: "midea-duo-map14hs1tbl",
    nameEn: "Midea Duo MAP14HS1TBL",
    nameJa: "Midea Duo MAP14HS1TBL",
    descEn: "Dual-hose inverter portable AC, 14,000 BTU ASHRAE. Heat-pump model, so it also runs as a heater. The dual-hose design avoids pulling conditioned air back out of the room.",
    descJa: "デュアルホース・インバーター式ポータブルエアコン、14,000 BTU（ASHRAE）。ヒートポンプ式で暖房も可能。二重ホースなので室内の冷気を排気に巻き込まない。",
    priceMin: "$500", priceMax: "$700", category: "home", badge: "🏆",
    url: "https://www.amazon.com/s?k=Midea+Duo+MAP14HS1TBL",
  },
  {
    id: "whynter-arc-14s",
    nameEn: "Whynter ARC-14S",
    nameJa: "Whynter ARC-14S",
    descEn: "Dual-hose portable AC, 14,000 BTU ASHRAE, no inverter. The long-running budget pick for dual-hose — fixed-speed compressor, so it cycles rather than modulates.",
    descJa: "デュアルホース式、14,000 BTU（ASHRAE）、インバーターなし。デュアルホースの定番廉価モデル。固定速コンプレッサーなので出力調整ではなくオンオフ制御。",
    priceMin: "$400", priceMax: "$550", category: "home", badge: "💰",
    url: "https://www.amazon.com/s?k=Whynter+ARC-14S",
  },
  {
    id: "lg-lp1419ivsm",
    nameEn: "LG LP1419IVSM",
    nameJa: "LG LP1419IVSM",
    descEn: "Dual-inverter single-hose portable AC, 14,000 BTU. LG's inverter compressor is the quietest of the group on paper and the reason to pick it over a cheaper fixed-speed unit.",
    descJa: "デュアルインバーター、シングルホース、14,000 BTU。インバーター制御でカタログ上の運転音がこの中で最も低く、固定速機に対する優位点はここ。",
    priceMin: "$450", priceMax: "$650", category: "home", badge: "🔇",
    url: "https://www.amazon.com/s?k=LG+LP1419IVSM+portable+air+conditioner",
  },
  {
    id: "honeywell-hl10cesw",
    nameEn: "Honeywell HL10CESWK",
    nameJa: "Honeywell HL10CESWK",
    descEn: "Single-hose portable AC, 10,000 BTU ASHRAE. Small-room unit with a dehumidify-only mode and a washable filter. The realistic pick for a bedroom under 300 sq ft.",
    descJa: "シングルホース式、10,000 BTU（ASHRAE）。除湿単独モードと洗えるフィルター付き。28㎡以下の寝室向けの現実的な選択肢。",
    priceMin: "$300", priceMax: "$420", category: "home", badge: "🛏️",
    url: "https://www.amazon.com/s?k=Honeywell+HL10CESWK+portable+air+conditioner",
  },
  {
    id: "blackdecker-bpact08wt",
    nameEn: "Black+Decker BPACT08WT",
    nameJa: "Black+Decker BPACT08WT",
    descEn: "Single-hose portable AC, 8,000 BTU ASHRAE. The cheapest unit here and the one where the ASHRAE-vs-SACC gap matters most — the real-world capacity is roughly half the headline number.",
    descJa: "シングルホース式、8,000 BTU（ASHRAE）。この中で最安。ASHRAE表記とSACC実効値の差が最も効く機種で、実効能力は表記の約半分と考えるべき。",
    priceMin: "$250", priceMax: "$350", category: "home", badge: "💵",
    url: "https://www.amazon.com/s?k=Black+Decker+BPACT08WT",
  },

  // --- best-window-air-conditioner-2026 ---
  {
    id: "midea-u-maw08v1qwt",
    nameEn: "Midea U MAW08V1QWT",
    nameJa: "Midea U MAW08V1QWT",
    descEn: "8,000 BTU U-shaped inverter window AC. The U-bracket lets the sash close through the middle of the unit, which is why it measures far quieter than a conventional window box.",
    descJa: "8,000 BTU、U字型インバーター窓用エアコン。窓枠が本体の中央を通る構造のため、従来の箱型より運転音が大幅に低い。",
    priceMin: "$330", priceMax: "$450", category: "home", badge: "🏆",
    url: "https://www.amazon.com/s?k=Midea+U+MAW08V1QWT",
  },
  {
    id: "ge-profile-phnt10cc",
    nameEn: "GE Profile ClearView PHNT10CC",
    nameJa: "GE Profile ClearView PHNT10CC",
    descEn: "10,000 BTU inverter window AC with a low-profile body that sits below the sight line, so the window view is not blocked. The premium pick of the group.",
    descJa: "10,000 BTU、インバーター式。本体が視線より下に収まる薄型設計で窓の眺望を塞がない。このグループの上位機。",
    priceMin: "$450", priceMax: "$650", category: "home", badge: "🪟",
    url: "https://www.amazon.com/s?k=GE+Profile+ClearView+PHNT10CC",
  },
  {
    id: "lg-lw8017ersm",
    nameEn: "LG LW8017ERSM",
    nameJa: "LG LW8017ERSM",
    descEn: "8,000 BTU conventional window AC with Wi-Fi. Fixed-speed compressor, so it is louder than the inverter units but noticeably cheaper and simpler to service.",
    descJa: "8,000 BTU、Wi-Fi対応の従来型。固定速コンプレッサーのためインバーター機より運転音は大きいが、価格が明確に安く構造も単純。",
    priceMin: "$260", priceMax: "$370", category: "home", badge: "📶",
    url: "https://www.amazon.com/s?k=LG+LW8017ERSM",
  },
  {
    id: "frigidaire-fhww084wd1",
    nameEn: "Frigidaire FHWW084WD1",
    nameJa: "Frigidaire FHWW084WD1",
    descEn: "8,000 BTU window AC with a washable filter and a straightforward install kit. The value pick — no inverter, no app dependency, fewest things to go wrong.",
    descJa: "8,000 BTU、洗えるフィルターと簡素な取付キット。インバーターもアプリ依存もない分、壊れる箇所が少ないコスパ枠。",
    priceMin: "$230", priceMax: "$330", category: "home", badge: "💰",
    url: "https://www.amazon.com/s?k=Frigidaire+FHWW084WD1",
  },
  {
    id: "windmill-ac-8000",
    nameEn: "Windmill AC 8,000 BTU",
    nameJa: "Windmill AC 8,000 BTU",
    descEn: "8,000 BTU window AC designed around upward-facing airflow and a tool-free install. Ships with a reusable filter and a design-led enclosure; priced above the commodity units.",
    descJa: "8,000 BTU、上向き送風と工具不要の取付を前提に設計された窓用機。再利用可能フィルターとデザイン重視の筐体で、汎用機より価格は上。",
    priceMin: "$350", priceMax: "$470", category: "home", badge: "🎨",
    url: "https://www.amazon.com/s?k=Windmill+air+conditioner+8000+BTU",
  },

  // --- best-smith-machine-2026 ---
  {
    id: "force-usa-g3",
    nameEn: "Force USA G3 All-In-One Trainer",
    nameJa: "Force USA G3 オールインワントレーナー",
    descEn: "Power rack, Smith machine, and functional trainer in one frame. The Smith bar runs on linear bearings and the unit accepts a bench inside the rack — the pick if one machine has to cover a whole garage gym.",
    descJa: "パワーラック・スミスマシン・ファンクショナルトレーナーを1つのフレームに統合。スミスバーはリニアベアリング式で、ラック内にベンチを入れられる。1台でホームジムを完結させたい場合の選択肢。",
    priceMin: "$1,800", priceMax: "$2,400", category: "fitness", badge: "🏆",
    url: "https://www.amazon.com/s?k=Force+USA+G3+All-In-One+Trainer",
  },
  {
    id: "body-solid-gs348q",
    nameEn: "Body-Solid Series 7 GS348Q",
    nameJa: "Body-Solid Series 7 GS348Q",
    descEn: "Commercial-grade Smith machine on a 2x3 inch 11-gauge steel frame with a counter-balanced bar. Built for a light-commercial duty cycle rather than a spare bedroom.",
    descJa: "2×3インチ・11ゲージ鋼フレームにカウンターバランス付きバーを組んだ業務グレード機。家庭用というより準商用の使用頻度を前提とした構造。",
    priceMin: "$2,000", priceMax: "$2,600", category: "fitness", badge: "🏋️",
    url: "https://www.amazon.com/s?k=Body-Solid+Series+7+GS348Q+Smith+Machine",
  },
  {
    id: "titan-fitness-smith",
    nameEn: "Titan Fitness Smith Machine",
    nameJa: "Titan Fitness スミスマシン",
    descEn: "Mid-price Smith machine with a bushing-guided bar and integrated weight-plate storage. The usual step up from the entry tier without going to commercial pricing.",
    descJa: "ブッシュ式ガイドのバーとプレート収納を備えた中価格帯。入門機からの標準的な一段上で、業務価格帯までは行かない位置づけ。",
    priceMin: "$700", priceMax: "$1,100", category: "fitness", badge: "⚖️",
    url: "https://www.amazon.com/s?k=Titan+Fitness+Smith+Machine",
  },
  {
    id: "marcy-md-9010g",
    nameEn: "Marcy MD-9010G Smith Cage",
    nameJa: "Marcy MD-9010G スミスケージ",
    descEn: "Smith cage with a pulley station, pull-up bar, and included bench. The most complete package under $1,000, at the cost of a lighter frame than the commercial units.",
    descJa: "プーリー・懸垂バー・ベンチが付属するスミスケージ。$1,000以下では最も装備が揃うが、フレーム剛性は業務機に劣る。",
    priceMin: "$650", priceMax: "$950", category: "fitness", badge: "📦",
    url: "https://www.amazon.com/s?k=Marcy+MD-9010G+Smith+Cage",
  },
  {
    id: "sunny-sf-bh6810",
    nameEn: "Sunny Health & Fitness SF-BH6810",
    nameJa: "Sunny Health & Fitness SF-BH6810",
    descEn: "Entry-level Smith machine with a fixed bar path and a modest weight ceiling. Suited to lighter loads and small spaces, not to progressive heavy squatting.",
    descJa: "固定軌道・耐荷重控えめの入門機。軽負荷と省スペース向けで、高重量スクワットの継続的な使用には向かない。",
    priceMin: "$550", priceMax: "$850", category: "fitness", badge: "🔰",
    url: "https://www.amazon.com/s?k=Sunny+Health+Fitness+SF-BH6810+Smith+Machine",
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

const PORTABLE_AC_TR = tr(
  {
    "zh-CN": "2026年最佳移动空调：5款对比（单软管与双软管）",
    "zh-TW": "2026年最佳移動式冷氣：5款比較（單管與雙管）",
    ko: "2026 최고의 이동식 에어컨: 5종 비교 (싱글 호스 vs 듀얼 호스)",
    es: "Mejor aire acondicionado portátil 2026: 5 modelos comparados",
    "pt-BR": "Melhor ar-condicionado portátil 2026: 5 modelos comparados",
    fr: "Meilleur climatiseur mobile 2026 : 5 modèles comparés",
    de: "Bestes mobiles Klimagerät 2026: 5 Modelle im Vergleich",
    it: "Miglior condizionatore portatile 2026: 5 modelli a confronto",
    ru: "Лучший мобильный кондиционер 2026: сравнение 5 моделей",
    ar: "أفضل مكيف هواء متنقل 2026: مقارنة 5 موديلات",
    hi: "2026 का सर्वश्रेष्ठ पोर्टेबल एयर कंडीशनर: 5 मॉडल की तुलना",
    id: "AC Portabel Terbaik 2026: Perbandingan 5 Model",
    th: "แอร์เคลื่อนที่ที่ดีที่สุด 2026: เปรียบเทียบ 5 รุ่น",
    vi: "Máy lạnh di động tốt nhất 2026: So sánh 5 mẫu",
    tr: "En İyi Portatif Klima 2026: 5 Model Karşılaştırması",
  },
  {
    "zh-CN": "Midea Duo、Whynter ARC-14S、LG、Honeywell、Black+Decker 的规格对比。重点解释 ASHRAE 与 SACC 的差异，以及双软管为何更省电。",
    "zh-TW": "Midea Duo、Whynter ARC-14S、LG、Honeywell、Black+Decker 的規格比較。說明 ASHRAE 與 SACC 的差異，以及雙管為何更省電。",
    ko: "Midea Duo, Whynter ARC-14S, LG, Honeywell, Black+Decker 사양 비교. ASHRAE와 SACC 표기 차이, 듀얼 호스가 효율이 높은 이유를 정리했습니다.",
    es: "Comparativa de fichas técnicas: Midea Duo, Whynter ARC-14S, LG, Honeywell y Black+Decker. Qué significa realmente ASHRAE frente a SACC y por qué la doble manguera rinde más.",
    "pt-BR": "Comparativo de especificações: Midea Duo, Whynter ARC-14S, LG, Honeywell e Black+Decker. O que ASHRAE significa frente ao SACC e por que a mangueira dupla rende mais.",
    fr: "Comparatif des fiches techniques : Midea Duo, Whynter ARC-14S, LG, Honeywell et Black+Decker. Ce que vaut vraiment l'ASHRAE face au SACC, et pourquoi le double tuyau est plus efficace.",
    de: "Datenblatt-Vergleich: Midea Duo, Whynter ARC-14S, LG, Honeywell und Black+Decker. Was ASHRAE gegenüber SACC wirklich bedeutet und warum Doppelschlauch effizienter ist.",
    it: "Confronto delle schede tecniche: Midea Duo, Whynter ARC-14S, LG, Honeywell e Black+Decker. Cosa significa davvero ASHRAE rispetto a SACC e perché il doppio tubo rende di più.",
    ru: "Сравнение характеристик: Midea Duo, Whynter ARC-14S, LG, Honeywell и Black+Decker. Чем ASHRAE отличается от SACC и почему двухшланговая схема эффективнее.",
    ar: "مقارنة المواصفات: Midea Duo وWhynter ARC-14S وLG وHoneywell وBlack+Decker. الفرق بين ASHRAE وSACC ولماذا يكون الخرطومان أكفأ.",
    hi: "स्पेसिफिकेशन तुलना: Midea Duo, Whynter ARC-14S, LG, Honeywell और Black+Decker। ASHRAE बनाम SACC का असली अर्थ और डुअल-होज़ अधिक कुशल क्यों है।",
    id: "Perbandingan spesifikasi: Midea Duo, Whynter ARC-14S, LG, Honeywell, dan Black+Decker. Arti ASHRAE versus SACC dan alasan selang ganda lebih efisien.",
    th: "เปรียบเทียบสเปก: Midea Duo, Whynter ARC-14S, LG, Honeywell และ Black+Decker พร้อมอธิบายความต่างของ ASHRAE กับ SACC และเหตุผลที่ท่อคู่ประหยัดกว่า",
    vi: "So sánh thông số: Midea Duo, Whynter ARC-14S, LG, Honeywell và Black+Decker. ASHRAE khác SACC ra sao và vì sao ống đôi hiệu quả hơn.",
    tr: "Teknik veri karşılaştırması: Midea Duo, Whynter ARC-14S, LG, Honeywell ve Black+Decker. ASHRAE ile SACC farkı ve çift hortumun neden daha verimli olduğu.",
  },
  {
    "zh-CN": "标称制冷量并不等于实际制冷量。这里说明差在哪里，以及五款机型分别适合多大的房间。",
    "zh-TW": "標示制冷量不等於實際制冷量。這裡說明差異在哪，以及五款機型各自適合的坪數。",
    ko: "표기 냉방 능력은 실제 능력과 다릅니다. 그 차이가 어디서 생기는지, 다섯 기종이 각각 몇 평에 맞는지 정리했습니다.",
    es: "La potencia declarada no es la potencia real. Aquí está de dónde viene la diferencia y a qué tamaño de habitación corresponde cada uno de los cinco modelos.",
    "pt-BR": "A potência declarada não é a potência real. Veja de onde vem a diferença e a que tamanho de cômodo cada um dos cinco modelos corresponde.",
    fr: "La puissance annoncée n'est pas la puissance réelle. Voici d'où vient l'écart et à quelle surface correspond chacun des cinq modèles.",
    de: "Die angegebene Kühlleistung ist nicht die tatsächliche. Hier steht, woher die Differenz kommt und für welche Raumgröße jedes der fünf Geräte taugt.",
    it: "La potenza dichiarata non è quella reale. Ecco da dove nasce la differenza e a quale metratura corrisponde ciascuno dei cinque modelli.",
    ru: "Заявленная мощность не равна фактической. Разбираем, откуда берётся разница и на какую площадь рассчитана каждая из пяти моделей.",
    ar: "القدرة المعلنة ليست القدرة الفعلية. إليك مصدر الفارق وحجم الغرفة المناسب لكل موديل من الخمسة.",
    hi: "घोषित क्षमता वास्तविक क्षमता नहीं होती। अंतर कहाँ से आता है और पाँचों मॉडल किस आकार के कमरे के लिए हैं।",
    id: "Kapasitas tertera bukan kapasitas nyata. Ini asal perbedaannya dan ukuran ruangan yang cocok untuk masing-masing dari lima model.",
    th: "กำลังทำความเย็นที่ระบุไม่เท่ากับกำลังจริง นี่คือที่มาของส่วนต่าง และขนาดห้องที่เหมาะกับแต่ละรุ่นในห้ารุ่นนี้",
    vi: "Công suất ghi trên nhãn không phải công suất thực. Đây là nguồn gốc của chênh lệch và diện tích phòng phù hợp cho từng mẫu trong năm mẫu.",
    tr: "Etikette yazan soğutma gücü gerçek güç değildir. Farkın nereden geldiği ve beş modelin her birinin hangi oda büyüklüğüne uyduğu burada.",
  },
);

const WINDOW_AC_TR = tr(
  {
    "zh-CN": "2026年最佳窗式空调：5款对比（变频与定频）",
    "zh-TW": "2026年最佳窗型冷氣：5款比較（變頻與定頻）",
    ko: "2026 최고의 창문형 에어컨: 5종 비교 (인버터 vs 정속형)",
    es: "Mejor aire acondicionado de ventana 2026: 5 modelos comparados",
    "pt-BR": "Melhor ar-condicionado de janela 2026: 5 modelos comparados",
    fr: "Meilleur climatiseur de fenêtre 2026 : 5 modèles comparés",
    de: "Bestes Fensterklimagerät 2026: 5 Modelle im Vergleich",
    it: "Miglior condizionatore da finestra 2026: 5 modelli a confronto",
    ru: "Лучший оконный кондиционер 2026: сравнение 5 моделей",
    ar: "أفضل مكيف شباك 2026: مقارنة 5 موديلات",
    hi: "2026 का सर्वश्रेष्ठ विंडो एयर कंडीशनर: 5 मॉडल की तुलना",
    id: "AC Jendela Terbaik 2026: Perbandingan 5 Model",
    th: "แอร์ติดหน้าต่างที่ดีที่สุด 2026: เปรียบเทียบ 5 รุ่น",
    vi: "Máy lạnh cửa sổ tốt nhất 2026: So sánh 5 mẫu",
    tr: "En İyi Pencere Tipi Klima 2026: 5 Model Karşılaştırması",
  },
  {
    "zh-CN": "Midea U、GE Profile ClearView、LG、Frigidaire、Windmill 对比：噪音、安装方式、窗户视野与耗电。",
    "zh-TW": "Midea U、GE Profile ClearView、LG、Frigidaire、Windmill 比較：噪音、安裝方式、窗戶視野與耗電。",
    ko: "Midea U, GE Profile ClearView, LG, Frigidaire, Windmill 비교: 소음, 설치 방식, 창밖 시야, 소비 전력.",
    es: "Midea U, GE Profile ClearView, LG, Frigidaire y Windmill comparados: ruido, instalación, vista de la ventana y consumo.",
    "pt-BR": "Midea U, GE Profile ClearView, LG, Frigidaire e Windmill comparados: ruído, instalação, vista da janela e consumo.",
    fr: "Midea U, GE Profile ClearView, LG, Frigidaire et Windmill comparés : bruit, installation, vue par la fenêtre et consommation.",
    de: "Midea U, GE Profile ClearView, LG, Frigidaire und Windmill im Vergleich: Geräusch, Einbau, Fensterblick und Verbrauch.",
    it: "Midea U, GE Profile ClearView, LG, Frigidaire e Windmill a confronto: rumore, installazione, vista dalla finestra e consumi.",
    ru: "Сравнение Midea U, GE Profile ClearView, LG, Frigidaire и Windmill: шум, монтаж, обзор из окна и потребление.",
    ar: "مقارنة Midea U وGE Profile ClearView وLG وFrigidaire وWindmill: الضجيج والتركيب وإطلالة النافذة والاستهلاك.",
    hi: "Midea U, GE Profile ClearView, LG, Frigidaire और Windmill की तुलना: शोर, इंस्टॉलेशन, खिड़की का दृश्य और बिजली खपत।",
    id: "Perbandingan Midea U, GE Profile ClearView, LG, Frigidaire, dan Windmill: kebisingan, pemasangan, pandangan jendela, dan konsumsi daya.",
    th: "เปรียบเทียบ Midea U, GE Profile ClearView, LG, Frigidaire และ Windmill: เสียง การติดตั้ง ทัศนียภาพหน้าต่าง และการกินไฟ",
    vi: "So sánh Midea U, GE Profile ClearView, LG, Frigidaire và Windmill: độ ồn, lắp đặt, tầm nhìn cửa sổ và điện năng.",
    tr: "Midea U, GE Profile ClearView, LG, Frigidaire ve Windmill karşılaştırması: gürültü, montaj, pencere manzarası ve tüketim.",
  },
  {
    "zh-CN": "窗式空调最大的差别是噪音和窗户被挡住多少。变频机型贵，但差价买到的是什么，这里讲清楚。",
    "zh-TW": "窗型冷氣最大的差別是噪音與擋住多少窗戶。變頻機貴，但貴的部分換到什麼，這裡說清楚。",
    ko: "창문형 에어컨의 차이는 결국 소음과 창을 얼마나 가리는지입니다. 인버터 기종이 비싼 만큼 무엇을 얻는지 정리했습니다.",
    es: "En un equipo de ventana lo que más cambia es el ruido y cuánta ventana tapa. Aquí está qué compras exactamente al pagar por un inverter.",
    "pt-BR": "Em um aparelho de janela, o que mais muda é o ruído e quanto da janela ele tapa. Veja o que você compra de fato ao pagar por um inverter.",
    fr: "Sur un climatiseur de fenêtre, ce qui change vraiment, c'est le bruit et la surface de fenêtre condamnée. Voici ce qu'achète le surcoût d'un modèle inverter.",
    de: "Bei Fenstergeräten entscheiden Geräusch und verdeckte Fensterfläche. Hier steht, was der Aufpreis für ein Inverter-Modell konkret bringt.",
    it: "Su un condizionatore da finestra contano soprattutto il rumore e quanta finestra viene occupata. Ecco cosa compri davvero pagando un inverter.",
    ru: "У оконного кондиционера решают шум и то, сколько окна он закрывает. Разбираем, что именно даёт доплата за инверторную модель.",
    ar: "في مكيفات الشباك يحسم الأمر مستوى الضجيج ومقدار ما يحجبه من النافذة. إليك ما تحصل عليه فعليًا مقابل فارق سعر الإنفرتر.",
    hi: "विंडो एसी में असली फर्क शोर और खिड़की कितनी ढकती है, इसका होता है। इन्वर्टर मॉडल की अतिरिक्त कीमत से आपको क्या मिलता है, यहाँ स्पष्ट है।",
    id: "Pada AC jendela, yang paling menentukan adalah kebisingan dan seberapa banyak jendela tertutup. Ini yang sebenarnya Anda beli saat membayar lebih untuk inverter.",
    th: "สำหรับแอร์ติดหน้าต่าง สิ่งที่ต่างกันจริงคือเสียงและสัดส่วนหน้าต่างที่ถูกบัง นี่คือสิ่งที่ได้จริงเมื่อจ่ายเพิ่มให้รุ่นอินเวอร์เตอร์",
    vi: "Với máy lạnh cửa sổ, khác biệt thật nằm ở độ ồn và phần cửa sổ bị che. Đây là thứ bạn thực sự mua khi trả thêm cho bản inverter.",
    tr: "Pencere tipi klimada asıl fark gürültü ve pencerenin ne kadarını kapattığıdır. Inverter için ödenen farkın karşılığında tam olarak ne alındığı burada.",
  },
);

const SMITH_TR = tr(
  {
    "zh-CN": "2026年最佳史密斯机：5款对比（家用到准商用）",
    "zh-TW": "2026年最佳史密斯機：5款比較（家用到準商用）",
    ko: "2026 최고의 스미스 머신: 5종 비교 (가정용부터 준상업용까지)",
    es: "Mejor máquina Smith 2026: 5 modelos comparados",
    "pt-BR": "Melhor máquina Smith 2026: 5 modelos comparados",
    fr: "Meilleure machine Smith 2026 : 5 modèles comparés",
    de: "Beste Multipresse (Smith Machine) 2026: 5 Modelle im Vergleich",
    it: "Miglior multipower (Smith machine) 2026: 5 modelli a confronto",
    ru: "Лучшая машина Смита 2026: сравнение 5 моделей",
    ar: "أفضل جهاز سميث 2026: مقارنة 5 موديلات",
    hi: "2026 की सर्वश्रेष्ठ स्मिथ मशीन: 5 मॉडल की तुलना",
    id: "Smith Machine Terbaik 2026: Perbandingan 5 Model",
    th: "สมิธแมชชีนที่ดีที่สุด 2026: เปรียบเทียบ 5 รุ่น",
    vi: "Máy Smith tốt nhất 2026: So sánh 5 mẫu",
    tr: "En İyi Smith Machine 2026: 5 Model Karşılaştırması",
  },
  {
    "zh-CN": "Force USA G3、Body-Solid GS348Q、Titan、Marcy MD-9010G、Sunny SF-BH6810 对比：钢材规格、轨道方式、耐重与占地。",
    "zh-TW": "Force USA G3、Body-Solid GS348Q、Titan、Marcy MD-9010G、Sunny SF-BH6810 比較：鋼材規格、軌道方式、耐重與佔地。",
    ko: "Force USA G3, Body-Solid GS348Q, Titan, Marcy MD-9010G, Sunny SF-BH6810 비교: 강재 규격, 가이드 방식, 내하중, 설치 면적.",
    es: "Force USA G3, Body-Solid GS348Q, Titan, Marcy MD-9010G y Sunny SF-BH6810 comparadas: acero, tipo de guía, carga máxima y espacio necesario.",
    "pt-BR": "Force USA G3, Body-Solid GS348Q, Titan, Marcy MD-9010G e Sunny SF-BH6810 comparadas: aço, tipo de guia, carga máxima e espaço necessário.",
    fr: "Force USA G3, Body-Solid GS348Q, Titan, Marcy MD-9010G et Sunny SF-BH6810 comparées : acier, type de guidage, charge maximale et encombrement.",
    de: "Force USA G3, Body-Solid GS348Q, Titan, Marcy MD-9010G und Sunny SF-BH6810 im Vergleich: Stahlprofil, Führung, Maximallast und Stellfläche.",
    it: "Force USA G3, Body-Solid GS348Q, Titan, Marcy MD-9010G e Sunny SF-BH6810 a confronto: acciaio, tipo di guida, carico massimo e ingombro.",
    ru: "Сравнение Force USA G3, Body-Solid GS348Q, Titan, Marcy MD-9010G и Sunny SF-BH6810: профиль стали, тип направляющих, максимальная нагрузка и занимаемая площадь.",
    ar: "مقارنة Force USA G3 وBody-Solid GS348Q وTitan وMarcy MD-9010G وSunny SF-BH6810: مقاطع الفولاذ ونوع المسار والحمل الأقصى والمساحة.",
    hi: "Force USA G3, Body-Solid GS348Q, Titan, Marcy MD-9010G और Sunny SF-BH6810 की तुलना: स्टील स्पेक, गाइड प्रकार, अधिकतम भार और जगह।",
    id: "Perbandingan Force USA G3, Body-Solid GS348Q, Titan, Marcy MD-9010G, dan Sunny SF-BH6810: spesifikasi baja, jenis pemandu, beban maksimum, dan kebutuhan ruang.",
    th: "เปรียบเทียบ Force USA G3, Body-Solid GS348Q, Titan, Marcy MD-9010G และ Sunny SF-BH6810: สเปกเหล็ก รูปแบบราง น้ำหนักสูงสุด และพื้นที่ที่ต้องใช้",
    vi: "So sánh Force USA G3, Body-Solid GS348Q, Titan, Marcy MD-9010G và Sunny SF-BH6810: quy cách thép, kiểu ray dẫn, tải trọng tối đa và diện tích chiếm chỗ.",
    tr: "Force USA G3, Body-Solid GS348Q, Titan, Marcy MD-9010G ve Sunny SF-BH6810 karşılaştırması: çelik profili, kızak tipi, maksimum yük ve kapladığı alan.",
  },
  {
    "zh-CN": "史密斯机的价格差主要来自钢材厚度和轨道方式。哪些差别会在你练到大重量时才显现，这里说明。",
    "zh-TW": "史密斯機的價差主要來自鋼材厚度與軌道方式。哪些差別要練到大重量才會顯現，這裡說明。",
    ko: "스미스 머신의 가격 차이는 대부분 강재 두께와 가이드 방식에서 옵니다. 고중량에 가야 드러나는 차이를 정리했습니다.",
    es: "La diferencia de precio en una máquina Smith viene sobre todo del grosor del acero y del tipo de guía. Aquí está qué diferencias solo aparecen cuando subes de carga.",
    "pt-BR": "A diferença de preço em uma máquina Smith vem sobretudo da espessura do aço e do tipo de guia. Veja quais diferenças só aparecem quando a carga sobe.",
    fr: "L'écart de prix d'une machine Smith vient surtout de l'épaisseur de l'acier et du type de guidage. Voici les différences qui n'apparaissent qu'en montant en charge.",
    de: "Der Preisunterschied bei einer Multipresse kommt vor allem von Stahlstärke und Führungstyp. Hier stehen die Unterschiede, die erst bei hoher Last auffallen.",
    it: "La differenza di prezzo di un multipower dipende soprattutto dallo spessore dell'acciaio e dal tipo di guida. Ecco le differenze che emergono solo salendo di carico.",
    ru: "Разница в цене машины Смита в основном идёт от толщины стали и типа направляющих. Разбираем, какие отличия проявляются только на больших весах.",
    ar: "فارق السعر في جهاز سميث يأتي أساسًا من سماكة الفولاذ ونوع المسار. إليك الفروق التي لا تظهر إلا عند زيادة الأحمال.",
    hi: "स्मिथ मशीन में कीमत का अंतर मुख्यतः स्टील की मोटाई और गाइड के प्रकार से आता है। कौन-से अंतर भारी वज़न पर ही दिखते हैं, यहाँ बताया है।",
    id: "Perbedaan harga Smith machine terutama datang dari ketebalan baja dan jenis pemandu. Ini perbedaan yang baru terasa saat beban naik.",
    th: "ส่วนต่างราคาของสมิธแมชชีนมาจากความหนาเหล็กและรูปแบบรางเป็นหลัก นี่คือความต่างที่จะเห็นก็ต่อเมื่อขึ้นน้ำหนักหนัก",
    vi: "Chênh lệch giá của máy Smith chủ yếu đến từ độ dày thép và kiểu ray dẫn. Đây là những khác biệt chỉ lộ ra khi bạn lên mức tạ nặng.",
    tr: "Smith machine'de fiyat farkı çoğunlukla çelik kalınlığı ve kızak tipinden gelir. Yalnızca yük arttığında ortaya çıkan farklar burada.",
  },
);

const METHOD_EN =
  "We did not run our own thermal or load testing. Doing that honestly would need a calibrated psychrometric chamber for the air conditioners and an instrumented load cell rig for the Smith machines, neither of which we have. What we did instead: pulled every published specification from each manufacturer's own product page and manual, cross-checked current pricing against major retailer listings, and read owner reviews at volume — filtering for reports that describe a measurable failure or a repeated complaint rather than a first-week impression. Where a number is a manufacturer claim rather than an independent measurement, we say so in the text.";
const METHOD_JA =
  "自前の温度試験・荷重試験は行っていません。正直にやるならエアコンは校正済みの恒温恒湿試験室、スミスマシンはロードセルを組んだ治具が要りますが、どちらも持っていません。代わりに行ったのは、各メーカーの製品ページとマニュアルから公表仕様を全て拾い、主要小売の掲載価格で現在価格を突き合わせ、購入者レビューを大量に読むことです。レビューは初週の感想ではなく、測定可能な不具合や繰り返し出てくる苦情に絞って採用しています。数値がメーカー公称であって独立した実測ではない場合は、本文中でそう明記しています。";

export const BATCH12_HIGHVALUE: ArticleDef[] = [
  {
    slug: "best-portable-air-conditioner-2026",
    category: "home",
    offers: [
      { id: "midea-duo-map14hs1tbl" }, { id: "whynter-arc-14s" }, { id: "lg-lp1419ivsm" },
      { id: "honeywell-hl10cesw" }, { id: "blackdecker-bpact08wt" },
    ],
    en: {
      title: "Best Portable Air Conditioner 2026: 5 Compared",
      description:
        "Midea Duo, Whynter ARC-14S, LG LP1419IVSM, Honeywell HL10CESWK and Black+Decker BPACT08WT compared on real cooling capacity, hose configuration, noise and running cost — including why the BTU number on the box is not the number that matters.",
      lede:
        "The single most useful thing to understand before buying a portable air conditioner is that the big number on the box is not the capacity you get. Everything below follows from that.",
      methodology: METHOD_EN,
      sections: [
        {
          heading: "ASHRAE BTU vs SACC — the number that actually matters",
          paragraphs: [
            "Portable units are advertised in ASHRAE BTU, a laboratory figure measured under conditions that ignore the heat the unit itself dumps back into the room. The US Department of Energy requires a second figure, SACC (Seasonally Adjusted Cooling Capacity), which accounts for duct heat gain and infiltration. For single-hose units the SACC figure typically lands somewhere between half and two-thirds of the ASHRAE number.",
            "This is why an 8,000 BTU portable and an 8,000 BTU window unit are not comparable products. The window unit sits in the opening and exhausts outside the envelope; the portable one sits inside the room, radiates compressor heat into it, and in the single-hose case pulls its condenser air from the room it is trying to cool — which pulls unconditioned outside air in through every gap in the building to replace it.",
            "Practical rule: when comparing a portable against a window unit, look for the SACC figure and treat that as the real number. When comparing portables against each other, comparing ASHRAE to ASHRAE is fine as long as you also account for hose count.",
          ],
        },
        {
          heading: "Single-hose vs dual-hose",
          paragraphs: [
            "A single-hose unit draws room air across the condenser and blows it outside. That air has to be replaced, and it is replaced by outside air leaking in. The result is that a single-hose portable puts the room under slight negative pressure and continuously imports the heat it is trying to remove.",
            "A dual-hose unit draws condenser air from outside through one duct and exhausts it through the other, leaving room pressure roughly neutral. In this group the Midea Duo and the Whynter ARC-14S are dual-hose; the LG, Honeywell and Black+Decker are single-hose.",
            "The dual-hose advantage grows with the temperature difference. In mild conditions the difference is small enough to ignore. In a genuinely hot room it is the difference between the unit keeping up and the unit running continuously without reaching setpoint.",
          ],
        },
        {
          heading: "Inverter vs fixed-speed, and what it does to noise",
          paragraphs: [
            "A fixed-speed compressor is either on at full output or off. It reaches setpoint, stops, drifts, and starts again — and each start is the loudest moment of the cycle. An inverter compressor modulates output, so once the room is at setpoint it settles into a low, continuous hum instead of cycling.",
            "The Midea Duo and the LG LP1419IVSM are inverter units; the Whynter, Honeywell and Black+Decker are fixed-speed. If the unit is going into a bedroom, this distinction matters more than a two-decibel difference in the rated figure, because the rated figure is measured at full output and does not describe the cycling behaviour you will actually hear at 3am.",
          ],
        },
        {
          heading: "Drainage, venting and the install nobody mentions",
          paragraphs: [
            "Every portable unit condenses water. Most modern units evaporate the majority of it out of the exhaust, but in humid conditions all of them will eventually need the reservoir drained or a hose run to a floor drain. Check whether the model supports continuous gravity drainage before you buy — retrofitting is unpleasant.",
            "The window kit is the other overlooked item. The included kits fit standard double-hung and sliding windows; casement windows generally need a custom panel. Sealing the kit properly matters more than most buyers expect, because an unsealed kit lets the exhaust heat straight back in and undoes a meaningful fraction of the unit's capacity.",
          ],
        },
      ],
      faqs: [
        { q: "Is a portable AC worth it over a window unit?", a: "Only when a window unit is not an option — casement windows, rental restrictions, or a room you need to move the unit between. For the same rated capacity a window unit is quieter, cheaper and substantially more efficient, because it is not sitting inside the room it is cooling." },
        { q: "Do I need dual-hose?", a: "If the room routinely gets genuinely hot, yes. Dual-hose stops the unit from importing outside air to replace what it exhausts. In mild conditions or a small well-sealed room, a single-hose unit is adequate and cheaper." },
        { q: "What size do I need?", a: "Work from the SACC figure, not the ASHRAE figure, and start from roughly 20 BTU per square foot for an average room. Add capacity for a sunny room, a top floor, or a kitchen; subtract for a shaded interior room." },
        { q: "Why does the room never reach the set temperature?", a: "The three usual causes, in order of frequency: an unsealed window kit letting exhaust heat back in, a single-hose unit that is undersized for the heat load once infiltration is counted, and a clogged filter. Check the window seal first — it is free to fix." },
      ],
      products: {
        "midea-duo-map14hs1tbl": { badge: "🏆 Best overall", review: "The Midea Duo is the pick when the room actually gets hot. It combines the two things that matter most — dual-hose ducting and an inverter compressor — so it neither imports outside air nor cycles loudly at setpoint. The heat-pump mode extends its usefulness into shoulder seasons. It is the most expensive unit here, and it is physically large.", pros: ["Dual hose plus inverter — the two features that matter", "Heat pump mode covers cool-weather use", "Holds setpoint in genuinely hot conditions"], cons: ["Most expensive in this group", "Physically large and heavy"] },
        "whynter-arc-14s": { badge: "💰 Best dual-hose value", review: "The ARC-14S is the cheap route to dual-hose. It has been on the market long enough that the failure modes are well documented in owner reviews, and it does the important thing — it does not depressurise the room. What you give up is inverter modulation, so it cycles on and off audibly rather than settling into a hum.", pros: ["Dual hose at a lower price", "Long track record, well-documented behaviour", "Simple, serviceable design"], cons: ["Fixed-speed compressor cycles audibly", "Dated control interface"] },
        "lg-lp1419ivsm": { badge: "🔇 Quietest single-hose", review: "The LG is the choice when noise is the deciding factor and dual-hose ducting is not practical. The dual-inverter compressor modulates rather than cycling, which is what you hear at night. Being single-hose, it still imports replacement air, so it is a better bedroom unit than it is a hot-room unit.", pros: ["Inverter compressor, quiet at setpoint", "Solid app and scheduling", "Good build quality"], cons: ["Single hose limits capacity in hot conditions", "Premium price for a single-hose unit"] },
        "honeywell-hl10cesw": { badge: "🛏️ Best for small rooms", review: "The Honeywell is sized for a bedroom rather than a living room, and that is the right way to read it. The dehumidify-only mode is genuinely useful in humid climates where the room is not hot but is uncomfortable, and the washable filter keeps running costs down. Do not buy it for a large or sun-exposed room.", pros: ["Right size for a small bedroom", "Useful dehumidify-only mode", "Washable filter"], cons: ["Underpowered for large rooms", "Fixed-speed, cycles audibly"] },
        "blackdecker-bpact08wt": { badge: "💵 Cheapest", review: "The BPACT08WT is the entry point, and it is the unit where the ASHRAE-versus-SACC gap does the most damage to expectations — the real capacity is roughly half the headline figure. Bought for a small, shaded, well-sealed room it is fine. Bought on the strength of the number on the box, it will disappoint.", pros: ["Lowest price here", "Light and easy to move", "Simple controls"], cons: ["Real capacity is far below the ASHRAE figure", "Single hose, fixed speed", "Struggles in anything larger than a small room"] },
      },
      offerNotes: {
        "midea-duo-map14hs1tbl": "Sold under both the Duo and MAP14HS1TBL names — check the model code, the non-heat-pump variant looks nearly identical.",
        "whynter-arc-14s": "The ARC-14S and ARC-14SH differ by the heater function; confirm which one the listing is for.",
        "lg-lp1419ivsm": "LG lists both ASHRAE and DOE/SACC figures on the spec sheet — compare on the DOE figure.",
        "honeywell-hl10cesw": "Model codes in this Honeywell line vary by retailer; match the BTU rating rather than the suffix.",
        "blackdecker-bpact08wt": "Check the SACC rating on the listing before sizing a room to it.",
      },
      pinDescription: "The BTU number on a portable AC box is not the capacity you get. Here is what ASHRAE vs SACC means, why dual-hose matters, and five units compared on the figures that decide whether the room actually cools.",
    },
    ja: {
      title: "ポータブルエアコンのおすすめ2026：5機種を比較",
      description:
        "Midea Duo、Whynter ARC-14S、LG LP1419IVSM、Honeywell HL10CESWK、Black+Decker BPACT08WT を実効冷房能力・ホース構成・運転音・電気代で比較。箱に書かれたBTU値が当てにならない理由も含めて解説します。",
      lede:
        "ポータブルエアコンを買う前に理解しておくべき最重要点は、箱に大きく書かれた数字が実際に得られる能力ではないということです。以下の比較はすべてそこから派生します。",
      methodology: METHOD_JA,
      sections: [
        {
          heading: "ASHRAE BTU と SACC ― 本当に見るべき数字",
          paragraphs: [
            "ポータブル機の宣伝値は ASHRAE BTU で、本体が室内に放出する熱を計算に入れない試験条件での数値です。米国エネルギー省はこれとは別に SACC（季節調整済み冷房能力）の表示を義務付けており、こちらはダクトからの熱取得と外気の侵入を織り込みます。シングルホース機では SACC は ASHRAE 値のおおむね2分の1から3分の2程度に落ちます。",
            "だから 8,000 BTU のポータブル機と 8,000 BTU の窓用機は比較可能な製品ではありません。窓用機は開口部に収まり建物の外側へ排熱しますが、ポータブル機は室内に置かれてコンプレッサー熱を室内へ放射し、シングルホースの場合は冷やそうとしている当の部屋から凝縮器用の空気を吸い出します。抜けた分は建物の隙間という隙間から未冷却の外気が入って埋めます。",
            "実用的な指針として、窓用機と比べるときは SACC を実数として扱ってください。ポータブル機同士の比較なら ASHRAE 同士でも構いませんが、ホースの本数を必ず併せて見る必要があります。",
          ],
        },
        {
          heading: "シングルホースとデュアルホース",
          paragraphs: [
            "シングルホース機は室内の空気を凝縮器に通して屋外へ吹き出します。抜けた空気は補充されねばならず、それを担うのは侵入してくる外気です。結果としてシングルホース機は室内をわずかな負圧に保ち、自分が取り除こうとしている熱を継続的に取り込み続けます。",
            "デュアルホース機は一方のダクトから屋外の空気を取り込み、もう一方から排出するため、室内の圧力はほぼ中立のままです。この5機種では Midea Duo と Whynter ARC-14S がデュアルホース、LG・Honeywell・Black+Decker がシングルホースです。",
            "デュアルホースの優位は内外温度差が大きいほど広がります。穏やかな条件では無視できる差ですが、本当に暑い部屋では「設定温度に到達する機械」と「連続運転しても届かない機械」の差になります。",
          ],
        },
        {
          heading: "インバーターと固定速 ― 運転音に効くのはここ",
          paragraphs: [
            "固定速コンプレッサーは全開か停止かの二択です。設定温度に達すると止まり、室温が戻ると再始動します。そして起動の瞬間がサイクル中で最もうるさい。インバーターは出力を連続的に絞るので、室温が落ち着いた後は低い連続音に収まります。",
            "Midea Duo と LG LP1419IVSM がインバーター、Whynter・Honeywell・Black+Decker が固定速です。寝室に置くなら、この違いはカタログ騒音値の2デシベル差より重要です。カタログ値は全開時の測定であり、深夜に実際に聞くことになる断続運転の挙動を説明していないからです。",
          ],
        },
        {
          heading: "排水と窓パネル ― 誰も先に教えてくれない設置の話",
          paragraphs: [
            "ポータブル機は必ず結露水を作ります。最近の機種は大半を排気とともに蒸発させますが、湿度の高い条件ではどの機種も最終的にはタンクの排水か、床排水へのホース引き回しが必要になります。連続排水（自然流下）に対応しているかは購入前に確認してください。後から付け足すのは面倒です。",
            "もう一つ見落とされるのが窓キットです。付属キットは一般的な上げ下げ窓と引き違い窓には合いますが、外開き窓には多くの場合カスタムパネルが要ります。そしてキットの気密は買う人が思うより効きます。隙間があると排気の熱がそのまま戻り、機械の能力のうち無視できない割合が相殺されます。",
          ],
        },
      ],
      faqs: [
        { q: "窓用エアコンではなくポータブルを選ぶ価値はありますか", a: "窓用が使えない場合に限ります。外開き窓、賃貸の制約、複数の部屋を移動させたい場合などです。同じ定格能力なら窓用のほうが静かで安く、効率も明確に上です。冷やす対象の部屋の中に本体が置かれていないからです。" },
        { q: "デュアルホースは必要ですか", a: "部屋が日常的に本当に暑くなるなら必要です。排出した分を外気で埋める動作を止められます。穏やかな条件や気密の良い小部屋であればシングルホースで足り、価格も下がります。" },
        { q: "何BTUを選べばよいですか", a: "ASHRAE ではなく SACC を基準にし、標準的な部屋で1平方フィートあたり約20 BTU から始めてください。日当たりの良い部屋・最上階・キッチンでは加算し、日陰の内側の部屋では減算します。" },
        { q: "設定温度まで下がりません", a: "多い順に3つ。窓キットの気密不良で排気熱が戻っている、外気侵入まで数えると熱負荷に対して能力不足のシングルホース機である、フィルターの目詰まり。まず窓の気密を見てください。費用ゼロで直せます。" },
      ],
      products: {
        "midea-duo-map14hs1tbl": { badge: "🏆 総合best", review: "部屋が実際に暑くなるなら Midea Duo です。効くもの2つ、つまりデュアルホースとインバーターを両方備えているので、外気を取り込むこともなく、設定温度に達した後に大きな音で断続することもありません。ヒートポンプ運転により中間期にも使えます。この中で最も高価で、そして本体は大きい。", pros: ["デュアルホースとインバーターの両方を備える", "ヒートポンプ運転で寒い時期も使える", "本当に暑い条件でも設定温度を保つ"], cons: ["この中で最も高価", "本体が大きく重い"] },
        "whynter-arc-14s": { badge: "💰 デュアルホースの安価枠", review: "デュアルホースへの安いルートが ARC-14S です。市場に長く出ているため故障の傾向が購入者レビューに十分蓄積されており、肝心な点、つまり室内を負圧にしないという動作は確実にこなします。引き換えに失うのはインバーター制御で、静かな連続運転ではなく耳につく断続運転になります。", pros: ["デュアルホースを低価格で", "長期の実績があり挙動が把握しやすい", "構造が単純で手入れしやすい"], cons: ["固定速のため断続音が耳につく", "操作系が古い"] },
        "lg-lp1419ivsm": { badge: "🔇 シングルホースで最も静か", review: "静粛性が決め手で、かつデュアルホースの取り回しが現実的でない場合の選択です。デュアルインバーターは断続せず出力を絞るので、夜間に聞こえる音が違います。ただしシングルホースである以上は補充空気を取り込むため、暑い部屋向けというより寝室向けの機械です。", pros: ["インバーター制御で安定時が静か", "アプリとスケジュール機能が実用的", "作りが良い"], cons: ["シングルホースゆえ高温時の能力に限界", "シングルホース機としては高価"] },
        "honeywell-hl10cesw": { badge: "🛏️ 小部屋向け", review: "リビングではなく寝室のサイズに合わせた機械であり、そう読むのが正しい。除湿単独モードは、暑くはないが不快という多湿な気候で実際に役に立ちます。洗えるフィルターは維持費を抑えます。広い部屋や日射の強い部屋には買わないでください。", pros: ["小さな寝室にちょうど良い能力", "除湿単独モードが実用的", "洗えるフィルター"], cons: ["広い部屋には能力不足", "固定速で断続音が出る"] },
        "blackdecker-bpact08wt": { badge: "💵 最安", review: "入口となる機種であり、ASHRAE と SACC の差が期待値を最も損なう機種でもあります。実効能力は表記のおよそ半分です。小さく、日陰で、気密の取れた部屋のために買うなら問題ありません。箱の数字を信じて買うと失望します。", pros: ["この中で最安", "軽く移動が容易", "操作が単純"], cons: ["実効能力が ASHRAE 表記を大きく下回る", "シングルホースかつ固定速", "小部屋より広いと力不足"] },
      },
      offerNotes: {
        "midea-duo-map14hs1tbl": "Duo と MAP14HS1TBL の両方の名前で流通しています。ヒートポンプ無しの型が外見ほぼ同一なので型番を確認してください。",
        "whynter-arc-14s": "ARC-14S と ARC-14SH はヒーター機能の有無が違います。出品がどちらか確認してください。",
        "lg-lp1419ivsm": "LG は仕様表に ASHRAE と DOE/SACC の両方を載せています。DOE 側で比較してください。",
        "honeywell-hl10cesw": "この系列は販売店ごとに型番の枝番が異なります。枝番ではなく BTU 定格で合わせてください。",
        "blackdecker-bpact08wt": "部屋の広さを決める前に出品ページの SACC 定格を確認してください。",
      },
      pinDescription: "ポータブルエアコンの箱に書かれたBTUは実際の能力ではありません。ASHRAEとSACCの違い、デュアルホースが効く理由、そして本当に部屋が冷えるかを決める数値で5機種を比較しました。",
    },
    translations: PORTABLE_AC_TR,
  },

  {
    slug: "best-window-air-conditioner-2026",
    category: "home",
    offers: [
      { id: "midea-u-maw08v1qwt" }, { id: "ge-profile-phnt10cc" }, { id: "lg-lw8017ersm" },
      { id: "frigidaire-fhww084wd1" }, { id: "windmill-ac-8000" },
    ],
    en: {
      title: "Best Window Air Conditioner 2026: 5 Compared",
      description:
        "Midea U, GE Profile ClearView, LG LW8017ERSM, Frigidaire FHWW084WD1 and Windmill compared on noise, install difficulty, how much window they block, and whether the inverter premium is worth paying.",
      lede:
        "Window air conditioners have converged on capacity — an 8,000 BTU unit from any of these brands cools about the same room. What separates them is noise, how much of the window you lose, and how bad the install is.",
      methodology: METHOD_EN,
      sections: [
        {
          heading: "Why the U-shape changes the noise equation",
          paragraphs: [
            "A conventional window unit is a single box straddling the sill, with the compressor inside the same enclosure as the indoor-facing grille. The window sash closes on top of the unit, so the only thing between the compressor and your ear is the unit's own casing.",
            "The U-shaped design splits the body around the sash, so the window closes through the middle of the unit and the glass sits between the compressor half and the room. That is a physical barrier the conventional layout does not have, and it is the reason U-shaped units measure substantially quieter rather than marginally quieter.",
            "The trade-off is install constraints. The U-shape needs a sash that can close down into the gap, which rules out some window types and most sills with an obstruction. Measure before buying — this is the most common cause of returns on this style.",
          ],
        },
        {
          heading: "Inverter or not",
          paragraphs: [
            "The same logic as portable units applies: a fixed-speed compressor cycles between full output and off, and the start of each cycle is the loud moment. An inverter modulates and settles. In this group the Midea U and the GE Profile are inverter units; the LG, Frigidaire and Windmill are fixed-speed.",
            "The efficiency difference is real but smaller than marketing suggests for intermittent use. If the unit runs a few hours an evening, the payback on the inverter premium is long. If it runs continuously through a hot season, the payback is much shorter — and the noise difference is there either way.",
          ],
        },
        {
          heading: "What the install actually involves",
          paragraphs: [
            "All five ship with a mounting kit for standard double-hung windows: side curtains, a top rail, and a support bracket or leveling foot. The unit must tilt very slightly toward the outside so condensate drains away from the room rather than into it. Units installed dead level, or tilted the wrong way, drip indoors — this is the single most common install error.",
            "Weight matters more than the spec sheet implies. An 8,000 BTU unit is typically in the 50–60 lb range and has to be lifted into an open window opening. This is a two-person job for most people, and a bracket that supports the outdoor half is worth fitting regardless of what the manual says is required.",
            "The Windmill unit is designed around a tool-free install and ships the sealing components as part of the design rather than as an afterthought, which is a meaningful part of what its price premium buys.",
          ],
        },
        {
          heading: "Filters, apps, and the things that break",
          paragraphs: [
            "All five have washable filters. A clogged filter is the most common cause of a unit that has 'stopped cooling', and it is a monthly rinse during heavy use, not a seasonal one.",
            "Wi-Fi and app control is present on the Midea U, GE Profile, LG and Windmill. Treat it as a convenience, not a reason to choose: cloud features on appliances have a track record of being discontinued, and every one of these units works fully from its own panel and remote if the app disappears.",
          ],
        },
      ],
      faqs: [
        { q: "How many BTU do I need?", a: "Roughly 20 BTU per square foot as a starting point, so 8,000 BTU covers about 350 sq ft. Add capacity for strong sun exposure, a top floor, or a kitchen. Oversizing is a real mistake, not a safe margin — an oversized unit cools fast, shuts off, and never runs long enough to dehumidify, leaving the room cold and clammy." },
        { q: "Is the U-shaped design worth the extra cost?", a: "If the unit is going in a bedroom or a room where you work, yes — the noise difference comes from the physical layout, not from a marketing figure. If it is for a room you are not in much, the cheaper conventional units cool identically." },
        { q: "Can I install one myself?", a: "Physically yes for most 8,000 BTU units, but treat it as a two-person lift. The critical detail is the slight outward tilt for condensate drainage; get that wrong and it drips indoors." },
        { q: "Do these work in a casement window?", a: "No. Every unit here is designed for double-hung or sliding windows. Casement windows need a purpose-built casement unit or a portable AC with a custom panel." },
      ],
      products: {
        "midea-u-maw08v1qwt": { badge: "🏆 Best overall", review: "The Midea U is the default recommendation because it wins on the axis that actually differs between window units. The U-shaped body puts glass between the compressor and the room, and the inverter compressor removes the cycling noise on top of that. You keep most of the window view and the sash still closes and locks. Confirm your sill and sash clear the U-bracket before ordering.", pros: ["Substantially quieter by physical design, not just rating", "Inverter compressor, no loud cycling", "Window still opens and locks"], cons: ["Install constraints — not every window fits", "Heavier and bulkier than a conventional box"] },
        "ge-profile-phnt10cc": { badge: "🪟 Best for keeping the view", review: "The GE Profile ClearView is the premium conventional-mount answer: a low-profile body that sits below the normal sight line so you are not looking at a beige box. It is an inverter unit, so it is quiet at setpoint, and the 10,000 BTU rating covers a larger room than the 8,000 BTU units here. It is the most expensive of the five.", pros: ["Low profile preserves the window view", "Inverter compressor", "Higher capacity than the 8,000 BTU units"], cons: ["Most expensive here", "Larger and heavier to install"] },
        "lg-lw8017ersm": { badge: "📶 Best conventional with app", review: "The LG is the sensible middle: a conventional box with Wi-Fi and a fixed-speed compressor. It cools an 8,000 BTU room exactly as well as the inverter units do; what you give up is the quiet at setpoint, since it cycles rather than modulates. Good choice for a room you are not sleeping in.", pros: ["Meaningfully cheaper than the inverter units", "Wi-Fi and scheduling", "Simple, well-understood design"], cons: ["Fixed-speed compressor cycles audibly", "Blocks the window in the conventional way"] },
        "frigidaire-fhww084wd1": { badge: "💰 Best value", review: "The Frigidaire is the one to buy when you want cooling and nothing else. No inverter, no app dependency, a washable filter and a straightforward kit. Fewer features is fewer things to fail, and the cooling performance at 8,000 BTU is not where these units differ. It is the loudest option in the group.", pros: ["Lowest price here", "Nothing to fail beyond the basics", "Straightforward install kit"], cons: ["Loudest of the five", "No inverter, no app"] },
        "windmill-ac-8000": { badge: "🎨 Best install experience", review: "The Windmill's argument is the parts of ownership other brands treat as an afterthought: a tool-free install, sealing components designed in rather than bagged separately, upward-facing airflow so cold air is not blowing directly at you, and a reusable filter. The compressor is fixed-speed, so it is not the quiet option — it is the pleasant-to-live-with option.", pros: ["Tool-free install, sealing designed in", "Upward airflow avoids a direct cold draft", "Reusable filter"], cons: ["Fixed-speed compressor", "Priced above comparable conventional units"] },
      },
      offerNotes: {
        "midea-u-maw08v1qwt": "Measure sash height and sill depth against the U-bracket dimensions before ordering — this is the main return reason.",
        "ge-profile-phnt10cc": "Sold in several capacities under the ClearView name; confirm the BTU rating on the listing.",
        "lg-lw8017ersm": "LG uses similar model codes across capacities — check the BTU figure rather than the suffix.",
        "frigidaire-fhww084wd1": "Frigidaire's window kit fits standard double-hung windows only.",
        "windmill-ac-8000": "Often sold direct as well as through retailers; compare the bundled install kit between listings.",
      },
      pinDescription: "Window ACs all cool about the same at 8,000 BTU. What differs is noise, how much window you lose, and how bad the install is. Five units compared on those three things.",
    },
    ja: {
      title: "窓用エアコンのおすすめ2026：5機種を比較",
      description:
        "Midea U、GE Profile ClearView、LG LW8017ERSM、Frigidaire FHWW084WD1、Windmill を運転音・取付の難しさ・窓をどれだけ塞ぐか・インバーターの価格差に見合うかで比較しました。",
      lede:
        "窓用エアコンは冷房能力ではほぼ横並びです。8,000 BTU ならどのブランドでも冷える部屋の広さは変わりません。差が付くのは運転音、窓がどれだけ潰れるか、そして取付がどれだけ大変かです。",
      methodology: METHOD_JA,
      sections: [
        {
          heading: "U字型が騒音の前提を変える理由",
          paragraphs: [
            "従来型の窓用機は窓台をまたぐ一体の箱で、コンプレッサーは室内側のグリルと同じ筐体に入っています。窓のサッシは本体の上に降りるので、コンプレッサーと耳の間にあるのは本体のケースだけです。",
            "U字型は本体をサッシの前後に分ける構造で、窓が本体の真ん中を通って閉まります。つまりコンプレッサー側と室内の間にガラスが1枚入る。従来型には存在しない物理的な遮蔽であり、U字型の運転音が「わずかに」ではなく「大幅に」低い理由はここにあります。",
            "代償は取付条件です。U字部分にサッシが降りきる必要があるため、窓の形式によっては使えず、窓台に出っ張りがある場合も多くは不可です。購入前に必ず採寸してください。この形式の返品理由として最も多いのがここです。",
          ],
        },
        {
          heading: "インバーターにすべきか",
          paragraphs: [
            "ポータブル機と同じ理屈が当てはまります。固定速は全開と停止を往復し、起動の瞬間がうるさい。インバーターは出力を絞って安定します。この5機種では Midea U と GE Profile がインバーター、LG・Frigidaire・Windmill が固定速です。",
            "効率差は実在しますが、断続的な使い方では宣伝ほど大きくありません。夕方に数時間動かす程度なら価格差の回収には長くかかります。暑い季節を通して連続運転するなら回収は早い。そして運転音の差はどちらの使い方でも効きます。",
          ],
        },
        {
          heading: "取付の実際",
          paragraphs: [
            "5機種すべてに一般的な上げ下げ窓用の取付キット（サイドカーテン、上枠、支持ブラケットまたは水平調整脚）が付属します。本体はごくわずかに屋外側へ傾ける必要があります。そうしないと結露水が室内側へ流れます。完全な水平、あるいは逆向きの傾きで取り付けた機械は室内に水を垂らします。取付ミスとして最も多いのがこれです。",
            "重量は仕様表の印象より重要です。8,000 BTU 機はおおむね23〜27kgあり、それを開いた窓の開口部へ持ち上げる作業になります。多くの人にとっては2人がかりの作業で、屋外側を支えるブラケットは、マニュアルが必須としていなくても付ける価値があります。",
            "Windmill は工具不要の取付を前提に設計され、気密部材が後付けの付属品ではなく設計に組み込まれています。価格差が何を買っているかの相当部分がここです。",
          ],
        },
        {
          heading: "フィルターとアプリ、そして壊れる箇所",
          paragraphs: [
            "5機種とも洗えるフィルターです。「冷えなくなった」の原因として最も多いのがフィルターの目詰まりで、よく使う時期には季節ごとではなく月ごとの洗浄が必要です。",
            "Wi-Fi とアプリ操作は Midea U・GE Profile・LG・Windmill にあります。これは利便性として見るべきで、選定理由にはしないでください。家電のクラウド機能はサービス終了の実績が多く、そしてこの5機種はいずれもアプリが消えても本体パネルとリモコンだけで全機能が使えます。",
          ],
        },
      ],
      faqs: [
        { q: "何BTUを選べばよいですか", a: "目安は1平方フィートあたり約20 BTU で、8,000 BTU がおよそ32㎡に対応します。日射が強い、最上階、キッチンといった条件では加算してください。能力を大きめに取るのは安全側ではなく明確な誤りです。過大な機械は急速に冷やして停止し、除湿するだけの運転時間を稼げないため、部屋は寒いのにじめつく状態になります。" },
        { q: "U字型は価格差に見合いますか", a: "寝室や作業する部屋に置くなら見合います。静かさの差はカタログ値ではなく構造から来ています。ほとんど滞在しない部屋なら、安価な従来型でも冷え方は同じです。" },
        { q: "自分で取り付けられますか", a: "8,000 BTU 機なら体力的には可能ですが、2人での持ち上げ作業と考えてください。決定的に重要なのは結露排水のためのわずかな外向きの傾きです。ここを外すと室内に水が垂れます。" },
        { q: "外開き窓でも使えますか", a: "使えません。ここに挙げた5機種はすべて上げ下げ窓か引き違い窓向けです。外開き窓には専用機か、カスタムパネルを使うポータブル機が必要です。" },
      ],
      products: {
        "midea-u-maw08v1qwt": { badge: "🏆 総合best", review: "窓用機の間で実際に差が出る軸で勝っているため、既定の推奨機です。U字型の本体がコンプレッサーと室内の間にガラスを挟み、その上でインバーターが断続音を消します。窓の眺望も大半が残り、サッシは閉じて施錠もできます。注文前に窓台とサッシがU字部に収まるか確認してください。", pros: ["カタログ値ではなく構造で静か", "インバーターで断続音がない", "窓が開閉でき施錠もできる"], cons: ["取付条件が厳しく窓を選ぶ", "従来型より重く嵩張る"] },
        "ge-profile-phnt10cc": { badge: "🪟 眺望を残したいなら", review: "従来型取付での上位解です。本体が通常の視線より下に収まるため、ベージュの箱を眺めることになりません。インバーター機なので安定時は静かで、10,000 BTU なので他の8,000 BTU 機より広い部屋をカバーします。5機種中最も高価です。", pros: ["薄型で窓の眺望を残す", "インバーター搭載", "8,000 BTU 機より能力が上"], cons: ["この中で最も高価", "大きく重いため取付が大変"] },
        "lg-lw8017ersm": { badge: "📶 アプリ付き従来型", review: "妥当な中間解です。Wi-Fi 付きの従来型の箱で、コンプレッサーは固定速。8,000 BTU の部屋を冷やす能力はインバーター機と変わりません。失うのは安定時の静粛性で、出力を絞る代わりに断続します。就寝しない部屋には良い選択です。", pros: ["インバーター機より明確に安い", "Wi-Fi とスケジュール機能", "枯れた構造で扱いやすい"], cons: ["固定速で断続音が出る", "従来型なので窓を塞ぐ"] },
        "frigidaire-fhww084wd1": { badge: "💰 コスパ", review: "冷房だけが欲しいときに買う機械です。インバーターなし、アプリ依存なし、洗えるフィルターと簡素なキット。機能が少ないぶん壊れる箇所も少なく、そして 8,000 BTU の冷房性能はこれらの機種が差を付ける場所ではありません。運転音はこの中で最も大きい。", pros: ["この中で最安", "基本以外に壊れる箇所がない", "取付キットが単純"], cons: ["5機種中で最もうるさい", "インバーターもアプリもなし"] },
        "windmill-ac-8000": { badge: "🎨 取付と使い心地", review: "Windmill の主張は、他社が後回しにする部分にあります。工具不要の取付、後付け袋詰めではなく設計に入っている気密部材、冷気が直接当たらない上向き送風、再利用可能なフィルター。コンプレッサーは固定速なので静粛性で選ぶ機械ではなく、暮らしやすさで選ぶ機械です。", pros: ["工具不要で気密部材が設計に組み込み済み", "上向き送風で冷気が直撃しない", "再利用可能フィルター"], cons: ["固定速コンプレッサー", "同等の従来型より高価"] },
      },
      offerNotes: {
        "midea-u-maw08v1qwt": "注文前にサッシ高さと窓台の奥行きをU字部の寸法と照合してください。返品理由の大半がここです。",
        "ge-profile-phnt10cc": "ClearView の名称で複数の能力帯が売られています。出品ページの BTU 定格を確認してください。",
        "lg-lw8017ersm": "LG は能力違いでも似た型番を使います。枝番ではなく BTU 値で確認してください。",
        "frigidaire-fhww084wd1": "付属の窓キットは標準的な上げ下げ窓専用です。",
        "windmill-ac-8000": "直販と小売の両方で流通しています。付属取付キットの内容を出品間で比較してください。",
      },
      pinDescription: "窓用エアコンは8,000 BTUならどれも冷え方は同じです。違うのは運転音・窓がどれだけ潰れるか・取付の大変さの3点。その3点で5機種を比較しました。",
    },
    translations: WINDOW_AC_TR,
  },

  {
    slug: "best-smith-machine-2026",
    category: "fitness",
    offers: [
      { id: "force-usa-g3" }, { id: "body-solid-gs348q" }, { id: "titan-fitness-smith" },
      { id: "marcy-md-9010g" }, { id: "sunny-sf-bh6810" },
    ],
    en: {
      title: "Best Smith Machine 2026: 5 Compared",
      description:
        "Force USA G3, Body-Solid GS348Q, Titan Fitness, Marcy MD-9010G and Sunny SF-BH6810 compared on steel gauge, bar guidance, weight capacity, footprint and ceiling height — and which differences only show up once you are loading heavy.",
      lede:
        "Smith machines look interchangeable in photographs and are not. Almost all of the price difference is steel thickness and how the bar is guided, and both only become obvious once the load gets heavy.",
      methodology: METHOD_EN,
      sections: [
        {
          heading: "Steel gauge and frame geometry",
          paragraphs: [
            "The single best predictor of how a Smith machine feels under load is the upright: its cross-section and its wall thickness. Commercial-grade frames are typically 2x3 inch tube in 11-gauge steel; entry-level machines use thinner wall and smaller section, which is why they flex visibly at loads the heavier frame does not notice.",
            "Frame flex is not only a comfort issue. A frame that twists under an uneven load puts the bar carriage slightly out of alignment with its guides, which is what produces the binding and the graunching sound owners report at heavy weight. The Body-Solid GS348Q is the commercial-spec frame in this group; the Sunny SF-BH6810 is at the other end.",
            "Check the stated weight capacity, and then check whether it is quoted for the bar, the rack, or the whole machine — manufacturers are not consistent about this, and a headline capacity is often the frame total rather than what the bar carriage is rated for.",
          ],
        },
        {
          heading: "Bushings, bearings, and bar angle",
          paragraphs: [
            "The bar runs on either bushings or linear bearings. Bushings are cheaper and have more static friction, so the bar needs a firmer initial push and feels less smooth on the first inch of travel. Linear bearings glide from the start. On a light machine with bushings this is tolerable; combined with frame flex it is the main source of the 'sticky' feel.",
            "Bar angle is the other structural choice. A vertical Smith bar travels straight up and down; an angled Smith bar (typically 7 to 12 degrees) follows a path closer to a natural squat or press. Angled machines suit squatting and pressing better; vertical machines are simpler and are what most budget units use. Neither is wrong, but they are not the same movement.",
            "Counter-balancing matters for the starting weight. A counter-balanced bar can start effectively near zero; an uncounterbalanced bar carries its own weight, often 15 to 30 lb, which sets the floor for every exercise.",
          ],
        },
        {
          heading: "Footprint, ceiling height and getting it into the room",
          paragraphs: [
            "Most Smith machines need 7.5 to 8 feet of ceiling clearance for the frame, plus enough headroom above that for overhead pressing if you intend to do it. A standard 8-foot basement ceiling with ductwork is where plans commonly fail — measure to the lowest obstruction, not to the ceiling.",
            "Footprint is typically in the range of 4 to 7 feet wide and 5 to 8 feet deep depending on whether the machine includes a pulley station and plate storage. Add at least two feet of clearance on the loading sides; the stated footprint is the frame, not the space you need to use it.",
            "These machines arrive in several heavy boxes and are assembled in place. Assembly is usually a half-day job for two people, and the frame cannot practically be moved once loaded with plates. Decide the final position before you start.",
          ],
        },
        {
          heading: "What you give up versus a power rack",
          paragraphs: [
            "The fixed bar path is the whole point and the whole limitation. It removes the stabilisation demand, which is what makes a Smith machine usable without a spotter and useful for controlled, higher-rep work. It also means the stabilising musculature does less, and the bar path is not the one your body would choose.",
            "For most home gyms the honest answer is that a power rack with safety arms covers more training and costs less. The Smith machine earns its place when training alone at loads where a failed rep is a real risk, when rehabilitating around an injury that needs a controlled path, or in the all-in-one machines where the Smith is one function among several.",
            "That last case is why the Force USA G3 exists — it is a power rack, a Smith machine and a functional trainer in one frame, which is a different purchase decision from a dedicated Smith machine.",
          ],
        },
      ],
      faqs: [
        { q: "Smith machine or power rack?", a: "Power rack for most people: it covers more movements, costs less, and does not constrain the bar path. Choose the Smith machine when you train alone at loads where failing a rep matters, when you want a controlled path for rehab or high-rep work, or when you are buying an all-in-one that includes both." },
        { q: "Why does the bar feel heavier on some machines?", a: "Uncounterbalanced bars carry their own weight, commonly 15–30 lb, and bushing-guided bars add static friction on top of that. A counter-balanced bar on linear bearings can start near zero. The difference is structural, not a matter of adjustment." },
        { q: "How much ceiling height do I need?", a: "Plan on 7.5 to 8 feet for the frame itself, and measure to the lowest obstruction — ductwork and light fixtures, not the ceiling surface. Add headroom above that if you intend to press overhead." },
        { q: "Is a cheap Smith machine safe?", a: "Within its rated capacity, yes. The failure mode people encounter is not collapse but binding: the frame flexes under load, the carriage misaligns, and the bar catches. That is a real hazard mid-rep, and it is the reason the steel spec matters more than the feature list." },
      ],
      products: {
        "force-usa-g3": { badge: "🏆 Best all-in-one", review: "The G3 is the answer when one machine has to be the whole gym. Power rack, Smith bar on linear bearings, and a functional trainer share a single frame, and a bench fits inside the rack. Judged purely as a Smith machine it is not the strongest frame here; judged as a garage gym in one footprint, nothing else on this list competes.", pros: ["Rack, Smith and cable trainer in one frame", "Linear bearings on the Smith bar", "Bench fits inside the rack"], cons: ["Not the strongest frame as a pure Smith machine", "Large footprint and long assembly"] },
        "body-solid-gs348q": { badge: "🏋️ Strongest frame", review: "The GS348Q is the one to buy if the machine is going to see heavy loads for years. Commercial-spec 2x3 inch 11-gauge uprights and a counter-balanced bar mean it does not flex or bind at weights where lighter frames start to complain. It is a dedicated Smith machine — no cable station, no pull-up bar — and it is priced accordingly.", pros: ["Commercial-grade 11-gauge frame", "Counter-balanced bar starts near zero", "No flex or binding under heavy load"], cons: ["Expensive", "Smith function only — no pulley station", "Heavy to move and assemble"] },
        "titan-fitness-smith": { badge: "⚖️ Best mid-price", review: "Titan's Smith machine is the sensible step up from the entry tier. Bushing-guided rather than bearings, but on a frame stiff enough that the bushings are the only thing you notice. Integrated plate storage is genuinely useful in a small room. The obvious pick if the commercial frames are out of budget and the entry machines feel flimsy.", pros: ["Meaningfully stiffer than entry-level frames", "Integrated plate storage", "Reasonable price for the build"], cons: ["Bushings, not linear bearings", "No counter-balance on the bar"] },
        "marcy-md-9010g": { badge: "📦 Most complete package", review: "The MD-9010G is the most equipment per dollar here: Smith cage, pulley station, pull-up bar and a bench in one purchase. That is a complete beginner home gym at a price the dedicated machines do not approach. The compromise is frame stiffness — it is a lighter build, and it shows as you add weight.", pros: ["Cage, pulleys, pull-up bar and bench included", "Best value as a complete setup", "Good for a first home gym"], cons: ["Lighter frame flexes under heavy load", "Bench and pulleys are basic", "Lower weight ceiling"] },
        "sunny-sf-bh6810": { badge: "🔰 Entry level", review: "The SF-BH6810 is the entry point and should be read as one: a fixed bar path, a modest weight ceiling, and a compact footprint. For light loads, controlled high-rep work, and a small room it does the job at a price nothing else here matches. It is not the machine to buy if the plan is progressive heavy squatting.", pros: ["Lowest price here", "Compact footprint", "Adequate for light and high-rep work"], cons: ["Low weight ceiling", "Frame flexes as load increases", "Not suited to heavy progressive loading"] },
      },
      offerNotes: {
        "force-usa-g3": "The G3 has several attachment bundles; confirm which attachments the listing includes.",
        "body-solid-gs348q": "Bench and plate storage are separate purchases on this model.",
        "titan-fitness-smith": "Titan revises models frequently — check the current spec sheet on the listing rather than older reviews.",
        "marcy-md-9010g": "Bench is included; check its rated capacity separately from the frame's.",
        "sunny-sf-bh6810": "Confirm the bar weight capacity before planning progression on this frame.",
      },
      pinDescription: "Smith machines look identical in photos and are not. Steel gauge and bar guidance account for almost all of the price difference — and both only show up once you load heavy. Five compared.",
    },
    ja: {
      title: "スミスマシンのおすすめ2026：5機種を比較",
      description:
        "Force USA G3、Body-Solid GS348Q、Titan Fitness、Marcy MD-9010G、Sunny SF-BH6810 を鋼材のゲージ・バーのガイド方式・耐荷重・設置面積・必要天井高で比較。高重量になって初めて表面化する差を整理しました。",
      lede:
        "スミスマシンは写真では見分けが付きませんが、中身は別物です。価格差のほとんどは鋼材の厚みとバーのガイド方式であり、そのどちらも重量が上がって初めて表に出ます。",
      methodology: METHOD_JA,
      sections: [
        {
          heading: "鋼材のゲージとフレーム形状",
          paragraphs: [
            "荷重下での感触を最もよく予測する指標は支柱です。断面寸法と肉厚の2つ。業務グレードのフレームは概ね2×3インチ角・11ゲージで、入門機はこれより薄く細い材を使います。重いフレームが何も感じない重量で入門機が目に見えてたわむのはこのためです。",
            "フレームのたわみは快適性だけの問題ではありません。左右非対称な荷重でフレームがねじれると、バーのキャリッジがガイドに対してわずかに傾きます。高重量で報告される引っかかりと擦過音の正体はこれです。この5機種では Body-Solid GS348Q が業務仕様のフレーム、Sunny SF-BH6810 が対極にあります。",
            "耐荷重の表記は確認したうえで、それがバーに対する値なのか、ラックに対する値なのか、機械全体の値なのかまで見てください。メーカー間で統一されておらず、目立つ数字はバーのキャリッジの定格ではなくフレーム全体の合計であることが少なくありません。",
          ],
        },
        {
          heading: "ブッシュ、ベアリング、バーの角度",
          paragraphs: [
            "バーはブッシュかリニアベアリングのどちらかで走ります。ブッシュは安価ですが静止摩擦が大きく、初動に強めの押しが要り、動き出しの数センチが滑らかではありません。リニアベアリングは最初から滑ります。軽量なフレームにブッシュという組み合わせは、フレームのたわみと合わさって「引っかかる」感触の主因になります。",
            "もう一つの構造上の選択がバーの角度です。垂直式は真上と真下に動き、傾斜式（多くは7〜12度）は自然なスクワットやプレスに近い軌道を描きます。スクワットやプレス主体なら傾斜式が向き、垂直式は構造が単純で廉価機の多くが採用します。優劣ではなく別の動作だと理解してください。",
            "開始重量にはカウンターバランスが効きます。カウンターバランス付きのバーは実質ゼロから始められますが、無い場合はバー自体の重量（多くは7〜14kg）が全種目の下限になります。",
          ],
        },
        {
          heading: "設置面積、天井高、そして部屋に入るか",
          paragraphs: [
            "多くのスミスマシンはフレームだけで2.3〜2.4mの天井高を要し、オーバーヘッドプレスを行うならさらに余裕が要ります。計画が破綻しやすいのはダクトの通った地下や8フィート天井です。天井面ではなく最も低い障害物までを測ってください。",
            "設置面積はプーリーやプレート収納の有無で幅1.2〜2.1m、奥行1.5〜2.4m程度です。プレートを差す側には最低60cmの余裕を足してください。公称寸法はフレームの寸法であって、使うために必要な空間ではありません。",
            "これらは複数の重い箱で届き、その場で組み立てます。組立は2人で半日程度、そしてプレートを積んだ後の移動は現実的ではありません。始める前に最終位置を決めてください。",
          ],
        },
        {
          heading: "パワーラックに対して何を失うか",
          paragraphs: [
            "固定軌道は長所そのものであり、同時に制約そのものです。安定させる仕事が要らなくなるため、補助者なしで使え、コントロールされた高回数のトレーニングに向きます。裏返せば安定筋の仕事は減り、軌道は身体が選ぶものではありません。",
            "多くのホームジムにとって正直な結論は、セーフティアーム付きのパワーラックのほうが対応種目が広く、価格も安いということです。スミスマシンが本領を発揮するのは、失敗が実際の危険になる重量を1人で扱うとき、軌道の制御が要る故障明けのとき、そしてスミスが複数機能のうちの1つであるオールインワン機の場合です。",
            "最後の用途のために存在するのが Force USA G3 です。パワーラックとスミスとファンクショナルトレーナーを1つのフレームに収めており、専用スミスマシンとは購入判断の性質が異なります。",
          ],
        },
      ],
      faqs: [
        { q: "スミスマシンとパワーラックのどちらを買うべきですか", a: "多くの人にはパワーラックです。対応種目が広く、安く、軌道を縛りません。スミスマシンを選ぶのは、失敗が問題になる重量を1人で扱う場合、リハビリや高回数で軌道を制御したい場合、あるいは両方を含むオールインワン機を買う場合です。" },
        { q: "機種によってバーが重く感じるのはなぜですか", a: "カウンターバランスの無いバーは自重（多くは7〜14kg）を背負い、ブッシュ式はそこに静止摩擦が乗ります。リニアベアリングのカウンターバランス付きなら実質ゼロから始められます。調整の問題ではなく構造の違いです。" },
        { q: "天井高はどれだけ必要ですか", a: "フレームだけで2.3〜2.4mを見込み、天井面ではなくダクトや照明といった最も低い障害物までを測ってください。オーバーヘッドプレスを行うならさらに余裕が要ります。" },
        { q: "安いスミスマシンは安全ですか", a: "定格の範囲内なら安全です。実際に起きる不具合は崩壊ではなく引っかかりです。荷重でフレームがたわみ、キャリッジがずれ、バーが噛む。挙上の途中で起きれば実際に危険であり、機能一覧より鋼材仕様を重く見るべき理由がこれです。" },
      ],
      products: {
        "force-usa-g3": { badge: "🏆 オールインワンbest", review: "1台でジムを完結させる必要があるならこれです。パワーラック、リニアベアリングのスミスバー、ファンクショナルトレーナーが1つのフレームを共有し、ラック内にベンチが入ります。純粋なスミスマシンとして見ればこの中で最強のフレームではありませんが、1つの設置面積に収まるガレージジムとして見れば競合はいません。", pros: ["ラック・スミス・ケーブルが1フレームに", "スミスバーはリニアベアリング", "ラック内にベンチが収まる"], cons: ["専用スミス機としては最強のフレームではない", "設置面積が大きく組立が長い"] },
        "body-solid-gs348q": { badge: "🏋️ フレーム最強", review: "高重量を何年も扱う前提ならこれを買ってください。業務仕様の2×3インチ・11ゲージ支柱とカウンターバランス付きバーにより、軽量フレームが音を上げ始める重量でもたわみも引っかかりも出ません。ケーブルも懸垂バーも無い専用機で、価格もそれに応じます。", pros: ["業務グレードの11ゲージフレーム", "カウンターバランスで実質ゼロから開始", "高重量でもたわまず噛まない"], cons: ["高価", "スミス機能のみでプーリー無し", "重く移動と組立が大変"] },
        "titan-fitness-smith": { badge: "⚖️ 中価格帯best", review: "入門機からの妥当な一段上です。ベアリングではなくブッシュですが、フレームが十分に硬いためブッシュ以外に気になる点が出ません。プレート収納は狭い部屋で実際に効きます。業務機は予算外、入門機は頼りない、という場合の明確な解です。", pros: ["入門機より明確に硬いフレーム", "プレート収納を内蔵", "この作りにしては価格が妥当"], cons: ["リニアベアリングではなくブッシュ", "バーにカウンターバランス無し"] },
        "marcy-md-9010g": { badge: "📦 装備が最も揃う", review: "同じ金額で得られる装備が最も多い機種です。スミスケージ、プーリー、懸垂バー、ベンチが1回の購入で揃います。専用機では到達できない価格で初心者のホームジムが完成します。妥協点はフレーム剛性で、軽い作りであり、重量を上げるとそれが表に出ます。", pros: ["ケージ・プーリー・懸垂バー・ベンチ込み", "一式としてのコスパが最良", "最初のホームジムに向く"], cons: ["高重量でフレームがたわむ", "ベンチとプーリーは簡素", "耐荷重の上限が低い"] },
        "sunny-sf-bh6810": { badge: "🔰 入門機", review: "入口の機械であり、そう読むべきものです。固定軌道、控えめな耐荷重、そして小さな設置面積。軽い負荷、コントロールされた高回数、狭い部屋という条件なら、この価格で並ぶものはありません。高重量スクワットを継続的に伸ばす計画なら買う機械ではありません。", pros: ["この中で最安", "省スペース", "軽負荷・高回数には十分"], cons: ["耐荷重の上限が低い", "荷重が上がるとフレームがたわむ", "高重量の漸進的な負荷には不向き"] },
      },
      offerNotes: {
        "force-usa-g3": "G3 はアタッチメントの組み合わせが複数あります。出品にどれが含まれるか確認してください。",
        "body-solid-gs348q": "この機種はベンチとプレート収納が別売です。",
        "titan-fitness-smith": "Titan は仕様改訂が頻繁です。古いレビューではなく出品ページの現行仕様表を見てください。",
        "marcy-md-9010g": "ベンチは付属します。ベンチ自体の耐荷重はフレームとは別に確認してください。",
        "sunny-sf-bh6810": "このフレームで重量計画を立てる前にバーの耐荷重を確認してください。",
      },
      pinDescription: "スミスマシンは写真では同じに見えますが別物です。価格差のほとんどは鋼材の厚みとバーのガイド方式で、どちらも高重量になって初めて表に出ます。5機種を比較しました。",
    },
    translations: SMITH_TR,
  },
];
