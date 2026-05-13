# 01_write — English article generation

You are writing the **English-language** content for an affiliate article. The output is a single JSON file at `site/src/articles/<slug>/messages/en.json` and a `meta.ts` at `site/src/articles/<slug>/meta.ts`.

## Inputs

- `pipeline/specs/<slug>.yaml` — article spec (slug, type, category, offerIds, research, pinAngle)
- `site/src/lib/affiliates/catalog.ts` — confirm each `offerId` exists; if not, add entries including `imageUrl`

### Catalog `imageUrl` requirements

Every catalog entry you create or modify **must include `imageUrl`**. The article list page uses this field as the card thumbnail — missing it causes the card to show a text-banner fallback instead of a product photo.

**Source priority (highest to lowest):**
1. Brand's official site if it runs on Shopify CDN (`cdn.shopify.com` or `<brand>.com/cdn/shop/`) — stable, no expiry
2. Best Buy (`pisces.bbystatic.com`) or Target (`target.scene7.com`) product image CDN
3. Authorized specialty retailer on Shopify CDN (e.g. macrobaby.com, rei.com, backcountry.com)

**Never use:**
- Amazon image CDN (`images-na.ssl-images-amazon.com`, `m.media-amazon.com`) — returns blank GIF stubs without PA API
- Walmart image CDN — blocks hotlinking
- Expiring signed URLs (avoid `X-Amz-Expires`, `token=`, `Signature=` in the URL)

**How to find the URL:**
1. Visit the brand's official site and open the product page
2. Right-click the main product image → "Copy image address"
3. Verify the URL ends in `.jpg`, `.png`, or `.webp` and loads directly in a browser tab
4. Prefer clean white-background product shots over lifestyle photos

If after searching you cannot find a hotlink-safe URL (e.g. Amazon/Walmart-exclusive product with no brand site), set `imageUrl` to the best available URL and add a `// TODO: find stable imageUrl` comment on the same line so it can be fixed later.

## Output structure

### `meta.ts`

```ts
import type { ArticleMeta } from "@/lib/articles/types";
import { ALL_LOCALES } from "@/lib/i18n/locales";

export const meta: ArticleMeta = {
  slug: "<slug>",
  type: "<review|comparison|guide>",
  category: "<category>",
  offerIds: [...],
  publishedAt: "<from spec>",
  updatedAt: "<from spec>",
  locales: ALL_LOCALES, // or specific list
  ogImage: "auto",
};
```

### `messages/en.json`

```json
{
  "title": "...",
  "description": "...",
  "lede": "...",
  "sections": [
    { "heading": "...", "paragraphs": ["...", "..."] }
  ],
  "faqs": [
    { "q": "...", "a": "..." }
  ],
  "offerNotes": {
    "<offerId>": "..."
  },
  "pinDescription": "..."
}
```

## Rules — these are hard requirements

### Title
- **Hard limit: 80 characters** (counted on the full Unicode string, ja included)
- Write a *headline*, not a search-keyword string. The product names belong in the lede and section bodies — not the title.
- ❌ `Best Gaming Mouse 2026: 5 options compared — Logicool G Pro X Superlight 2 vs Razer DeathAdder V3 vs Logicool MX Master 3S vs Elecom HUGE EX vs Microsoft Arc Mouse, sensor accuracy vs DPI marketing, polling rate reality, wireless latency truth, grip style guide, Japan market specifics, explicit weakness on every product`
- ❌ `加湿器おすすめ2026年版：5製品を徹底比較 — ダイソン vs パナソニック vs バルミューダ vs Levoit vs Stadler Form、超音波式・気化式・スチーム式の本当の違い、白い粉問題、…`
- ✓ `Best gaming mice 2026: sensor accuracy vs DPI hype`
- ✓ `加湿器おすすめ5選 2026 — 白い粉、カビ、メンテの本音比較`
- One subtitle clause after a colon or em-dash is fine; multiple "vs" or comma-separated keyword chains are not.

### Length & structure
- **3-6 sections** (up to **8** when `audienceLevel: beginner`), each with a clear `heading` and 2-4 paragraphs
- For `comparison` type: 1 section per ranked product/service, plus 1 intro section + 1 "how we picked" section. **Include one Markdown comparison table** (max 4 columns: e.g. price / speed / support / setup) inside a section's paragraph; sandwich it with a sentence before and after explaining how to read it.
- For `review` type: sections like "Who it's for", "What I liked", "What's missing", "Pricing", "Verdict"
- For `guide` type: sections like "What matters most", "Common mistakes", "Step-by-step"
- **6-10 FAQs** answering real questions (not "What is X?" — those are filler in FAQ. *Beginner-orientation belongs in a body section, not an FAQ.*)
- `lede`: 1-2 sentences max, hook the reader emotionally or with a concrete number

### Beginner mode (`audienceLevel: beginner` in spec)

Trigger when the spec sets `audienceLevel: beginner` — typical for rental servers, SaaS, financial accounts, or any category where readers are mostly first-timers.

- Insert a "What is X / Why it matters" body section near the top (150-250 words). Concrete and friction-focused — not a Wikipedia paraphrase. Specific numbers still required.
- For `review` / `guide`: add a **"Setup walkthrough"** section near the end using `subsections` (3-6 steps). Each step names a real screen / button / flag and a time estimate. Example subsection heading: `Step 2 — Connect your domain`. Mention screenshot placement in prose if no image is supplied.
- For `review`: add a **"Reassurance for first-timers"** section (200-300 words) covering safety nets the product offers — backups, free trial / refund window, JP-language support, undo/rollback. List the *named* feature, not vague comfort.
- "What is X?"-style content is allowed in the body but still banned in FAQ.

### Voice — kill AI tells
- **NEVER** start a paragraph with "In conclusion", "Furthermore", "Moreover", "It's important to note", "When it comes to"
- **NEVER** write empty summary paragraphs like "There are many factors to consider when choosing a VPN."
- **NEVER** use "delve", "leverage", "robust", "seamless", "ensure" in marketing-speak senses
- **NEVER** write a "総評 / Summary / Conclusion" section that re-states each product's recommendation. Recommendations live in the per-product sections. Closing thoughts, if any, should be one short paragraph with a *new* insight, not a recap.
- **NEVER** use the literal labels `Explicit weakness:` / `明確な弱点：` as a sentence prefix in every product section. Integrate the weakness into prose. If you need a parallel pattern across products, vary the wording.
- **NEVER** end with a tagline like "Every product has a weakness" / "全製品に弱点あり" / "全製品に明確な弱点あり". State weaknesses inline; the meta-claim is filler.
- **NEVER** lean on `本比較で唯一 / 本比較で最も / In this comparison, only X` as a rhetorical crutch. Use it at most once per article when it really matters.
- **DO** use specific numbers ($8.32/mo, 4.7Gbps, 32 countries) — vague claims fail
- **DO** use first-person observations ("I tested this for 3 weeks", "the install took 4 minutes")
- **DO** include a downside for each product — no product is perfect
- Prefer short sentences. 12-18 words average.

### Affiliate honesty
- Every product mentioned by name corresponds to an `offerId` in catalog
- **`offerNotes` keys must exactly match `meta.ts` `offerIds`** — every ID present in one, present in both. The audit (`npm run audit:content`) fails on mismatch.
- `offerNotes` should be 1 line per offer, e.g. `"nordvpn": "Best if you torrent — has dedicated P2P servers"`
- Do not write fake "I personally use this" claims if you don't have first-hand data — describe the product based on documented features
- Always end with a section that clarifies the rec is editorial, not paid

### Pinterest pin description
- 120-200 chars
- Start with a benefit or shock value
- No "click here", no "find out more"
- Include the year if the article is time-sensitive (2026)
- Example: "Five VPNs tested side-by-side for 30 days. Speed, price, and privacy compared — one is half the price of the others."

## SEO meta description
- 140-160 chars
- Front-load the keyword
- One emotional or numeric hook
- No clickbait punctuation (no `!!!`)

## Output checklist before finishing

- [ ] meta.ts compiles (correct ArticleType / ArticleCategory string literals)
- [ ] All `offerIds` resolve in catalog (if not, add the missing ones **with `imageUrl`**)
- [ ] **`offerNotes` keys exactly match `meta.ts` offerIds** — no extras, no missing
- [ ] **Title ≤ 80 chars in every locale**, no "A vs B vs C vs D vs E" chains, no comma-separated keyword stuffing after the em-dash
- [ ] No banned phrases (including the new ones: "総評" recap heading, "明確な弱点：" / "Explicit weakness:" repeated label, "全製品に弱点あり", "本比較で唯一" leaning)
- [ ] sections.length is 3-6 (up to 8 if `audienceLevel: beginner`)
- [ ] If comparison: contains a Markdown table with max 4 columns, with read-the-table sentences around it
- [ ] If `audienceLevel: beginner`: "What is X" body section, Setup walkthrough subsections, and (review only) Reassurance section all present
- [ ] faqs.length is 6-10, no "What is X?" generics
- [ ] pinDescription is 120-200 chars
- [ ] After finishing, run `cd site && npm run audit:content` and fix any reported hard errors
