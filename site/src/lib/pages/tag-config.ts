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
];

export const TAG_MAP = Object.fromEntries(TAGS.map((t) => [t.slug, t]));
