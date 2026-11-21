// Headless-browser test (Playwright). Needs: dev server on :3000 with
// DEV_LOGIN=1 + local docker DB. Run from a dir that has `playwright` installed:
//   NODE_PATH=<dir>/node_modules node tests/e2e/browser.e2e.mjs
import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";
import os from "node:os";

const DB = "postgresql://habits:habits@localhost:5440/habits_aura";
const BASE = "http://localhost:3000";
const SHOTS = process.env.SHOTS_DIR || os.tmpdir();
const prisma = new PrismaClient({ datasources: { db: { url: DB } } });
let pass = 0, fail = 0;
const check = (name, cond, extra = "") => {
  cond ? pass++ : fail++;
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${cond ? "" : "  " + extra}`);
};
// The UI updates optimistically, so poll the DB until the server catches up.
async function until(fn, ms = 8000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (await fn()) return true;
    await new Promise((r) => setTimeout(r, 150));
  }
  return false;
}
const keyIn = (tz) => new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());

const browser = await chromium.launch();

async function run(tz) {
  console.log(`\n=== ${tz} ===`);
  const email = `browser-${tz.replace(/\W/g, "")}@example.com`;
  await prisma.user.deleteMany({ where: { email } });
  const user = await prisma.user.create({ data: { email, name: "Browser " + tz, auraPoints: 100 } });
  const aura = async () => (await prisma.user.findUnique({ where: { id: user.id } })).auraPoints;

  const ctx = await browser.newContext({ timezoneId: tz, viewport: { width: 1100, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.addInitScript(() => {
    window.__plays = 0;
    const orig = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () { window.__plays++; return Promise.resolve(); };
  });

  // login (dev-only credentials provider)
  const { csrfToken } = await (await ctx.request.get(BASE + "/api/auth/csrf")).json();
  await ctx.request.post(BASE + "/api/auth/callback/dev-login", {
    form: { csrfToken, email, callbackUrl: BASE, json: "true" },
  });

  // first visit: server has no tz cookie yet -> TimezoneSync must set it
  await page.goto(BASE + "/");
  await page.waitForFunction(() => document.cookie.includes("tz="), null, { timeout: 8000 }).catch(() => {});
  const cookies = await ctx.cookies();
  const tzCookie = decodeURIComponent(cookies.find((c) => c.name === "tz")?.value ?? "");
  check("tz cookie set from browser", tzCookie === tz, tzCookie);
  await page.waitForTimeout(800);
  check("empty state shown for new user", (await page.locator("text=/no habits|create|first habit/i").count()) > 0);
  await page.screenshot({ path: `${SHOTS}/${tz.replace("/", "_")}-1-empty.png` });

  // create via UI
  await page.goto(BASE + "/create");
  await page.fill('input[placeholder="Type your habit"]', "Browser test habit");
  await page.click('button[aria-label="Create Habit"]');
  await page.waitForURL(BASE + "/", { timeout: 8000 });
  await page.waitForSelector("text=Browser test habit");
  check("created habit appears in list", true);
  check("sound played on create", (await page.evaluate(() => window.__plays)) >= 1);

  const toggle = page.locator('button[aria-label="Toggle Habit"]').first();
  const row = async () => (await prisma.habitCompletion.findFirst({ where: { habit: { userId: user.id } } }));

  // toggle cycle
  const playsBefore = await page.evaluate(() => window.__plays);
  await toggle.click();
  await page.waitForFunction(() => document.querySelector('button[aria-label="Toggle Habit"]')?.textContent?.includes("✓"));
  await page.waitForTimeout(500);
  check("toggle 1: ✓ shown", true);
  check("sound played on complete", (await page.evaluate(() => window.__plays)) > playsBefore);
  await until(async () => !!(await row()));
  const r1 = await row();
  check("stored dateKey is user's local day", r1?.dateKey === keyIn(tz), `${r1?.dateKey} vs ${keyIn(tz)}`);
  await until(async () => (await aura()) === 110);
  check("aura 110 after complete", (await aura()) === 110, String(await aura()));
  await page.screenshot({ path: `${SHOTS}/${tz.replace("/", "_")}-2-completed.png` });

  await toggle.click();
  await page.waitForFunction(() => document.querySelector('button[aria-label="Toggle Habit"]')?.textContent?.includes("✕"));
  await page.waitForTimeout(500);
  await until(async () => (await aura()) === 90);
  check("toggle 2: ✕ shown, aura 90", (await aura()) === 90, String(await aura()));

  // persistence across reload while SKIPPED
  await page.reload();
  await page.waitForSelector("text=Browser test habit");
  check("state persists after reload (✕)", (await page.locator('button[aria-label="Toggle Habit"]').first().textContent()).includes("✕"));

  await page.locator('button[aria-label="Toggle Habit"]').first().click();
  await until(async () => (await aura()) === 100);
  check("toggle 3: back to none, aura 100", (await aura()) === 100 && !(await row()), String(await aura()));

  // complete again for stats/leaderboard
  await page.locator('button[aria-label="Toggle Habit"]').first().click();
  await until(async () => (await aura()) === 110);

  // edit via menu
  await page.click('button[aria-label="More Options"]');
  await page.getByRole("button", { name: /Edit/ }).click();
  await page.waitForURL(/\/habit\/.+\/edit/);
  await page.fill('input[placeholder="Type your habit"]', "Renamed habit");
  await page.click('button[aria-label="Save Changes"]');
  await page.waitForURL(BASE + "/");
  await page.waitForSelector("text=Renamed habit");
  check("edit: renamed in list", true);
  check("edit: completion kept (✓)", (await page.locator('button[aria-label="Toggle Habit"]').first().textContent()).includes("✓"));

  // regression: a habit with ~10 weeks of history used to crash the stats page
  // (the heatmap's per-cell Suspense boundaries broke hydration past ~50 cells)
  const habitRow = await prisma.habit.findFirst({ where: { userId: user.id }, select: { id: true } });
  const history = Array.from({ length: 70 }, (_, i) => {
    const d = new Date(keyIn(tz) + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() - (i + 1));
    return { habitId: habitRow.id, dateKey: d.toISOString().slice(0, 10), action: "COMPLETED" };
  });
  await prisma.habitCompletion.createMany({ data: history });

  // stats page heatmap
  await page.goto(BASE + "/stats");
  await page.waitForSelector("svg rect", { timeout: 8000 });
  await page.waitForTimeout(800);
  const text = await page.locator("body").innerText();
  check("stats: shows habit + streak 1", /Renamed habit/.test(text) && /1/.test(text));
  check("stats: 70-day history renders without errors", errors.length === 0 && (await page.locator("svg rect").count()) > 70, errors.join("|"));
  await prisma.habitCompletion.deleteMany({ where: { habitId: habitRow.id, dateKey: { not: keyIn(tz) } } });
  check("stats: heatmap has today's completed cell", (await page.locator(`rect[data-date="${keyIn(tz)}"]`).count()) > 0);
  await page.screenshot({ path: `${SHOTS}/${tz.replace("/", "_")}-3-stats.png` });

  // leaderboard
  await page.goto(BASE + "/leaderboard");
  await page.waitForTimeout(800);
  const lbText = await page.locator("body").innerText();
  const ahead = await prisma.user.count({ where: { OR: [{ auraPoints: { gt: await aura() } }, { auraPoints: await aura(), id: { lt: user.id } }] } });
  const rankShown = Number(/Your Rank\s*#(\d+)/.exec(lbText)?.[1]);
  check(`leaderboard: your rank #${ahead + 1} matches DB`, rankShown === ahead + 1, `shown ${rankShown}`);
  const [top, second] = await prisma.user.findMany({ orderBy: [{ auraPoints: "desc" }, { id: "asc" }], take: 2, select: { name: true } });
  const topIdx = lbText.indexOf(top.name);
  const secondIdx = lbText.indexOf(second.name);
  check("leaderboard: ranked in aura order (top user listed above #2)", topIdx > -1 && secondIdx > topIdx, `${top.name}@${topIdx} ${second.name}@${secondIdx}`);
  await page.screenshot({ path: `${SHOTS}/${tz.replace("/", "_")}-4-leaderboard.png` });

  // day rollover: a tab left open past midnight refetches + refreshes
  {
    const rollover = await ctx.newPage();
    await rollover.clock.install();
    await rollover.goto(BASE + "/");
    await rollover.waitForSelector("text=Renamed habit");
    const reqs = [];
    rollover.on("request", (r) => reqs.push(r.url()));
    await rollover.clock.fastForward("24:00:00");
    await rollover.waitForTimeout(1500);
    check("rollover: habits refetched after midnight", reqs.some((u) => u.includes("/api/habits")), reqs.join(","));
    check("rollover: page refreshed after midnight", reqs.some((u) => u.includes("_rsc")), reqs.join(","));
    await rollover.close();
  }

  // delete via menu
  await page.goto(BASE + "/");
  await page.waitForSelector("text=Renamed habit");
  await page.click('button[aria-label="More Options"]');
  await page.getByRole("button", { name: /Delete/ }).click();
  await until(async () => (await prisma.habit.count({ where: { userId: user.id } })) === 0);
  check("delete: removed from list", (await page.locator("text=Renamed habit").count()) === 0);
  await until(async () => (await aura()) === 100);
  check("delete: aura back to 100", (await aura()) === 100, String(await aura()));

  check("no console/page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await ctx.close();
  await prisma.user.delete({ where: { id: user.id } });
}

for (const tz of ["Pacific/Kiritimati", "America/Los_Angeles"]) await run(tz);

await browser.close();
await prisma.$disconnect();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
