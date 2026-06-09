import type { ArticleCategory } from "@/lib/articles/types";

export interface OccasionConfig {
  slug: string;
  icon: string;
  title: string;
  description: string;
  pinDescription: string;
  categories: ArticleCategory[];
  featuredSlugs?: string[];
}

export const OCCASIONS: OccasionConfig[] = [
  {
    slug: "christmas",
    icon: "🎄",
    title: "Christmas Gift Ideas 2026",
    description: "Tested gift picks across every category — something for everyone on your list.",
    pinDescription: "Christmas gift ideas they'll actually use — tested, ranked, and updated for 2026.",
    categories: ["tech", "beauty", "home", "fitness", "food", "fashion", "parenting", "pets", "travel", "finance"],
    featuredSlugs: ["best-noise-cancelling-headphones-2026", "best-air-fryer-2026", "best-robot-vacuum-2026"],
  },
  {
    slug: "mothers-day",
    icon: "💐",
    title: "Mother's Day Gift Ideas 2026",
    description: "Thoughtful, tested gifts for moms — beauty, home, wellness, and food picks she'll love.",
    pinDescription: "Mother's Day gifts she'll actually want — beauty, home, and wellness picks tested for 2026.",
    categories: ["beauty", "home", "food", "fitness", "fashion"],
    featuredSlugs: ["best-hair-dryer-2026", "best-skincare-fridge-2026", "best-espresso-machine-2026"],
  },
  {
    slug: "fathers-day",
    icon: "👨",
    title: "Father's Day Gift Ideas 2026",
    description: "Practical, tested gifts for dads — tech, fitness, kitchen, and outdoor picks.",
    pinDescription: "Father's Day gifts he'll actually use — tech, fitness, and kitchen picks for 2026.",
    categories: ["tech", "fitness", "food", "finance", "travel"],
    featuredSlugs: ["best-massage-gun-2026", "best-coffee-maker-2026", "best-smart-watch-2026"],
  },
  {
    slug: "graduation",
    icon: "🎓",
    title: "Graduation Gift Ideas 2026",
    description: "Gifts for new graduates starting their next chapter — tech, fashion, and financial essentials.",
    pinDescription: "Graduation gift ideas for the class of 2026 — practical picks they'll actually use.",
    categories: ["tech", "fashion", "finance", "fitness", "travel"],
    featuredSlugs: ["best-noise-cancelling-headphones-2026", "best-fitness-tracker-2026", "best-vpn-2026"],
  },
  {
    slug: "valentines",
    icon: "❤️",
    title: "Valentine's Day Gift Ideas 2026",
    description: "Romantic, personal gift picks — beauty, food, fashion, and home.",
    pinDescription: "Valentine's Day gift ideas for 2026 — beauty, gourmet food, and romantic home picks.",
    categories: ["beauty", "food", "fashion", "home"],
    featuredSlugs: ["best-espresso-machine-2026", "best-skincare-fridge-2026", "best-hair-dryer-2026"],
  },
  {
    slug: "housewarming",
    icon: "🏠",
    title: "Housewarming Gift Ideas 2026",
    description: "Useful, quality gifts for a new home — kitchen appliances, home décor, and smart tech.",
    pinDescription: "Housewarming gift ideas for 2026 — kitchen, home, and smart tech picks they'll use every day.",
    categories: ["home", "food", "tech"],
    featuredSlugs: ["best-air-fryer-2026", "best-robot-vacuum-2026", "best-espresso-machine-2026"],
  },
  {
    slug: "birthday",
    icon: "🎂",
    title: "Birthday Gift Ideas 2026",
    description: "Crowd-pleasing birthday gifts across every interest — tested and ranked.",
    pinDescription: "Birthday gift ideas for 2026 that actually work — tested across tech, beauty, fitness, and more.",
    categories: ["tech", "beauty", "fitness", "food", "home", "fashion"],
  },
  {
    slug: "baby-shower",
    icon: "👶",
    title: "Baby Shower Gift Ideas 2026",
    description: "Practical, safety-tested baby gifts new parents will actually use.",
    pinDescription: "Baby shower gift ideas for 2026 — practical picks new parents will reach for every day.",
    categories: ["parenting"],
    featuredSlugs: ["best-baby-monitor-2026", "best-baby-car-seat-2026", "best-baby-bottle-2026"],
  },
  {
    slug: "anniversary",
    icon: "💍",
    title: "Anniversary Gift Ideas 2026",
    description: "Meaningful anniversary gifts — beauty, home, fashion, and food picks for every milestone.",
    pinDescription: "Anniversary gift ideas for 2026 — beautiful, practical picks for every milestone year.",
    categories: ["home", "beauty", "fashion", "food"],
  },
  {
    slug: "back-to-school",
    icon: "🎒",
    title: "Back to School Essentials 2026",
    description: "Tech, home, fitness, and fashion picks for students heading back in 2026.",
    pinDescription: "Back to school essentials for 2026 — tech, dorm room, and fitness picks for students.",
    categories: ["tech", "home", "fashion", "fitness", "food"],
    featuredSlugs: ["best-noise-cancelling-headphones-2026", "best-mechanical-keyboard-2026", "best-yoga-mat-2026"],
  },
];

export const OCCASION_MAP = Object.fromEntries(OCCASIONS.map((o) => [o.slug, o]));
