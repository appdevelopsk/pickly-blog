# Amazon アソシエイト 全アカウント状態チェック

作成: 2026-08-21 / 対象: 稼働中の全 Amazon トラッキングID

## なぜ今チェックするのか

同じ理由で2回失っている。

- 2026-07-24 `pickly091-20` (US) 却下 — 理由「特別リンクにトラッキングIDが使われておらず、
  トラフィックの発生元を特定できない」。**発覚は 8/6**。それまで本番は死にタグを配信し続け、
  US のクリックが全て無計上だった。
- 2026-08-21 `pickly06-21` (IT) 却下 — **同文の理由**。退避済み・異議申立て準備済み
  (`docs/AMAZON_IT_APPEAL.md`)。

失効経路は2つあり、混同してはいけない。

| 経路 | 内容 | 対象 |
|---|---|---|
| ① 審査却下 | 申請審査で落ちる。理由メールが届く | US(済) / IT(済) |
| ② 180日3件未達で自動閉鎖 | 適格販売3件に届かないと期限で閉鎖 | **UK / FR / ES / CA** |

②は**メール通知が来ないまま閉じることがある**ため、ダッシュボードを見に行くしかない。

## 現在ソースが配信しているタグ (2026-08-21 実測 / 17ロケール176,035本を走査)

| ネットワーク | タグ | ストア | 既知の状態 | 露出 |
|---|---|---|---|---|
| amazon-us | `pickly07-20` | amazon.com | 稼働中(Earn Globally 親) | 全ロケール |
| amazon-jp | `pickly-22` | amazon.co.jp | 稼働中 | 全ロケール |
| amazon-de | `pickly01-21` | amazon.de | 本承認済み | ja/it/es/fr 以外 |
| amazon-uk | `pickly0fd-21` | amazon.co.uk | **要確認(仮・3件条件)** | 全ロケール 965本 |
| amazon-ca | `pickly056-20` | amazon.ca | **要確認(仮・3件条件)** 税務情報未提出 | 全ロケール 965本 |
| amazon-fr | `picklyfr21-21` | amazon.fr | **要確認(仮・3件条件)** | fr のみ 3,646本 |
| amazon-es | `pickly07-21` | amazon.es | **要確認(仮・3件条件)** | es のみ 3,646本 |
| amazon-it | `pickly06-21` | amazon.it | 却下・**退避済み** | 0本 |

影響度は UK/CA が最大。全17ロケールに出ているため、閉鎖されていれば損失は IT の比ではない。

## 確認手順 (ユーザー実施 — ログインが必要)

各ストアの管理画面に **app.develop.sk@gmail.com** でログインする。

| ストア | URL |
|---|---|
| UK | https://affiliate-program.amazon.co.uk/home/account |
| CA | https://associates.amazon.ca/home/account |
| FR | https://partenaires.amazon.fr/home/account |
| ES | https://afiliados.amazon.es/home/account |
| DE | https://partnernet.amazon.de/home/account |
| US | https://affiliate-program.amazon.com/home/account |
| JP | https://affiliate.amazon.co.jp/home/account |

各ストアで見る点は3つ。

1. **アカウント状態** — 「稼働中 / Active」か。「閉鎖 / Closed」「審査中 / Under review」
   「却下 / Rejected」でないか。
2. **トラッキングID** — 上表のタグが実際に存在し有効か。
   (US の事故は「タグが実在しない」ではなく「別口の死にタグを配信していた」ケース)
3. **適格販売の残り** — 「180日以内に3件」の進捗と期限。何件・残り何日か。

## 報告してほしい形式

```
UK: 状態=?  タグpickly0fd-21=有効/無効  適格販売 ?/3  期限 ?
CA: ...
FR: ...
ES: ...
```

## 結果に応じてこちらが行う対応

- **閉鎖・却下が判明** → 該当ネットワークを `site/src/lib/affiliates/asp.ts` の
  `RETIRED_AMAZON_NETWORKS` に追加。US(Earn Globally)経由で自国 Amazon に送るため
  **報酬は失われない**。作業は1行。
- **タグが管理画面の値と違う** → `AMAZON_TAG_DEFAULTS` を実値に差し替え。
- **稼働中だが3件未達で期限が近い** → 退避せず維持。ただし期限日を記録し、
  過ぎたら再確認する。
- **全て稼働中** → 対応不要。

## 注意

- 退避しても収益は減らない。US アカウントは Earn Globally 対象
  (US/CA/UK/DE/FR/IT/ES/NL/PL/SE)で、訪問者は自国 Amazon にリダイレクトされ現地レートで計上される。
  **死にタグを配信し続けることだけが実損**。
- **JP は絶対に退避してはいけない**。amazon.co.jp は Earn Globally 対象外で、
  退避すると日本の読者が amazon.com に飛ばされる。
- CA は税務情報が未提出で**支払いが保留**される(計上はされる)。別途提出が必要。

---

## 実測結果 (2026-08-21)

管理画面 4アカウント分を本人ログインで確認。**StoreID は 4件とも
`AMAZON_TAG_DEFAULTS` の値と完全一致**。消去法で推定していた ES の
`pickly07-21` も実測で正解と確認できたため、「未計上クリック」の懸念は解消。

| ストア | StoreID | ソース値と一致 | 状態 | 直近30日クリック | 累計注文 | 報酬 |
|---|---|---|---|---|---|---|
| UK | `pickly0fd-21` | ✅ | 稼働中 | 11 | 0 | £0.00 |
| CA | `pickly056-20` | ✅ | 稼働中 | 9 | **1** | Can$1.96 |
| FR | `picklyfr21-21` | ✅ | 稼働中 | 9 | 0 | €0,00 |
| ES | `pickly07-21` | ✅ | 稼働中 | 15 | 0 | 0,00€ |

### 判断

- **コード変更は不要**。`RETIRED_AMAZON_NETWORKS` に追加すべきネットワークは無い
  (退避済みは `amazon-it` のみで変更なし)。
- **リスクは閉鎖ではなく転換率**。「180日以内に適格販売3件」を満たすストアが1つも無い
  (CA 1/3、UK・FR・ES 0/3)。auto-closure はメール通知なしに起こり得るため、
  次回も管理画面を直接見て確認すること。
- **仮に閉鎖されても収益は減らない**。Earn Globally により US アカウント経由で
  現地レート計上されるため、実損は死にタグの配信のみ。
- **本当のボトルネックは流入**。176,035本のリンクに対して30日で計44クリックしかない。
  アフィリ配線の問題ではなく集客の問題。
