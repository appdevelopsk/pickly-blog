import * as fs from "node:fs";
import * as yaml from "js-yaml";

const data = yaml.load(fs.readFileSync("/Users/ken/Dropbox/affiliate_factory/automation/pinterest/pins.yaml", "utf8"));

// 投稿戦略:
// Wave 1 (即時): JA top1 × 全記事 (各記事の代表ピン1本ずつ)
// Wave 2 (1日後): EN top1 × 全記事
// Wave 3 (3日後): JA comparison
// Wave 4 (4日後): JA budget
// Wave 5 (5日後): JA avoid
// Wave 6 (6日後): JA scene
// 以降 EN の他バリエーション

const waves = [
  { name: "Wave 1: JA top1 (即日投稿)", filter: p => p.locale === "ja" && p.variant === "top1" },
  { name: "Wave 2: EN top1 (1日後)", filter: p => p.locale === "en" && p.variant === "top1" },
  { name: "Wave 3: JA comparison (3日後)", filter: p => p.locale === "ja" && p.variant === "comparison" },
  { name: "Wave 4: JA budget (4日後)", filter: p => p.locale === "ja" && p.variant === "budget" },
  { name: "Wave 5: JA avoid (5日後)", filter: p => p.locale === "ja" && p.variant === "avoid" },
  { name: "Wave 6: JA scene (6日後)", filter: p => p.locale === "ja" && p.variant === "scene" },
];

let total = 0;
console.log("# Pickly Pinterest 手動投稿ガイド\n");
console.log("## 投稿スケジュール (1日5-10pin推奨、burst投稿はspam判定リスク)\n");

waves.forEach((wave, wi) => {
  const pins = data.pins.filter(wave.filter);
  console.log(`\n# ${wave.name}\n`);
  console.log(`📊 ${pins.length} pins\n`);
  pins.forEach((p, i) => {
    total++;
    console.log(`---\n## Wave ${wi + 1} - Pin ${i + 1}/${pins.length}: ${p.article_slug}\n`);
    console.log(`**Title:**\n${p.title}\n`);
    console.log(`**Description:**\n${p.description}`);
    console.log(`**Link:** ${p.link}`);
    console.log(`**Image:** https://pickly.blog/og/${p.article_slug}-${p.locale}.png`);
    console.log(`**Image alt:** ${p.image_alt ?? p.title}`);
    console.log(`**Board:** Pickly Picks (id=1147010667537109958)\n`);
  });
});

console.error(`\nTotal: ${total} pins across ${waves.length} waves`);
