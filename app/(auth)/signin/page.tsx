import { IoChevronDown } from "react-icons/io5";
import { FaFireAlt } from "react-icons/fa";
import DevLogin from "@/app/components/DevLogin";
import Logo from "@/app/components/Logo";
import GoogleCta from "@/app/components/landing/GoogleCta";
import Marquee from "@/app/components/landing/Marquee";
import {
  HeatmapPanel,
  LeaderboardPanel,
  SchedulePanel,
} from "@/app/components/landing/Panels";
import Reveal from "@/app/components/landing/Reveal";
import {
  HabitDemoCard,
  StreakHeroProvider,
  StreakNumber,
} from "@/app/components/landing/StreakHero";

const FEATURES = [
  {
    big: "3",
    bigClass: "text-signal",
    title: "Streaks that respect your schedule.",
    body: "Pick the days a habit happens. Off days never break your streak, and today stays safe until the day is over.",
    panel: <SchedulePanel />,
    flip: false,
  },
  {
    big: "365",
    bigClass: "",
    title: "Your whole year, at a glance.",
    body: "See your best stretches, your slumps, and exactly how far you've come.",
    panel: <HeatmapPanel />,
    flip: true,
  },
  {
    big: "#1",
    bigClass: "text-signal",
    title: "Climb the leaderboard.",
    body: "Done earns 10 aura and skipped costs 10, so your score always matches what you really did.",
    panel: <LeaderboardPanel />,
    flip: false,
  },
];

const STEPS = [
  ["1", "Create a habit", "Name it and pick the days it happens."],
  ["2", "Check in daily", "Tap once for done, again for skipped. Undo anytime."],
  ["3", "Watch it compound", "Streaks grow, the heatmap fills in, your rank climbs."],
];

const RULES = [
  ["+10", "Done", "Check in and earn aura.", "text-signal"],
  ["−10", "Skipped", "Honest scores only.", ""],
  ["±0", "Undone", "Change your mind, no penalty.", "text-graphite"],
];

const FAQ = [
  [
    "Is it free?",
    "Yes. Habits Aura is free to use, with no credit card.",
  ],
  [
    "How do I sign in?",
    "With your Google account. There is no password to create or remember.",
  ],
  [
    "What happens if I miss a day?",
    "A missed scheduled day resets your current streak, but your longest streak and full history stay. Days that are not on a habit's schedule never count against you.",
  ],
  [
    "What is aura?",
    "Your score. Each check-in earns 10 aura and each skip costs 10. Undoing a check-in reverses it, so the number always matches your real history.",
  ],
];

export default function LandingPage() {
  return (
    <div className="relative z-10 flex flex-1 flex-col bg-paper text-ink">
      <DevLogin />

      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-ash bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex h-[72px] w-full max-w-[1160px] items-center justify-between gap-4 px-6">
          <a href="#top" className="flex items-center gap-2.5">
            <Logo className="h-[26px] w-[26px]" />
            <span className="text-[19px] font-extrabold tracking-tight">
              Habits Aura
            </span>
          </a>
          <nav
            aria-label="Primary"
            className="flex items-center gap-4 text-[15px] font-semibold text-graphite sm:gap-7"
          >
            <a href="#features" className="hidden hover:text-ink md:inline">
              Features
            </a>
            <a href="#how" className="hidden hover:text-ink md:inline">
              How it works
            </a>
            <a href="#faq" className="hidden hover:text-ink md:inline">
              FAQ
            </a>
            <GoogleCta label="Sign in" variant="link" />
          </nav>
        </div>
      </header>

      <main id="top">
        {/* Hero */}
        <StreakHeroProvider>
          <section className="mx-auto flex w-full max-w-[1160px] flex-wrap items-start justify-between gap-12 px-6 pb-[72px] pt-9">
            <div className="min-w-0 flex-1 basis-[520px]">
              <div className="anim-rise flex items-end gap-1.5 [animation-delay:60ms]">
                <StreakNumber />
                <FaFireAlt
                  className="anim-flame mb-1.5 h-[84px] w-[64px] shrink-0 text-signal sm:h-[108px] sm:w-[80px]"
                  aria-hidden="true"
                />
              </div>
              <div className="anim-rise mt-3.5 text-2xl font-extrabold text-signal [animation-delay:200ms]">
                days in a row
              </div>
              <h1 className="anim-rise mt-6 max-w-[560px] text-[clamp(34px,5vw,48px)] font-black leading-[1.06] tracking-[-0.03em] [animation-delay:320ms]">
                Build habits. Grow your aura.
              </h1>
              <p className="anim-rise mt-3.5 max-w-[500px] text-lg leading-relaxed text-graphite [animation-delay:320ms]">
                One number, every day. Keep it alive, earn aura, and see where
                you rank among everyone else.
              </p>
              <div className="anim-rise mt-7 flex flex-wrap items-center gap-x-[22px] gap-y-4 [animation-delay:440ms]">
                <GoogleCta size="lg" />
                <a
                  href="#how"
                  className="text-base font-bold underline decoration-2 underline-offset-4 hover:text-signal-text"
                >
                  See how it works
                </a>
              </div>
              <p className="anim-rise mt-3.5 text-sm text-[#6a6a70] [animation-delay:440ms]">
                Free. Sign in with Google in ten seconds.
              </p>
            </div>

            <div className="flex min-w-0 flex-1 basis-[380px] justify-center lg:justify-end">
              <HabitDemoCard />
            </div>
          </section>
        </StreakHeroProvider>

        <Marquee />

        {/* Features */}
        <section
          id="features"
          className="mx-auto w-full max-w-[1160px] px-6 pb-6 pt-24"
        >
          {FEATURES.map((feature) => (
            <Reveal
              key={feature.title}
              className={`mb-24 flex items-center gap-10 last:mb-6 ${feature.flip ? "flex-wrap-reverse" : "flex-wrap"}`}
            >
              <div className="min-w-0 flex-1 basis-[380px]">
                <div
                  className={`text-[clamp(120px,16vw,200px)] font-black leading-[0.8] tracking-[-0.07em] ${feature.bigClass}`}
                  aria-hidden="true"
                >
                  {feature.big}
                </div>
                <h2 className="mt-6 max-w-[480px] text-[clamp(30px,4vw,44px)] font-black leading-[1.08] tracking-[-0.03em]">
                  {feature.title}
                </h2>
                <p className="mt-3.5 max-w-[460px] text-lg leading-relaxed text-graphite">
                  {feature.body}
                </p>
              </div>
              {feature.panel}
            </Reveal>
          ))}
        </section>

        {/* How it works */}
        <section id="how" className="mt-[72px] bg-ink text-paper">
          <div className="mx-auto w-full max-w-[1160px] px-6 py-24">
            <Reveal>
              <h2 className="mb-14 max-w-[640px] text-[clamp(34px,5vw,56px)] font-black leading-[1.04] tracking-[-0.035em]">
                Three steps. Under a minute.
              </h2>
            </Reveal>
            <ol className="flex flex-wrap gap-10">
              {STEPS.map(([n, title, body], index) => (
                <li key={n} className="min-w-0 flex-1 basis-[260px] list-none">
                  <Reveal delay={index * 0.08}>
                    <div
                      className="text-[120px] font-black leading-[0.85] tracking-[-0.07em] text-signal"
                      aria-hidden="true"
                    >
                      {n}
                    </div>
                    <h3 className="mt-[18px] text-[22px] font-extrabold">
                      {title}
                    </h3>
                    <p className="mt-2 text-base leading-relaxed text-[#b8b8bd]">
                      {body}
                    </p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Aura rules */}
        <section className="mx-auto w-full max-w-[1160px] px-6 pb-6 pt-24">
          <ul className="flex flex-wrap gap-6">
            {RULES.map(([num, label, note, color], i) => (
              <li key={label} className="min-w-0 flex-1 basis-[240px]">
                <Reveal
                  delay={i * 0.08}
                  className="h-full rounded-[20px] border-2 border-ink p-7"
                >
                  <div
                    className={`text-[64px] font-black leading-none tracking-[-0.05em] ${color}`}
                  >
                    {num}
                  </div>
                  <div className="mt-2.5 text-lg font-extrabold">{label}</div>
                  <div className="mt-1 text-[15px] text-graphite">{note}</div>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="mx-auto w-full max-w-[820px] px-6 pb-6 pt-24"
        >
          <Reveal>
            <h2 className="mb-8 text-[clamp(34px,5vw,52px)] font-black leading-[1.04] tracking-[-0.035em]">
              Questions
            </h2>
          </Reveal>
          <div className="border-b-2 border-ink">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group border-t-2 border-ink py-1">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 text-xl font-extrabold marker:content-none hover:text-signal-text [&::-webkit-details-marker]:hidden">
                  {q}
                  <IoChevronDown
                    className="h-6 w-6 shrink-0 text-signal transition-transform duration-200 group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="mb-5 max-w-[640px] text-[17px] leading-relaxed text-graphite">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 pb-0 pt-24">
          <Reveal className="mx-auto max-w-[1160px] rounded-[32px] bg-ink px-6 py-[clamp(40px,8vw,96px)] text-paper sm:px-[clamp(24px,6vw,72px)]">
            <div className="text-[clamp(56px,11vw,150px)] font-black leading-[0.88] tracking-[-0.06em]">
              Day <span className="text-signal">1</span>
              <br />
              starts today.
            </div>
            <p className="mt-6 max-w-[460px] text-[19px] leading-normal text-[#b8b8bd]">
              Pick one habit. Check in tonight. Watch the number move.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <GoogleCta size="xl" />
              <span className="text-sm text-fog">Free. No credit card.</span>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-[1160px] flex-wrap items-center justify-between gap-4 px-6 py-12 text-sm text-[#6a6a70]">
        <div className="flex items-center gap-2.5 text-base font-extrabold text-ink">
          <Logo className="h-[22px] w-[22px]" />
          Habits Aura
        </div>
        <p>Build habits. Grow your aura.</p>
      </footer>
    </div>
  );
}
