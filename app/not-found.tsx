import Link from "next/link";
import Logo from "@/app/components/Logo";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center text-ink">
      <Logo className="mb-8 h-10 w-10" />
      <div
        className="text-[clamp(120px,28vw,240px)] font-black leading-[0.8] tracking-[-0.07em] text-signal"
        aria-hidden="true"
      >
        404
      </div>
      <h1 className="mt-6 text-3xl font-black tracking-tight sm:text-4xl">
        This page took a day off.
      </h1>
      <p className="mt-3 max-w-md text-lg text-graphite">
        We couldn&apos;t find what you were looking for. Your streak is safe.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-[54px] items-center justify-center rounded-xl bg-signal px-7 text-base font-extrabold text-ink transition duration-150 hover:-translate-y-0.5 hover:bg-signal-hover"
      >
        Back to Habits Aura
      </Link>
    </main>
  );
}
