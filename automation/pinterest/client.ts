/**
 * Minimal Pinterest API v5 client.
 * Docs: https://developers.pinterest.com/docs/api/v5/
 *
 * Auth: Long-lived OAuth access token in PINTEREST_ACCESS_TOKEN env var.
 * Get one via `npm run auth` (one-time browser flow).
 */

const BASE = "https://api.pinterest.com/v5";

export class PinterestClient {
  constructor(private token = process.env.PINTEREST_ACCESS_TOKEN) {
    if (!this.token) {
      throw new Error("PINTEREST_ACCESS_TOKEN not set");
    }
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        "Authorization": `Bearer ${this.token}`,
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Pinterest ${res.status} ${path}: ${body}`);
    }
    return res.json() as Promise<T>;
  }

  async listBoards(): Promise<{ items: Array<{ id: string; name: string }> }> {
    return this.request("/boards");
  }

  async listBoardPins(boardId: string, bookmark?: string): Promise<{ items: Array<{ id: string; title?: string; link?: string }>; bookmark?: string }> {
    const qs = bookmark ? `?bookmark=${bookmark}&page_size=100` : "?page_size=100";
    return this.request(`/boards/${boardId}/pins${qs}`);
  }

  async createPin(input: {
    boardId: string;
    title: string;
    description: string;
    link: string;
    imageUrl: string;
    altText?: string;
  }): Promise<{ id: string }> {
    return this.request("/pins", {
      method: "POST",
      body: JSON.stringify({
        board_id: input.boardId,
        title: input.title.slice(0, 100),
        description: input.description.slice(0, 500),
        link: input.link,
        alt_text: input.altText?.slice(0, 500) ?? input.title.slice(0, 500),
        media_source: {
          source_type: "image_url",
          url: input.imageUrl,
        },
      }),
    });
  }
}
