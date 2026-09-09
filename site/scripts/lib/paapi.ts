/**
 * Amazon Product Advertising API v5 (PA-API) クライアント。
 *
 * なぜ自前実装か: 公式 SDK (paapi5-nodejs-sdk) は CommonJS のみで型定義が無く、
 * ここで必要なのは GetItems の Offers.Listings.Price だけなので、
 * SigV4 署名 + fetch の 200 行で足りる。依存を増やさない。
 *
 * 必要な環境変数:
 *   PAAPI_ACCESS_KEY   アクセスキー
 *   PAAPI_SECRET_KEY   シークレットキー
 *   PAAPI_PARTNER_TAG  アソシエイトタグ（JP は pickly-22）
 *
 * 重要な制約（ここを踏むと 429 / 503 で全滅する）:
 *   - **売上要件**: 直近180日に3件の適格販売が無いとアカウントが PA-API を拒否する
 *     (TooManyRequests ではなく AccessDenied 系で返る)。未達なら price は取れない。
 *   - **レート**: 初期は 1 req/sec、1日 8,640 req。GetItems は 1 回 10 ASIN まで。
 *     売上に応じて上限が上がる。ここでは 1.1 秒間隔・10件バッチで固定する。
 *   - **リージョン**: JP は webservices.amazon.co.jp / us-west-2 (固定。東京ではない)。
 */
import { createHmac, createHash } from "node:crypto";

export type PaapiMarket = "JP" | "US";

type MarketConfig = { host: string; region: string; currency: "JPY" | "USD" };

/** PA-API のホストとリージョン。region は署名に使う値で、物理的な場所とは一致しない。 */
const MARKETS: Record<PaapiMarket, MarketConfig> = {
  JP: { host: "webservices.amazon.co.jp", region: "us-west-2", currency: "JPY" },
  US: { host: "webservices.amazon.com", region: "us-east-1", currency: "USD" },
};

const SERVICE = "ProductAdvertisingAPI";
const OPERATION = "GetItems";

/** GetItems の 1 リクエストあたり ASIN 上限（API 仕様）。 */
export const PAAPI_BATCH = 10;
/** 初期スロットルは 1 req/sec。少し余裕を持たせる。 */
export const PAAPI_DELAY_MS = 1100;

export type PaapiCreds = {
  accessKey: string;
  secretKey: string;
  partnerTag: string;
};

/** 環境変数から資格情報を読む。1つでも欠けたら null（呼び出し側でスキップ判定）。 */
export function readPaapiCreds(): PaapiCreds | null {
  const accessKey = process.env.PAAPI_ACCESS_KEY;
  const secretKey = process.env.PAAPI_SECRET_KEY;
  const partnerTag = process.env.PAAPI_PARTNER_TAG;
  if (!accessKey || !secretKey || !partnerTag) return null;
  return { accessKey, secretKey, partnerTag };
}

function hmac(key: Buffer | string, data: string): Buffer {
  return createHmac("sha256", key).update(data, "utf8").digest();
}

function sha256Hex(data: string): string {
  return createHash("sha256").update(data, "utf8").digest("hex");
}

/**
 * AWS Signature Version 4。PA-API は署名付きヘッダ方式のみを受け付ける。
 * 署名対象ヘッダは host / content-encoding / x-amz-date / x-amz-target の4つ
 * （この順序＝アルファベット順でなければ署名が一致しない）。
 */
function signRequest(
  creds: PaapiCreds,
  cfg: MarketConfig,
  payload: string,
  now: Date,
): Record<string, string> {
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, ""); // YYYYMMDDTHHMMSSZ
  const dateStamp = amzDate.slice(0, 8);
  const target = `com.amazon.paapi5.v1.ProductAdvertisingAPIv1.${OPERATION}`;
  const path = `/paapi5/${OPERATION.toLowerCase()}`;

  const signedHeaders = "content-encoding;host;x-amz-date;x-amz-target";
  const canonicalHeaders =
    `content-encoding:amz-1.0\n` +
    `host:${cfg.host}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-target:${target}\n`;

  const canonicalRequest = [
    "POST",
    path,
    "", // query string なし
    canonicalHeaders,
    signedHeaders,
    sha256Hex(payload),
  ].join("\n");

  const scope = `${dateStamp}/${cfg.region}/${SERVICE}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    scope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  // 派生キー: date → region → service → aws4_request の順に鎖状に HMAC する
  const kDate = hmac(`AWS4${creds.secretKey}`, dateStamp);
  const kRegion = hmac(kDate, cfg.region);
  const kService = hmac(kRegion, SERVICE);
  const kSigning = hmac(kService, "aws4_request");
  const signature = createHmac("sha256", kSigning).update(stringToSign, "utf8").digest("hex");

  return {
    "content-encoding": "amz-1.0",
    "content-type": "application/json; charset=utf-8",
    host: cfg.host,
    "x-amz-date": amzDate,
    "x-amz-target": target,
    Authorization:
      `AWS4-HMAC-SHA256 Credential=${creds.accessKey}/${scope}, ` +
      `SignedHeaders=${signedHeaders}, Signature=${signature}`,
  };
}

type PaapiItem = {
  ASIN?: string;
  Offers?: {
    Listings?: { Price?: { Amount?: number; Currency?: string; DisplayAmount?: string } }[];
    Summaries?: { LowestPrice?: { Amount?: number; Currency?: string; DisplayAmount?: string } }[];
  };
};

type PaapiResponse = {
  ItemsResult?: { Items?: PaapiItem[] };
  Errors?: { Code?: string; Message?: string }[];
};

export type PaapiError = { code: string; message: string };

/** 金額を表示文字列に整える。DisplayAmount は "￥17,800" のような全角混じりで来るため使わない。 */
function formatAmount(amount: number, currency: "JPY" | "USD"): string {
  return currency === "JPY"
    ? `¥${Math.round(amount).toLocaleString("ja-JP")}`
    : `$${amount.toFixed(2).replace(/\.00$/, "")}`;
}

/** 1 バッチ（最大10 ASIN）を取得。戻り値は asin → 表示価格。 */
export async function fetchPaapiBatch(
  creds: PaapiCreds,
  market: PaapiMarket,
  asins: string[],
): Promise<{ prices: Record<string, string>; error?: PaapiError }> {
  const cfg = MARKETS[market];
  const payload = JSON.stringify({
    ItemIds: asins,
    ItemIdType: "ASIN",
    Resources: [
      "Offers.Listings.Price",
      "Offers.Summaries.LowestPrice",
    ],
    PartnerTag: creds.partnerTag,
    PartnerType: "Associates",
    Marketplace: market === "JP" ? "www.amazon.co.jp" : "www.amazon.com",
  });

  const headers = signRequest(creds, cfg, payload, new Date());
  const res = await fetch(`https://${cfg.host}/paapi5/${OPERATION.toLowerCase()}`, {
    method: "POST",
    headers,
    body: payload,
  });

  const text = await res.text();
  if (!res.ok) {
    // 401/403 は資格情報か売上要件、429 はスロットル。呼び出し側が中断を判断する。
    let code = `HTTP_${res.status}`;
    let message = text.slice(0, 200);
    try {
      const j = JSON.parse(text) as PaapiResponse;
      if (j.Errors?.[0]) {
        code = j.Errors[0].Code ?? code;
        message = j.Errors[0].Message ?? message;
      }
    } catch {
      /* JSON でない（HTML エラーページ等）ならそのまま */
    }
    return { prices: {}, error: { code, message } };
  }

  const data = JSON.parse(text) as PaapiResponse;
  const prices: Record<string, string> = {};
  for (const item of data.ItemsResult?.Items ?? []) {
    if (!item.ASIN) continue;
    // Listings[0] が買い物かごに入る価格。無ければ Summaries の最安値に落とす。
    const listing = item.Offers?.Listings?.[0]?.Price;
    const lowest = item.Offers?.Summaries?.[0]?.LowestPrice;
    const picked = listing ?? lowest;
    if (picked?.Amount == null) continue;
    if (picked.Currency && picked.Currency !== cfg.currency) continue;
    prices[item.ASIN] = formatAmount(picked.Amount, cfg.currency);
  }
  return { prices };
}
