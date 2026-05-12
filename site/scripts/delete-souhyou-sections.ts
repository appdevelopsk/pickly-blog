/**
 * Delete recap-style "総評" sections from the seven ja articles where they
 * duplicate the per-product recommendation section. Run once.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");
const ARTICLES_DIR = path.join(ROOT, "src/articles");

const TARGETS: Array<{ slug: string; locale: string; heading: string }> = [
  { slug: "best-air-purifier-2026", locale: "ja", heading: "総評" },
  { slug: "best-wireless-charger-2026", locale: "ja", heading: "総評" },
  { slug: "best-face-wash-2026", locale: "ja", heading: "総評" },
  { slug: "best-desk-lamp-2026", locale: "ja", heading: "総評" },
  { slug: "best-mechanical-keyboard-2026", locale: "ja", heading: "総評" },
  { slug: "best-gaming-mouse-2026", locale: "ja", heading: "総評" },
  { slug: "best-sleep-mask-2026", locale: "ja", heading: "総評" },
];

let removed = 0;
for (const t of TARGETS) {
  const filePath = path.join(ARTICLES_DIR, t.slug, "messages", `${t.locale}.json`);
  const raw = fs.readFileSync(filePath, "utf8");
  const content = JSON.parse(raw) as { sections?: Array<{ heading?: string }> };
  if (!Array.isArray(content.sections)) continue;
  const before = content.sections.length;
  content.sections = content.sections.filter((s) => (s.heading ?? "").trim() !== t.heading);
  const after = content.sections.length;
  if (after < before) {
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + "\n", "utf8");
    removed++;
    console.log(`removed "${t.heading}" from ${t.slug}/${t.locale}.json`);
  }
}
console.log(`\n${removed} sections removed.`);
