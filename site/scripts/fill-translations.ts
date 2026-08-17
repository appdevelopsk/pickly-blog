#!/usr/bin/env tsx
/**
 * keep記事(index対象)の欠落翻訳を Claude で埋める。
 *
 * 背景(2026-07-30 Bing実測): ロケール別CTRは ko 40% / zh-TW 23.8% / ja 11.7% / de 11.6%
 *   に対し en 7.7% / fr 7.3%。表示の47%を占める en+fr がCTR最低クラスで、
 *   CTRの高い言語ほど翻訳が欠けている。「実証済みの勝ち記事を高CTR言語へ広げる」のが
 *   面積投入として最も筋が良い(死蔵記事のnoindex解除=面積拡大実験v1 とは別物)。
 *
 * ★meta.ts の locales 配列が配信を制御している(page.tsx: locales に無いと静的生成すらされない)。
 *   messages/<locale>.json を置くだけでは配信されないので、本スクリプトが両方を更新する。
 *
 * エンジンは2種類(--engine):
 *   cli (既定) … headless `claude -p`。Claude Code のサブスク認証をそのまま使うので
 *                 APIキー不要。構造化出力が使えないぶん検証+リトライで担保する。
 *   api        … Anthropic SDK。構造化出力でキー破壊を構造的に防げるが
 *                 ANTHROPIC_API_KEY が必要(このMacには未設定)。
 *
 * 使い方:
 *   npx tsx scripts/fill-translations.ts --locale zh-TW --dry-run
 *   npx tsx scripts/fill-translations.ts --locale zh-TW --limit 3
 *   npx tsx scripts/fill-translations.ts --locale zh-TW              # 欠落分すべて
 *   ANTHROPIC_API_KEY=... npx tsx scripts/fill-translations.ts --locale ko --engine api
 *
 * 翻訳方針は pipeline/prompts/02_translate.md に準拠。
 */
import Anthropic from "@anthropic-ai/sdk";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
// shell 関数の claude ラッパー(バックグラウンド+fg)を踏まないよう実バイナリを直接叩く。
const CLAUDE_BIN = `${process.env.HOME}/.local/bin/claude`;

const HERE = dirname(fileURLToPath(import.meta.url));
const ARTICLES = resolve(HERE, "../src/articles");
const DEINDEXED_PATH = resolve(HERE, "../src/lib/articles/deindexed-slugs.ts");

const MODEL = "claude-opus-5";
// 出力は入力とほぼ同量(1記事 8-10k tokens)。Opus 5 は thinking が既定でONで、
// max_tokens は thinking + 本文の合計上限なので十分な余裕を取る。
const MAX_TOKENS = 32000;
const PRICE_IN = 5 / 1_000_000; // USD/token
const PRICE_OUT = 25 / 1_000_000;

// pipeline/prompts/02_translate.md のトーン指示
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
const ENGINE = (flag("engine") ?? "cli") as "cli" | "api";
const DRY = args.includes("--dry-run");
// 既存ファイルの欠落キーだけを埋めるモード(既定の「ファイルごと欠落」とは対象が排他)
const FILL_KEYS = args.includes("--fill-keys");
// 特定 slug だけを対象にする(実流入のある記事から先に潰すため)
const ONLY = flag("slugs")?.split(",").filter(Boolean);

if (ENGINE !== "cli" && ENGINE !== "api") {
  console.error("--engine は cli か api");
  process.exit(1);
}

if (!LOCALE || !TONE[LOCALE]) {
  console.error(`--locale が必要です。対応: ${Object.keys(TONE).join(", ")}`);
  process.exit(1);
}

/** DEINDEXED_SLUGS を読む(noindex の死蔵記事は対象外) */
function deindexedSlugs(): Set<string> {
  const src = readFileSync(DEINDEXED_PATH, "utf8");
  return new Set([...src.matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]));
}

/** en.json の実体から JSON Schema を組む。additionalProperties:false + required で
 *  キー欠落・キー追加・offerNotes のキー翻訳を構造的に禁止する。 */
function schemaOf(v: Json, path = "$"): Record<string, unknown> {
  if (Array.isArray(v)) {
    return { type: "array", items: v.length ? schemaOf(v[0], `${path}[]`) : { type: "string" } };
  }
  if (v !== null && typeof v === "object") {
    // 表示ラベルがキーのオブジェクトは、キー自体が訳される想定なので固定しない
    if (LABEL_KEYED.test(path)) return { type: "object" };
    const properties: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v)) properties[k] = schemaOf(val, `${path}.${k}`);
    return { type: "object", properties, required: Object.keys(v), additionalProperties: false };
  }
  if (typeof v === "number") return { type: "number" };
  if (typeof v === "boolean") return { type: "boolean" };
  return { type: "string" };
}

/** キーが「識別子」でなく「表示ラベル」なので、翻訳されるのが正しいオブジェクト。
 *
 *  全781記事の en.json を走査して葉マップを分類した結果、キー自体がデータなのは
 *  `products[].specs`(1320箇所) と `products[].scores`(1309箇所) の2つだけ。
 *  どちらも画面にラベルとして出る(page.tsx:118)し、既存の ja も訳している
 *  (容量/モーター、冷凍品質/コスパ)。
 *
 *  逆にキーが識別子で絶対に訳させてはいけないのは offerNotes(537) /
 *  オブジェクト形の recommendedFor(15) / オブジェクト形の sections(4)。
 *  offerNotes には `waterwipes` のようにハイフンを含まない offerId もあるので
 *  「ハイフンの有無」で自動判定してはいけない。だから許可リスト方式にしている。 */
const LABEL_KEYED = /\.(specs|scores)$/;

/** 構造一致の検証。Schema では配列長を強制できないので、ここで見る。 */
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
      // キーは訳されてよい。個数と値の形だけ順序で照合する。
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

/** offerId は識別子。翻訳されたら壊れるので値の同一性を検証する。 */
function offerIdErrors(en: Json, out: Json, path = "$"): string[] {
  if (Array.isArray(en)) {
    return en.flatMap((x, i) => offerIdErrors(x, (out as Json[])[i], `${path}[${i}]`));
  }
  if (en !== null && typeof en === "object") {
    const o = (out ?? {}) as Record<string, Json>;
    return Object.entries(en).flatMap(([k, v]) => {
      if (k === "offerId" && v !== o[k]) return [`${path}.offerId: "${v}" → "${o[k]}"`];
      // specs のようにキーが訳されるオブジェクトでは o[k] が無い。offerId は
      // そこには出てこないので、辿れない枝は打ち切ってよい。
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
7. "meta.title" must stay under 60 characters in the target language, and shorter still in practice: SERPs
   truncate by DISPLAY WIDTH, not character count. Full-width scripts (CJK, Thai) count double, so budget
   ~55 for mixed-script titles and ~28-30 actual characters for CJK/Thai. When in doubt, write it shorter
   than feels necessary — a title that reads slightly terse is far better than one that gets cut mid-word.
   "meta.description" stays under 155 characters (Latin) / ~75 characters (CJK/Thai) by the same rule.`;

let client: Anthropic | undefined;

let totalIn = 0;
let totalOut = 0;
let totalCost = 0; // cli エンジンは envelope の total_cost_usd を積む

type CallResult = { text: string } | { fatal: string } | { retry: string };

/** SDK 経由。en.json から生成した JSON Schema で構造を縛れる。 */
async function callApi(prompt: string, schema: Record<string, unknown>): Promise<CallResult> {
  client ??= new Anthropic();
  const message = await client.messages
    .stream({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM,
      output_config: { format: { type: "json_schema", schema } },
      messages: [{ role: "user", content: prompt }],
    })
    .finalMessage();

  totalIn += message.usage.input_tokens;
  totalOut += message.usage.output_tokens;

  if (message.stop_reason === "refusal")
    return { fatal: `拒否された (${message.stop_details?.category ?? "?"})` };
  if (message.stop_reason === "max_tokens") return { fatal: "max_tokens で切れた" };

  const block = message.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") return { fatal: "テキストブロックが無い" };
  return { text: block.text };
}

/** headless claude 経由。構造化出力が無いので JSON だけ返すよう指示し、
 *  コードフェンスが付いた場合に備えて剥がしてから検証にかける。 */
async function callCli(prompt: string): Promise<CallResult> {
  let stdout: string;
  try {
    ({ stdout } = await execFileAsync(
      CLAUDE_BIN,
      ["-p", prompt, "--output-format", "json", "--model", "opus"],
      { maxBuffer: 64 * 1024 * 1024, timeout: 15 * 60 * 1000 },
    ));
  } catch (e) {
    // claude 自体が起動/実行に失敗(認証切れ・レート制限・タイムアウト)。
    // 実際に長時間バッチの途中で認証が切れ、残り58本が一斉に落ちた。
    // 出力内容の問題ではないので、待ってからリトライする価値がある。
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
  // ```json ... ``` で包まれることがあるので剥がす
  const fenced = envelope.result.match(/```(?:json)?\s*([\s\S]*?)```/);
  return { text: (fenced ? fenced[1] : envelope.result).trim() };
}

/** en にあってロケール側に無いトップレベルキー。
 *
 *  ★2026-08-17: 既存ファイルの「部分欠落」がこのスクリプトの盲点だった。
 *  en に後から追加された `recommendedFor` が他ロケールへ展開されず、
 *  isArticleBodyTranslated() の BODY_KEYS 判定に落ちて、本文が翻訳済みの記事まで
 *  /en/ へ meta-refresh するだけの stub として出力されていた
 *  (de/it/es/fr の実流入 212 engaged のうち 72 = 34% が stub 着地)。
 *  従来の main() は `!existsSync(<locale>.json)` しか見ないので永久に拾えない。 */
function missingKeys(en: Json, cur: Json): string[] {
  if (en === null || typeof en !== "object" || Array.isArray(en)) return [];
  if (cur === null || typeof cur !== "object" || Array.isArray(cur)) return [];
  const c = cur as Record<string, Json>;
  return Object.entries(en as Record<string, Json>)
    .filter(([k, v]) => v !== null && c[k] === undefined)
    .map(([k]) => k);
}

async function translateOne(slug: string): Promise<"ok" | "skip" | "fail"> {
  const dir = `${ARTICLES}/${slug}`;
  const enPath = `${dir}/messages/en.json`;
  const outPath = `${dir}/messages/${LOCALE}.json`;
  const enFull = JSON.parse(readFileSync(enPath, "utf8")) as Json;

  // fill-keys モードでは欠けているキーだけを翻訳対象にする。全文を再翻訳すると
  // 既存の訳が別物に差し替わってしまい、差分レビューが不可能になる。
  const existing =
    FILL_KEYS && existsSync(outPath)
      ? (JSON.parse(readFileSync(outPath, "utf8")) as Record<string, Json>)
      : undefined;
  const gaps = existing ? missingKeys(enFull, existing) : [];
  if (existing && !gaps.length) return "skip";
  const en: Json = existing
    ? Object.fromEntries(gaps.map((k) => [k, (enFull as Record<string, Json>)[k]]))
    : enFull;

  // cli エンジンには system 相当のルールを本文に畳み込む(--append-system-prompt は
  // Claude Code 既定プロンプトへの「追記」で、JSONだけ返す挙動を保証しないため)。
  const prompt = `${ENGINE === "cli" ? `${SYSTEM}\n\n---\n\n` : ""}Translate this pickly.blog article from English into ${LOCALE}.

Locale tone guidance: ${TONE[LOCALE!]}

Return the same JSON object with every human-readable string translated.${
    ENGINE === "cli"
      ? " Output the raw JSON object only — no prose, no explanation, no code fence."
      : ""
  }

${JSON.stringify(en, null, 2)}`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    const res =
      ENGINE === "api" ? await callApi(prompt, schemaOf(en)) : await callCli(prompt);

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

    // 既存ファイルへは「欠けていたキーを足すだけ」。キー順は en.json に揃える
    // (既存の訳は values をそのまま持ち越すので、差分は追加分だけになる)。
    const merged: Json = existing
      ? (Object.fromEntries(
          Object.keys(enFull as Record<string, Json>)
            .filter((k) => existing[k] !== undefined || (out as Record<string, Json>)[k] !== undefined)
            .map((k) => [k, existing[k] ?? (out as Record<string, Json>)[k]]),
        ) as Json)
      : out;

    writeFileSync(outPath, JSON.stringify(merged, null, 2) + "\n");
    // 既存ファイルへの追記なら、そのロケールは既に配信対象。meta.ts は触らない。
    if (!existing) addLocaleToMeta(dir);
    console.log(`  ✓ ${slug}${existing ? ` (+${gaps.join(", ")})` : ""}`);
    return "ok";
  }
  console.warn(`  ✗ ${slug}: 3回とも失敗`);
  return "fail";
}

/** ★meta.ts の locales に追加しないと静的生成されず配信されない。
 *
 *  ただし 781記事中601本は `locales: [...ALL_LOCALES]` のスプレッド形で、これは
 *  既に全ロケールを含むので手を触れてはいけない。素朴に「引用符付き文字列を拾って
 *  書き戻す」実装にすると `[...ALL_LOCALES]` が `["zh-TW"]` に潰れ、その記事の
 *  他言語版が全部消える(実際に一度踏んだ)。リテラル配列のときだけ書き換える。 */
function addLocaleToMeta(dir: string) {
  const metaPath = `${dir}/meta.ts`;
  const src = readFileSync(metaPath, "utf8");
  // `locales: ALL_LOCALES` の裸の定数参照。既に全ロケールを含むので触らなくてよい
  // (`[...ALL_LOCALES]` のスプレッド形と同じ扱い)。以前はここで例外を投げていた。
  if (/locales:\s*[A-Z_]+\s*,/.test(src)) return;
  const m = src.match(/locales:\s*\[([^\]]*)\]/);
  if (!m) throw new Error(`${metaPath}: locales 配列が見つからない`);

  const inner = m[1];
  // 引用符付き文字列・カンマ・空白 以外が混ざる = スプレッドや定数参照 → 触らない
  if (inner.replace(/"[^"]*"|[\s,]/g, "") !== "") return;

  const list = [...inner.matchAll(/"([^"]+)"/g)].map((x) => x[1]);
  if (list.includes(LOCALE!)) return;
  const next = [...list, LOCALE!];
  writeFileSync(
    metaPath,
    src.slice(0, m.index!) +
      `locales: [${next.map((l) => `"${l}"`).join(", ")}]` +
      src.slice(m.index! + m[0].length),
  );
}

async function main() {
  const deindexed = deindexedSlugs();
  const all = readdirSync(ARTICLES).filter((d) => statSync(`${ARTICLES}/${d}`).isDirectory());
  const keep = all.filter((s) => !deindexed.has(s));
  const hasEn = (s: string) => existsSync(`${ARTICLES}/${s}/messages/en.json`);
  const locPath = (s: string) => `${ARTICLES}/${s}/messages/${LOCALE}.json`;
  const missing = keep.filter((s) =>
    hasEn(s) &&
    (FILL_KEYS
      ? existsSync(locPath(s)) &&
        missingKeys(
          JSON.parse(readFileSync(`${ARTICLES}/${s}/messages/en.json`, "utf8")) as Json,
          JSON.parse(readFileSync(locPath(s), "utf8")) as Json,
        ).length > 0
      : !existsSync(locPath(s))),
  );
  const filtered = ONLY ? missing.filter((s) => ONLY.includes(s)) : missing;
  const targets = filtered.slice(0, LIMIT);

  console.log(
    `[engine=${ENGINE}${FILL_KEYS ? " fill-keys" : ""}] 記事 ${all.length} / keep ${keep.length} / ` +
      `${LOCALE} 対象 ${missing.length}${ONLY ? ` (slug指定で ${filtered.length})` : ""} → 今回 ${targets.length}件`,
  );
  if (DRY) {
    targets.forEach((s) => console.log(`  [dry-run] ${s}`));
    return;
  }
  if (!targets.length) return;

  const queue = [...targets];
  const tally = { ok: 0, fail: 0, skip: 0 };
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
      for (let slug = queue.shift(); slug; slug = queue.shift()) {
        try {
          tally[await translateOne(slug)]++;
        } catch (e) {
          tally.fail++;
          console.warn(`  ✗ ${slug}: ${(e as Error).message}`);
        }
      }
    }),
  );

  const usage =
    ENGINE === "api"
      ? `tokens in ${totalIn.toLocaleString()} / out ${totalOut.toLocaleString()} ≈ $${(
          totalIn * PRICE_IN + totalOut * PRICE_OUT
        ).toFixed(2)}`
      : `概算コスト $${totalCost.toFixed(2)} (claude が申告した total_cost_usd の合計)`;
  console.log(
    `\n完了: 成功 ${tally.ok} / 失敗 ${tally.fail}` +
      `\n${usage}` +
      `\n次: npm run validate && npm run build で確認`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
