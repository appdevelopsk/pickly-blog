"""
全記事のlede短縮スクリプト
- 200文字超のledeをコロン前要約 + カテゴリ別2文目に置き換える
- en/ja のみ処理（他ロケールは元々短い）
"""

import json, glob, re, sys

# ── カテゴリ別 2文目（EN / JA） ──────────────────────────────────────────────
SECOND: dict[str, tuple[str, str]] = {
    "coffee":       ("The grind, water temp, and ratio matter far more than which brewer you choose.",
                     "豆の挽き方・湯温・比率がブリュワー選びより風味に影響する。"),
    "espresso":     ("Pressure consistency and temperature stability separate the results, not the price tag alone.",
                     "圧力の安定性と温度管理がスペック表以上に抽出品質を左右する。"),
    "tea":          ("Steep time and water temperature vary by type — the vessel is secondary.",
                     "蒸らし時間と温度は茶の種類で変わる。容器はその次だ。"),
    "fitness-equip":("Weight range and build quality determine long-term value far more than feature lists.",
                     "重量刻みと耐久性が、機能リストより長期の満足度を決める。"),
    "cardio":       ("Resistance feel and footprint fit matter more than maximum resistance specs.",
                     "負荷感とフットプリントが、最大抵抗値の数字より重要だ。"),
    "recovery":     ("Density and size matching your body type matter more than brand or feature count.",
                     "密度と自分の体型へのフィットが、ブランドや機能数より効果に直結する。"),
    "kitchen":      ("Weekly usage frequency, not recipe variety, determines which spec actually matters.",
                     "週何回使うかで、どのスペックが本当に重要かが変わる。"),
    "food-storage": ("Seal integrity and stackability outlast any smart feature after six months of daily use.",
                     "密封性と積み重ねやすさが、スマート機能より半年後の評価を左右する。"),
    "beauty":       ("Ingredient concentration and formulation compatibility matter more than brand reputation.",
                     "成分濃度と配合の相性が、ブランド知名度より効果に直結する。"),
    "supplement":   ("Bioavailability and consistency of intake outperform ingredient quantity on the label.",
                     "吸収率と継続しやすさが、ラベル上の成分量より実効性に直結する。"),
    "tech":         ("Daily comfort and build reliability outlast any spec-sheet advantage within a year.",
                     "毎日の使い心地と耐久性が、スペック上の優位性より長持ちする。"),
    "audio":        ("Driver tuning and fit seal determine what you actually hear, not driver size.",
                     "ドライバーチューニングとフィット感が、ドライバーサイズより実際の音質を決める。"),
    "sleep":        ("Firmness feel varies by body weight — a spec-sheet rating means nothing without that context.",
                     "硬さの感じ方は体重で変わる。スペック上の評価は体重の文脈なしに意味がない。"),
    "travel":       ("Carry-on compliance and weight distribution matter more than total capacity.",
                     "機内持ち込みサイズへの適合と重量バランスが、総容量より重要だ。"),
    "office":       ("Adjustability range matching your actual sitting posture matters more than material grade.",
                     "自分の姿勢に合う調整範囲が、素材のグレードより重要だ。"),
    "outdoor":      ("Fit and waterproof rating for your specific climate type matter most.",
                     "自分の気候条件に合ったフィット感と防水性能が最重要だ。"),
    "home-air":     ("CADR relative to your room size is the only spec that predicts real-world performance.",
                     "部屋面積に対するCADRが、実性能を唯一予測できるスペックだ。"),
    "beverage":     ("Temperature retention time and lid seal determine daily usability more than capacity.",
                     "保温時間と蓋の密封性が、容量より毎日の使い勝手を決める。"),
    "food-drink":   ("Taste consistency between batches matters more than health claims on the label.",
                     "バッチ間の味の安定性が、ラベル上の健康効果より重要だ。"),
    "default":      ("The decision comes down to one or two factors — the rest is noise.",
                     "判断を分けるのは1〜2点だけ。残りは誤差だ。"),
}

def get_category(slug: str) -> str:
    s = slug.lower()
    if any(x in s for x in ["aeropress","chemex","pour-over","french-press","hario","kalita","moka","siphon","turkish","vietnamese","cold-brew","coffee-scale","coffee-subscription","coffee-maker","burr-grinder","mushroom-coffee"]):
        return "coffee"
    if any(x in s for x in ["espresso"]):
        return "espresso"
    if any(x in s for x in ["tea","chai","matcha","yerba","kombucha"]):
        return "tea"
    if any(x in s for x in ["dumbbell","barbell","kettlebell","resistance-band","pull-up","push-up","squat","bench","rack","cable","lat-pull","leg-press","dip-bar","dip-belt","weight-plate","weight-vest","weight-bench","lifting-belt","weightlifting-belt","wrist-wrap","knee-sleeve","ez-curl","trap-bar","preacher","parallette","gymnastic-ring","battle-rope","sandbag","medicine-ball","plyometric","agility","jump-rope","speed-rope","punching-bag","boxing-glove","suspension","grip-strength","glute","hip-thrust","ab-roller","push-up-board","balance-board"]):
        return "fitness-equip"
    if any(x in s for x in ["treadmill","elliptical","spin-bike","stationary-bike","assault-bike","stair-stepper","rowing","spin"]):
        return "cardio"
    if any(x in s for x in ["foam-roller","stability-ball","yoga","massage-gun","posture","neck-pillow","sleep-mask","travel-pillow"]):
        return "recovery"
    if any(x in s for x in ["air-fryer","blender","food-processor","hand-mixer","standing-mixer","instant-pot","slow-cooker","sous-vide","waffle","bread-machine","pasta-maker","mandoline","ice-cream","immersion-blender","pressure-cooker","rice-cooker","food-dehydrator","vacuum-sealer","pizza-stone","salad-spinner","stockpot","dutch-oven","cast-iron","nonstick","wok","toaster","electric-grill","induction"]):
        return "kitchen"
    if any(x in s for x in ["meal-prep","cutting-board","knife","baking-sheet","kitchen-scale","meat-thermometer"]):
        return "food-storage"
    if any(x in s for x in ["shampoo","face-wash","facial","sunscreen","skincare","skin-care","hair","beauty","collagen","aroma"]):
        return "beauty"
    if any(x in s for x in ["protein","supplement","collagen","turmeric","electrolyte","bone-broth","apple-cider","greek-yogurt"]):
        return "supplement"
    if any(x in s for x in ["headphone","speaker","webcam","keyboard","mouse","projector","smart-speaker","tablet-stand","portable-charger","wireless-charger","travel-adapter","dash-cam","pet-camera","baby-monitor","smart-watch","fitness-tracker","running-watch","instant-camera","gaming"]):
        return "tech"
    if any(x in s for x in ["earphone","earbuds","audio"]):
        return "audio"
    if any(x in s for x in ["mattress","pillow","sleep","blanket","bath-towel","bath-mat"]):
        return "sleep"
    if any(x in s for x in ["luggage","backpack","travel-backpack","gym-bag"]):
        return "travel"
    if any(x in s for x in ["desk","chair","footrest","organizer","lamp","standing-desk","office"]):
        return "office"
    if any(x in s for x in ["hiking","running-shoe","cycling","swim","tennis","pickleball","sunglasses","camping","tent"]):
        return "outdoor"
    if any(x in s for x in ["air-purifier","air-quality","humidifier","robot-vacuum","cordless-vacuum","indoor-plant","electric-blanket","skincare-fridge"]):
        return "home-air"
    if any(x in s for x in ["water-bottle","insulated","reusable","sparkling-water","coconut-water","electric-kettle","tea-kettle"]):
        return "beverage"
    if any(x in s for x in ["honey","olive-oil","snack","meal-kit","wine","protein-bar","protein-shaker","green-tea"]):
        return "food-drink"
    return "default"


def shorten_en(lede: str, slug: str) -> str:
    cat = get_category(slug)
    second_en, _ = SECOND[cat]
    # Extract first clause (before colon)
    m = re.match(r'^([^:：]{15,200})[:：]', lede)
    if m:
        first = m.group(1).rstrip(" ,，").rstrip(".。") + "."
    else:
        # Split at first period + space, cap at 200 chars
        parts = re.split(r'\.\s+', lede, maxsplit=1)
        first = (parts[0][:200] if len(parts[0]) > 200 else parts[0]).rstrip(".") + "."
    return f"{first} {second_en}"


def shorten_ja(lede: str, slug: str) -> str:
    cat = get_category(slug)
    _, second_ja = SECOND[cat]
    # Extract first clause (before Japanese colon or 。)
    m = re.match(r'^([^：。]{8,80})[:：。]', lede)
    if m:
        first = m.group(1).rstrip("、，") + "。"
    else:
        # Cap at 60 chars at last 、or space
        chunk = lede[:80]
        cut = max(chunk.rfind("、"), chunk.rfind("。"), chunk.rfind(" "))
        first = (chunk[:cut] if cut > 10 else chunk[:60]).rstrip("、。") + "。"
    return f"{first}{second_ja}"


def process_file(path: str, locale: str) -> bool:
    with open(path, encoding="utf-8") as f:
        d = json.load(f)
    lede = d.get("lede", "")
    if len(lede) <= 200:
        return False

    slug = path.split("/")[-3]
    if locale == "en":
        d["lede"] = shorten_en(lede, slug)
    elif locale == "ja":
        d["lede"] = shorten_ja(lede, slug)
    else:
        return False  # skip other locales handled above

    with open(path, "w", encoding="utf-8") as f:
        json.dump(d, f, ensure_ascii=False, indent=2)
        f.write("\n")
    return True


count = 0
for path in sorted(glob.glob("/Users/ken/Dropbox/affiliate_factory/site/src/articles/*/messages/*.json")):
    locale = path.split("/")[-1].replace(".json", "")
    if locale not in ("en", "ja"):
        # For other locales: only process if >200 chars
        with open(path, encoding="utf-8") as f:
            d = json.load(f)
        if len(d.get("lede","")) > 200:
            # Simple truncation to first sentence for other locales
            lede = d["lede"]
            m = re.match(r'^([^:：.。]{10,150})[:：.。]', lede)
            if m:
                d["lede"] = m.group(1).rstrip(" ,") + ("." if locale not in ("ja","zh-CN","zh-TW","ko","th","ar") else "。")
                with open(path, "w", encoding="utf-8") as f:
                    json.dump(d, f, ensure_ascii=False, indent=2)
                    f.write("\n")
                count += 1
                print(f"  Fixed {path.split('/')[-3]} ({locale})")
        continue
    if process_file(path, locale):
        count += 1
        print(f"  Fixed {path.split('/')[-3]} ({locale})")

print(f"\nTotal fixed: {count} files")
