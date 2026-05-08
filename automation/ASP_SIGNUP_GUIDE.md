# ASP Signup Quick Reference (Pickly 17言語対応)

各ASPのsignupは公式サイトから直接行ってください。
登録時は **app.develop.sk@gmail.com (Google)** で signup with Google を優先。

## サインアップ用認証情報

各ASPの credential は `~/.config/pickly/<asp>.env` に保存済 (chmod 600)。

| 共通項目 | 値 |
|---|---|
| Email | `app.develop.sk@gmail.com` |
| Name | Kenichiro Sakamoto / 阪本 憲一郎 |
| Phone | +81-70-3531-7165 |
| Country | Japan |
| Address | 21-6-303 Showa-cho, Higashiosaka, Osaka 579-8046, Japan |
| Website | https://pickly.blog/ |
| Site name | Pickly |
| Description | Pickly is a 17-language review and comparison site driven by Pinterest. We hands-on test products and rank them across VPN, beauty, home appliances, and tech with explicit weaknesses for each pick. |
| Birthday | 1992-04-21 |

各ASPのpassword (env file の `*_PASSWORD` キー):
- Awin: `Kenn0421!!!!` (登録済)
- Hotmart: `hT4nQ8wPzKx9RmFa3`
- Involve Asia: `zR7mK3pQjL9wFnVa8`
- Coupang Partners: `cP9rJ4wKxL7mNvBa2`
- vCommission: `vC8nM4qPxT6kBwLa5`
- ArabClicks: `aC3nB7vKxL8mTpFa9`
- CJ: `cJ2nM7vKxL9wTpFa6`

## 各ASP signup URL (2026/05時点)

> URL は変わりやすいので、404 の場合は ASP のホームページ → "Become a Publisher" / "Sign up" / "Affiliate" メニューから辿ってください。

### 🌍 Tier 1 (グローバル / 重要)

| ASP | カバー言語 | Signup URL | Notes |
|---|---|---|---|
| **Amazon US** | en (US) | ✅ 完了 | Tax 0% Validated |
| **Awin** | en, fr, de, it, es, nl, ja(一部) | ✅ 完了 (54件 pending) | |
| **Impact** | en (VPN系全般) | https://app.impact.com/affiliate-signup | NordVPN/ExpressVPN/Surfshark等 |
| **CJ Affiliate** | en (US/UK) | https://signup.cj.com/member/signup/publisher/ | 厳格審査 |

### 🌏 Tier 2 (リージョン特化)

| ASP | カバー言語 | Signup URL | Notes |
|---|---|---|---|
| **A8.net** | ja | ✅ 登録済 (media_id: a26050810990) | reCAPTCHA手動 |
| **もしも** | ja | ✅ 登録済 | Amazon JP 経由 |
| **Involve Asia** | id, th, vi, zh-Hant | https://www.involve.asia/sign-up | SEA最大手 |
| **Hotmart** | pt-BR | https://accounts.hotmart.com/sign-up | デジタルプロダクト |
| **Coupang Partners** | ko | https://partners.coupang.com/#/sign-up | 韓国電話番号必要なケースあり |
| **vCommission** | hi | https://www.vcommission.com/become-an-affiliate/ | インド最大手 |
| **ArabClicks** | ar | https://app.arabclicks.com/signup | MENA最大手 |

### 🌎 Tier 3 (将来評価 / オプション)

| ASP | カバー言語 | URL候補 | Notes |
|---|---|---|---|
| Hepsiburada Affiliate | tr | hepsiburada.com/affiliate | トルコ |
| Daisycon | nl | daisycon.com | オランダ (Awin経由でも一部OK) |
| Tradetracker | es, fr | tradetracker.com | 欧州補強 |

## サインアップ後の流れ

各ASPでsignup → メール認証 → 審査 (1-7営業日) → 承認後:

1. **Login して merchant directory を確認**
2. 各 ASP に **bulk-apply スクリプト** が用意済 (まだのものは作成):
   - `npm run awin:bulk-apply` (実装済 ✅)
   - `npm run a8:list-programs` (実装済) → bulk-apply 化が必要
   - `npm run impact:bulk-apply` (未実装)
   - その他: 承認後にリクエストください

## サインアップ時のチェック項目

- [ ] **Sign up with Google** を優先 (Pickly は app.develop.sk@gmail.com 使用)
- [ ] Tax form (W-8BEN) を求められたら Japan/Article 0%, Foreign TIN: マイナンバー(831785207040)
- [ ] Payment method: Amazon Gift Card / Wire Transfer / PayPal が選べるなら PayPal 推奨
- [ ] 各ASPの利用規約に同意
- [ ] Site description の日本語/英語切り替えに注意

## 作業優先順位 (推奨)

1. **Impact** (VPN系大手 → Pickly の VPN 比較記事に必須)
2. **Involve Asia** (SEA 4言語一括カバー)
3. **CJ Affiliate** (Awin に無い米系大手)
4. **Hotmart** (PT-BR 必須)
5. **vCommission** (Hindi)
6. **ArabClicks** (Arabic)
7. **Coupang Partners** (Korean — 韓国電話番号無い場合は skip)
