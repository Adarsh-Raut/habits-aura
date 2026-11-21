// Landing page browser test. Needs the dev server on :3000 (+ DEV_LOGIN for the redirect check).
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
let pass = 0, fail = 0;
const check = (name, cond, extra = "") => {
  cond ? pass++ : fail++;
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${cond ? "" : "  " + extra}`);
};
const browser = await chromium.launch();

for (const [w, h] of [[1280, 800], [375, 812]]) {
  console.log(`\n=== ${w}px ===`);
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

  await page.goto(BASE + "/signin");
  await page.waitForSelector("h1");

  check("one h1 with the headline", (await page.locator("h1").count()) === 1 && /aura/i.test(await page.locator("h1").innerText()));
  const ov = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  check("no horizontal page overflow", !ov);

  // scroll reveal: below-the-fold blocks start hidden, then appear when scrolled to
  await page.waitForTimeout(300);
  const hiddenBefore = await page.locator(".reveal-hidden").count();
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 300) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 100)); } });
  await page.waitForTimeout(700);
  const hiddenAfter = await page.locator(".reveal-hidden").count();
  check("scroll reveal: hidden before, all revealed after scrolling", hiddenBefore > 0 && hiddenAfter === 0, `${hiddenBefore} -> ${hiddenAfter}`);
  await page.evaluate(() => window.scrollTo(0, 0));

  // interactive hero demo: aura 1250 -> +10 / -20 / +10
  const auraText = async () => (await page.getByTestId("demo-aura").innerText()).replace(/\D/g, "");
  check("demo starts at 1250", (await auraText()) === "1250", await auraText());
  const box = page.getByRole("button", { name: /Read 20 pages/ });
  await box.click();
  check("demo: complete = +10", (await auraText()) === "1260", await auraText());
  await box.click();
  check("demo: skip = -10 vs untouched", (await auraText()) === "1240", await auraText());
  await box.click();
  check("demo: undo returns to start", (await auraText()) === "1250", await auraText());
  const hit = await box.boundingBox();
  check("demo tap target >= 44px", hit.width >= 44 && hit.height >= 44, JSON.stringify(hit));

  // FAQ opens with keyboard
  const first = page.locator("details summary").first();
  await first.focus();
  await page.keyboard.press("Enter");
  check("FAQ opens via keyboard", await page.locator("details").first().evaluate((d) => d.open));

  // anchor scroll
  await page.getByRole("link", { name: "See how it works" }).first().click();
  await page.waitForTimeout(900);
  const howTop = await page.locator("#how").evaluate((e) => e.getBoundingClientRect().top);
  check("'See how it works' scrolls to the section", Math.abs(howTop) < 200, String(howTop));

  // All Google CTAs go to the OAuth flow
  const ctas = page.getByRole("button", { name: /Continue with Google/ });
  check("has primary CTAs (hero + footer panel)", (await ctas.count()) >= 2);
  const [req] = await Promise.all([
    page.waitForRequest((r) => r.url().includes("/api/auth/signin/google") || r.url().includes("accounts.google.com"), { timeout: 8000 }).catch(() => null),
    ctas.first().click(),
  ]);
  check("CTA starts Google sign-in", !!req);

  check("no console/page errors", errors.length === 0, errors.slice(0, 2).join(" | "));
  await ctx.close();
}

// reduced motion: content visible without scrolling through reveals
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/signin");
  const opacity = await page.locator("#faq h2").evaluate((e) => getComputedStyle(e.parentElement).opacity);
  check("reduced motion: below-the-fold content visible immediately", opacity === "1", opacity);
  await ctx.close();
}

// no JavaScript: all content must still be visible (server-rendered)
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(BASE + "/signin");
  const opacity = await page.locator("#faq h2").evaluate((e) => getComputedStyle(e.parentElement).opacity);
  check("no JS: below-the-fold content is visible", opacity === "1", opacity);
  check("no JS: headline and sections are in the HTML", (await page.locator("#features h3").count()) === 3);
  await ctx.close();
}

// logged-in users skip the landing page
{
  const ctx = await browser.newContext();
  const { csrfToken } = await (await ctx.request.get(BASE + "/api/auth/csrf")).json();
  await ctx.request.post(BASE + "/api/auth/callback/dev-login", { form: { csrfToken, email: "alex@example.com", callbackUrl: BASE, json: "true" } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/signin");
  await page.waitForURL(BASE + "/", { timeout: 8000 }).catch(() => {});
  check("signed-in visit to /signin redirects to the app", page.url() === BASE + "/", page.url());
  await ctx.close();
}

await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
