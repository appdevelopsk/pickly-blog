import type { ArticleCategory } from "@/lib/articles/types";

/**
 * カテゴリ直下のサブカテゴリ(価格.com 型の「大カテゴリ→品目」の中間層)。
 *
 * ★2026-09-13 の初版は slug をハイフン分割した語の頻度集計で品目を決めようとし、
 *   「pets/parenting/finance の3カテゴリしか作れない」と結論した。これは誤りで、
 *   **手法の限界をデータの限界と取り違えていた**。2026-09-14 に en 790本の slug を
 *   目視で全件読み直したところ、全10カテゴリに品目軸は実在した。頻度集計が
 *   失敗したのは次の3つが原因:
 *
 *   1. 語割れ — food の調理家電は共通語を持たない。`maker` で拾えるのは waffle /
 *      pasta / popcorn / ice-cream / smoothie / ice の6件だけで、deep-fryer,
 *      juicer, blender, instant-pot, pressure-cooker, food-processor, microwave,
 *      sous-vide, standing-mixer, bread-machine, vacuum-sealer は全部頻度1。
 *   2. 多義語 — home の最頻語 `air`(7) は air-fryer(調理) / air-mattress(寝具) /
 *      air-purifier(空調) が同居する。頻度だけ見ると最有力に見えるので特に危ない。
 *   3. 断片語 — fitness の `bar` / `up` / `pull` は pull-up-bar の分解片。
 *
 *   そのため **キーワード方式をやめ、slug の完全一致リストで持つ**。品目は人間が
 *   読んで決めるものであって、語の頻度から機械的に出てくるものではない。
 *
 * ★全件を押し込まない。どの品目にも属さない記事は親カテゴリ直下に残る(正常)。
 * ★軸を足す前に必ず投入率を実測すること(rating を型宣言だけで「ある」と誤認した前科)。
 */

export interface SubcategoryConfig {
  slug: string;
  /** 属する大カテゴリ。tag と違い複数に跨がらせない。 */
  parent: ArticleCategory;
  /** 英語の既定ラベル。翻訳は messages の subcategory.<slug> があればそちらが優先。 */
  label: string;
  /**
   * この品目に属する記事 slug の完全一致リスト。
   * キーワード方式だと上のコメントの1〜3で必ず誤爆するので使わない。
   */
  slugs: string[];
}

export const SUBCATEGORIES: SubcategoryConfig[] = [
  // ══ food (121件) ═══════════════════════════════════════════════════════
  {
    slug: "kitchen-appliances", parent: "food", label: "Kitchen Appliances",
    slugs: [
      "best-air-fryer-2026", "best-blender-2026", "best-bread-machine-2026",
      "best-deep-fryer-2026", "best-egg-cooker-2026", "best-electric-griddle-2026",
      "best-electric-grill-2026", "best-electric-kettle-2026", "best-food-dehydrator-2026",
      "best-food-processor-2026", "best-hand-mixer-2026", "best-ice-cream-maker-2026",
      "best-ice-maker-2026", "best-immersion-blender-2026", "best-induction-cooktop-2026",
      "best-instant-pot-2026", "best-juicer-2026", "best-meat-grinder-2026",
      "best-microwave-2026", "best-milk-frother-2026", "best-pasta-maker-2026",
      "best-popcorn-maker-2026", "best-pressure-cooker-2026", "best-rice-cooker-2026",
      "best-slow-cooker-2026", "best-slow-juicer-2026", "best-smoothie-maker-2026",
      "best-sous-vide-2026", "best-standing-mixer-2026", "best-toaster-2026",
      "best-toaster-oven-2026", "best-vacuum-sealer-2026", "best-waffle-maker-2026",
    ],
  },
  {
    slug: "cookware", parent: "food", label: "Cookware & Utensils",
    slugs: [
      "best-baking-sheet-2026", "best-bento-box-2026", "best-cast-iron-pan-2026",
      "best-cast-iron-skillet-2026", "best-cookware-set-2026", "best-cutting-board-2026",
      "best-dish-rack-2026", "best-dutch-oven-2026", "best-electric-wine-opener-2026",
      "best-food-storage-container-2026", "best-kitchen-scale-2026", "best-knife-set-2026",
      "best-knife-sharpener-2026", "best-mandoline-slicer-2026", "best-meal-prep-containers-2026",
      "best-meat-thermometer-2026", "best-mixing-bowls-2026", "best-nonstick-pan-2026",
      "best-pizza-stone-2026", "best-salad-spinner-2026", "best-stockpot-2026",
      "best-wok-2026",
    ],
  },
  {
    slug: "coffee-tea", parent: "food", label: "Coffee & Tea",
    slugs: [
      "best-aeropress-2026", "best-black-tea-2026", "best-burr-grinder-under-100-2026",
      "best-chai-tea-2026", "best-chamomile-tea-2026", "best-chemex-2026",
      "best-coffee-grinder-2026", "best-coffee-maker-2026", "best-coffee-mug-2026",
      "best-coffee-scale-2026", "best-coffee-subscription-2026", "best-cold-brew-coffee-maker-2026",
      "best-cold-brew-tea-2026", "best-espresso-machine-2026", "best-espresso-machine-under-200-2026",
      "best-french-press-2026", "best-ginger-tea-2026", "best-green-tea-2026",
      "best-hario-v60-2026", "best-hibiscus-tea-2026", "best-kalita-wave-2026",
      "best-lemon-ginger-tea-2026", "best-matcha-2026", "best-matcha-powder-2026",
      "best-moka-pot-2026", "best-mushroom-coffee-2026", "best-oolong-tea-2026",
      "best-peppermint-tea-2026", "best-pour-over-coffee-kit-2026", "best-rooibos-tea-2026",
      "best-siphon-coffee-maker-2026", "best-tea-kettle-2026", "best-turkish-coffee-maker-2026",
      "best-vietnamese-coffee-2026", "best-white-tea-2026", "best-yerba-mate-2026",
      "best-yerba-mate-loose-leaf-2026", "nespresso-vertuo-vs-original-2026",
    ],
  },
  {
    slug: "groceries", parent: "food", label: "Food & Drink",
    slugs: [
      "best-almond-butter-2026", "best-apple-cider-vinegar-2026", "best-bone-broth-2026",
      "best-coconut-oil-2026", "best-coconut-water-2026", "best-dark-chocolate-2026",
      "best-electrolyte-drink-2026", "best-energy-bar-2026", "best-ghee-2026",
      "best-granola-2026", "best-greek-yogurt-2026", "best-honey-2026",
      "best-hot-chocolate-mix-2026", "best-hot-sauce-2026", "best-keto-snacks-2026",
      "best-kombucha-2026", "best-meal-kit-delivery-2026", "best-nut-butter-2026",
      "best-oat-milk-2026", "best-oat-milk-for-coffee-2026", "best-olive-oil-2026",
      "best-overnight-oats-2026", "best-plant-based-milk-2026", "best-protein-bar-2026",
      "best-protein-pancake-mix-2026", "best-snack-subscription-box-2026",
      "best-sparkling-water-2026", "best-wine-subscription-2026",
    ],
  },
  {
    slug: "supplements", parent: "food", label: "Supplements",
    slugs: [
      "best-bcaa-supplement-2026", "best-collagen-supplement-2026", "best-creatine-supplement-2026",
      "best-green-powder-2026", "best-magnesium-supplement-2026", "best-mushroom-supplement-2026",
      "best-omega-3-supplement-2026", "best-plant-based-protein-2026", "best-probiotics-supplement-2026",
      "best-protein-powder-2026", "best-spirulina-supplement-2026", "best-turmeric-supplement-2026",
      "best-vitamin-d-supplement-2026",
      "best-pre-workout-supplement-2026", "best-protein-powder-for-beginners-2026",
    ],
  },

  // ══ home (113件) ═══════════════════════════════════════════════════════
  {
    slug: "bedding", parent: "home", label: "Bedding & Sleep",
    slugs: [
      "best-air-mattress-2026", "best-bamboo-pillow-2026", "best-bed-sheets-2026",
      "best-comforter-2026", "best-cooling-pillow-2026", "best-electric-blanket-2026",
      "best-linen-sheets-2026", "best-mattress-2026", "best-mattress-for-back-pain-2026",
      "best-mattress-protector-2026", "best-mattress-topper-2026", "best-memory-foam-pillow-2026",
      "best-sleep-mask-2026", "best-throw-blanket-2026", "best-weighted-blanket-2026",
      "best-blackout-curtains-2026",
      "best-travel-pillow-2026",
    ],
  },
  {
    slug: "furniture", parent: "home", label: "Furniture",
    slugs: [
      "best-accent-chair-2026", "best-area-rug-2026", "best-bed-frame-2026",
      "best-bookshelf-2026", "best-coffee-table-2026", "best-console-table-2026",
      "best-decorative-pillows-2026", "best-entryway-bench-2026", "best-ergonomic-footrest-2026",
      "best-floor-lamp-2026", "best-nightstand-2026", "best-office-chair-2026",
      "best-runner-rug-2026", "best-sofa-2026", "best-storage-ottoman-2026",
      "best-table-lamp-2026", "best-tv-stand-2026",
      "best-standing-desk-2026", "best-desk-lamp-2026",
      "best-soundbar-2026",
    ],
  },
  {
    slug: "cleaning-laundry", parent: "home", label: "Cleaning & Laundry",
    slugs: [
      "best-clothes-steamer-2026", "best-cordless-vacuum-2026", "best-drying-rack-2026",
      "best-handheld-vacuum-2026", "best-ironing-board-2026", "best-laundry-detergent-2026",
      "best-laundry-hamper-2026", "best-robot-mop-2026", "best-robot-vacuum-2026",
      "best-steam-mop-2026", "best-trash-can-2026",
    ],
  },
  {
    slug: "climate", parent: "home", label: "Heating & Cooling",
    slugs: [
      "best-air-conditioner-2026", "best-air-purifier-2026", "best-air-quality-monitor-2026",
      "best-dehumidifier-2026", "best-electric-fireplace-2026", "best-evaporative-cooler-2026",
      "best-humidifier-2026", "best-portable-air-conditioner-2026", "best-portable-fan-2026",
      "best-space-heater-2026", "best-tower-fan-2026", "best-window-air-conditioner-2026",
      "best-aroma-diffuser-2026",
      "best-candle-2026",
      "best-smart-thermostat-2026",
    ],
  },
  {
    slug: "storage", parent: "home", label: "Storage & Organization",
    slugs: [
      "best-bathroom-organizer-2026", "best-closet-organizer-2026", "best-desk-organizer-2026",
      "best-drawer-organizer-2026", "best-shoe-rack-2026", "best-under-sink-organizer-2026",
      "best-wine-rack-2026",
      "best-reusable-water-bottle-2026",
      "best-smart-lock-2026",
      "best-video-doorbell-2026",
      "best-water-filter-pitcher-2026",
    ],
  },
  {
    slug: "bath", parent: "home", label: "Bath & Toilet",
    slugs: [
      "best-bath-mat-2026", "best-bath-towel-2026", "best-bath-towels-2026",
      "best-bathroom-scale-2026", "best-bidet-seat-2026", "best-bidet-toilet-seat-2026",
      "best-shower-caddy-2026", "best-shower-curtain-2026", "best-shower-head-2026",
      "best-soap-dispenser-2026", "best-toilet-brush-2026",
    ],
  },
  {
    slug: "garden", parent: "home", label: "Garden & Outdoor",
    slugs: [
      "best-composting-bin-2026", "best-cordless-lawn-mower-2026", "best-electric-leaf-blower-2026",
      "best-garden-hose-2026", "best-grow-light-2026", "best-hedge-trimmer-2026",
      "best-indoor-plant-2026", "best-plant-pot-2026", "best-pressure-washer-2026",
      "best-snow-blower-2026", "best-weed-killer-2026",
    ],
  },

  // ══ fitness (118件) ════════════════════════════════════════════════════
  {
    slug: "strength-equipment", parent: "fitness", label: "Strength Equipment",
    slugs: [
      "best-ab-roller-2026", "best-adjustable-dumbbell-set-2026", "best-adjustable-kettlebell-2026",
      "best-barbell-2026", "best-battle-rope-2026", "best-dip-bar-2026",
      "best-dumbbell-rack-2026", "best-dumbbells-2026", "best-ez-curl-bar-2026",
      "best-gymnastic-rings-2026", "best-kettlebell-2026", "best-medicine-ball-2026",
      "best-parallette-bars-2026", "best-plyometric-box-2026", "best-power-rack-2026",
      "best-preacher-curl-bench-2026", "best-pull-up-bar-2026", "best-pull-up-bar-ceiling-mounted-2026",
      "best-pull-up-bar-doorframe-2026", "best-pull-up-bar-freestanding-2026", "best-push-up-board-2026",
      "best-sandbag-training-2026", "best-squat-rack-2026", "best-suspension-trainer-2026",
      "best-trap-bar-2026", "best-weight-bench-2026", "best-weight-plates-2026",
      "best-home-gym-flooring-2026",
      "best-home-gym-under-500-2026",
    ],
  },
  {
    slug: "cardio-machines", parent: "fitness", label: "Cardio & Gym Machines",
    slugs: [
      "best-assault-bike-2026", "best-cable-machine-2026", "best-elliptical-machine-2026",
      "best-glute-machine-2026", "best-hack-squat-machine-2026", "best-hip-thrust-machine-2026",
      "best-lat-pulldown-machine-2026", "best-leg-press-machine-2026", "best-rowing-machine-2026",
      "best-smith-machine-2026", "best-spin-bike-2026", "best-stair-stepper-2026",
      "best-stationary-bike-2026", "best-treadmill-2026",
    ],
  },
  {
    slug: "athletic-shoes", parent: "fitness", label: "Athletic Shoes",
    slugs: [
      "best-basketball-shoes-2026", "best-basketball-shoes-ankle-support-2026",
      "best-basketball-shoes-for-beginners-2026", "best-basketball-shoes-for-traction-2026",
      "best-climbing-shoes-2026", "best-crossfit-shoes-2026", "best-cushioned-basketball-shoes-2026",
      "best-hiking-boots-2026", "best-running-shoes-2026", "best-running-shoes-for-flat-feet-2026",
      "best-soccer-cleats-2026", "best-trail-running-shoes-2026", "best-weightlifting-shoes-2026",
      "best-wrestling-shoes-2026",
    ],
  },
  {
    slug: "training-gear", parent: "fitness", label: "Support & Lifting Gear",
    slugs: [
      "best-back-support-brace-2026", "best-boxing-gloves-2026", "best-compression-leggings-2026",
      "best-compression-socks-2026", "best-dip-belt-2026", "best-grip-strength-trainer-2026",
      "best-gymnastics-grips-2026", "best-knee-sleeves-for-squats-2026", "best-lifting-belt-2026",
      "best-posture-corrector-2026", "best-sports-bra-2026", "best-volleyball-knee-pads-2026",
      "best-waist-trainer-2026", "best-weight-vest-2026", "best-weightlifting-belt-2026",
      "best-workout-gloves-2026", "best-wrist-wraps-for-lifting-2026",
      "best-gym-bag-2026",
      "best-protein-shaker-2026",
      "best-running-belt-2026",
    ],
  },
  {
    slug: "yoga-recovery", parent: "fitness", label: "Yoga & Recovery",
    slugs: [
      "best-balance-board-2026", "best-foam-roller-2026", "best-massage-gun-2026",
      "best-muscle-roller-stick-2026", "best-pilates-ring-2026", "best-stability-ball-2026",
      "best-yoga-block-2026", "best-yoga-mat-2026", "best-yoga-strap-2026",
      "best-yoga-wheel-2026", "best-glute-resistance-bands-2026", "best-resistance-band-handles-2026",
      "best-resistance-bands-2026", "best-resistance-bands-set-2026",
    ],
  },
  {
    slug: "sports-gear", parent: "fitness", label: "Sports Gear",
    slugs: [
      "best-agility-ladder-2026", "best-badminton-racket-2026", "best-cycling-helmet-2026",
      "best-golf-gloves-2026", "best-golf-rangefinder-2026", "best-hiking-poles-2026",
      "best-jump-rope-2026", "best-jump-rope-for-crossfit-2026", "best-lacrosse-stick-2026",
      "best-pickleball-paddle-2026", "best-punching-bag-2026", "best-ski-goggles-2026",
      "best-snorkeling-mask-2026", "best-speed-bag-2026", "best-speed-rope-2026",
      "best-swim-cap-2026", "best-swim-fins-2026", "best-swim-goggles-2026",
      "best-tennis-racket-2026", "best-trampoline-2026",
      "best-insulated-water-bottle-2026",
      "best-water-bottle-2026",
    ],
  },

  // ══ tech (81件) ════════════════════════════════════════════════════════
  // network-equipment(3件)は単独では成立しないので computer-peripherals に含めた。
  {
    slug: "computer-peripherals", parent: "tech", label: "Computer Peripherals",
    slugs: [
      "best-desk-pad-2026", "best-docking-station-2026", "best-document-scanner-2026",
      "best-ergonomic-mouse-2026", "best-external-ssd-2026", "best-graphics-tablet-2026",
      "best-label-maker-2026", "best-laptop-sleeve-2026", "best-laptop-stand-2026",
      "best-mechanical-keyboard-2026", "best-microsd-card-2026", "best-monitor-2026",
      "best-monitor-stand-2026", "best-portable-monitor-2026", "best-tablet-stand-2026",
      "best-usb-hub-2026", "best-webcam-2026", "best-wireless-keyboard-2026",
      "best-mesh-wifi-system-2026", "best-wifi-extender-2026", "best-wifi-router-2026",
    ],
  },
  {
    slug: "gaming-gear", parent: "tech", label: "Gaming Gear",
    slugs: [
      "best-gaming-chair-2026", "best-gaming-headset-2026", "best-gaming-keyboard-2026",
      "best-gaming-monitor-2026", "best-gaming-mouse-2026",
    ],
  },
  {
    slug: "audio-video", parent: "tech", label: "Audio & Video",
    slugs: [
      "best-action-camera-2026", "best-instant-camera-2026", "best-noise-cancelling-headphones-2026",
      "best-portable-speaker-2026", "best-projector-2026", "best-ring-light-2026",
      "best-streaming-device-2026", "best-true-wireless-earbuds-2026", "best-usb-microphone-2026",
    ],
  },
  {
    slug: "charging-power", parent: "tech", label: "Chargers & Power",
    slugs: [
      "best-portable-charger-2026", "best-portable-power-station-2026", "best-power-bank-2026",
      "best-travel-adapter-2026", "best-usb-c-charger-2026", "best-wireless-charger-2026",
    ],
  },
  {
    slug: "smart-devices", parent: "tech", label: "Smart Home & Wearables",
    slugs: [
      "best-bluetooth-tracker-2026", "best-e-reader-2026", "best-security-camera-2026",
      "best-smart-display-2026", "best-smart-home-hub-2026", "best-smart-ring-2026",
      "best-smart-speaker-2026", "best-smart-watch-2026", "best-tablet-2026",
      "best-fitness-tracker-2026", "best-running-watch-2026", "best-smart-scale-2026",
    ],
  },
  {
    slug: "software-services", parent: "tech", label: "Software & Services",
    slugs: [
      "best-accounting-software-2026", "best-antivirus-software-2026", "best-cloud-hosting-2026",
      "best-crm-software-2026", "best-domain-registrar-2026", "best-ecommerce-platform-2026",
      "best-email-marketing-platform-2026", "best-hr-software-2026", "best-password-manager-2026",
      "best-payroll-software-2026", "best-project-management-software-2026", "best-rental-server-jp-2026",
      "best-video-conferencing-software-2026", "best-vpn-2026", "best-vps-hosting-2026",
      "best-website-builder-2026", "best-wordpress-hosting-2026", "conoha-wing-review-2026",
    ],
  },
  {
    slug: "car-accessories", parent: "tech", label: "Car & Vehicle Gear",
    slugs: [
      "best-bluetooth-car-adapter-2026", "best-car-phone-mount-2026", "best-car-vacuum-2026",
      "best-dash-cam-2026", "best-electric-scooter-2026", "best-motorcycle-helmet-2026",
      "best-obd2-scanner-2026", "best-portable-jump-starter-2026", "best-tire-inflator-2026",
    ],
  },

  // ══ beauty (67件) ══════════════════════════════════════════════════════
  // makeup-tools(3件)は makeup に、grooming(4件)は beauty-devices に統合。
  {
    slug: "makeup", parent: "beauty", label: "Makeup",
    slugs: [
      "best-bb-cream-2026", "best-blush-2026", "best-bronzer-2026",
      "best-brow-gel-2026", "best-concealer-2026", "best-cream-blush-2026",
      "best-eyebrow-pencil-2026", "best-eyeshadow-palette-2026", "best-foundation-2026",
      "best-highlighter-makeup-2026", "best-lip-gloss-2026", "best-lip-liner-2026",
      "best-lipstick-2026", "best-mascara-2026", "best-nail-polish-2026",
      "best-self-tanner-2026", "best-setting-spray-2026", "best-makeup-brushes-2026",
      "best-makeup-mirror-2026", "best-makeup-sponge-2026",
    ],
  },
  {
    slug: "skincare", parent: "beauty", label: "Skincare",
    slugs: [
      "best-anti-aging-cream-2026", "best-body-lotion-2026", "best-body-scrub-2026",
      "best-clay-mask-2026", "best-eye-cream-2026", "best-eye-patches-2026",
      "best-face-mist-2026", "best-face-wash-2026", "best-facial-cleanser-2026",
      "best-hand-cream-2026", "best-hyaluronic-acid-serum-2026", "best-lip-balm-2026",
      "best-moisturizer-for-dry-skin-2026", "best-niacinamide-serum-2026", "best-pimple-patches-2026",
      "best-retinol-serum-2026", "best-sheet-mask-2026", "best-sunscreen-2026",
      "best-toner-2026", "best-vitamin-c-serum-2026",
      "best-skin-care-routine-2026",
    ],
  },
  {
    slug: "haircare", parent: "beauty", label: "Hair Care",
    slugs: [
      "best-dry-shampoo-2026", "best-hair-growth-serum-2026", "best-hair-mask-2026",
      "best-hair-oil-2026", "best-shampoo-2026",
    ],
  },
  {
    slug: "hair-styling-tools", parent: "beauty", label: "Hair Styling Tools",
    slugs: [
      "best-curling-iron-2026", "best-hair-care-tools-2026", "best-hair-clippers-2026",
      "best-hair-dryer-2026", "best-hair-dryer-brush-2026", "best-hair-straightener-2026",
    ],
  },
  {
    slug: "beauty-devices", parent: "beauty", label: "Beauty Devices & Grooming",
    slugs: [
      "best-face-roller-2026", "best-facial-steamer-2026", "best-gua-sha-2026",
      "best-ipl-hair-removal-2026", "best-jade-roller-2026", "best-led-face-mask-2026",
      "best-skincare-fridge-2026", "best-beard-trimmer-2026", "best-electric-shaver-2026",
      "best-electric-toothbrush-2026", "best-water-flosser-2026",
      "best-perfume-for-men-2026",
      "best-perfume-for-women-2026",
    ],
  },

  // ══ fashion (63件) ═════════════════════════════════════════════════════
  // dresses(4件)は単独で成立しないので tops-dresses に統合。
  {
    slug: "outerwear", parent: "fashion", label: "Jackets & Coats",
    slugs: [
      "best-blazer-2026", "best-bomber-jacket-2026", "best-denim-jacket-2026",
      "best-down-jacket-2026", "best-fleece-jacket-2026", "best-leather-jacket-2026",
      "best-puffer-jacket-2026", "best-rain-jacket-2026", "best-trench-coat-2026",
      "best-winter-coat-women-2026", "best-wool-coat-2026",
      "best-motorcycle-jacket-2026", "best-travel-jacket-2026", "best-travel-rain-jacket-2026",
    ],
  },
  {
    slug: "shoes", parent: "fashion", label: "Shoes & Boots",
    slugs: [
      "best-ankle-boots-2026", "best-ballet-flats-2026", "best-chelsea-boots-2026",
      "best-everyday-sneakers-2026", "best-leather-loafers-2026", "best-mens-sneakers-2026",
      "best-rain-boots-2026", "best-slippers-2026", "best-winter-boots-2026",
      "best-womens-sneakers-2026", "best-sneaker-cleaning-kit-2026",
      "best-travel-shoes-2026",
    ],
  },
  {
    slug: "bags-wallets", parent: "fashion", label: "Bags & Wallets",
    slugs: [
      "best-crossbody-bag-2026", "best-leather-backpack-2026", "best-leather-tote-bag-2026",
      "best-shoulder-bag-2026", "best-statement-handbag-2026", "best-mens-leather-wallet-2026",
      "best-minimalist-wallet-2026",
      "best-backpack-2026",
    ],
  },
  {
    slug: "tops-dresses", parent: "fashion", label: "Tops & Dresses",
    slugs: [
      "best-cashmere-sweater-2026", "best-flannel-shirt-2026", "best-linen-shirt-2026",
      "best-mens-dress-shirt-2026", "best-merino-wool-tshirt-2026", "best-sweatshirt-2026",
      "best-knit-cardigan-2026", "best-mens-suit-2026", "best-cocktail-dress-2026",
      "best-maxi-dress-2026", "best-summer-dress-2026", "best-wrap-dress-2026",
      "best-bikini-2026",
      "best-one-piece-swimsuit-2026",
      "best-silk-pajamas-2026",
    ],
  },
  {
    slug: "bottoms", parent: "fashion", label: "Pants & Jeans",
    slugs: [
      "best-athletic-shorts-men-2026", "best-jeans-for-women-2026", "best-jogger-pants-2026",
      "best-mens-chinos-2026", "best-mens-jeans-2026", "best-running-leggings-2026",
      "best-wide-leg-pants-2026",
    ],
  },
  {
    slug: "watches-jewelry", parent: "fashion", label: "Watches & Jewelry",
    slugs: [
      "best-hoop-earrings-2026", "best-mens-watch-2026", "best-pearl-earrings-2026",
      "best-quartz-watch-2026", "best-watch-for-women-2026",
    ],
  },
  {
    slug: "accessories", parent: "fashion", label: "Hats, Scarves & Gloves",
    slugs: [
      "best-baseball-cap-2026", "best-leather-belt-2026", "best-leather-gloves-2026",
      "best-polarized-sunglasses-2026", "best-silk-scarf-2026", "best-sun-hat-2026",
      "best-winter-gloves-2026",
      "best-sunglasses-2026",
    ],
  },

  // ══ travel (61件) ══════════════════════════════════════════════════════
  {
    slug: "luggage", parent: "travel", label: "Suitcases & Luggage",
    slugs: [
      "best-carry-on-luggage-2026", "best-checked-luggage-2026", "best-luggage-2026",
      "best-rolling-duffel-bag-2026", "best-weekender-bag-2026", "best-travel-garment-bag-2026",
    ],
  },
  {
    slug: "travel-backpacks", parent: "travel", label: "Travel Backpacks",
    slugs: [
      "best-anti-theft-backpack-2026", "best-camera-backpack-2026", "best-carry-on-backpack-women-2026",
      "best-hiking-daypack-2026", "best-travel-backpack-2026", "best-travel-day-pack-2026",
      "best-travel-fanny-pack-2026",
    ],
  },
  {
    slug: "packing-organizers", parent: "travel", label: "Packing & Organizers",
    slugs: [
      "best-packing-cubes-2026", "best-packing-belt-bag-travel-2026", "best-toiletry-bag-2026",
      "best-travel-organizer-2026", "best-travel-document-organizer-2026", "best-travel-jewelry-case-2026",
      "best-travel-makeup-bag-2026", "best-travel-shoe-bag-2026", "best-travel-laundry-bag-2026",
      "best-luggage-scale-2026",
    ],
  },
  {
    slug: "travel-comfort", parent: "travel", label: "In-Flight Comfort",
    slugs: [
      "best-neck-pillow-2026", "best-travel-pillow-memory-foam-2026", "best-travel-blanket-2026",
      "best-travel-sleep-mask-2026", "best-travel-compression-socks-2026",
      "best-noise-cancelling-earbuds-travel-2026",
    ],
  },
  {
    slug: "travel-gadgets", parent: "travel", label: "Travel Electronics",
    slugs: [
      "best-international-data-plan-2026", "best-portable-charger-travel-2026",
      "best-portable-wifi-router-travel-2026", "best-travel-power-strip-2026",
      "best-travel-camera-2026", "best-underwater-camera-2026", "best-travel-tripod-2026",
      "best-travel-binoculars-2026", "best-travel-satellite-communicator-2026",
      "best-travel-hair-dryer-2026",
    ],
  },
  {
    slug: "travel-security", parent: "travel", label: "Passport & Security",
    slugs: [
      "best-passport-holder-2026", "best-rfid-passport-wallet-2026", "best-travel-wallet-2026",
      "best-travel-lock-2026", "best-money-belt-2026",
    ],
  },
  {
    slug: "travel-essentials", parent: "travel", label: "Travel Essentials",
    slugs: [
      "best-travel-water-bottle-2026", "best-travel-mug-2026", "best-travel-umbrella-2026",
      "best-travel-toothbrush-2026", "best-travel-first-aid-kit-2026", "best-travel-laundry-detergent-2026",
      "best-travel-clothesline-2026", "best-travel-iron-2026", "best-travel-coffee-maker-2026",
      "best-travel-yoga-mat-2026", "best-backpacking-water-filter-2026", "best-waterproof-dry-bag-2026",
      "best-camping-tent-2026",
    ],
  },

  // ══ pets (58件) ════════════════════════════════════════════════════════
  // pet-bowls(4件)は pet-food に、small-pets(3件)は aquarium に統合。
  {
    slug: "dog-supplies", parent: "pets", label: "Dog Supplies",
    slugs: [
      "best-dog-boots-2026", "best-dog-car-seat-2026", "best-dog-cooling-mat-2026",
      "best-dog-crate-2026", "best-dog-gps-tracker-2026", "best-dog-leash-2026",
      "best-dog-life-jacket-2026", "best-dog-paw-cleaner-2026", "best-dog-poop-bags-2026",
      "best-dog-puzzle-toy-2026", "best-dog-raincoat-2026", "best-dog-ramp-2026",
      "best-dog-toys-2026", "best-dog-training-collar-2026", "best-pet-stairs-2026",
      "best-dog-bed-2026", "best-dog-harness-2026",
      "best-pet-carrier-2026",
    ],
  },
  {
    slug: "cat-supplies", parent: "pets", label: "Cat Supplies",
    slugs: [
      "best-automatic-litter-box-2026", "best-cat-carrier-2026", "best-cat-collar-2026",
      "best-cat-harness-2026", "best-cat-litter-mat-2026", "best-cat-scratching-post-2026",
      "best-cat-toys-2026", "best-cat-tree-2026", "best-cat-tunnel-2026",
      "best-cat-water-fountain-2026", "best-cat-window-perch-2026", "best-catio-2026",
      "best-cat-litter-2026",
    ],
  },
  {
    slug: "pet-food", parent: "pets", label: "Food, Treats & Feeding",
    slugs: [
      "best-grain-free-dog-food-2026", "best-puppy-food-2026", "best-senior-cat-food-2026",
      "best-dog-treats-2026", "best-dog-dental-chews-2026", "best-dog-anxiety-supplement-2026",
      "best-dog-joint-supplement-2026", "best-automatic-pet-feeder-2026", "best-dog-bowl-2026",
      "best-elevated-dog-bowl-2026", "best-slow-feeder-dog-bowl-2026", "best-pet-water-fountain-2026",
      "best-cat-food-2026", "best-dog-food-2026",
    ],
  },
  {
    slug: "pet-grooming", parent: "pets", label: "Grooming & Care",
    slugs: [
      "best-dog-brush-2026", "best-dog-nail-clipper-2026", "best-dog-shampoo-2026",
      "best-dog-grooming-table-2026", "best-pet-grooming-clipper-2026", "best-pet-first-aid-kit-2026",
      "best-pet-stain-remover-2026",
      "best-pet-camera-2026",
      "best-pet-id-tag-2026",
      "best-pet-vacuum-2026",
    ],
  },
  {
    slug: "aquarium", parent: "pets", label: "Aquarium & Small Pets",
    slugs: [
      "best-aquarium-kit-2026", "best-aquarium-light-2026", "best-fish-tank-beginners-2026",
      "best-fish-tank-filter-2026", "best-fish-tank-heater-2026", "best-reptile-terrarium-2026",
      "best-bird-cage-2026", "best-hamster-cage-2026", "best-rabbit-cage-2026",
    ],
  },

  // ══ finance (54件) ═════════════════════════════════════════════════════
  // crypto(2件)は investing に統合。
  {
    slug: "insurance", parent: "finance", label: "Insurance",
    slugs: [
      "best-auto-insurance-2026", "best-business-insurance-2026", "best-dental-insurance-2026",
      "best-disability-insurance-2026", "best-home-insurance-2026", "best-life-insurance-2026",
      "best-long-term-care-insurance-2026", "best-medicare-supplement-insurance-2026",
      "best-pet-insurance-2026", "best-renters-insurance-2026", "best-term-life-insurance-2026",
      "best-umbrella-insurance-2026", "best-vision-insurance-2026", "best-travel-insurance-2026",
      "best-travel-insurance-senior-2026",
      "best-identity-theft-protection-2026",
    ],
  },
  {
    slug: "credit-cards", parent: "finance", label: "Credit Cards",
    slugs: [
      "best-balance-transfer-credit-card-2026", "best-business-credit-card-2026",
      "best-cashback-credit-card-2026", "best-rewards-credit-card-2026",
      "best-secured-credit-card-2026", "best-student-credit-card-2026",
      "best-travel-credit-card-2026", "best-prepaid-debit-card-2026",
    ],
  },
  {
    slug: "bank-accounts", parent: "finance", label: "Bank Accounts",
    slugs: [
      "best-cd-account-2026", "best-checking-account-2026", "best-high-yield-savings-account-2026",
      "best-money-market-account-2026", "best-savings-account-2026", "best-health-savings-account-2026",
    ],
  },
  {
    slug: "investing", parent: "finance", label: "Investing & Retirement",
    slugs: [
      "best-401k-rollover-2026", "best-529-plan-2026", "best-bond-etf-2026",
      "best-etf-for-beginners-2026", "best-gold-ira-2026", "best-index-fund-2026",
      "best-investment-platform-2026", "best-robo-advisor-2026", "best-roth-ira-account-2026",
      "best-stock-trading-app-2026", "best-financial-advisor-2026", "best-crypto-exchange-2026",
      "best-cryptocurrency-wallet-2026",
    ],
  },
  {
    slug: "loans", parent: "finance", label: "Loans & Mortgages",
    slugs: [
      "best-debt-consolidation-loan-2026", "best-mortgage-lender-2026", "best-personal-loan-2026",
      "best-small-business-loan-2026", "best-student-loan-refinance-2026",
    ],
  },
  {
    slug: "money-apps", parent: "finance", label: "Money Apps & Software",
    slugs: [
      "best-budgeting-app-2026", "best-money-transfer-app-2026", "best-personal-finance-software-2026",
      "best-tax-prep-service-2026", "best-tax-software-2026", "best-estate-planning-software-2026",
      "best-credit-monitoring-service-2026",
    ],
  },

  // ══ parenting (54件) ═══════════════════════════════════════════════════
  {
    slug: "strollers-car-seats", parent: "parenting", label: "Strollers & Car Seats",
    slugs: [
      "best-baby-stroller-2026", "best-double-stroller-2026", "best-jogging-stroller-2026",
      "best-baby-car-seat-2026", "best-convertible-car-seat-2026", "best-booster-seat-2026",
      "best-baby-carrier-2026", "best-diaper-bag-2026",
    ],
  },
  {
    slug: "feeding", parent: "parenting", label: "Feeding & Formula",
    slugs: [
      "best-baby-bottle-2026", "best-baby-formula-2026", "best-breast-pump-2026",
      "best-nursing-pillow-2026", "best-baby-food-maker-2026", "best-baby-food-pouches-2026",
      "best-baby-food-storage-containers-2026", "best-high-chair-2026", "best-sippy-cup-2026",
      "best-pacifier-2026",
    ],
  },
  {
    slug: "nursery", parent: "parenting", label: "Nursery & Sleep",
    slugs: [
      "best-crib-mattress-2026", "best-changing-table-2026", "best-nursery-glider-2026",
      "best-baby-swaddle-2026", "best-baby-sound-machine-2026", "best-baby-monitor-camera-2026",
      "best-baby-humidifier-2026", "best-toddler-bed-2026", "best-diaper-pail-2026",
      "best-baby-monitor-2026",
      "best-baby-gate-2026",
    ],
  },
  {
    slug: "baby-care", parent: "parenting", label: "Bath & Health Care",
    slugs: [
      "best-baby-bathtub-2026", "best-baby-bath-toys-2026", "best-baby-wipes-2026",
      "best-baby-nail-clipper-2026", "best-baby-thermometer-2026", "best-baby-laundry-detergent-2026",
      "best-kids-toothbrush-2026", "best-kids-sunscreen-2026",
      "best-toddler-potty-2026",
    ],
  },
  {
    slug: "play-gear", parent: "parenting", label: "Play & Activity Gear",
    slugs: [
      "best-baby-bouncer-2026", "best-baby-jumper-2026", "best-baby-playmat-2026",
      "best-baby-rocker-2026", "best-baby-swing-2026", "best-baby-walker-2026",
      "best-baby-teething-toys-2026", "best-toddler-learning-toys-2026",
    ],
  },
  {
    slug: "kids-gear", parent: "parenting", label: "Kids Gear & Outings",
    slugs: [
      "best-kids-backpack-2026", "best-kids-bike-helmet-2026", "best-kids-headphones-2026",
      "best-kids-lunch-box-2026", "best-kids-scooter-2026", "best-kids-tablet-2026",
      "best-kids-water-bottle-2026", "best-toddler-shoes-2026",
      "best-toddler-table-and-chairs-2026",
    ],
  },
];

/** 親カテゴリ → 子の配列。子を持たないカテゴリはキー自体が無い。 */
export const SUBCATEGORIES_BY_PARENT: Partial<Record<ArticleCategory, SubcategoryConfig[]>> =
  SUBCATEGORIES.reduce((acc, s) => {
    (acc[s.parent] ??= []).push(s);
    return acc;
  }, {} as Partial<Record<ArticleCategory, SubcategoryConfig[]>>);

/**
 * 記事 slug がこのサブカテゴリに属するか。
 * 完全一致なので、呼び出し側でカテゴリの一致を先に確かめる必要は本来無いが、
 * 呼び出し側(category/[category]/page.tsx)は既にカテゴリで絞った配列を渡している。
 */
export function matchesSubcategory(articleSlug: string, sub: SubcategoryConfig): boolean {
  return sub.slugs.includes(articleSlug);
}
