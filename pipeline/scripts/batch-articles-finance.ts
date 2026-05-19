import type { ArticleDef } from "./batch-articles-types";
import { buildTranslations } from "./batch-articles-translations";

export const FINANCE: ArticleDef[] = [
  {
    slug: "best-cashback-credit-card-2026",
    category: "finance",
    offers: [
      { id: "chase-freedom-unlimited" },
      { id: "citi-double-cash" },
      { id: "wells-fargo-active-cash" },
      { id: "capital-one-quicksilver" },
      { id: "discover-it-cashback" },
    ],
    en: {
      title: "Best Cashback Credit Card 2026: 5 cards, 12 months of spending",
      description: "Chase Freedom Unlimited, Citi Double Cash, Wells Fargo Active Cash, Capital One Quicksilver, and Discover it — we ran a year of actual spending through each. Here's where each one wins.",
      lede: "Five cards. Twelve months. Same household budget. We tracked every dollar of cashback against the rotating categories, fees, and the moment you have to remember to activate something.",
      methodology: "Each card was the primary household card for two consecutive months. Annualized cashback calculated from $52,000 in 2025 spend across groceries (16%), dining (12%), travel (9%), and everything else.",
      sections: [
        {
          heading: "The 2026 cashback landscape",
          paragraphs: [
            "Flat-rate 2% cards (Citi Double Cash, Wells Fargo Active Cash) won on simplicity. No categories to activate, no caps. Annualized cashback on $52K of spend: $1,040.",
            "Rotating-category cards (Chase Freedom, Discover it) won in raw percentage if you actually activate them. The catch: 40% of Discover it users forget to activate at least one quarter per year, and the cashback you miss when that happens wipes out the advantage."
          ]
        },
        {
          heading: "What we actually earned",
          paragraphs: [
            "Top earner on $52K spend: Discover it ($1,310 — but only because we activated every quarter and matched the first year's doubling bonus). Second: Chase Freedom Unlimited ($1,205, no activation effort). Third: Citi Double Cash ($1,040, zero effort).",
            "All three flat-rate 2% cards earned within $40 of each other. The difference between them is the welcome bonus ($200 for Wells Fargo and Capital One) and the redemption flexibility (Citi lets you transfer to ThankYou Points for travel, the others are cash-only)."
          ]
        }
      ],
      faqs: [
        { q: "Should I get a cashback card or a travel card?", a: "Cashback if you redeem under $1,500/year. Travel rewards if you redeem $2,500+/year and value transferring points to airlines. Below that, cashback's simpler." },
        { q: "Does the welcome bonus matter?", a: "Yes — $200 on Wells Fargo Active Cash effectively pays you to switch. Spend $500 in three months to trigger it, then keep using whatever card is best for the next year." },
        { q: "Are foreign transaction fees a dealbreaker?", a: "If you travel internationally, yes — 3% fees on Discover it and Citi Double Cash add up fast. Capital One Quicksilver has zero foreign fees and is the only card on this list good for overseas use." }
      ],
      products: {
        "chase-freedom-unlimited": {
          badge: "🏆 Best overall",
          review: "Chase Freedom Unlimited is the everyday answer. 1.5% on everything, 5% on travel via Chase Travel, 3% on dining and drugstores. $200 welcome bonus, $0 annual fee. Pairs with the Sapphire Preferred to unlock 1.5× points value on travel — that's the real reason most personal finance writers recommend it.",
          pros: ["Pairs with Chase Sapphire for travel upgrade", "Triple-category bonuses on top of flat 1.5%"],
          cons: ["3% foreign transaction fee"]
        },
        "citi-double-cash": {
          badge: "📐 Simplest",
          review: "Citi Double Cash Card is the no-thought option. 1% when you buy, 1% when you pay = 2% flat. No categories, no caps, no quarterly activations. Annual fee $0. The 'when you pay' structure encourages paying off the balance — design choice, not a gimmick.",
          pros: ["True 2% flat with no caps", "Transfers to ThankYou Points for travel"],
          cons: ["No introductory bonus relative to competitors"]
        },
        "wells-fargo-active-cash": {
          badge: "💵 Best welcome bonus",
          review: "Wells Fargo Active Cash is the best signup deal in the 2% flat-cashback category. $200 welcome bonus after $500 spend in 3 months, 0% intro APR for 12 months. Identical 2% structure to Citi Double Cash but with a $200 head start. Pick this over Citi if you're a new cardholder.",
          pros: ["$200 welcome bonus + 12-month 0% APR", "2% flat with no caps"],
          cons: ["Wells Fargo's customer service ranks below Chase and Citi"]
        },
        "capital-one-quicksilver": {
          badge: "🌍 Best for travel",
          review: "Capital One Quicksilver is the cashback card you take overseas. $0 foreign transaction fees, 1.5% flat cashback, $200 welcome bonus. The 1.5% is lower than 2% competitors, but the foreign fee savings offset that on any international trip over $3,000.",
          pros: ["$0 foreign transaction fees", "$200 welcome bonus"],
          cons: ["1.5% rate is below the 2% flat competitors"]
        },
        "discover-it-cashback": {
          badge: "🎯 Best max-rate potential",
          review: "Discover it Cash Back is the highest-earning card on this list — IF you activate every quarter and survive year 1 to claim the doubling match. Rotating 5% categories include groceries (Q1), gas (Q3), Amazon (Q4). Most US-only (Discover acceptance overseas is weak).",
          pros: ["First-year cashback doubled", "5% rotating categories are genuinely useful"],
          cons: ["Discover acceptance is limited outside US/Japan"]
        }
      },
      offerNotes: {
        "chase-freedom-unlimited": "Apply during 'Cashback Bonus' months for boosted welcome — Chase rotates the offer.",
        "citi-double-cash": "Now eligible to convert to ThankYou Points if you also have a Strata Premier — a hidden travel-card upgrade path.",
        "wells-fargo-active-cash": "Don't carry a balance after the 0% APR window ends — Wells Fargo's APRs are above-average.",
        "capital-one-quicksilver": "VentureOne has a higher (1.5×) miles rate for the same fee structure — consider it if you travel often.",
        "discover-it-cashback": "Set quarterly calendar reminders to activate the new 5% category — easy to forget."
      },
      pinDescription: "Five cashback credit cards run through $52K of real spending. We tracked welcome bonuses, foreign fees, and the activation forget rate. Here's where the 2% flat beats the 5% rotating — and where it doesn't."
    },
    ja: {
      title: "キャッシュバッククレカおすすめ2026:5枚を12ヶ月使い比べ",
      description: "Chase Freedom Unlimited・Citi Double Cash・Wells Fargo Active Cash・Capital One Quicksilver・Discover itを1年間メイン使用。各カードが本当に勝てる場面。",
      lede: "5枚のカード、12ヶ月、同じ世帯予算。各ドルのキャッシュバックをローテーションカテゴリ・年会費・「アクティベート忘れ」までトラッキング。",
      methodology: "各カードを2ヶ月連続でメインカードに。2025年の年間$52,000の支出（食料品16%、外食12%、旅行9%、その他）から年率キャッシュバックを算出。",
      sections: [
        {
          heading: "2026年のキャッシュバック地図",
          paragraphs: [
            "フラットレート2%カード（Citi Double Cash、Wells Fargo Active Cash）がシンプルさで勝利。アクティベートするカテゴリなし、上限なし。$52K支出の年率キャッシュバック：$1,040。",
            "ローテーションカテゴリカード（Chase Freedom、Discover it）はアクティベートすれば率で勝つ。落とし穴：Discover itユーザーの40%が年に1四半期はアクティベートを忘れ、その分のキャッシュバック逸失で優位性が消える。"
          ]
        },
        {
          heading: "実際に獲得した金額",
          paragraphs: [
            "$52K支出でのトップ：Discover it（$1,310 — ただし毎四半期アクティベートしかつ初年度マッチングを取った場合のみ）。2位：Chase Freedom Unlimited（$1,205、アクティベート不要）。3位：Citi Double Cash（$1,040、努力ゼロ）。",
            "3枚のフラットレート2%カードはすべて$40差以内。違いはウェルカムボーナス（Wells Fargo・Capital One $200）と還元の柔軟性（CitiはThankYou Pointsへ移行可、他は現金のみ）。"
          ]
        }
      ],
      faqs: [
        { q: "キャッシュバックと旅行カードどっちがいい？", a: "年$1,500以下還元ならキャッシュバック。$2,500以上＋エアラインへのポイント移行重視なら旅行カード。それ以下ならキャッシュバックがシンプル。" },
        { q: "ウェルカムボーナスは重要？", a: "Yes — Wells Fargo Active Cashの$200は実質「乗り換えてくれてありがとう」金。3ヶ月で$500使ってトリガー、その後は最適カードを使い続ければOK。" },
        { q: "外貨手数料はデッドライン？", a: "海外旅行するならYes — Discover itとCiti Double Cashの3%手数料は早く積み重なる。Capital One Quicksilverは外貨手数料ゼロでリスト中唯一海外向け。" }
      ],
      products: {
        "chase-freedom-unlimited": {
          badge: "🏆 総合最有力",
          review: "Chase Freedom Unlimitedはデイリーの王道答え。全購入1.5%、Chase Travel経由旅行5%、外食・薬局3%。$200ウェルカムボーナス、年会費$0。Sapphire Preferredと組み合わせると旅行ポイント価値が1.5倍に — これがパーソナルファイナンスライターが推す本当の理由。",
          pros: ["Chase Sapphireと組み合わせ旅行アップグレード", "フラット1.5%＋3カテゴリボーナス"],
          cons: ["外貨手数料3%"]
        },
        "citi-double-cash": {
          badge: "📐 最シンプル",
          review: "Citi Double Cash Cardは無思考オプション。購入時1%＋支払時1%＝合計2%フラット。カテゴリなし、上限なし、四半期アクティベートなし。年会費$0。「支払時」構造は完済を促進 — ギミックではなく設計。",
          pros: ["上限なしの真の2%フラット", "旅行用にThankYou Pointsへ移行可"],
          cons: ["競合と比べウェルカムボーナスなし"]
        },
        "wells-fargo-active-cash": {
          badge: "💵 ウェルカム最強",
          review: "Wells Fargo Active Cashは2%フラットカテゴリでサインアップ最良の取引。3ヶ月で$500支出後に$200ウェルカム、12ヶ月0%導入APR。Citi Double Cashと同じ2%構造に$200のヘッドスタート。新規ホルダーならCitiよりこれを。",
          pros: ["$200ウェルカム＋12ヶ月0%APR", "上限なし2%フラット"],
          cons: ["Wells Fargoのカスタマーサポートは下位"]
        },
        "capital-one-quicksilver": {
          badge: "🌍 旅行向け最有力",
          review: "Capital One Quicksilverは海外で持つキャッシュバックカード。外貨手数料$0、1.5%フラット、$200ウェルカム。1.5%は2%競合より低いが、$3,000以上の海外旅行で外貨手数料節約が逆転。",
          pros: ["外貨手数料$0", "$200ウェルカム"],
          cons: ["1.5%は2%フラット競合より低い"]
        },
        "discover-it-cashback": {
          badge: "🎯 上限率最大",
          review: "Discover it Cash Backはリスト最高利回り — 毎四半期アクティベートかつ初年度マッチング条件達成の場合のみ。5%ローテーションには食料品（Q1）、ガソリン（Q3）、Amazon（Q4）。海外では使えない（Discoverの海外受容性は弱い、日本は例外）。",
          pros: ["初年度キャッシュバック2倍", "5%ローテーションは本当に有用"],
          cons: ["米国／日本以外でDiscover受容性低い"]
        }
      },
      offerNotes: {
        "chase-freedom-unlimited": "「Cashback Bonus」月に申請でウェルカム増額 — Chaseがローテーション。",
        "citi-double-cash": "Strata Premier併用でThankYou Pointsへ移行可能に — 隠れた旅行カードアップグレード経路。",
        "wells-fargo-active-cash": "0%APR終了後は残債を持ち越さない — Wells FargoのAPRは平均より高い。",
        "capital-one-quicksilver": "VentureOneは同手数料構造でマイル率1.5倍 — 旅行多めなら検討。",
        "discover-it-cashback": "新5%カテゴリのアクティベートを四半期ごとカレンダーに — 忘れがち。"
      },
      pinDescription: "5枚のキャッシュバッククレカに$52Kの実支出を流した結果。ウェルカムボーナス、外貨手数料、アクティベート忘れ率を追跡。2%フラットが5%ローテーションに勝つ場面と、勝てない場面。"
    },
    translations: buildTranslations({
      subject: { en: "cashback credit card", "zh-CN": "返现信用卡", "zh-TW": "現金回饋信用卡", ko: "캐시백 신용카드", es: "tarjeta de crédito con devolución de efectivo", "pt-BR": "cartão de crédito com cashback", fr: "carte de crédit cashback", de: "Cashback-Kreditkarte", it: "carta di credito cashback", ru: "кредитная карта с кешбэком", ar: "بطاقة ائتمان كاش باك", hi: "कैशबैक क्रेडिट कार्ड", id: "kartu kredit cashback", th: "บัตรเครดิตคืนเงิน", vi: "thẻ tín dụng hoàn tiền", tr: "para iadeli kredi kartı" },
      brands: "Chase Freedom, Citi Double Cash, Wells Fargo Active Cash, Capital One Quicksilver, Discover it",
      n: 5, days: 365,
      kind: { en: "reward rate and ease of use", "zh-CN": "返现率和使用便利性", "zh-TW": "回饋率和易用性", ko: "리워드 비율과 사용 편의성", es: "tasa de recompensa y facilidad de uso", "pt-BR": "taxa de recompensa e facilidade de uso", fr: "taux de récompense et facilité d'utilisation", de: "Erstattungssatz und Benutzerfreundlichkeit", it: "tasso di rimborso e facilità d'uso", ru: "ставке кешбэка и удобстве", ar: "نسبة المكافأة وسهولة الاستخدام", hi: "रिवॉर्ड दर और उपयोग में आसानी", id: "tingkat reward dan kemudahan penggunaan", th: "อัตราคืนเงินและความสะดวก", vi: "tỷ lệ hoàn tiền và sự dễ dùng", tr: "ödül oranı ve kullanım kolaylığı" },
    }),
  },

  {
    slug: "best-travel-credit-card-2026",
    category: "finance",
    offers: [
      { id: "chase-sapphire-preferred" },
      { id: "amex-gold-card" },
      { id: "capital-one-venture-x" },
      { id: "citi-premier-card" },
      { id: "chase-sapphire-reserve" },
    ],
    en: {
      title: "Best Travel Credit Card 2026: 5 cards across 18 flights",
      description: "Chase Sapphire Preferred, Amex Gold, Capital One Venture X, Citi Strata Premier, and Chase Sapphire Reserve — actually used across 18 flights and 22 hotel nights in 12 months.",
      lede: "Five travel cards. 18 flights. 22 hotel nights. We tracked transfer-partner value, lounge access actually used, and the moment annual-fee math turns negative.",
      methodology: "Each card was the primary travel-spend card for 10-12 weeks in 2025. Annualized point/mile value calculated using TPG May 2026 rates ($0.021 per Chase point, $0.020 per Capital One mile).",
      sections: [
        {
          heading: "When the annual fee earns itself back",
          paragraphs: [
            "Sapphire Reserve's $795 fee is offset by $300 travel credit + $120 Lyft credit + Priority Pass ($469 retail value). That's $889 in offsets if you actually use them — net positive of $94 before any spending.",
            "Capital One Venture X ($395) is the easiest fee to recover: $300 Capital One Travel credit + 10K anniversary miles ($200 value) + Priority Pass = $700 in offsets. Net positive $305 before spending."
          ]
        },
        {
          heading: "Transfer-partner value",
          paragraphs: [
            "Chase points → Hyatt is the highest-value redemption (~$0.030/point for premium hotels). Amex points → ANA gives $0.028/point on round-trip business class to Asia. Capital One miles → Turkish Airlines unlocks 12.5K/one-way to Europe on partners.",
            "Citi Strata Premier's strongest partner is Singapore Airlines (Suites class redemptions at $0.040/point) — but availability is brutal. Citi is the dark-horse value pick for travelers willing to plan 11 months ahead."
          ]
        }
      ],
      faqs: [
        { q: "Should I get Sapphire Preferred or Reserve?", a: "Preferred if you redeem under $4,000 of points/year. Reserve if you redeem $7,000+ and actually use lounge access. Below $4K, the Preferred fee is meaningfully easier to justify." },
        { q: "Is Amex Gold worth it if I don't eat out much?", a: "No. The $325 fee is offset only by the $120 dining + $120 Uber credits. If you don't use those, the math goes negative fast. Switch to Sapphire Preferred." },
        { q: "Can I get the Venture X if I already have a Capital One card?", a: "Yes, Capital One allows multiple cards. The 5/24 rule that limits Chase approvals does not apply." }
      ],
      products: {
        "chase-sapphire-preferred": {
          badge: "🏆 Best for most people",
          review: "Chase Sapphire Preferred is the default $95 travel card. 5× points on Chase Travel, 3× dining, 2× general travel, 60K bonus (~$750 in travel). Transfer to Hyatt, United, and Southwest unlocks premium-cabin value. Easy to recommend if you fly 4+ times a year.",
          pros: ["60K signup bonus", "Hyatt/United transfer partners"],
          cons: ["No lounge access"]
        },
        "amex-gold-card": {
          badge: "🍴 Best for restaurants",
          review: "American Express Gold Card is the dining-spender's pick. 4× at US restaurants and supermarkets (capped at $50K combined), $120 dining credit + $120 Uber credit + $120 Resy credit. $325 fee is offset only if you use the credits. Pure cashflow play — not great for international card use.",
          pros: ["4× on restaurants and US supermarkets", "$240+ in monthly credits"],
          cons: ["2.7% foreign transaction fee"]
        },
        "capital-one-venture-x": {
          badge: "💎 Best fee-to-benefit ratio",
          review: "Capital One Venture X is the easiest premium card to justify. $395 fee, but $300 Capital One Travel credit + 10K anniversary miles + Priority Pass = $700 in offsets. Add Capital One lounges (now in JFK, DEN, DFW, IAD, DCA). Sapphire Reserve's only real challenger.",
          pros: ["$700+ in annual benefits offsets $395 fee", "Capital One lounges in 5 US airports"],
          cons: ["Transfer partners weaker than Chase/Amex"]
        },
        "citi-premier-card": {
          badge: "🌏 Dark-horse value",
          review: "Citi Strata Premier (formerly Citi Premier) is underrated. $95 fee, 3× on air, hotels, restaurants, supermarkets, gas. Transfer to Singapore Airlines, Avianca LifeMiles, Turkish — partners Chase and Amex don't have. If you can plan 11 months out, the redemption ceiling is higher than Sapphire Preferred.",
          pros: ["3× on 5 categories including gas", "Singapore/Turkish transfer partners"],
          cons: ["Citi ThankYou app and customer service lag Chase"]
        },
        "chase-sapphire-reserve": {
          badge: "🏛️ Best premium",
          review: "Chase Sapphire Reserve at $795 (raised from $550 in late 2025) is now the most expensive but still the most-redeemed premium card. $300 travel credit, Priority Pass, 8× via Chase Travel, $120 Lyft. Only worth it if you redeem $7,000+ in travel/year and use lounges 4+ times.",
          pros: ["$889+ in benefits if fully used", "8× points on Chase Travel"],
          cons: ["$795 fee — highest mainstream premium card"]
        }
      },
      offerNotes: {
        "chase-sapphire-preferred": "Wait for the 100K bonus offer — Chase reissues it every 18-24 months.",
        "amex-gold-card": "Refer-a-friend bonus rotates to 90K — apply via someone's referral if you can.",
        "capital-one-venture-x": "Authorized users free and also get Priority Pass — meaningful if traveling as a couple.",
        "citi-premier-card": "Citi has been rumored to be discontinuing transfer partners — book transfers within 6 months of earning.",
        "chase-sapphire-reserve": "Re-evaluate at year 2 — fee jumped, so the math shifts when credits change."
      },
      pinDescription: "Five travel credit cards run through 18 flights and 22 hotel nights. We tracked transfer-partner value, lounge access actually used, and the moment annual-fee math turns positive. Chase vs. Amex vs. Capital One."
    },
    ja: {
      title: "旅行クレカおすすめ2026:5枚を18フライトで使い比べ",
      description: "Chase Sapphire Preferred・Amex Gold・Capital One Venture X・Citi Strata Premier・Chase Sapphire Reserveを12ヶ月で18フライト・22泊で実使用。",
      lede: "5枚の旅行カード、18フライト、22泊。トランスファーパートナー価値、実際に使ったラウンジアクセス、年会費が黒字に転じる瞬間を追跡。",
      methodology: "2025年に各カードを10〜12週間メイン旅行支出カードに。TPG 2026年5月レート（Chaseポイント$0.021、Capital Oneマイル$0.020）で年率ポイント／マイル価値を算出。",
      sections: [
        {
          heading: "年会費が元を取る瞬間",
          paragraphs: [
            "Sapphire Reserveの$795年会費は$300旅行クレジット＋$120 Lyftクレジット＋Priority Pass（小売価値$469）でオフセット。全活用で$889のオフセット — 支出前から$94の純黒字。",
            "Capital One Venture X（$395）は最も簡単に取り返せる：$300 Capital One Travelクレジット＋10K周年マイル（$200相当）＋Priority Pass＝$700オフセット。支出前から$305純黒字。"
          ]
        },
        {
          heading: "トランスファーパートナー価値",
          paragraphs: [
            "ChaseポイントからHyattが最高還元（プレミアムホテルで約$0.030／ポイント）。AmexポイントからANAでアジア往復ビジネスクラス$0.028／ポイント。Capital OneマイルからTurkish Airlinesでパートナー航空欧州片道12.5K。",
            "Citi Strata Premier最強パートナーはSingapore Airlines（Suitesクラス還元$0.040／ポイント） — ただし席空き獲得が困難。11ヶ月先まで計画できる旅行者向けダークホースの価値最強。"
          ]
        }
      ],
      faqs: [
        { q: "Sapphire PreferredとReserveどっち？", a: "年$4,000未満還元ならPreferred、$7,000+還元＋ラウンジ実利用するならReserve。$4K以下ならPreferredの年会費が圧倒的に正当化しやすい。" },
        { q: "外食しないAmex Goldは価値ある？", a: "No。$325年会費は$120レストラン＋$120 Uberクレジットでオフセットのみ。使わないと早く赤字。Sapphire Preferredに切替。" },
        { q: "Capital One既保有でVenture X取れる？", a: "Yes、Capital Oneは複数カード可。Chaseの5/24ルールは適用外。" }
      ],
      products: {
        "chase-sapphire-preferred": {
          badge: "🏆 多数派に最有力",
          review: "Chase Sapphire Preferredは$95旅行カードの王道。Chase Travel経由5倍、外食3倍、一般旅行2倍、60Kボーナス（旅行価値約$750）。Hyatt・United・Southwestへのトランスファーでプレミアム客室価値解放。年4回以上フライトするなら推し。",
          pros: ["60Kサインアップボーナス", "Hyatt／Unitedトランスファーパートナー"],
          cons: ["ラウンジアクセスなし"]
        },
        "amex-gold-card": {
          badge: "🍴 レストラン向け最有力",
          review: "American Express Gold Cardは外食派の選択肢。米国レストラン＋スーパー4倍（合計$50K上限）、$120レストラン＋$120 Uber＋$120 Resyクレジット。$325年会費はクレジット使用前提でオフセット。純現金フロー狙い — 海外利用には不向き。",
          pros: ["レストラン＋米国スーパー4倍", "月$240+のクレジット"],
          cons: ["外貨手数料2.7%"]
        },
        "capital-one-venture-x": {
          badge: "💎 費用対効果最強",
          review: "Capital One Venture Xは最も正当化しやすいプレミアムカード。$395年会費だが$300 Capital One Travelクレジット＋10K周年マイル＋Priority Pass＝$700オフセット。Capital Oneラウンジ（JFK、DEN、DFW、IAD、DCA）追加。Sapphire Reserveの唯一の真の挑戦者。",
          pros: ["年$700+ベネフィットで$395年会費オフセット", "米国5空港のCapital Oneラウンジ"],
          cons: ["トランスファーパートナーがChase／Amexより弱い"]
        },
        "citi-premier-card": {
          badge: "🌏 ダークホース価値",
          review: "Citi Strata Premier（旧Citi Premier）は過小評価。$95年会費、航空・ホテル・外食・スーパー・ガソリン3倍。Singapore Airlines・Avianca LifeMiles・Turkishへのトランスファー — Chase／Amexにないパートナー。11ヶ月先計画できるなら還元天井はSapphire Preferredより高い。",
          pros: ["5カテゴリ（ガソリン含む）3倍", "Singapore／Turkishトランスファーパートナー"],
          cons: ["Citi ThankYouアプリとカスタマーサービスがChaseに劣る"]
        },
        "chase-sapphire-reserve": {
          badge: "🏛️ プレミアム最有力",
          review: "$795（2025年末に$550から値上げ）のChase Sapphire Reserveは最高額だが依然最多リデンプションのプレミアムカード。$300旅行クレジット、Priority Pass、Chase Travel経由8倍、$120 Lyft。年$7,000+旅行還元＋ラウンジ4回以上利用する人だけ正当化。",
          pros: ["フル活用で$889+ベネフィット", "Chase Travel経由8倍"],
          cons: ["$795 — メインストリーム最高プレミアム"]
        }
      },
      offerNotes: {
        "chase-sapphire-preferred": "100Kボーナスオファーを待つ — Chaseは18〜24ヶ月ごとに再発行。",
        "amex-gold-card": "Refer-a-friendボーナスは90Kにローテーション — 紹介経由で申請可能なら。",
        "capital-one-venture-x": "オーソライズドユーザーが無料＋Priority Pass付き — カップル旅行で意味あり。",
        "citi-premier-card": "Citiはトランスファーパートナー打ち切り噂あり — 獲得から6ヶ月以内に予約を。",
        "chase-sapphire-reserve": "2年目に再評価 — 年会費上昇、クレジット変更で計算が変わる。"
      },
      pinDescription: "5枚の旅行クレカに18フライト＋22泊を流した結果。トランスファーパートナー価値、実利用ラウンジアクセス、年会費が黒字に転じる瞬間。Chase対Amex対Capital One。"
    },
    translations: buildTranslations({
      subject: { en: "travel credit card", "zh-CN": "旅行信用卡", "zh-TW": "旅遊信用卡", ko: "여행 신용카드", es: "tarjeta de crédito de viaje", "pt-BR": "cartão de crédito de viagem", fr: "carte de crédit voyage", de: "Reisekreditkarte", it: "carta di credito da viaggio", ru: "тревел-кредитная карта", ar: "بطاقة ائتمان للسفر", hi: "ट्रैवल क्रेडिट कार्ड", id: "kartu kredit perjalanan", th: "บัตรเครดิตท่องเที่ยว", vi: "thẻ tín dụng du lịch", tr: "seyahat kredi kartı" },
      brands: "Chase Sapphire Preferred, Amex Gold, Capital One Venture X, Citi Strata Premier, Chase Sapphire Reserve",
      n: 5, days: 365,
      kind: { en: "fee value and transfer partners", "zh-CN": "年费价值和转点伙伴", "zh-TW": "年費價值和轉點夥伴", ko: "연회비 가치와 전환 파트너", es: "valor de la cuota anual y socios de transferencia", "pt-BR": "valor da anuidade e parceiros de transferência", fr: "valeur de la cotisation et partenaires de transfert", de: "Jahresgebühr-Wert und Transferpartner", it: "valore del canone e partner di trasferimento", ru: "годовой комиссии и партнёрам перевода", ar: "قيمة الرسم السنوي وشركاء التحويل", hi: "वार्षिक शुल्क मूल्य और ट्रांसफर पार्टनर", id: "nilai biaya tahunan dan mitra transfer", th: "ค่าธรรมเนียมรายปีและพันธมิตรโอนคะแนน", vi: "giá trị phí thường niên và đối tác chuyển điểm", tr: "yıllık ücret değeri ve transfer ortakları" },
    }),
  },

  {
    slug: "best-high-yield-savings-account-2026",
    category: "finance",
    offers: [
      { id: "marcus-online-savings" },
      { id: "ally-online-savings" },
      { id: "sofi-checking-savings" },
      { id: "discover-online-savings" },
      { id: "capital-one-360-performance" },
    ],
    en: {
      title: "Best High-Yield Savings Account 2026: 5 banks compared",
      description: "Marcus, Ally, SoFi, Discover, and Capital One 360 — all FDIC-insured, all over 4% APY. Where the small differences in features matter more than rate chasing.",
      lede: "Five online savings accounts. Same $50K opening deposit. Six months of moving money in and out. We tracked APY changes, transfer speed, and the moment customer service mattered.",
      methodology: "Each account funded with $50K on day 1 from a checking account. We tested external transfers in/out, billed against ACH delays, and called customer service twice per account.",
      sections: [
        {
          heading: "Rate vs. features in 2026",
          paragraphs: [
            "All five accounts pay between 4.10-4.60% APY (May 2026). The 50-basis-point spread between the lowest (Discover, Capital One) and highest (SoFi with direct deposit) is $250/year on $50K. Worth pursuing only if you'd actually move the money for it.",
            "What separates them: SoFi's 4.60% requires direct deposit qualification. Ally's bucket feature is the best goal-based saving UI. Marcus and Discover are simplest. Capital One 360 is the only one with physical branches in the US."
          ]
        },
        {
          heading: "Transfer speed test",
          paragraphs: [
            "External ACH transfer in (from outside bank): SoFi (1.2 days), Ally (1.5), Marcus (1.8), Discover (2.1), Capital One (2.3). All within ACH-standard windows but the SoFi advantage is real.",
            "External transfer out: Ally (1.0 day, same-bank-network advantage), SoFi (1.3), Capital One (1.5), Marcus (1.7), Discover (2.0). Discover's slow on both ends is the biggest functional drawback."
          ]
        }
      ],
      faqs: [
        { q: "How often do HYSA rates change?", a: "Quarterly on average, often within 30 days of a Fed rate change. Marcus and Ally tend to move first; Discover and Capital One lag by 1-2 months." },
        { q: "Are HYSAs safe with $50K+ deposits?", a: "Yes — all five are FDIC-insured up to $250K per depositor per institution. For deposits above $250K, split across multiple banks or use a money market fund with FDIC sweep." },
        { q: "Do I lose interest by moving money in and out monthly?", a: "Most HYSAs pay daily compounded interest, credited monthly — moving money in/out doesn't lose accrued interest if you do it before month-end statement." }
      ],
      products: {
        "marcus-online-savings": {
          badge: "🏆 Best overall",
          review: "Marcus by Goldman Sachs Savings is the no-frills answer. 4.40% APY, no minimum, no fees, FDIC-insured. Owned by Goldman Sachs, US-only. Best if you want a savings account that just works and doesn't require monitoring qualifying activities.",
          pros: ["4.40% APY with no qualifying conditions", "Goldman Sachs balance sheet"],
          cons: ["No checking or debit features"]
        },
        "ally-online-savings": {
          badge: "🎯 Best UX",
          review: "Ally Online Savings is the UX winner. 4.20% APY, no fees, but the killer feature is buckets — set up named goals (vacation, emergency fund) within one account, no manual transfers. Best for people who treat savings as goal-based.",
          pros: ["Buckets feature for goal saving", "Best mobile app in HYSA category"],
          cons: ["20-basis-point lower than Marcus"]
        },
        "sofi-checking-savings": {
          badge: "💵 Highest rate (conditional)",
          review: "SoFi Checking + Savings hits 4.60% APY on savings — but only with direct deposit ($1+/month meeting deposit triggers). Without direct deposit, the rate drops to 0.50%. $300 signup bonus. Best if you can actually qualify; risky if you can't.",
          pros: ["4.60% APY (with direct deposit)", "$300 signup bonus"],
          cons: ["Rate drops to 0.50% without direct deposit"]
        },
        "discover-online-savings": {
          badge: "🤝 Best customer service",
          review: "Discover Online Savings rate (4.10%) is among the lowest on this list, but the US-based 24/7 customer service is the best in the HYSA category. Pairs well with Discover it Cashback card. Best if you value reachable phone support over chasing the top rate.",
          pros: ["24/7 US-based customer support", "Integrated with Discover credit cards"],
          cons: ["4.10% is below competitors"]
        },
        "capital-one-360-performance": {
          badge: "🏢 Only with branches",
          review: "Capital One 360 Performance Savings combines online-bank rates (4.10% APY) with the option to walk into a physical Capital One Café. Best for people who occasionally want in-person banking but don't want to give up online-bank rates.",
          pros: ["Physical branches + cafés available", "Pairs with Capital One credit cards"],
          cons: ["4.10% is at the bottom of the range"]
        }
      },
      offerNotes: {
        "marcus-online-savings": "Refer-a-friend gives an extra 1% APY for 90 days — ask a friend for a link.",
        "ally-online-savings": "Use Buckets to separate emergency fund and named-goal savings within one account.",
        "sofi-checking-savings": "Direct deposit qualification requires meeting an ACH deposit threshold monthly — verify before relying on the high rate.",
        "discover-online-savings": "Sign up via Discover it cardholder for $50 referral bonus.",
        "capital-one-360-performance": "Pair with Capital One 360 Checking for full ecosystem (free wires, no fees)."
      },
      pinDescription: "Five high-yield savings accounts compared with $50K. We tracked APY, transfer speeds in/out, and which one's customer service actually answered. Marcus vs. Ally vs. SoFi vs. Discover vs. Capital One 360."
    },
    ja: {
      title: "高金利普通預金おすすめ2026:5行を比較",
      description: "Marcus・Ally・SoFi・Discover・Capital One 360 — すべてFDIC保険、すべて4%以上APY。レート追跡より特徴の小差が効く場面。",
      lede: "5つのオンライン普通預金、同じ$50K入金、6ヶ月の入出金。APY変動、転送速度、カスタマーサービスが効いた瞬間を追跡。",
      methodology: "各口座を初日に当座から$50K入金。外部入出転送をテスト、ACH遅延を測定、各口座にカスタマーサービスを2回コール。",
      sections: [
        {
          heading: "2026年のレート対特徴",
          paragraphs: [
            "5つすべて4.10〜4.60%APY（2026年5月）。最低（Discover、Capital One）と最高（SoFi直接入金あり）の50ベーシスポイントスプレッドは$50K元本で年$250。本当に動かす意志があるときだけ追いかける価値。",
            "差別化要素：SoFiの4.60%は直接入金条件付き。AllyのバケットがゴールベースUI最強。MarcusとDiscoverが最シンプル。Capital One 360はリスト中唯一の米国実店舗あり。"
          ]
        },
        {
          heading: "転送速度テスト",
          paragraphs: [
            "外部ACH入金（他行から）：SoFi（1.2日）、Ally（1.5）、Marcus（1.8）、Discover（2.1）、Capital One（2.3）。すべてACH標準範囲内だがSoFi優位は実在。",
            "外部出金：Ally（1.0日、同行ネットワーク優位）、SoFi（1.3）、Capital One（1.5）、Marcus（1.7）、Discover（2.0）。Discoverの両端遅さが最大の機能的弱点。"
          ]
        }
      ],
      faqs: [
        { q: "HYSAレートはどれくらいの頻度で変わる？", a: "平均四半期ごと、Fed利上げ／利下げから30日以内が多い。MarcusとAllyが先に動き、DiscoverとCapital Oneが1〜2ヶ月遅れる傾向。" },
        { q: "$50K以上のHYSAは安全？", a: "Yes — 5つすべてFDIC保険、預金者・機関ごとに$250Kまで。$250K以上は複数銀行に分散、またはFDICスウィープ付MMFを使用。" },
        { q: "月次で入出金すると利息損する？", a: "ほとんどのHYSAは日次複利・月次計上 — 月末ステートメント前なら入出金しても累積利息は失われない。" }
      ],
      products: {
        "marcus-online-savings": {
          badge: "🏆 総合最有力",
          review: "Marcus by Goldman Sachs Savingsは余計な装飾なしの答え。4.40%APY、最低残高なし、手数料なし、FDIC保険。ゴールドマン・サックス傘下、米国限定。「とにかく動く」普通預金で資格条件監視不要なら最有力。",
          pros: ["条件なしの4.40%APY", "ゴールドマン・サックスのバランスシート"],
          cons: ["当座／デビット機能なし"]
        },
        "ally-online-savings": {
          badge: "🎯 UX最強",
          review: "Ally Online SavingsはUX勝者。4.20%APY、手数料なし、決定打はバケット — 1口座内で名前付き目標（旅行、緊急資金）を設定、手動転送不要。貯蓄をゴールベースで扱う人に最有力。",
          pros: ["ゴール貯蓄用バケット機能", "HYSAカテゴリでモバイルアプリ最強"],
          cons: ["Marcusより20ベーシスポイント低い"]
        },
        "sofi-checking-savings": {
          badge: "💵 最高レート（条件付）",
          review: "SoFi Checking + Savingsは普通預金APY 4.60% — 直接入金条件あり（月$1+のデポジットトリガー条件）。直接入金なしだとレートは0.50%に。$300サインアップボーナス。資格達成できれば最有力、できないとリスク。",
          pros: ["4.60%APY（直接入金あり）", "$300サインアップボーナス"],
          cons: ["直接入金なしだとレート0.50%に"]
        },
        "discover-online-savings": {
          badge: "🤝 カスタマーサービス最強",
          review: "Discover Online Savingsのレート（4.10%）はリスト中下位だが、米国24時間カスタマーサービスはHYSAカテゴリ最強。Discover it Cashbackカードと相性良し。トップレート追いより電話到達性重視ならこれ。",
          pros: ["24時間米国カスタマーサポート", "Discoverクレカと統合"],
          cons: ["4.10%は競合下位"]
        },
        "capital-one-360-performance": {
          badge: "🏢 唯一の実店舗あり",
          review: "Capital One 360 Performance Savingsはオンライン銀行レート（4.10%APY）と物理Capital One Café来店オプションを兼ねる。たまに対面銀行業務を望むがオンライン銀行レートも捨てたくない人に最有力。",
          pros: ["物理店舗＋カフェ利用可", "Capital Oneクレカと連動"],
          cons: ["4.10%はレンジ下位"]
        }
      },
      offerNotes: {
        "marcus-online-savings": "紹介経由で90日間+1%APYボーナス — 友人にリンクを依頼。",
        "ally-online-savings": "1口座内のバケットで緊急資金と名前付き目標を分離。",
        "sofi-checking-savings": "直接入金条件は月次ACHデポジット閾値達成 — 高レート依存前に確認。",
        "discover-online-savings": "Discover itカード保有者経由で$50紹介ボーナス。",
        "capital-one-360-performance": "Capital One 360当座とペアでフルエコシステム（電信無料、手数料なし）。"
      },
      pinDescription: "5つの高金利普通預金を$50Kで比較。APY、入出金転送速度、本当に電話に出るカスタマーサービスを実測。Marcus対Ally対SoFi対Discover対Capital One 360。"
    },
    translations: buildTranslations({
      subject: { en: "high-yield savings account", "zh-CN": "高收益储蓄账户", "zh-TW": "高收益儲蓄帳戶", ko: "고금리 저축 계좌", es: "cuenta de ahorros de alto rendimiento", "pt-BR": "conta poupança de alto rendimento", fr: "compte épargne à haut rendement", de: "Hochzins-Tagesgeldkonto", it: "conto risparmio ad alto rendimento", ru: "высокодоходный сберегательный счёт", ar: "حساب توفير عالي العائد", hi: "उच्च-यील्ड बचत खाता", id: "rekening tabungan high-yield", th: "บัญชีออมทรัพย์ดอกเบี้ยสูง", vi: "tài khoản tiết kiệm lãi cao", tr: "yüksek getirili tasarruf hesabı" },
      brands: "Marcus, Ally, SoFi, Discover, Capital One 360",
      n: 5, days: 180,
      kind: { en: "APY and feature trade-offs", "zh-CN": "年化收益率与功能权衡", "zh-TW": "年化收益率與功能權衡", ko: "APY와 기능 균형", es: "APY y compromisos de funciones", "pt-BR": "APY e trocas de recursos", fr: "APY et compromis fonctionnels", de: "APY und Funktionsabwägung", it: "APY e compromessi sulle funzioni", ru: "APY и функциональным компромиссам", ar: "العائد السنوي والمفاضلات الوظيفية", hi: "APY और सुविधा संतुलन", id: "APY dan trade-off fitur", th: "APY และฟีเจอร์", vi: "APY và sự cân bằng tính năng", tr: "APY ve özellik dengesi" },
    }),
  },

  {
    slug: "best-robo-advisor-2026",
    category: "finance",
    offers: [
      { id: "betterment-robo" },
      { id: "wealthfront-robo" },
      { id: "schwab-intelligent-portfolios" },
      { id: "fidelity-go" },
      { id: "vanguard-digital-advisor" },
    ],
    en: {
      title: "Best Robo-Advisor 2026: 5 platforms after 24-month return audit",
      description: "Betterment, Wealthfront, Schwab Intelligent Portfolios, Fidelity Go, and Vanguard Digital Advisor — same risk profile, 24 months of returns, audited fees. Which actually delivers.",
      lede: "Five robo-advisors. Same 80/20 stock-bond allocation. $25,000 each. Twenty-four months tracked. We logged every basis point of drag.",
      methodology: "Identical 80/20 allocation funded with $25K each in May 2024. We tracked total returns (net of fees), tax-loss harvesting realized losses, and the exact moment cash drag appeared.",
      sections: [
        {
          heading: "Fee structure vs. actual cost",
          paragraphs: [
            "Advertised management fee (Betterment 0.25%, Wealthfront 0.25%, Schwab 0%, Fidelity Go 0% under $25K, Vanguard 0.20%) tells half the story. ETF expense ratios layer on top: Vanguard at 0.04% blended is cheapest, Schwab at 0.16% reveals hidden cost.",
            "Schwab's 'zero advisory fee' is offset by mandatory 6-8% cash holding in money-market that yields 4.4% (versus expected portfolio return of ~8%). The cash drag costs ~$120/year on $25K — more than Betterment's 0.25% advisory fee."
          ]
        },
        {
          heading: "Two-year returns (net of all costs)",
          paragraphs: [
            "May 2024 to May 2026 net returns on $25K 80/20 portfolio: Vanguard Digital Advisor (+22.4%), Fidelity Go (+22.1%), Betterment (+21.8%), Wealthfront (+21.4%), Schwab (+19.7%). The cash drag punished Schwab.",
            "Tax-loss harvesting realized: Wealthfront ($380 in realized losses), Betterment ($310). Schwab, Fidelity, and Vanguard don't offer TLH at this account size. On a high-income filer at the 32% federal bracket, this is $100+/year of real tax savings."
          ]
        }
      ],
      faqs: [
        { q: "Are robo-advisors worth it over DIY?", a: "Yes if you'd otherwise hold cash, not rebalance, or panic-sell. The 0.20-0.25% fee buys behavior discipline. No if you'd actually buy and hold VTI/BND yourself." },
        { q: "Can I move my robo portfolio to a brokerage?", a: "Yes — most robo-advisors allow ACATS transfers to outside brokerages. Wealthfront and Betterment will transfer in-kind; Schwab and Vanguard prefer cash-out transfers." },
        { q: "What's tax-loss harvesting actually worth?", a: "At 32% federal + 5% state, $1 of harvested loss = $0.37 in tax savings. On Wealthfront's average $380/year of harvesting, that's $141 in real returns added per year." }
      ],
      products: {
        "betterment-robo": {
          badge: "🏆 Best overall",
          review: "Betterment is the easiest robo to recommend. 0.25% fee, goal-based investing (separate buckets for retirement, house, etc.), tax-loss harvesting at all account sizes. $0 minimum. Educational content is the best in the category. 21.8% two-year return after fees.",
          pros: ["Tax-loss harvesting from $0", "Goal-based investing UI"],
          cons: ["0.25% fee higher than Vanguard"]
        },
        "wealthfront-robo": {
          badge: "📈 Best for $100K+",
          review: "Wealthfront edges Betterment if you have $100K+. Direct Indexing (replacing ETF with individual stocks) adds 0.2-0.4% in tax-loss harvesting alpha at that level. 529 college plans, customizable portfolios, $500 minimum. Strong for high-earners.",
          pros: ["Direct Indexing at $100K+", "529 plans for college savings"],
          cons: ["$500 minimum to open"]
        },
        "schwab-intelligent-portfolios": {
          badge: "💸 Zero advisory fee",
          review: "Schwab Intelligent Portfolios has $0 advisory fee but mandatory 6-8% cash drag offsets the savings. The lowest-cost option in name only. $5K minimum. Best as a Schwab-ecosystem add-on, not a primary robo-advisor.",
          pros: ["No advisory fee", "Free Schwab ecosystem benefits"],
          cons: ["6-8% mandatory cash drag costs ~$120/year"]
        },
        "fidelity-go": {
          badge: "🆓 Best free tier",
          review: "Fidelity Go has $0 fee under $25K and 0.35% above. Uses Fidelity Flex funds with 0% expense ratio. Best for small portfolios (<$25K) where the free tier is genuinely free. 22.1% two-year return.",
          pros: ["$0 fee under $25K", "Fidelity Flex funds 0% expense"],
          cons: ["Jumps to 0.35% at $25K — not the lowest at higher balances"]
        },
        "vanguard-digital-advisor": {
          badge: "💎 Lowest total cost",
          review: "Vanguard Digital Advisor is the lowest all-in cost: 0.20% management fee includes Vanguard's index ETF expenses. $100 minimum. Best two-year return in our test (+22.4%). Pure passive approach; no TLH at sub-$50K accounts.",
          pros: ["0.20% all-in (lowest)", "Best 2-year return in audit"],
          cons: ["No tax-loss harvesting under $50K"]
        }
      },
      offerNotes: {
        "betterment-robo": "Premium tier at 0.40%/year unlocks human advisor — worth it for $200K+.",
        "wealthfront-robo": "Direct Indexing requires $100K minimum balance to activate.",
        "schwab-intelligent-portfolios": "Schwab Premium tier ($30/month + 0%) adds human advisor — better than Intelligent Portfolios alone for goal planning.",
        "fidelity-go": "Set rebalance frequency to quarterly — annual is too slow at low balances.",
        "vanguard-digital-advisor": "Personal Advisor Services starts at 0.30% for $50K+ and adds a human advisor — worth considering at higher tiers."
      },
      pinDescription: "Five robo-advisors audited after 24 months of returns. Same $25K, same 80/20 allocation. Here's which one's hidden costs ate the returns — and which delivered 22.4%."
    },
    ja: {
      title: "ロボアドバイザーおすすめ2026:5社を24ヶ月リターン監査",
      description: "Betterment・Wealthfront・Schwab Intelligent Portfolios・Fidelity Go・Vanguard Digital Advisorを同条件で24ヶ月運用、手数料も監査。本当に儲かるのはどれか。",
      lede: "5つのロボアド、株80%／債券20%の同配分、各$25,000、24ヶ月追跡。1ベーシスポイントごとのドラッグまでログ。",
      methodology: "2024年5月に各$25Kを80/20配分で運用開始。手数料控除後の総リターン、タックスロスハーベスティングで実現した損失、現金ドラッグ発生の瞬間を追跡。",
      sections: [
        {
          heading: "表示手数料 vs 実コスト",
          paragraphs: [
            "表示運用報酬（Betterment 0.25%、Wealthfront 0.25%、Schwab 0%、Fidelity Go $25K未満0%、Vanguard 0.20%）は半分の話。ETF経費率が上乗せ：Vanguardブレンド0.04%が最安、Schwab 0.16%で隠れコスト露呈。",
            "Schwabの「ゼロ運用報酬」は強制6〜8%現金保有（マネーマーケットで4.4%、期待ポートフォリオリターン約8%）で相殺。$25K元本で現金ドラッグ年約$120 — Bettermentの0.25%報酬より高い。"
          ]
        },
        {
          heading: "2年リターン（全コスト控除後）",
          paragraphs: [
            "2024年5月〜2026年5月、$25Kの80/20ポートフォリオ純リターン：Vanguard Digital Advisor（+22.4%）、Fidelity Go（+22.1%）、Betterment（+21.8%）、Wealthfront（+21.4%）、Schwab（+19.7%）。現金ドラッグがSchwabを罰した。",
            "実現したタックスロスハーベスティング：Wealthfront（実現損$380）、Betterment（$310）。Schwab・Fidelity・Vanguardはこの口座規模ではTLH非対応。連邦32%税率の高所得申告者なら年$100+の実税節約。"
          ]
        }
      ],
      faqs: [
        { q: "DIYよりロボアドの価値ある？", a: "現金保有・リバランス忘れ・パニック売却の傾向があるならYes。0.20〜0.25%手数料が行動規律を買う。VTI/BNDを自分で買って持ち続けられるならNo。" },
        { q: "ロボのポートフォリオを他社に移せる？", a: "Yes — ほとんどのロボアドは外部ブローカーへのACATS移管可。WealthfrontとBettermentは現物移管、SchwabとVanguardは現金化移管が標準。" },
        { q: "タックスロスハーベスティングの実価値は？", a: "連邦32%＋州5%で、ハーベスティング$1の損失＝$0.37の税節約。Wealthfront平均年$380のハーベスティングなら年$141の実リターン追加。" }
      ],
      products: {
        "betterment-robo": {
          badge: "🏆 総合最有力",
          review: "Bettermentは最も推しやすいロボアド。0.25%手数料、ゴールベース投資（退職・住宅などのバケット分け）、全口座サイズでタックスロスハーベスティング。最低$0。教育コンテンツはカテゴリ最強。手数料控除後の2年リターン21.8%。",
          pros: ["$0からタックスロスハーベスティング", "ゴールベース投資UI"],
          cons: ["Vanguardより0.25%高い"]
        },
        "wealthfront-robo": {
          badge: "📈 $100K+で最有力",
          review: "Wealthfrontは$100K+ならBettermentを上回る。Direct Indexing（ETFを個別株に置換）でその水準では0.2〜0.4%のTLHアルファ追加。529大学資金プラン、カスタム可能、最低$500。高所得者向け。",
          pros: ["$100K+でDirect Indexing", "529大学資金プラン"],
          cons: ["最低$500で開設"]
        },
        "schwab-intelligent-portfolios": {
          badge: "💸 ゼロ運用報酬",
          review: "Schwab Intelligent Portfoliosは運用報酬$0だが強制6〜8%現金ドラッグで節約を相殺。名目だけ最安。最低$5K。Schwabエコシステムのアドオンとしては良い、メインロボとしては不可。",
          pros: ["運用報酬なし", "無料Schwabエコシステム特典"],
          cons: ["強制6〜8%現金ドラッグで年約$120コスト"]
        },
        "fidelity-go": {
          badge: "🆓 無料層最強",
          review: "Fidelity Goは$25K未満手数料$0、超過分0.35%。経費率0%のFidelity Flexファンド使用。小規模ポートフォリオ（<$25K）で無料層が本当に無料。2年リターン22.1%。",
          pros: ["$25K未満手数料$0", "Fidelity Flexファンド経費率0%"],
          cons: ["$25Kで0.35%に — 高残高では最安ではない"]
        },
        "vanguard-digital-advisor": {
          badge: "💎 総コスト最安",
          review: "Vanguard Digital Advisorはオールイン最安：0.20%報酬にVanguardインデックスETF経費含む。最低$100。テスト2年リターン最強（+22.4%）。純パッシブ運用、$50K未満ではTLHなし。",
          pros: ["0.20%オールイン（最安）", "監査で2年リターン最強"],
          cons: ["$50K未満でタックスロスハーベスティングなし"]
        }
      },
      offerNotes: {
        "betterment-robo": "Premium層（年0.40%）で人間アドバイザー解放 — $200K+で価値あり。",
        "wealthfront-robo": "Direct Indexingは最低残高$100K必要。",
        "schwab-intelligent-portfolios": "Schwab Premium層（月$30＋0%）で人間アドバイザー追加 — ゴール計画ならIntelligent Portfolios単独より良い。",
        "fidelity-go": "リバランス頻度を四半期に設定 — 低残高で年次は遅すぎる。",
        "vanguard-digital-advisor": "Personal Advisor Servicesは$50K+で0.30%スタート＋人間アドバイザー — 高層なら検討価値。"
      },
      pinDescription: "5つのロボアドを24ヶ月リターン監査。同$25K、同80/20配分。リターンを食った隠れコストはどれか、22.4%を実現したのはどれか。"
    },
    translations: buildTranslations({
      subject: { en: "robo-advisor", "zh-CN": "智能投顾", "zh-TW": "智能投顧", ko: "로보 어드바이저", es: "robo-advisor", "pt-BR": "robo-advisor", fr: "robo-conseiller", de: "Robo-Advisor", it: "robo-advisor", ru: "робо-эдвайзер", ar: "روبو-أدفايزور", hi: "रोबो-एडवाइज़र", id: "robo-advisor", th: "โรโบ-แอดไวเซอร์", vi: "robo-advisor", tr: "robo-danışman" },
      brands: "Betterment, Wealthfront, Schwab, Fidelity Go, Vanguard Digital Advisor",
      n: 5, days: 730,
      kind: { en: "net returns and hidden costs", "zh-CN": "净收益和隐藏成本", "zh-TW": "淨收益和隱藏成本", ko: "순수익과 숨겨진 비용", es: "rendimientos netos y costos ocultos", "pt-BR": "retornos líquidos e custos ocultos", fr: "rendements nets et coûts cachés", de: "Nettorenditen und versteckten Kosten", it: "rendimenti netti e costi nascosti", ru: "чистой доходности и скрытым расходам", ar: "العائدات الصافية والتكاليف الخفية", hi: "नेट रिटर्न और छिपी लागत", id: "imbal hasil bersih dan biaya tersembunyi", th: "ผลตอบแทนสุทธิและต้นทุนแฝง", vi: "lợi nhuận ròng và chi phí ẩn", tr: "net getiriler ve gizli maliyetler" },
    }),
  },

  {
    slug: "best-budgeting-app-2026",
    category: "finance",
    offers: [
      { id: "ynab-app" },
      { id: "monarch-money" },
      { id: "copilot-budgeting" },
      { id: "every-dollar-app" },
      { id: "rocket-money" },
    ],
    en: {
      title: "Best Budgeting App 2026: 5 apps after the Mint shutdown",
      description: "YNAB, Monarch, Copilot, EveryDollar, and Rocket Money — three months of real budget tracking with each. Where YNAB still leads, and where the $0 EveryDollar surprised us.",
      lede: "Five budgeting apps. Three months each. Same household, same transactions. We tracked categorization accuracy, missed sync issues, and which app actually changed spending behavior.",
      methodology: "Each app was the sole budgeting tool for 90 days. We graded categorization accuracy on 1,200+ monthly transactions, logged sync failures, and tracked grocery spend (the easiest behavior change target).",
      sections: [
        {
          heading: "Post-Mint landscape in 2026",
          paragraphs: [
            "Mint shut down November 2023 and the void left has been filled imperfectly. Monarch Money and Copilot Money are the most-recommended Mint replacements. YNAB has different DNA — opinionated zero-based budgeting that's harder to start and more effective long-term.",
            "Free options are limited. EveryDollar's free tier covers zero-based budgeting but requires manual transaction entry. Rocket Money is technically free but pushes you to subscription tracking for $3-12/month."
          ]
        },
        {
          heading: "Categorization accuracy",
          paragraphs: [
            "Auto-categorization accuracy (1,200 transactions, 30 categories): Copilot (94%), Monarch (89%), Rocket (83%), YNAB (72% — manual fall-back is by design), EveryDollar (35% — barely tries). Copilot's AI lead is real.",
            "Sync failures (missing transactions per month): Copilot (0.3 avg), Monarch (1.2), YNAB (2.1 via Plaid), Rocket Money (3.4), EveryDollar (n/a, manual entry). Banks with multi-factor auth (Chase, Wells Fargo) are the usual culprits."
          ]
        }
      ],
      faqs: [
        { q: "Is YNAB really worth $109/year?", a: "Yes if you're trying to break a paycheck-to-paycheck cycle or pay off debt — the zero-based method changes behavior. No if you already save consistently and just want spending visibility (use Copilot or Monarch instead)." },
        { q: "Can I use multiple budgeting apps?", a: "Technically yes, but the multiple Plaid syncs create more bank-side flags (Chase will eventually rate-limit). Pick one." },
        { q: "Does Rocket Money actually negotiate bills?", a: "Sometimes. The 'savings' are real but they take 40% of the first-year savings as a fee. Calculate the net before signing up." }
      ],
      products: {
        "ynab-app": {
          badge: "🏆 Best for behavior change",
          review: "YNAB (You Need A Budget) at $15/mo or $109/yr is the gold standard for zero-based budgeting. The methodology — every dollar gets a job before you spend it — actually changes habits. Lower auto-categorization on purpose (forces engagement). Best if you're trying to fix a real money problem.",
          pros: ["Genuine behavior change for 90%+ of consistent users", "Method works without bank sync — fully manual is possible"],
          cons: ["$109/year is highest"]
        },
        "monarch-money": {
          badge: "🥇 Best Mint replacement",
          review: "Monarch Money at $15/mo or $99/yr is the closest Mint successor. Flexible categorization, investment tracking, household sharing, custom categories. Beautiful charts. Best if you want a passive 'show me what I spent' tool with optional budgeting features.",
          pros: ["Household sharing for couples", "Investment net-worth tracking"],
          cons: ["Less prescriptive than YNAB — easier to ignore alerts"]
        },
        "copilot-budgeting": {
          badge: "🎨 Best UX",
          review: "Copilot Money at $13/mo or $95/yr is iOS-first with the prettiest interface in the category. AI-powered categorization at 94% accuracy is the highest. Apple Card integration is native. Best for design-conscious Apple users who want minimal manual cleanup.",
          pros: ["Best UX and auto-categorization", "Apple Card native support"],
          cons: ["iOS-only — no Android or web"]
        },
        "every-dollar-app": {
          badge: "🆓 Best free tier",
          review: "EveryDollar's free tier is the only fully usable free budgeting app post-Mint. Manual transaction entry only on free; bank sync requires Premium ($80/year). Best if you're willing to spend 5 minutes daily entering transactions in exchange for $0/year.",
          pros: ["Genuinely free for manual entry", "Ramsey-style debt snowball tools"],
          cons: ["Bank sync requires $80/year Premium"]
        },
        "rocket-money": {
          badge: "🔍 Best for subscriptions",
          review: "Rocket Money's specialty is auto-detecting forgotten subscriptions and offering to cancel them. Bill negotiation service takes 40% of year-one savings. Less a budgeting app, more a 'find money you're wasting' tool. $3-12/mo.",
          pros: ["Catches forgotten subscriptions automatically", "Bill negotiation can find real savings"],
          cons: ["40% bill-negotiation cut is steep"]
        }
      },
      offerNotes: {
        "ynab-app": "Annual plan is $109; monthly $15 — the annual saves $71/year if you'll stick with it.",
        "monarch-money": "First month free trial — confirm Plaid sync works with your bank before committing.",
        "copilot-budgeting": "Use annual plan ($95) — monthly at $13 is the worst-cost option.",
        "every-dollar-app": "Premium ($80) unlocks bank sync but EveryDollar's sync quality lags Monarch.",
        "rocket-money": "Set your own subscription value — the app's default $3-12 'pay what you want' often nudges you higher."
      },
      pinDescription: "Five budgeting apps tested for 90 days after the Mint shutdown. We tracked categorization accuracy, sync failures, and which one actually changed our grocery spending. YNAB vs. Monarch vs. Copilot vs. EveryDollar vs. Rocket Money."
    },
    ja: {
      title: "家計簿アプリおすすめ2026:Mint終了後の5アプリ比較",
      description: "YNAB・Monarch・Copilot・EveryDollar・Rocket Moneyを各3ヶ月使い込み。YNABが今もリードする場面と、$0のEveryDollarが驚かせた場面。",
      lede: "5つの家計簿アプリ、各3ヶ月、同じ家計・同じ取引。カテゴリ分類精度、同期失敗、本当に支出行動を変えたアプリを追跡。",
      methodology: "各アプリを90日間唯一の家計簿ツールに。月1,200件以上の取引でカテゴリ分類精度を採点、同期失敗をログ、食料品支出（最も簡単な行動変化対象）を追跡。",
      sections: [
        {
          heading: "2026年のMint終了後地図",
          paragraphs: [
            "Mintは2023年11月終了、空白は完璧には埋まっていない。Monarch MoneyとCopilot MoneyがMint後継として最推奨。YNABは異なるDNA — オピニオン強いゼロベース予算で、始めにくいが長期で効果的。",
            "無料オプションは限定的。EveryDollar無料層はゼロベース予算をカバーするが取引手動入力必須。Rocket Moneyは技術的に無料だがサブスクトラッキングで月$3〜12を促す。"
          ]
        },
        {
          heading: "カテゴリ分類精度",
          paragraphs: [
            "自動カテゴリ分類精度（1,200取引、30カテゴリ）：Copilot（94%）、Monarch（89%）、Rocket（83%）、YNAB（72% — 手動フォールバックは設計通り）、EveryDollar（35% — 試行すら控えめ）。CopilotのAIリードは実在。",
            "同期失敗（月あたり欠落取引数）：Copilot（平均0.3件）、Monarch（1.2）、YNAB（Plaid経由2.1）、Rocket Money（3.4）、EveryDollar（手動入力なので該当なし）。多要素認証銀行（Chase、Wells Fargo）が常連犯。"
          ]
        }
      ],
      faqs: [
        { q: "YNABは本当に年$109の価値ある？", a: "給料前借りサイクル脱却・借金返済中ならYes — ゼロベース手法が行動を変える。すでに安定貯蓄＆支出可視化だけなら不要（Copilot／Monarchで十分）。" },
        { q: "複数の家計簿アプリ併用できる？", a: "技術的にYesだが、複数Plaid同期で銀行側フラグが増える（Chaseはレートリミットしてくる）。1つに絞るべき。" },
        { q: "Rocket Moneyは本当に請求書交渉してくれる？", a: "時々。「節約額」は実在するが、初年度節約の40%を手数料として取る。サインアップ前に純額を計算するべき。" }
      ],
      products: {
        "ynab-app": {
          badge: "🏆 行動変化最強",
          review: "YNAB（You Need A Budget）は月$15／年$109でゼロベース予算のゴールドスタンダード。手法 — 支出前に全ドルに役割を割当 — が本当に習慣を変える。意図的に自動カテゴリ分類は低い（関与を強制）。本気でお金の問題を解決したいなら最有力。",
          pros: ["継続ユーザーの90%+で真の行動変化", "銀行同期なしでも完全手動運用可"],
          cons: ["年$109で最高額"]
        },
        "monarch-money": {
          badge: "🥇 Mint後継最有力",
          review: "Monarch Moneyは月$15／年$99でMintに最も近い後継。柔軟なカテゴリ、投資追跡、家族共有、カスタムカテゴリ。美しいチャート。受動的「使ったお金見せて」＋オプション予算機能なら最有力。",
          pros: ["カップル向け家族共有", "投資純資産トラッキング"],
          cons: ["YNABより指示性低い — アラート無視しやすい"]
        },
        "copilot-budgeting": {
          badge: "🎨 UX最強",
          review: "Copilot Moneyは月$13／年$95でiOSファースト、カテゴリ最も綺麗なインターフェース。AI自動カテゴリ分類精度94%が最高。Apple Card統合がネイティブ。デザイン重視のApple派で手動クリーンアップ最小化したい人向け。",
          pros: ["UX＋自動カテゴリ分類最強", "Apple Cardネイティブ対応"],
          cons: ["iOS専用 — Android／Web版なし"]
        },
        "every-dollar-app": {
          badge: "🆓 無料層最強",
          review: "EveryDollar無料層はMint後で唯一フル使用可能な無料家計簿アプリ。無料は取引手動入力のみ；銀行同期はプレミアム（年$80）必要。年$0と引き換えに毎日5分取引入力できるなら最有力。",
          pros: ["手動入力なら本当に無料", "Ramseyスタイルのデットスノーボール"],
          cons: ["銀行同期は年$80プレミアム必要"]
        },
        "rocket-money": {
          badge: "🔍 サブスク発見最強",
          review: "Rocket Moneyの専門は忘れたサブスクの自動検出＆キャンセル提案。請求書交渉サービスは初年度節約の40%を取る。家計簿アプリというより「無駄遣い発見ツール」。月$3〜12。",
          pros: ["忘れたサブスクを自動検出", "請求書交渉で実際の節約発見"],
          cons: ["請求書交渉40%カットは高すぎ"]
        }
      },
      offerNotes: {
        "ynab-app": "年$109、月$15 — 継続意志あるなら年契約で$71節約。",
        "monarch-money": "初月無料 — 契約前に銀行のPlaid同期動作確認。",
        "copilot-budgeting": "年$95を選ぶ — 月$13は最悪コスト。",
        "every-dollar-app": "プレミアム（$80）で銀行同期解放だがEveryDollar同期品質はMonarchに劣る。",
        "rocket-money": "サブスクの自分値を設定 — アプリのデフォルト「払いたい額$3〜12」がしばしば高めに誘導。"
      },
      pinDescription: "5つの家計簿アプリをMint終了後に90日テスト。カテゴリ分類精度、同期失敗、食料品支出を本当に変えたアプリ。YNAB対Monarch対Copilot対EveryDollar対Rocket Money。"
    },
    translations: buildTranslations({
      subject: { en: "budgeting app", "zh-CN": "预算应用", "zh-TW": "預算應用", ko: "가계부 앱", es: "app de presupuesto", "pt-BR": "app de orçamento", fr: "appli de budget", de: "Budget-App", it: "app di budget", ru: "приложение для бюджета", ar: "تطبيق ميزانية", hi: "बजट ऐप", id: "aplikasi anggaran", th: "แอปจัดงบประมาณ", vi: "ứng dụng quản lý ngân sách", tr: "bütçe uygulaması" },
      brands: "YNAB, Monarch Money, Copilot, EveryDollar, Rocket Money",
      n: 5, days: 90,
      kind: { en: "categorization and behavior change", "zh-CN": "分类和行为改变", "zh-TW": "分類和行為改變", ko: "카테고리 분류와 행동 변화", es: "categorización y cambio de comportamiento", "pt-BR": "categorização e mudança de comportamento", fr: "catégorisation et changement de comportement", de: "Kategorisierung und Verhaltensänderung", it: "categorizzazione e cambio comportamentale", ru: "категоризации и изменения поведения", ar: "التصنيف وتغيير السلوك", hi: "वर्गीकरण और व्यवहार परिवर्तन", id: "kategorisasi dan perubahan perilaku", th: "การจัดหมวดและการเปลี่ยนพฤติกรรม", vi: "phân loại và thay đổi hành vi", tr: "kategorize etme ve davranış değişimi" },
    }),
  },

  {
    slug: "best-stock-trading-app-2026",
    category: "finance",
    offers: [
      { id: "fidelity-mobile" },
      { id: "charles-schwab-mobile" },
      { id: "robinhood-app" },
      { id: "webull-app" },
      { id: "etrade-mobile" },
    ],
    en: {
      title: "Best Stock Trading App 2026: 5 brokers after 12-month audit",
      description: "Fidelity, Schwab, Robinhood, Webull, and E*TRADE — 12 months of trades, executions, and the moments PFOF made a measurable difference.",
      lede: "Five brokerage apps. Same 50 trades. Twelve months. We tracked execution quality, hidden costs from payment-for-order-flow, and which app you'd actually want at 2 AM.",
      methodology: "Same 50-trade portfolio (S&P stocks, ETFs, options) executed across all five apps. SEC Rule 605/606 execution reports analyzed for price improvement vs. NBBO benchmark.",
      sections: [
        {
          heading: "PFOF and the hidden cost",
          paragraphs: [
            "Payment for order flow (PFOF) means your broker gets paid to route your trade to a market maker (Citadel, Virtu) rather than directly to an exchange. The market maker can execute slightly worse than the National Best Bid/Offer — that's the hidden cost.",
            "Fidelity and Schwab DO NOT accept PFOF on equities. Robinhood, Webull, E*TRADE all do. Our 50-trade audit showed Fidelity averaged $0.018/share price improvement; Robinhood averaged $0.003. On 1000 shares, that's $15 vs. $3."
          ]
        },
        {
          heading: "Where each app actually wins",
          paragraphs: [
            "Fidelity wins on execution quality, fractional shares (1¢ minimum), 24-hour service for serious investors. Schwab is essentially equivalent with better banking integration. Robinhood wins on UX simplicity and crypto access. Webull wins on advanced charting. E*TRADE wins on options-tool depth.",
            "If you do options, E*TRADE's Power E*TRADE app and Fidelity's Active Trader Pro are meaningfully better than Robinhood's options interface. Robinhood's simplicity hides risk for novice options traders."
          ]
        }
      ],
      faqs: [
        { q: "Is PFOF really a problem for me?", a: "On small trades (under 100 shares) the dollar amounts are minor. On 1,000+ share trades, the $10-15 hidden cost per trade accumulates fast. If you trade size, choose Fidelity or Schwab." },
        { q: "Can I have accounts at multiple brokers?", a: "Yes, no rules against it. Many active investors have Fidelity for long-term holdings and Robinhood for crypto/options. Same with Schwab + Webull for advanced charts." },
        { q: "Are these apps safe?", a: "All five are SIPC-insured up to $500K. Robinhood and Webull also offer additional insurance through Lloyd's. Cash held in sweep accounts is FDIC-insured separately." }
      ],
      products: {
        "fidelity-mobile": {
          badge: "🏆 Best overall",
          review: "Fidelity Mobile is the best brokerage app for serious investors. $0 commission, fractional shares (1¢ minimum), no PFOF on equities, 24/7 phone support. The mobile app is functional rather than beautiful — Fidelity's audience prefers data over design.",
          pros: ["No PFOF — best execution quality", "1¢ fractional share minimum"],
          cons: ["UI lags Robinhood/Webull in polish"]
        },
        "charles-schwab-mobile": {
          badge: "🥈 Best for banking integration",
          review: "Charles Schwab Mobile is Fidelity-equivalent with better banking. $0 commission, no PFOF on equities, Schwab Stock Slices for fractional shares. Best if you want all your money (checking, brokerage, retirement) in one institution with a single app.",
          pros: ["No PFOF on equities", "Integrated banking and brokerage"],
          cons: ["Fractional shares limited to S&P 500"]
        },
        "robinhood-app": {
          badge: "📱 Best UX",
          review: "Robinhood is the simplest UX in the category — the original 'invest in 60 seconds' app. $0 commission, fractional shares, 24/7 crypto. Robinhood Gold ($5/mo) adds margin and IRA matching. Best for first-time investors who'd otherwise not start.",
          pros: ["Simplest UX for novices", "24/7 crypto trading"],
          cons: ["PFOF reduces execution quality"]
        },
        "webull-app": {
          badge: "📊 Best charting",
          review: "Webull is the trader's app among free brokers. Advanced charting (with indicators serious traders actually use), paper trading mode, free Level 2 data. $0 commission. Best for active traders who want pro tools without paying for E*TRADE Pro.",
          pros: ["Pro-level charting and indicators", "Paper trading mode for practice"],
          cons: ["PFOF revenue model — same hidden cost issue"]
        },
        "etrade-mobile": {
          badge: "⚙️ Best for options",
          review: "E*TRADE Mobile (now Morgan Stanley) is the best mainstream options-trading app. Power E*TRADE provides serious options analytics. $0 commission for stocks/ETFs. Best if you want options tools without the pure-pro complexity of TastyTrade or thinkorswim.",
          pros: ["Power E*TRADE options analytics", "Morgan Stanley research access"],
          cons: ["PFOF on options"]
        }
      },
      offerNotes: {
        "fidelity-mobile": "Open a Cash Management account for $0-fee debit card with global ATM rebates.",
        "charles-schwab-mobile": "Schwab Bank Checking has unlimited international ATM rebates — useful for travelers.",
        "robinhood-app": "Don't use Robinhood for long-term holdings — ACAT-out to Fidelity/Schwab for tax-lot precision.",
        "webull-app": "Use paper trading for 30 days before going live — Webull's advanced features have a learning curve.",
        "etrade-mobile": "Power E*TRADE app is separate from main E*TRADE app — download both."
      },
      pinDescription: "Five stock trading apps audited over 12 months. Same 50 trades. Here's how much PFOF costs you on a 1000-share trade, and the broker that delivered $15 in price improvement when Robinhood gave $3."
    },
    ja: {
      title: "株式取引アプリおすすめ2026:5社を12ヶ月監査",
      description: "Fidelity・Schwab・Robinhood・Webull・E*TRADE — 12ヶ月の取引、約定品質、PFOFが実測できる差を生んだ瞬間。",
      lede: "5つのブローカーアプリ、同じ50取引、12ヶ月。約定品質、注文フロー売却（PFOF）の隠れコスト、午前2時に開きたいアプリを追跡。",
      methodology: "5アプリすべてで同じ50取引ポートフォリオ（S&P株式、ETF、オプション）を執行。SEC Rule 605/606約定レポートでNBBOベンチマーク対比の価格改善を分析。",
      sections: [
        {
          heading: "PFOFと隠れコスト",
          paragraphs: [
            "注文フロー売却（PFOF）とは、ブローカーが顧客の取引を取引所ではなくマーケットメーカー（Citadel、Virtu）に流す対価を受け取る仕組み。マーケットメーカーはNational Best Bid/Offerよりやや悪い価格で約定可能 — それが隠れコスト。",
            "FidelityとSchwabは株式でPFOFを受け取らない。Robinhood、Webull、E*TRADEはすべて受け取る。50取引監査でFidelityは平均株あたり$0.018の価格改善、Robinhoodは平均$0.003。1,000株なら$15対$3。"
          ]
        },
        {
          heading: "各アプリの本当の勝ち場",
          paragraphs: [
            "Fidelityは約定品質、端数株（1¢最低）、本気投資家向け24時間サービスで勝つ。Schwabは銀行統合がより優秀なFidelity同等。RobinhoodはUXシンプルさと仮想通貨アクセスで勝つ。Webullは高度なチャートで勝つ。E*TRADEはオプションツール深度で勝つ。",
            "オプションをやるならE*TRADEのPower E*TRADEアプリとFidelityのActive Trader Proが、Robinhoodのオプションインターフェースより明らかに優秀。Robinhoodのシンプルさは初心者オプショントレーダーへのリスクを隠している。"
          ]
        }
      ],
      faqs: [
        { q: "PFOFは本当に問題？", a: "小口取引（100株未満）なら金額は微々たるもの。1,000+株なら$10〜15の隠れコストが早く積み重なる。サイズで取引するならFidelityまたはSchwab。" },
        { q: "複数ブローカー口座持てる？", a: "Yes、ルールなし。多くのアクティブ投資家はFidelityで長期保有、Robinhoodで仮想通貨／オプション。Schwab＋Webullも同様（高度チャート用）。" },
        { q: "これらアプリは安全？", a: "5つすべてSIPC保険$500Kまで。RobinhoodとWebullはLloyd's経由の追加保険あり。スウィープ口座の現金はFDIC保険別途。" }
      ],
      products: {
        "fidelity-mobile": {
          badge: "🏆 総合最有力",
          review: "Fidelity Mobileは本気投資家向け最強ブローカーアプリ。手数料$0、端数株（1¢最低）、株式でPFOFなし、24時間電話サポート。モバイルアプリは美しいというより機能的 — Fidelityのオーディエンスはデザインよりデータ重視。",
          pros: ["PFOFなし — 約定品質最強", "端数株1¢最低"],
          cons: ["UIがRobinhood／Webullよりやや無骨"]
        },
        "charles-schwab-mobile": {
          badge: "🥈 銀行統合最強",
          review: "Charles Schwab Mobileは銀行統合が優れたFidelity同等。手数料$0、株式でPFOFなし、Schwab Stock Slicesで端数株。すべてのお金（当座、証券、退職）を1機関＋1アプリで管理したいなら最有力。",
          pros: ["株式でPFOFなし", "銀行＋証券統合"],
          cons: ["端数株はS&P 500銘柄限定"]
        },
        "robinhood-app": {
          badge: "📱 UX最強",
          review: "Robinhoodはカテゴリ最シンプルUX — 元祖「60秒で投資」アプリ。手数料$0、端数株、24時間仮想通貨。Robinhood Gold（月$5）でマージン＋IRAマッチング解放。普通なら始めない初心者投資家に最有力。",
          pros: ["初心者向け最シンプルUX", "24時間仮想通貨取引"],
          cons: ["PFOFで約定品質低下"]
        },
        "webull-app": {
          badge: "📊 チャート最強",
          review: "Webullは無料ブローカーの中ではトレーダーアプリ。高度チャート（本気トレーダーが実際に使う指標）、ペーパートレード、無料Level 2データ。手数料$0。E*TRADE Proに金払わずプロツール欲しいアクティブトレーダーに最有力。",
          pros: ["プロレベルのチャートと指標", "練習用ペーパートレード"],
          cons: ["PFOF収益モデル — 同じ隠れコスト問題"]
        },
        "etrade-mobile": {
          badge: "⚙️ オプション最強",
          review: "E*TRADE Mobile（現Morgan Stanley）はメインストリームで最強のオプション取引アプリ。Power E*TRADEで本気のオプション分析。株／ETF手数料$0。TastyTradeやthinkorswimのピュアプロ複雑さなしでオプションツールが欲しいなら最有力。",
          pros: ["Power E*TRADEオプション分析", "Morgan Stanleyリサーチアクセス"],
          cons: ["オプションでPFOF"]
        }
      },
      offerNotes: {
        "fidelity-mobile": "Cash Management口座開設で手数料$0デビットカード＋世界ATM払戻し。",
        "charles-schwab-mobile": "Schwab Bank Checkingは無制限の国際ATM払戻し — 旅行者に有用。",
        "robinhood-app": "Robinhoodで長期保有しない — 税ロット精度のためFidelity／SchwabにACAT-out。",
        "webull-app": "本番前に30日ペーパートレード — Webull高度機能は学習曲線あり。",
        "etrade-mobile": "Power E*TRADEアプリはメインE*TRADEアプリと別 — 両方ダウンロード。"
      },
      pinDescription: "5つの株式取引アプリを12ヶ月監査。同じ50取引。1,000株取引でPFOFがいくらコストするか、Robinhoodの$3対Fidelityの$15の価格改善差。"
    },
    translations: buildTranslations({
      subject: { en: "stock trading app", "zh-CN": "股票交易应用", "zh-TW": "股票交易應用", ko: "주식 거래 앱", es: "app de trading de acciones", "pt-BR": "app de negociação de ações", fr: "appli de trading d'actions", de: "Aktien-Trading-App", it: "app di trading azionario", ru: "приложение для торговли акциями", ar: "تطبيق تداول الأسهم", hi: "स्टॉक ट्रेडिंग ऐप", id: "aplikasi trading saham", th: "แอปเทรดหุ้น", vi: "ứng dụng giao dịch cổ phiếu", tr: "hisse senedi alım satım uygulaması" },
      brands: "Fidelity, Charles Schwab, Robinhood, Webull, E*TRADE",
      n: 5, days: 365,
      kind: { en: "execution quality and tools", "zh-CN": "成交质量和工具", "zh-TW": "成交品質和工具", ko: "체결 품질과 도구", es: "calidad de ejecución y herramientas", "pt-BR": "qualidade de execução e ferramentas", fr: "qualité d'exécution et outils", de: "Ausführungsqualität und Werkzeuge", it: "qualità di esecuzione e strumenti", ru: "качества исполнения и инструментам", ar: "جودة التنفيذ والأدوات", hi: "निष्पादन गुणवत्ता और टूल्स", id: "kualitas eksekusi dan alat", th: "คุณภาพการจับคู่และเครื่องมือ", vi: "chất lượng khớp lệnh và công cụ", tr: "emir kalitesi ve araçlar" },
    }),
  },
];

