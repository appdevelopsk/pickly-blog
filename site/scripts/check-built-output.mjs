/**
 * ビルド成果物(out/)をデプロイ前に検査する門番。
 *
 * なぜソースではなく出力を見るか (2026-08-04):
 *   この日に見つけた不具合は全て「ソースを読んでも分からず、出来上がった HTML を
 *   見て初めて分かる」形だった。
 *     - Amazon リンク 625本にアフィリエイトタグが無かった。カタログ側は
 *       `network: "direct"` と書いてあるだけで、URL がそのまま出力される経路だった。
 *       クリックされても永久に1円にもならないが、画面上は正常に見える。
 *     - 971ページの <title> が全ロケールで英語のままだった。本文の見出しは
 *       17言語に翻訳されており、画面を見ても気づけない(SERP に出るのは metadata)。
 *     - トップの <title> が「Pickly | Pickly」になっていた。
 *   よってゲートは**出力に対して**かけ、落ちたらデプロイしない。
 *
 * 使い方:
 *   node scripts/check-built-output.mjs            # out/ を検査
 *   node scripts/check-built-output.mjs --dir out  # ディレクトリ指定
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const argDir = process.argv.indexOf("--dir");
const ROOT = argDir >= 0 ? process.argv[argDir + 1] : "out";

// SERP の表示幅。全角(East Asian Width = W/F)は半角2つぶん。
const WIDE = /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦]/;
const width = (t) => [...t].reduce((n, c) => n + (WIDE.test(c) ? 2 : 1), 0);
const TITLE_LIMIT = 60;

function unescapeHtml(s) {
  return s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

const pages = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (e === "index.html") pages.push(p);
  }
})(ROOT);

// やっていない一次テストを語る一人称表現。ロケール別。
// ★★JavaScript の \b は ASCII 限定なので、アクセント付きの語には使えない。
//   \w が [A-Za-z0-9_] なので `í` は非単語文字扱いになり、`\bmedí\b` が
//   スペイン語の **medía**（「〜の寸法だった」）の中に一致してしまう。
//   これで 226件の誤検出が出た（Python の \b は Unicode 対応なので再現しなかった）。
//   → 単語境界は Unicode プロパティのルックアラウンドで書く。u フラグが要る。
const W = "\\p{L}\\p{N}_";
const b = (src) => new RegExp(`(?<![${W}])(?:${src})(?![${W}])`, "giu");

const FABRICATED = {
  "en": b("I tested|I measured|I ran|I used|I wore|I spent|I tried|I found that|my test|I timed|I counted|I logged|I called|I drove|I slept|I washed|I carried"),
  "de": /(ich habe .{0,40}(getestet|gemessen|verwendet|getragen|probiert)|ich testete|ich maß|ich trug|ich nutzte|mein Test|meiner Tests|ich fuhr|ich schlief|ich wusch)/gi,
  "fr": /(j'ai (testé|mesuré|utilisé|porté|essayé|chronométré|compté|parcouru|lavé|dormi)|mon test|mes tests|je testais)/gi,
  "es": b("he (probado|medido|usado|llevado|contado)|probé|medí|usé|llevé|conté|planché|dormí|lavé|conduje|mi prueba|mis pruebas"),
  "it": b("ho (testato|misurato|usato|indossato|provato|contato|guidato|dormito|lavato|ottenuto|effettuato|aperto)|il mio test|i miei test"),
  "pt-BR": b("testei|medi|usei|vesti|experimentei|contei|dirigi|dormi|lavei|levei|meu teste|meus testes"),
  "ru": b("я (тестировал|протестировал|измерял|измерил|использовал|носил|пробовал|считал|звонил|спал|стирал)|мой тест|моих тест"),
  "id": b("saya (menguji|mengukur|menggunakan|memakai|mencoba|menghitung|mengemudi|tidur|mencuci|menghubungi)|pengujian saya"),
  "vi": b("tôi đã (thử|đo|dùng|sử dụng|mặc|kiểm tra|đếm|lái|ngủ|giặt)|thử nghiệm của tôi"),
  "tr": b("test ettim|ölçtüm|kullandım|giydim|denedim|saydım|sürdüm|uyudum|yıkadım|benim testim"),
  "ar": /(اختبرت|قِست|قست|استخدمت|ارتديت|جربت|أحصيت|قدت|نمت|غسلت|اتصلت|في اختباري|تجربتي)/g,
  "hi": /(मैंने .{0,30}(परीक्षण|इस्तेमाल|उपयोग|पहन|मापा|आज़मा)|मेरे परीक्षण|मेरा परीक्षण)/g,
  "th": /(ผมได้ทดสอบ|ฉันได้ทดสอบ|ผมทดสอบ|ฉันทดสอบ|ผมวัด|ฉันวัด|ผมใช้|ฉันใช้|การทดสอบของผม|การทดสอบของฉัน)/g,
  "ko": /(제가 (테스트|측정|사용|착용|시도)|직접 테스트|저의 테스트|제 테스트)/g,
  "ja": /(私が(テスト|計測|使用)|編集部が(テスト|計測)|実際に(試し|使っ)て(みた|みました))/g,
  "zh-CN": /(我(测试|测量|使用|穿|试)了|我的测试)/g,
  "zh-TW": /(我(測試|測量|使用|穿|試)了|我的測試)/g,
};

// 一人称を使わない「テスト済み」の主張。<title> と meta description に出る型。
// 例: hi「5 को 30 दिनों तक परखा」 ru「5 протестированы за 540 дней」
// これは一人称チェックに掛からないので別に数える。en の <title> は既に直っていて
// ロケール側だけ古い、という取りこぼしがここで出る。
const PASSIVE_FAB = {
  "en": b("tested for \\d+ (?:days|weeks|months)|\\d+ (?:\\w+ )?tested over|after \\d+ (?:days|weeks|months) of testing|on real (?:newborns|babies|dogs|cats|skin)"),
  "de": /(\d+\s*(?:Tage|Wochen|Monate)\s*(?:im\s*)?getestet|nach \d+ (?:Tagen|Wochen|Monaten) im Test)/gi,
  "fr": /(testés? (?:pendant|sur) \d+ (?:jours|semaines|mois))/gi,
  "es": /(probad[oa]s durante \d+ (?:días|semanas|meses))/gi,
  "it": /(testat[ei] (?:per|in) \d+ (?:giorni|settimane|mesi))/gi,
  "pt-BR": /(testad[oa]s (?:por|durante) \d+ (?:dias|semanas|meses))/gi,
  "ru": /(\d+\s*протестирован\w*|протестированы за \d+)/gi,
  "id": /(diuji selama \d+ (?:hari|minggu|bulan))/gi,
  "vi": /(thử nghiệm (?:trong )?\d+ (?:ngày|tuần|tháng))/gi,
  "tr": /(\d+ (?:gün|hafta|ay) test edildi|\d+ (?:gün|hafta) boyunca test)/gi,
  "ar": /(اختُبرت?\s*(?:لمدة)?\s*\d+\s*(?:يوم|أسبوع|شهر))/g,
  "hi": /(\d+\s*(?:दिनों|सप्ताह|महीनों)\s*तक\s*(?:परखा|परीक्षण)|को\s*परखा(?:\s*गया)?|का\s*परीक्षण\s*किया)/g,
  "th": /(ทดสอบ\s*\d+\s*(?:รุ่น|ตัว)|ทดสอบแล้ว|ทดสอบ\s*\d+\s*วัน)/g,
  "ko": /(\d+\s*(?:일|주|개월)\s*테스트|테스트했?습니다)/g,
  "ja": /(\d+\s*(?:日|週|か月)(?:間)?\s*テスト|テスト済み)/g,
  "zh-CN": /(测试\s*\d+\s*(?:天|周|个月)|实测\s*\d+\s*(?:天|款))/g,
  "zh-TW": /(測試\s*\d+\s*(?:天|週|個月)|實測\s*\d+\s*(?:天|款))/g,
};
// 翻訳されずに残った英語の定型。非enページに出ていたら未翻訳。
const EN_BOILERPLATE = "Compared on published specs, manufacturer data and independent reviews";

const problems = { untaggedAffiliate: [], deadAffiliate: [], emptyTitle: [], wideTitle: [], rawKey: [], doubleBrand: [], fabricated: [], passiveFab: [], enBoilerplate: [], emptyHeading: [] };
const titlesByPath = new Map();   // ロケールを除いたパス -> Map(locale -> title)

for (const file of pages) {
  const html = readFileSync(file, "utf8");
  const rel = file.slice(ROOT.length + 1).replace(/\/index\.html$/, "") || "/";

  // ---- アフィリエイトリンク -------------------------------------------------
  for (const m of html.matchAll(/href="(https:\/\/www\.amazon\.[a-z.]+\/[^"]*)"/g)) {
    const url = unescapeHtml(m[1]);
    if (!/[?&]tag=/.test(url)) problems.untaggedAffiliate.push(`${rel}  ${url}`);
    // 商品でも検索でもないリンク(トップページ等)は読者にとって行き止まり
    if (/^https:\/\/www\.amazon\.[a-z.]+\/?(\?|$)/.test(url)) problems.deadAffiliate.push(`${rel}  ${url}`);
  }

  // ---- やっていない一次テストの主張 -----------------------------------------
  // 編集部は製品を購入・試用していない。「私が60日間履いた」「82dBを計測した」の類は
  // 読者を欺く。ソースを直しても別ロケールに残るので、出力側で数える。
  // 直し方は「除去」か「メーカー公称/利用者レビューへの帰属」。免責文は書かない。
  {
    const loc = rel.split("/")[0];
    const re = FABRICATED[loc];
    if (re) {
      const text = html
        .replace(/<script[\s\S]*?<\/script>/g, " ")
        .replace(/<style[\s\S]*?<\/style>/g, " ")
        .replace(/<[^>]+>/g, " ");
      for (const m of unescapeHtml(text).matchAll(re)) {
        problems.fabricated.push(`${rel}  …${m[0]}…`);
      }
    }
    // 一人称を使わない「N日間テストした」型。<title> と meta description を見る。
    const pre = PASSIVE_FAB[loc];
    if (pre) {
      const head = html.slice(0, html.indexOf("</head>") + 7);
      for (const m of unescapeHtml(head).matchAll(pre)) {
        problems.passiveFab.push(`${rel}  …${m[0]}…`);
      }
    }
    if (loc !== "en" && html.includes(EN_BOILERPLATE)) {
      problems.enBoilerplate.push(rel);
    }
  }

  // ---- 空の見出しタグ = カードタイトル欠落 -----------------------------------
  // 2026-08-12: /articles の全カード <h3> が空になっていた。原因はグローバル
  // messages から記事コンテンツを分離した後も t("articles.<slug>.title") を
  // 使い続けた1ページ。next-intl は欠落キーで throw せず空文字を返すため
  // try/catch では捕まえられず、ソースも画面のレイアウトも正常に見える。
  // 見出しが空のページはこの型の再発なので出力で落とす。
  {
    const empties = [...html.matchAll(/<h([123])\b[^>]*>\s*<\/h\1>/g)];
    if (empties.length) problems.emptyHeading.push(`${rel}  空h1-h3 ×${empties.length}`);
  }

  // ---- <title> --------------------------------------------------------------
  const robots = html.match(/<meta name="robots" content="([^"]*)"/);
  const noindex = !!robots && /noindex/.test(robots[1]);
  const tm = html.match(/<title>([\s\S]*?)<\/title>/);
  if (!tm) continue;
  const title = unescapeHtml(tm[1].replace(/\s+/g, " ").trim());
  if (noindex) continue;                       // 検索に出ないページは対象外

  if (!title) { problems.emptyTitle.push(rel); continue; }
  if (width(title) > TITLE_LIMIT) problems.wideTitle.push(`${width(title)}  ${rel}  ${title}`);
  // 生の翻訳キーが漏れていないか (例: crossBrokerPage.meta_title)
  if (/^[a-z][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)+(\s|$|\|)/.test(title)) problems.rawKey.push(`${rel}  ${title}`);
  // ブランドの二重付与 (例: Pickly | Pickly)
  const brand = title.match(/\|\s*([^|]+)$/);
  if (brand && title.split(brand[1]).length > 2) problems.doubleBrand.push(`${rel}  ${title}`);

  const seg = rel.split("/");
  const locale = seg[0];
  const rest = seg.slice(1).join("/") || "(home)";
  if (!titlesByPath.has(rest)) titlesByPath.set(rest, new Map());
  titlesByPath.get(rest).set(locale, title);
}

// ---- 全ロケールで同一のタイトル = metadata が未翻訳 --------------------------
// 記事は「その言語に翻訳が無ければ noindex」で既に除外されるので、ここに残るのは
// ハブページ等。5ロケール以上で完全一致していたら未翻訳とみなす。
const untranslated = [];
for (const [rest, byLocale] of titlesByPath) {
  if (byLocale.size < 5) continue;
  const uniq = new Set(byLocale.values());
  if (uniq.size === 1) untranslated.push(`${byLocale.size}ロケール  /${rest}  ${[...uniq][0]}`);
}

const checks = [
  ["Amazonリンクにアフィリエイトタグが無い（クリックされても報酬にならない）", problems.untaggedAffiliate],
  ["Amazonのトップページに飛ぶ行き止まりリンク", problems.deadAffiliate],
  ["<title> が空", problems.emptyTitle],
  [`<title> の表示幅が ${TITLE_LIMIT} 超（SERPで切れる）`, problems.wideTitle],
  ["<title> に生の翻訳キーが出ている", problems.rawKey],
  ["<title> にブランドが二重に付いている", problems.doubleBrand],
  ["<title> が全ロケールで同一（metadata が未翻訳）", untranslated],
  ["やっていない一次テストを一人称で主張している", problems.fabricated],
  ["やっていない一次テストを受動態で主張している（title/meta）", problems.passiveFab],
  ["非enページに英語の定型文が残っている（未翻訳）", problems.enBoilerplate],
  ["見出しタグ(h1-h3)が空（カードタイトル欠落）", problems.emptyHeading],
];

let failed = 0;
console.log(`検査対象: ${pages.length} ページ (${ROOT})`);
for (const [label, list] of checks) {
  if (!list.length) { console.log(`  ✓ ${label}: 0`); continue; }
  failed += list.length;
  console.error(`  ✗ ${label}: ${list.length}`);
  for (const x of list.slice(0, 10)) console.error(`      ${x}`);
  if (list.length > 10) console.error(`      … 他 ${list.length - 10} 件`);
}

if (failed) {
  console.error(`\n❌ ${failed} 件。デプロイを中止する。`);
  process.exit(1);
}
console.log("\n✓ ビルド出力の検査を通過");
