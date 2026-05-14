/**
 * Google Search Console 検索パフォーマンス取得スクリプト
 *
 * 事前準備:
 *   1. Google Cloud Console でプロジェクト作成
 *   2. Search Console API を有効化
 *   3. OAuth 2.0 認証情報（デスクトップアプリ）を作成してJSONをダウンロード
 *   4. ダウンロードしたJSONを site/gsc-credentials.json として保存
 *
 * 使い方:
 *   cd site && npx tsx scripts/gsc-performance.ts
 *   cd site && npx tsx scripts/gsc-performance.ts --days 28
 *   cd site && npx tsx scripts/gsc-performance.ts --dim page
 *   cd site && npx tsx scripts/gsc-performance.ts --dim query --rows 20
 *   cd site && npx tsx scripts/gsc-performance.ts --no-save  # ファイル保存しない
 */
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { google } from "googleapis";

const SITE_URL = "https://pickly.blog/";
const CREDENTIALS_PATH = path.resolve(__dirname, "../gsc-credentials.json");
const TOKEN_PATH = path.resolve(__dirname, "../gsc-token.json");
const DATA_DIR = path.resolve(__dirname, "../gsc-data");
const SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"];

// CLI引数
const args = process.argv.slice(2);
const getArg = (name: string, def: string) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 ? args[i + 1] : def;
};
const DAYS = parseInt(getArg("days", "28"));
const DIM = getArg("dim", "page") as "page" | "query" | "country" | "device";
const ROWS = parseInt(getArg("rows", "50"));
const NO_SAVE = args.includes("--no-save");

function dateStr(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().split("T")[0];
}

async function getAuthClient() {
  // CI環境: 環境変数からbase64デコード
  if (process.env.GSC_CREDENTIALS_B64 && process.env.GSC_TOKEN_B64) {
    const creds = JSON.parse(Buffer.from(process.env.GSC_CREDENTIALS_B64, "base64").toString());
    const token = JSON.parse(Buffer.from(process.env.GSC_TOKEN_B64, "base64").toString());
    const { client_id, client_secret } = creds.installed || creds.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, "http://localhost:3456");
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }

  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error(`\n認証情報ファイルが見つかりません: ${CREDENTIALS_PATH}`);
    process.exit(1);
  }

  const creds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
  const { client_id, client_secret } = creds.installed || creds.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, "http://localhost:3456");

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }

  // 初回: ブラウザで認証
  const authUrl = oAuth2Client.generateAuthUrl({ access_type: "offline", scope: SCOPES });
  console.log("\n以下のURLをブラウザで開いて認証してください:\n");
  console.log(authUrl);
  console.log("\n認証後、ブラウザに表示されるコードを待っています...\n");

  const code = await new Promise<string>((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url!, "http://localhost:3456");
      const code = url.searchParams.get("code");
      res.end("<h1>認証完了！このタブを閉じてください。</h1>");
      server.close();
      if (code) resolve(code);
      else reject(new Error("認証コードが取得できませんでした"));
    });
    server.listen(3456);
  });

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  console.log("トークンを保存しました。次回から自動認証されます。\n");
  return oAuth2Client;
}

async function main() {
  const auth = await getAuthClient();
  const sc = google.webmasters({ version: "v3", auth });

  const endDate = dateStr(3);
  const startDate = dateStr(DAYS + 3);
  const today = dateStr(0);

  console.log(`\nサイト: ${SITE_URL}`);
  console.log(`期間: ${startDate} 〜 ${endDate} (${DAYS}日間)`);
  console.log(`集計軸: ${DIM}  表示件数: ${ROWS}\n`);

  const res = await sc.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate,
      endDate,
      dimensions: [DIM],
      rowLimit: ROWS,
      startRow: 0,
    },
  });

  const rows = res.data.rows ?? [];

  if (rows.length === 0) {
    console.log("データがありません。インデックスされるまでしばらくお待ちください。");
    return;
  }

  // コンソール出力
  const dimLabel = DIM.padEnd(60);
  console.log(`${"#".padEnd(4)} ${dimLabel} ${"クリック".padStart(8)} ${"表示".padStart(8)} ${"CTR".padStart(7)} ${"順位".padStart(6)}`);
  console.log("-".repeat(100));

  rows.forEach((row, i) => {
    const key = (row.keys?.[0] ?? "").slice(0, 60).padEnd(60);
    const clicks = String(row.clicks ?? 0).padStart(8);
    const impr = String(row.impressions ?? 0).padStart(8);
    const ctr = ((row.ctr ?? 0) * 100).toFixed(1).padStart(6) + "%";
    const pos = (row.position ?? 0).toFixed(1).padStart(6);
    console.log(`${String(i + 1).padEnd(4)} ${key} ${clicks} ${impr} ${ctr} ${pos}`);
  });

  const total = rows.reduce(
    (acc, r) => ({ clicks: acc.clicks + (r.clicks ?? 0), impressions: acc.impressions + (r.impressions ?? 0) }),
    { clicks: 0, impressions: 0 }
  );
  console.log("-".repeat(100));
  console.log(`合計: クリック ${total.clicks} / 表示 ${total.impressions}`);

  // ファイル保存
  if (!NO_SAVE) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const snapshot = {
      fetchedAt: today,
      startDate,
      endDate,
      dimension: DIM,
      totalClicks: total.clicks,
      totalImpressions: total.impressions,
      rows: rows.map(r => ({
        key: r.keys?.[0] ?? "",
        clicks: r.clicks ?? 0,
        impressions: r.impressions ?? 0,
        ctr: r.ctr ?? 0,
        position: r.position ?? 0,
      })),
    };
    const outPath = path.join(DATA_DIR, `${today}-${DIM}.json`);
    fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 2));
    console.log(`\nデータを保存しました: gsc-data/${today}-${DIM}.json`);
  }
}

main().catch(console.error);
