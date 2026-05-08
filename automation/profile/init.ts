/**
 * Interactive profile setup — prompts for shared personal info once
 * and writes all 4 ASP env files (~/.config/pickly/{a8,shareasale,impact,amazon-us}.env)
 *
 * 1回の実行で、ASP申請に必要な共通プロフィール情報をターミナルで質問形式に収集し、
 * ASP固有のフォーマット (en表記/カタカナ/+81電話/etc) に変換して4ファイルに書き分ける。
 *
 * Usage:
 *   npm run profile:init
 *
 * 既存のenvを保持したい場合は --no-overwrite フラグ。
 */
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const CONFIG_DIR = path.join(os.homedir(), ".config/pickly");

interface Profile {
  email: string;
  lastName: string;
  firstName: string;
  lastNameKana: string;
  firstNameKana: string;
  lastNameRoman: string;
  firstNameRoman: string;
  birthday: string;
  postalCode: string;
  prefecture: string;
  address: string;
  addressEn: string;
  city: string;
  phone: string;
  phoneIntl: string;
  a8LoginId: string;
  a8Password: string;
  shareasaleUsername: string;
  shareasalePassword: string;
  impactPassword: string;
  amazonPassword: string;
}

function rand(charset: string, length: number): string {
  const buf = new Uint8Array(length);
  // crypto.getRandomValues is browser; for node use crypto.randomBytes
  const { randomBytes } = require("node:crypto");
  const b = randomBytes(length);
  for (let i = 0; i < length; i++) buf[i] = b[i];
  return Array.from(buf).map((v) => charset[v % charset.length]).join("");
}

function genLoginId(): string {
  return "pickly" + rand("abcdefghijklmnopqrstuvwxyz0123456789", 6);
}

function genPassword(): string {
  return rand("ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789", 14) + "Aa9!";
}

async function main() {
  const args = process.argv.slice(2);
  const noOverwrite = args.includes("--no-overwrite");

  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.chmodSync(CONFIG_DIR, 0o700);

  const rl = readline.createInterface({ input, output });

  const ask = async (q: string, def?: string): Promise<string> => {
    const prompt = def ? `${q} [${def}]: ` : `${q}: `;
    const ans = (await rl.question(prompt)).trim();
    return ans || def || "";
  };

  console.log("");
  console.log("===== Pickly ASP Profile Setup =====");
  console.log("4ASP共通プロフィール情報を1回入力 → 各env自動生成");
  console.log("(Enter で空のままスキップ可、デフォルトは [括弧内])");
  console.log("");

  const p: Profile = {} as Profile;

  console.log("--- 連絡先 ---");
  p.email = await ask("Email", "app.develop.sk@gmail.com");

  console.log("");
  console.log("--- 氏名 (本名、ASP登録のみ使用、サイト上には出ません) ---");
  p.lastName = await ask("姓 (漢字)");
  p.firstName = await ask("名 (漢字)");
  p.lastNameKana = await ask("姓 (カタカナ)");
  p.firstNameKana = await ask("名 (カタカナ)");
  p.lastNameRoman = await ask("Last name (英字、海外ASP用)");
  p.firstNameRoman = await ask("First name (英字、海外ASP用)");

  console.log("");
  console.log("--- 個人情報 ---");
  p.birthday = await ask("誕生日 (YYYY-MM-DD)");

  console.log("");
  console.log("--- 住所 ---");
  p.postalCode = await ask("郵便番号 (ハイフンなし、例: 1500001)");
  p.prefecture = await ask("都道府県 (例: 東京都)");
  p.city = await ask("市区町村 (例: 渋谷区)");
  p.address = await ask("町名以下 (例: サンプル1-1-1 サンプルマンション101)");
  p.addressEn = await ask("英字住所 (例: 1-1-1 Sample, Shibuya)", "");

  console.log("");
  console.log("--- 電話 ---");
  p.phone = await ask("電話番号 (国内、ハイフンなし、例: 09012345678)");
  if (p.phone.startsWith("0")) {
    p.phoneIntl = "+81-" + p.phone.slice(1);
  } else {
    p.phoneIntl = p.phone;
  }

  console.log("");
  console.log("--- ASP認証情報 (Enter で自動生成) ---");
  p.a8LoginId = await ask("A8.net login_id (3-15半角英数)", genLoginId());
  p.a8Password = await ask("A8.net password (8-16半角英数+記号)", genPassword());
  p.shareasaleUsername = await ask("ShareASale username", genLoginId());
  p.shareasalePassword = await ask("ShareASale password", genPassword());
  p.impactPassword = await ask("Impact password", genPassword());
  p.amazonPassword = await ask("Amazon Associates US password", genPassword());

  rl.close();

  // Write 4 envs
  const writeEnv = (filename: string, content: string) => {
    const p2 = path.join(CONFIG_DIR, filename);
    if (noOverwrite && fs.existsSync(p2)) {
      console.log(`  skip ${filename} (既存)`);
      return;
    }
    fs.writeFileSync(p2, content + "\n");
    fs.chmodSync(p2, 0o600);
    console.log(`  ✓ ${filename}`);
  };

  console.log("");
  console.log("→ env を ~/.config/pickly/ に書き込み中...");

  writeEnv(
    "a8.env",
    [
      `A8_EMAIL=${p.email}`,
      `A8_LOGIN_ID=${p.a8LoginId}`,
      `A8_PASSWORD=${p.a8Password}`,
      `A8_LAST_NAME=${p.lastName}`,
      `A8_FIRST_NAME=${p.firstName}`,
      `A8_LAST_NAME_KANA=${p.lastNameKana}`,
      `A8_FIRST_NAME_KANA=${p.firstNameKana}`,
      `A8_BIRTHDAY=${p.birthday}`,
      `A8_POSTAL_CODE=${p.postalCode}`,
      `A8_PREFECTURE=${p.prefecture}`,
      `A8_ADDRESS=${p.city}${p.address}`,
      `A8_PHONE=${p.phone}`,
      `A8_SITE_NAME=Pickly`,
      `A8_SITE_URL=https://pickly.blog/`,
      `A8_SITE_CATEGORY=エンタメ・趣味`,
      `A8_SITE_DESCRIPTION=Honest reviews and rankings, picked by humans, written for humans across 17 languages.`,
    ].join("\n"),
  );

  writeEnv(
    "shareasale.env",
    [
      `SHAREASALE_USERNAME=${p.shareasaleUsername}`,
      `SHAREASALE_PASSWORD=${p.shareasalePassword}`,
      `SHAREASALE_EMAIL=${p.email}`,
      `SHAREASALE_FIRST_NAME=${p.firstNameRoman}`,
      `SHAREASALE_LAST_NAME=${p.lastNameRoman}`,
      `SHAREASALE_PHONE=${p.phoneIntl}`,
      `SHAREASALE_ADDRESS1=${p.addressEn}`,
      `SHAREASALE_CITY=${p.city.replace(/区$|市$|町$|村$/, "")}`,
      `SHAREASALE_STATE=${p.prefecture.replace(/都$|府$|県$/, "")}`,
      `SHAREASALE_ZIP=${p.postalCode}`,
      `SHAREASALE_COUNTRY=Japan`,
      `SHAREASALE_WEBSITE_URL=https://pickly.blog/`,
      `SHAREASALE_WEBSITE_NAME=Pickly`,
      `SHAREASALE_WEBSITE_DESCRIPTION=Honest reviews and rankings across 17 languages — affiliate comparisons for VPN, home appliances, and beauty products driven primarily by Pinterest traffic.`,
    ].join("\n"),
  );

  writeEnv(
    "impact.env",
    [
      `IMPACT_EMAIL=${p.email}`,
      `IMPACT_PASSWORD=${p.impactPassword}`,
      `IMPACT_FIRST_NAME=${p.firstNameRoman}`,
      `IMPACT_LAST_NAME=${p.lastNameRoman}`,
      `IMPACT_COMPANY_NAME=Pickly`,
      `IMPACT_WEBSITE_URL=https://pickly.blog/`,
      `IMPACT_COUNTRY=Japan`,
      `IMPACT_PHONE=${p.phoneIntl}`,
      `IMPACT_MONTHLY_VISITORS=under-1000`,
      `IMPACT_PRIMARY_CATEGORY=Reviews`,
    ].join("\n"),
  );

  writeEnv(
    "amazon-us.env",
    [
      `AMAZON_US_EMAIL=${p.email}`,
      `AMAZON_US_PASSWORD=${p.amazonPassword}`,
      `AMAZON_US_PAYEE_NAME=${p.firstNameRoman} ${p.lastNameRoman}`,
      `AMAZON_US_WEBSITE_URL=https://pickly.blog/`,
      `AMAZON_US_PREFERRED_STORE_ID=US`,
      `AMAZON_US_PRIMARY_TOPICS=Consumer Electronics, Home & Garden, Beauty & Personal Care`,
      `AMAZON_US_TRAFFIC_SOURCES=Pinterest, SEO, Direct`,
      `AMAZON_US_MONTHLY_VISITORS=under-500`,
      `AMAZON_US_PHONE=${p.phoneIntl}`,
    ].join("\n"),
  );

  console.log("");
  console.log("✓ プロフィール書き込み完了");
  console.log("");
  console.log("次のコマンドで4ASPの自動申請を順次実行できます:");
  console.log("  npm run a8:signup");
  console.log("  npm run shareasale:signup");
  console.log("  npm run impact:signup");
  console.log("  npm run amazon-us:signup");
  console.log("");
  console.log("認証情報は ~/.config/pickly/ にローカル保存 (chmod 600)。");
  console.log("git にはコミットされません。");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
