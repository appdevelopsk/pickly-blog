/**
 * CLI: ASIN → もしも経由 Amazon URL に変換。
 *
 * Usage:
 *   tsx scripts/moshimo-link.ts amazon-jp B07Q2QWPYL
 *   tsx scripts/moshimo-link.ts rakuten shop:item123
 *   tsx scripts/moshimo-link.ts yahoo-shopping https://store.shopping.yahoo.co.jp/...
 *
 * Bulk:
 *   echo -e "B07Q2QWPYL\nB08L5VG843" | tsx scripts/moshimo-link.ts amazon-jp -
 */
import { buildMoshimoUrl, parseMoshimoUrl, type MoshimoMerchant } from "../src/lib/affiliates/moshimo-link";
import * as readline from "node:readline";

async function main() {
  const [, , merchant, productOrUrl, ...rest] = process.argv;

  if (!merchant || !productOrUrl) {
    console.error("Usage: tsx scripts/moshimo-link.ts <merchant> <product-id-or-url>");
    console.error("  merchant: amazon-jp | rakuten | yahoo-shopping | conoha-wing | rakuten-card | myprotein | asken | rakuten-securities | sbi-securities");
    console.error("  product-id-or-url: ASIN, 楽天 itemCode, full URL, or '-' to read from stdin");
    console.error("");
    console.error("Examples:");
    console.error("  tsx scripts/moshimo-link.ts amazon-jp B07Q2QWPYL");
    console.error("  tsx scripts/moshimo-link.ts conoha-wing - < urls.txt");
    process.exit(2);
  }

  // Parse-only mode: --parse <url>
  if (merchant === "--parse") {
    const parsed = parseMoshimoUrl(productOrUrl);
    console.log(JSON.stringify(parsed, null, 2));
    return;
  }

  if (productOrUrl === "-") {
    const rl = readline.createInterface({ input: process.stdin });
    for await (const line of rl) {
      const id = line.trim();
      if (!id) continue;
      const url = buildMoshimoUrl({ merchant: merchant as MoshimoMerchant, productId: id });
      console.log(`${id}\t${url}`);
    }
    return;
  }

  const isUrl = productOrUrl.startsWith("http");
  const url = buildMoshimoUrl({
    merchant: merchant as MoshimoMerchant,
    ...(isUrl ? { targetUrl: productOrUrl } : { productId: productOrUrl }),
  });

  console.log(url);
  if (rest.length === 0 && !url.includes("PENDING")) {
    return;
  }
  if (url.includes("PENDING")) {
    console.error("");
    console.error("⚠ URL contains 'PENDING' — set the corresponding env vars:");
    console.error("  AFFILIATE_MOSHIMO_SID         (your moshimo a_id)");
    console.error(`  MOSHIMO_${merchant.toUpperCase().replace(/-/g, "_")}_P_ID`);
    console.error(`  MOSHIMO_${merchant.toUpperCase().replace(/-/g, "_")}_PC_ID`);
    console.error(`  MOSHIMO_${merchant.toUpperCase().replace(/-/g, "_")}_PL_ID`);
    console.error("");
    console.error("Find these in もしもダッシュボード → 提携プロモーション → リンクコード取得");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
