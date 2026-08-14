"""
公開はされているが商品カードが欠けている記事(=offerId の一部がカタログに無い)を埋める。

背景 (2026-08-14):
  「5製品を比較」と書いてある記事が実際には1枚しかカードを出していないものがあった。
  欠落は131件/38記事。`_rescue-offers.py`(未公開18記事の救出)と同じ方針で、
  **記事本文にある自分たちのレビュー文からオファーを起こす**。外部情報は足さない。

除外するもの:
  - finance カテゴリ / 保険 — PHYSICAL_CATEGORIES に無く Amazon フォールバックが効かない。
    実提携を取るまでカードを出せないので、ここで埋めても行き先が無い。

生成: python3 scripts/_rescue-offers2.py
"""

import json
import os
import re
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _rescue_offers_lib import BADGE, first_sentence, prices, title_from_id  # noqa: E402

BASE = "/Users/ken/pickly-blog/site/src/articles"

# Amazon で買えないもの。ここは実提携が要る。
SKIP_SLUGS = {
    "best-balance-transfer-credit-card-2026", "best-cryptocurrency-wallet-2026",
    "best-debt-consolidation-loan-2026", "best-estate-planning-software-2026",
    "best-etf-for-beginners-2026", "best-health-savings-account-2026",
    "best-index-fund-2026", "best-rewards-credit-card-2026",
    "best-small-business-loan-2026", "best-travel-insurance-senior-2026",
}

# travel カテゴリの物理商品は Amazon フォールバックが効くカテゴリに寄せる。
CATEGORY_OVERRIDE = {
    "best-backpacking-water-filter-2026": "fitness",
    "best-carry-on-backpack-women-2026": "fashion",
    "best-packing-belt-bag-travel-2026": "fashion",
    "best-portable-wifi-router-travel-2026": "tech",
    "best-travel-camera-2026": "tech",
    "best-travel-rain-jacket-2026": "fashion",
    "best-travel-satellite-communicator-2026": "tech",
}


def existing_ids():
    """CATALOG に載っている id を tsx 経由で取得する。"""
    out = subprocess.run(
        ["npx", "tsx", "-e",
         'const {CATALOG}=require("./src/lib/affiliates/catalog");'
         'console.log(JSON.stringify(CATALOG.map(o=>o.id)))'],
        cwd="/Users/ken/pickly-blog/site", capture_output=True, text=True, check=True,
    )
    return set(json.loads(out.stdout.strip().splitlines()[-1]))


def main():
    have = existing_ids()
    offers, needs_price, skipped = [], [], []
    for slug in sorted(os.listdir(BASE)):
        meta_path = f"{BASE}/{slug}/meta.ts"
        en_path = f"{BASE}/{slug}/messages/en.json"
        if not os.path.exists(meta_path) or not os.path.exists(en_path):
            continue
        meta = open(meta_path, encoding="utf-8").read()
        ids = re.findall(r'"([^"]+)"', "".join(re.findall(r"offerIds:\s*\[([^\]]*)\]", meta)))
        missing = [i for i in ids if i not in have]
        if not missing or len(missing) == len(ids):
            continue  # 欠落なし、または全滅(=_rescue-offers.py 済み)
        if slug in SKIP_SLUGS:
            skipped.append(f"{slug} ({len(missing)})")
            continue
        cat = CATEGORY_OVERRIDE.get(slug) or re.search(r'category:\s*"([a-z]+)"', meta).group(1)
        en = json.load(open(en_path, encoding="utf-8"))
        ja_path = f"{BASE}/{slug}/messages/ja.json"
        ja = json.load(open(ja_path, encoding="utf-8")) if os.path.exists(ja_path) else {}
        ja_by_id = {p.get("offerId"): p for p in ja.get("products", [])}
        for p in en.get("products", []):
            oid = p.get("offerId")
            if oid not in missing:
                continue
            review_en = p.get("review", "")
            pr = prices(review_en)
            if pr is None:
                needs_price.append(f"{slug}\t{oid}")
                pr = ("", "")
            offers.append({
                "id": oid, "imageUrl": "", "priceMin": pr[0], "priceMax": pr[1],
                "category": cat, "badge": BADGE.get(cat, "🛒"),
                "name": {"en": title_from_id(oid), "ja": title_from_id(oid)},
                "description": {
                    "en": first_sentence(review_en),
                    "ja": first_sentence(ja_by_id.get(oid, {}).get("review", "")) or first_sentence(review_en),
                },
                "links": [{
                    "network": "direct",
                    "productId": "https://www.amazon.com/s?k=" + re.sub(r"\s+", "+", title_from_id(oid)),
                    "markets": ["global"], "approved": False,
                }],
            })

    body = ",\n".join("  " + json.dumps(o, ensure_ascii=False, indent=2).replace("\n", "\n  ") for o in offers)
    src = (
        '/**\n'
        ' * 公開済みだが商品カードが欠けていた38記事の穴埋め (2026-08-14).\n'
        ' * 「5製品を比較」と書いておきながら1枚しかカードが出ていない記事があった。\n'
        ' * 名前と説明は記事本文(自分たちが書いた review)から機械的に起こしている。\n'
        ' * finance / 保険 は Amazon フォールバックが効かないので対象外(実提携が要る)。\n'
        ' *\n'
        ' * 生成: site/scripts/_rescue-offers2.py\n'
        ' */\n'
        'import type { AffiliateOffer } from "./types";\n\n'
        "export const CATALOG_RESCUE2: AffiliateOffer[] = [\n" + body + "\n] as unknown as AffiliateOffer[];\n"
    )
    dst = "/Users/ken/pickly-blog/site/src/lib/affiliates/catalog-rescue2.ts"
    open(dst, "w", encoding="utf-8").write(src)
    print(f"生成 {len(offers)} offers → {dst}")
    print(f"\n■ 実提携が要るので埋めない ({len(skipped)}): " + ", ".join(skipped))
    if needs_price:
        print(f"\n■ 価格がレビュー本文に無く空のまま ({len(needs_price)}):")
        print("\n".join(needs_price))


if __name__ == "__main__":
    main()
