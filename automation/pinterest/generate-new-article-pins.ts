/**
 * Generates pins.yaml entries for new articles that are missing from pins.yaml.
 *
 * Usage:
 *   npx tsx generate-new-article-pins.ts           # dry-run (print only)
 *   npx tsx generate-new-article-pins.ts --write   # append to pins.yaml
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import * as yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PINS_PATH = path.resolve(__dirname, "pins.yaml");
const ARTICLES_DIR = path.resolve(__dirname, "../../site/src/articles");
const SITE_URL = "https://pickly.blog";

const NEW_SLUGS = [
  // beauty
  "best-mascara-2026",
  "best-foundation-2026",
  "best-concealer-2026",
  "best-eyebrow-pencil-2026",
  "best-lip-gloss-2026",
  "best-face-roller-2026",
  "best-hair-oil-2026",
  "best-hair-mask-2026",
  "best-nail-polish-2026",
  "best-setting-spray-2026",
  // fashion
  "best-watch-for-women-2026",
  "best-ankle-boots-2026",
  "best-winter-boots-2026",
  "best-jeans-for-women-2026",
  "best-mens-jeans-2026",
  "best-one-piece-swimsuit-2026",
  "best-sun-hat-2026",
  "best-shoulder-bag-2026",
  "best-winter-coat-women-2026",
  "best-bikini-2026",
  // home
  "best-smart-thermostat-2026",
  "best-sofa-2026",
  "best-mattress-topper-2026",
  "best-wine-rack-2026",
  "best-bathroom-scale-2026",
  "best-laundry-hamper-2026",
  "best-drawer-organizer-2026",
  "best-ironing-board-2026",
  "best-soap-dispenser-2026",
  "best-shower-curtain-2026",
  "best-storage-ottoman-2026",
  // fitness — basketball sub-intent cluster
  "best-basketball-shoes-ankle-support-2026",
  "best-basketball-shoes-for-beginners-2026",
  "best-basketball-shoes-for-traction-2026",
  "best-cushioned-basketball-shoes-2026",
];

interface EnJson {
  title: string;
  description: string;
  lede: string;
  pinDescription?: string;
}

// slug キーワードから Pinterest トピックを推定（優先順: 曖昧さの少ない順）。
// meta.ts の category は dog-bed/baby-monitor/soundbar を全て "home" に丸める粗さなので slug 語で分類する。
function classify(slug: string): string {
  const has = (...ks: string[]) => ks.some((k) => slug.includes(k));
  if (has("baby", "diaper", "crib", "stroller", "toddler", "kids-", "nursing", "pacifier", "formula", "car-seat", "high-chair", "changing-table", "swaddle", "breast-pump")) return "baby";
  if (has("dog", "cat-", "-cat", "pet", "aquarium", "litter", "hamster", "rabbit", "bird-cage", "fish-tank", "kennel", "puppy")) return "pet";
  if (has("travel", "luggage", "passport", "carry-on", "checked-luggage", "packing-cube", "anti-theft", "suitcase")) return "travel";
  if (has("insurance", "loan", "credit-card", "credit-monitoring", "tax-", "savings", "invest", "401k", "529", "-ira", "mortgage", "checking-account", "debit-card", "refinance", "bond-etf", "advisor", "financial", "money-market", "money-transfer", "budgeting-app", "robo-advisor", "savings-account", "cd-account")) return "finance";
  if (has("mascara", "foundation", "concealer", "eyebrow", "lipstick", "lip-gloss", "lip-balm", "nail-polish", "setting-spray", "blush", "serum", "moisturizer", "cleanser", "toner", "sunscreen", "eye-cream", "face-mist", "sheet-mask", "makeup", "retinol", "niacinamide", "hyaluronic", "eyeshadow", "perfume", "body-lotion", "body-scrub", "face-mask", "ipl-hair", "facial-steamer")) return "beauty";
  if (has("hair", "face-roller", "gua-sha", "jade-roller", "curling-iron", "straightener")) return "hairbeauty";
  if (has("basketball", "dumbbell", "kettlebell", "barbell", "treadmill", "yoga", "squat", "spin-bike", "assault-bike", "stationary-bike", "rowing", "elliptical", "resistance", "gym", "protein", "pull-up", "push-up", "jump-rope", "foam-roller", "boxing", "cleats", "agility", "plyometric", "ab-roller", "medicine-ball", "suspension", "knee-sleeve", "lifting", "bcaa", "creatine", "pre-workout", "collagen", "running-shoes", "trail-running", "crossfit", "wrestling-shoes", "weightlifting", "sports-bra", "cycling-helmet", "golf-", "tennis", "pickleball", "badminton", "swim", "climbing-shoes", "spirulina", "battle-rope", "gymnastic")) return "fitness";
  if (has("camera", "monitor", "router", "laptop", "keyboard", "mouse", "headphone", "earbud", "speaker", "soundbar", "tablet", "ssd", "usb", "charger", "power-bank", "powerstation", "power-station", "webcam", "projector", "microphone", "e-reader", "doorbell", "smart-lock", "thermostat", "smart-home", "streaming", "scanner", "bluetooth", "gps", "dash-cam", "obd2", "ring-light", "graphics-tablet", "label-maker", "fitness-tracker", "smartwatch", "smart-watch", "gaming", "antivirus", "password-manager", "vpn", "hosting", "domain-registrar", "website-builder", "ecommerce", "crm", "payroll", "accounting-software", "hr-software", "wifi", "mesh-wifi", "docking-station")) return "tech";
  if (has("coffee", "-tea", "tea-", "blender", "cookware", "knife", "-pan", "stockpot", "kettle", "toaster", "grill", "-oven", "fryer", "mixer", "food-processor", "sous-vide", "espresso", "grinder", "cutting-board", "baking", "kitchen", "snack", "honey", "chocolate", "nut-butter", "almond-butter", "olive-oil", "coconut-oil", "water-bottle", "coffee-mug", "bento", "matcha", "yerba", "kombucha", "yogurt", "granola", "vinegar", "hot-sauce", "oat-milk", "protein-bar", "energy-bar", "electrolyte", "sparkling-water", "coconut-water", "bone-broth", "ice-cream", "waffle", "bread-machine", "pizza-stone", "dutch-oven", "-wok", "pasta-maker", "dehydrator", "vacuum-sealer", "meal-kit", "wine", "milk-frother", "deep-fryer", "popcorn", "griddle", "ghee", "spirulina")) return "food";
  if (has("watch", "boots", "jeans", "swimsuit", "sun-hat", "-bag", "handbag", "tote", "crossbody", "shoulder-bag", "coat", "bikini", "sweater", "cardigan", "jacket", "dress", "-shirt", "loafers", "wallet", "belt", "scarf", "sunglasses", "earrings", "mens-suit", "pajamas", "leggings", "chinos", "sneakers", "slippers", "flannel")) return "fashion";
  return "home";
}

function hashtags(slug: string, locale: string): string[] {
  const baseMap: Record<string, string[]> = {
    baby: ["#momlife", "#babyessentials", "#newbornmusthaves", "#parentingtips", "#babygear", "#review2026"],
    pet: ["#petlovers", "#petsofpinterest", "#dogmom", "#catmom", "#petcare", "#review2026"],
    travel: ["#travelgear", "#travelessentials", "#travelhacks", "#packingtips", "#wanderlust", "#review2026"],
    finance: ["#personalfinance", "#moneytips", "#budgeting", "#financialfreedom", "#moneymanagement", "#review2026"],
    beauty: ["#beautyreview", "#makeuptips", "#beautyhacks", "#skincare", "#beautyfaves", "#review2026"],
    hairbeauty: ["#haircare", "#hairtips", "#beautyroutine", "#hairgoals", "#selfcare", "#review2026"],
    fitness: ["#fitness", "#homegym", "#workout", "#fitnessgear", "#fitspo", "#review2026"],
    tech: ["#techfinds", "#gadgets", "#techreview", "#technology", "#gadgetlove", "#review2026"],
    food: ["#kitchenfinds", "#foodie", "#kitchengadgets", "#cooking", "#homecooking", "#review2026"],
    fashion: ["#fashionfinds", "#styleinspo", "#wardrobeessentials", "#fashiontips", "#ootd", "#review2026"],
    home: ["#homedecor", "#homefinds", "#organizationhacks", "#homemakeover", "#homeessentials", "#review2026"],
  };
  const tags = baseMap[classify(slug)] ?? baseMap.home;
  return locale === "ja"
    ? ["#おすすめ", "#レビュー", "#比較", "#買い物", "#生活", "#2026"]
    : tags;
}

function buildPins(slug: string, locale: string, content: EnJson): object[] {
  const localeUrl = locale === "en" ? "en" : locale;
  const link = `${SITE_URL}/${localeUrl}/articles/${slug}/`;
  const tags = hashtags(slug, locale);
  const tagStr = tags.join(" ");

  const pins: object[] = [];

  // variant 1: comparison
  const title1 = content.title.length <= 100 ? content.title : content.title.slice(0, 97) + "...";
  pins.push({
    pin_id: `${slug}-${locale}-01`,
    article_slug: slug,
    locale,
    variant: "comparison",
    title: title1,
    description: `${content.description} ${tagStr}\n`,
    link,
    image_alt: content.title,
    hashtags: tags,
  });

  // variant 2: top1 (uses lede as teaser)
  const lede = content.lede.length <= 300 ? content.lede : content.lede.slice(0, 297) + "...";
  const title2 = locale === "ja" ? `${content.title.slice(0, 60)}【2026年決定版】` : `${content.title.replace(":", " —").slice(0, 95)}`;
  pins.push({
    pin_id: `${slug}-${locale}-02`,
    article_slug: slug,
    locale,
    variant: "top1",
    title: title2.slice(0, 100),
    description: `${lede} ${tagStr}\n`,
    link,
    image_alt: `Top pick from: ${content.title}`,
    hashtags: tags,
  });

  // variant 3: pinDescription if available, else description again with different title
  const pinDesc = content.pinDescription ?? content.description;
  const title3 = locale === "ja"
    ? `${content.title.split("：")[0]?.slice(0, 60) ?? content.title.slice(0, 60)}：実際に比べてみた`
    : content.title.split(":")[0]?.slice(0, 80) + ": honest comparison" ?? content.title.slice(0, 100);
  pins.push({
    pin_id: `${slug}-${locale}-03`,
    article_slug: slug,
    locale,
    variant: "problem",
    title: title3.slice(0, 100),
    description: `${pinDesc} ${tagStr}\n`,
    link,
    image_alt: `Comparison: ${content.title}`,
    hashtags: tags,
  });

  return pins;
}

function main() {
  const doWrite = process.argv.includes("--write");
  const pinsContent = fs.readFileSync(PINS_PATH, "utf8");
  const existingPinIds = new Set<string>(
    (pinsContent.match(/^- pin_id: (.+)$/gm) ?? []).map((l) => l.replace("- pin_id: ", "").trim())
  );

  const newPins: object[] = [];

  // --all-missing: NEW_SLUGS の代わりに「登録済みだが pins.yaml に未掲載」の全記事を対象にする。
  const allMissing = process.argv.includes("--all-missing");
  const pinnedSlugs = new Set(
    (pinsContent.match(/^  article_slug: (.+)$/gm) ?? []).map((l) => l.replace(/^  article_slug: /, "").trim())
  );
  const slugList = allMissing
    ? fs.readdirSync(ARTICLES_DIR).filter(
        (s) => fs.existsSync(path.join(ARTICLES_DIR, s, "messages", "en.json")) && !pinnedSlugs.has(s)
      ).sort()
    : NEW_SLUGS;

  for (const slug of slugList) {
    for (const locale of ["en", "ja"]) {
      if (existingPinIds.has(`${slug}-${locale}-01`)) {
        console.log(`  skip (exists): ${slug}-${locale}`);
        continue;
      }
      const msgPath = path.join(ARTICLES_DIR, slug, "messages", `${locale}.json`);
      if (!fs.existsSync(msgPath)) {
        console.warn(`  MISSING: ${msgPath}`);
        continue;
      }
      const raw = JSON.parse(fs.readFileSync(msgPath, "utf8"));
      // meta:{title,description} ラッパー形式も正規化。lede 欠落は description で代替。
      const content: EnJson = {
        title: raw.title ?? raw.meta?.title ?? "",
        description: raw.description ?? raw.meta?.description ?? "",
        lede: raw.lede ?? raw.description ?? raw.meta?.description ?? "",
        pinDescription: raw.pinDescription,
      };
      if (!content.title || !content.description) {
        console.warn(`  SKIP (no title/desc): ${slug}-${locale}`);
        continue;
      }
      const pins = buildPins(slug, locale, content);
      newPins.push(...pins);
      console.log(`  + ${slug}-${locale} (${pins.length} pins)`);
    }
  }

  console.log(`\nTotal new pins: ${newPins.length}`);

  if (!doWrite) {
    console.log("\n(dry-run) Pass --write to append to pins.yaml");
    return;
  }

  if (newPins.length === 0) {
    console.log("Nothing to add.");
    return;
  }

  const appendYaml = "\n" + yaml.dump(newPins, { lineWidth: 200 });
  fs.appendFileSync(PINS_PATH, appendYaml);
  console.log(`\nAppended ${newPins.length} pins to pins.yaml`);
}

main();
