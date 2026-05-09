/**
 * Generate Pinterest-style OG images (1000x1500 PNG) for every article × locale.
 *
 * Output: public/og/<slug>-<locale>.png
 *
 * SVG → PNG via @resvg/resvg-js, which finds macOS / Linux system fonts
 * (Helvetica, Hiragino Sans GB, Apple SD Gothic Neo, Kohinoor, Geeza Pro,
 *  Thonburi, Arial Unicode MS, ...) so non-Latin scripts render with real
 *  glyphs instead of .notdef boxes.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";

const ROOT = path.resolve(__dirname, "..");
const ARTICLES_DIR = path.join(ROOT, "src/articles");
const OUT_DIR = path.join(ROOT, "public/og");

interface ArticleMessages {
  title?: string;
  meta?: { title?: string; description?: string };
  pinDescription?: string;
}

const COLOR_SCHEMES: Record<string, { from: string; to: string; accent: string }> = {
  tech: { from: "#1e3a8a", to: "#1e293b", accent: "#3b82f6" },
  home: { from: "#7c2d12", to: "#451a03", accent: "#ea580c" },
  beauty: { from: "#831843", to: "#500724", accent: "#ec4899" },
  fashion: { from: "#581c87", to: "#3b0764", accent: "#a855f7" },
  fitness: { from: "#14532d", to: "#052e16", accent: "#22c55e" },
  food: { from: "#7c2d12", to: "#3f1d04", accent: "#f59e0b" },
  finance: { from: "#0f172a", to: "#020617", accent: "#10b981" },
  travel: { from: "#0c4a6e", to: "#082f49", accent: "#0ea5e9" },
  parenting: { from: "#9a3412", to: "#431407", accent: "#fb923c" },
  pets: { from: "#365314", to: "#1a2e05", accent: "#84cc16" },
  default: { from: "#7f1d1d", to: "#450a0a", accent: "#dc2626" },
};

// Font family stack — each script picks the first font with matching glyphs.
const FONT_STACK = [
  "Helvetica Neue",
  "Helvetica",
  "Arial",
  "Hiragino Sans GB",      // CJK (covers JP/zh-CN/zh-TW partially)
  "Hiragino Sans",         // JP fallback
  "PingFang SC",           // zh-CN fallback (assets-installed)
  "PingFang TC",           // zh-TW fallback
  "Apple SD Gothic Neo",   // ko
  "Kohinoor Devanagari",   // hi
  "Devanagari Sangam MN",  // hi alt
  "Geeza Pro",             // ar
  "SF Arabic",             // ar alt
  "Thonburi",              // th
  "Sukhumvit Set",         // th alt
  "Arial Unicode MS",      // catch-all (in /Library/Fonts on macOS)
  "sans-serif",
]
  .map((f) => (f.includes(" ") ? `'${f}'` : f))
  .join(", ");

const FONT_DIRS = [
  "/System/Library/Fonts",
  "/System/Library/Fonts/Supplemental",
  "/Library/Fonts",
  process.env.HOME ? path.join(process.env.HOME, "Library/Fonts") : "",
  // Linux fallbacks for CI
  "/usr/share/fonts",
  "/usr/local/share/fonts",
].filter(Boolean) as string[];

/**
 * Explicit font file paths. resvg-js sometimes misses .ttc collections via
 * fontDirs alone (it indexes only some PostScript names), so we name the
 * exact files here. Missing entries are skipped silently.
 */
const FONT_FILES_CANDIDATES = [
  "/System/Library/Fonts/Helvetica.ttc",
  "/System/Library/Fonts/HelveticaNeue.ttc",
  "/Library/Fonts/Arial Unicode.ttf",
  "/System/Library/Fonts/Hiragino Sans GB.ttc",
  "/System/Library/Fonts/AppleSDGothicNeo.ttc",
  "/System/Library/Fonts/Supplemental/AppleGothic.ttf",
  "/System/Library/Fonts/Supplemental/AppleMyungjo.ttf",
  "/System/Library/Fonts/Kohinoor.ttc",
  "/System/Library/Fonts/Supplemental/Devanagari Sangam MN.ttc",
  "/System/Library/Fonts/Supplemental/DevanagariMT.ttc",
  "/System/Library/Fonts/Supplemental/ITFDevanagari.ttc",
  "/System/Library/Fonts/GeezaPro.ttc",
  "/System/Library/Fonts/SFArabic.ttf",
  "/System/Library/Fonts/Supplemental/Thonburi.ttc",
  "/System/Library/Fonts/Supplemental/SukhumvitSet.ttc",
];

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  // Filter to only existing font files
  const fontFiles: string[] = [];
  for (const f of FONT_FILES_CANDIDATES) {
    try {
      await fs.access(f);
      fontFiles.push(f);
    } catch { void 0; }
  }
  let slugs: string[];
  try {
    slugs = await fs.readdir(ARTICLES_DIR);
  } catch {
    console.log("No articles yet — nothing to generate.");
    return;
  }

  let count = 0;
  for (const slug of slugs) {
    const messagesDir = path.join(ARTICLES_DIR, slug, "messages");
    let locales: string[];
    try {
      locales = await fs.readdir(messagesDir);
    } catch {
      continue;
    }

    let category = "default";
    try {
      const metaPath = path.join(ARTICLES_DIR, slug, "meta.ts");
      const metaContent = await fs.readFile(metaPath, "utf8");
      const m = metaContent.match(/category:\s*["']([^"']+)["']/);
      if (m && m[1]) category = m[1];
    } catch (_e) { void 0; }

    for (const file of locales) {
      if (!file.endsWith(".json")) continue;
      const locale = file.replace(".json", "");
      const json = JSON.parse(
        await fs.readFile(path.join(messagesDir, file), "utf8"),
      ) as ArticleMessages;

      const svg = renderSvg({
        title: json.title ?? json.meta?.title ?? slug,
        slug,
        locale,
        category,
        subtitle: json.pinDescription,
      });

      const resvg = new Resvg(svg, {
        fitTo: { mode: "width", value: 1000 },
        font: {
          loadSystemFonts: true,
          fontDirs: FONT_DIRS,
          fontFiles,
          defaultFontFamily: "Helvetica",
        },
      });
      const pngBuffer = resvg.render().asPng();
      const outPath = path.join(OUT_DIR, `${slug}-${locale}.png`);
      await fs.writeFile(outPath, pngBuffer);

      // Keep the SVG for debug
      await fs.writeFile(path.join(OUT_DIR, `${slug}-${locale}.svg`), svg);
      count++;
    }
  }
  console.log(`Generated ${count} OG image(s) as PNG (1000x1500).`);
}

function renderSvg(opts: {
  title: string;
  slug: string;
  locale: string;
  category: string;
  subtitle?: string;
}): string {
  const colors = COLOR_SCHEMES[opts.category] ?? COLOR_SCHEMES.default;
  const safeLocale = escapeXml(opts.locale.toUpperCase());
  const isRtl = opts.locale === "ar";

  // Title wrap: weight per char (ASCII=1, CJK/Hangul/Fullwidth=2, others≈1.2)
  // Cap at ~18 weight units per line for the 92px font on 880px usable width.
  // 18 fits ~9 CJK chars or ~17 narrow Latin chars (Helvetica avg ≈48px/char).
  const titleLines = wrapWeighted(opts.title, 18, 5);
  const titleStartY = 420;
  const titleLineHeight = 110;

  const subtitleText = opts.subtitle ?? "";
  const subtitleLines = subtitleText ? wrapWeighted(subtitleText, 38, 3) : [];
  const subtitleStartY = titleStartY + titleLines.length * titleLineHeight + 80;
  const subtitleLineHeight = 44;

  const titleAnchor = isRtl ? "end" : "start";
  const titleX = isRtl ? 940 : 60;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1500" viewBox="0 0 1000 1500"${isRtl ? ' direction="rtl"' : ""}>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.5" y2="1">
      <stop offset="0" stop-color="${colors.from}"/>
      <stop offset="1" stop-color="${colors.to}"/>
    </linearGradient>
    <linearGradient id="overlay" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="rgba(0,0,0,0)"/>
      <stop offset="1" stop-color="rgba(0,0,0,0.3)"/>
    </linearGradient>
  </defs>
  <rect width="1000" height="1500" fill="url(#bg)"/>
  <rect width="1000" height="1500" fill="url(#overlay)"/>

  <!-- Top accent bar -->
  <rect x="0" y="0" width="1000" height="12" fill="${colors.accent}"/>

  <!-- Year + locale chip -->
  <rect x="60" y="80" width="120" height="40" rx="20" fill="${colors.accent}"/>
  <text x="120" y="108" font-family="${FONT_STACK}" font-size="22" fill="#ffffff" font-weight="700" text-anchor="middle">2026</text>
  <text x="200" y="108" font-family="${FONT_STACK}" font-size="20" fill="rgba(255,255,255,0.7)" font-weight="500">${safeLocale}</text>

  <!-- Title -->
  ${titleLines.map((line, i) => {
    const safe = escapeXml(line);
    const y = titleStartY + i * titleLineHeight;
    return `<text x="${titleX}" y="${y}" font-family="${FONT_STACK}" font-size="92" fill="#ffffff" font-weight="900" letter-spacing="-2" text-anchor="${titleAnchor}">${safe}</text>`;
  }).join("\n  ")}

  <!-- Subtitle (pin description excerpt) -->
  ${subtitleLines.map((line, i) => {
    const safe = escapeXml(line);
    const y = subtitleStartY + i * subtitleLineHeight;
    return `<text x="${titleX}" y="${y}" font-family="${FONT_STACK}" font-size="32" fill="rgba(255,255,255,0.85)" font-weight="400" text-anchor="${titleAnchor}">${safe}</text>`;
  }).join("\n  ")}

  <!-- Footer brand -->
  <rect x="0" y="1410" width="1000" height="90" fill="rgba(0,0,0,0.4)"/>
  <text x="60" y="1465" font-family="${FONT_STACK}" font-size="36" fill="#ffffff" font-weight="800">Pickly</text>
  <text x="940" y="1465" font-family="${FONT_STACK}" font-size="22" fill="rgba(255,255,255,0.7)" font-weight="500" text-anchor="end">pickly.blog</text>
</svg>`;
}

/**
 * Char visual weight estimate. Used for line-wrap budgeting.
 *  - ASCII / Latin / Greek / Cyrillic / Hebrew  → 1
 *  - Arabic                                     → 1.0  (narrow but joined)
 *  - Devanagari                                 → 1.3
 *  - Thai                                       → 1.1
 *  - CJK / Hangul / Fullwidth                   → 2
 */
function charWeight(ch: string): number {
  const code = ch.codePointAt(0) ?? 0;
  if (code < 0x600) return 1;                 // Latin / Cyrillic / Greek / Hebrew
  if (code >= 0x600 && code <= 0x6FF) return 1; // Arabic
  if (code >= 0x900 && code <= 0x97F) return 1.3; // Devanagari
  if (code >= 0xE00 && code <= 0xE7F) return 1.1; // Thai
  if (code >= 0x3000) return 2;               // CJK + Hangul + Fullwidth
  return 1.1;
}

function strWeight(s: string): number {
  let w = 0;
  for (const ch of s) w += charWeight(ch);
  return w;
}

/**
 * Whether a char is "wide" (CJK, Hangul, Fullwidth). Used as the boundary
 * between script runs when splitting long mixed-script tokens.
 */
function isWide(ch: string): boolean {
  const code = ch.codePointAt(0) ?? 0;
  return code >= 0x3000;
}

/**
 * Split a token into runs of same width-class (wide vs narrow), so that
 * mixed-script tokens like "WordPressが11分で公開できた話" become
 * ["WordPress", "が", "11", "分で公開できた話"] — letting the wrapper put
 * Latin words on their own line instead of slicing them mid-character.
 */
function scriptRuns(text: string): string[] {
  const out: string[] = [];
  let buf = "";
  let prev: boolean | null = null;
  for (const ch of text) {
    const wide = isWide(ch);
    if (prev !== null && wide !== prev && buf) {
      out.push(buf);
      buf = "";
    }
    buf += ch;
    prev = wide;
  }
  if (buf) out.push(buf);
  return out;
}

/**
 * Word-aware line wrapper with a weight budget.
 * Splits on ASCII whitespace; if a single token is wider than the budget,
 * falls back to per-char wrap inside that token (covers long CJK runs).
 * Adds an ellipsis on the last line when content overflows maxLines.
 */
function wrapWeighted(text: string, maxWeight: number, maxLines: number): string[] {
  const lines: string[] = [];
  let cur = "";
  let curW = 0;
  let overflowed = false;

  // Tokenize on ASCII whitespace; preserve as space markers
  const tokens: string[] = [];
  let buf = "";
  for (const ch of text) {
    if (ch === " " || ch === "\t" || ch === "\n") {
      if (buf) { tokens.push(buf); buf = ""; }
      tokens.push(" ");
    } else {
      buf += ch;
    }
  }
  if (buf) tokens.push(buf);

  const flush = () => {
    if (cur.trim()) lines.push(cur.replace(/\s+$/, ""));
    cur = "";
    curW = 0;
  };

  outer: for (let ti = 0; ti < tokens.length; ti++) {
    const tok = tokens[ti];

    if (tok === " ") {
      if (cur && curW + 1 <= maxWeight) {
        cur += " ";
        curW += 1;
      }
      continue;
    }

    const tokW = strWeight(tok);

    if (tokW <= maxWeight) {
      if (curW + tokW > maxWeight) flush();
      if (lines.length >= maxLines) {
        // We have content left to place but no more lines available
        if (ti < tokens.length) overflowed = true;
        break outer;
      }
      cur += tok;
      curW += tokW;
    } else {
      // Token alone exceeds budget. Split into script runs (CJK vs non-CJK)
      // so we don't break Latin words mid-character when they live next to CJK.
      const subs = scriptRuns(tok);
      for (const sub of subs) {
        const subW = strWeight(sub);
        if (subW <= maxWeight) {
          if (curW + subW > maxWeight) {
            flush();
            if (lines.length >= maxLines) {
              overflowed = true;
              break outer;
            }
          }
          cur += sub;
          curW += subW;
        } else {
          // Sub-run still too big (long Latin run or long CJK run): char-by-char
          for (const ch of sub) {
            const w = charWeight(ch);
            if (curW + w > maxWeight) {
              flush();
              if (lines.length >= maxLines) {
                overflowed = true;
                break outer;
              }
            }
            cur += ch;
            curW += w;
          }
        }
      }
    }
  }
  if (cur.trim()) {
    if (lines.length < maxLines) {
      lines.push(cur.replace(/\s+$/, ""));
    } else {
      overflowed = true;
    }
  }

  if (overflowed && lines.length === maxLines) {
    const last = lines[maxLines - 1];
    let trimmed = last;
    while (strWeight(trimmed) > maxWeight - 1 && trimmed.length > 0) {
      trimmed = trimmed.slice(0, -1);
    }
    lines[maxLines - 1] = trimmed.replace(/\s+$/, "") + "…";
  }
  return lines;
}

function escapeXml(s: string) {
  return s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" }[c] ?? c));
}

main();
