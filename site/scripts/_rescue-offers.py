"""
公開されていない記事(=offerId がカタログに1件も存在しない)を救出するための
オファー定義を、記事本文そのものから生成する。

なぜ必要か (2026-08-14 判明):
  記事ページの生成は `hasApprovedAds()` が通ったものだけ。その中身は
  `CATALOG.filter(o => article.offerIds.includes(o.id))` で、**offers.length === 0 なら即 false**。
  つまり offerId に対応するカタログ項目が1件も無い記事は、17ロケール全てで
  1ページも書き出されていない。書いたのに存在しない在庫が18本あった。

  逆に言うと、カタログに項目さえあれば approved:false でも
  localAmazonFallback が効いて公開される(物理カテゴリのみ)。
  finance は PHYSICAL_CATEGORIES に無いのでフォールバックが効かず、
  実提携を取るまで公開できない → 対象外。

名前・説明を捏造しないため、出力は**記事本文(messages/en.json, ja.json)から**取る:
  - name       : offerId のスラッグを語頭大文字化 + レビュー本文中の型番があればそれ
  - description: レビュー冒頭文(自分たちが書いた文章そのもの)
  - price      : レビュー本文中の $ 表記の最小/最大。無い場合は手当てリストに出す
"""

import json
import os
import re
import sys

BASE = "/Users/ken/pickly-blog/site/src/articles"

DEAD = [
    "best-baby-bath-toys-2026", "best-baby-laundry-detergent-2026", "best-cat-litter-mat-2026",
    "best-dog-paw-cleaner-2026", "best-dog-training-collar-2026", "best-fish-tank-beginners-2026",
    "best-grain-free-dog-food-2026", "best-kids-backpack-2026", "best-kids-bike-helmet-2026",
    "best-pet-first-aid-kit-2026", "best-senior-cat-food-2026", "best-toddler-learning-toys-2026",
    "best-toddler-potty-2026", "best-toddler-shoes-2026", "best-travel-document-organizer-2026",
    "best-travel-first-aid-kit-2026", "best-travel-lock-2026", "best-waterproof-dry-bag-2026",
]

# 記事カテゴリ → カタログ category。travel は PHYSICAL_CATEGORIES に無いので
# 物理的に Amazon で買える travel 用品は "fashion"(バッグ・小物) ではなく
# 実態に合わせて振る必要がある。ここでは記事ごとに明示する。
CATEGORY_OVERRIDE = {
    "best-travel-document-organizer-2026": "fashion",
    "best-travel-first-aid-kit-2026": "home",
    "best-travel-lock-2026": "home",
    "best-waterproof-dry-bag-2026": "fitness",
}

BADGE = {
    "parenting": "👶", "pets": "🐾", "home": "🏠",
    "fashion": "👗", "fitness": "🏋️", "food": "🍽️", "tech": "💻", "beauty": "💄",
}


def title_from_id(offer_id: str) -> str:
    """スラッグを人間が読める製品名に。既知の頭字語だけ大文字に戻す。"""
    acronyms = {"tsa", "abus", "usb", "led", "xl", "uv", "bpa", "dna", "gps", "pvc", "ip68"}
    words = []
    for w in offer_id.split("-"):
        words.append(w.upper() if w in acronyms else w.capitalize())
    return " ".join(words)


def first_sentence(text: str, limit: int = 220) -> str:
    text = re.sub(r"\s+", " ", text or "").strip()
    m = re.search(r"^(.+?[.。])\s", text + " ")
    s = m.group(1) if m else text
    return s[:limit]


def prices(text: str):
    vals = [int(x.replace(",", "")) for x in re.findall(r"\$([0-9][0-9,]*)", text or "")]
    vals = [v for v in vals if 1 <= v <= 5000]
    if not vals:
        return None
    return f"${min(vals)}", f"${max(vals)}"


def main():
    offers = []
    needs_price = []
    for slug in DEAD:
        en = json.load(open(f"{BASE}/{slug}/messages/en.json", encoding="utf-8"))
        # 未公開だった記事は翻訳も揃っておらず ja.json が無いものがある。
        ja_path = f"{BASE}/{slug}/messages/ja.json"
        ja = json.load(open(ja_path, encoding="utf-8")) if os.path.exists(ja_path) else {}
        meta = open(f"{BASE}/{slug}/meta.ts", encoding="utf-8").read()
        cat = CATEGORY_OVERRIDE.get(slug) or re.search(r'category:\s*"([a-z]+)"', meta).group(1)
        ja_by_id = {p.get("offerId"): p for p in ja.get("products", [])}
        for p in en.get("products", []):
            oid = p["offerId"]
            review_en = p.get("review", "")
            pr = prices(review_en)
            if pr is None:
                needs_price.append(f"{slug}\t{oid}")
                pr = ("", "")
            offers.append({
                "id": oid,
                "imageUrl": "",
                "priceMin": pr[0],
                "priceMax": pr[1],
                "category": cat,
                "badge": BADGE.get(cat, "🛒"),
                "name": {"en": title_from_id(oid), "ja": title_from_id(oid)},
                "description": {
                    "en": first_sentence(review_en),
                    "ja": first_sentence(ja_by_id.get(oid, {}).get("review", "")) or first_sentence(review_en),
                },
                "links": [{
                    "network": "direct",
                    "productId": "https://www.amazon.com/s?k=" + re.sub(r"\s+", "+", title_from_id(oid)),
                    "markets": ["global"],
                    "approved": False,
                }],
            })

    body = ",\n".join("  " + json.dumps(o, ensure_ascii=False, indent=2).replace("\n", "\n  ") for o in offers)
    src = (
        '/**\n'
        ' * 未公開だった18記事を救出するためのオファー定義 (2026-08-14).\n'
        ' *\n'
        ' * これらの記事は offerId に対応するカタログ項目が1件も無かったため\n'
        ' * hasApprovedAds() が false になり、17ロケール全てで1ページも生成されていなかった。\n'
        ' * 名前と説明は記事本文(自分たちが書いた review)から機械的に起こしているので、\n'
        ' * 存在しない製品情報を足していない。価格はレビュー本文中の $ 表記から拾っている。\n'
        ' *\n'
        ' * 生成: site/scripts/_rescue-offers.py\n'
        ' */\n'
        'import type { AffiliateOffer } from "./types";\n\n'
        "export const CATALOG_RESCUE: AffiliateOffer[] = [\n" + body + "\n] as unknown as AffiliateOffer[];\n"
    )
    dst = "/Users/ken/pickly-blog/site/src/lib/affiliates/catalog-rescue.ts"
    open(dst, "w", encoding="utf-8").write(src)
    print(f"生成 {len(offers)} offers → {dst}")
    if needs_price:
        print(f"\n■ 価格がレビュー本文に無く空のまま ({len(needs_price)}):")
        print("\n".join(needs_price))


if __name__ == "__main__":
    main()
