"""_rescue-offers*.py の共通処理。名前・説明・価格を記事本文から起こすためのヘルパ。"""

import re

BADGE = {
    "parenting": "👶", "pets": "🐾", "home": "🏠",
    "fashion": "👗", "fitness": "🏋️", "food": "🍽️", "tech": "💻", "beauty": "💄",
}

ACRONYMS = {"tsa", "abus", "usb", "led", "xl", "uv", "bpa", "dna", "gps", "pvc", "ip68",
            "mips", "rfid", "spf", "bb", "cc", "4k", "hd", "ai", "nfc", "sim", "esim"}


def title_from_id(offer_id: str) -> str:
    """スラッグを人間が読める製品名に。既知の頭字語だけ大文字に戻す。"""
    return " ".join(w.upper() if w in ACRONYMS else w.capitalize() for w in offer_id.split("-"))


def first_sentence(text: str, limit: int = 220) -> str:
    text = re.sub(r"\s+", " ", text or "").strip()
    m = re.search(r"^(.+?[.。])\s", text + " ")
    return (m.group(1) if m else text)[:limit]


def prices(text: str):
    """レビュー本文中の $ 表記から最小/最大を取る。無ければ None(=空のままにする)。"""
    vals = [int(x.replace(",", "")) for x in re.findall(r"\$([0-9][0-9,]*)", text or "")]
    vals = [v for v in vals if 1 <= v <= 5000]
    if not vals:
        return None
    return f"${min(vals)}", f"${max(vals)}"
