/**
 * CLI: catalog-overrides.json をCLIだけで更新できるツール。
 *
 * Usage:
 *   # Moshimo (Amazon/楽天/Yahoo/ConoHa/Lolipop 等) — env変数で a_id/p_id等が解決される
 *   tsx scripts/catalog-update.ts --offer nordvpn --merchant amazon-jp --asin B0BRG7V8M2 --apply
 *   tsx scripts/catalog-update.ts --offer conoha-wing --merchant conoha-wing --product-id "" --apply
 *
 *   # A8 / CJ / Impact / direct — 管理画面で発行済みの完全URLを直接保存
 *   tsx scripts/catalog-update.ts --offer xserver --network a8 --product-id xserver-jp \
 *        --raw-url "https://px.a8.net/svt/ejp?a8mat=XXXXX&a8ejpredirect=https%3A%2F%2Fwww.xserver.ne.jp%2F" --apply
 *
 *   # Bulk via CSV:
 *   tsx scripts/catalog-update.ts --offer-list catalog-asins.csv --apply
 *
 *   # Show current overrides:
 *   tsx scripts/catalog-update.ts --list
 *
 *   # Reset (clear overrides.json):
 *   tsx scripts/catalog-update.ts --reset
 *
 * CSV formats (auto-detected by header):
 *   - Legacy moshimo-only:
 *       offerId,merchant,productId,markets
 *       nordvpn,amazon-jp,B0BRG7V8M2,JP
 *
 *   - Extended (any ASP network):
 *       offerId,network,productId,rawUrl,markets
 *       conoha-wing,moshimo,conoha-wing-jp,,JP
 *       xserver,a8,xserver-jp,https://px.a8.net/svt/ejp?...,JP
 *
 *   markets は | (パイプ) 区切り。空ならJPデフォルト。
 *   rawUrl は moshimo の場合空でよい(env変数で解決)、A8等は必須。
 */
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { buildMoshimoUrl, type MoshimoMerchant } from "../src/lib/affiliates/moshimo-link";
import type { AspLink, AspNetwork, Market } from "../src/lib/affiliates/types";

const OVERRIDES_PATH = path.resolve(__dirname, "../src/lib/affiliates/catalog-overrides.json");

interface UpdateInput {
  offerId: string;
  network: AspNetwork;
  /** moshimo: MoshimoMerchant key. Other networks: free-form ID stored as productId. */
  merchantOrProductId: string;
  /** Optional: full pre-built URL (required for non-moshimo networks). */
  rawUrl?: string;
  markets?: Market[];
}

type OverridesFile = Record<string, { links?: AspLink[] } | string | number | undefined> & {
  _comment?: string;
  _version?: number;
};

async function loadOverrides(): Promise<OverridesFile> {
  try {
    const raw = await fs.readFile(OVERRIDES_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return { _version: 1 };
  }
}

async function saveOverrides(data: OverridesFile): Promise<void> {
  await fs.writeFile(OVERRIDES_PATH, JSON.stringify(data, null, 2) + "\n");
}

function buildLinkForInput(input: UpdateInput): { link: AspLink; pending: boolean } {
  if (input.network === "moshimo") {
    const url = buildMoshimoUrl({
      merchant: input.merchantOrProductId as MoshimoMerchant,
      productId: input.rawUrl ? undefined : "",
      targetUrl: input.rawUrl,
    });
    const pending = url.includes("PENDING");
    return {
      link: {
        network: "moshimo",
        productId: input.merchantOrProductId,
        rawUrl: url,
        markets: input.markets ?? ["JP"],
        approved: !pending,
      },
      pending,
    };
  }
  // Non-moshimo: rawUrl is the source of truth
  if (!input.rawUrl) {
    throw new Error(
      `network=${input.network} requires --raw-url (the full URL from the ASP management panel).`,
    );
  }
  // Safety: a real ASP URL must start with http(s):// — otherwise it's a placeholder
  // (REPLACE_WITH_..., empty, accidental whitespace, etc.). Don't mark approved.
  const isRealUrl = /^https?:\/\//i.test(input.rawUrl) && !/PENDING|REPLACE_/i.test(input.rawUrl);
  return {
    link: {
      network: input.network,
      productId: input.merchantOrProductId,
      rawUrl: input.rawUrl,
      markets: input.markets ?? ["JP"],
      approved: isRealUrl,
    },
    pending: !isRealUrl,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");

  if (args.includes("--list")) {
    const data = await loadOverrides();
    const entries = Object.entries(data).filter(
      ([k]) => !k.startsWith("_"),
    ) as [string, { links?: AspLink[] }][];
    if (entries.length === 0) {
      console.log("(no overrides)");
      return;
    }
    for (const [id, val] of entries) {
      console.log(`\n${id}:`);
      for (const l of val.links ?? []) {
        const status = l.approved ? "✓" : "·";
        console.log(`  ${status} ${l.network}: ${l.productId}  [${(l.markets ?? []).join(",")}]`);
      }
    }
    return;
  }

  if (args.includes("--reset")) {
    await saveOverrides({
      _comment: "Auto-managed by `npm run catalog:update`. Don't edit by hand.",
      _version: 1,
    });
    console.log("✓ overrides cleared");
    return;
  }

  let inputs: UpdateInput[] = [];

  const listIdx = args.indexOf("--offer-list");
  if (listIdx >= 0) {
    const file = args[listIdx + 1];
    if (!file) throw new Error("--offer-list requires a file path");
    const csv = await fs.readFile(file, "utf8");
    inputs = parseCsv(csv);
  } else {
    const get = (flag: string) => {
      const i = args.indexOf(flag);
      return i >= 0 ? args[i + 1] : undefined;
    };
    const offer = get("--offer");
    const network = (get("--network") ?? "moshimo") as AspNetwork;
    const merchant = get("--merchant"); // moshimo path
    const productId = get("--product-id") ?? get("--asin");
    const rawUrl = get("--raw-url");
    const marketsArg = get("--markets");

    if (!offer) {
      printUsage();
      process.exit(2);
    }

    if (network === "moshimo") {
      const m = merchant ?? "amazon-jp";
      if (productId === undefined) {
        console.error("--product-id (or --asin) is required for moshimo network.");
        process.exit(2);
      }
      inputs.push({
        offerId: offer,
        network: "moshimo",
        merchantOrProductId: m,
        rawUrl: productId ? undefined : rawUrl, // productId が空なら rawUrl/targetHost で生成
        markets: marketsArg ? (marketsArg.split(",") as Market[]) : ["JP"],
      });
      // Reconstruct: if productId provided, treat it as the moshimo "merchant key" already
      // and let buildMoshimoUrl handle. Override merchantOrProductId for clarity:
      inputs[inputs.length - 1].merchantOrProductId = m;
      // If user passed --asin / --product-id and we're on moshimo, we want it treated as the
      // amazon ASIN / rakuten itemCode etc. — pass through buildMoshimoUrl with productId arg:
      if (productId) {
        const url = buildMoshimoUrl({ merchant: m as MoshimoMerchant, productId });
        inputs[inputs.length - 1].rawUrl = url;
        inputs[inputs.length - 1].merchantOrProductId = productId;
      }
    } else {
      if (!productId) {
        console.error(`--product-id is required for network=${network}.`);
        process.exit(2);
      }
      if (!rawUrl) {
        console.error(`--raw-url is required for network=${network} (full URL from ASP panel).`);
        process.exit(2);
      }
      inputs.push({
        offerId: offer,
        network,
        merchantOrProductId: productId,
        rawUrl,
        markets: marketsArg ? (marketsArg.split(",") as Market[]) : ["JP"],
      });
    }
  }

  const overrides = await loadOverrides();

  console.log("\n=== catalog update ===\n");

  for (const input of inputs) {
    const { link, pending } = buildLinkForInput(input);

    console.log(`offer: ${input.offerId}`);
    console.log(`  network: ${input.network}`);
    console.log(`  productId: ${link.productId}`);
    console.log(`  approved: ${link.approved}${pending ? " (URL contains PENDING — set env vars to enable)" : ""}`);
    console.log(`  markets: ${link.markets.join(",")}`);

    if (apply) {
      const existing =
        (overrides[input.offerId] as { links?: AspLink[] } | undefined) ?? {};
      const otherLinks = (existing.links ?? []).filter(
        (l) => !(l.network === link.network && l.productId === link.productId),
      );
      overrides[input.offerId] = {
        links: [link, ...otherLinks],
      };
      console.log(`  ✓ written to catalog-overrides.json`);
    } else {
      console.log(`  link object (preview, --apply で書き込み):`);
      console.log("  " + JSON.stringify(link, null, 2).split("\n").join("\n  "));
    }
    console.log("");
  }

  if (apply) {
    await saveOverrides(overrides);
    console.log(`\n→ ${path.relative(process.cwd(), OVERRIDES_PATH)} updated`);
    console.log("→ Run `npm run validate && npm run build && ./deploy/deploy.sh` to deploy");
  } else {
    console.log("(preview only — append --apply to write to overrides.json)");
  }
}

function printUsage() {
  console.error("Usage:");
  console.error("  # moshimo (default network):");
  console.error("    tsx scripts/catalog-update.ts --offer <id> --merchant <moshimo-merchant> --asin <id> [--markets JP,US] [--apply]");
  console.error("    tsx scripts/catalog-update.ts --offer <id> --merchant conoha-wing --product-id \"\" [--apply]");
  console.error("");
  console.error("  # other networks (a8, cj, impact, direct, ...):");
  console.error("    tsx scripts/catalog-update.ts --offer <id> --network a8 --product-id <slug> --raw-url <full-url> [--apply]");
  console.error("");
  console.error("  tsx scripts/catalog-update.ts --offer-list <csv> [--apply]");
  console.error("  tsx scripts/catalog-update.ts --list");
  console.error("  tsx scripts/catalog-update.ts --reset");
}

/**
 * CSV parser. Auto-detects header layout:
 *   Legacy:   offerId,merchant,productId,markets             (always moshimo)
 *   Extended: offerId,network,productId,rawUrl,markets       (any AspNetwork)
 *
 * Lines starting with `#` and the header line itself are skipped.
 */
function parseCsv(csv: string): UpdateInput[] {
  const rows = csv
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

  if (rows.length === 0) return [];

  const header = rows[0].toLowerCase();
  const isExtended = header.includes("network");

  return rows
    .slice(1)
    .filter((line) => !line.toLowerCase().startsWith("offerid"))
    .map((line) => {
      const parts = line.split(",").map((s) => s.trim());
      if (isExtended) {
        const [offerId, network, productId, rawUrl, markets] = parts;
        if (!offerId || !network || !productId) {
          throw new Error(`Invalid CSV line: ${line}`);
        }
        return {
          offerId,
          network: network as AspNetwork,
          merchantOrProductId: productId,
          rawUrl: rawUrl || undefined,
          markets: markets ? (markets.split("|") as Market[]) : ["JP"],
        };
      }
      // Legacy
      const [offerId, merchant, productId, markets] = parts;
      if (!offerId || !merchant || productId === undefined) {
        throw new Error(`Invalid CSV line: ${line}`);
      }
      // Build moshimo URL using merchant + productId
      const url = productId
        ? buildMoshimoUrl({ merchant: merchant as MoshimoMerchant, productId })
        : buildMoshimoUrl({ merchant: merchant as MoshimoMerchant });
      return {
        offerId,
        network: "moshimo" as AspNetwork,
        merchantOrProductId: productId || merchant,
        rawUrl: url,
        markets: markets ? (markets.split("|") as Market[]) : ["JP"],
      };
    });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
