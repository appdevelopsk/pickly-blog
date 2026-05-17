/**
 * merge-catalog-patches.ts
 *
 * After parallel article-generation agents complete, this script:
 *   1. Reads all src/articles/<slug>/catalog-patch.json files
 *   2. Appends entries to catalog.ts (before the closing bracket)
 *   3. Updates registry.ts with imports + REGISTRY additions
 *
 * Usage:
 *   npx tsx scripts/merge-catalog-patches.ts
 *   npx tsx scripts/merge-catalog-patches.ts --dry-run
 */
import fs from "node:fs";
import path from "node:path";

const ARTICLES_DIR = path.resolve(__dirname, "../src/articles");
const CATALOG_PATH = path.resolve(__dirname, "../src/lib/affiliates/catalog.ts");
const REGISTRY_PATH = path.resolve(__dirname, "../src/lib/articles/registry.ts");

const DRY_RUN = process.argv.includes("--dry-run");

function slugToCamel(slug: string): string {
  return slug.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

function main() {
  // ── 1. Collect catalog patches ────────────────────────────────────────────
  const patchedSlugs: string[] = [];
  const catalogEntries: object[] = [];

  const allSlugs = fs.readdirSync(ARTICLES_DIR).filter((s) =>
    fs.existsSync(path.join(ARTICLES_DIR, s, "catalog-patch.json"))
  );

  for (const slug of allSlugs) {
    const patchPath = path.join(ARTICLES_DIR, slug, "catalog-patch.json");
    try {
      const entries = JSON.parse(fs.readFileSync(patchPath, "utf8")) as object[];
      if (!Array.isArray(entries)) {
        console.warn(`⚠ ${slug}/catalog-patch.json is not an array, skipping`);
        continue;
      }
      catalogEntries.push(...entries);
      patchedSlugs.push(slug);
      console.log(`  ✓ ${slug}: ${entries.length} catalog entries`);
    } catch (e) {
      console.warn(`⚠ ${slug}/catalog-patch.json parse error:`, (e as Error).message);
    }
  }

  if (catalogEntries.length === 0) {
    console.log("No catalog-patch.json files found. Nothing to do.");
    return;
  }

  console.log(`\nTotal: ${catalogEntries.length} new catalog entries from ${patchedSlugs.length} articles\n`);

  // ── 2. Append to catalog.ts ───────────────────────────────────────────────
  const catalogContent = fs.readFileSync(CATALOG_PATH, "utf8");

  // Find the end of RAW_CATALOG: the line that ends the array
  // Pattern: "  },\n] as" or just before the closing "];  export..."
  const insertMarker = "\n] as";
  const insertPos = catalogContent.lastIndexOf(insertMarker);
  if (insertPos === -1) {
    console.error("✗ Could not find insertion point in catalog.ts");
    process.exit(1);
  }

  const newEntriesTs = catalogEntries
    .map((e) => "  " + JSON.stringify(e, null, 2).replace(/\n/g, "\n  "))
    .join(",\n");

  const newCatalog =
    catalogContent.slice(0, insertPos) +
    ",\n" + newEntriesTs + "\n" +
    catalogContent.slice(insertPos);

  if (DRY_RUN) {
    console.log("[dry-run] Would append to catalog.ts:");
    console.log(newEntriesTs.slice(0, 500) + "...");
  } else {
    fs.writeFileSync(CATALOG_PATH, newCatalog);
    console.log(`✓ catalog.ts updated (+${catalogEntries.length} entries)`);
  }

  // ── 3. Update registry.ts ─────────────────────────────────────────────────
  // Only add slugs that have both meta.ts and are NOT already in the registry
  const registryContent = fs.readFileSync(REGISTRY_PATH, "utf8");

  const newImports: string[] = [];
  const newRegistryVars: string[] = [];

  for (const slug of patchedSlugs) {
    const metaPath = path.join(ARTICLES_DIR, slug, "meta.ts");
    if (!fs.existsSync(metaPath)) {
      console.warn(`⚠ ${slug}: no meta.ts found, skipping registry entry`);
      continue;
    }
    // Check if already in registry
    if (registryContent.includes(`"@/articles/${slug}/meta"`)) {
      console.log(`  ~ ${slug}: already in registry, skipping`);
      continue;
    }
    const varName = slugToCamel(slug);
    newImports.push(`import { meta as ${varName} } from "@/articles/${slug}/meta";`);
    newRegistryVars.push(varName);
  }

  if (newImports.length === 0) {
    console.log("No new registry entries needed.");
  } else {
    // Insert imports after the last existing import line
    const lastImportMatch = registryContent.match(/^import .*from ".*";\n/gm);
    if (!lastImportMatch) {
      console.error("✗ Could not find import section in registry.ts");
      process.exit(1);
    }
    const lastImport = lastImportMatch[lastImportMatch.length - 1];
    const lastImportPos = registryContent.lastIndexOf(lastImport) + lastImport.length;

    // Insert REGISTRY additions
    const registryArrayMatch = registryContent.match(/const REGISTRY: ArticleMeta\[\] = \[([\s\S]*?)\];/);
    if (!registryArrayMatch) {
      console.error("✗ Could not find REGISTRY array in registry.ts");
      process.exit(1);
    }

    const insertImports = registryContent.slice(0, lastImportPos) +
      newImports.join("\n") + "\n" +
      registryContent.slice(lastImportPos);

    // Now update REGISTRY array in the modified content
    const registryEndMarker = "];";
    const registryStart = insertImports.indexOf("const REGISTRY: ArticleMeta[] = [");
    const registryEnd = insertImports.indexOf(registryEndMarker, registryStart);

    const newRegistry =
      insertImports.slice(0, registryEnd) +
      ", " + newRegistryVars.join(", ") +
      insertImports.slice(registryEnd);

    if (DRY_RUN) {
      console.log(`\n[dry-run] Would add ${newImports.length} imports + ${newRegistryVars.length} registry entries`);
      console.log(newImports.slice(0, 3).join("\n") + (newImports.length > 3 ? "\n..." : ""));
    } else {
      fs.writeFileSync(REGISTRY_PATH, newRegistry);
      console.log(`✓ registry.ts updated (+${newImports.length} articles)`);
    }
  }

  // ── 4. Summary ────────────────────────────────────────────────────────────
  console.log(`\n完了: ${patchedSlugs.length} articles merged`);
  if (!DRY_RUN) {
    console.log("次のステップ: npm run typecheck && npm run build");
  }
}

main();
