// Run against the local Docker database and dev server with GUEST_DEMO=1.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { AxeBuilder } from "@axe-core/playwright";
import { PrismaClient } from "@prisma/client";
import { chromium } from "playwright";

const base = "http://localhost:3000";
const db = new PrismaClient({
  datasources: { db: { url: "postgresql://habits:habits@localhost:5440/habits_aura" } },
});
const browser = await chromium.launch();
const guestIds = [];
const fixtureIds = Array.from({ length: 120 }, () => randomUUID());

async function checkLayout(page, selector, width) {
  const { violations } = await new AxeBuilder({ page }).include(selector).analyze();
  assert.deepEqual(violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) })), []);
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    `page overflows at ${width}px`);
}

async function openDemo(width, timezoneId) {
  const context = await browser.newContext({ viewport: { width, height: 860 }, timezoneId, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(base + "/signin");
  const buttons = page.getByRole("button", { name: "Try the demo" });
  assert.equal(await buttons.count(), 3);
  const nav = page.getByRole("navigation", { name: "Primary" });
  await nav.getByRole("button", { name: "Try the demo" }).waitFor({ state: "visible" });
  await nav.getByRole("button", { name: "Sign in", exact: true }).waitFor({ state: "visible" });
  await checkLayout(page, "[data-guest-cta]", width);
  // Exercise the header, hero, and final call to action in separate visits.
  const entry = width === 375 ? 0 : width === 768 ? 1 : 2;
  await buttons.nth(entry).click();
  await page.waitForURL(base + "/");
  await page.getByRole("region", { name: "Guest demo" }).waitFor();
  const session = await (await context.request.get(base + "/api/auth/session")).json();
  const id = session.user.id;
  guestIds.push(id);
  await checkLayout(page, 'section[aria-label="Guest demo"]', width);
  return { context, page, id };
}

try {
  const first = await openDemo(375, "Pacific/Kiritimati");
  const second = await openDemo(768, "Pacific/Pago_Pago");
  assert.notEqual(first.id, second.id);
  const guests = await db.user.findMany({
    where: { id: { in: guestIds } },
    include: { habits: { include: { completions: true } } },
  });
  for (const guest of guests) {
    assert.equal(guest.isGuest, true);
    assert.equal(guest.email, null);
    assert.equal(guest.habits.length, 10);
    assert.equal(new Set(guest.habits.map(({ title }) => title)).size, 10);
    const completions = guest.habits.flatMap((habit) => habit.completions);
    assert(completions.length >= 175 && completions.length <= 250);
    assert.equal(guest.auraPoints, 100 + completions.reduce(
      (aura, row) => aura + (row.action === "COMPLETED" ? 10 : -10), 0,
    ));
  }

  const owner = guests.find(({ id }) => id === first.id);
  const daily = owner.habits.find(({ title }) => title === "Read 30 mins");
  const api = base + "/api/habits/" + daily.id;
  assert.equal((await second.context.request.patch(api)).status(), 404);
  assert.equal((await second.context.request.get(api + "/stats")).status(), 404);
  const stats = await (await first.context.request.get(api + "/stats")).json();
  assert(stats.currentStreak >= 10);
  assert(Object.keys(stats.calendar).length >= 75);
  const dateKeys = Object.keys(stats.calendar).sort();
  assert((Date.parse(dateKeys.at(-1)) - Date.parse(dateKeys[0])) / 86400000 >= 85);
  for (const [status, delta] of [["COMPLETED", 10], ["SKIPPED", -10], ["NONE", 0]]) {
    const response = await first.context.request.patch(api);
    assert.equal(response.status(), 200);
    assert.equal((await response.json()).status, status);
    assert.equal((await db.user.findUnique({ where: { id: first.id } })).auraPoints, owner.auraPoints + delta);
  }

  const payload = { title: "Demo-only habit", days: ["MON", "WED"] };
  const create = await first.context.request.post(base + "/api/habits", { data: payload });
  assert.equal(create.status(), 201);
  const custom = await create.json();
  const customUrl = base + "/api/habits/" + custom.id;
  assert.equal((await first.context.request.put(customUrl, {
    data: { ...payload, title: "Renamed demo habit" },
  })).status(), 200);
  assert.equal((await second.context.request.delete(customUrl)).status(), 404);
  assert.equal((await first.context.request.delete(customUrl)).status(), 200);

  await db.user.update({ where: { id: first.id }, data: { auraPoints: 100000 } });
  await first.page.goto(base + "/leaderboard");
  const demoScore = first.page.getByRole("region", { name: "Your demo score" });
  assert.equal(await demoScore.getByText("100,000", { exact: true }).count(), 1);
  assert.equal(await demoScore.getByText("Guest demo", { exact: true }).count(), 1);
  await checkLayout(first.page, 'section[aria-labelledby="demo-score-heading"]', 375);
  assert.equal(await first.page.getByText("Your Rank", { exact: true }).count(), 0);
  assert.equal(await first.page.getByText(/^100,?000$/).count(), 1);
  assert.equal(await first.page.getByText("Alex Johnson", { exact: true }).count(), 1);
  await second.page.goto(base + "/leaderboard");
  assert.equal(await second.page.getByText("100,000", { exact: true }).count(), 0);
  assert.equal((await first.context.request.patch(api)).status(), 200);
  await first.page.reload();
  assert.equal(await demoScore.getByText("100,010", { exact: true }).count(), 1);
  await first.page.getByRole("button", { name: "Reset demo" }).click();
  await first.page.waitForURL(base + "/");
  assert.equal((await first.context.request.get(api + "/stats")).status(), 404);
  const reset = await db.user.findUnique({
    where: { id: first.id },
    include: { _count: { select: { habits: true } } },
  });
  assert.equal(reset._count.habits, 10);
  assert.equal(reset.guestExpiresAt.getTime(), owner.guestExpiresAt.getTime());

  await db.user.update({ where: { id: first.id }, data: { guestExpiresAt: new Date(0) } });
  assert.equal((await first.context.request.get(base + "/api/habits")).status(), 401);
  await first.page.goto(base + "/");
  assert.equal(first.page.url(), base + "/signin");

  await openDemo(1280, "Asia/Kolkata");
  assert.equal(await db.user.findUnique({ where: { id: first.id } }), null);
  assert.equal(await db.habit.count({ where: { userId: first.id } }), 0);

  await db.user.createMany({
    data: fixtureIds.map((id) => ({
      id, isGuest: true, guestExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    })),
  });
  const capped = await browser.newPage();
  await capped.goto(base + "/signin");
  await capped.getByRole("button", { name: "Try the demo" }).first().click();
  await capped.getByRole("status").filter({ hasText: "The demo is busy" }).waitFor();
  assert.equal(capped.url(), base + "/signin");

  console.log("Guest demo passes responsive and axe checks at 375/768/1280px, plus isolation, stats, aura, leaderboard, reset, expiry, cleanup, and capacity checks.");
} finally {
  await browser.close();
  await db.user.deleteMany({ where: { id: { in: [...guestIds, ...fixtureIds] }, isGuest: true } });
  await db.$disconnect();
}
