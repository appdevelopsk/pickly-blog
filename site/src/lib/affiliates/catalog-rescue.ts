/**
 * 未公開だった18記事を救出するためのオファー定義 (2026-08-14).
 *
 * これらの記事は offerId に対応するカタログ項目が1件も無かったため
 * hasApprovedAds() が false になり、17ロケール全てで1ページも生成されていなかった。
 * 名前と説明は記事本文(自分たちが書いた review)から機械的に起こしているので、
 * 存在しない製品情報を足していない。価格はレビュー本文中の $ 表記から拾っている。
 *
 * 生成: site/scripts/_rescue-offers.py
 */
import type { AffiliateOffer } from "./types";

export const CATALOG_RESCUE: AffiliateOffer[] = [
  {
    "id": "munchkin-fishin-bath-toy",
    "imageUrl": "https://m.media-amazon.com/images/S/aplus-media-library-service-media/d5c8affa-e659-4b68-a507-64de22139a90.__CR0,0,2598,2598_PT0_SX300_V1___.jpg",
    "priceMin": "$15",
    "priceMax": "$15",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Munchkin Fishin Bath Toy",
      "ja": "Munchkin Fishin Bath Toy"
    },
    "description": {
      "en": "The Munchkin Fishin' set introduces a goal-oriented activity into bath time that works from about 18 months onward.",
      "ja": "The Munchkin Fishin' set introduces a goal-oriented activity into bath time that works from about 18 months onward."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Munchkin+Fishin+Bath+Toy",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "skip-hop-moby-diving",
    "imageUrl": "https://m.media-amazon.com/images/I/91ndSiTv+yL._SL1500_.jpg",
    "priceMin": "$18",
    "priceMax": "$18",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Skip Hop Moby Diving",
      "ja": "Skip Hop Moby Diving"
    },
    "description": {
      "en": "Skip Hop's Moby Diving Rings set includes four weighted rings designed to sink to the bottom of the tub, which toddlers retrieve by reaching underwater.",
      "ja": "Skip Hop's Moby Diving Rings set includes four weighted rings designed to sink to the bottom of the tub, which toddlers retrieve by reaching underwater."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Skip+Hop+Moby+Diving",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "boon-building-bath-pipes",
    "imageUrl": "https://m.media-amazon.com/images/I/71RgdonvsJL._AC_SL1500_.jpg",
    "priceMin": "$18",
    "priceMax": "$18",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Boon Building Bath Pipes",
      "ja": "Boon Building Bath Pipes"
    },
    "description": {
      "en": "Boon's Bath Building Pipes set is architecturally mold-resistant because every piece is an open tube — water flows through and out, never sitting in an enclosed space.",
      "ja": "Boon's Bath Building Pipes set is architecturally mold-resistant because every piece is an open tube — water flows through and out, never sitting in an enclosed space."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Boon+Building+Bath+Pipes",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "nuby-bath-rinse-cup",
    "imageUrl": "https://m.media-amazon.com/images/I/51+lmERkOuL._AC_.jpg",
    "priceMin": "$12",
    "priceMax": "$12",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Nuby Bath Rinse Cup",
      "ja": "Nuby Bath Rinse Cup"
    },
    "description": {
      "en": "The Nuby 3-piece Rinse Cup Set is a functional bathroom tool rather than a play toy, and it gets used at every bath rather than every other bath.",
      "ja": "The Nuby 3-piece Rinse Cup Set is a functional bathroom tool rather than a play toy, and it gets used at every bath rather than every other bath."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Nuby+Bath+Rinse+Cup",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "munchkin-bath-letters",
    "imageUrl": "https://images-na.ssl-images-amazon.com/images/I/41l-Mu-OIBL._SY300_QL70_.jpg",
    "priceMin": "$8",
    "priceMax": "$8",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Munchkin Bath Letters",
      "ja": "Munchkin Bath Letters"
    },
    "description": {
      "en": "Munchkin's foam Letters and Numbers set sticks to tile walls when wet, which is the mechanism that makes it educational rather than just decorative.",
      "ja": "Munchkin's foam Letters and Numbers set sticks to tile walls when wet, which is the mechanism that makes it educational rather than just decorative."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Munchkin+Bath+Letters",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "dreft-stage-1-newborn",
    "imageUrl": "https://m.media-amazon.com/images/I/71AzeB9NdeL._AC_SL1500_.jpg",
    "priceMin": "",
    "priceMax": "",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Dreft Stage 1 Newborn",
      "ja": "Dreft Stage 1 Newborn"
    },
    "description": {
      "en": "Dreft Stage 1 is the detergent that pediatricians have recommended for decades, and that history creates a safety confidence that other detergents work harder to establish.",
      "ja": "Dreft Stage 1 is the detergent that pediatricians have recommended for decades, and that history creates a safety confidence that other detergents work harder to establish."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Dreft+Stage+1+Newborn",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "seventh-generation-baby-detergent",
    "imageUrl": "https://m.media-amazon.com/images/I/71DX8fHO9AL._AC_SX679_.jpg",
    "priceMin": "",
    "priceMax": "",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Seventh Generation Baby Detergent",
      "ja": "Seventh Generation Baby Detergent"
    },
    "description": {
      "en": "Seventh Generation's baby formula uses plant-based surfactants and enzyme blends without synthetic fragrances, dyes, or optical brighteners.",
      "ja": "Seventh Generation's baby formula uses plant-based surfactants and enzyme blends without synthetic fragrances, dyes, or optical brighteners."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Seventh+Generation+Baby+Detergent",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "attitude-baby-detergent",
    "imageUrl": "https://m.media-amazon.com/images/I/61LkjxrNUfL._AC_SL1500_.jpg",
    "priceMin": "$12",
    "priceMax": "$12",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Attitude Baby Detergent",
      "ja": "Attitude Baby Detergent"
    },
    "description": {
      "en": "ATTITUDE holds MADE SAFE certification — a third-party program that screens for over 6,500 potentially harmful substances — which puts it at the strict end of the ingredient verification spectrum for baby detergents.",
      "ja": "ATTITUDE holds MADE SAFE certification — a third-party program that screens for over 6,500 potentially harmful substances — which puts it at the strict end of the ingredient verification spectrum for baby detergents."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Attitude+Baby+Detergent",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "babyganics-laundry-detergent",
    "imageUrl": "https://m.media-amazon.com/images/I/61stUEN8I4L._AC_SL1500_.jpg",
    "priceMin": "$14",
    "priceMax": "$14",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Babyganics Laundry Detergent",
      "ja": "Babyganics Laundry Detergent"
    },
    "description": {
      "en": "Babyganics delivers the lowest effective cost per load in this lineup — roughly $0.20 per load from a 60-oz bottle at $14 — with a fragrance-free, plant-based formula that handles the full range of baby stains.",
      "ja": "Babyganics delivers the lowest effective cost per load in this lineup — roughly $0.20 per load from a 60-oz bottle at $14 — with a fragrance-free, plant-based formula that handles the full range of baby stains."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Babyganics+Laundry+Detergent",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "all-free-clear-babies",
    "imageUrl": "https://m.media-amazon.com/images/I/81sIDTuKCJL._SL1500_.jpg",
    "priceMin": "$12",
    "priceMax": "$12",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "All Free Clear Babies",
      "ja": "All Free Clear Babies"
    },
    "description": {
      "en": "All Free Clear's babies formula is the only pick in this lineup where the per-load cost drops below $0.15 at regular retail pricing ($12 for 88 oz).",
      "ja": "All Free Clear's babies formula is the only pick in this lineup where the per-load cost drops below $0.15 at regular retail pricing ($12 for 88 oz)."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=All+Free+Clear+Babies",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "iprimio-ultimate-cat-litter-mat",
    "imageUrl": "https://m.media-amazon.com/images/I/91+T1q4QeAL._AC_SL1500_.jpg",
    "priceMin": "",
    "priceMax": "",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Iprimio Ultimate Cat Litter Mat",
      "ja": "Iprimio Ultimate Cat Litter Mat"
    },
    "description": {
      "en": "iPrimio Ultimate uses a dual-layer honeycomb design where litter falls through the top layer into a sealed bottom tray.",
      "ja": "iPrimio Ultimate uses a dual-layer honeycomb design where litter falls through the top layer into a sealed bottom tray."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Iprimio+Ultimate+Cat+Litter+Mat",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "gorilla-grip-cat-mat",
    "imageUrl": "https://m.media-amazon.com/images/I/61YWup90+oL._AC_SX679_.jpg",
    "priceMin": "$30",
    "priceMax": "$30",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Gorilla Grip Cat Mat",
      "ja": "Gorilla Grip Cat Mat"
    },
    "description": {
      "en": "Gorilla Grip makes the strongest non-slip claim in the category and largely delivers on it.",
      "ja": "Gorilla Grip makes the strongest non-slip claim in the category and largely delivers on it."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Gorilla+Grip+Cat+Mat",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "blackhole-cat-litter-mat",
    "imageUrl": "https://siameseofday.com/wp-content/uploads/2021/05/BlackHole-Litter-Mat-Blackhole-Cat-Litter-Mat.jpg",
    "priceMin": "$32",
    "priceMax": "$32",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Blackhole Cat Litter Mat",
      "ja": "Blackhole Cat Litter Mat"
    },
    "description": {
      "en": "Blackhole Cat Mat's key differentiator is capacity — the lower tray is deeper and wider than iPrimio's, making it more suitable for multi-cat households with high daily litter volume.",
      "ja": "Blackhole Cat Mat's key differentiator is capacity — the lower tray is deeper and wider than iPrimio's, making it more suitable for multi-cat households with high daily litter volume."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Blackhole+Cat+Litter+Mat",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "easyology-cat-litter-mat",
    "imageUrl": "https://m.media-amazon.com/images/I/91BlrDZVB3L._AC_SL1500_.jpg",
    "priceMin": "",
    "priceMax": "",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Easyology Cat Litter Mat",
      "ja": "Easyology Cat Litter Mat"
    },
    "description": {
      "en": "Easyology Premium delivers the dual-layer honeycomb design at the lowest price point in this group.",
      "ja": "Easyology Premium delivers the dual-layer honeycomb design at the lowest price point in this group."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Easyology+Cat+Litter+Mat",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "petlinks-cat-litter-mat",
    "imageUrl": "https://m.media-amazon.com/images/I/71PuxfvL8WL._AC_.jpg",
    "priceMin": "$20",
    "priceMax": "$20",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Petlinks Cat Litter Mat",
      "ja": "Petlinks Cat Litter Mat"
    },
    "description": {
      "en": "PetLinks Pounce is a single-layer microfiber mat that prioritizes softness over mechanical trapping.",
      "ja": "PetLinks Pounce is a single-layer microfiber mat that prioritizes softness over mechanical trapping."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Petlinks+Cat+Litter+Mat",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "dexas-mudpuppy-paw-plunger",
    "imageUrl": "https://m.media-amazon.com/images/I/713JmR3jeIL._AC_SL1500_.jpg",
    "priceMin": "$13",
    "priceMax": "$13",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Dexas Mudpuppy Paw Plunger",
      "ja": "Dexas Mudpuppy Paw Plunger"
    },
    "description": {
      "en": "The Dexas MudBuster is the product that made the category.",
      "ja": "The Dexas MudBuster is the product that made the category."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Dexas+Mudpuppy+Paw+Plunger",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "aquapaw-dog-paw-cleaner",
    "imageUrl": "https://m.media-amazon.com/images/I/71RHFJLOnzL.jpg",
    "priceMin": "$18",
    "priceMax": "$18",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Aquapaw Dog Paw Cleaner",
      "ja": "Aquapaw Dog Paw Cleaner"
    },
    "description": {
      "en": "Aquapaw's paw cleaner attaches to a garden hose or faucet and delivers a gentle stream of water through a silicone scrubbing surface — you hold the paw against the scrubber while water flows through, cleaning without dun",
      "ja": "Aquapaw's paw cleaner attaches to a garden hose or faucet and delivers a gentle stream of water through a silicone scrubbing surface — you hold the paw against the scrubber while water flows through, cleaning without dun"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Aquapaw+Dog+Paw+Cleaner",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "ruff-wear-paw-cleaner",
    "imageUrl": "https://m.media-amazon.com/images/I/71Ru2eAUBQL._AC_SL1500_.jpg",
    "priceMin": "$20",
    "priceMax": "$20",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Ruff Wear Paw Cleaner",
      "ja": "Ruff Wear Paw Cleaner"
    },
    "description": {
      "en": "Ruff-Wear's Hydro Plane is a portable, collapsible paw wash bowl that's actually useful in the field — it folds flat for pack storage and expands into a basin sized for a large dog paw.",
      "ja": "Ruff-Wear's Hydro Plane is a portable, collapsible paw wash bowl that's actually useful in the field — it folds flat for pack storage and expands into a basin sized for a large dog paw."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Ruff+Wear+Paw+Cleaner",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "cleanpaw-portable-washer",
    "imageUrl": "https://m.media-amazon.com/images/I/61eRRU8e0ZL._SL1500_.jpg",
    "priceMin": "$12",
    "priceMax": "$12",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Cleanpaw Portable Washer",
      "ja": "Cleanpaw Portable Washer"
    },
    "description": {
      "en": "CleanPaw is the budget alternative to the MudBuster at $12 — the design is nearly identical but the silicone quality is slightly lower and the bristle density is reduced compared to the original.",
      "ja": "CleanPaw is the budget alternative to the MudBuster at $12 — the design is nearly identical but the silicone quality is slightly lower and the bristle density is reduced compared to the original."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Cleanpaw+Portable+Washer",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "burts-bees-paw-cleanser",
    "imageUrl": "https://m.media-amazon.com/images/I/61G6hMtU06L._AC_SL1500_.jpg",
    "priceMin": "$7",
    "priceMax": "$7",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Burts Bees Paw Cleanser",
      "ja": "Burts Bees Paw Cleanser"
    },
    "description": {
      "en": "Burt's Bees Paw Cleanser is the daily maintenance product rather than a mud remover — it's a spray that you apply to the paw and wipe off, removing light dirt, allergens, and everyday debris without water.",
      "ja": "Burt's Bees Paw Cleanser is the daily maintenance product rather than a mud remover — it's a spray that you apply to the paw and wipe off, removing light dirt, allergens, and everyday debris without water."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Burts+Bees+Paw+Cleanser",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "garmin-delta-xc",
    "imageUrl": "https://m.media-amazon.com/images/I/71dUMQ1sakL._AC_SL1500_.jpg",
    "priceMin": "$200",
    "priceMax": "$200",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Garmin Delta Xc",
      "ja": "Garmin Delta Xc"
    },
    "description": {
      "en": "Garmin Delta XC is a professional-grade e-collar with 18 stimulation levels and compatibility with Garmin's BarkLimiter and Delta handhelds for multi-dog setups.",
      "ja": "Garmin Delta XC is a professional-grade e-collar with 18 stimulation levels and compatibility with Garmin's BarkLimiter and Delta handhelds for multi-dog setups."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Garmin+Delta+Xc",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "dogtra-200c-remote-trainer",
    "imageUrl": "https://m.media-amazon.com/images/I/71JcVvsukoL._AC_SL1500_.jpg",
    "priceMin": "$130",
    "priceMax": "$130",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Dogtra 200c Remote Trainer",
      "ja": "Dogtra 200c Remote Trainer"
    },
    "description": {
      "en": "Dogtra 200C is the clean, professional choice for single-dog training without the Garmin ecosystem.",
      "ja": "Dogtra 200C is the clean, professional choice for single-dog training without the Garmin ecosystem."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Dogtra+200c+Remote+Trainer",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "patpet-380c-training-collar",
    "imageUrl": "https://m.media-amazon.com/images/I/71g1eKpXMbL._AC_SL1500_.jpg",
    "priceMin": "$55",
    "priceMax": "$55",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Patpet 380c Training Collar",
      "ja": "Patpet 380c Training Collar"
    },
    "description": {
      "en": "PATPET 380C covers the basics at a price point that makes sense for basic home training.",
      "ja": "PATPET 380C covers the basics at a price point that makes sense for basic home training."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Patpet+380c+Training+Collar",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "educator-et-300-mini",
    "imageUrl": "https://m.media-amazon.com/images/I/81DNwto+2dL._AC_SL1500_.jpg",
    "priceMin": "$175",
    "priceMax": "$175",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Educator Et 300 Mini",
      "ja": "Educator Et 300 Mini"
    },
    "description": {
      "en": "E-Collar Technologies ET-300 Mini is the tool that professional low-stimulation trainers use when they need surgical precision at the lowest levels.",
      "ja": "E-Collar Technologies ET-300 Mini is the tool that professional low-stimulation trainers use when they need surgical precision at the lowest levels."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Educator+Et+300+Mini",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "bousnic-dog-training-collar",
    "imageUrl": "",
    "priceMin": "$40",
    "priceMax": "$40",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Bousnic Dog Training Collar",
      "ja": "Bousnic Dog Training Collar"
    },
    "description": {
      "en": "Bousnic's 2-dog system is the budget pick for households with more than one dog that need basic training work.",
      "ja": "Bousnic's 2-dog system is the budget pick for households with more than one dog that need basic training work."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Bousnic+Dog+Training+Collar",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "aqueon-10-gallon-starter",
    "imageUrl": "https://m.media-amazon.com/images/I/71FQTAc7gdL._AC_SL1500_.jpg",
    "priceMin": "$80",
    "priceMax": "$80",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Aqueon 10 Gallon Starter",
      "ja": "Aqueon 10 Gallon Starter"
    },
    "description": {
      "en": "The Aqueon 10 Gallon Starter Kit is the most complete, accessible beginner package in this roundup.",
      "ja": "The Aqueon 10 Gallon Starter Kit is the most complete, accessible beginner package in this roundup."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Aqueon+10+Gallon+Starter",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "marineland-portrait-5g",
    "imageUrl": "https://m.media-amazon.com/images/I/911mSfa5q9L.jpg",
    "priceMin": "$60",
    "priceMax": "$60",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Marineland Portrait 5g",
      "ja": "Marineland Portrait 5g"
    },
    "description": {
      "en": "Marineland Portrait's curved glass and vertical proportions make it the most aesthetically appealing option in this group.",
      "ja": "Marineland Portrait's curved glass and vertical proportions make it the most aesthetically appealing option in this group."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Marineland+Portrait+5g",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "fluval-spec-v-5g",
    "imageUrl": "https://m.media-amazon.com/images/I/71eS+BvU+VL._AC_.jpg",
    "priceMin": "$140",
    "priceMax": "$140",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Fluval Spec V 5g",
      "ja": "Fluval Spec V 5g"
    },
    "description": {
      "en": "Fluval Spec V is built to a noticeably higher standard than most kits at this size.",
      "ja": "Fluval Spec V is built to a noticeably higher standard than most kits at this size."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Fluval+Spec+V+5g",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "tetra-10-gallon-complete",
    "imageUrl": "https://m.media-amazon.com/images/I/51gzYbyl-pL._AC_SL1000_.jpg",
    "priceMin": "$65",
    "priceMax": "$65",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Tetra 10 Gallon Complete",
      "ja": "Tetra 10 Gallon Complete"
    },
    "description": {
      "en": "Tetra's 10 Gallon Aquarium Kit gets the job done at the lowest price for a full 10-gallon setup.",
      "ja": "Tetra's 10 Gallon Aquarium Kit gets the job done at the lowest price for a full 10-gallon setup."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Tetra+10+Gallon+Complete",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "penn-plax-tank-20g",
    "imageUrl": "https://m.media-amazon.com/images/I/61gdcbXhUYL.jpg",
    "priceMin": "$90",
    "priceMax": "$90",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Penn Plax Tank 20g",
      "ja": "Penn Plax Tank 20g"
    },
    "description": {
      "en": "Penn Plax's 20-gallon starter is the choice for beginners who know from the start they want a community fish setup.",
      "ja": "Penn Plax's 20-gallon starter is the choice for beginners who know from the start they want a community fish setup."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Penn+Plax+Tank+20g",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "taste-of-wild-pacific-stream",
    "imageUrl": "https://m.media-amazon.com/images/I/71c0vVybQdL._AC_SL1500_.jpg",
    "priceMin": "$50",
    "priceMax": "$50",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Taste Of Wild Pacific Stream",
      "ja": "Taste Of Wild Pacific Stream"
    },
    "description": {
      "en": "Taste of the Wild Pacific Stream has been the go-to grain-free recommendation for over a decade because it delivers solid ingredient quality at a price that doesn't require justification.",
      "ja": "Taste of the Wild Pacific Stream has been the go-to grain-free recommendation for over a decade because it delivers solid ingredient quality at a price that doesn't require justification."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Taste+Of+Wild+Pacific+Stream",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "merrick-grain-free-chicken",
    "imageUrl": "https://m.media-amazon.com/images/I/61HPCc7i3hL._AC_SL1000_.jpg",
    "priceMin": "$60",
    "priceMax": "$60",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Merrick Grain Free Chicken",
      "ja": "Merrick Grain Free Chicken"
    },
    "description": {
      "en": "Merrick's Grain-Free line offers more flavor options than most competitors — chicken, beef, salmon, duck, bison — which is useful for dogs who lose interest in a single protein or owners managing allergies through rotati",
      "ja": "Merrick's Grain-Free line offers more flavor options than most competitors — chicken, beef, salmon, duck, bison — which is useful for dogs who lose interest in a single protein or owners managing allergies through rotati"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Merrick+Grain+Free+Chicken",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "canidae-pure-grain-free",
    "imageUrl": "https://m.media-amazon.com/images/I/71Lgmd7WN0L._AC_SL1500_.jpg",
    "priceMin": "$55",
    "priceMax": "$55",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Canidae Pure Grain Free",
      "ja": "Canidae Pure Grain Free"
    },
    "description": {
      "en": "CANIDAE PURE is built specifically for dogs with food sensitivities — limited ingredient formulas with 7 or fewer ingredients make it easy to identify what your dog is eating and rule out allergens.",
      "ja": "CANIDAE PURE is built specifically for dogs with food sensitivities — limited ingredient formulas with 7 or fewer ingredients make it easy to identify what your dog is eating and rule out allergens."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Canidae+Pure+Grain+Free",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "orijen-original-dry",
    "imageUrl": "https://m.media-amazon.com/images/I/71bcpNjVp7L._SL1500_.jpg",
    "priceMin": "$3",
    "priceMax": "$90",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Orijen Original Dry",
      "ja": "Orijen Original Dry"
    },
    "description": {
      "en": "ORIJEN Original is the most protein-dense option on this list at 38% crude protein from 85% animal ingredients — chicken, turkey, fish, eggs.",
      "ja": "ORIJEN Original is the most protein-dense option on this list at 38% crude protein from 85% animal ingredients — chicken, turkey, fish, eggs."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Orijen+Original+Dry",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "wellness-core-grain-free",
    "imageUrl": "https://m.media-amazon.com/images/I/71z66WgNTiL._AC_SL1500_.jpg",
    "priceMin": "$65",
    "priceMax": "$65",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Wellness Core Grain Free",
      "ja": "Wellness Core Grain Free"
    },
    "description": {
      "en": "Wellness CORE Grain-Free sits comfortably in the quality middle: 34% protein from deboned turkey and chicken, grain-free with a moderate legume load, and DHA from salmon oil for coat and brain health.",
      "ja": "Wellness CORE Grain-Free sits comfortably in the quality middle: 34% protein from deboned turkey and chicken, grain-free with a moderate legume load, and DHA from salmon oil for coat and brain health."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Wellness+Core+Grain+Free",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "jansport-superbreak-kids",
    "imageUrl": "https://m.media-amazon.com/images/I/8145-l9pJrL._AC_SL1001_.jpg",
    "priceMin": "$35",
    "priceMax": "$35",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Jansport Superbreak Kids",
      "ja": "Jansport Superbreak Kids"
    },
    "description": {
      "en": "JanSport's lifetime warranty is the relevant differentiator for the SuperBreak — not because kids bags break constantly, but because when one does, you send it back and get a new one rather than buying another bag.",
      "ja": "JanSport's lifetime warranty is the relevant differentiator for the SuperBreak — not because kids bags break constantly, but because when one does, you send it back and get a new one rather than buying another bag."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Jansport+Superbreak+Kids",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "pottery-barn-kids-classic",
    "imageUrl": "https://m.media-amazon.com/images/I/91S550z52AL._AC_SL1500_.jpg",
    "priceMin": "",
    "priceMax": "",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Pottery Barn Kids Classic",
      "ja": "Pottery Barn Kids Classic"
    },
    "description": {
      "en": "The Pottery Barn Kids Classic earns its place through organization density: a main compartment with interior organization, front pocket, side water bottle pocket, and monogramming that makes the bag visually distinct at ",
      "ja": "The Pottery Barn Kids Classic earns its place through organization density: a main compartment with interior organization, front pocket, side water bottle pocket, and monogramming that makes the bag visually distinct at "
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Pottery+Barn+Kids+Classic",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "herschel-survey-kids",
    "imageUrl": "https://kollelbudget.com/wp-content/uploads/2019/11/1im-7.jpg",
    "priceMin": "",
    "priceMax": "",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Herschel Survey Kids",
      "ja": "Herschel Survey Kids"
    },
    "description": {
      "en": "The Herschel Survey scales the adult Heritage design down to kids dimensions without sacrificing the visual appeal that makes Herschel bags desirable in the first place.",
      "ja": "The Herschel Survey scales the adult Heritage design down to kids dimensions without sacrificing the visual appeal that makes Herschel bags desirable in the first place."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Herschel+Survey+Kids",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "lands-end-classmate",
    "imageUrl": "",
    "priceMin": "",
    "priceMax": "",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Lands End Classmate",
      "ja": "Lands End Classmate"
    },
    "description": {
      "en": "Lands' End puts more padding where it matters than any other bag in this lineup: thick padded back panel, wide padded shoulder straps with ergonomic contouring, and a sternum strap that keeps weight centered.",
      "ja": "Lands' End puts more padding where it matters than any other bag in this lineup: thick padded back panel, wide padded shoulder straps with ergonomic contouring, and a sternum strap that keeps weight centered."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Lands+End+Classmate",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "skip-hop-zoo-backpack",
    "imageUrl": "https://m.media-amazon.com/images/I/91CI54UsdoL._AC_SL1500_.jpg",
    "priceMin": "",
    "priceMax": "",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Skip Hop Zoo Backpack",
      "ja": "Skip Hop Zoo Backpack"
    },
    "description": {
      "en": "The Skip Hop Zoo backpack is sized for preschool and early elementary bodies — roughly 12–14 inches tall — with a main compartment large enough for a change of clothes and a snack, but not so large that it overwhelms a t",
      "ja": "The Skip Hop Zoo backpack is sized for preschool and early elementary bodies — roughly 12–14 inches tall — with a main compartment large enough for a change of clothes and a snack, but not so large that it overwhelms a t"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Skip+Hop+Zoo+Backpack",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "bell-sidetrack-ii-youth",
    "imageUrl": "https://m.media-amazon.com/images/S/aplus-media/sc/6946c9f2-3df6-49a3-afdf-243b86f2dbf4.__CR0,0,970,600_PT0_SX970_V1___.jpg",
    "priceMin": "$40",
    "priceMax": "$40",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Bell Sidetrack Ii Youth",
      "ja": "Bell Sidetrack Ii Youth"
    },
    "description": {
      "en": "Bell's Sidetrack II hits a precise balance between protection, ventilation, and usability that earns the top spot.",
      "ja": "Bell's Sidetrack II hits a precise balance between protection, ventilation, and usability that earns the top spot."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Bell+Sidetrack+Ii+Youth",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "nutcase-little-nutty",
    "imageUrl": "https://m.media-amazon.com/images/I/61q6bXeKU0L._AC_SL1500_.jpg",
    "priceMin": "$60",
    "priceMax": "$60",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Nutcase Little Nutty",
      "ja": "Nutcase Little Nutty"
    },
    "description": {
      "en": "Nutcase helmets have genuine crossover appeal: kids want to wear them because the graphics are visually distinct from the generic designs most brands offer, and parents accept the premium because the build quality justif",
      "ja": "Nutcase helmets have genuine crossover appeal: kids want to wear them because the graphics are visually distinct from the generic designs most brands offer, and parents accept the premium because the build quality justif"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Nutcase+Little+Nutty",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "specialized-mio-mips",
    "imageUrl": "http://www.dynamitebikelab.com/cdn/shop/files/60020-142_HLMT_MIO-HLMT-MIPS-CE-MNT-TDLR_HERO.jpg?v=1747951985",
    "priceMin": "$60",
    "priceMax": "$60",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Specialized Mio Mips",
      "ja": "Specialized Mio Mips"
    },
    "description": {
      "en": "The Specialized Mio bundles MIPS protection into a helmet that weighs under 280 grams — light enough that kids rarely notice they're wearing it.",
      "ja": "The Specialized Mio bundles MIPS protection into a helmet that weighs under 280 grams — light enough that kids rarely notice they're wearing it."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Specialized+Mio+Mips",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "giro-scamp-mips",
    "imageUrl": "http://cambriabike.com/cdn/shop/files/GiroScampMIPSIIChildHelmet-MattPurple.jpg?v=1729068386",
    "priceMin": "",
    "priceMax": "",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Giro Scamp Mips",
      "ja": "Giro Scamp Mips"
    },
    "description": {
      "en": "The Giro Scamp is sized specifically for the XS/S head range (45–49 cm) that most brands don't address cleanly — young children often swim in 'small' helmets from brands that start their range at 49 cm.",
      "ja": "The Giro Scamp is sized specifically for the XS/S head range (45–49 cm) that most brands don't address cleanly — young children often swim in 'small' helmets from brands that start their range at 49 cm."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Giro+Scamp+Mips",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "joovy-noodle-helmet",
    "imageUrl": "https://m.media-amazon.com/images/I/61tD4cAcKBL._SL1500_.jpg",
    "priceMin": "$35",
    "priceMax": "$35",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Joovy Noodle Helmet",
      "ja": "Joovy Noodle Helmet"
    },
    "description": {
      "en": "At $35, the Joovy Noodle is the clearest budget pick for families who need a safe, certified helmet without the premium features.",
      "ja": "At $35, the Joovy Noodle is the clearest budget pick for families who need a safe, certified helmet without the premium features."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Joovy+Noodle+Helmet",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "rayco-pet-first-aid-kit",
    "imageUrl": "https://shoprayco.com/cdn/shop/products/dogkitfullpictureedit.jpg?v=1665601606",
    "priceMin": "$10",
    "priceMax": "$29",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Rayco Pet First Aid Kit",
      "ja": "Rayco Pet First Aid Kit"
    },
    "description": {
      "en": "Rayco's 50-piece kit covers the basics — gauze, bandages, antiseptic wipes, scissors, and tweezers — at the lowest price point in this group.",
      "ja": "Rayco's 50-piece kit covers the basics — gauze, bandages, antiseptic wipes, scissors, and tweezers — at the lowest price point in this group."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Rayco+Pet+First+Aid+Kit",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "american-red-cross-pet-kit",
    "imageUrl": "https://m.media-amazon.com/images/I/616RgPUoByL._AC_CR0%2C0%2C0%2C0_SX704_SY660_.jpg",
    "priceMin": "$35",
    "priceMax": "$35",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "American Red Cross Pet Kit",
      "ja": "American Red Cross Pet Kit"
    },
    "description": {
      "en": "The American Red Cross kit distinguishes itself by pairing physical supplies with curated guidance — a first aid manual, reference card, and access to the ARC Pet First Aid app.",
      "ja": "The American Red Cross kit distinguishes itself by pairing physical supplies with curated guidance — a first aid manual, reference card, and access to the ARC Pet First Aid app."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=American+Red+Cross+Pet+Kit",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "fieldtex-pet-first-aid",
    "imageUrl": "",
    "priceMin": "$45",
    "priceMax": "$45",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Fieldtex Pet First Aid",
      "ja": "Fieldtex Pet First Aid"
    },
    "description": {
      "en": "Fieldtex makes first aid kits for professional environments, and the construction shows.",
      "ja": "Fieldtex makes first aid kits for professional environments, and the construction shows."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Fieldtex+Pet+First+Aid",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "surviveware-pet-first-aid",
    "imageUrl": "https://m.media-amazon.com/images/I/71UDS9sB9AL._AC_SL1500_.jpg",
    "priceMin": "$38",
    "priceMax": "$38",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Surviveware Pet First Aid",
      "ja": "Surviveware Pet First Aid"
    },
    "description": {
      "en": "Surviveware built this kit with outdoor use as the primary design constraint.",
      "ja": "Surviveware built this kit with outdoor use as the primary design constraint."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Surviveware+Pet+First+Aid",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "vet-worthy-pet-first-aid",
    "imageUrl": "https://shop.petlife.com/cdn/shop/products/vet-worthy-first-aid-paw-pad-shield-for-dogs-2-oz-jar-942717.jpg?v=1647212110",
    "priceMin": "$40",
    "priceMax": "$40",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Vet Worthy Pet First Aid",
      "ja": "Vet Worthy Pet First Aid"
    },
    "description": {
      "en": "Vet Worthy is assembled with veterinary input rather than general first aid logic, and it shows in the supply selection.",
      "ja": "Vet Worthy is assembled with veterinary input rather than general first aid logic, and it shows in the supply selection."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Vet+Worthy+Pet+First+Aid",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "hills-science-diet-senior-cat",
    "imageUrl": "https://m.media-amazon.com/images/I/71LSuQJtsHL.jpg",
    "priceMin": "$29",
    "priceMax": "$29",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Hills Science Diet Senior Cat",
      "ja": "Hills Science Diet Senior Cat"
    },
    "description": {
      "en": "Hill's Science Diet 11+ is formulated around the specific metabolic shifts that happen in the last phase of a cat's life: reduced phosphorus, controlled sodium, and easy-to-digest protein from chicken as the first ingred",
      "ja": "Hill's Science Diet 11+ is formulated around the specific metabolic shifts that happen in the last phase of a cat's life: reduced phosphorus, controlled sodium, and easy-to-digest protein from chicken as the first ingred"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Hills+Science+Diet+Senior+Cat",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "royal-canin-aging-12",
    "imageUrl": "https://m.media-amazon.com/images/I/71nfFAkhnQL._AC_SL1500_.jpg",
    "priceMin": "",
    "priceMax": "",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Royal Canin Aging 12",
      "ja": "Royal Canin Aging 12"
    },
    "description": {
      "en": "Royal Canin's Aging 12+ is the most specialized formula in this group — designed specifically for cats in their final life stage where declining appetite, reduced digestion, and tooth sensitivity are practical daily chal",
      "ja": "Royal Canin's Aging 12+ is the most specialized formula in this group — designed specifically for cats in their final life stage where declining appetite, reduced digestion, and tooth sensitivity are practical daily chal"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Royal+Canin+Aging+12",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "purina-pro-plan-senior-7",
    "imageUrl": "https://m.media-amazon.com/images/I/81rG4ypGTiL._AC_SL1500_.jpg",
    "priceMin": "$24",
    "priceMax": "$24",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Purina Pro Plan Senior 7",
      "ja": "Purina Pro Plan Senior 7"
    },
    "description": {
      "en": "Pro Plan Senior 7+ uses real chicken as the first ingredient and a high overall protein content that holds up well against significantly more expensive competitors.",
      "ja": "Pro Plan Senior 7+ uses real chicken as the first ingredient and a high overall protein content that holds up well against significantly more expensive competitors."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Purina+Pro+Plan+Senior+7",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "iams-proactive-senior-cat",
    "imageUrl": "https://images-na.ssl-images-amazon.com/images/I/81XfNsI3S2L.jpg",
    "priceMin": "",
    "priceMax": "",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Iams Proactive Senior Cat",
      "ja": "Iams Proactive Senior Cat"
    },
    "description": {
      "en": "IAMS Proactive Senior delivers a solid macronutrient profile at the lowest price in this group.",
      "ja": "IAMS Proactive Senior delivers a solid macronutrient profile at the lowest price in this group."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Iams+Proactive+Senior+Cat",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "wellness-complete-senior-cat",
    "imageUrl": "https://m.media-amazon.com/images/I/71l8hmvPBiL._AC_SX569_.jpg",
    "priceMin": "$32",
    "priceMax": "$32",
    "category": "pets",
    "badge": "🐾",
    "name": {
      "en": "Wellness Complete Senior Cat",
      "ja": "Wellness Complete Senior Cat"
    },
    "description": {
      "en": "Wellness Complete Senior stands out for what it leaves out: no corn, wheat, soy, artificial colors, flavors, or preservatives.",
      "ja": "Wellness Complete Senior stands out for what it leaves out: no corn, wheat, soy, artificial colors, flavors, or preservatives."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Wellness+Complete+Senior+Cat",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "melissa-doug-shape-sorting",
    "imageUrl": "https://m.media-amazon.com/images/I/71aYQI5JwBL._AC_SL1500_.jpg",
    "priceMin": "$16",
    "priceMax": "$16",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Melissa Doug Shape Sorting",
      "ja": "Melissa Doug Shape Sorting"
    },
    "description": {
      "en": "Melissa & Doug's Shape Sorting Cube is a 30+ year product category staple for a reason: the maple hardwood construction survives years of toddler handling, the 12 colorful shapes provide sufficient variety to stay engagi",
      "ja": "Melissa & Doug's Shape Sorting Cube is a 30+ year product category staple for a reason: the maple hardwood construction survives years of toddler handling, the 12 colorful shapes provide sufficient variety to stay engagi"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Melissa+Doug+Shape+Sorting",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "fisher-price-laugh-learn",
    "imageUrl": "https://m.media-amazon.com/images/I/71RTpfKyzPL._AC_SL1500_.jpg",
    "priceMin": "$28",
    "priceMax": "$28",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Fisher Price Laugh Learn",
      "ja": "Fisher Price Laugh Learn"
    },
    "description": {
      "en": "Fisher-Price Laugh & Learn uses 75+ songs, sounds, and phrases to reinforce letters, numbers, colors, and words through repetitive, child-initiated discovery.",
      "ja": "Fisher-Price Laugh & Learn uses 75+ songs, sounds, and phrases to reinforce letters, numbers, colors, and words through repetitive, child-initiated discovery."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Fisher+Price+Laugh+Learn",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "leapfrog-world-map",
    "imageUrl": "https://m.media-amazon.com/images/S/aplus-media/vc/bf2232b3-b36b-4657-9275-d16ff0d95955.__CR0,0,970,300_PT0_SX970_V1___.png",
    "priceMin": "$35",
    "priceMax": "$35",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Leapfrog World Map",
      "ja": "Leapfrog World Map"
    },
    "description": {
      "en": "LeapFrog's Interactive World Map earns its place by scaling further up the age range than any other pick here.",
      "ja": "LeapFrog's Interactive World Map earns its place by scaling further up the age range than any other pick here."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Leapfrog+World+Map",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "vtech-sort-discover",
    "imageUrl": "https://m.media-amazon.com/images/I/812eVyGLqEL._AC_SL1500_.jpg",
    "priceMin": "$20",
    "priceMax": "$20",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Vtech Sort Discover",
      "ja": "Vtech Sort Discover"
    },
    "description": {
      "en": "VTech Sort & Discover balances electronic feedback with hands-on physical sorting in a way that keeps the interaction child-driven: the electronic responses are rewards for completing the physical task correctly, not pas",
      "ja": "VTech Sort & Discover balances electronic feedback with hands-on physical sorting in a way that keeps the interaction child-driven: the electronic responses are rewards for completing the physical task correctly, not pas"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Vtech+Sort+Discover",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "hape-wooden-stacker",
    "imageUrl": "https://m.media-amazon.com/images/I/71BOhMsXCbL.jpg",
    "priceMin": "$30",
    "priceMax": "$30",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Hape Wooden Stacker",
      "ja": "Hape Wooden Stacker"
    },
    "description": {
      "en": "Hape's wooden stacking toy is the most open-ended option in this group — there's no single right way to play with it, which means it evolves with the child from 12 months (simple stacking by size) through age 3 (color so",
      "ja": "Hape's wooden stacking toy is the most open-ended option in this group — there's no single right way to play with it, which means it evolves with the child from 12 months (simple stacking by size) through age 3 (color so"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Hape+Wooden+Stacker",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "summer-infant-my-size-potty",
    "imageUrl": "https://m.media-amazon.com/images/I/61hfNSp3IyL._AC_.jpg",
    "priceMin": "$30",
    "priceMax": "$30",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Summer Infant My Size Potty",
      "ja": "Summer Infant My Size Potty"
    },
    "description": {
      "en": "The Summer Infant My Size potty is the closest consumer product gets to a child-scaled toilet, complete with a flip-down lid, tank for holding baby wipes, and a lever that makes a flushing sound.",
      "ja": "The Summer Infant My Size potty is the closest consumer product gets to a child-scaled toilet, complete with a flip-down lid, tank for holding baby wipes, and a lever that makes a flushing sound."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Summer+Infant+My+Size+Potty",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "baby-bjorn-smart-potty",
    "imageUrl": "https://m.media-amazon.com/images/I/61AUwNAyRDL._AC_SL1500_.jpg",
    "priceMin": "$30",
    "priceMax": "$30",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Baby Bjorn Smart Potty",
      "ja": "Baby Bjorn Smart Potty"
    },
    "description": {
      "en": "BabyBjörn designs the Smart Potty around the parent's reality: you will be emptying and rinsing this device multiple times per day for weeks, and it should take under 20 seconds.",
      "ja": "BabyBjörn designs the Smart Potty around the parent's reality: you will be emptying and rinsing this device multiple times per day for weeks, and it should take under 20 seconds."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Baby+Bjorn+Smart+Potty",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "oxo-tot-2-in-1-potty",
    "imageUrl": "https://m.media-amazon.com/images/I/61yssmbij6L._AC_SL1500_.jpg",
    "priceMin": "$20",
    "priceMax": "$20",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Oxo Tot 2 In 1 Potty",
      "ja": "Oxo Tot 2 In 1 Potty"
    },
    "description": {
      "en": "The OXO Tot 2-in-1 earns its price by covering both phases of potty training without a second purchase.",
      "ja": "The OXO Tot 2-in-1 earns its price by covering both phases of potty training without a second purchase."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Oxo+Tot+2+In+1+Potty",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "skip-hop-step-up-potty",
    "imageUrl": "",
    "priceMin": "$45",
    "priceMax": "$45",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Skip Hop Step Up Potty",
      "ja": "Skip Hop Step Up Potty"
    },
    "description": {
      "en": "The Skip Hop Step-Up integrates a two-step stool, a toilet ring insert, and a standalone potty into one foldable unit.",
      "ja": "The Skip Hop Step-Up integrates a two-step stool, a toilet ring insert, and a standalone potty into one foldable unit."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Skip+Hop+Step+Up+Potty",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "fisher-price-learn-flush-potty",
    "imageUrl": "",
    "priceMin": "$28",
    "priceMax": "$28",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Fisher Price Learn Flush Potty",
      "ja": "Fisher Price Learn Flush Potty"
    },
    "description": {
      "en": "The Fisher-Price Learn-to-Flush potty is the most feature-heavy in this lineup — flushing handle, pop-up tissue dispenser for wiping practice, and removable inner bowl — and is specifically useful for toddlers who show h",
      "ja": "The Fisher-Price Learn-to-Flush potty is the most feature-heavy in this lineup — flushing handle, pop-up tissue dispenser for wiping practice, and removable inner bowl — and is specifically useful for toddlers who show h"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Fisher+Price+Learn+Flush+Potty",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "stride-rite-soft-motion",
    "imageUrl": "",
    "priceMin": "$50",
    "priceMax": "$50",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Stride Rite Soft Motion",
      "ja": "Stride Rite Soft Motion"
    },
    "description": {
      "en": "Stride Rite's Soft Motion line is built around pediatric foot development in a way that's measurable rather than just marketed.",
      "ja": "Stride Rite's Soft Motion line is built around pediatric foot development in a way that's measurable rather than just marketed."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Stride+Rite+Soft+Motion",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "native-jefferson-toddler",
    "imageUrl": "",
    "priceMin": "",
    "priceMax": "",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Native Jefferson Toddler",
      "ja": "Native Jefferson Toddler"
    },
    "description": {
      "en": "The Native Jefferson solves the shoe-fight problem by eliminating closures entirely.",
      "ja": "The Native Jefferson solves the shoe-fight problem by eliminating closures entirely."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Native+Jefferson+Toddler",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "new-balance-515v3-toddler",
    "imageUrl": "",
    "priceMin": "",
    "priceMax": "",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "New Balance 515v3 Toddler",
      "ja": "New Balance 515v3 Toddler"
    },
    "description": {
      "en": "New Balance's explicit 2E and 4E wide sizing options make the 515v3 the most accessible choice for families who've watched their child wince in standard-width shoes.",
      "ja": "New Balance's explicit 2E and 4E wide sizing options make the 515v3 the most accessible choice for families who've watched their child wince in standard-width shoes."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=New+Balance+515v3+Toddler",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "plae-mae-toddler",
    "imageUrl": "",
    "priceMin": "$60",
    "priceMax": "$60",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Plae Mae Toddler",
      "ja": "Plae Mae Toddler"
    },
    "description": {
      "en": "PLAE designs shoes around a generous toe box and a removable insole that accommodates custom orthotics — an unusual feature in toddler footwear that matters for families working with pediatric podiatrists.",
      "ja": "PLAE designs shoes around a generous toe box and a removable insole that accommodates custom orthotics — an unusual feature in toddler footwear that matters for families working with pediatric podiatrists."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Plae+Mae+Toddler",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "keen-newport-h2-toddler",
    "imageUrl": "",
    "priceMin": "",
    "priceMax": "",
    "category": "parenting",
    "badge": "👶",
    "name": {
      "en": "Keen Newport H2 Toddler",
      "ja": "Keen Newport H2 Toddler"
    },
    "description": {
      "en": "The Keen Newport H2 is the right answer for splash pads, beach days, and any activity where regular shoes would be destroyed by the end of the hour.",
      "ja": "The Keen Newport H2 is the right answer for splash pads, beach days, and any activity where regular shoes would be destroyed by the end of the hour."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Keen+Newport+H2+Toddler",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "bagsmart-travel-document-bag",
    "imageUrl": "",
    "priceMin": "$18",
    "priceMax": "$18",
    "category": "fashion",
    "badge": "👗",
    "name": {
      "en": "Bagsmart Travel Document Bag",
      "ja": "Bagsmart Travel Document Bag"
    },
    "description": {
      "en": "BAGSMART's organizer hits the practical sweet spot that most travelers actually need: dedicated passport slot, 10 card pockets, a full-length zip pocket for folded boarding passes, and a pen loop — all in a package that ",
      "ja": "BAGSMART's organizer hits the practical sweet spot that most travelers actually need: dedicated passport slot, 10 card pockets, a full-length zip pocket for folded boarding passes, and a pen loop — all in a package that "
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Bagsmart+Travel+Document+Bag",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "zoppen-multi-purpose-rfid",
    "imageUrl": "",
    "priceMin": "",
    "priceMax": "",
    "category": "fashion",
    "badge": "👗",
    "name": {
      "en": "Zoppen Multi Purpose Rfid",
      "ja": "Zoppen Multi Purpose Rfid"
    },
    "description": {
      "en": "Zoppen builds in more compartments than most travelers use, but the layout is logical enough that nothing gets lost.",
      "ja": "Zoppen builds in more compartments than most travelers use, but the layout is logical enough that nothing gets lost."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Zoppen+Multi+Purpose+Rfid",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "travelambo-passport-holder",
    "imageUrl": "",
    "priceMin": "$14",
    "priceMax": "$14",
    "category": "fashion",
    "badge": "👗",
    "name": {
      "en": "Travelambo Passport Holder",
      "ja": "Travelambo Passport Holder"
    },
    "description": {
      "en": "Travelambo makes a family passport holder that holds 4 passports, 8 boarding passes, and a stack of cards without becoming unmanageable.",
      "ja": "Travelambo makes a family passport holder that holds 4 passports, 8 boarding passes, and a stack of cards without becoming unmanageable."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Travelambo+Passport+Holder",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "shacke-pak-document-tech",
    "imageUrl": "",
    "priceMin": "$20",
    "priceMax": "$20",
    "category": "fashion",
    "badge": "👗",
    "name": {
      "en": "Shacke Pak Document Tech",
      "ja": "Shacke Pak Document Tech"
    },
    "description": {
      "en": "Shacke Pak made a document organizer for people who also need to manage cables, SIM cards, and memory cards alongside their travel docs.",
      "ja": "Shacke Pak made a document organizer for people who also need to manage cables, SIM cards, and memory cards alongside their travel docs."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Shacke+Pak+Document+Tech",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "lewis-clark-travel-wallet",
    "imageUrl": "",
    "priceMin": "",
    "priceMax": "",
    "category": "fashion",
    "badge": "👗",
    "name": {
      "en": "Lewis Clark Travel Wallet",
      "ja": "Lewis Clark Travel Wallet"
    },
    "description": {
      "en": "Lewis N.",
      "ja": "Lewis N."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Lewis+Clark+Travel+Wallet",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "adventure-medical-kits-ultralight",
    "imageUrl": "",
    "priceMin": "",
    "priceMax": "",
    "category": "home",
    "badge": "🏠",
    "name": {
      "en": "Adventure Medical Kits Ultralight",
      "ja": "Adventure Medical Kits Ultralight"
    },
    "description": {
      "en": "Adventure Medical Kits built the Ultralight .7 for backpackers who measure every gram — it weighs 0.7 pounds and fits in the palm of your hand while covering the injuries you'll actually encounter.",
      "ja": "Adventure Medical Kits built the Ultralight .7 for backpackers who measure every gram — it weighs 0.7 pounds and fits in the palm of your hand while covering the injuries you'll actually encounter."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Adventure+Medical+Kits+Ultralight",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "surviveware-small-first-aid",
    "imageUrl": "",
    "priceMin": "$35",
    "priceMax": "$35",
    "category": "home",
    "badge": "🏠",
    "name": {
      "en": "Surviveware Small First Aid",
      "ja": "Surviveware Small First Aid"
    },
    "description": {
      "en": "Surviveware's Small kit at $35 earns its place with labeled interior pouches that make finding the right item fast under stress — a detail most competitors skip.",
      "ja": "Surviveware's Small kit at $35 earns its place with labeled interior pouches that make finding the right item fast under stress — a detail most competitors skip."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Surviveware+Small+First+Aid",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "swiss-safe-2-in-1-first-aid",
    "imageUrl": "",
    "priceMin": "$27",
    "priceMax": "$27",
    "category": "home",
    "badge": "🏠",
    "name": {
      "en": "Swiss Safe 2 In 1 First Aid",
      "ja": "Swiss Safe 2 In 1 First Aid"
    },
    "description": {
      "en": "Swiss Safe's 200-piece kit at $27 delivers remarkable coverage for the price — including items like a CPR mask and emergency blanket that more expensive kits skip.",
      "ja": "Swiss Safe's 200-piece kit at $27 delivers remarkable coverage for the price — including items like a CPR mask and emergency blanket that more expensive kits skip."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Swiss+Safe+2+In+1+First+Aid",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "first-aid-only-299-piece",
    "imageUrl": "",
    "priceMin": "$29",
    "priceMax": "$29",
    "category": "home",
    "badge": "🏠",
    "name": {
      "en": "First Aid Only 299 Piece",
      "ja": "First Aid Only 299 Piece"
    },
    "description": {
      "en": "First Aid Only's 299-piece kit at $29 is the right answer when you're packing for a family trip or group travel where volume matters more than weight.",
      "ja": "First Aid Only's 299-piece kit at $29 is the right answer when you're packing for a family trip or group travel where volume matters more than weight."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=First+Aid+Only+299+Piece",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "me-you-health-travel-kit",
    "imageUrl": "",
    "priceMin": "$55",
    "priceMax": "$55",
    "category": "home",
    "badge": "🏠",
    "name": {
      "en": "Me You Health Travel Kit",
      "ja": "Me You Health Travel Kit"
    },
    "description": {
      "en": "Me You Health's Premium Travel Kit at $55 targets the quality-over-quantity traveler with pharmaceutical-grade supplies, a stylish organizing case, and thoughtful additions like blister prevention tape pre-cut for heels ",
      "ja": "Me You Health's Premium Travel Kit at $55 targets the quality-over-quantity traveler with pharmaceutical-grade supplies, a stylish organizing case, and thoughtful additions like blister prevention tape pre-cut for heels "
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Me+You+Health+Travel+Kit",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "abus-tsa-combination-lock",
    "imageUrl": "",
    "priceMin": "$12",
    "priceMax": "$12",
    "category": "home",
    "badge": "🏠",
    "name": {
      "en": "ABUS TSA Combination Lock",
      "ja": "ABUS TSA Combination Lock"
    },
    "description": {
      "en": "ABUS's 146TSA/40 strikes the ideal balance of build quality, ease of use, and price for a travel lock.",
      "ja": "ABUS's 146TSA/40 strikes the ideal balance of build quality, ease of use, and price for a travel lock."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=ABUS+TSA+Combination+Lock",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "master-lock-4693d",
    "imageUrl": "",
    "priceMin": "$10",
    "priceMax": "$10",
    "category": "home",
    "badge": "🏠",
    "name": {
      "en": "Master Lock 4693d",
      "ja": "Master Lock 4693d"
    },
    "description": {
      "en": "Master Lock's 4693D at $10 is the utilitarian choice — widely available worldwide (so replaceable if lost), TSA-approved, and from a brand with decades of lock manufacturing behind it.",
      "ja": "Master Lock's 4693D at $10 is the utilitarian choice — widely available worldwide (so replaceable if lost), TSA-approved, and from a brand with decades of lock manufacturing behind it."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Master+Lock+4693d",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "pacsafe-prosafe-750",
    "imageUrl": "",
    "priceMin": "",
    "priceMax": "",
    "category": "home",
    "badge": "🏠",
    "name": {
      "en": "Pacsafe Prosafe 750",
      "ja": "Pacsafe Prosafe 750"
    },
    "description": {
      "en": "Pacsafe's Prosafe 750 is a TSA-approved cable lock rather than a standard padlock — the 75cm braided steel cable lets you loop through multiple zipper pulls, secure a bag to fixed furniture, or lock through hostel locker",
      "ja": "Pacsafe's Prosafe 750 is a TSA-approved cable lock rather than a standard padlock — the 75cm braided steel cable lets you loop through multiple zipper pulls, secure a bag to fixed furniture, or lock through hostel locker"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Pacsafe+Prosafe+750",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "tsa-approved-wordlock",
    "imageUrl": "",
    "priceMin": "$9",
    "priceMax": "$9",
    "category": "home",
    "badge": "🏠",
    "name": {
      "en": "TSA Approved Wordlock",
      "ja": "TSA Approved Wordlock"
    },
    "description": {
      "en": "Wordlock uses letters instead of numbers, letting you set a memorable word as your combination instead of a random 4-digit string.",
      "ja": "Wordlock uses letters instead of numbers, letting you set a memorable word as your combination instead of a random 4-digit string."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=TSA+Approved+Wordlock",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "retrospec-tsa-lock",
    "imageUrl": "",
    "priceMin": "$15",
    "priceMax": "$15",
    "category": "home",
    "badge": "🏠",
    "name": {
      "en": "Retrospec TSA Lock",
      "ja": "Retrospec TSA Lock"
    },
    "description": {
      "en": "Retrospec's TSA combination lock at $15 offers a directional combination wheel instead of numbered dials — you set a sequence of up, down, left, right movements that is harder to shoulder-surf than a visible number combi",
      "ja": "Retrospec's TSA combination lock at $15 offers a directional combination wheel instead of numbered dials — you set a sequence of up, down, left, right movements that is harder to shoulder-surf than a visible number combi"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Retrospec+TSA+Lock",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "sea-to-summit-big-river-20l",
    "imageUrl": "",
    "priceMin": "$28",
    "priceMax": "$28",
    "category": "fitness",
    "badge": "🏋️",
    "name": {
      "en": "Sea To Summit Big River 20l",
      "ja": "Sea To Summit Big River 20l"
    },
    "description": {
      "en": "Sea to Summit's Big River Dry Bag at $28 earns its position with welded TPU laminate construction that genuinely keeps water out even when submerged.",
      "ja": "Sea to Summit's Big River Dry Bag at $28 earns its position with welded TPU laminate construction that genuinely keeps water out even when submerged."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Sea+To+Summit+Big+River+20l",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "earth-pak-waterproof-bag",
    "imageUrl": "",
    "priceMin": "$22",
    "priceMax": "$22",
    "category": "fitness",
    "badge": "🏋️",
    "name": {
      "en": "Earth Pak Waterproof Bag",
      "ja": "Earth Pak Waterproof Bag"
    },
    "description": {
      "en": "Earth Pak's 20L bag at $22 is the best-value waterproof bag available — welded seams, a durable exterior, and a shoulder strap that makes it usable as a standalone bag rather than just stuffed inside another pack.",
      "ja": "Earth Pak's 20L bag at $22 is the best-value waterproof bag available — welded seams, a durable exterior, and a shoulder strap that makes it usable as a standalone bag rather than just stuffed inside another pack."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Earth+Pak+Waterproof+Bag",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "ortlieb-drybag-ps10",
    "imageUrl": "",
    "priceMin": "$32",
    "priceMax": "$32",
    "category": "fitness",
    "badge": "🏋️",
    "name": {
      "en": "Ortlieb Drybag Ps10",
      "ja": "Ortlieb Drybag Ps10"
    },
    "description": {
      "en": "Ortlieb's PS10 represents the technical ceiling of consumer dry bag construction — welded seams, PD380R polyester fabric, and a closure system refined over decades of outdoor use.",
      "ja": "Ortlieb's PS10 represents the technical ceiling of consumer dry bag construction — welded seams, PD380R polyester fabric, and a closure system refined over decades of outdoor use."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Ortlieb+Drybag+Ps10",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "sealline-discovery-dry-bag",
    "imageUrl": "",
    "priceMin": "$29",
    "priceMax": "$29",
    "category": "fitness",
    "badge": "🏋️",
    "name": {
      "en": "Sealline Discovery Dry Bag",
      "ja": "Sealline Discovery Dry Bag"
    },
    "description": {
      "en": "SealLine's Discovery series uses welded RF-welded seams and 200D nylon that handles abrasion better than thinner bag materials.",
      "ja": "SealLine's Discovery series uses welded RF-welded seams and 200D nylon that handles abrasion better than thinner bag materials."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Sealline+Discovery+Dry+Bag",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "outdoor-research-ultralight-dry-sack",
    "imageUrl": "",
    "priceMin": "$20",
    "priceMax": "$20",
    "category": "fitness",
    "badge": "🏋️",
    "name": {
      "en": "Outdoor Research Ultralight Dry Sack",
      "ja": "Outdoor Research Ultralight Dry Sack"
    },
    "description": {
      "en": "Outdoor Research's Ultralight Dry Sack at $20 and just 40g for the 20L version is for weight-obsessed backpackers who want the lightest possible splash protection for their sleeping bag.",
      "ja": "Outdoor Research's Ultralight Dry Sack at $20 and just 40g for the 20L version is for weight-obsessed backpackers who want the lightest possible splash protection for their sleeping bag."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Outdoor+Research+Ultralight+Dry+Sack",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  }
] as unknown as AffiliateOffer[];
