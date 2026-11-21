import { IoCheckmark } from "react-icons/io5";

/* ---------- Week strip: off days never break a streak ---------- */

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const SCHEDULED = [true, false, true, false, true, false, false];

export function SchedulePanel() {
  return (
    <div className="min-w-0 flex-1 basis-[380px] rounded-3xl bg-ink p-6 text-paper sm:p-[26px]">
      <div className="mb-[18px] flex items-baseline justify-between gap-3">
        <div className="text-lg font-extrabold">Gym session</div>
        <div className="text-[13px] text-fog">Mon, Wed, Fri</div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {DAYS.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div
              className={`flex h-[46px] w-full items-center justify-center rounded-[10px] ${SCHEDULED[i] ? "bg-signal text-ink" : "bg-[#1c1c1f]"}`}
            >
              {SCHEDULED[i] && (
                <IoCheckmark className="h-[22px] w-[22px]" aria-label="done" />
              )}
            </div>
            <div className="text-xs font-bold text-fog">{day}</div>
          </div>
        ))}
      </div>
      <p className="mt-5 text-[15px] leading-relaxed text-[#b8b8bd]">
        Tuesday and Thursday aren&apos;t on the schedule, so they never count
        against you.
      </p>
    </div>
  );
}

/* ---------- Year heatmap (deterministic sample data) ---------- */

function sampleHeat(weeks: number) {
  let seed = 17;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  let total = 0;
  const cells: { color: string; delay: number }[] = [];
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const on = rnd() < 0.25 + 0.65 * (w / weeks);
      const tone = rnd();
      if (on) total += 1;
      cells.push({
        color: !on
          ? "#1c1c1f"
          : tone < 0.34
            ? "#ff4d1a"
            : tone < 0.68
              ? "#ff7a50"
              : "#ffb199",
        delay: w * 22,
      });
    }
  }
  return { cells, total };
}

export function HeatmapPanel() {
  const { cells, total } = sampleHeat(30);

  return (
    <div className="min-w-0 flex-1 basis-[420px] overflow-hidden rounded-3xl bg-ink p-6 text-paper sm:p-[26px]">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <div className="text-lg font-extrabold">Read 20 pages</div>
        <div className="text-[13px] text-fog">
          <span className="tabular-nums">{total}</span> days completed
        </div>
      </div>
      <div
        className="grid max-w-full grid-flow-col grid-rows-[repeat(7,13px)] gap-[3px] overflow-hidden"
        style={{ width: "max-content" }}
        aria-hidden="true"
      >
        {cells.map((cell, i) => (
          <div
            key={i}
            className="heat-cell h-[13px] w-[13px] rounded-[3px]"
            style={{ background: cell.color, animationDelay: `${cell.delay}ms` }}
          />
        ))}
      </div>
      <p className="mt-[18px] text-[15px] leading-relaxed text-[#b8b8bd]">
        Every check-in fills a square. Gaps and streaks are obvious at a glance.
      </p>
    </div>
  );
}

/* ---------- Leaderboard ---------- */

const PEOPLE = [
  ["Harper K.", "3,430"],
  ["Casey B.", "2,770"],
  ["Morgan D.", "2,380"],
  ["You", "2,290"],
  ["Sam W.", "2,210"],
];

export function LeaderboardPanel() {
  return (
    <div className="min-w-0 flex-1 basis-[380px] rounded-3xl bg-signal p-3.5 text-ink">
      <p className="px-4 pb-1 pt-2 text-xs font-bold text-ink">
        Sample data
      </p>
      <ol>
        {PEOPLE.map(([name, aura], i) => (
          <li
            key={name}
            className={`flex items-center gap-2 rounded-[14px] px-[18px] py-3.5 transition-transform duration-200 hover:translate-x-1.5 ${name === "You" ? "bg-ink text-paper" : ""}`}
          >
            <span className="w-11 text-3xl font-black tracking-[-0.04em] tabular-nums">
              {i + 1}
            </span>
            <span className="flex-1 text-lg font-extrabold">{name}</span>
            <span className="text-xl font-black tabular-nums">{aura}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
