import { FaFireAlt, FaTrophy } from "react-icons/fa";
import { IoCheckmark } from "react-icons/io5";

/* ---------- Streak that respects the schedule ---------- */

const WEEK = [
  { day: "M", scheduled: true, done: true },
  { day: "T", scheduled: false, done: false },
  { day: "W", scheduled: true, done: true },
  { day: "T", scheduled: false, done: false },
  { day: "F", scheduled: true, done: true },
  { day: "S", scheduled: false, done: false },
  { day: "S", scheduled: false, done: false },
];

export function StreakPreview() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-ink-600 bg-ink-900 p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="font-medium text-mist-100">Gym session</p>
          <p className="text-xs text-mist-500">Mon · Wed · Fri</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1.5 text-sm font-semibold text-gold">
          <FaFireAlt className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="tabular-nums">3</span> day streak
        </span>
      </div>

      <div className="grid grid-cols-7 gap-2" role="list">
        {WEEK.map((d, i) => (
          <div key={i} role="listitem" className="flex flex-col items-center gap-2">
            <div
              className={`flex h-10 w-full items-center justify-center rounded-lg ${
                d.done
                  ? "bg-done text-ink-950"
                  : d.scheduled
                    ? "border-2 border-ink-600"
                    : "bg-ink-800"
              }`}
            >
              {d.done && <IoCheckmark className="h-5 w-5" aria-label="done" />}
            </div>
            <span className="text-xs text-mist-500">{d.day}</span>
          </div>
        ))}
      </div>

      <p className="mt-5 text-sm text-mist-300">
        Tuesday and Thursday aren&apos;t on the schedule, so they never break
        the streak.
      </p>
    </div>
  );
}

/* ---------- Year heatmap (deterministic sample data) ---------- */

function sampleLevels(weeks: number) {
  let seed = 7;
  const next = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  // Consistency ramps up over the year, like a real habit forming.
  return Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, () => {
      const chance = 0.25 + 0.65 * (w / weeks);
      return next() < chance ? 4 : 0;
    }),
  );
}

export function HeatmapPreview() {
  const weeks = sampleLevels(30);
  const total = weeks.flat().filter(Boolean).length;

  return (
    <div className="w-full max-w-md rounded-2xl border border-ink-600 bg-ink-900 p-5 sm:p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <p className="font-medium text-mist-100">Read 20 pages</p>
        <p className="text-xs text-mist-500">
          <span className="tabular-nums">{total}</span> days completed
        </p>
      </div>

      <div className="flex gap-[3px]" aria-hidden="true">
        {weeks.map((week, w) => (
          <div key={w} className="flex flex-1 flex-col gap-[3px]">
            {week.map((level, d) => (
              <div
                key={d}
                className={`aspect-square w-full rounded-[3px] ${
                  level ? "bg-done" : "bg-ink-700"
                } ${level && (w + d) % 3 === 0 ? "opacity-60" : ""}`}
              />
            ))}
          </div>
        ))}
      </div>

      <p className="mt-4 text-sm text-mist-300">
        Every check-in becomes a square. Gaps and streaks are obvious at a
        glance.
      </p>
    </div>
  );
}

/* ---------- Leaderboard ---------- */

const ROWS = [
  { rank: 1, name: "Harper K.", aura: 3430, tone: "bg-amber-400/20 text-amber-300" },
  { rank: 2, name: "Casey B.", aura: 2770, tone: "bg-slate-300/15 text-slate-200" },
  { rank: 3, name: "Morgan D.", aura: 2380, tone: "bg-orange-400/15 text-orange-300" },
  { rank: 4, name: "You", aura: 2280, tone: "bg-ink-700 text-mist-300", you: true },
  { rank: 5, name: "Sam W.", aura: 2210, tone: "bg-ink-700 text-mist-300" },
];

export function LeaderboardPreview() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-ink-600 bg-ink-900 p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-medium text-mist-100">Leaderboard</p>
        <span className="text-xs text-mist-500">Sample data</span>
      </div>

      <ol className="space-y-2">
        {ROWS.map((row) => (
          <li
            key={row.rank}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
              row.you ? "bg-done/10 ring-1 ring-done/40" : "bg-ink-800"
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${row.tone}`}
            >
              {row.rank === 1 ? (
                <FaTrophy className="h-3.5 w-3.5" aria-label="1st place" />
              ) : (
                row.rank
              )}
            </span>
            <span className="flex-1 truncate font-medium text-mist-100">
              {row.name}
            </span>
            <span className="tabular-nums font-semibold text-gold">
              {row.aura.toLocaleString("en-US")}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
