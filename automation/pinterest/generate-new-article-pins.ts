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

function hashtags(slug: string, locale: string): string[] {
  const cat = slug.includes("basketball") ? "fitness" :
              slug.includes("mascara") || slug.includes("foundation") || slug.includes("concealer") || slug.includes("eyebrow") || slug.includes("lip") || slug.includes("nail") || slug.includes("setting-spray") ? "beauty" :
              slug.includes("face-roller") || slug.includes("hair") ? "hairbeauty" :
              slug.includes("watch") || slug.includes("boots") || slug.includes("jeans") || slug.includes("swimsuit") || slug.includes("hat") || slug.includes("bag") || slug.includes("coat") || slug.includes("bikini") ? "fashion" : "home";

  const baseMap: Record<string, string[]> = {
    fitness: ["#basketball", "#basketballshoes", "#hoops", "#fitness", "#sneakers", "#review2026"],
    beauty: ["#beautyreview", "#makeuptips", "#beautyhacks", "#skincare", "#beautyfaves", "#review2026"],
    hairbeauty: ["#haircare", "#hairtips", "#beautyroutine", "#hairgoals", "#selfcare", "#review2026"],
    fashion: ["#fashionfinds", "#styleinspo", "#wardrobeessentials", "#fashiontips", "#ootd", "#review2026"],
    home: ["#homedecor", "#homefinds", "#organizationhacks", "#homemakeover", "#homeessentials", "#review2026"],
  };
  const tags = baseMap[cat] ?? baseMap.home;
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

  for (const slug of NEW_SLUGS) {
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
      const content: EnJson = JSON.parse(fs.readFileSync(msgPath, "utf8"));
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
