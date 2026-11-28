// Creating several habits in a row must confirm instantly and play the whole
// sound every time (regression: the list page used to call audio.load() on
// mount, which aborted the sound a moment after it started).
// Needs the dev server on :3000 with DEV_LOGIN=1 and the local docker DB.
import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";

const BASE = "http://localhost:3000";
const prisma = new PrismaClient({ datasources: { db: { url: "postgresql://habits:habits@localhost:5440/habits_aura" } } });
let pass = 0, fail = 0;
const check = (name, cond, extra = "") => {
  cond ? pass++ : fail++;
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${cond ? "" : "  " + extra}`);
};

const email = "audio-test@example.com";
await prisma.user.deleteMany({ where: { email } });
const user = await prisma.user.create({ data: { email, name: "Audio Test" } });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1100, height: 800 }, timezoneId: "Asia/Kolkata" });
const { csrfToken } = await (await ctx.request.get(BASE + "/api/auth/csrf")).json();
await ctx.request.post(BASE + "/api/auth/callback/dev-login", { form: { csrfToken, email, callbackUrl: BASE, json: "true" } });

const page = await ctx.newPage();
let audioRequests = 0;
let downloads = 0;
await page.route("**/audio/completed-sound.mp3", (route) => {
  audioRequests++;
  return route.abort();
});
page.on("download", () => downloads++);
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 120)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 120)));
await page.addInitScript(() => {
  window.__starts = 0;
  window.__ended = 0;
  window.__mediaLoads = 0;
  const start = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function (...args) {
    window.__starts++;
    this.addEventListener("ended", () => window.__ended++);
    return start.apply(this, args);
  };
  // real latency from submit to the toast being on screen, measured in-page
  window.__lat = [];
  let tSubmit = 0;
  document.addEventListener("submit", () => { tSubmit = performance.now(); }, true);
  new MutationObserver(() => {
    const t = [...document.querySelectorAll("[data-sonner-toast]")].find((e) => e.textContent.includes("Habit created!") && !e.__seen);
    if (t) { t.__seen = true; window.__lat.push(Math.round(performance.now() - tSubmit)); }
  }).observe(document, { childList: true, subtree: true });
  const load = HTMLMediaElement.prototype.load;
  HTMLMediaElement.prototype.load = function () {
    window.__mediaLoads++;
    return load.call(this);
  };
});

await page.goto(BASE + "/");
await page.waitForTimeout(1000);
await page.getByRole("link", { name: "New habit" }).click();
await page.waitForURL(BASE + "/create");

for (let n = 1; n <= 4; n++) {
  console.log(`\n--- creation ${n} ---`);
  const startsBefore = await page.evaluate(() => window.__starts);
  const endedBefore = await page.evaluate(() => window.__ended);
  await page.fill('input[placeholder="Type your habit"]', `habit number ${n}`);
  await page.click('button[aria-label="Create Habit"]');
  // match this creation's toast (earlier ones can still be fading out)
  const toast = page.locator('[data-sonner-toast][data-visible="true"]', { hasText: `habit number ${n}` }).first();
  await toast.waitFor({ timeout: 4000 });
  const toastMs = await page.evaluate((i) => window.__lat[i], n - 1);
  check(`creation ${n}: confirmation toast appears instantly (${toastMs}ms)`, toastMs !== undefined && toastMs < 300, `${toastMs}ms`);
  check(`creation ${n}: toast says "Habit created!"`, (await toast.innerText()).includes("Habit created!"));
  await page.waitForURL(BASE + "/");
  await page.waitForSelector(`text=habit number ${n}`);
  check(`creation ${n}: habit is in the list`, true);

  // let the sound finish (the clip is ~1-2s) — it must finish, not be aborted
  await page.waitForFunction((b) => window.__ended > b, endedBefore, { timeout: 8000 }).catch(() => {});
  check(`creation ${n}: sound started exactly once`, (await page.evaluate(() => window.__starts)) === startsBefore + 1, String(await page.evaluate(() => window.__starts)));
  check(`creation ${n}: sound played to the end (not cut off)`, (await page.evaluate(() => window.__ended)) === endedBefore + 1, `ended=${await page.evaluate(() => window.__ended)}`);

  if (n < 4) {
    await page.getByRole("link", { name: "New habit" }).click(); // stay in the same JS session, like a real user
    await page.waitForURL(BASE + "/create");
  }
}

const endedBeforeToggle = await page.evaluate(() => window.__ended);
await page.getByRole("button", { name: "Toggle Habit" }).first().click();
await page.waitForFunction((count) => window.__ended > count, endedBeforeToggle, { timeout: 3000 }).catch(() => {});
check("checking off a habit plays the entire sound", (await page.evaluate(() => window.__ended)) === endedBeforeToggle + 1);
check("sound needs no separate MP3 request or download", audioRequests === 0 && downloads === 0);

check("no <audio>.load() calls that could abort playback", (await page.evaluate(() => window.__mediaLoads)) === 0);
check("no console/page errors", errors.length === 0, errors.join(" | "));

await browser.close();
await prisma.user.delete({ where: { id: user.id } });
await prisma.$disconnect();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
