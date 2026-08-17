#!/usr/bin/env tsx
/**
 * SERPタイトルの表示幅超過(60超)を検出して短縮する。[[serp-title-width-rule]]
 *
 * 背景(2026-08-17): fill-translations.ts の SYSTEM プロンプトが「60文字」を
 * 文字数として指示していたため、id/th/fr 等で表示幅60を超えるタイトルが
 * 大量生成された(プロンプト自体は本コミットで直したが、既存生成分は残る)。
 *
 * 使い方:
 *   npx tsx scripts/fix-title-width.ts --dry-run   # 検出のみ
 *   npx tsx scripts/fix-title-width.ts              # 短縮して書き込み
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const CLAUDE_BIN = `${process.env.HOME}/.local/bin/claude`;
const HERE = dirname(fileURLToPath(import.meta.url));
const ARTICLES = resolve(HERE, "../src/articles");
const DEINDEXED_PATH = resolve(HERE, "../src/lib/articles/deindexed-slugs.ts");

const DRY = process.argv.includes("--dry-run");

// audit-i18n.ts / check-built-output.mjs と同じ表示幅ルール
const WIDE = /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦]/;
const width = (t: string): number =>
  [...t].reduce((n, c) => n + (WIDE.test(c) ? 2 : 1), 0);
const LIMIT = 60;

function deindexedSlugs(): Set<string> {
  const src = readFileSync(DEINDEXED_PATH, "utf8");
  return new Set([...src.matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]));
}

function localesOf(dir: string): "ALL" | Set<string> {
  const src = readFileSync(`${dir}/meta.ts`, "utf8");
  if (/locales:\s*ALL_LOCALES/.test(src) || /locales:\s*\[\.\.\.ALL_LOCALES\]/.test(src)) return "ALL";
  const m = src.match(/locales:\s*\[([^\]]*)\]/);
  return new Set(m ? [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]) : []);
}

async function shortenOnce(title: string, locale: string, targetWidth: number): Promise<string | null> {
  const budget = WIDE.test(title) ? Math.round(targetWidth / 2) : targetWidth;
  const prompt = `Shorten this ${locale}-locale SEO title so its DISPLAY WIDTH is under ${targetWidth} (CJK/Thai count double, so aim for ~${budget} characters, current width is over budget). Keep the same meaning, product count, and year. Native phrasing, no ellipsis. Return ONLY the shortened title, no quotes, no explanation.\n\nTitle: ${title}`;
  try {
    const { stdout } = await execFileAsync(
      CLAUDE_BIN,
      ["-p", prompt, "--output-format", "json", "--model", "claude-opus-5"],
      { maxBuffer: 1024 * 1024 * 8, timeout: 60_000 },
    );
    const envelope = JSON.parse(stdout) as { is_error?: boolean; result?: string };
    if (envelope.is_error || !envelope.result) return null;
    return envelope.result.trim().replace(/^["']|["']$/g, "");
  } catch {
    return null;
  }
}

/** 1回で収まらないことがあるので、目標幅を段階的に絞って最大3回試す。 */
async function shorten(title: string, locale: string): Promise<string | null> {
  let cur = title;
  for (const targetWidth of [56, 50, 44]) {
    const short = await shortenOnce(cur, locale, targetWidth);
    if (!short) continue;
    if (width(short) <= LIMIT) return short;
    cur = short; // さらに縮める土台にする
  }
  return width(cur) <= LIMIT && cur !== title ? cur : null;
}

async function main() {
  const deindexed = deindexedSlugs();
  const all = readdirSync(ARTICLES).filter((d) => statSync(`${ARTICLES}/${d}`).isDirectory());
  const targets: { slug: string; locale: string; path: string; title: string; w: number }[] = [];

  for (const slug of all) {
    if (deindexed.has(slug)) continue; // noindexはSERPに出ないので対象外
    const dir = `${ARTICLES}/${slug}`;
    const msgDir = `${dir}/messages`;
    let locs: "ALL" | Set<string>;
    try {
      locs = localesOf(dir);
    } catch {
      continue;
    }
    for (const f of readdirSync(msgDir)) {
      if (!f.endsWith(".json") || f === "en.json") continue;
      const locale = f.slice(0, -5);
      if (locs !== "ALL" && !locs.has(locale)) continue;
      const path = `${msgDir}/${f}`;
      let m: Record<string, unknown>;
      try {
        m = JSON.parse(readFileSync(path, "utf8"));
      } catch {
        continue;
      }
      const meta = m.meta as Record<string, unknown> | undefined;
      const title = typeof meta?.title === "string" ? meta.title : "";
      const w = width(title);
      if (w > LIMIT) targets.push({ slug, locale, path, title, w });
    }
  }

  targets.sort((a, b) => b.w - a.w);
  console.log(`表示幅60超のタイトル: ${targets.length}件`);
  if (DRY) {
    for (const t of targets) console.log(`  ${t.w}  ${t.slug}/${t.locale}: ${t.title}`);
    return;
  }
  if (!targets.length) return;

  let ok = 0;
  let fail = 0;
  const queue = [...targets];
  await Promise.all(
    Array.from({ length: Math.min(4, queue.length) }, async () => {
      for (let t = queue.shift(); t; t = queue.shift()) {
        const short = await shorten(t.title, t.locale);
        if (!short || width(short) > LIMIT) {
          console.warn(`  ✗ ${t.slug}/${t.locale}: 短縮失敗 (幅${short ? width(short) : "?"})`);
          fail++;
          continue;
        }
        const m = JSON.parse(readFileSync(t.path, "utf8"));
        m.meta.title = short;
        writeFileSync(t.path, JSON.stringify(m, null, 2) + "\n");
        console.log(`  ✓ ${t.slug}/${t.locale}: [${t.w}→${width(short)}] ${short}`);
        ok++;
      }
    }),
  );
  console.log(`\n完了: 成功 ${ok} / 失敗 ${fail}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
