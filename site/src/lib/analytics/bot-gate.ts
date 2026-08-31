// ヘッドレスブラウザ判定。GA4 計測の入口で使う。
//
// なぜ (2026-08-31): 2026-08 の GA4 実測で、全 2,369 セッションのうち約半分が
// 単一のヘッドレス Chrome 指紋だった:
//   operatingSystem=Linux + browser=Chrome + source=(direct)
//   + screenResolution=1440x900 + operatingSystemVersion=(not set)
//   + 平均滞在 1.1 秒 = 965 セッション (US 784 / China 180 / Iran 67 / Russia 24)
// これが国別レポートを US 51.5% / 滞在 7 秒に歪め、エンゲージメント率を
// 29.79% まで引き下げていた。この bot は page_view / session_start /
// first_visit しか撃たない (affiliate_click も scroll_depth もゼロ) ため、
// キーイベント側は無傷。汚染されているのはユーザー数・セッション数・
// page_view・平均滞在時間の4つ。
//
// 判定は「疑わしきは計測しない」ではなく「確実に自動化と分かるものだけ落とす」
// 方針にする。実ユーザーを1人でも落とすほうが害が大きいため、
// navigator.webdriver と UA の HeadlessChrome トークンという、
// 偽陽性がまず起きない2点だけを見る。解像度は判定に使わない
// (1440x900 は MacBook Air の実解像度でもあるため)。

export function isAutomatedClient(): boolean {
  if (typeof navigator === "undefined") return false;

  // 1. WebDriver 制御下 (Puppeteer / Playwright / Selenium の既定)
  if (navigator.webdriver === true) return true;

  const ua = navigator.userAgent ?? "";

  // 2. UA が自ら名乗るヘッドレス / クローラ
  if (/HeadlessChrome|Headless|PhantomJS|Electron\//i.test(ua)) return true;

  // 3. 明示的な bot / crawler / spider トークン
  //    (GA4 の「既知のボットを除外」を素通りする自作クローラ対策)
  if (/\b(bot|crawler|spider|scrapy|curl|wget|python-requests|axios|node-fetch)\b/i.test(ua)) {
    return true;
  }

  // 4. Puppeteer / Playwright が残す痕跡
  const w = window as unknown as Record<string, unknown>;
  if (w.__nightmare || w._phantom || w.callPhantom) return true;
  if ("__playwright" in w || "__pw_manual" in w || "__PW_inspect" in w) return true;
  if (w.__selenium_unwrapped || w.__webdriver_evaluate || w.__driver_evaluate) return true;

  return false;
}
