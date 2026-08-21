// AUTO-GENERATED 2026-06-29(改) — pickly 厳選 v2: keep = Google SC需要(imp>=10/clk) ∪ GA4 engaged実績(180日,自己除外)。
// ★v1の反省: SCのみで線引きし、AI回答エンジン/Bing/Direct で実ユーザーが来ている126記事を誤noindexしていた。
// pickly実流入の主力はBing+AI(ChatGPT/Copilot/Perplexity)なのでengaged実績を keep に含める。engaged 0 の死蔵のみ noindex。
// 復活=該当slugをSetから外す(可逆)。再生成= scratchpad/regen-deindex.mjs。
// ── 2026-07-16 面積拡大実験 v1: beauty/food/fitness の noindex在庫164本を決定的ハッシュで
//    半分に分割し、treatment 82本を index に復帰（holdout 82本は noindex 維持=第2波用）。
//    仮説: pickly の実流入は100%Bingインデックス由来(Google=0)で、天井はindex面積。
//    測定: scratchpad/measure-experiment.mjs（3週後・slug単位のAI/Bing/DDG engaged）。
//    巻き戻し: 00_集客統合/growth/experiments/area-expansion-2026-07-16.json の treatment を Set に戻す。
// ── 2026-08-02: 「公開されていないのに需要ゼロで剪定」の循環を解消。
//    hasApprovedAds が false の記事はページ自体が生成されず本番404 だったため、
//    SC需要も GA4 engaged も原理的に0にしかならず、その0を根拠に noindex されていた。
//    楽天の実商品リンクを承認して ja で公開できるようになった45本を Set から外す。
//    (剪定基準そのものは変更していない。効果は3〜4週後に engaged で再判定する)
//    2026-08-02 追記: Amazon JP検索リンク(既存の既定パターン)を物理商品カテゴリの
//    休眠オファーに補完し、さらに62本を同じ理由で外した。元から公開されていて
//    実データに基づき剪定された記事には手を触れていない。
// ── 2026-08-03: ★剪定基準そのものが pickly の規模では機能していないと判明したので見直す。
//    (1) keep条件の片方 "Google SC需要" は無効: Google は pickly を116ページしか認識しておらず
//        28日で 696imp / 0click。SC を根拠に keep/prune を分けることが原理的にできない。
//    (2) もう片方 "GA4 engaged 180日" もノイズ: pickly の実流入は約20 engaged/日で、
//        180日=約3,600セッションを3,800ページで分け合う。中央値のページは1セッションなので
//        「engaged 0」は悪いページの証拠ではなく大半のページに起きる普通のこと。
//    Bing のキーワードAPI(GetKeyword)で実検索需要を測れるようになったので、
//    「需要100以上 かつ 既にページが生成できている(=承認オファーがある)」70本を Set から外す。
//    需要合計 55,153。needs-offer の31本(保険/クレカ/銀行など・需要32,039)は案件が無く未生成なので対象外。
//    計測器: 00_集客統合/growth/bing-demand.mjs / snapshots/bing-demand-en.json
//    2026-08-03 追記: en 側にも JP と同じ「承認オファーが無くページが生成されない」穴が
//    あった(206本)。物理商品カテゴリのオファーに amazon-us の検索URL(既存の既定パターン・
//    1,851件で使用中)を補完し25本を生成可能にした。うち需要100以上の3本を Set から外す。
//    finance 44本(需要27,242)とソフト/SaaS 19本(需要9,143)は Amazon で扱えないので対象外。
// ── 2026-08-04: 日本語の購買意図クエリ「◯◯ おすすめ」で需要を実測した(347本)。
//    裸の商品名(「マットレス」280,713)は情報検索の巨大ワードで pickly が勝てる帯ではないため、
//    比較記事が実際に競合する「おすすめ」付きで測り直した。
//    勝てる中規模帯(200〜3,000)は82本・需要68,684。うち noindex のまま止まっていた
//    10本(需要7,232)を Set から外す。防犯カメラ2,148 / 加湿器831 / バスタオル822 ほか。
//    計測器: 00_集客統合/growth/snapshots/bing-demand-ja-intent.json
// ── 2026-08-04(2): 金融/SaaS 55記事の direct リンク(公式サイト・カタログに最初から
//    入っていて approved:false で眠っていた)を、URL生存確認(240/246)のうえ承認した。
//    同じ direct 形式は既にサイト内333件で稼働している確立パターン。これでページが
//    生成されるようになったため、需要100以上の分を Set から外す。
//    アフィリ提携(A8/もしも/Awin/CJ)が取れ次第、収益リンクに差し替える。
// ── 2026-08-21: ★「Googleで上位に付いているのに noindex」だった25本を復帰。
//    SEOベースライン再取得で pickly が「表示1,144でクリック1」と判明したのを起点に
//    GSC(90日・page次元)と本Setを突合したところ、noindex 242本のうち65本が実際には
//    Googleに表示されており、合計929imp / クリック0 だった。順位が付いているのに
//    クリック0 なのはスニペット問題ではなく noindex そのものが原因(検索結果に出ても
//    実質クリックされない/やがて落ちる)。
//    最悪例: best-coffee-table-2026 が「coffee table」pos2.3・「square coffee table」pos1.0 で
//    単独 707imp = pickly の Google 表示全体の76%。これを死蔵扱いしていた。
//    復帰基準: 加重平均順位 pos<=15 かつ 表示>=3(90日)。25本・表示合計 約860。
//    これは 2026-08-02/08-03 と同じ循環(noindexだから実績0→その0を根拠にnoindex)の
//    Google側での再発。計測器: /tmp/pickly-rescue.mjs (growth/pickly-rescue.mjs に保存)
//    再判定: 3〜4週後(2026-09-15頃)に同25本の GSC クリックで効果測定。
// ── 2026-08-20: ★面積拡大実験 v1 の正式判定 = ✅ WIN。第2波(holdout)を実施。
//    8/06 時点の判定は 🔼 WEAK (treatment engaged=8) だったが、測定窓が 19日と短すぎた。
//    同じ計測器 (growth/measure-area-experiment.mjs) を 2026-07-18〜08-19 で再実行:
//      treatment 82本: engaged=20 / 引用13本 / 0.24 eng per article
//      holdout   82本: engaged=0  (33日間ずっと0 = noindex なので引用不能・design通り)
//      baseline 90日 : treatment=1  → 20倍
//    事前登録の win 閾値 (>=15) を超過したので対抗仮説「死蔵は品質が理由で引用されない」は棄却。
//    successCriteria.win の定義どおり holdout を index に復帰させる。
//    実際に Set に残っていた holdout は 48本 (残り34本は 8/02〜8/04 の需要ベース解除で既に離脱済み)。
//    カテゴリ内訳: fitness 21 / food 20 / beauty 7。
//    ファイル数の懸念なし: generateStaticParams は isDeindexed を見ないため、これらのページは
//    既にビルド出力に存在する。この Set は sitemap 収録と robots の index 可否を切り替えるだけで、
//    Cloudflare Pages の 20,000ファイル制限に対する増分はゼロ。
//    巻き戻し: area-expansion-2026-07-16.json の holdout の slug を Set に戻す(可逆)。
export const DEINDEXED_SLUGS: ReadonlySet<string> = new Set([
  "best-401k-rollover-2026",
  "best-529-plan-2026",
  "best-accent-chair-2026",
  "best-ankle-boots-2026",
  "best-aquarium-light-2026",
  "best-athletic-shorts-men-2026",
  "best-baby-bath-toys-2026",
  "best-baby-food-pouches-2026",
  "best-baby-food-storage-containers-2026",
  "best-baby-gate-2026",
  "best-baby-humidifier-2026",
  "best-baby-laundry-detergent-2026",
  "best-baby-monitor-camera-2026",
  "best-baby-nail-clipper-2026",
  "best-baby-stroller-2026",
  "best-baby-teething-toys-2026",
  "best-backpacking-water-filter-2026",
  "best-balance-transfer-credit-card-2026",
  "best-ballet-flats-2026",
  "best-bamboo-pillow-2026",
  "best-baseball-cap-2026",
  "best-bidet-seat-2026",
  "best-bluetooth-car-adapter-2026",
  "best-bluetooth-tracker-2026",
  "best-bomber-jacket-2026",
  "best-bookshelf-2026",
  "best-booster-seat-2026",
  "best-camping-tent-2026",
  "best-car-phone-mount-2026",
  "best-cat-harness-2026",
  "best-cat-litter-mat-2026",
  "best-cat-scratching-post-2026",
  "best-cat-tunnel-2026",
  "best-cloud-hosting-2026",
  "best-coffee-mug-2026",
  "best-console-table-2026",
  "best-cookware-set-2026",
  "best-cooling-pillow-2026",
  "best-crm-software-2026",
  "best-crossbody-bag-2026",
  "best-cryptocurrency-wallet-2026",
  "best-debt-consolidation-loan-2026",
  "best-decorative-pillows-2026",
  "best-desk-lamp-2026",
  "best-diaper-pail-2026",
  "best-disability-insurance-2026",
  "best-dish-rack-2026",
  "best-docking-station-2026",
  "best-document-scanner-2026",
  "best-dog-anxiety-supplement-2026",
  "best-dog-bed-2026",
  "best-dog-boots-2026",
  "best-dog-car-seat-2026",
  "best-dog-dental-chews-2026",
  "best-dog-grooming-table-2026",
  "best-dog-joint-supplement-2026",
  "best-dog-life-jacket-2026",
  "best-dog-nail-clipper-2026",
  "best-dog-paw-cleaner-2026",
  "best-dog-poop-bags-2026",
  "best-dog-raincoat-2026",
  "best-dog-training-collar-2026",
  "best-double-stroller-2026",
  "best-drawer-organizer-2026",
  "best-ecommerce-platform-2026",
  "best-electric-blanket-2026",
  "best-email-marketing-platform-2026",
  "best-entryway-bench-2026",
  "best-estate-planning-software-2026",
  "best-etf-for-beginners-2026",
  "best-financial-advisor-2026",
  "best-fish-tank-beginners-2026",
  "best-flannel-shirt-2026",
  "best-food-storage-container-2026",
  "best-gold-ira-2026",
  "best-grain-free-dog-food-2026",
  "best-grow-light-2026",
  "best-health-savings-account-2026",
  "best-hiking-daypack-2026",
  "best-hoop-earrings-2026",
  "best-hr-software-2026",
  "best-index-fund-2026",
  "best-instant-camera-2026",
  "best-investment-platform-2026",
  "best-jogger-pants-2026",
  "best-jogging-stroller-2026",
  "best-kids-backpack-2026",
  "best-kids-bike-helmet-2026",
  "best-kids-headphones-2026",
  "best-kids-lunch-box-2026",
  "best-kids-scooter-2026",
  "best-kids-sunscreen-2026",
  "best-kids-tablet-2026",
  "best-kids-water-bottle-2026",
  "best-laundry-hamper-2026",
  "best-leather-gloves-2026",
  "best-linen-shirt-2026",
  "best-maxi-dress-2026",
  "best-medicare-supplement-insurance-2026",
  "best-memory-foam-pillow-2026",
  "best-mens-sneakers-2026",
  "best-mens-suit-2026",
  "best-mens-watch-2026",
  "best-mesh-wifi-system-2026",
  "best-money-market-account-2026",
  "best-money-transfer-app-2026",
  "best-monitor-stand-2026",
  "best-mortgage-lender-2026",
  "best-nightstand-2026",
  "best-nursery-glider-2026",
  "best-one-piece-swimsuit-2026",
  "best-pearl-earrings-2026",
  "best-pet-first-aid-kit-2026",
  "best-plant-pot-2026",
  "best-portable-charger-travel-2026",
  "best-portable-wifi-router-travel-2026",
  "best-rain-boots-2026",
  "best-rain-jacket-2026",
  "best-rental-server-jp-2026",
  "best-reptile-terrarium-2026",
  "best-reusable-water-bottle-2026",
  "best-robo-advisor-2026",
  "best-roth-ira-account-2026",
  "best-runner-rug-2026",
  "best-senior-cat-food-2026",
  "best-shower-caddy-2026",
  "best-silk-pajamas-2026",
  "best-sippy-cup-2026",
  "best-small-business-loan-2026",
  "best-smart-home-hub-2026",
  "best-sneaker-cleaning-kit-2026",
  "best-space-heater-2026",
  "best-statement-handbag-2026",
  "best-stock-trading-app-2026",
  "best-storage-ottoman-2026",
  "best-student-credit-card-2026",
  "best-student-loan-refinance-2026",
  "best-table-lamp-2026",
  "best-tax-prep-service-2026",
  "best-tax-software-2026",
  "best-tea-kettle-2026",
  "best-toddler-bed-2026",
  "best-toddler-learning-toys-2026",
  "best-toddler-potty-2026",
  "best-toddler-shoes-2026",
  "best-toddler-table-and-chairs-2026",
  "best-travel-adapter-2026",
  "best-travel-blanket-2026",
  "best-travel-clothesline-2026",
  "best-travel-document-organizer-2026",
  "best-travel-first-aid-kit-2026",
  "best-travel-garment-bag-2026",
  "best-travel-hair-dryer-2026",
  "best-travel-insurance-senior-2026",
  "best-travel-iron-2026",
  "best-travel-jewelry-case-2026",
  "best-travel-lock-2026",
  "best-travel-makeup-bag-2026",
  "best-travel-power-strip-2026",
  "best-travel-shoe-bag-2026",
  "best-travel-sleep-mask-2026",
  "best-travel-umbrella-2026",
  "best-travel-wallet-2026",
  "best-true-wireless-earbuds-2026",
  "best-tv-stand-2026",
  "best-umbrella-insurance-2026",
  "best-under-sink-organizer-2026",
  "best-usb-hub-2026",
  "best-usb-microphone-2026",
  "best-video-conferencing-software-2026",
  "best-vps-hosting-2026",
  "best-waterproof-dry-bag-2026",
  "best-weekender-bag-2026",
  "best-weighted-blanket-2026",
  "best-wide-leg-pants-2026",
  "best-wine-rack-2026",
  "best-winter-gloves-2026",
  "best-wordpress-hosting-2026",
  "best-wrap-dress-2026",
  "translate_3_articles.py",
]);
export function isDeindexed(slug: string): boolean { return DEINDEXED_SLUGS.has(slug); }
