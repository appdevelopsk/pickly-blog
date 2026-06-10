import type { ArticleCategory } from "@/lib/articles/types";

export interface TagConfig {
  slug: string;
  icon: string;
  label: string;
  description: string;
  categories: ArticleCategory[];
  slugKeywords: string[];
}

export const TAGS: TagConfig[] = [
  {
    slug: "wireless",
    icon: "📶",
    label: "Wireless",
    description: "No-cable freedom — the best wireless headphones, chargers, keyboards, speakers, and home devices.",
    categories: ["tech", "home", "fitness"],
    slugKeywords: ["wireless", "bluetooth", "cordless", "wifi", "airpod", "earphone", "earbud"],
  },
  {
    slug: "smart-home",
    icon: "🏠",
    label: "Smart Home",
    description: "Voice-controlled, app-connected, and automated — the best smart home devices for 2026.",
    categories: ["tech", "home"],
    slugKeywords: ["smart", "robot", "auto", "sensor", "doorbell", "lock", "thermostat", "camera", "hub", "alexa", "google"],
  },
  {
    slug: "beginner-friendly",
    icon: "🌱",
    label: "Beginner Friendly",
    description: "Easy to start, hard to outgrow — the best products for people just getting started.",
    categories: ["fitness", "food", "tech", "finance"],
    slugKeywords: ["beginner", "starter", "entry", "basic", "intro", "simple", "easy"],
  },
  {
    slug: "compact",
    icon: "📦",
    label: "Compact & Space-Saving",
    description: "Small footprint, full functionality — the best compact appliances, gadgets, and gear for tight spaces.",
    categories: ["home", "tech", "food", "fitness"],
    slugKeywords: ["compact", "mini", "small", "portable", "travel", "slim", "thin", "lightweight"],
  },
  {
    slug: "eco-friendly",
    icon: "🌿",
    label: "Eco-Friendly",
    description: "Sustainably made, long-lasting, and low-waste — the best environmentally conscious products.",
    categories: ["home", "food", "beauty", "fashion", "fitness"],
    slugKeywords: ["eco", "sustainable", "organic", "natural", "reusable", "bamboo", "recycled", "plant"],
  },
  {
    slug: "cordless",
    icon: "🔋",
    label: "Cordless",
    description: "Battery-powered freedom for your home — the best cordless vacuums, drills, and appliances.",
    categories: ["home", "tech", "fitness"],
    slugKeywords: ["cordless", "battery", "rechargeable", "wireless", "handheld", "portable"],
  },
  {
    slug: "ergonomic",
    icon: "💆",
    label: "Ergonomic",
    description: "Built for your body — the best ergonomic chairs, keyboards, mice, and wellness tools.",
    categories: ["home", "tech", "fitness"],
    slugKeywords: ["ergonomic", "posture", "wrist", "back", "neck", "standing", "lumbar", "support"],
  },
  {
    slug: "budget",
    icon: "💵",
    label: "Budget Picks",
    description: "Maximum value per dollar — the best products that outperform their price tag.",
    categories: ["tech", "home", "fitness", "beauty", "food"],
    slugKeywords: ["budget", "cheap", "affordable", "value", "under", "best-bang"],
  },
  {
    slug: "premium",
    icon: "💎",
    label: "Premium",
    description: "The best of the best — premium products where the extra cost is genuinely worth it.",
    categories: ["tech", "home", "beauty", "fitness", "food", "fashion"],
    slugKeywords: ["premium", "luxury", "pro", "elite", "professional", "best", "top"],
  },
  {
    slug: "travel-friendly",
    icon: "✈️",
    label: "Travel Friendly",
    description: "Compact, durable, and TSA-compliant — the best products built to travel.",
    categories: ["travel", "tech", "fashion", "fitness", "beauty"],
    slugKeywords: ["travel", "portable", "compact", "carry", "pack", "tsa", "flight", "trip"],
  },
  // ── Purpose / Use-case tags ──────────────────────────────────────────────────
  {
    slug: "gifting",
    icon: "🎁",
    label: "For Gifting",
    description: "Crowd-pleasing picks that make memorable presents — for birthdays, anniversaries, holidays, and more.",
    categories: ["fitness", "food", "tech", "beauty", "home", "fashion", "travel", "pets"],
    slugKeywords: ["gift", "present", "birthday", "anniversary", "holiday", "christmas", "father", "mother", "valentine"],
  },
  {
    slug: "work-from-home",
    icon: "🖥️",
    label: "Work From Home",
    description: "Everything you need for a productive home office — chairs, monitors, keyboards, lighting, and focus tools.",
    categories: ["tech", "home", "fitness"],
    slugKeywords: ["desk", "office", "chair", "monitor", "keyboard", "mouse", "webcam", "standing", "ergonomic", "home-office", "wfh", "work"],
  },
  {
    slug: "gym-workout",
    icon: "💪",
    label: "Gym & Workout",
    description: "Gear that gets results — the best equipment, supplements, and apparel for serious training.",
    categories: ["fitness"],
    slugKeywords: ["gym", "workout", "training", "exercise", "lifting", "weights", "barbell", "dumbbell", "resistance", "crossfit", "hiit", "protein", "creatine", "bcaa", "pre-workout"],
  },
  {
    slug: "outdoor-sports",
    icon: "🏔️",
    label: "Outdoor & Sports",
    description: "Built for the elements — hiking poles, running gear, waterproof layers, and adventure essentials.",
    categories: ["fitness", "travel", "fashion"],
    slugKeywords: ["outdoor", "hiking", "trail", "running", "cycling", "camping", "waterproof", "sport", "athletic", "basketball", "tennis", "golf", "soccer", "football"],
  },
  {
    slug: "cooking-kitchen",
    icon: "👨‍🍳",
    label: "Cooking & Kitchen",
    description: "Level up your kitchen — cookware, gadgets, knives, and appliances that actually get used.",
    categories: ["food", "home"],
    slugKeywords: ["cook", "kitchen", "knife", "pan", "pot", "blender", "juicer", "coffee", "air-fryer", "instant-pot", "bento", "cast-iron", "cookware", "baking", "chef"],
  },
  {
    slug: "skincare-beauty",
    icon: "✨",
    label: "Skincare & Beauty",
    description: "Science-backed and editor-approved — the best serums, moisturizers, and beauty tools.",
    categories: ["beauty"],
    slugKeywords: ["serum", "moisturizer", "cream", "toner", "spf", "sunscreen", "retinol", "vitamin-c", "niacinamide", "gua-sha", "jade-roller", "mask", "face", "skin", "eye-cream"],
  },
  {
    slug: "better-sleep",
    icon: "😴",
    label: "Better Sleep",
    description: "Optimize your rest — the best pillows, mattresses, weighted blankets, and sleep accessories.",
    categories: ["home", "fitness"],
    slugKeywords: ["sleep", "pillow", "mattress", "blanket", "weighted", "white-noise", "eye-mask", "cooling", "bamboo", "memory-foam"],
  },
  {
    slug: "for-pets",
    icon: "🐾",
    label: "For Pets",
    description: "Treats, toys, and essentials your pet will love — the best gear for dogs, cats, and beyond.",
    categories: ["pets"],
    slugKeywords: ["dog", "cat", "pet", "puppy", "kitten", "bird", "fish", "aquarium", "litter", "food", "toy", "harness", "bed", "grooming"],
  },
  {
    slug: "for-parents",
    icon: "👶",
    label: "For Parents",
    description: "Baby gear you can trust — car seats, carriers, feeding essentials, and sleep solutions.",
    categories: ["parenting"],
    slugKeywords: ["baby", "infant", "toddler", "newborn", "parent", "car-seat", "stroller", "carrier", "feeding", "diaper", "pacifier", "monitor", "bouncer"],
  },
  {
    slug: "health-wellness",
    icon: "🧘",
    label: "Health & Wellness",
    description: "Products that support your long-term wellbeing — supplements, recovery tools, and healthy habits.",
    categories: ["fitness", "food", "beauty"],
    slugKeywords: ["health", "wellness", "supplement", "vitamin", "mineral", "omega", "probiotic", "magnesium", "collagen", "recovery", "massage", "foam-roller", "meditation"],
  },
  {
    slug: "home-organization",
    icon: "🗂️",
    label: "Home Organization",
    description: "Declutter and simplify — storage solutions, organizers, and systems that actually work.",
    categories: ["home"],
    slugKeywords: ["organizer", "storage", "closet", "shelf", "rack", "container", "box", "basket", "drawer", "pantry", "declutter", "minimalist"],
  },
];

export const TAG_MAP = Object.fromEntries(TAGS.map((t) => [t.slug, t]));

export const PURPOSE_TAGS = TAGS.filter((t) =>
  ["gifting","work-from-home","gym-workout","outdoor-sports","cooking-kitchen",
   "skincare-beauty","better-sleep","for-pets","for-parents","health-wellness","home-organization"].includes(t.slug)
);
