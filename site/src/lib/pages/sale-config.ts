import type { ArticleCategory } from "@/lib/articles/types";

export interface SaleEventConfig {
  slug: string;
  icon: string;
  title: string;
  description: string;
  categories: ArticleCategory[];
  /** Months when this event is active (1-based) */
  activeMonths: number[];
}

export const SALE_EVENTS: SaleEventConfig[] = [
  {
    slug: "prime-day",
    icon: "⚡",
    title: "Amazon Prime Day Deals 2026",
    description: "The best products to buy on Prime Day — tech, home, fitness, and beauty picks that are genuinely worth buying even at full price.",
    categories: ["tech", "home", "fitness", "beauty", "food"],
    activeMonths: [7],
  },
  {
    slug: "black-friday",
    icon: "🖤",
    title: "Black Friday Deals 2026",
    description: "Black Friday picks worth buying — tested products across every category where the discounts are actually meaningful.",
    categories: ["tech", "home", "fitness", "beauty", "food", "fashion", "finance"],
    activeMonths: [11],
  },
  {
    slug: "cyber-monday",
    icon: "💻",
    title: "Cyber Monday Deals 2026",
    description: "The best Cyber Monday deals on tech, software, and electronics — products we've tested and recommend at any price.",
    categories: ["tech", "finance", "fitness"],
    activeMonths: [11, 12],
  },
  {
    slug: "mothers-day-deals",
    icon: "💐",
    title: "Mother's Day Sale Picks 2026",
    description: "Beauty, wellness, home, and food products that make great Mother's Day gifts — and often go on sale in May.",
    categories: ["beauty", "home", "food", "fitness", "fashion"],
    activeMonths: [4, 5],
  },
  {
    slug: "holiday-deals",
    icon: "🎄",
    title: "Holiday Sale Picks 2026",
    description: "The best holiday deals across every category — products worth buying during the November–December sale season.",
    categories: ["tech", "home", "beauty", "fitness", "food", "fashion", "parenting", "pets"],
    activeMonths: [11, 12],
  },
];

export const SALE_EVENT_MAP = Object.fromEntries(SALE_EVENTS.map((e) => [e.slug, e]));
