/**
 * Pinterest ジャンル別アカウント定義。
 *
 * 各アカウントの認証情報は ~/.config/pickly/pinterest-{genre}.env に保存。
 * セッションは ~/.cache/pickly-playwright/pinterest-{genre}/ に永続化。
 *
 * 設定ファイルの形式:
 *   PINTEREST_LOGIN_EMAIL=pickly.fitness@gmail.com
 *   PINTEREST_LOGIN_PW=...
 *   PINTEREST_BOARD_ID=...        # setup-accounts.ts 実行後に自動記入
 *   PINTEREST_BOARD_NAME=Pickly Fitness Picks
 */
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

export interface PinterestAccount {
  genre: string;           // "fitness" | "food" | "home_kitchen" | "tech" | "beauty" | "default"
  displayName: string;     // Pinterest 表示名
  boardName: string;       // ボード名
  boardBoards: string[];   // pins.yaml の board フィールド値（マッチング用）
  envFile: string;         // 認証情報ファイルパス
  sessionDir: string;      // Playwright セッションディレクトリ
}

export const ACCOUNTS: PinterestAccount[] = [
  {
    genre: "fitness",
    displayName: "Pickly Fitness",
    boardName: "Pickly Fitness Picks",
    boardBoards: ["fitness", "fitness-en", "fitness-ja", "fitness-equipment", "fitness-equipment-jp"],
    envFile: path.join(os.homedir(), ".config/pickly/pinterest-fitness.env"),
    sessionDir: path.join(os.homedir(), ".cache/pickly-playwright/pinterest-fitness"),
  },
  {
    genre: "food",
    displayName: "Pickly Food & Coffee",
    boardName: "Pickly Food & Coffee Picks",
    boardBoards: ["food", "food-en", "food-ja", "food-kitchen", "food-kitchen-jp"],
    envFile: path.join(os.homedir(), ".config/pickly/pinterest-food.env"),
    sessionDir: path.join(os.homedir(), ".cache/pickly-playwright/pinterest-food"),
  },
  {
    genre: "home_kitchen",
    displayName: "Pickly Home",
    boardName: "Pickly Home Picks",
    boardBoards: ["home_kitchen", "home", "home-en", "home-ja"],
    envFile: path.join(os.homedir(), ".config/pickly/pinterest-home.env"),
    sessionDir: path.join(os.homedir(), ".cache/pickly-playwright/pinterest-home"),
  },
  {
    genre: "tech",
    displayName: "Pickly Tech",
    boardName: "Pickly Tech Picks",
    boardBoards: ["tech", "tech-en", "tech-ja"],
    envFile: path.join(os.homedir(), ".config/pickly/pinterest-tech.env"),
    sessionDir: path.join(os.homedir(), ".cache/pickly-playwright/pinterest-tech"),
  },
  {
    genre: "beauty",
    displayName: "Pickly Beauty",
    boardName: "Pickly Beauty Picks",
    boardBoards: ["beauty", "beauty-en", "beauty-ja"],
    envFile: path.join(os.homedir(), ".config/pickly/pinterest-beauty.env"),
    sessionDir: path.join(os.homedir(), ".cache/pickly-playwright/pinterest-beauty"),
  },
  {
    // フォールバック: 既存アカウント（カテゴリ未分類ピン用）
    genre: "default",
    displayName: "Pickly",
    boardName: "Pickly Picks",
    boardBoards: [],  // board フィールドがない or 上記に該当しない場合
    envFile: path.join(os.homedir(), ".config/pickly/pinterest.env"),
    sessionDir: path.join(os.homedir(), ".cache/pickly-playwright/pinterest"),
  },
];

/** pins.yaml の board フィールドからアカウントを解決 */
export function resolveAccount(board: string | undefined): PinterestAccount {
  if (!board) return ACCOUNTS.find((a) => a.genre === "default")!;
  const found = ACCOUNTS.find((a) => a.boardBoards.includes(board));
  return found ?? ACCOUNTS.find((a) => a.genre === "default")!;
}

/** 認証情報ファイルを読み込む */
export function loadAccountCreds(account: PinterestAccount): { email: string; pw: string; boardId: string; boardName: string } {
  const env: Record<string, string> = {};
  if (fs.existsSync(account.envFile)) {
    for (const line of fs.readFileSync(account.envFile, "utf8").split("\n")) {
      const m = line.match(/^(?:export\s+)?(\w+)=["']?([^"'\n]+)["']?/);
      if (m) env[m[1]] = m[2];
    }
  }
  return {
    email:     process.env[`PINTEREST_EMAIL_${account.genre.toUpperCase()}`]  ?? env.PINTEREST_LOGIN_EMAIL ?? "",
    pw:        process.env[`PINTEREST_PW_${account.genre.toUpperCase()}`]     ?? env.PINTEREST_LOGIN_PW    ?? "",
    boardId:   process.env[`PINTEREST_BOARD_${account.genre.toUpperCase()}`]  ?? env.PINTEREST_BOARD_ID    ?? "",
    boardName: env.PINTEREST_BOARD_NAME ?? account.boardName,
  };
}

/** アカウント設定状況を表示 */
export function printAccountStatus() {
  console.log("\nジャンル別アカウント設定状況:\n");
  for (const acc of ACCOUNTS) {
    const creds = loadAccountCreds(acc);
    const hasEmail = !!creds.email;
    const hasPw    = !!creds.pw;
    const hasBoardId = !!creds.boardId;
    const status = hasEmail && hasPw && hasBoardId ? "✓ 設定済み" : "✗ 未設定";
    const missing = [
      !hasEmail && "メール",
      !hasPw    && "パスワード",
      !hasBoardId && "ボードID",
    ].filter(Boolean).join(", ");
    console.log(`  [${acc.genre.padEnd(12)}] ${status}${missing ? `  (不足: ${missing})` : ""}`);
    if (hasEmail) console.log(`               ${creds.email}`);
  }
  console.log();
}
