// functions/index.ts の LOCALES が src/lib/i18n/locales.ts の active ロケールと一致するかを検査する。
// functions/ は src を import できない(Next バンドル外)ため、手書きの一覧がズレると
// 新ロケールの読者が "/" から辿り着けなくなる。ズレたらビルドを止める。
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(resolve(root, "src/lib/i18n/locales.ts"), "utf8");
const fn = readFileSync(resolve(root, "functions/index.ts"), "utf8");

const active = [...src.matchAll(/code:\s*"([^"]+)"[^}]*active:\s*(true|false)/g)]
  .filter((m) => m[2] === "true").map((m) => m[1]);
const fnBlock = fn.match(/const LOCALES = \[([\s\S]*?)\] as const;/)?.[1] ?? "";
const listed = [...fnBlock.matchAll(/"([^"]+)"/g)].map((m) => m[1]);

const missing = active.filter((l) => !listed.includes(l));
const extra = listed.filter((l) => !active.includes(l));
if (missing.length || extra.length) {
  console.error(`[check-root-routing] functions/index.ts の LOCALES が locales.ts と不一致: missing=${missing.join(",") || "-"} extra=${extra.join(",") || "-"}`);
  process.exit(1);
}
console.log(`[check-root-routing] OK (${listed.length} locales)`);
