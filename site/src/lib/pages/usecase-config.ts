import type { ArticleCategory } from "@/lib/articles/types";

export interface UseCaseConfig {
  slug: string;
  icon: string;
  title: string;
  description: string;
  categories: ArticleCategory[];
  slugKeywords?: string[];
}

export const USE_CASES: UseCaseConfig[] = [
  {
    slug: "home-office",
    icon: "🖥️",
    title: "Best Home Office Setup 2026",
    description: "Everything you need to build a productive home office — monitors, chairs, keyboards, lighting, and more.",
    categories: ["tech", "home"],
    slugKeywords: ["desk", "chair", "keyboard", "webcam", "monitor", "lamp", "standing", "headphone", "speaker", "organizer"],
  },
  {
    slug: "college-students",
    icon: "🎓",
    title: "Best Products for College Students 2026",
    description: "Budget-smart picks for dorm life — tech, kitchen essentials, fitness gear, and fashion basics.",
    categories: ["tech", "home", "food", "fashion", "fitness", "finance"],
    slugKeywords: ["laptop", "headphone", "blender", "coffee", "yoga", "backpack", "keyboard", "budget", "earphone", "portable"],
  },
  {
    slug: "travelers",
    icon: "✈️",
    title: "Best Travel Gear 2026",
    description: "Tested gear for every kind of trip — luggage, tech, fitness, and fashion picks that actually travel well.",
    categories: ["travel", "tech", "fashion", "fitness"],
    slugKeywords: ["travel", "portable", "compact", "luggage", "neck", "pillow", "adapter", "charger", "packing", "carry"],
  },
  {
    slug: "fitness-beginners",
    icon: "💪",
    title: "Best Fitness Gear for Beginners 2026",
    description: "No-overwhelm fitness picks for people just starting out — equipment, nutrition, and tracking tools.",
    categories: ["fitness", "food"],
    slugKeywords: ["beginner", "yoga", "resistance", "dumbbell", "kettlebell", "jump", "protein", "tracker", "mat", "band"],
  },
  {
    slug: "small-apartments",
    icon: "🏢",
    title: "Best Products for Small Apartments 2026",
    description: "Compact, space-saving picks for small living — multi-use appliances, smart storage, and clever tech.",
    categories: ["home", "tech", "food"],
    slugKeywords: ["compact", "small", "mini", "air-fryer", "robot", "vacuum", "diffuser", "desk", "storage", "portable"],
  },
  {
    slug: "pet-owners",
    icon: "🐾",
    title: "Best Products for Pet Owners 2026",
    description: "Everything your pet needs — food, health, comfort, and play picks tested for real animals.",
    categories: ["pets"],
  },
  {
    slug: "new-parents",
    icon: "👶",
    title: "Best Products for New Parents 2026",
    description: "Must-have picks for the first year — safety gear, sleep aids, feeding essentials, and sanity-savers.",
    categories: ["parenting"],
  },
  {
    slug: "remote-workers",
    icon: "💻",
    title: "Best Products for Remote Workers 2026",
    description: "Productivity and comfort picks for the full-time remote lifestyle — from ergonomics to connectivity.",
    categories: ["tech", "home", "food", "fitness"],
    slugKeywords: ["desk", "chair", "keyboard", "webcam", "headphone", "coffee", "standing", "monitor", "router", "wifi"],
  },
];

export const USE_CASE_MAP = Object.fromEntries(USE_CASES.map((u) => [u.slug, u]));
