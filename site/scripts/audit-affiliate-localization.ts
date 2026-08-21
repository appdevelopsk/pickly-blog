/**
 * アフィリリンクのローカライズ不変条件を門番する (2026-08-21 新設)。
 *
 * 経緯: buildAffiliateUrl のリマップ条件が
 *   「network が amazon-de/amazon-us」かつ「markets に EU/global を含む」
 * という二重ゲートになっており、12,053本中 2,101本(17%)しかローカライズされず、
 * 各市場で自国 Amazon に飛ぶリンクは実測 3〜5割しかなかった。
 * さらに network だけ書き換えて元マーケットの ASIN を /dp/ に貼る経路があり、
 * ASIN は marketplace 固有(実測 JP↔US で 41% が別ASIN)なため 1,153本/市場が
 * 「正しい Amazon の存在しない商品ページ」= 404 になっていた。
 *
 * どちらも型は通り、i18n audit も affiliate audit も素通りする種類の壊れ方なので、
 * 実際に URL を組み立てて数える形でしか検出できない。ここで数える。
 *
 * 重大度は2段。致命(exit 1)は「読者が損をする」不変条件だけに限る。
 * 全部致命にすると、deep link 率のような改善余地の指標がビルドを止めてしまい、
 * 収益修正が人質になる。
 */
import { CATALOG } from "../src/lib/affiliates/catalog";
import { buildAffiliateUrl, usesEuUsAsinPool, asinOf, NO_AMAZON_CATEGORIES, NON_AMAZON_OFFERS } from "../src/lib/affiliates/asp";
import type { AspLink } from "../src/lib/affiliates/types";

/** 自国 Amazon を持つ市場と、その期待ホスト。 */
const EXPECT: Record<string, string> = {
  JP: "amazon.co.jp",
  US: "amazon.com",
  UK: "amazon.co.uk",
  CA: "amazon.ca",
  EU: "amazon.de",
  FR: "amazon.fr",
  ES: "amazon.es",
  // amazon-it は却下・退避済みのため、IT の正解は Earn Globally の amazon.com。
  IT: "amazon.com",
};
/** 期待ホストの逆引き(兄弟ASIN実在チェック用)。 */
const NET: Record<string, string> = {
  JP: "amazon-jp", US: "amazon-us", UK: "amazon-uk", CA: "amazon-ca",
  EU: "amazon-de", FR: "amazon-fr", ES: "amazon-es", IT: "amazon-us",
};
/** 退役タグ。1本でも配信されていたら死にタグ。 */
const RETIRED_TAGS = ["pickly06-21", "pickly091-20"];

let errors = 0;
let warnings = 0;
const sample: string[] = [];
const note = (s: string) => { if (sample.length < 5) sample.push(s); };

for (const market of Object.keys(EXPECT)) {
  const host = EXPECT[market];
  let amazon = 0, local = 0, deep = 0, search = 0;
  let untagged = 0, badUrl = 0, retiredTag = 0, ghostAsin = 0;

  for (const offer of CATALOG) {
    for (const link of offer.links) {
      const url = buildAffiliateUrl({
        link: link as AspLink,
        productName: (offer.name as { en?: string }).en ?? offer.id,
        market: market as never,
        category: offer.category,
        siblings: offer.links as readonly AspLink[],
      });

      if (!/^https?:\/\//.test(url) && url !== "#") { badUrl++; note(`${market} ${offer.id} 不正URL "${url.slice(0, 60)}"`); }
      if (!/amazon\./.test(url)) continue;
      amazon++;

      if (url.includes(host)) local++;
      else note(`${market} ${offer.id} ${link.network} → ${url.slice(0, 70)}`);

      if (!/[?&]tag=/.test(url)) { untagged++; note(`${market} ${offer.id} タグ無し ${url.slice(0, 70)}`); }
      for (const t of RETIRED_TAGS) if (url.includes(`tag=${t}`)) { retiredTag++; note(`${market} ${offer.id} 退役タグ ${t}`); }

      const asin = url.match(/\/dp\/([A-Z0-9]{10})/)?.[1];
      if (asin) {
        deep++;
        // 行き先マーケットに実在する ASIN か。兄弟リンクで裏を取る。
        // 第一に、行き先 network 自身の兄弟リンクが持つ ASIN か。
        // 第二に、行き先が欧州/US プール市場(JP以外)なら DE/UK/US 兄弟の ASIN でも可。
        //   実測 2026-08-21: DE↔UK 960/960=100.0%、DE↔US 940/949=99.1% で ASIN は共通。
        //   よって amazon-fr/es/it のようにカタログに1本も無い市場でも借用で deep link が張れる。
        //   ★JP は対象外(JP↔US は 41% が別ASIN)。usesEuUsAsinPool が構造的に弾く。
        const POOL = ["amazon-de", "amazon-uk", "amazon-us"];
        const okNets = usesEuUsAsinPool(NET[market] as never)
          ? [NET[market], ...POOL]
          : [NET[market]];
        const exists = offer.links.some(
          (x) =>
            okNets.includes(x.network) &&
            (x.productId === asin || (x.rawUrl ?? "").includes(asin) || asinOf(x as AspLink) === asin)
        );
        if (!exists) { ghostAsin++; note(`${market} ${offer.id} 行き先に無いASIN ${asin}`); }
      } else if (url.includes("/s?k=")) search++;
    }
  }

  const rate = amazon === 0 ? 0 : (local / amazon) * 100;
  const fatal = (amazon - local) + untagged + badUrl + retiredTag + ghostAsin;
  const tag = fatal > 0 ? "✗" : "✓";
  console.log(
    `${tag} ${market.padEnd(3)} Amazon=${String(amazon).padStart(6)} 自国=${rate.toFixed(1)}% ` +
    `deep=${String(deep).padStart(5)} 検索=${String(search).padStart(5)} ` +
    `untagged=${untagged} 不正URL=${badUrl} 退役タグ=${retiredTag} 幽霊ASIN=${ghostAsin}`
  );
  errors += fatal;

  // 警告のみ: 検索URLフォールバック率。安全(404にならない・タグも乗る)だが転換率は落ちる。
  // カタログに行き先マーケットの実ASINが無いことを意味するので、改善余地の指標として出す。
  if (amazon > 0 && search / amazon > 0.8) {
    console.warn(`⚠ ${market}: 検索URLが ${((search / amazon) * 100).toFixed(0)}% — このマーケットの実ASINがカタログにほぼ無い`);
    warnings++;
  }
}

/**
 * ★新規記事の門番 (2026-08-21 追加)。
 * 物販カテゴリの offer に「実ASIN付きの Amazon リンク」が1本も無いと、
 * その商品は全17ロケールで検索URL止まり = 商品ページに着地しない。
 * 欧州/US の ASIN は共通プールなので、DE か US を1本入れれば
 * FR/ES/IT/UK/CA すべてが deep link になる。つまり是正コストは 1offer=1リンク。
 *
 * 既存分は据え置き方針のため **警告のみ**(ビルドは止めない)。
 * 全部致命にすると既存カタログの積み残しがビルドを人質に取り、
 * 収益修正が出せなくなる(門番の重大度2段ルール)。
 */
{
  const noLink: string[] = [];
  const noAsin: string[] = [];
  let eligible = 0;
  let excluded = 0;
  for (const offer of CATALOG) {
    if (NO_AMAZON_CATEGORIES.has(offer.category ?? "")) continue;
    // Amazon に商品が無いサービス系(VPN/サーバ/SaaS)は是正しようがないので数えない。
    if (NON_AMAZON_OFFERS.has(offer.id)) { excluded++; continue; }
    eligible++;
    const amazonLinks = offer.links.filter((l) => l.network.startsWith("amazon-"));
    if (amazonLinks.length === 0) { noLink.push(offer.id); continue; }
    // JP 専用の ASIN は欧州/US に流用できないので、プール市場の裏付けにはならない。
    const poolAsin = amazonLinks.some((l) => l.network !== "amazon-jp" && asinOf(l as AspLink));
    if (!poolAsin) noAsin.push(offer.id);
  }
  const bad = noLink.length + noAsin.length;
  const ok = eligible - bad;
  console.log(
    `\n[ASIN被覆] 物販offer ${eligible} 件中 ${ok} 件が deep link 可能` +
    ` (Amazonリンク無し ${noLink.length} / 欧米ASIN無し ${noAsin.length}` +
    ` / Amazon非対象として除外 ${excluded})`
  );
  if (bad > 0) {
    warnings++;
    console.warn(`⚠ ${bad} 件の offer は全ロケールで検索URL止まり。DE か US のリンクを1本足せば deep link になる。`);
    for (const id of [...noLink, ...noAsin].slice(0, 10)) console.warn(`   - ${id}`);
    if (bad > 10) console.warn(`   … 他 ${bad - 10} 件`);
  }
}

if (errors > 0) {
  console.error("\n例:");
  for (const s of sample) console.error(`  - ${s}`);
  console.error(`\n${errors} localization error(s), ${warnings} warning(s).`);
  process.exit(1);
}
console.log(warnings > 0 ? `\nlocalization OK (${warnings} warnings)` : "\nlocalization OK");
