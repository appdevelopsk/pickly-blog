/**
 * 公開済みだが商品カードが欠けていた38記事の穴埋め (2026-08-14).
 * 「5製品を比較」と書いておきながら1枚しかカードが出ていない記事があった。
 * 名前と説明は記事本文(自分たちが書いた review)から機械的に起こしている。
 * finance / 保険 は Amazon フォールバックが効かないので対象外(実提携が要る)。
 *
 * 生成: site/scripts/_rescue-offers2.py
 */
import type { AffiliateOffer } from "./types";

export const CATALOG_RESCUE2: AffiliateOffer[] = [
  {
    "id": "cerave-skin-renewing-retinol",
    "imageUrl": "https://m.media-amazon.com/images/I/71GNGT1N0eL._AC_SL1500_.jpg",
    "priceMin": "$19",
    "priceMax": "$19",
    "category": "beauty",
    "badge": "💄",
    "name": {
      "en": "Cerave Skin Renewing Retinol",
      "ja": "Cerave Skin Renewing Retinol"
    },
    "description": {
      "en": "CeraVe Skin Renewing Retinol Serum ($19/1.76oz) is the most evidence-supported affordable anti-aging product available.",
      "ja": "CeraVe Skin Renewing Retinol Serum ($19/1.76oz) is the most evidence-supported affordable anti-aging product available."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Cerave+Skin+Renewing+Retinol",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "neutrogena-rapid-wrinkle-repair",
    "imageUrl": "https://m.media-amazon.com/images/I/710ldIJgRCL._AC_.jpg",
    "priceMin": "$22",
    "priceMax": "$22",
    "category": "beauty",
    "badge": "💄",
    "name": {
      "en": "Neutrogena Rapid Wrinkle Repair",
      "ja": "Neutrogena Rapid Wrinkle Repair"
    },
    "description": {
      "en": "Neutrogena Rapid Wrinkle Repair ($22/1oz) delivers Accelerated Retinol SA — a combination of retinol and glucose complex that the brand claims allows faster penetration.",
      "ja": "Neutrogena Rapid Wrinkle Repair ($22/1oz) delivers Accelerated Retinol SA — a combination of retinol and glucose complex that the brand claims allows faster penetration."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Neutrogena+Rapid+Wrinkle+Repair",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "estee-lauder-advanced-night-repair",
    "imageUrl": "https://m.media-amazon.com/images/I/71g21NW53fL._SL1500_.jpg",
    "priceMin": "$68",
    "priceMax": "$68",
    "category": "beauty",
    "badge": "💄",
    "name": {
      "en": "Estee Lauder Advanced Night Repair",
      "ja": "Estee Lauder Advanced Night Repair"
    },
    "description": {
      "en": "Estée Lauder Advanced Night Repair ($68/0.5oz serum) has been the brand's hero product for four decades, and the formula has been continuously updated rather than just repackaged.",
      "ja": "Estée Lauder Advanced Night Repair ($68/0.5oz serum) has been the brand's hero product for four decades, and the formula has been continuously updated rather than just repackaged."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Estee+Lauder+Advanced+Night+Repair",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "la-mer-moisturizing-cream",
    "imageUrl": "https://m.media-amazon.com/images/I/71NAMlm8B1L._AC_.jpg",
    "priceMin": "$360",
    "priceMax": "$360",
    "category": "beauty",
    "badge": "💄",
    "name": {
      "en": "La Mer Moisturizing Cream",
      "ja": "La Mer Moisturizing Cream"
    },
    "description": {
      "en": "La Mer Moisturizing Cream ($360/1oz) is built around the Miracle Broth — a fermented sea kelp bioferment that the brand claims has exceptional skin-renewing properties.",
      "ja": "La Mer Moisturizing Cream ($360/1oz) is built around the Miracle Broth — a fermented sea kelp bioferment that the brand claims has exceptional skin-renewing properties."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=La+Mer+Moisturizing+Cream",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "ten-thousand-versatility-short",
    "imageUrl": "https://theawesomer.com/photos/2025/04/ten_thousand_tactical_short_3.jpg",
    "priceMin": "$68",
    "priceMax": "$68",
    "category": "fashion",
    "badge": "👗",
    "name": {
      "en": "Ten Thousand Versatility Short",
      "ja": "Ten Thousand Versatility Short"
    },
    "description": {
      "en": "Ten Thousand Versatility Short ($68) is designed to eliminate the need for separate workout shorts and casual shorts.",
      "ja": "Ten Thousand Versatility Short ($68) is designed to eliminate the need for separate workout shorts and casual shorts."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Ten+Thousand+Versatility+Short",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "nike-dri-fit-challenger",
    "imageUrl": "https://static.nike.com/a/images/t_PDP_936_v1/f_auto,q_auto:eco/c6526d4b-644a-4242-b86f-d9e6e8eb83ea/M+NK+DF+CHALLENGER+5BF+SHORT.png",
    "priceMin": "$35",
    "priceMax": "$35",
    "category": "fashion",
    "badge": "👗",
    "name": {
      "en": "Nike Dri Fit Challenger",
      "ja": "Nike Dri Fit Challenger"
    },
    "description": {
      "en": "Nike Dri-FIT Challenger 5\" ($35) is the smart value play: solid athletic construction at half the Lululemon price.",
      "ja": "Nike Dri-FIT Challenger 5\" ($35) is the smart value play: solid athletic construction at half the Lululemon price."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Nike+Dri+Fit+Challenger",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "gymshark-vital-shorts",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0098/8822/files/VITALSEAMLESSWSHORTGsStrongGreyMarlB1A4J-GCSV-1695_270cf72e-6113-4876-af9e-35ce91766fa8_1080x.jpg?v=1722504964",
    "priceMin": "$45",
    "priceMax": "$45",
    "category": "fashion",
    "badge": "👗",
    "name": {
      "en": "Gymshark Vital Shorts",
      "ja": "Gymshark Vital Shorts"
    },
    "description": {
      "en": "Gymshark Vital Shorts ($45) nail the aesthetic that Nike and Under Armour can't quite achieve — they look like something you'd wear casually but perform like actual athletic shorts.",
      "ja": "Gymshark Vital Shorts ($45) nail the aesthetic that Nike and Under Armour can't quite achieve — they look like something you'd wear casually but perform like actual athletic shorts."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Gymshark+Vital+Shorts",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "under-armour-launch-shorts",
    "imageUrl": "https://m.media-amazon.com/images/I/51kKk+5Z1CL._AC_SX342_SY445_QL70_ML2_.jpg",
    "priceMin": "$30",
    "priceMax": "$30",
    "category": "fashion",
    "badge": "👗",
    "name": {
      "en": "Under Armour Launch Shorts",
      "ja": "Under Armour Launch Shorts"
    },
    "description": {
      "en": "Under Armour Launch 5\" ($30) is the most affordable pair in this comparison and delivers reliable athletic function at that price point.",
      "ja": "Under Armour Launch 5\" ($30) is the most affordable pair in this comparison and delivers reliable athletic function at that price point."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Under+Armour+Launch+Shorts",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "plum-organics-baby-food",
    "imageUrl": "https://m.media-amazon.com/images/I/81MQBskzr0L._SL1500_.jpg",
    "priceMin": "$2",
    "priceMax": "$2",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Plum Organics Baby Food",
      "ja": "Plum Organics Baby Food"
    },
    "description": {
      "en": "Plum Organics distinguishes itself with a higher proportion of vegetable-forward and vegetable-primary pouches than most competitors.",
      "ja": "Plum Organics distinguishes itself with a higher proportion of vegetable-forward and vegetable-primary pouches than most competitors."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Plum+Organics+Baby+Food",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "earths-best-organic-pouches",
    "imageUrl": "https://m.media-amazon.com/images/I/81e-BJBpE6L._SL1500_.jpg",
    "priceMin": "$2",
    "priceMax": "$2",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Earths Best Organic Pouches",
      "ja": "Earths Best Organic Pouches"
    },
    "description": {
      "en": "Earth's Best has been a trusted organic baby food brand since 1987, and their pouches maintain the ingredient quality the brand built its reputation on.",
      "ja": "Earth's Best has been a trusted organic baby food brand since 1987, and their pouches maintain the ingredient quality the brand built its reputation on."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Earths+Best+Organic+Pouches",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "gerber-organic-pouches",
    "imageUrl": "https://m.media-amazon.com/images/I/81JIfxASCeL._SL1500_.jpg",
    "priceMin": "$2",
    "priceMax": "$2",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Gerber Organic Pouches",
      "ja": "Gerber Organic Pouches"
    },
    "description": {
      "en": "Gerber is the most widely distributed baby food brand in the US, and their Organic line brings certified organic quality to every major grocery chain, pharmacy, and mass market retailer.",
      "ja": "Gerber is the most widely distributed baby food brand in the US, and their Organic line brings certified organic quality to every major grocery chain, pharmacy, and mass market retailer."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Gerber+Organic+Pouches",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "beech-nut-stage-2-pouches",
    "imageUrl": "https://m.media-amazon.com/images/I/81h2IIV1z9L._SL1500_.jpg",
    "priceMin": "$2",
    "priceMax": "$2",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Beech Nut Stage 2 Pouches",
      "ja": "Beech Nut Stage 2 Pouches"
    },
    "description": {
      "en": "Beech-Nut's defining brand promise is the simplest, most recognizable ingredient lists in the category.",
      "ja": "Beech-Nut's defining brand promise is the simplest, most recognizable ingredient lists in the category."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Beech+Nut+Stage+2+Pouches",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "katadyn-befree-filter",
    "imageUrl": "https://m.media-amazon.com/images/I/61qq5QCm9bL.jpg",
    "priceMin": "",
    "priceMax": "",
    "category": "fitness",
    "badge": "🏋️",
    "name": {
      "en": "Katadyn Befree Filter",
      "ja": "Katadyn Befree Filter"
    },
    "description": {
      "en": "The Katadyn BeFree's 2L/min flow rate is about twice as fast as the Sawyer Squeeze — a meaningful difference when filtering for a group or filling up quickly before dark.",
      "ja": "The Katadyn BeFree's 2L/min flow rate is about twice as fast as the Sawyer Squeeze — a meaningful difference when filtering for a group or filling up quickly before dark."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Katadyn+Befree+Filter",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "platypus-quickdraw-filter",
    "imageUrl": "https://m.media-amazon.com/images/I/61abknsnUFL.jpg",
    "priceMin": "",
    "priceMax": "",
    "category": "fitness",
    "badge": "🏋️",
    "name": {
      "en": "Platypus Quickdraw Filter",
      "ja": "Platypus Quickdraw Filter"
    },
    "description": {
      "en": "Platypus QuickDraw's 3L/min flow rate is the fastest among hollow-fiber filters here, and it's designed to work inline between two water bottles or as a gravity filter — ideal for camp use when you want to filter large q",
      "ja": "Platypus QuickDraw's 3L/min flow rate is the fastest among hollow-fiber filters here, and it's designed to work inline between two water bottles or as a gravity filter — ideal for camp use when you want to filter large q"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Platypus+Quickdraw+Filter",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "steripen-ultra-uv",
    "imageUrl": "https://m.media-amazon.com/images/I/71UmFW7CMyL._AC_SL1500_.jpg",
    "priceMin": "",
    "priceMax": "",
    "category": "fitness",
    "badge": "🏋️",
    "name": {
      "en": "Steripen Ultra UV",
      "ja": "Steripen Ultra UV"
    },
    "description": {
      "en": "The SteriPen Ultra uses UV light to kill 99.9999% of bacteria, protozoa, and viruses in 90 seconds — faster than chemical tablets and without the taste.",
      "ja": "The SteriPen Ultra uses UV light to kill 99.9999% of bacteria, protozoa, and viruses in 90 seconds — faster than chemical tablets and without the taste."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Steripen+Ultra+UV",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "dr-jart-cicapair-tiger",
    "imageUrl": "https://m.media-amazon.com/images/I/61XVzFMC8yL._AC_SL1500_.jpg",
    "priceMin": "$52",
    "priceMax": "$52",
    "category": "beauty",
    "badge": "💄",
    "name": {
      "en": "Dr Jart Cicapair Tiger",
      "ja": "Dr Jart Cicapair Tiger"
    },
    "description": {
      "en": "Dr.",
      "ja": "Dr."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Dr+Jart+Cicapair+Tiger",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "missha-perfect-cover-bb",
    "imageUrl": "https://m.media-amazon.com/images/I/61+qQefbViL._SL1500_.jpg",
    "priceMin": "$12",
    "priceMax": "$12",
    "category": "beauty",
    "badge": "💄",
    "name": {
      "en": "Missha Perfect Cover BB",
      "ja": "Missha Perfect Cover BB"
    },
    "description": {
      "en": "MISSHA Perfect Cover is one of the original Korean BB creams that popularized the category globally and it remains the right pick for anyone who wants a fuller-coverage finish from a BB cream.",
      "ja": "MISSHA Perfect Cover is one of the original Korean BB creams that popularized the category globally and it remains the right pick for anyone who wants a fuller-coverage finish from a BB cream."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Missha+Perfect+Cover+BB",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "maybelline-dream-fresh-bb",
    "imageUrl": "",
    "priceMin": "$9",
    "priceMax": "$9",
    "category": "beauty",
    "badge": "💄",
    "name": {
      "en": "Maybelline Dream Fresh BB",
      "ja": "Maybelline Dream Fresh BB"
    },
    "description": {
      "en": "Maybelline's Dream Fresh BB delivers the lightest finish in this lineup — sheer coverage that evens tone without looking applied — combined with SPF 30 and a lightweight gel-cream texture that works across skin types inc",
      "ja": "Maybelline's Dream Fresh BB delivers the lightest finish in this lineup — sheer coverage that evens tone without looking applied — combined with SPF 30 and a lightweight gel-cream texture that works across skin types inc"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Maybelline+Dream+Fresh+BB",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "garnier-skin-active-bb",
    "imageUrl": "https://m.media-amazon.com/images/I/71O7lYkqSkL._SL1500_.jpg",
    "priceMin": "$12",
    "priceMax": "$12",
    "category": "beauty",
    "badge": "💄",
    "name": {
      "en": "Garnier Skin Active BB",
      "ja": "Garnier Skin Active BB"
    },
    "description": {
      "en": "Garnier SkinActive BB Cream uses a moisturizing base heavier than most of its competitors, making it the most comfortable wear for dry or dehydrated skin during colder months.",
      "ja": "Garnier SkinActive BB Cream uses a moisturizing base heavier than most of its competitors, making it the most comfortable wear for dry or dehydrated skin during colder months."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Garnier+Skin+Active+BB",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "chanel-joues-contraste",
    "imageUrl": "https://m.media-amazon.com/images/I/51rXMF2xCpL._SL1000_.jpg",
    "priceMin": "$55",
    "priceMax": "$55",
    "category": "beauty",
    "badge": "💄",
    "name": {
      "en": "Chanel Joues Contraste",
      "ja": "Chanel Joues Contraste"
    },
    "description": {
      "en": "Chanel's Joues Contraste blushes ($55) are among the finest pressed powder formulas available.",
      "ja": "シャネルのジュ コントゥラスト（約8,300円）は、プレストパウダーの中でも屈指の処方です。粒子の細かさはブラシを入れた瞬間に手で分かるレベルで、低価格帯のどれよりも柔らかく、粉っぽさがなく、ぼかしやすい。持ちも別格で、たいていの肌質で8時間以上塗り直し不要でした。色展開もイエベ・ブルベ両方をカバーし、仕上がりのバリエーションも揃っています。"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Chanel+Joues+Contraste",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "benefit-gold-rush-blush",
    "imageUrl": "https://s3-us-west-1.amazonaws.com/1source-upstream/product_photo/423953_front_1606043736.png",
    "priceMin": "$30",
    "priceMax": "$30",
    "category": "beauty",
    "badge": "💄",
    "name": {
      "en": "Benefit Gold Rush Blush",
      "ja": "Benefit Gold Rush Blush"
    },
    "description": {
      "en": "Benefit's Gold Rush ($30) is a warm peachy-golden blush that's positioned specifically for a sun-kissed flush effect.",
      "ja": "ベネフィットのゴールドラッシュ（約4,500円）は、日に焼けたような血色感を狙った、暖かみのあるピーチゴールドのチークです。ベネフィットのチークラインらしく、明るく元気な色みにほんのり光を含んだ仕上がり。処方の滑らかさは NARS やシャネルには及びませんが、発色がしっかりしているので少量で十分色づきます。チークをさりげないハイライト代わりにも使いたい方に向いています。"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Benefit+Gold+Rush+Blush",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "elf-putty-blush",
    "imageUrl": "https://m.media-amazon.com/images/I/51VB5uoNFwL._AC_SL1500_.jpg",
    "priceMin": "$9",
    "priceMax": "$9",
    "category": "beauty",
    "badge": "💄",
    "name": {
      "en": "Elf Putty Blush",
      "ja": "Elf Putty Blush"
    },
    "description": {
      "en": "e.l.f.'s Putty Blush ($9) is a cream-gel hybrid that blends with fingertips, a sponge, or a brush equally well.",
      "ja": "e.l.f."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Elf+Putty+Blush",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "tortuga-outbreaker-35l",
    "imageUrl": "https://www.expocafeperu.com/w/2020/02/tortuga-outbreaker-travel-backpack-45l-tortuga-outbreaker-travel-backpack-44-litre-tortuga-outbreaker-travel-backpack-review-tortuga-outbreaker-backpack-uk.jpg",
    "priceMin": "",
    "priceMax": "",
    "category": "fashion",
    "badge": "👗",
    "name": {
      "en": "Tortuga Outbreaker 35l",
      "ja": "Tortuga Outbreaker 35l"
    },
    "description": {
      "en": "Tortuga built the Outbreaker specifically for carry-on compliance, and it shows: the 35L fits within the carry-on size limits of virtually every airline globally, including Ryanair's stricter overhead bin dimensions.",
      "ja": "Tortuga built the Outbreaker specifically for carry-on compliance, and it shows: the 35L fits within the carry-on size limits of virtually every airline globally, including Ryanair's stricter overhead bin dimensions."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Tortuga+Outbreaker+35l",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "peak-design-travel-backpack-45",
    "imageUrl": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/012c14d6-4eea-4daf-b357-6ac9461a0084.__CR0,0,1464,600_PT0_SX1464_V1___.png",
    "priceMin": "$350",
    "priceMax": "$350",
    "category": "fashion",
    "badge": "👗",
    "name": {
      "en": "Peak Design Travel Backpack 45",
      "ja": "Peak Design Travel Backpack 45"
    },
    "description": {
      "en": "Peak Design's 45L pack is the most feature-rich option on this list, with a MagLatch top compression system that adjusts the bag's profile between 35L and 45L, plus a fully removable internal divider system that can be r",
      "ja": "Peak Design's 45L pack is the most feature-rich option on this list, with a MagLatch top compression system that adjusts the bag's profile between 35L and 45L, plus a fully removable internal divider system that can be r"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Peak+Design+Travel+Backpack+45",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "nomatic-travel-pack-40l",
    "imageUrl": "https://m.media-amazon.com/images/I/81prUXXxo3L._AC_SL1500_.jpg",
    "priceMin": "",
    "priceMax": "",
    "category": "fashion",
    "badge": "👗",
    "name": {
      "en": "Nomatic Travel Pack 40l",
      "ja": "Nomatic Travel Pack 40l"
    },
    "description": {
      "en": "The NOMATIC 40L is built around the assumption that you are a digital nomad who lives in airports and coworking spaces, and it delivers on that premise with a front-access laptop sleeve (fits a 17-inch laptop), a dedicat",
      "ja": "The NOMATIC 40L is built around the assumption that you are a digital nomad who lives in airports and coworking spaces, and it delivers on that premise with a front-access laptop sleeve (fits a 17-inch laptop), a dedicat"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Nomatic+Travel+Pack+40l",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "rabbitgoo-cat-harness",
    "imageUrl": "https://m.media-amazon.com/images/I/71eVOy1sYEL._AC_SL1500_.jpg",
    "priceMin": "$14",
    "priceMax": "$14",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Rabbitgoo Cat Harness",
      "ja": "Rabbitgoo Cat Harness"
    },
    "description": {
      "en": "Rabbitgoo packs a surprising amount of feature into a $14 vest.",
      "ja": "Rabbitgoo packs a surprising amount of feature into a $14 vest."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Rabbitgoo+Cat+Harness",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "rc-pets-kitty-harness",
    "imageUrl": "https://m.media-amazon.com/images/I/71TRzFUlyfL._AC_SL1500_.jpg",
    "priceMin": "",
    "priceMax": "",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Rc Pets Kitty Harness",
      "ja": "Rc Pets Kitty Harness"
    },
    "description": {
      "en": "RC Pets makes outdoor gear primarily for dogs but the Kitty harness is a genuine cat-specific design.",
      "ja": "RC Pets makes outdoor gear primarily for dogs but the Kitty harness is a genuine cat-specific design."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Rc+Pets+Kitty+Harness",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "petsafe-come-with-me-kitty",
    "imageUrl": "http://rowdyandarchie.com/cdn/shop/files/petsafe-come-with-me-kitty-harness-and-bungee-leash-large-black-552148.jpg?v=1742829659",
    "priceMin": "",
    "priceMax": "",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Petsafe Come With Me Kitty",
      "ja": "Petsafe Come With Me Kitty"
    },
    "description": {
      "en": "The Come With Me Kitty uses a figure-eight design with a bungee-style leash included — the shock absorption reduces the jarring sensation when a cat suddenly changes direction.",
      "ja": "The Come With Me Kitty uses a figure-eight design with a bungee-style leash included — the shock absorption reduces the jarring sensation when a cat suddenly changes direction."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Petsafe+Come+With+Me+Kitty",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "ruffwear-flagline-cat-harness",
    "imageUrl": "https://cdn.shoplightspeed.com/shops/626901/files/61031167/ruffwear-flagline-harness.jpg",
    "priceMin": "$65",
    "priceMax": "$65",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Ruffwear Flagline Cat Harness",
      "ja": "Ruffwear Flagline Cat Harness"
    },
    "description": {
      "en": "Ruffwear built the Flagline for cats that actually go on trails.",
      "ja": "Ruffwear built the Flagline for cats that actually go on trails."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Ruffwear+Flagline+Cat+Harness",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "coach-jes-crossbody",
    "imageUrl": "https://m.media-amazon.com/images/I/91-YHIBV2ML._AC_SL1500_.jpg",
    "priceMin": "$195",
    "priceMax": "$195",
    "category": "fashion",
    "badge": "👗",
    "name": {
      "en": "Coach Jes Crossbody",
      "ja": "Coach Jes Crossbody"
    },
    "description": {
      "en": "The Coach Jes ($195) is the most versatile pick in this lineup — a medium-size pebble leather crossbody with a reliable zip top closure, an adjustable strap, and enough interior organization to keep your day running smoo",
      "ja": "The Coach Jes ($195) is the most versatile pick in this lineup — a medium-size pebble leather crossbody with a reliable zip top closure, an adjustable strap, and enough interior organization to keep your day running smoo"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Coach+Jes+Crossbody",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "tory-burch-mcgraw-crossbody",
    "imageUrl": "http://www.luxedh.com/cdn/shop/files/Tory-Burch-Leather-McGraw-Crossbody_223218_front_0_parent.jpg?v=1731456019&width=2048",
    "priceMin": "$228",
    "priceMax": "$228",
    "category": "fashion",
    "badge": "👗",
    "name": {
      "en": "Tory Burch Mcgraw Crossbody",
      "ja": "Tory Burch Mcgraw Crossbody"
    },
    "description": {
      "en": "The Tory Burch McGraw ($228) is the most design-forward pick in this group.",
      "ja": "The Tory Burch McGraw ($228) is the most design-forward pick in this group."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Tory+Burch+Mcgraw+Crossbody",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "kate-spade-knott-crossbody",
    "imageUrl": "https://m.media-amazon.com/images/I/81LzKVG1kEL._AC_SL1500_.jpg",
    "priceMin": "$130",
    "priceMax": "$159",
    "category": "fashion",
    "badge": "👗",
    "name": {
      "en": "Kate Spade Knott Crossbody",
      "ja": "Kate Spade Knott Crossbody"
    },
    "description": {
      "en": "The Kate Spade Knott ($159) is the most versatile design-wise — a structured flap crossbody with a clean, timeless look that works from brunch to the office without trying too hard.",
      "ja": "The Kate Spade Knott ($159) is the most versatile design-wise — a structured flap crossbody with a clean, timeless look that works from brunch to the office without trying too hard."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Kate+Spade+Knott+Crossbody",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "madewell-mini-bag",
    "imageUrl": "https://m.media-amazon.com/images/I/71+aAVR4M7L._AC_SL1500_.jpg",
    "priceMin": "$128",
    "priceMax": "$128",
    "category": "fashion",
    "badge": "👗",
    "name": {
      "en": "Madewell Mini Bag",
      "ja": "Madewell Mini Bag"
    },
    "description": {
      "en": "Madewell's The Mini Bag ($128) is the right call when you want to carry less and feel lighter.",
      "ja": "Madewell's The Mini Bag ($128) is the right call when you want to carry less and feel lighter."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Madewell+Mini+Bag",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "composure-vetriscience",
    "imageUrl": "https://m.media-amazon.com/images/I/61aONq5bqeL._AC_SL1500_.jpg",
    "priceMin": "$28",
    "priceMax": "$28",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Composure Vetriscience",
      "ja": "Composure Vetriscience"
    },
    "description": {
      "en": "VetriScience Composure has the most rigorously documented formula in the over-the-counter calming category.",
      "ja": "VetriScience Composure has the most rigorously documented formula in the over-the-counter calming category."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Composure+Vetriscience",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "nootie-hemp-calming",
    "imageUrl": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/928bdc33-df53-4033-bff2-03a09c9067d7.__CR0,0,970,300_PT0_SX970_V1___.jpg",
    "priceMin": "$22",
    "priceMax": "$22",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Nootie Hemp Calming",
      "ja": "Nootie Hemp Calming"
    },
    "description": {
      "en": "Nootie Hemp Calming combines 2mg of hemp per chew with valerian, melatonin, and chamomile.",
      "ja": "Nootie Hemp Calming combines 2mg of hemp per chew with valerian, melatonin, and chamomile."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Nootie+Hemp+Calming",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "pet-naturals-calm-chews",
    "imageUrl": "https://m.media-amazon.com/images/I/71C9rm6FSLL._AC_SL1500_.jpg",
    "priceMin": "$20",
    "priceMax": "$20",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Pet Naturals Calm Chews",
      "ja": "Pet Naturals Calm Chews"
    },
    "description": {
      "en": "Pet Naturals CALM is specifically designed for situational use — it's intended to be given 30-60 minutes before a stressful event rather than as a daily supplement.",
      "ja": "Pet Naturals CALM is specifically designed for situational use — it's intended to be given 30-60 minutes before a stressful event rather than as a daily supplement."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Pet+Naturals+Calm+Chews",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "homeopet-anxiety-relief",
    "imageUrl": "https://m.media-amazon.com/images/I/71zaFtp27KL._AC_SX679_.jpg",
    "priceMin": "$15",
    "priceMax": "$15",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Homeopet Anxiety Relief",
      "ja": "Homeopet Anxiety Relief"
    },
    "description": {
      "en": "HomeoPet Anxiety Relief is the only liquid formula in this group — a meaningful advantage for dogs that refuse all chew formats.",
      "ja": "HomeoPet Anxiety Relief is the only liquid formula in this group — a meaningful advantage for dogs that refuse all chew formats."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Homeopet+Anxiety+Relief",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "virbac-cet-veggiedent",
    "imageUrl": "https://m.media-amazon.com/images/I/71cTl5zMZdL._AC_.jpg",
    "priceMin": "$30",
    "priceMax": "$30",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Virbac Cet Veggiedent",
      "ja": "Virbac Cet Veggiedent"
    },
    "description": {
      "en": "Virbac CET VeggieDent carries VOHC acceptance and is manufactured by a veterinary pharmaceutical company — the brand carries more clinical weight than consumer pet brands.",
      "ja": "Virbac CET VeggieDent carries VOHC acceptance and is manufactured by a veterinary pharmaceutical company — the brand carries more clinical weight than consumer pet brands."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Virbac+Cet+Veggiedent",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "whimzees-naturals-brushzees",
    "imageUrl": "https://m.media-amazon.com/images/I/61bwBdaY2WL._AC_SL1500_.jpg",
    "priceMin": "$20",
    "priceMax": "$20",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Whimzees Naturals Brushzees",
      "ja": "Whimzees Naturals Brushzees"
    },
    "description": {
      "en": "Whimzees Brushzees have the cleanest ingredient list of any VOHC-accepted dental chew: potato starch, glycerin, powdered cellulose, and natural colorings — no artificial additives, no meat by-products.",
      "ja": "Whimzees Brushzees have the cleanest ingredient list of any VOHC-accepted dental chew: potato starch, glycerin, powdered cellulose, and natural colorings — no artificial additives, no meat by-products."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Whimzees+Naturals+Brushzees",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "arm-hammer-dental-chews",
    "imageUrl": "https://m.media-amazon.com/images/I/7178+1DglbL._AC_SL1500_.jpg",
    "priceMin": "$14",
    "priceMax": "$14",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Arm Hammer Dental Chews",
      "ja": "Arm Hammer Dental Chews"
    },
    "description": {
      "en": "Arm & Hammer's dental chews use baking soda (sodium bicarbonate) as the active ingredient — a mild abrasive and odor neutralizer with a track record in human dental products.",
      "ja": "Arm & Hammer's dental chews use baking soda (sodium bicarbonate) as the active ingredient — a mild abrasive and odor neutralizer with a track record in human dental products."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Arm+Hammer+Dental+Chews",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "pet-md-enzymatic-chews",
    "imageUrl": "https://m.media-amazon.com/images/I/61MkPPf82qL._AC_SL1000_.jpg",
    "priceMin": "$18",
    "priceMax": "$18",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Pet Md Enzymatic Chews",
      "ja": "Pet Md Enzymatic Chews"
    },
    "description": {
      "en": "Pet MD's enzymatic dental chews use glucose oxidase and lactoperoxidase — the same enzymes found in veterinary enzymatic toothpastes — to break down plaque bacteria.",
      "ja": "Pet MD's enzymatic dental chews use glucose oxidase and lactoperoxidase — the same enzymes found in veterinary enzymatic toothpastes — to break down plaque bacteria."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Pet+Md+Enzymatic+Chews",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "whistle-go-explore",
    "imageUrl": "",
    "priceMin": "$10",
    "priceMax": "$79",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Whistle Go Explore",
      "ja": "Whistle Go Explore"
    },
    "description": {
      "en": "Whistle Go Explore combines GPS tracking with genuine health monitoring: daily activity goals, calorie estimates, sleep quality, and behavioral anomaly detection that flags changes in activity patterns that might indicat",
      "ja": "Whistle Go ExploreはGPS追跡に本格的な健康モニタリングを組み合わせています。1日の活動量目標、消費カロリーの推定、睡眠の質、そして体調不良のサインとなりうる行動パターンの変化を検知する異常通知まで備えています。測位精度はしっかりしており、脱走アラートの反応も速めです。通常使用でのバッテリーは7〜10日持ちます。本体約¥12,000＋月額約¥1,500で、機能の幅を考えれば妥当な総額です。愛犬の居場所以上のことを知りた"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Whistle+Go+Explore",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "link-akc-smart-collar",
    "imageUrl": "",
    "priceMin": "$9",
    "priceMax": "$99",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Link Akc Smart Collar",
      "ja": "Link Akc Smart Collar"
    },
    "description": {
      "en": "Link AKC is a full smart collar with LED light, temperature monitoring, and training features alongside GPS tracking.",
      "ja": "Link AKCはGPS追跡に加えて、LEDライト、温度モニタリング、トレーニング機能まで備えた本格的なスマートカラーです。LEDは夜の散歩や暗がりでの視認性向上に実際よく効きます。温度アラートは、暑さや寒さが危険な水準になると知らせてくれる機能で、車内での待機時などに役立ちます。測位精度も競合に引けを取りません。本体約¥15,000＋月額約¥1,350と中価格帯で、アプリの完成度はこのカテゴリでも上位です。1本の首輪で複数の役割をこな"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Link+Akc+Smart+Collar",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "jiobit-pet-tracker",
    "imageUrl": "",
    "priceMin": "$9",
    "priceMax": "$99",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Jiobit Pet Tracker",
      "ja": "Jiobit Pet Tracker"
    },
    "description": {
      "en": "Jiobit is the smallest and lightest tracker here at 18g — genuinely appropriate for small dogs under 20lb where other modules add uncomfortable weight.",
      "ja": "Jiobitは18gと今回で最も小さく軽いトラッカーです。他社の本体では負担が大きい体重9kg以下の小型犬にも、無理なく使えるサイズでした。セルラー・Wi-Fi・Bluetooth・GPSを組み合わせたマルチネットワーク測位で、屋内でも屋外でも位置を追えます。バッテリーは7日持ちます。本体約¥15,000＋月額約¥1,350で価格は中間帯です。難点はアプリで、必要な機能は揃っているものの、FiやWhistleほどの洗練さはありません。重"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Jiobit+Pet+Tracker",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "living-proof-perfect-hair-day-dry",
    "imageUrl": "",
    "priceMin": "$30",
    "priceMax": "$30",
    "category": "beauty",
    "badge": "💄",
    "name": {
      "en": "Living Proof Perfect Hair Day Dry",
      "ja": "Living Proof Perfect Hair Day Dry"
    },
    "description": {
      "en": "Living Proof PHD Dry Shampoo ($30/7oz) uses a patented OFPMA molecule that physically blocks oil from reaching the hair shaft rather than just absorbing it after the fact.",
      "ja": "Living Proof PHD Dry Shampoo ($30/7oz) uses a patented OFPMA molecule that physically blocks oil from reaching the hair shaft rather than just absorbing it after the fact."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Living+Proof+Perfect+Hair+Day+Dry",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "oribe-gold-lust-dry-shampoo",
    "imageUrl": "",
    "priceMin": "$46",
    "priceMax": "$46",
    "category": "beauty",
    "badge": "💄",
    "name": {
      "en": "Oribe Gold Lust Dry Shampoo",
      "ja": "Oribe Gold Lust Dry Shampoo"
    },
    "description": {
      "en": "Oribe Gold Lust Dry Shampoo ($46/3.4oz) is priced at the luxury tier and justifies it through formula quality and sensory experience.",
      "ja": "Oribe Gold Lust Dry Shampoo ($46/3.4oz) is priced at the luxury tier and justifies it through formula quality and sensory experience."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Oribe+Gold+Lust+Dry+Shampoo",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "moroccanoil-dry-shampoo-light",
    "imageUrl": "",
    "priceMin": "$26",
    "priceMax": "$26",
    "category": "beauty",
    "badge": "💄",
    "name": {
      "en": "Moroccanoil Dry Shampoo Light",
      "ja": "Moroccanoil Dry Shampoo Light"
    },
    "description": {
      "en": "Moroccanoil's Light Dry Shampoo ($26/5.4oz) is designed specifically for light to medium hair tones.",
      "ja": "Moroccanoil's Light Dry Shampoo ($26/5.4oz) is designed specifically for light to medium hair tones."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Moroccanoil+Dry+Shampoo+Light",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "dove-refresh-dry-shampoo",
    "imageUrl": "",
    "priceMin": "$6",
    "priceMax": "$6",
    "category": "beauty",
    "badge": "💄",
    "name": {
      "en": "Dove Refresh Dry Shampoo",
      "ja": "Dove Refresh Dry Shampoo"
    },
    "description": {
      "en": "Dove Refresh+Care ($6/5oz) sits just below Batiste on value, but offers a cleaner, more neutral scent that many users prefer.",
      "ja": "Dove Refresh+Care ($6/5oz) sits just below Batiste on value, but offers a cleaner, more neutral scent that many users prefer."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Dove+Refresh+Dry+Shampoo",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "charlotte-tilbury-luxury-palette",
    "imageUrl": "",
    "priceMin": "$75",
    "priceMax": "$75",
    "category": "beauty",
    "badge": "💄",
    "name": {
      "en": "Charlotte Tilbury Luxury Palette",
      "ja": "Charlotte Tilbury Luxury Palette"
    },
    "description": {
      "en": "Charlotte Tilbury's Luxury Palette earns its $75 price tag through formula quality and packaging that lasts.",
      "ja": "Charlotte TilburyのLuxury Paletteは、約¥11,300という価格に処方の質と長く使えるパッケージで応えています。粉の質感は一般的なプレスドパウダーよりも明らかになめらかで、ひと塗りで色がのり、シマーは筆を濡らさなくてもフォイル系に近い輝きが出ます。アイシャドウにデパコス価格を出すなら、この1つが妥当な行き先です。"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Charlotte+Tilbury+Luxury+Palette",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "mac-times-nine",
    "imageUrl": "",
    "priceMin": "$33",
    "priceMax": "$33",
    "category": "beauty",
    "badge": "💄",
    "name": {
      "en": "Mac Times Nine",
      "ja": "Mac Times Nine"
    },
    "description": {
      "en": "MAC's Times Nine palette (9 pans, $33) is a workhorse used in professional kit bags for a reason.",
      "ja": "MACのTimes Nine（9色・約¥5,000）がプロのキットに入り続けているのには理由があります。処方が安定していて挙動が読める——人のメイクを担当するときにいちばん欲しい性質です。バリエーションごとに、撮影向けの濃い色から日常のやわらかいニュートラルまで揃っています。ブティック系ブランドのような華やかさはありませんが、信頼性では上をいきます。"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Mac+Times+Nine",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "elf-studio-eyeshadow-32",
    "imageUrl": "",
    "priceMin": "$12",
    "priceMax": "$12",
    "category": "beauty",
    "badge": "💄",
    "name": {
      "en": "Elf Studio Eyeshadow 32",
      "ja": "Elf Studio Eyeshadow 32"
    },
    "description": {
      "en": "At $12 for 32 pans, the e.l.f.",
      "ja": "32色で約¥1,800という価格を考えると、e.l.f."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Elf+Studio+Eyeshadow+32",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "vuori-ponto-jogger",
    "imageUrl": "",
    "priceMin": "$98",
    "priceMax": "$98",
    "category": "fashion",
    "badge": "👗",
    "name": {
      "en": "Vuori Ponto Jogger",
      "ja": "Vuori Ponto Jogger"
    },
    "description": {
      "en": "Vuori's Ponto Performance Jogger ($98) is positioned as the work-to-weekend jogger — and it earns that positioning.",
      "ja": "Vuori's Ponto Performance Jogger ($98) is positioned as the work-to-weekend jogger — and it earns that positioning."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Vuori+Ponto+Jogger",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "nike-tech-fleece-jogger",
    "imageUrl": "",
    "priceMin": "$110",
    "priceMax": "$110",
    "category": "fashion",
    "badge": "👗",
    "name": {
      "en": "Nike Tech Fleece Jogger",
      "ja": "Nike Tech Fleece Jogger"
    },
    "description": {
      "en": "Nike Tech Fleece ($110) is a cultural object as much as a functional garment at this point — the distinctive textured fleece construction is immediately recognizable and has been a streetwear staple for over a decade.",
      "ja": "Nike Tech Fleece ($110) is a cultural object as much as a functional garment at this point — the distinctive textured fleece construction is immediately recognizable and has been a streetwear staple for over a decade."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Nike+Tech+Fleece+Jogger",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "adidas-tiro-track-pants",
    "imageUrl": "",
    "priceMin": "$45",
    "priceMax": "$45",
    "category": "fashion",
    "badge": "👗",
    "name": {
      "en": "Adidas Tiro Track Pants",
      "ja": "Adidas Tiro Track Pants"
    },
    "description": {
      "en": "Adidas Tiro Track Pants ($45) represent the best athletic performance at the lowest price in this list.",
      "ja": "Adidas Tiro Track Pants ($45) represent the best athletic performance at the lowest price in this list."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Adidas+Tiro+Track+Pants",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "amazon-essentials-fleece-jogger",
    "imageUrl": "",
    "priceMin": "$22",
    "priceMax": "$22",
    "category": "fashion",
    "badge": "👗",
    "name": {
      "en": "Amazon Essentials Fleece Jogger",
      "ja": "Amazon Essentials Fleece Jogger"
    },
    "description": {
      "en": "Amazon Essentials Fleece Jogger ($22) does one thing well: comfortable, low-stress everyday loungewear at a price that removes all purchase anxiety.",
      "ja": "Amazon Essentials Fleece Jogger ($22) does one thing well: comfortable, low-stress everyday loungewear at a price that removes all purchase anxiety."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Amazon+Essentials+Fleece+Jogger",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "yumbox-original-bento",
    "imageUrl": "",
    "priceMin": "",
    "priceMax": "",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Yumbox Original Bento",
      "ja": "Yumbox Original Bento"
    },
    "description": {
      "en": "Yumbox's single-gasket leak-proof seal is the most reliable liquid containment in this category.",
      "ja": "Yumbox's single-gasket leak-proof seal is the most reliable liquid containment in this category."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Yumbox+Original+Bento",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "bentgo-kids-lunchbox",
    "imageUrl": "",
    "priceMin": "$22",
    "priceMax": "$22",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Bentgo Kids Lunchbox",
      "ja": "Bentgo Kids Lunchbox"
    },
    "description": {
      "en": "Bentgo Kids delivers the core bento experience at $22 — roughly half the price of PlanetBox and Yumbox.",
      "ja": "Bentgo Kids delivers the core bento experience at $22 — roughly half the price of PlanetBox and Yumbox."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Bentgo+Kids+Lunchbox",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "omiebox-bento-kids",
    "imageUrl": "",
    "priceMin": "",
    "priceMax": "",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Omiebox Bento Kids",
      "ja": "Omiebox Bento Kids"
    },
    "description": {
      "en": "The OmieBox is the right answer to the 'hot pasta but also cold grapes' problem.",
      "ja": "The OmieBox is the right answer to the 'hot pasta but also cold grapes' problem."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Omiebox+Bento+Kids",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "rubbermaid-lunchblox-kids",
    "imageUrl": "",
    "priceMin": "$18",
    "priceMax": "$18",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Rubbermaid Lunchblox Kids",
      "ja": "Rubbermaid Lunchblox Kids"
    },
    "description": {
      "en": "The Rubbermaid LunchBlox solves the ice pack integration problem at the lowest price in this lineup: a flat blue ice pack snaps into the bottom of the carrier and keeps the container stacked above it, eliminating the sep",
      "ja": "The Rubbermaid LunchBlox solves the ice pack integration problem at the lowest price in this lineup: a flat blue ice pack snaps into the bottom of the carrier and keeps the container stacked above it, eliminating the sep"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Rubbermaid+Lunchblox+Kids",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "coppertone-water-babies-spf50",
    "imageUrl": "",
    "priceMin": "$12",
    "priceMax": "$12",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Coppertone Water Babies Spf50",
      "ja": "Coppertone Water Babies Spf50"
    },
    "description": {
      "en": "Coppertone Water Babies is the most practical choice for families applying sunscreen daily to active kids — $12 for 8 ounces is the best cost-per-ounce in this lineup, and the lotion formula spreads quickly over large su",
      "ja": "Coppertone Water Babies is the most practical choice for families applying sunscreen daily to active kids — $12 for 8 ounces is the best cost-per-ounce in this lineup, and the lotion formula spreads quickly over large su"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Coppertone+Water+Babies+Spf50",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "thinksport-kids-spf50",
    "imageUrl": "",
    "priceMin": "$17",
    "priceMax": "$17",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Thinksport Kids Spf50",
      "ja": "Thinksport Kids Spf50"
    },
    "description": {
      "en": "Thinksport Kids holds EWG Verified status, which means its ingredients have been reviewed against EWG's database of hazardous substances and it meets EWG's transparency standards.",
      "ja": "Thinksport Kids holds EWG Verified status, which means its ingredients have been reviewed against EWG's database of hazardous substances and it meets EWG's transparency standards."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Thinksport+Kids+Spf50",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "neutrogena-pure-free-baby",
    "imageUrl": "",
    "priceMin": "$11",
    "priceMax": "$11",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Neutrogena Pure Free Baby",
      "ja": "Neutrogena Pure Free Baby"
    },
    "description": {
      "en": "Neutrogena's Pure & Free Baby mineral sunscreen uses a lightweight lotion base that spreads faster and leaves less white cast than most zinc oxide formulas — the tradeoff being that the zinc oxide percentage (18.6%) is s",
      "ja": "Neutrogena's Pure & Free Baby mineral sunscreen uses a lightweight lotion base that spreads faster and leaves less white cast than most zinc oxide formulas — the tradeoff being that the zinc oxide percentage (18.6%) is s"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Neutrogena+Pure+Free+Baby",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "blue-lizard-kids-spf50",
    "imageUrl": "",
    "priceMin": "$15",
    "priceMax": "$15",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Blue Lizard Kids Spf50",
      "ja": "Blue Lizard Kids Spf50"
    },
    "description": {
      "en": "Blue Lizard's smart cap indicator — a bottle cap that turns pink in the presence of UV radiation — is a functionally useful feature for kids and parents who forget to apply sunscreen on cloudy days (when UV exposure is s",
      "ja": "Blue Lizard's smart cap indicator — a bottle cap that turns pink in the presence of UV radiation — is a functionally useful feature for kids and parents who forget to apply sunscreen on cloudy days (when UV exposure is s"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Blue+Lizard+Kids+Spf50",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "leapfrog-leappad-academy",
    "imageUrl": "",
    "priceMin": "$99",
    "priceMax": "$99",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Leapfrog Leappad Academy",
      "ja": "Leapfrog Leappad Academy"
    },
    "description": {
      "en": "LeapFrog LeapPad Academy is purpose-built for ages 3-8 with a closed ecosystem that parents find reliably safe: no internet browsing, no app store, no external content.",
      "ja": "LeapFrog LeapPad Academy is purpose-built for ages 3-8 with a closed ecosystem that parents find reliably safe: no internet browsing, no app store, no external content."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Leapfrog+Leappad+Academy",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "apple-ipad-kids-edition",
    "imageUrl": "",
    "priceMin": "$30",
    "priceMax": "$329",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Apple Ipad Kids Edition",
      "ja": "Apple Ipad Kids Edition"
    },
    "description": {
      "en": "The Apple iPad 9th Gen running iOS with Screen Time enabled is the most capable kids tablet by raw performance and content quality.",
      "ja": "The Apple iPad 9th Gen running iOS with Screen Time enabled is the most capable kids tablet by raw performance and content quality."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Apple+Ipad+Kids+Edition",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "samsung-galaxy-tab-a8-kids",
    "imageUrl": "",
    "priceMin": "$200",
    "priceMax": "$200",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Samsung Galaxy Tab A8 Kids",
      "ja": "Samsung Galaxy Tab A8 Kids"
    },
    "description": {
      "en": "Samsung Galaxy Tab A8 with Samsung Kids mode is the strongest Android alternative to the Fire HD 8.",
      "ja": "Samsung Galaxy Tab A8 with Samsung Kids mode is the strongest Android alternative to the Fire HD 8."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Samsung+Galaxy+Tab+A8+Kids",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "dragon-touch-kidoz-tablet",
    "imageUrl": "",
    "priceMin": "$80",
    "priceMax": "$80",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Dragon Touch Kidoz Tablet",
      "ja": "Dragon Touch Kidoz Tablet"
    },
    "description": {
      "en": "Dragon Touch KidzPad Y88X runs KIDOZ — a curated kids content launcher similar to Amazon Kids+ but at a lower price point.",
      "ja": "Dragon Touch KidzPad Y88X runs KIDOZ — a curated kids content launcher similar to Amazon Kids+ but at a lower price point."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Dragon+Touch+Kidoz+Tablet",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "secrid-slimwallet",
    "imageUrl": "",
    "priceMin": "$75",
    "priceMax": "$75",
    "category": "fashion",
    "badge": "👗",
    "name": {
      "en": "Secrid Slimwallet",
      "ja": "Secrid Slimwallet"
    },
    "description": {
      "en": "The Secrid Slimwallet ($75) is built around a patented aluminum card protector that fans cards out with a push of the thumb — arguably the most elegant card-access mechanism available.",
      "ja": "The Secrid Slimwallet ($75) is built around a patented aluminum card protector that fans cards out with a push of the thumb — arguably the most elegant card-access mechanism available."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Secrid+Slimwallet",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "groove-life-wallet",
    "imageUrl": "",
    "priceMin": "$90",
    "priceMax": "$90",
    "category": "fashion",
    "badge": "👗",
    "name": {
      "en": "Groove Life Wallet",
      "ja": "Groove Life Wallet"
    },
    "description": {
      "en": "The Groove Life Wallet ($90) is the active-use wallet — made from the same durable silicone as Groove Life's rings.",
      "ja": "The Groove Life Wallet ($90) is the active-use wallet — made from the same durable silicone as Groove Life's rings."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Groove+Life+Wallet",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "dash-wallet-compact",
    "imageUrl": "",
    "priceMin": "$22",
    "priceMax": "$22",
    "category": "fashion",
    "badge": "👗",
    "name": {
      "en": "Dash Wallet Compact",
      "ja": "Dash Wallet Compact"
    },
    "description": {
      "en": "At $22, the DASH Compact wallet delivers the core minimalist wallet value proposition at a price where the risk is minimal.",
      "ja": "At $22, the DASH Compact wallet delivers the core minimalist wallet value proposition at a price where the risk is minimal."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Dash+Wallet+Compact",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "osprey-seral-7l",
    "imageUrl": "",
    "priceMin": "$90",
    "priceMax": "$90",
    "category": "fashion",
    "badge": "👗",
    "name": {
      "en": "Osprey Seral 7l",
      "ja": "Osprey Seral 7l"
    },
    "description": {
      "en": "The Osprey Seral 7L is built for trails but works just as well on city streets.",
      "ja": "Osprey Seral 7Lはトレイル向けの設計ですが、街中でも同じように使えます。パッド入りバックパネルと人間工学に基づいたスリングストラップのおかげで、背面がフラットな競合より荷重分散に優れ、歩き始めて4時間を過ぎたあたりから差が出てきます。1.5Lのハイドレーションリザーバーに対応し、外側にはすぐ水を取れるストレッチポケット。作りはいかにもOspreyで、何年も酷使される前提の縫製水準です。約¥13,500と今回で最も高価で、そ"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Osprey+Seral+7l",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "fjallraven-ulvo-lumbar-bag",
    "imageUrl": "",
    "priceMin": "$90",
    "priceMax": "$90",
    "category": "fashion",
    "badge": "👗",
    "name": {
      "en": "Fjallraven Ulvo Lumbar Bag",
      "ja": "Fjallraven Ulvo Lumbar Bag"
    },
    "description": {
      "en": "Fjallraven's Ulvö Hip Pack 4L is built from water-resistant Vinylon F fabric — a material that improves with exposure to moisture rather than degrading.",
      "ja": "FjällrävenのUlvö Hip Pack 4Lは、撥水性のあるVinylon F生地製。水分に触れると劣化するどころか、かえって性能が高まる素材です。4Lという容量は、スリングにならずに1日分の必需品を収められるバランス。デザインはミニマルで、いかにも北欧らしい佇まいです。美術館でもハイキング道でも違和感がありません。ストラップまわりもすっきりして調整しやすい構造。約¥13,500というのは、この容量にしてはかなり強気の価格です"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Fjallraven+Ulvo+Lumbar+Bag",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "cotopaxi-bataan-3l",
    "imageUrl": "",
    "priceMin": "$50",
    "priceMax": "$50",
    "category": "fashion",
    "badge": "👗",
    "name": {
      "en": "Cotopaxi Bataan 3l",
      "ja": "Cotopaxi Bataan 3l"
    },
    "description": {
      "en": "Cotopaxi's Bataan 3L is made from leftover fabric scraps from other production runs — which means every bag has a unique color pattern.",
      "ja": "CotopaxiのBataan 3Lは、他の製品を作った際の余り生地から仕立てられていて、一つひとつ配色が違います。約¥7,500ながら中身は価格以上で、パッド入りの内側スリーブ（10インチのタブレットや薄型ノートPCが入ります）、サイドの水筒ポケット、移動中に安定させるチェストストラップまで備えています。街歩きにも軽いハイキングにも対応。OspreyやPatagoniaほど作りは洗練されていませんが、人と被らないデザインで、手頃で、実"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Cotopaxi+Bataan+3l",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "tp-link-m7200",
    "imageUrl": "",
    "priceMin": "$49",
    "priceMax": "$49",
    "category": "tech",
    "badge": "💻",
    "name": {
      "en": "Tp Link M7200",
      "ja": "Tp Link M7200"
    },
    "description": {
      "en": "At $49 the M7200 is a no-frills 4G LTE hotspot that does exactly what it promises — insert a nano-SIM, press the power button, and you have Wi-Fi for up to 10 devices within about 30 seconds.",
      "ja": "At $49 the M7200 is a no-frills 4G LTE hotspot that does exactly what it promises — insert a nano-SIM, press the power button, and you have Wi-Fi for up to 10 devices within about 30 seconds."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Tp+Link+M7200",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "solis-lite-wifi",
    "imageUrl": "",
    "priceMin": "",
    "priceMax": "",
    "category": "tech",
    "badge": "💻",
    "name": {
      "en": "Solis Lite Wifi",
      "ja": "Solis Lite Wifi"
    },
    "description": {
      "en": "The Solis Lite earns its spot for travelers who want a single device covering 130-plus countries without hunting down local SIMs at every arrival.",
      "ja": "The Solis Lite earns its spot for travelers who want a single device covering 130-plus countries without hunting down local SIMs at every arrival."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Solis+Lite+Wifi",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "gl-inet-slate-ax",
    "imageUrl": "",
    "priceMin": "",
    "priceMax": "",
    "category": "tech",
    "badge": "💻",
    "name": {
      "en": "Gl Inet Slate Ax",
      "ja": "Gl Inet Slate Ax"
    },
    "description": {
      "en": "The Slate AX shares the Beryl AX's OpenWrt foundation and hardware VPN acceleration, but runs on the IPQ6000 chipset with a faster CPU clock that makes WireGuard throughput marginally quicker in back-to-back tests.",
      "ja": "The Slate AX shares the Beryl AX's OpenWrt foundation and hardware VPN acceleration, but runs on the IPQ6000 chipset with a faster CPU clock that makes WireGuard throughput marginally quicker in back-to-back tests."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Gl+Inet+Slate+Ax",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "netgear-nighthawk-m5",
    "imageUrl": "",
    "priceMin": "$299",
    "priceMax": "$299",
    "category": "tech",
    "badge": "💻",
    "name": {
      "en": "Netgear Nighthawk M5",
      "ja": "Netgear Nighthawk M5"
    },
    "description": {
      "en": "The 5,040 mAh battery runs about 13 hours and can charge other devices via the USB-C port.",
      "ja": "The 5,040 mAh battery runs about 13 hours and can charge other devices via the USB-C port."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Netgear+Nighthawk+M5",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "purina-pro-plan-puppy",
    "imageUrl": "",
    "priceMin": "$20",
    "priceMax": "$20",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Purina Pro Plan Puppy",
      "ja": "Purina Pro Plan Puppy"
    },
    "description": {
      "en": "Purina Pro Plan Puppy has more published research behind it than any other food on this list — Purina operates its own research facilities and publishes digestibility and palatability data.",
      "ja": "Purina Pro Plan Puppy has more published research behind it than any other food on this list — Purina operates its own research facilities and publishes digestibility and palatability data."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Purina+Pro+Plan+Puppy",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "hills-science-diet-puppy",
    "imageUrl": "",
    "priceMin": "$30",
    "priceMax": "$30",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Hills Science Diet Puppy",
      "ja": "Hills Science Diet Puppy"
    },
    "description": {
      "en": "Hill's Science Diet is the other name that comes up consistently when veterinarians recommend puppy foods, and for good reason: Hill's employs veterinary nutritionists and has decades of feeding trials behind their formu",
      "ja": "Hill's Science Diet is the other name that comes up consistently when veterinarians recommend puppy foods, and for good reason: Hill's employs veterinary nutritionists and has decades of feeding trials behind their formu"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Hills+Science+Diet+Puppy",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "orijen-puppy-food",
    "imageUrl": "",
    "priceMin": "$79",
    "priceMax": "$79",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Orijen Puppy Food",
      "ja": "Orijen Puppy Food"
    },
    "description": {
      "en": "ORIJEN Puppy is for owners who want the highest protein density available in a kibble — 38% protein from multiple animal sources (chicken, turkey, fish, eggs).",
      "ja": "ORIJEN Puppy is for owners who want the highest protein density available in a kibble — 38% protein from multiple animal sources (chicken, turkey, fish, eggs)."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Orijen+Puppy+Food",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "blue-buffalo-life-protection-puppy",
    "imageUrl": "",
    "priceMin": "$29",
    "priceMax": "$29",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Blue Buffalo Life Protection Puppy",
      "ja": "Blue Buffalo Life Protection Puppy"
    },
    "description": {
      "en": "Blue Buffalo Life Protection Puppy is the brand most pet store employees recommend to customers asking for a 'natural' puppy food without the ORIJEN price tag.",
      "ja": "Blue Buffalo Life Protection Puppy is the brand most pet store employees recommend to customers asking for a 'natural' puppy food without the ORIJEN price tag."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Blue+Buffalo+Life+Protection+Puppy",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "nuby-no-spill-sippy",
    "imageUrl": "",
    "priceMin": "$7",
    "priceMax": "$30",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Nuby No Spill Sippy",
      "ja": "Nuby No Spill Sippy"
    },
    "description": {
      "en": "Nuby No-Spill is the right cup for households that need 3-4 cups without spending $30+ on the set.",
      "ja": "Nuby No-Spill is the right cup for households that need 3-4 cups without spending $30+ on the set."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Nuby+No+Spill+Sippy",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "nuk-learner-cup",
    "imageUrl": "",
    "priceMin": "$7",
    "priceMax": "$7",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Nuk Learner Cup",
      "ja": "Nuk Learner Cup"
    },
    "description": {
      "en": "NUK Learner Cup uses a soft spout with an anti-colic air system and a silicone valve that seals under both normal use and drops.",
      "ja": "NUK Learner Cup uses a soft spout with an anti-colic air system and a silicone valve that seals under both normal use and drops."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Nuk+Learner+Cup",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "thermos-foogo-straw-cup",
    "imageUrl": "",
    "priceMin": "$15",
    "priceMax": "$15",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Thermos Foogo Straw Cup",
      "ja": "Thermos Foogo Straw Cup"
    },
    "description": {
      "en": "Thermos Foogo is the only stainless steel option in this group and the clear choice for temperature-sensitive use: cold water stays cold for 8+ hours, which makes it the right cup for daycare bags, park outings, and trav",
      "ja": "Thermos Foogo is the only stainless steel option in this group and the clear choice for temperature-sensitive use: cold water stays cold for 8+ hours, which makes it the right cup for daycare bags, park outings, and trav"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Thermos+Foogo+Straw+Cup",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "oxo-tot-transitions-cup",
    "imageUrl": "",
    "priceMin": "$12",
    "priceMax": "$12",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Oxo Tot Transitions Cup",
      "ja": "Oxo Tot Transitions Cup"
    },
    "description": {
      "en": "OXO Tot Transitions Cup is designed to convert between a soft spout, straw, and open-cup configuration as the child develops — three lids in one set covers the entire transition period without buying multiple cups.",
      "ja": "OXO Tot Transitions Cup is designed to convert between a soft spout, straw, and open-cup configuration as the child develops — three lids in one set covers the entire transition period without buying multiple cups."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Oxo+Tot+Transitions+Cup",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "reshoevn8r-starter-kit",
    "imageUrl": "",
    "priceMin": "$25",
    "priceMax": "$25",
    "category": "fashion",
    "badge": "👗",
    "name": {
      "en": "Reshoevn8r Starter Kit",
      "ja": "Reshoevn8r Starter Kit"
    },
    "description": {
      "en": "Reshoevn8r Starter Kit ($25) is the most complete kit for sneaker collectors who own suede, nubuck, or materials that require different brush approaches.",
      "ja": "Reshoevn8r Starter Kit ($25) is the most complete kit for sneaker collectors who own suede, nubuck, or materials that require different brush approaches."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Reshoevn8r+Starter+Kit",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "crep-protect-shoe-kit",
    "imageUrl": "",
    "priceMin": "$22",
    "priceMax": "$22",
    "category": "fashion",
    "badge": "👗",
    "name": {
      "en": "Crep Protect Shoe Kit",
      "ja": "Crep Protect Shoe Kit"
    },
    "description": {
      "en": "Crep Protect Kit ($22) is designed around the foam cleaner format — no water setup required, just foam the cleaner directly onto the brush and clean.",
      "ja": "Crep Protect Kit ($22) is designed around the foam cleaner format — no water setup required, just foam the cleaner directly onto the brush and clean."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Crep+Protect+Shoe+Kit",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "pink-miracle-shoe-cleaner",
    "imageUrl": "",
    "priceMin": "$16",
    "priceMax": "$16",
    "category": "fashion",
    "badge": "👗",
    "name": {
      "en": "Pink Miracle Shoe Cleaner",
      "ja": "Pink Miracle Shoe Cleaner"
    },
    "description": {
      "en": "Pink Miracle Shoe Cleaner Kit ($16) is specifically formulated for white sneaker brightening — the hydrogen peroxide-based chemistry addresses oxidation yellowing that standard cleaners don't touch.",
      "ja": "Pink Miracle Shoe Cleaner Kit ($16) is specifically formulated for white sneaker brightening — the hydrogen peroxide-based chemistry addresses oxidation yellowing that standard cleaners don't touch."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Pink+Miracle+Shoe+Cleaner",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "sneakerlab-basic-kit",
    "imageUrl": "",
    "priceMin": "$2",
    "priceMax": "$20",
    "category": "fashion",
    "badge": "👗",
    "name": {
      "en": "Sneakerlab Basic Kit",
      "ja": "Sneakerlab Basic Kit"
    },
    "description": {
      "en": "SneakerLAB Basic Kit ($20) is the cleanest formulation story in this comparison — the solution is bio-enzymatic and free from harsh chemicals that degrade materials over time.",
      "ja": "SneakerLAB Basic Kit ($20) is the cleanest formulation story in this comparison — the solution is bio-enzymatic and free from harsh chemicals that degrade materials over time."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Sneakerlab+Basic+Kit",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "lululemon-scuba-oversized",
    "imageUrl": "",
    "priceMin": "$118",
    "priceMax": "$118",
    "category": "fashion",
    "badge": "👗",
    "name": {
      "en": "Lululemon Scuba Oversized",
      "ja": "Lululemon Scuba Oversized"
    },
    "description": {
      "en": "Lululemon Scuba Half-Zip ($118) occupies the gap between performance wear and premium casual — a technical fleece construction that works as a warm layer during and after workouts while looking appropriate for errands, t",
      "ja": "Lululemon Scuba ハーフジップ（約¥17,700）は、スポーツウェアと上質なカジュアルのあいだを埋める一着です。テクニカルフリースなのでトレーニング中も後も暖かく、そのまま買い物や旅行、人と会う場面にも違和感なく着ていけます。内側の起毛は見た目以上に暖かく感じます。身頃はあえてゆったり、袖はやや細めという作りで、写真映えもよく着心地も快適です。"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Lululemon+Scuba+Oversized",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "carhartt-midweight-sweatshirt",
    "imageUrl": "",
    "priceMin": "$50",
    "priceMax": "$50",
    "category": "fashion",
    "badge": "👗",
    "name": {
      "en": "Carhartt Midweight Sweatshirt",
      "ja": "Carhartt Midweight Sweatshirt"
    },
    "description": {
      "en": "Carhartt Midweight Crewneck ($50) is built for physical work environments and it shows in the construction.",
      "ja": "Carhartt ミッドウェイト クルーネック（約¥7,500）は肉体労働の現場を想定して作られていて、それが縫製にはっきり出ています。補強された縫い目、厚めのコットン、動いてもめくれ上がらない長めの着丈——Carharttの顧客がそれを当たり前に求めるので、標準仕様として入っています。屋外作業や庭仕事、あるいは実際に過酷な環境でアウター代わりに着る人にとっては、選択肢はCarharttしかありません。"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Carhartt+Midweight+Sweatshirt",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "essentials-fog-hoodie",
    "imageUrl": "",
    "priceMin": "$90",
    "priceMax": "$90",
    "category": "fashion",
    "badge": "👗",
    "name": {
      "en": "Essentials Fog Hoodie",
      "ja": "Essentials Fog Hoodie"
    },
    "description": {
      "en": "Fear of God Essentials hoodie ($90) is the fashion-forward option — the construction quality is genuinely above typical streetwear at this price, the oversized drop-shoulder cut is intentional rather than accidental, and",
      "ja": "Fear of God Essentials パーカー（約¥13,500）はファッション寄りの選択肢です。この価格帯のストリートウェアとしては縫製の質が明らかに高く、ドロップショルダーのオーバーサイズも狙って作られたシルエットで、ロゴが控えめなぶん、主張の強いストリートブランドより合わせやすくなっています。スウェットをファッションアイテムとして着たい人には、これが答えです。"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Essentials+Fog+Hoodie",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "ricoh-gr-iiix",
    "imageUrl": "",
    "priceMin": "",
    "priceMax": "",
    "category": "tech",
    "badge": "💻",
    "name": {
      "en": "Ricoh Gr Iiix",
      "ja": "Ricoh Gr Iiix"
    },
    "description": {
      "en": "The GR IIIx pairs a 26MP APS-C sensor with a fixed 40mm-equivalent f/2.8 lens in a body smaller than most smartphones — and the rendering is unmistakably Ricoh, with rich shadow detail and a snap-focus mode that lets you",
      "ja": "The GR IIIx pairs a 26MP APS-C sensor with a fixed 40mm-equivalent f/2.8 lens in a body smaller than most smartphones — and the rendering is unmistakably Ricoh, with rich shadow detail and a snap-focus mode that lets you"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Ricoh+Gr+Iiix",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "sony-rx100-vii",
    "imageUrl": "",
    "priceMin": "",
    "priceMax": "",
    "category": "tech",
    "badge": "💻",
    "name": {
      "en": "Sony Rx100 Vii",
      "ja": "Sony Rx100 Vii"
    },
    "description": {
      "en": "The RX100 VII packs a 24-200mm f/2.8-4.5 Zeiss-branded zoom into a body that fits in a shirt pocket, and the 1-inch 20MP sensor delivers better dynamic range than you'd expect from such a small package.",
      "ja": "The RX100 VII packs a 24-200mm f/2.8-4.5 Zeiss-branded zoom into a body that fits in a shirt pocket, and the 1-inch 20MP sensor delivers better dynamic range than you'd expect from such a small package."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Sony+Rx100+Vii",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "olympus-tough-tg7",
    "imageUrl": "",
    "priceMin": "$400",
    "priceMax": "$400",
    "category": "tech",
    "badge": "💻",
    "name": {
      "en": "Olympus Tough Tg7",
      "ja": "Olympus Tough Tg7"
    },
    "description": {
      "en": "The TG-7 is built for the trips where bringing a camera at all feels risky — waterproof to 15m, freeze-proof to -10°C, shockproof from 2.1m, and crushproof to 100kgf.",
      "ja": "The TG-7 is built for the trips where bringing a camera at all feels risky — waterproof to 15m, freeze-proof to -10°C, shockproof from 2.1m, and crushproof to 100kgf."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Olympus+Tough+Tg7",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "outdoor-research-helium-rain",
    "imageUrl": "",
    "priceMin": "",
    "priceMax": "",
    "category": "fashion",
    "badge": "👗",
    "name": {
      "en": "Outdoor Research Helium Rain",
      "ja": "Outdoor Research Helium Rain"
    },
    "description": {
      "en": "The OR Helium is the ultralight champion here at 9oz and fist-sized compression — carry it in your day bag and forget it's there until you need it.",
      "ja": "OR Helium は約255g、握りこぶし大まで圧縮できるウルトラライトの王者です。デイバッグに放り込んでおけば、必要になるまで存在を忘れていられます。Pertex Shield メンブレンは正真正銘の防水で、この重量でこの品質は驚きに近いです。運動強度が高い場面では3レイヤーに透湿性で劣りますが、携帯用の一枚としては敵なしです。"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Outdoor+Research+Helium+Rain",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "spot-gen4-satellite-gps",
    "imageUrl": "",
    "priceMin": "",
    "priceMax": "",
    "category": "tech",
    "badge": "💻",
    "name": {
      "en": "Spot Gen4 Satellite GPS",
      "ja": "Spot Gen4 Satellite GPS"
    },
    "description": {
      "en": "The SPOT Gen4 does one thing that matters and skips everything that costs: it sends your GPS location to emergency services and pre-selected contacts, tracks your route, and triggers SOS.",
      "ja": "The SPOT Gen4 does one thing that matters and skips everything that costs: it sends your GPS location to emergency services and pre-selected contacts, tracks your route, and triggers SOS."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Spot+Gen4+Satellite+GPS",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "somewear-global-hotspot",
    "imageUrl": "",
    "priceMin": "$25",
    "priceMax": "$199",
    "category": "tech",
    "badge": "💻",
    "name": {
      "en": "Somewear Global Hotspot",
      "ja": "Somewear Global Hotspot"
    },
    "description": {
      "en": "Somewear pairs with your smartphone and turns it into a satellite-connected device — you use your phone's interface rather than the device's own screen.",
      "ja": "Somewear pairs with your smartphone and turns it into a satellite-connected device — you use your phone's interface rather than the device's own screen."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Somewear+Global+Hotspot",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "bivystick-satellite",
    "imageUrl": "",
    "priceMin": "$5",
    "priceMax": "$199",
    "category": "tech",
    "badge": "💻",
    "name": {
      "en": "Bivystick Satellite",
      "ja": "Bivystick Satellite"
    },
    "description": {
      "en": "Bivy Stick is a Iridium-based device that pairs with the Bivy app for two-way messaging, SOS, and tracking.",
      "ja": "Bivy Stick is a Iridium-based device that pairs with the Bivy app for two-way messaging, SOS, and tracking."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Bivystick+Satellite",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "zoleo-satellite-communicator",
    "imageUrl": "",
    "priceMin": "$20",
    "priceMax": "$199",
    "category": "tech",
    "badge": "💻",
    "name": {
      "en": "Zoleo Satellite Communicator",
      "ja": "Zoleo Satellite Communicator"
    },
    "description": {
      "en": "Zoleo focuses on making satellite messaging feel less like a 1990s pager and more like modern texting.",
      "ja": "Zoleo focuses on making satellite messaging feel less like a 1990s pager and more like modern texting."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Zoleo+Satellite+Communicator",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  }
] as unknown as AffiliateOffer[];
