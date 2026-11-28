// API integration test. Needs the dev server on :3000 using the LOCAL docker DB
// (npm run dev with .env.local) and seeded data (npm run seed).
// Run: node tests/e2e/api.e2e.mjs
import { encode } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";

const DB = "postgresql://habits:habits@localhost:5440/habits_aura";
const SECRET = "local-dev-only-secret-not-for-prod";
const BASE = "http://localhost:3000";
const prisma = new PrismaClient({ datasources: { db: { url: DB } } });

let pass = 0, fail = 0;
const check = (name, cond, extra = "") => {
  cond ? pass++ : fail++;
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${cond ? "" : "  " + extra}`);
};

async function sessionFor(email) {
  const u = await prisma.user.findUnique({ where: { email } });
  const jwt = await encode({ token: { userId: u.id, sub: u.id }, secret: SECRET });
  return { user: u, jwt };
}
const api = (jwt, tz = "UTC") => (path, opts = {}) =>
  fetch(BASE + path, {
    ...opts,
    headers: { cookie: `next-auth.session-token=${jwt}; tz=${tz}`, "content-type": "application/json" },
  });
const aura = async (id) => (await prisma.user.findUnique({ where: { id } })).auraPoints;
const ALL = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const keyIn = (tz) => new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());

const alex = await sessionFor("alex@example.com");
const sam = await sessionFor("sam@example.com");
const call = api(alex.jwt, "Asia/Kolkata");

// --- REST layout + security headers
const root = await fetch(BASE + "/signin");
check("security: nosniff", root.headers.get("x-content-type-options") === "nosniff");
check("security: frame deny", root.headers.get("x-frame-options") === "DENY");
check("security: referrer policy", !!root.headers.get("referrer-policy"));
check("security: CSP frame-ancestors", (root.headers.get("content-security-policy") ?? "").includes("frame-ancestors 'none'"));
check("old /api/habit route is gone", (await call("/api/habit", { method: "POST", body: "{}" })).status === 404);
check("GET /api/habits works", (await call("/api/habits")).status === 200);

// --- auth
check("unauthenticated list -> 401", (await fetch(BASE + "/api/habits")).status === 401);

// --- validation
const bad = async (body) => (await call("/api/habits", { method: "POST", body: JSON.stringify(body) })).status;
check("create: empty title -> 400", (await bad({ title: " ", days: ALL })) === 400);
check("create: long title -> 400", (await bad({ title: "x".repeat(121), days: ALL })) === 400);
check("create: no days -> 400", (await bad({ title: "a", days: [] })) === 400);
check("create: bogus day -> 400", (await bad({ title: "a", days: ["XYZ"] })) === 400);
check("create: bad JSON -> 400", (await call("/api/habits", { method: "POST", body: "{nope" })).status === 400);

// --- create + toggle cycle + aura rules (+10 / -10)
const created = await (await call("/api/habits", { method: "POST", body: JSON.stringify({ title: "  e2e habit ", days: ALL }) })).json();
check("create: title trimmed", created.title === "e2e habit");
const a0 = await aura(alex.user.id);
const t1 = await (await call(`/api/habits/${created.id}`, { method: "PATCH" })).json();
check("toggle 1 -> COMPLETED, streak 1", t1.status === "COMPLETED" && t1.currentStreak === 1);
check("aura +10 on complete", (await aura(alex.user.id)) === a0 + 10);
const t2 = await (await call(`/api/habits/${created.id}`, { method: "PATCH" })).json();
check("toggle 2 -> SKIPPED, streak 0", t2.status === "SKIPPED" && t2.currentStreak === 0);
check("aura -10 vs start on skip", (await aura(alex.user.id)) === a0 - 10);
const t3 = await (await call(`/api/habits/${created.id}`, { method: "PATCH" })).json();
check("toggle 3 -> NONE", t3.status === "NONE");
check("aura back to start", (await aura(alex.user.id)) === a0);

// --- race: 8 simultaneous toggles must not 500 and stay consistent
const results = await Promise.all(Array.from({ length: 8 }, () => call(`/api/habits/${created.id}`, { method: "PATCH" })));
const codes = results.map((r) => r.status);
check("race: no 500s", codes.every((c) => c === 200), codes.join(","));
const rows = await prisma.habitCompletion.findMany({ where: { habitId: created.id } });
const expectedAction = [null, "COMPLETED", "SKIPPED"][8 % 3]; // 8 steps from NONE
check("race: exactly one consistent row", rows.length <= 1 && (rows[0]?.action ?? null) === expectedAction, JSON.stringify(rows));
const auraExpected = a0 + ({ null: 0, COMPLETED: 10, SKIPPED: -10 })[String(rows[0]?.action ?? null)];
check("race: aura consistent with state", (await aura(alex.user.id)) === auraExpected);

// --- ownership
const other = api(sam.jwt, "Asia/Kolkata");
check("other user can't toggle", (await other(`/api/habits/${created.id}`, { method: "PATCH" })).status === 404);
check("other user can't edit", (await other(`/api/habits/${created.id}`, { method: "PUT", body: JSON.stringify({ title: "x", days: ALL }) })).status === 404);
check("other user can't delete", (await other(`/api/habits/${created.id}`, { method: "DELETE" })).status === 404);
check("other user can't read stats", (await other(`/api/habits/${created.id}/stats`)).status === 404);

// --- duplicate titles
const titleInput = (title) => JSON.stringify({ title, days: ALL });
const duplicate = await call("/api/habits", { method: "POST", body: titleInput("  E2E HABIT  ") });
check("create rejects the same title regardless of case or outer spaces", duplicate.status === 409);
if (duplicate.status === 201) {
  const { id } = await duplicate.json();
  await call(`/api/habits/${id}`, { method: "DELETE" });
}
const sameTitleOtherUser = await other("/api/habits", { method: "POST", body: titleInput("e2e habit") });
check("another user can use the same title", sameTitleOtherUser.status === 201);
if (sameTitleOtherUser.status === 201) {
  const { id } = await sameTitleOtherUser.json();
  await other(`/api/habits/${id}`, { method: "DELETE" });
}
const competing = await Promise.all(["E2E race %_", "e2e race %_"].map((title) =>
  call("/api/habits", { method: "POST", body: titleInput(title) }),
));
check("concurrent creates with the same title save exactly one habit", competing.map((r) => r.status).sort().join(",") === "201,409");
for (const response of competing.filter((r) => r.status === 201)) {
  const { id } = await response.json();
  const rename = await call(`/api/habits/${id}`, { method: "PUT", body: titleInput("e2e habit") });
  check("edit rejects renaming to another habit's title", rename.status === 409);
  await call(`/api/habits/${id}`, { method: "DELETE" });
}
const unchanged = await call(`/api/habits/${created.id}`, { method: "PUT", body: titleInput("e2e habit") });
check("edit can keep the habit's current title", unchanged.status === 200);

// --- edit validation + removing today refunds aura
check("edit: bad days -> 400", (await call(`/api/habits/${created.id}`, { method: "PUT", body: JSON.stringify({ title: "x", days: ["NOPE"] }) })).status === 400);
check("edit: non-string title -> 400 (no crash)", (await call(`/api/habits/${created.id}`, { method: "PUT", body: JSON.stringify({ title: 5, days: ALL }) })).status === 400);
// ensure COMPLETED today, then remove today's weekday
await prisma.habitCompletion.deleteMany({ where: { habitId: created.id } });
await prisma.user.update({ where: { id: alex.user.id }, data: { auraPoints: a0 } });
await call(`/api/habits/${created.id}`, { method: "PATCH" }); // COMPLETED => a0+10
const todayIdx = new Date(keyIn("Asia/Kolkata") + "T00:00:00Z").getUTCDay();
const withoutToday = ALL.filter((_, i) => i !== todayIdx);
const edited = await call(`/api/habits/${created.id}`, { method: "PUT", body: JSON.stringify({ title: "renamed", days: withoutToday }) });
const editedBody = await edited.json();
check("edit: ok + renamed", edited.status === 200 && editedBody.title === "renamed" && editedBody.status === "NONE");
check("edit: removing today refunds aura", (await aura(alex.user.id)) === a0);
check("toggle on non-scheduled day -> 400", (await call(`/api/habits/${created.id}`, { method: "PATCH" })).status === 400);

// --- delete takes back aura (1 completed + 1 skipped in history)
await prisma.habitCompletion.createMany({ data: [
  { habitId: created.id, dateKey: "2026-01-05", action: "COMPLETED" },
  { habitId: created.id, dateKey: "2026-01-06", action: "SKIPPED" },
] });
await prisma.user.update({ where: { id: alex.user.id }, data: { auraPoints: a0 + 10 - 10 + 100 } });
const del = await call(`/api/habits/${created.id}`, { method: "DELETE" });
check("delete: ok", del.status === 200);
check("delete: aura reversed (-(10) + 10 = 0 net of history)", (await aura(alex.user.id)) === a0 + 100);
check("delete: gone", (await prisma.habit.count({ where: { id: created.id } })) === 0);

// --- timezone: store the user's local day
for (const tz of ["Pacific/Kiritimati", "Pacific/Pago_Pago", "Asia/Kolkata", "bogus/zone"]) {
  const c = api(alex.jwt, tz);
  const h = await (await c("/api/habits", { method: "POST", body: JSON.stringify({ title: "tz " + tz, days: ALL }) })).json();
  await c(`/api/habits/${h.id}`, { method: "PATCH" });
  const row = await prisma.habitCompletion.findFirst({ where: { habitId: h.id } });
  check(`tz ${tz}: dateKey = local day`, row.dateKey === keyIn(tz.startsWith("bogus") ? "UTC" : tz), row.dateKey);
  await c(`/api/habits/${h.id}`, { method: "DELETE" });
}

// --- list only looks at recent history but old rows don't break it
{
  const h = await (await call("/api/habits", { method: "POST", body: JSON.stringify({ title: "old history", days: ALL }) })).json();
  await prisma.habitCompletion.createMany({ data: [
    { habitId: h.id, dateKey: "2020-01-01", action: "COMPLETED" },
    { habitId: h.id, dateKey: keyIn("Asia/Kolkata"), action: "COMPLETED" },
  ] });
  const list = (await (await call("/api/habits")).json()).habits;
  const found = list.find((x) => x.id === h.id);
  check("list: old rows ignored, today's status + streak ok", found.status === "COMPLETED" && found.streak === 1);
  await call(`/api/habits/${h.id}`, { method: "DELETE" });
}

// --- pages render
for (const p of ["/", "/stats", "/leaderboard", "/create"]) {
  const r = await fetch(BASE + p, { headers: { cookie: `next-auth.session-token=${alex.jwt}; tz=Asia/Kolkata` } });
  check(`page ${p} -> 200`, r.status === 200);
}

// cleanup: restore the starting aura, then verify it still equals the aura
// derived from completions (100 + 10/completed - 10/skipped) => no drift.
await prisma.user.update({ where: { id: alex.user.id }, data: { auraPoints: a0 } });
{
  const [row] = await prisma.$queryRaw`
    SELECT COALESCE(SUM(CASE c.action WHEN 'COMPLETED' THEN 10 WHEN 'SKIPPED' THEN -10 END), 0)::int AS delta
    FROM "HabitCompletion" c JOIN habits h ON h.id = c."habitId" WHERE h."userId" = ${alex.user.id}`;
  check("baseline aura equals 100 + completion deltas (run `npm run aura:check -- --fix` if this fails on old seed data)", a0 === 100 + row.delta, `${a0} vs ${100 + row.delta}`);
}
console.log(`\n${pass} passed, ${fail} failed`);
await prisma.$disconnect();
process.exit(fail ? 1 : 0);
