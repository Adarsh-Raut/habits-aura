// Responsive + accessibility sweep over every screen, signed out and signed in.
// Needs the dev server on :3000 (DEV_LOGIN=1) with the seeded local DB.
//   node tests/e2e/responsive.e2e.mjs
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { PrismaClient } from "@prisma/client";

const BASE = "http://localhost:3000";
const prisma = new PrismaClient({ datasources: { db: { url: "postgresql://habits:habits@localhost:5440/habits_aura" } } });
let pass = 0, fail = 0;
const check = (name, cond, extra = "") => {
  cond ? pass++ : fail++;
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${cond ? "" : "  " + extra}`);
};

const WIDTHS = [[375, 812], [768, 900], [1280, 800]];
const habit = await prisma.habit.findFirst({ where: { user: { email: "harper@example.com" } }, select: { id: true } });
const SCREENS = [
  ["landing", "/signin", false],
  ["home", "/", true],
  ["create", "/create", true],
  ["edit", `/habit/${habit.id}/edit`, true],
  ["stats", "/stats", true],
  ["leaderboard", "/leaderboard", true],
];

const browser = await chromium.launch();

for (const [w, h] of WIDTHS) {
  console.log(`\n=== ${w}px ===`);
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, timezoneId: "Asia/Kolkata" });
  const authed = await browser.newContext({ viewport: { width: w, height: h }, timezoneId: "Asia/Kolkata" });
  const { csrfToken } = await (await authed.request.get(BASE + "/api/auth/csrf")).json();
  await authed.request.post(BASE + "/api/auth/callback/dev-login", { form: { csrfToken, email: "harper@example.com", callbackUrl: BASE, json: "true" } });

  for (const [name, path, needsAuth] of SCREENS) {
    const page = await (needsAuth ? authed : ctx).newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 120)));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 120)));
    await page.goto(BASE + path);
    await page.waitForTimeout(2200);
    // reveal every scroll-in block so the audit sees the whole page
    await page.evaluate(async () => { for (let y = 0; y <= document.documentElement.scrollHeight; y += 400) { window.scrollTo({ top: y, behavior: "instant" }); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo({ top: 0, behavior: "instant" }); });
    await page.waitForTimeout(900);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    check(`${name}: no horizontal overflow`, !overflow);
    check(`${name}: no console/page errors`, errors.length === 0, errors.join(" | "));

    const unnamed = await page.evaluate(() =>
      [...document.querySelectorAll("button, a[href], input, select")].filter((e) => {
        const r = e.getBoundingClientRect();
        if (!r.width || !r.height) return false;
        const label = e.getAttribute("aria-label") || e.innerText?.trim() || e.getAttribute("title") || (e.id && document.querySelector(`label[for="${e.id}"]`)) || e.closest("label")?.innerText?.trim();
        return !label;
      }).length,
    );
    check(`${name}: every control has an accessible name`, unnamed === 0, `${unnamed} unnamed`);

    // Automated accessibility scan (WCAG A/AA rules)
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).disableRules(["color-contrast"]).analyze();
    check(`${name}: axe a11y (no violations)`, axe.violations.length === 0, axe.violations.map((v) => `${v.id}(${v.nodes.length})`).join(", "));
    const contrast = await new AxeBuilder({ page }).withRules(["color-contrast"]).exclude("#dev-login-user").analyze();
    const real = contrast.violations.flatMap((v) => v.nodes).filter((n) => !/dev-login|Dev login/i.test(n.html));
    check(`${name}: text contrast meets WCAG AA`, real.length === 0, real.slice(0, 3).map((n) => n.html.slice(0, 70)).join(" || "));
    await page.close();
  }

  // Phone navigation: the drawer opens and links work
  if (w < 1024) {
    const page = await authed.newPage();
    await page.goto(BASE + "/");
    await page.waitForTimeout(1200);
    await page.getByLabel("Open menu").click();
    await page.getByRole("link", { name: "Leaderboard" }).click();
    await page.waitForURL(/leaderboard/);
    const heading = await page.getByRole("heading", { name: "Leaderboard" }).waitFor({ timeout: 8000 }).then(() => true, () => false);
    check("phone: drawer menu navigates to Leaderboard", heading);
    await page.close();
  }
  await ctx.close();
  await authed.close();
}

await browser.close();
await prisma.$disconnect();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
