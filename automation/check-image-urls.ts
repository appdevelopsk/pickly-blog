/**
 * Checks all imageUrl fields in catalog.ts for broken links.
 * Reads catalog source directly with regex — no build step needed.
 *
 * Usage:
 *   cd automation && npx tsx check-image-urls.ts
 *   cd automation && npx tsx check-image-urls.ts --fix  (prints fixable suggestions)
 *
 * Exit codes:
 *   0 = all OK (or no imageUrls found)
 *   1 = one or more broken URLs
 */

import { readFileSync } from "fs";
import { resolve } from "path";

const CATALOG_PATH = resolve(import.meta.dirname, "../site/src/lib/affiliates/catalog.ts");
const CONCURRENCY = 10;
const TIMEOUT_MS = 15_000;

interface Result {
  id: string;
  url: string;
  status: number | "timeout" | "error";
  ok: boolean;
}

function extractEntries(src: string): { id: string; url: string }[] {
  const entries: { id: string; url: string }[] = [];
  // Match each catalog object's id and imageUrl (on same line or within ~400 chars)
  const idRe = /id:\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = idRe.exec(src)) !== null) {
    const id = m[1];
    const snippet = src.slice(m.index, m.index + 500);
    const imgMatch = snippet.match(/imageUrl:\s*"([^"]+)"/);
    if (imgMatch) {
      entries.push({ id, url: imgMatch[1] });
    }
  }
  return entries;
}

async function checkUrl(url: string): Promise<number | "timeout" | "error"> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ImageChecker/1.0)" },
    });
    clearTimeout(timer);
    // Some servers reject HEAD — fall back to GET range request
    if (res.status === 405 || res.status === 403) {
      const res2 = await fetch(url, {
        method: "GET",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; ImageChecker/1.0)",
          Range: "bytes=0-0",
        },
        redirect: "follow",
      });
      return res2.status;
    }
    return res.status;
  } catch (e: unknown) {
    clearTimeout(timer);
    if (e instanceof Error && e.name === "AbortError") return "timeout";
    return "error";
  }
}

async function runBatch(entries: { id: string; url: string }[]): Promise<Result[]> {
  const results: Result[] = [];
  for (let i = 0; i < entries.length; i += CONCURRENCY) {
    const batch = entries.slice(i, i + CONCURRENCY);
    const settled = await Promise.all(
      batch.map(async ({ id, url }) => {
        const status = await checkUrl(url);
        const ok = typeof status === "number" && status >= 200 && status < 400;
        return { id, url, status, ok } satisfies Result;
      })
    );
    results.push(...settled);
    const done = Math.min(i + CONCURRENCY, entries.length);
    process.stderr.write(`  checked ${done}/${entries.length}\r`);
  }
  process.stderr.write("\n");
  return results;
}

async function main() {
  const src = readFileSync(CATALOG_PATH, "utf8");
  const entries = extractEntries(src);

  const totalProducts = (src.match(/^\s*id:\s*"/gm) ?? []).length;
  const withImage = entries.length;
  const withoutImage = totalProducts - withImage;

  console.log(`\n=== Image URL Audit — ${new Date().toISOString().slice(0, 10)} ===`);
  console.log(`Total products : ${totalProducts}`);
  console.log(`With imageUrl  : ${withImage}`);
  console.log(`Without imageUrl: ${withoutImage}  ← needs images\n`);

  if (entries.length === 0) {
    console.log("No imageUrl fields found.");
    process.exit(0);
  }

  console.log(`Checking ${entries.length} URLs (concurrency=${CONCURRENCY})...`);
  const results = await runBatch(entries);

  const broken = results.filter((r) => !r.ok);
  const ok = results.filter((r) => r.ok);

  console.log(`\n✅ OK     : ${ok.length}`);
  console.log(`❌ Broken : ${broken.length}`);

  if (broken.length > 0) {
    console.log("\n--- Broken URLs ---");
    for (const r of broken) {
      console.log(`  [${r.status}] ${r.id}`);
      console.log(`        ${r.url}`);
    }
    console.log(
      "\nFix: update imageUrl for broken entries in site/src/lib/affiliates/catalog.ts"
    );
    process.exit(1);
  } else {
    console.log("\nAll image URLs are healthy.");
    process.exit(0);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
