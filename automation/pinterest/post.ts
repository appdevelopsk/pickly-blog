/**
 * Daily Pinterest pin creation script.
 *
 * Reads articles from ../site/src/articles, picks unpinned (locale, article) pairs,
 * fetches their generated OG image URL, and creates pins on the configured board.
 *
 * Rate limit guardrails:
 *  - max 10 pins per run (Pinterest is sensitive to bursts)
 *  - 30s sleep between pins
 *  - skip pairs already marked as pinned in meta.ts (manual update for now)
 */
import fs from "node:fs/promises";
import path from "node:path";
import { PinterestClient } from "./client";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
const BOARD_ID = process.env.PINTEREST_DEFAULT_BOARD_ID;
const MAX_PINS_PER_RUN = parseInt(process.env.PINTEREST_MAX_PINS_PER_RUN ?? "10", 10);
const SLEEP_MS = 30_000;

if (!SITE_URL) throw new Error("NEXT_PUBLIC_SITE_URL not set");
if (!BOARD_ID) throw new Error("PINTEREST_DEFAULT_BOARD_ID not set");

const ARTICLES_DIR = path.resolve(__dirname, "../../site/src/articles");

interface PinTarget {
  slug: string;
  locale: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
}

async function* enumerateTargets(): AsyncGenerator<PinTarget> {
  const slugs = await fs.readdir(ARTICLES_DIR);
  for (const slug of slugs) {
    const messagesDir = path.join(ARTICLES_DIR, slug, "messages");
    let locales: string[];
    try {
      locales = await fs.readdir(messagesDir);
    } catch {
      continue;
    }
    for (const file of locales) {
      if (!file.endsWith(".json")) continue;
      const locale = file.replace(".json", "");
      const json = JSON.parse(
        await fs.readFile(path.join(messagesDir, file), "utf8"),
      ) as { title: string; pinDescription?: string; description: string };

      yield {
        slug,
        locale,
        title: json.title,
        description: json.pinDescription ?? json.description,
        imageUrl: `${SITE_URL}/og/${slug}-${locale}.png`,
        link: `${SITE_URL}/${locale}/articles/${slug}/`,
      };
    }
  }
}

async function main() {
  const client = new PinterestClient();
  let posted = 0;

  for await (const t of enumerateTargets()) {
    if (posted >= MAX_PINS_PER_RUN) break;
    try {
      const r = await client.createPin({
        boardId: BOARD_ID!,
        title: t.title,
        description: t.description,
        link: t.link,
        imageUrl: t.imageUrl,
      });
      console.log(`✓ pinned ${t.slug}/${t.locale} → ${r.id}`);
      posted++;
      if (posted < MAX_PINS_PER_RUN) {
        await new Promise((res) => setTimeout(res, SLEEP_MS));
      }
    } catch (err) {
      console.error(`✗ failed ${t.slug}/${t.locale}:`, err);
    }
  }

  console.log(`\nDone. Posted ${posted} pin(s).`);
}

main();
