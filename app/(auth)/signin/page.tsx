import { DiAtom } from "react-icons/di";
import { FaBolt, FaFireAlt } from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";
import DevLogin from "@/app/components/DevLogin";
import GoogleCta from "@/app/components/landing/GoogleCta";
import HeroDemo from "@/app/components/landing/HeroDemo";
import {
  HeatmapPreview,
  LeaderboardPreview,
  StreakPreview,
} from "@/app/components/landing/Previews";
import Reveal from "@/app/components/landing/Reveal";

const FEATURES = [
  {
    id: "streaks",
    eyebrow: "Streaks",
    title: "Streaks that respect your schedule",
    body: "Pick the days each habit happens. Off days never break your streak, and today stays safe until the day is over — so one busy afternoon doesn't erase weeks of work.",
    visual: <StreakPreview />,
  },
  {
    id: "heatmap",
    eyebrow: "Progress",
    title: "Your whole year in one glance",
    body: "Every check-in fills a square on a GitHub-style heatmap. See your best stretches, your slumps, and exactly how far you've come.",
    visual: <HeatmapPreview />,
  },
  {
    id: "leaderboard",
    eyebrow: "Aura",
    title: "Friendly competition, honest numbers",
    body: "Completing a habit earns +10 aura and skipping costs 10, so your score reflects what you actually did. Climb the leaderboard one check-in at a time.",
    visual: <LeaderboardPreview />,
  },
];

const STEPS = [
  {
    n: "1",
    title: "Create a habit",
    body: "Name it and choose the days it happens. Takes about ten seconds.",
  },
  {
    n: "2",
    title: "Check in daily",
    body: "Tap once for done (+10 aura), again for skipped. Made a mistake? Undo it.",
  },
  {
    n: "3",
    title: "Watch it compound",
    body: "Streaks grow, the heatmap fills in, and your rank climbs.",
  },
];

const FAQ = [
  {
    q: "Is it free?",
    a: "Yes. Habits Aura is free to use — no credit card needed.",
  },
  {
    q: "How do I sign in?",
    a: "With your Google account. There's no password to create or remember.",
  },
  {
    q: "What happens if I miss a day?",
    a: "A missed scheduled day resets your current streak, but your longest streak and your full history stay. Days that aren't on a habit's schedule never count against you.",
  },
  {
    q: "What is aura?",
    a: "Your score. Each completed check-in earns 10 aura and each skip costs 10. Undoing a check-in reverses it, so the number always matches your real history.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative z-10 flex flex-1 flex-col text-mist-100">
      <DevLogin />

      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-ink-700/80 bg-ink-950/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="#top" className="flex items-center gap-2">
            <DiAtom className="h-7 w-7 text-done" aria-hidden="true" />
            <span className="text-lg font-semibold tracking-tight">
              Habits Aura
            </span>
          </a>

          <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-mist-300 hover:text-mist-100">
              Features
            </a>
            <a href="#how" className="text-sm text-mist-300 hover:text-mist-100">
              How it works
            </a>
            <a href="#faq" className="text-sm text-mist-300 hover:text-mist-100">
              FAQ
            </a>
          </nav>

          <GoogleCta label="Sign in" size="md" variant="ghost" showIcon={false} />
        </div>
      </header>

      <main id="top">
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-28 lg:pt-28">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-ink-600 bg-ink-900 px-3 py-1 text-xs font-medium text-mist-300">
              <FaBolt className="h-3 w-3 text-gold" aria-hidden="true" />
              A habit tracker with a leaderboard
            </p>

            <h1 className="text-[2.5rem] font-bold leading-[1.05] tracking-[-0.03em] sm:text-6xl">
              Show up daily.
              <br />
              <span className="text-done">Watch your aura grow.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-mist-300">
              Habits Aura turns consistency into a game. Check in, keep your
              streak alive, and climb the leaderboard — without the guilt trip
              when life gets in the way.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <GoogleCta className="w-full sm:w-auto" />
              <a
                href="#how"
                className="inline-flex h-12 items-center justify-center rounded-lg px-4 text-base font-medium text-mist-300 hover:text-mist-100"
              >
                See how it works
              </a>
            </div>

            <p className="mt-4 text-sm text-mist-500">
              Free · No credit card · Sign in takes 10 seconds
            </p>
          </div>

          <div className="flex justify-center lg:justify-end">
            <HeroDemo />
          </div>
        </section>

        {/* Facts strip */}
        <section aria-label="Highlights" className="border-y border-ink-700/80 bg-ink-900/60">
          <dl className="mx-auto grid w-full max-w-6xl gap-px px-4 py-8 text-center sm:grid-cols-3 sm:px-6">
            {[
              ["+10", "aura for every check-in"],
              ["Your schedule", "decides what counts toward a streak"],
              ["365 days", "of history on one heatmap"],
            ].map(([big, small]) => (
              <div key={big} className="px-4 py-3">
                <dt className="text-2xl font-semibold tracking-tight text-mist-100">
                  {big}
                </dt>
                <dd className="mt-1 text-sm text-mist-500">{small}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <Reveal className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built for consistency, not perfection
            </h2>
            <p className="mt-4 text-lg text-mist-300">
              Everything you need to stick with a habit — and nothing that gets
              in the way.
            </p>
          </Reveal>

          <div className="space-y-20 lg:space-y-28">
            {FEATURES.map((feature, i) => (
              <Reveal
                key={feature.id}
                className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
              >
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <p className="mb-3 flex items-center gap-2 text-sm font-medium text-done">
                    <FaFireAlt className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                    {feature.eyebrow}
                  </p>
                  <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {feature.title}
                  </h3>
                  <p className="mt-4 max-w-lg text-lg leading-relaxed text-mist-300">
                    {feature.body}
                  </p>
                </div>
                <div
                  className={`flex ${
                    i % 2 === 1 ? "lg:order-1 lg:justify-start" : "lg:justify-end"
                  } justify-center`}
                >
                  {feature.visual}
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="border-y border-ink-700/80 bg-ink-900/60">
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
            <Reveal className="mx-auto mb-14 max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                How it works
              </h2>
              <p className="mt-4 text-lg text-mist-300">
                Three steps. You&apos;ll be tracking in under a minute.
              </p>
            </Reveal>

            <ol className="grid gap-6 md:grid-cols-3">
              {STEPS.map((step, i) => (
                <li key={step.n} className="list-none">
                  <Reveal
                    delay={i * 0.08}
                    className="h-full rounded-2xl border border-ink-600 bg-ink-900 p-6"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-done/15 text-sm font-semibold text-done">
                      {step.n}
                    </span>
                    <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                    <p className="mt-2 leading-relaxed text-mist-300">{step.body}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6 lg:py-28">
          <Reveal className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Questions
            </h2>
          </Reveal>

          <div className="divide-y divide-ink-700 rounded-2xl border border-ink-600 bg-ink-900">
            {FAQ.map((item) => (
              <details key={item.q} className="group px-5 py-4 sm:px-6">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-done [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <IoChevronDown
                    className="h-5 w-5 shrink-0 text-mist-500 transition-transform duration-200 group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="pb-2 pt-2 leading-relaxed text-mist-300">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 pb-20 sm:px-6 lg:pb-28">
          <Reveal className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-ink-600 bg-ink-900 px-6 py-14 text-center sm:px-12 sm:py-20">
            <div className="landing-cta-glow absolute inset-0" aria-hidden="true" />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
                Your streak starts today.
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-lg text-mist-300">
                Pick one habit, check in tonight, and see your aura move.
              </p>
              <div className="mt-8 flex justify-center">
                <GoogleCta />
              </div>
              <p className="mt-4 text-sm text-mist-500">
                Free · No credit card
              </p>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-ink-700/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-mist-500 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <DiAtom className="h-5 w-5 text-done" aria-hidden="true" />
            <span>Habits Aura</span>
          </div>
          <p>Build habits. Grow your aura.</p>
        </div>
      </footer>
    </div>
  );
}
