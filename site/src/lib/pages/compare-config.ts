export interface ComparisonConfig {
  slug: string;
  title: string;
  description: string;
  slugA: string;
  slugB: string;
}

export const COMPARISONS: ComparisonConfig[] = [
  {
    slug: "air-fryer-vs-instant-pot",
    title: "Air Fryer vs Instant Pot",
    description: "Which multi-cooker wins for everyday cooking? We compare the best air fryers and Instant Pots on speed, versatility, and value.",
    slugA: "best-air-fryer-2026",
    slugB: "best-instant-pot-2026",
  },
  {
    slug: "robot-vacuum-vs-stick-vacuum",
    title: "Robot Vacuum vs Stick Vacuum",
    description: "Automated convenience vs hands-on control — which vacuum type fits your cleaning style and home?",
    slugA: "best-robot-vacuum-2026",
    slugB: "best-cordless-vacuum-2026",
  },
  {
    slug: "espresso-machine-vs-drip-coffee",
    title: "Espresso Machine vs Drip Coffee Maker",
    description: "Barista-level espresso at home vs a reliable daily drip — which coffee setup is right for you?",
    slugA: "best-espresso-machine-2026",
    slugB: "best-coffee-maker-2026",
  },
  {
    slug: "treadmill-vs-stationary-bike",
    title: "Treadmill vs Stationary Bike",
    description: "Running at home vs cycling indoors — we compare the best treadmills and exercise bikes for cardio, joints, and space.",
    slugA: "best-treadmill-2026",
    slugB: "best-exercise-bike-2026",
  },
  {
    slug: "noise-cancelling-vs-open-back-headphones",
    title: "Noise-Cancelling vs Open-Back Headphones",
    description: "Isolation and portability vs soundstage and accuracy — which headphone type suits your listening style?",
    slugA: "best-noise-cancelling-headphones-2026",
    slugB: "best-headphones-2026",
  },
  {
    slug: "standing-desk-vs-ergonomic-chair",
    title: "Standing Desk vs Ergonomic Chair",
    description: "Stand more vs sit better — which home office upgrade delivers more value for your back and productivity?",
    slugA: "best-standing-desk-2026",
    slugB: "best-office-chair-2026",
  },
  {
    slug: "protein-powder-vs-protein-bars",
    title: "Protein Powder vs Protein Bars",
    description: "Mix it or unwrap it — comparing the best protein powders and protein bars for convenience, taste, and nutrition.",
    slugA: "best-protein-powder-2026",
    slugB: "best-protein-bar-2026",
  },
  {
    slug: "yoga-mat-vs-foam-roller",
    title: "Yoga Mat vs Foam Roller",
    description: "Flexibility and strength vs recovery and mobility — comparing the most versatile fitness floor accessories.",
    slugA: "best-yoga-mat-2026",
    slugB: "best-foam-roller-2026",
  },
  {
    slug: "smart-watch-vs-fitness-tracker",
    title: "Smartwatch vs Fitness Tracker",
    description: "Full smart features vs focused health tracking — which wrist device matches your goals and lifestyle?",
    slugA: "best-smart-watch-2026",
    slugB: "best-fitness-tracker-2026",
  },
  {
    slug: "blender-vs-food-processor",
    title: "Blender vs Food Processor",
    description: "Smoothies and soups vs chopping and dough — do you need a blender, a food processor, or both?",
    slugA: "best-blender-2026",
    slugB: "best-food-processor-2026",
  },
  {
    slug: "air-purifier-vs-humidifier",
    title: "Air Purifier vs Humidifier",
    description: "Clean the air vs add moisture — which home air device solves your specific indoor air quality issue?",
    slugA: "best-air-purifier-2026",
    slugB: "best-humidifier-2026",
  },
  {
    slug: "massage-gun-vs-foam-roller",
    title: "Massage Gun vs Foam Roller",
    description: "Percussive therapy vs manual myofascial release — which recovery tool is worth adding to your routine?",
    slugA: "best-massage-gun-2026",
    slugB: "best-foam-roller-2026",
  },
];

export const COMPARISON_MAP = Object.fromEntries(COMPARISONS.map((c) => [c.slug, c]));
