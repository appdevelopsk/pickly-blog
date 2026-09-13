/**
 * offerId → grade の索引を作る。
 *
 * grade は記事ごと・ロケールごとの src/articles/<slug>/messages/<locale>.json の
 * products[] にしか無く、CATALOG 側には無い(rating フィールドは宣言だけで投入0件)。
 * 製品単位のランキングを出すには offerId で引ける索引が要るので、ここで作って
 * grade-cache.json に落とす。サイト側は specs-cache.json と同じくこれを読むだけ。
 *
 * 同じ offerId が複数記事に違う grade で載っている場合は **最高点を採る**
 * (2026-09-13 ken 決定)。どの記事から採ったかを slug に残して追跡できるようにする。
 *
 * products[] には2形状ある:
 *   - 配列形式 (588記事): 要素が offerId と grade を持つ。索引できるのはこちら。
 *   - 辞書形式 (144記事): キーが offerId だが grade は720件中5件しか無いので実質対象外。
 * 両方とも読むが、grade の無いエントリは単に飛ばす。
 *
 * 出力は en を基準にする。grade は評点であって訳文ではないため、ロケールごとに
 * 値が変わることは想定しない。en が無い記事だけ ja で補う。
 */
import fs from "node:fs";
import path from "node:path";

/** 高い順。A+ が最上位。ここが唯一の正準順序で、リポジトリ内に既存の定義は無い。 */
const GRADE_ORDER = ["A+", "A", "A-", "B+", "B", "B-", "C+"] as const;
type Grade = (typeof GRADE_ORDER)[number];

const RANK = new Map<string, number>(GRADE_ORDER.map((g, i) => [g, i]));

/** 高い方を返す。未知の表記は採らない(順序を決められないため)。 */
function better(a: string | undefined, b: string): string | undefined {
  const rb = RANK.get(b);
  if (rb === undefined) return a;
  if (a === undefined) return b;
  const ra = RANK.get(a);
  if (ra === undefined) return b;
  return rb < ra ? b : a;
}

type Entry = { grade: Grade; slug: string };

function productsOf(raw: unknown): Record<string, unknown>[] {
  const p = (raw as { products?: unknown } | null)?.products;
  if (Array.isArray(p)) return p.filter((x): x is Record<string, unknown> => !!x && typeof x === "object");
  if (p && typeof p === "object") {
    // 辞書形式はキーが offerId。値側に offerId が無いので補って同じ形に均す。
    return Object.entries(p as Record<string, unknown>)
      .filter(([, v]) => !!v && typeof v === "object")
      .map(([k, v]) => ({ offerId: k, ...(v as Record<string, unknown>) }));
  }
  return [];
}

function main() {
  const articlesDir = path.join(process.cwd(), "src", "articles");
  const slugs = fs.readdirSync(articlesDir).filter((s) => !s.startsWith("."));

  const out: Record<string, Entry> = {};
  let scanned = 0;
  let graded = 0;
  let conflicts = 0;

  for (const slug of slugs) {
    let raw: unknown;
    let found = false;
    for (const locale of ["en", "ja"]) {
      const file = path.join(articlesDir, slug, "messages", `${locale}.json`);
      try {
        raw = JSON.parse(fs.readFileSync(file, "utf-8"));
        found = true;
        break;
      } catch {
        /* 次のロケールへ */
      }
    }
    if (!found) continue;
    scanned++;

    for (const entry of productsOf(raw)) {
      const offerId = entry.offerId;
      const grade = entry.grade;
      if (typeof offerId !== "string" || !offerId) continue;
      if (typeof grade !== "string" || !RANK.has(grade)) continue;
      graded++;

      const prev = out[offerId];
      if (!prev) {
        out[offerId] = { grade: grade as Grade, slug };
        continue;
      }
      if (prev.grade !== grade) conflicts++;
      const win = better(prev.grade, grade);
      if (win === grade && win !== prev.grade) out[offerId] = { grade: grade as Grade, slug };
    }
  }

  const sorted: Record<string, Entry> = {};
  for (const k of Object.keys(out).sort()) sorted[k] = out[k]!;

  const dest = path.join(process.cwd(), "src", "lib", "articles", "grade-cache.json");
  fs.writeFileSync(dest, JSON.stringify(sorted, null, 2) + "\n", "utf-8");

  const dist: Record<string, number> = {};
  for (const e of Object.values(sorted)) dist[e.grade] = (dist[e.grade] ?? 0) + 1;

  console.log(`[grade-cache] 記事 ${scanned} 本を走査 / grade付きエントリ ${graded} 件`);
  console.log(`[grade-cache] offerId ${Object.keys(sorted).length} 件を出力 (重複で採点が割れたもの ${conflicts} 件は最高点を採用)`);
  console.log(`[grade-cache] 分布: ${GRADE_ORDER.filter((g) => dist[g]).map((g) => `${g}=${dist[g]}`).join(" ")}`);
  console.log(`[grade-cache] -> ${path.relative(process.cwd(), dest)}`);
}

main();
