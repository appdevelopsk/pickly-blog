#!/usr/bin/env tsx
/**
 * 既存の messages/<locale>.json はあるが、en.json と構造が一致しない
 * (products/recommendedFor 等が欠落・要素数不足)記事を検出し、
 * 全文を再翻訳して上書きする。
 *
 * fill-translations.ts はロケールファイルが「存在しない」場合だけを対象にする。
 * こちらは「存在するが不完全」なケース(2026-08-13 監査で発見、fr は手動で
 * 4記事/コミットのペースで埋めていた)を自動化する。判定・翻訳ロジックは
 * fill-translations.ts の shapeErrors / SYSTEM / callCli をそのまま流用。
 *
 * 使い方:
 *   npx tsx scripts/fill-partial-fields.ts --locale fr --dry-run
 *   npx tsx scripts/fill-partial-fields.ts --locale fr --limit 10
 *   npx tsx scripts/fill-partial-fields.ts --locale fr
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const CLAUDE_BIN = `${process.env.HOME}/.local/bin/claude`;

const HERE = dirname(fileURLToPath(import.meta.url));
const ARTICLES = resolve(HERE, "../src/articles");
const DEINDEXED_PATH = resolve(HERE, "../src/lib/articles/deindexed-slugs.ts");

const TONE: Record<string, string> = {
  ja: "丁寧体(です・ます調)。「結論」のような直接表現を避け、「実際に〜してみた」系のニュアンス。価格は¥(2026年で約¥150/USD)。",
  "zh-CN": "简体中文。简洁、数据先行、避免过度修辞。价格用 ¥(人民币)。",
  "zh-TW": "繁體中文。語感稍微正式。價格用 NT$。",
  ko: "격식체 기본. 상품 리뷰는 다소 캐주얼해도 무방. 가격은 ₩.",
  es: "España基準(vosotros避ける、tú中心)。価格は €。",
  "pt-BR": "Brasil基準、informal você。価格は R$。",
  de: "テック系は du 可、それ以外は Sie。価格は €。",
  fr: "vous基本。価格は €。",
  it: "Lei と tu は商品ジャンル次第。価格は €。",
  ru: "вы基本。価格は € または USD(ルーブルは不安定なため)。",
  ar: "RTL、Modern Standard Arabic(MSA)。価格は USD または現地通貨。",
  hi: "Devanagari スクリプト(Hindi-Roman ではない)。価格は ₹。",
  id: "標準インドネシア語。Bahasa Gaul は使わない。",
  th: "ภาษาราชการ。敬語の使い分けに注意。価格は ฿。",
  vi: "標準ベトナム語、phổ thông。",
  tr: "標準トルコ語。商品レビューは多少カジュアルでも可。",
};

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

const args = process.argv.slice(2);
const flag = (name: string): string | undefined => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const LOCALE = flag("locale");
const LIMIT = Number(flag("limit") ?? Infinity);
const CONCURRENCY = Number(flag("concurrency") ?? 3);
const DRY = args.includes("--dry-run");

if (!LOCALE || !TONE[LOCALE]) {
  console.error(`--locale が必要です。対応: ${Object.keys(TONE).join(", ")}`);
  process.exit(1);
}

function deindexedSlugs(): Set<string> {
  const src = readFileSync(DEINDEXED_PATH, "utf8");
  return new Set([...src.matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]));
}

const LABEL_KEYED = /\.(specs|scores)$/;

function shapeErrors(a: Json, b: Json, path = "$"): string[] {
  if (Array.isArray(a)) {
    if (!Array.isArray(b)) return [`${path}: 配列でない`];
    if (a.length !== b.length) return [`${path}: 要素数 ${a.length} → ${b.length}`];
    return a.flatMap((x, i) => shapeErrors(x, (b as Json[])[i], `${path}[${i}]`));
  }
  if (a !== null && typeof a === "object") {
    if (b === null || typeof b !== "object" || Array.isArray(b)) return [`${path}: オブジェクトでない`];
    const av = Object.entries(a);
    const bv = Object.entries(b as Record<string, Json>);
    if (LABEL_KEYED.test(path)) {
      if (av.length !== bv.length) return [`${path}: 項目数 ${av.length} → ${bv.length}`];
      return av.flatMap(([k, v], i) => shapeErrors(v, bv[i][1], `${path}.${k}`));
    }
    const ak = Object.keys(a).sort().join(",");
    const bk = Object.keys(b as object).sort().join(",");
    if (ak !== bk) return [`${path}: キー不一致 [${ak}] → [${bk}]`];
    return av.flatMap(([k, v]) => shapeErrors(v, (b as Record<string, Json>)[k], `${path}.${k}`));
  }
  if (typeof a !== typeof b) return [`${path}: 型 ${typeof a} → ${typeof b}`];
  if (typeof a === "string" && a.trim() !== "" && (b as string).trim() === "")
    return [`${path}: 空文字になっている`];
  return [];
}

function offerIdErrors(en: Json, out: Json, path = "$"): string[] {
  if (Array.isArray(en)) {
    return en.flatMap((x, i) => offerIdErrors(x, (out as Json[])[i], `${path}[${i}]`));
  }
  if (en !== null && typeof en === "object") {
    const o = (out ?? {}) as Record<string, Json>;
    return Object.entries(en).flatMap(([k, v]) => {
      if (k === "offerId" && v !== o[k]) return [`${path}.offerId: "${v}" → "${o[k]}"`];
      if (o[k] === undefined) return [];
      return offerIdErrors(v, o[k], `${path}.${k}`);
    });
  }
  return [];
}

const SYSTEM = `You translate product-review articles for pickly.blog. You return only the translated JSON object.

Hard rules:
1. No machine-translation feel. Write as a native speaker rewriting the article — same facts, idiomatic phrasing.
2. Keep the JSON structure byte-for-byte identical in shape: same keys, same array lengths, same nesting. Only the human-readable string values change.
3. NEVER translate or alter these: any "offerId" value, and the keys of the "offerNotes" object. They are database identifiers.
4. Never translate brand or product model names (e.g. "Speedo Vanquisher 2.0", "NordVPN") unless the brand has an official localized name.
5. Localize prices, units, dates, and any US-specific references to locale-appropriate equivalents. Keep all numbers factually accurate.
6. "pinDescription" is a Pinterest hook — rewrite it from scratch for the target culture rather than translating it literally.
7. "meta.title" must stay under 60 characters and "meta.description" under 155 characters in the target language.`;

let totalCost = 0;

type CallResult = { text: string } | { fatal: string } | { retry: string };

async function callCli(prompt: string): Promise<CallResult> {
  let stdout: string;
  try {
    ({ stdout } = await execFileAsync(
      CLAUDE_BIN,
      ["-p", prompt, "--output-format", "json", "--model", "opus"],
      { maxBuffer: 64 * 1024 * 1024, timeout: 15 * 60 * 1000 },
    ));
  } catch (e) {
    const msg = (e as Error).message.split("\n")[0].slice(0, 120);
    await new Promise((r) => setTimeout(r, 30_000));
    return { retry: `claude 実行失敗: ${msg}` };
  }
  const envelope = JSON.parse(stdout) as {
    is_error?: boolean;
    result?: string;
    total_cost_usd?: number;
    subtype?: string;
  };
  totalCost += envelope.total_cost_usd ?? 0;
  if (envelope.is_error) return { retry: `claude エラー (${envelope.subtype ?? "?"})` };
  if (!envelope.result) return { retry: "result が空" };
  const fenced = envelope.result.match(/```(?:json)?\s*([\s\S]*?)```/);
  return { text: (fenced ? fenced[1] : envelope.result).trim() };
}

async function fillOne(slug: string): Promise<"ok" | "fail"> {
  const dir = `${ARTICLES}/${slug}`;
  const enPath = `${dir}/messages/en.json`;
  const outPath = `${dir}/messages/${LOCALE}.json`;
  const en = JSON.parse(readFileSync(enPath, "utf8")) as Json;

  const prompt = `${SYSTEM}\n\n---\n\nTranslate this pickly.blog article from English into ${LOCALE}.

Locale tone guidance: ${TONE[LOCALE!]}

Return the same JSON object with every human-readable string translated. Output the raw JSON object only — no prose, no explanation, no code fence.

${JSON.stringify(en, null, 2)}`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await callCli(prompt);
    if ("fatal" in res) {
      console.warn(`  ✗ ${slug}: ${res.fatal}`);
      return "fail";
    }
    if ("retry" in res) {
      console.warn(`  ! ${slug}: ${res.retry} (試行${attempt})`);
      continue;
    }
    let out: Json;
    try {
      out = JSON.parse(res.text) as Json;
    } catch {
      console.warn(`  ! ${slug}: JSON parse 失敗 (試行${attempt})`);
      continue;
    }
    const errs = [...shapeErrors(en, out), ...offerIdErrors(en, out)];
    if (errs.length) {
      console.warn(`  ! ${slug}: 構造不一致 ${errs.length}件 (試行${attempt}) 例: ${errs[0]}`);
      continue;
    }
    writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n");
    console.log(`  ✓ ${slug}`);
    return "ok";
  }
  console.warn(`  ✗ ${slug}: 3回とも失敗`);
  return "fail";
}

async function main() {
  const deindexed = deindexedSlugs();
  const all = readdirSync(ARTICLES).filter((d) => statSync(`${ARTICLES}/${d}`).isDirectory());
  const keep = all.filter((s) => !deindexed.has(s));

  const partial = keep.filter((s) => {
    const enPath = `${ARTICLES}/${s}/messages/en.json`;
    const locPath = `${ARTICLES}/${s}/messages/${LOCALE}.json`;
    if (!existsSync(enPath) || !existsSync(locPath)) return false;
    const en = JSON.parse(readFileSync(enPath, "utf8")) as Json;
    const loc = JSON.parse(readFileSync(locPath, "utf8")) as Json;
    return shapeErrors(en, loc).length > 0;
  });
  const targets = partial.slice(0, LIMIT);

  console.log(
    `記事 ${all.length} / keep ${keep.length} / ${LOCALE} 構造不一致(要修復) ${partial.length} → 今回 ${targets.length}件`,
  );
  if (DRY) {
    targets.forEach((s) => console.log(`  [dry-run] ${s}`));
    return;
  }
  if (!targets.length) return;

  const queue = [...targets];
  const tally = { ok: 0, fail: 0 };
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
      for (let slug = queue.shift(); slug; slug = queue.shift()) {
        try {
          tally[await fillOne(slug)]++;
        } catch (e) {
          tally.fail++;
          console.warn(`  ✗ ${slug}: ${(e as Error).message}`);
        }
      }
    }),
  );

  console.log(
    `\n完了: 成功 ${tally.ok} / 失敗 ${tally.fail}` +
      `\n概算コスト $${totalCost.toFixed(2)}` +
      `\n次: npm run validate && npm run build で確認`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
