/**
 * Bulk-add amazon-jp search URL fallbacks to every catalog offer that lacks
 * a JP-market link.  Uses the Japanese product name (offer.name.ja) as the
 * search query; falls back to the English name when Japanese is absent.
 *
 * Run once: cd site && npx tsx scripts/add-jp-search-links.ts
 * Safe to re-run — skips offers that already have a JP link.
 */
import fs from "node:fs";
import path from "node:path";

const catalogPath = path.resolve(__dirname, "../src/lib/affiliates/catalog.ts");
const raw = fs.readFileSync(catalogPath, "utf8");
const lines = raw.split("\n");

// ── helpers ──────────────────────────────────────────────────────────────────

function extractJaName(context: string): string | null {
  // Prefer Japanese name; fall back to English name
  const ja = context.match(/\bja:\s*"((?:[^"\\]|\\.)*)"/);
  if (ja) return ja[1];
  const en = context.match(/\ben:\s*"((?:[^"\\]|\\.)*)"/);
  return en ? en[1] : null;
}

function buildJpLine(name: string): string {
  const query = encodeURIComponent(name);
  const rawUrl = `https://www.amazon.co.jp/s?k=${query}`;
  // Escape the name for use as productId (no URIs there, just a label)
  const pid = name.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `      { network: "amazon-jp", productId: "${pid}", rawUrl: "${rawUrl}", markets: ["JP"], approved: true },`;
}

// ── main pass ─────────────────────────────────────────────────────────────────

const out: string[] = [];
let inLinks = false;
let linksHasJP = false;
let context: string[] = [];   // rolling window of recent lines for name extraction
let addedCount = 0;
let skippedCount = 0;

for (const line of lines) {
  if (!inLinks) {
    context.push(line);
    if (context.length > 50) context.shift();

    // Detect start of a links array (4-space indent)
    if (/^ {4}links: \[$/.test(line)) {
      inLinks = true;
      linksHasJP = false;
    }
    out.push(line);
  } else {
    // Inside links block — detect JP market presence
    if (/"JP"/.test(line)) linksHasJP = true;

    // Detect closing of links array (4-space indent, not 6-space link entry)
    if (/^ {4}\],$/.test(line)) {
      if (linksHasJP) {
        skippedCount++;
      } else {
        const ctxStr = context.join("\n");
        const name = extractJaName(ctxStr);
        if (name) {
          out.push(buildJpLine(name));
          addedCount++;
        } else {
          console.warn("  ⚠ no name found near:", ctxStr.slice(-200));
        }
      }
      inLinks = false;
    }
    out.push(line);
  }
}

fs.writeFileSync(catalogPath, out.join("\n"), "utf8");
console.log(`✅ Done — added: ${addedCount}, already had JP: ${skippedCount}`);
