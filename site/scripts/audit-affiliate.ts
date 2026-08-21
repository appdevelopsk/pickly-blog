/**
 * Affiliate catalog audit:
 *  - every offerId referenced by an article exists in catalog
 *  - every offer has at least 1 link
 *  - every link.network is a known ASP
 *  - warn on offers with 0 approved links (they will all show "pending")
 */
import { CATALOG } from "../src/lib/affiliates/catalog";
import { listArticles } from "../src/lib/articles/registry";
import type { AspNetwork } from "../src/lib/affiliates/types";

const KNOWN_NETWORKS: AspNetwork[] = [
  "amazon-jp", "amazon-us", "amazon-uk", "amazon-de", "amazon-ca",
  "amazon-fr", "amazon-es", "amazon-it", "amazon-au", "amazon-in",
  "a8", "moshimo", "valuecommerce", "rakuten-affiliate",
  "shareasale", "cj", "impact", "awin", "direct",
];

let errors = 0;
let warnings = 0;

for (const offer of CATALOG) {
  if (offer.links.length === 0) {
    console.error(`✗ offer ${offer.id} has no links`);
    errors++;
    continue;
  }
  for (const link of offer.links) {
    if (!KNOWN_NETWORKS.includes(link.network)) {
      console.error(`✗ offer ${offer.id}: unknown network "${link.network}"`);
      errors++;
    }
  }
  // 価格文字列の破損検知 (2026-08-17)。batch-gen の appendOffers が String.replace の
  // 置換文字列に JSON を直接埋めていたため、"$180" の `$1` がキャプチャ参照として
  // 解釈され "$80" / "$,300" のような**もっともらしいが間違った価格**が58箇所書かれていた。
  // 型は string のままなので typecheck も i18n audit も素通りする。形で門番する。
  for (const [field, v] of [["priceMin", offer.priceMin], ["priceMax", offer.priceMax]] as const) {
    if (v == null || v === "") continue;
    // "$4.99/月" のような正当な接尾辞は通す。破損の印は「通貨記号の直後が数字でない」こと。
    if (/[$¥€£₹](?!\d)/.test(v)) {
      console.error(`✗ offer ${offer.id}: malformed ${field} "${v}"`);
      errors++;
    }
  }

  const approved = offer.links.filter((l) => l.approved).length;
  if (approved === 0) {
    console.warn(`⚠ offer ${offer.id}: 0 approved links — UI will show "pending"`);
    warnings++;
  }
}

/**
 * 既知の未解決 offerId ベースライン (2026-08-21)。
 *
 * 経緯: 金融/旅行系の記事 11本が、カタログに存在しない offerId を
 * 合計 38件参照している。これらはクレジットカード/IRA/保険など
 * **Amazon に商品が存在しないサービス**で、ASP 未接続の間は埋めようがない。
 *
 * この 38件が exit 1 を引き続けると `npm run validate` が常に赤になり、
 * **新しく入った壊れ方が既存の赤に埋もれて見えなくなる**。
 * よって既知分だけを明示的に退避し、**新規の未知 offerId は今まで通り致命**にする。
 * (門番の重大度は2段 — 致命は「読者が損をする」不変条件だけに限る)
 *
 * ★このリストは「増やさない」ことが側。ASP を繋いで offer を作ったら、
 * 対応行をここから削除すること。退避が残っている間は件数を常に表示する。
 */
const KNOWN_MISSING_OFFERS = new Set<string>([
  // best-balance-transfer-credit-card-2026
  "chase-freedom-unlimited-bt", "discover-it-balance-transfer", "usbank-visa-platinum-bt",
  // best-debt-consolidation-loan-2026
  "discover-personal-loan-consolidation", "marcus-debt-consolidation", "upstart-debt-consolidation",
  // best-estate-planning-software-2026
  "fabric-estate-app", "legalzoom-estate-plan", "tomorrow-estate-app", "willing-estate-software",
  // best-etf-for-beginners-2026
  "vxus-vanguard-international",
  // best-gold-ira-2026
  "american-hartford-gold-ira", "augusta-precious-metals-ira", "birch-gold-group-ira",
  "goldco-precious-metals-ira", "noble-gold-investments-ira",
  // best-health-savings-account-2026
  "further-hsa", "healthequity-hsa",
  // best-index-fund-2026
  "schb-schwab-us-broad", "spy-spdr-sp500", "swtsx-schwab-total-market",
  // best-rewards-credit-card-2026
  "amex-gold-card-rewards", "bilt-mastercard-rewards", "citi-custom-cash-rewards", "venture-x-rewards",
  // best-small-business-loan-2026
  "fundbox-line-credit", "kabbage-small-business-loan", "lendio-sba-loan", "ondeck-term-loan",
  // best-student-credit-card-2026
  "bank-of-america-customized-student", "capital-one-savor-student", "chase-freedom-student",
  "deserve-edu-mastercard", "discover-it-student-chrome",
  // best-travel-insurance-senior-2026
  "geoblue-voyager-choice", "nationwide-prime-travel", "seven-corners-roundtrip", "travelguard-gold-plan",
]);

const offerIds = new Set(CATALOG.map((o) => o.id));
let waived = 0;
const resolved: string[] = [];
for (const article of listArticles()) {
  for (const id of article.offerIds) {
    if (offerIds.has(id)) {
      // 退避したはずの ID がカタログに生えたら、退避行はもう不要。
      if (KNOWN_MISSING_OFFERS.has(id)) resolved.push(id);
      continue;
    }
    if (KNOWN_MISSING_OFFERS.has(id)) { waived++; continue; }
    console.error(`✗ article ${article.slug}: references unknown offerId "${id}"`);
    errors++;
  }
}
if (waived > 0) {
  console.warn(`⚠ 未解決 offerId ${waived} 件をベースラインとして退避中 (金融/旅行系・ASP未接続)。ASPを繋いだら KNOWN_MISSING_OFFERS から削っていくこと。`);
  warnings++;
}
if (resolved.length > 0) {
  console.warn(`⚠ KNOWN_MISSING_OFFERS に死に行が ${resolved.length} 件: ${[...new Set(resolved)].join(", ")} — カタログに存在するので退避行を削除してよい。`);
  warnings++;
}

if (errors > 0) {
  console.error(`\n${errors} affiliate error(s), ${warnings} warning(s).`);
  process.exit(1);
}
if (warnings > 0) {
  console.log(`affiliate OK (${warnings} warnings)`);
} else {
  console.log("affiliate OK");
}
