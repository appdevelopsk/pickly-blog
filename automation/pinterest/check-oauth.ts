import { launch, ensureLoggedIn } from "./_browser";

async function main() {
  const APP_ID = process.env.PINTEREST_APP_ID!;
  const REDIRECT = "http://localhost:8080/callback";
  const SCOPES = "boards:read,boards:write,pins:read,pins:write,user_accounts:read";
  const authUrl = `https://www.pinterest.com/oauth/?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT)}&response_type=code&scope=${encodeURIComponent(SCOPES)}`;

  const { context, page } = await launch({ headless: false });
  await ensureLoggedIn(page);
  await page.goto(authUrl, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(5000);
  console.log(`Final URL: ${page.url()}`);
  console.log(`Title: ${await page.title()}`);
  await page.screenshot({ path: "/tmp/pinterest-oauth-page.png", fullPage: true });
  console.log("→ /tmp/pinterest-oauth-page.png");

  const visibleButtons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("button, a"))
      .filter((el) => !!(el as HTMLElement).offsetParent)
      .map((el) => ({
        tag: el.tagName,
        text: (el.textContent ?? "").trim().slice(0, 60),
        href: (el as HTMLAnchorElement).href ?? null,
      }))
      .filter((b) => b.text.length > 0);
  });
  console.log("\n=== visible buttons ===");
  for (const b of visibleButtons.slice(0, 20)) console.log(`${b.tag} "${b.text}" ${b.href ?? ""}`);
  await context.close();
}
main();
