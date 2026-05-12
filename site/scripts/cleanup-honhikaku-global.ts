/**
 * Document-global dedupe of "本比較で唯一/最も/最大/最高/最高クラス" — keep the
 * first occurrence per article (across all strings in lede + sections + faqs)
 * and rewrite later occurrences to drop the leaning phrase.
 *
 * Rewrites in place. Only touches ja.json files.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");
const ARTICLES_DIR = path.join(ROOT, "src/articles");

const PATTERN = /本比較で(唯一|最も|最大|最高クラス|最高)/g;

// When stripping leaning phrases, also clean up the resulting double spaces / 句読点.
// "Xは本比較で最も小さく、Y" → "Xは最も小さく、Y"  (remove "本比較で" prefix only)
// Strategy: replace "本比較で" with empty inside the matched pattern (keep "唯一"/"最も" etc.)
const TARGET_RE = /本比較で(?=(唯一|最も|最大|最高クラス|最高))/g;

let totalReplaced = 0;
let articlesModified = 0;

for (const slug of fs.readdirSync(ARTICLES_DIR)) {
  const msgDir = path.join(ARTICLES_DIR, slug, "messages");
  if (!fs.existsSync(msgDir)) continue;
  const jaPath = path.join(msgDir, "ja.json");
  if (!fs.existsSync(jaPath)) continue;

  const raw = fs.readFileSync(jaPath, "utf8");
  // Count occurrences across whole document
  const occurrences = (raw.match(PATTERN) ?? []).length;
  if (occurrences <= 1) continue;

  // Strip 本比較で prefix, keeping the 唯一/最も/... part. But preserve the
  // FIRST occurrence as-is. To do this we count as we go and only strip
  // the second occurrence onward.
  let stripped = 0;
  let seen = 0;
  const newText = raw.replace(TARGET_RE, (m) => {
    seen++;
    if (seen === 1) return m; // keep first
    stripped++;
    return "";
  });

  if (stripped > 0) {
    fs.writeFileSync(jaPath, newText, "utf8");
    articlesModified++;
    totalReplaced += stripped;
    console.log(`${slug}: stripped ${stripped} occurrence(s), kept first`);
  }
}

console.log(`\n${articlesModified} articles modified, ${totalReplaced} duplicate clauses stripped.`);
