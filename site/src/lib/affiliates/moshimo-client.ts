/**
 * もしもアフィリエイト 公式 API クライアント (skeleton).
 *
 * 状態: もしも公式 API は member-tier 限定で公開仕様が変動するため、
 *       実際の使用前に最新ドキュメントで endpoint/auth header を確認すること。
 *
 * このクラスは moshimo dashboard で発行される API key を使う想定。
 *   1. もしも管理画面右上 → アカウント設定 → API → 「APIキーを発行」
 *   2. .env.local に MOSHIMO_API_KEY を設定
 *
 * APIキーが取れない/プランで使えない場合、 `moshimo-link.ts` の URL builder で代替する。
 */

const BASE = process.env.MOSHIMO_API_BASE ?? "https://api.moshimo.com/v1";

export interface MoshimoPromotion {
  id: string;
  name: string;
  status: "active" | "pending" | "rejected";
  category?: string;
  commissionRate?: string;
}

export interface MoshimoProduct {
  id: string;
  promotionId: string;
  title: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
  /** Pre-built affiliate URL (with all tracking params) */
  affiliateUrl: string;
}

export class MoshimoClient {
  constructor(private apiKey = process.env.MOSHIMO_API_KEY) {
    if (!this.apiKey) {
      throw new Error(
        "MOSHIMO_API_KEY not set. Add it to .env.local after generating one in もしもダッシュボード → API。",
      );
    }
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Moshimo API ${res.status} ${path}: ${body}`);
    }
    return res.json() as Promise<T>;
  }

  /** 提携中のプロモーション一覧 */
  async listPromotions(): Promise<MoshimoPromotion[]> {
    const r = await this.request<{ items: MoshimoPromotion[] }>("/promotions");
    return r.items ?? [];
  }

  /** 提携プロモーション内の商品検索 (Amazon/楽天 など case-by-case) */
  async searchProducts(opts: {
    promotionId: string;
    keyword: string;
    limit?: number;
  }): Promise<MoshimoProduct[]> {
    const params = new URLSearchParams({
      promotion_id: opts.promotionId,
      keyword: opts.keyword,
      limit: String(opts.limit ?? 10),
    });
    const r = await this.request<{ items: MoshimoProduct[] }>(`/products/search?${params}`);
    return r.items ?? [];
  }

  /** 商品IDからアフィリエイトURL生成 */
  async generateLink(opts: {
    promotionId: string;
    productId: string;
  }): Promise<string> {
    const r = await this.request<{ url: string }>(`/links/generate`, {
      method: "POST",
      body: JSON.stringify({
        promotion_id: opts.promotionId,
        product_id: opts.productId,
      }),
    });
    return r.url;
  }

  /** 成果データ取得 (期間指定) */
  async getReports(opts: {
    fromDate: string; // "2026-05-01"
    toDate: string;
  }): Promise<unknown> {
    const params = new URLSearchParams({
      from: opts.fromDate,
      to: opts.toDate,
    });
    return this.request(`/reports?${params}`);
  }
}
