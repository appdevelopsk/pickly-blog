# GA4 国別レポート (ボット分離済み)

property 537610479 / 2026-08-17..2026-09-13 / 生成 2026-09-14

> ⚠ **ボット疑い率 38.0% が閾値 20% を超過。** 標準の国別レポートは信用せず、この表の human 列で判断する。gtag の webdriver ゲートで足りていない → Cloudflare Bot Fight Mode を検討(承認制)。

読み方: docs/COUNTRY_ACCESS.md。human = Direct×滞在<3秒/人×10人以上 の塊を除いた数。

**top10% 列は自動判定ではなく人が読むための材料。** 閲覧数上位10%のページが全ページ
ビューに占める割合。人間は人気記事に偏るので高く、全記事を1周するスキャナは低い。
2026-09-14 実測: Singapore 11% / Spain 20% / South Korea 25% / France 27% /
Germany 30% / United States 35% / Brazil 36% / Japan 41%。**15% 未満が続く国は、
human の数字が大きくても読者でない可能性を疑う**(Singapore 167人は平均滞在 8.4 秒で
閾値3秒の外側を通り、「ボット混入ゼロの優良トラフィック」として表示されていた)。
境界は 15%。20% にすると Spain(20%・45秒/人・キーイベント23件・Amazon €3.17 の実収益)
が毎回引っかかり、印が読み流される。
**ただし human が 50 人未満の国では読まないこと。** 母数が小さいと「20人が20ページを
1回ずつ」で集中度が構造的に下がり、健全な国でも 10〜15% になる(UK 19人で10%,
Netherlands 20人で14%)。コンソール出力の ←均一 印も human>=50 にだけ付く。

human 列からは除外していない。除外する閾値を足しても、その外側を通る相手は捕まらない。

| country | all | human | engaged | sec/user | key events | top10% |
|---|---:|---:|---:|---:|---:|---:|
| United States | 1095 | 446 | 174 | 30 | 39 | 35% |
| Singapore | 167 | 167 | 138 | 4 | 0 | 11% |
| Brazil | 93 | 93 | 53 | 16 | 17 | 31% |
| Japan | 85 | 85 | 78 | 57 | 22 | 41% |
| France | 76 | 76 | 46 | 42 | 15 | 27% |
| Germany | 132 | 72 | 43 | 21 | 22 | 30% |
| Spain | 63 | 63 | 43 | 45 | 23 | 20% |
| South Korea | 40 | 40 | 29 | 25 | 8 | 25% |
| Canada | 37 | 37 | 31 | 46 | 10 | 21% |
| Italy | 32 | 32 | 18 | 19 | 9 | 22% |
| Taiwan | 30 | 30 | 20 | 64 | 1 | 12% |
| Mexico | 28 | 28 | 15 | 23 | 6 | 13% |
| India | 23 | 23 | 8 | 12 | 4 | 31% |
| Netherlands | 20 | 20 | 12 | 186 | 5 | 14% |
| Morocco | 19 | 19 | 7 | 10 | 1 | 8% |
| United Kingdom | 19 | 19 | 12 | 18 | 3 | 10% |
| Russia | 67 | 18 | 11 | 23 | 2 | 12% |
| Egypt | 18 | 18 | 4 | 7 | 1 | 24% |
| Pakistan | 18 | 18 | 11 | 10 | 2 | - |
| Bangladesh | 16 | 16 | 7 | 9 | 1 | - |
| Portugal | 16 | 16 | 12 | 39 | 0 | 15% |
| Saudi Arabia | 16 | 16 | 5 | 4 | 0 | - |
| China | 243 | 15 | 9 | 41 | 2 | 18% |
| Argentina | 15 | 15 | 7 | 12 | 2 | - |
| Iraq | 15 | 15 | 8 | 6 | 3 | - |
| United Arab Emirates | 13 | 13 | 5 | 22 | 5 | - |
| Indonesia | 12 | 12 | 3 | 5 | 0 | 17% |
| Colombia | 12 | 12 | 6 | 28 | 2 | - |
| Israel | 12 | 12 | 4 | 8 | 0 | 14% |
| Peru | 12 | 12 | 4 | 13 | 0 | 10% |

## ボット疑い層 1111 / 2921 users (38.0%)

| country | language | users | engaged | sec/user |
|---|---|---:|---:|---:|
| United States | Chinese | 649 | 100 | 0.0 |
| China | Chinese | 228 | 53 | 0.9 |
| Iran | Chinese | 66 | 9 | 0.0 |
| Germany | English | 60 | 4 | 1.1 |
| Vietnam | English | 59 | 4 | 2.3 |
| Russia | Chinese | 49 | 13 | 0.0 |
