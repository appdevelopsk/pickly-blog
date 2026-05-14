/**
 * Pinterest Business 一括投稿用CSV生成スクリプト
 *
 * Pinterest API が Trial access の間は API 経由投稿不可。
 * このスクリプトが生成する CSV を Pinterest Business → ピンを作成 →
 * 複数のピンを作成 → CSVでアップロード から手動投稿する。
 *
 * Usage:
 *   npx tsx export-csv.ts                     # 全件 (最大1000件/CSV)
 *   npx tsx export-csv.ts --limit 100          # 件数指定
 *   npx tsx export-csv.ts --locale en          # 言語絞り込み
 *   npx tsx export-csv.ts --locale ja --limit 200
 *
 * Output: ./pinterest-export-<locale>-<timestamp>.csv
 *
 * Pinterest CSV 列: Title,Description,Link,Image URL,Alt text,Published date,
 *   Call to action (省略可)
 *
 * 参考: https://help.pinterest.com/en/business/article/create-pins-in-bulk
 */
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { fileURLToPath } from "node:url";
import * as yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PINS_PATH = path.resolve(__dirname, "pins.yaml");
const STATE_PATH = path.join(os.homedir(), ".config/pickly/pinterest-posted.json");
const SITE_URL = "https://pickly.blog";

interface Pin {
  pin_id: string;
  article_slug?: string;
  locale: string;
  variant: string;
  title: string;
  description: string;
  link: string;
  image_alt?: string;
  hashtags?: string[];
}

interface PinsYaml {
  site_url?: string;
  board_id?: string;
  pins: Pin[];
}

function loadPosted(): Set<string> {
  if (!fs.existsSync(STATE_PATH)) return new Set();
  try {
    const d = JSON.parse(fs.readFileSync(STATE_PATH, "utf8"));
    return new Set(Object.keys(d.posted ?? {}));
  } catch { return new Set(); }
}

function escapeCsv(v: string): string {
  const s = v.replace(/"/g, '""');
  return `"${s}"`;
}

const LOCALE_RE = /\/(en|ja|zh-CN|zh-TW|ko|es|pt-BR|fr|de|it|ru|ar|hi|id|th|vi|tr)\//;

function resolveLink(link: string): string {
  const abs = link.startsWith("http") ? link : `${SITE_URL}${link}`;
  if (!abs.includes("/articles/")) {
    return abs.replace(LOCALE_RE, (_, loc) => `/${loc}/articles/`).replace(/\/?$/, "/");
  }
  return abs;
}

async function main() {
  const args = process.argv.slice(2);
  const get = (f: string) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : undefined; };
  const limit = parseInt(get("--limit") ?? "1000", 10);
  const localeFilter = get("--locale");

  const raw = fs.readFileSync(PINS_PATH, "utf8");
  const data = yaml.load(raw) as PinsYaml;
  const allPins: Pin[] = data.pins ?? [];
  const posted = loadPosted();

  let pins = allPins.filter((p) => !posted.has(p.pin_id));
  if (localeFilter) pins = pins.filter((p) => p.locale === localeFilter);
  pins = pins.slice(0, limit);

  const tag = localeFilter ?? "all";
  const ts = new Date().toISOString().slice(0, 10);
  const outPath = path.resolve(__dirname, `pinterest-export-${tag}-${ts}.csv`);

  const header = ["Title", "Description", "Link", "Image URL", "Alt text"].join(",");
  const rows: string[] = [header];

  for (const p of pins) {
    const slug = p.article_slug ?? ((p.link ?? "").match(/\/([^/]+)\/?$/) ?? [])[1] ?? p.pin_id;
    const imageUrl = `${SITE_URL}/og/${slug}-${p.locale}.png`;
    const link = resolveLink(p.link ?? "");
    const desc = p.description.trim();
    rows.push([
      escapeCsv(p.title.slice(0, 100)),
      escapeCsv(desc.slice(0, 500)),
      escapeCsv(link),
      escapeCsv(imageUrl),
      escapeCsv((p.image_alt ?? p.title).slice(0, 500)),
    ].join(","));
  }

  fs.writeFileSync(outPath, rows.join("\n"), "utf8");
  console.log(`✓ ${pins.length} ピン → ${path.basename(outPath)}`);
  console.log(`  未投稿残り: ${allPins.filter((p) => !posted.has(p.pin_id)).length - pins.length} 件`);
}

main().catch((e) => { console.error(e); process.exit(1); });
