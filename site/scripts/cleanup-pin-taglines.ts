/**
 * Strip "every product has a weakness" / "explicit weakness on every pick"
 * taglines from pinDescription fields across all article message files.
 * These are AI-tics that don't add value to a Pinterest pin description.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");
const ARTICLES_DIR = path.join(ROOT, "src/articles");

const STRIPS: RegExp[] = [
  / [—–\-]\s*explicit weaknesses? on every (pick|product)\.?/gi,
  / [—–\-]\s*every (product|pick) has an? explicit weakness( listed)?\.?/gi,
  / [—–\-]\s*every (product|pick) has a weakness\.?/gi,
  /[。.]\s*Every (product|pick) has an? explicit weakness( listed)?\.?/gi,
  /[。.]\s*Every (product|pick) has a weakness\.?/gi,
  /[、,]\s*and an? explicit weakness on every (pick|product)\.?/gi,
  /[、,]\s*with an? explicit weakness on every (pick|product)\.?/gi,
  /No rave-only descriptions, no in-conclusion filler — /gi,
];

let modifiedFiles = 0;
let totalStripped = 0;

for (const slug of fs.readdirSync(ARTICLES_DIR)) {
  const msgDir = path.join(ARTICLES_DIR, slug, "messages");
  if (!fs.existsSync(msgDir)) continue;
  for (const f of fs.readdirSync(msgDir)) {
    if (!f.endsWith(".json")) continue;
    const filePath = path.join(msgDir, f);
    const raw = fs.readFileSync(filePath, "utf8");
    let content: { pinDescription?: string };
    try {
      content = JSON.parse(raw);
    } catch {
      continue;
    }
    if (!content.pinDescription) continue;

    let pin = content.pinDescription;
    const original = pin;
    for (const r of STRIPS) {
      pin = pin.replace(r, "");
    }
    pin = pin.replace(/\s{2,}/g, " ").trim();
    if (pin !== original) {
      content.pinDescription = pin;
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + "\n", "utf8");
      modifiedFiles++;
      totalStripped++;
    }
  }
}

console.log(`Modified ${modifiedFiles} files, stripped ${totalStripped} pinDescription taglines.`);
