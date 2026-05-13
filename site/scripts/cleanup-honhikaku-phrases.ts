import fs from "node:fs";
import path from "node:path";

const ARTICLES_DIR = path.resolve(__dirname, "../src/articles");

// Remove "本比較で" prefix from superlative phrases — the superlative stands fine alone
const REPLACEMENTS: [RegExp, string][] = [
  [/本比較で(唯一|最も|最高|最大)/g, "$1"],
];

let modifiedFiles = 0;
let totalReplacements = 0;

for (const slug of fs.readdirSync(ARTICLES_DIR)) {
  const msgDir = path.join(ARTICLES_DIR, slug, "messages");
  if (!fs.existsSync(msgDir)) continue;
  for (const f of fs.readdirSync(msgDir)) {
    if (!f.endsWith(".json")) continue;
    const filePath = path.join(msgDir, f);
    const raw = fs.readFileSync(filePath, "utf8");
    let modified = raw;
    let count = 0;
    for (const [pattern, replacement] of REPLACEMENTS) {
      modified = modified.replace(pattern, (m) => { count++; return m.replace(/本比較で/, ""); });
    }
    if (count > 0) {
      fs.writeFileSync(filePath, modified, "utf8");
      console.log(`${slug}/${f}: ${count} replacement(s)`);
      modifiedFiles++;
      totalReplacements += count;
    }
  }
}

console.log(`\nModified ${modifiedFiles} files, ${totalReplacements} total replacements.`);
