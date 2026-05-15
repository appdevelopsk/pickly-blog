/**
 * Add locale pin entries to pins.yaml for articles that now have translation files.
 * Supports: es, pt-BR, de, fr, it
 *
 * Usage:
 *   npx tsx add-locale-pins.ts                  # dry-run (shows what would be added)
 *   npx tsx add-locale-pins.ts --write           # actually append to pins.yaml
 *
 * Only adds pins for locales where:
 *   1. The article has a messages/<locale>.json
 *   2. No pin with that locale already exists in pins.yaml
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import * as yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PINS_PATH = path.resolve(__dirname, "pins.yaml");
const ARTICLES_DIR = path.resolve(__dirname, "../../site/src/articles");
const SITE_URL = "https://pickly.blog";

const NEW_LOCALES = ["es", "pt-BR", "de", "fr", "it"] as const;
type NewLocale = (typeof NEW_LOCALES)[number];

// Locale → language labels for hashtags
const LOCALE_LANG: Record<NewLocale, string> = {
  es: "es",
  "pt-BR": "pt",
  de: "de",
  fr: "fr",
  it: "it",
};

// Variant angle suffixes per locale (so each pin has a distinct title)
const VARIANT_SUFFIX: Record<NewLocale, Record<string, string>> = {
  es: {
    comparison: "comparativa completa",
    top1: "el mejor de 2026",
    problem: "solución al problema más común",
    budget: "mejor relación calidad-precio",
    avoid: "errores a evitar",
    scene: "guía de compra 2026",
  },
  "pt-BR": {
    comparison: "comparação completa",
    top1: "o melhor de 2026",
    problem: "solução para o problema mais comum",
    budget: "melhor custo-benefício",
    avoid: "erros a evitar",
    scene: "guia de compra 2026",
  },
  de: {
    comparison: "vollständiger Vergleich",
    top1: "das Beste 2026",
    problem: "Lösung für das häufigste Problem",
    budget: "bestes Preis-Leistungs-Verhältnis",
    avoid: "Fehler vermeiden",
    scene: "Kaufratgeber 2026",
  },
  fr: {
    comparison: "comparatif complet",
    top1: "le meilleur de 2026",
    problem: "solution au problème le plus courant",
    budget: "meilleur rapport qualité-prix",
    avoid: "erreurs à éviter",
    scene: "guide d'achat 2026",
  },
  it: {
    comparison: "confronto completo",
    top1: "il migliore del 2026",
    problem: "soluzione al problema piu comune",
    budget: "miglior rapporto qualita-prezzo",
    avoid: "errori da evitare",
    scene: "guida all'acquisto 2026",
  },
};

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
  account?: string;
  pins: Pin[];
}

interface ArticleMessages {
  title?: string;
  meta?: { title?: string; description?: string };
  description?: string;
  pinDescription?: string;
}

function getTitle(msgs: ArticleMessages): string {
  return msgs.title ?? msgs.meta?.title ?? "";
}

function getPinDesc(msgs: ArticleMessages): string {
  return msgs.pinDescription ?? msgs.meta?.description ?? msgs.description ?? "";
}

function loadMessages(slug: string, locale: string): ArticleMessages | null {
  const p = path.join(ARTICLES_DIR, slug, "messages", `${locale}.json`);
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, "utf8")) as ArticleMessages; }
  catch { return null; }
}

// Translate hashtags: strip English-only tags, keep generic ones, add locale tag
function adaptHashtags(enHashtags: string[], locale: NewLocale): string[] {
  const lang = LOCALE_LANG[locale];
  const tags = enHashtags
    .filter((t) => !t.includes("japan") && !t.includes("japanese"))
    .slice(0, 7);
  if (!tags.some((t) => t.includes(lang))) tags.push(`#${lang}`);
  return tags;
}

function makePin(enPin: Pin, locale: NewLocale, msgs: ArticleMessages): Pin {
  const slug = enPin.article_slug ?? "";
  const num = enPin.pin_id.match(/-(\d+)$/)?.[1] ?? "01";
  const baseTitle = getTitle(msgs) || enPin.title;
  const suffix = VARIANT_SUFFIX[locale]?.[enPin.variant] ?? "";
  const title = (suffix ? `${baseTitle} — ${suffix}` : baseTitle).slice(0, 100);
  const desc = (getPinDesc(msgs) || enPin.description).trim().slice(0, 480);
  return {
    pin_id: `${slug}-${locale}-${num}`,
    article_slug: slug,
    locale,
    variant: enPin.variant,
    title,
    description: desc,
    link: `${SITE_URL}/${locale}/articles/${slug}/`,
    image_alt: title,
    hashtags: adaptHashtags(enPin.hashtags ?? [], locale),
  };
}

function main() {
  const write = process.argv.includes("--write");
  const raw = fs.readFileSync(PINS_PATH, "utf8");
  const data = yaml.load(raw) as PinsYaml;
  const pins: Pin[] = data.pins ?? [];

  // Index existing pin_ids for fast lookup
  const existingIds = new Set(pins.map((p) => p.pin_id));

  // Group en pins by slug
  const enPinsBySlug = new Map<string, Pin[]>();
  for (const p of pins) {
    if (p.locale === "en" && p.article_slug) {
      const arr = enPinsBySlug.get(p.article_slug) ?? [];
      arr.push(p);
      enPinsBySlug.set(p.article_slug, arr);
    }
  }

  const toAdd: Pin[] = [];

  for (const [slug, enPins] of enPinsBySlug) {
    for (const locale of NEW_LOCALES) {
      // Skip if any pin for this slug+locale already exists
      if (pins.some((p) => p.article_slug === slug && p.locale === locale)) continue;

      const msgs = loadMessages(slug, locale);
      if (!msgs) continue; // no translation file yet

      // Add one pin per variant (use the first en pin of each variant)
      for (const enPin of enPins) {
        const newPin = makePin(enPin, locale, msgs);
        if (!existingIds.has(newPin.pin_id)) {
          toAdd.push(newPin);
          existingIds.add(newPin.pin_id);
        }
      }
    }
  }

  if (toAdd.length === 0) {
    console.log("No new pins to add.");
    return;
  }

  console.log(`${write ? "Adding" : "Would add"} ${toAdd.length} pins for locales: es/pt-BR/de/fr`);

  // Show sample
  const sample = toAdd.slice(0, 3);
  for (const p of sample) {
    console.log(`  [${p.pin_id}] ${p.title.slice(0, 60)}`);
  }
  if (toAdd.length > 3) console.log(`  ... and ${toAdd.length - 3} more`);

  if (!write) {
    console.log("\nRun with --write to append to pins.yaml");
    return;
  }

  // Append new pins as YAML block
  const newBlock = yaml.dump(toAdd, { lineWidth: 120, quotingType: '"', forceQuotes: false });
  fs.appendFileSync(PINS_PATH, "\n" + newBlock);
  console.log(`\nAppended ${toAdd.length} pins to pins.yaml`);
  console.log(`Total pins: ${pins.length + toAdd.length}`);
}

main();
