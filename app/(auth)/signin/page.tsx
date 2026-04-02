"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import {
  LazyMotion,
  domAnimation,
  m,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { BsGrid3X3Gap } from "react-icons/bs";
import { DiAtom } from "react-icons/di";
import { FaBolt, FaFireAlt, FaGoogle } from "react-icons/fa";
import { IoRocketOutline } from "react-icons/io5";

const features = [
  {
    icon: FaFireAlt,
    title: "Build Streaks",
    description: "Create habits and maintain consistency day after day",
  },
  {
    icon: BsGrid3X3Gap,
    title: "Visualize Progress",
    description: "GitHub-style heatmap to track your consistency",
  },
  {
    icon: FaBolt,
    title: "Earn Aura Points",
    description: "Get rewarded for your consistency with aura points",
  },
];

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut",
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

function HabitPreview({
  status,
  title,
  streak,
}: {
  status: "completed" | "none" | "skipped";
  title: string;
  streak: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#3f4758] bg-[#161c18] p-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 text-lg font-bold ${
            status === "completed"
              ? "border-[#22c55e] text-[#22c55e]"
              : status === "skipped"
                ? "border-red-500 text-red-500"
                : "border-[#4b5563] text-[#6b7280]"
          }`}
        >
          {status === "completed" && "✓"}
          {status === "skipped" && "✕"}
        </div>
        <span className="font-medium text-[#e5e7eb]">{title}</span>
      </div>
      {streak > 0 ? (
        <span className="flex items-center gap-1 rounded-full bg-[#fb923c]/15 px-2 py-1 text-sm text-[#fb923c]">
          <FaFireAlt className="h-3 w-3" />
          {streak}
        </span>
      ) : (
        <IoRocketOutline className="h-5 w-5 text-[#6b7280]" />
      )}
    </div>
  );
}

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const animationProps = prefersReducedMotion
    ? {}
    : {
        initial: "hidden" as const,
        animate: "visible" as const,
      };

  const handleSignIn = () => {
    setLoading(true);
    signIn("google", {
      callbackUrl: "/",
      prompt: "select_account",
    });
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="relative z-10 flex flex-1 flex-col">
        <m.header
          variants={sectionVariants}
          {...animationProps}
          className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6"
        >
          <div className="flex items-center gap-2">
            <DiAtom className="h-8 w-8 text-[#d1d5db]" />
            <span className="text-xl font-bold text-[#f3f4f6]">Habits Aura</span>
          </div>
          <button
            onClick={handleSignIn}
            className="rounded-lg bg-[#22c55e] px-5 py-2.5 font-medium text-[#052e16] shadow-lg shadow-[#22c55e]/20 transition-all duration-300 hover:bg-[#4ade80] hover:shadow-[#22c55e]/30"
            aria-label="Sign in with Google"
          >
            Sign in
          </button>
        </m.header>

        <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
          <m.section
            variants={sectionVariants}
            {...animationProps}
            className="mb-12 w-full max-w-2xl text-center"
          >
            <m.h1
              variants={itemVariants}
              className="mb-6 text-4xl font-bold leading-tight text-[#f3f4f6] md:text-5xl lg:text-6xl"
            >
              Build habits. Track consistency.{" "}
              <span className="text-[#22c55e]">Grow your aura.</span>
            </m.h1>

            <m.p
              variants={itemVariants}
              className="mb-10 text-lg text-[#9aa4b2] md:text-xl"
            >
              Stay consistent, earn aura points, and compete on the leaderboard.
            </m.p>

            <m.div
              variants={itemVariants}
              className="mx-auto mb-10 w-full max-w-md"
            >
              <div className="space-y-3">
                <HabitPreview status="completed" title="Exercise" streak={7} />
                <HabitPreview status="completed" title="Read" streak={12} />
                <HabitPreview status="none" title="Meditate" streak={0} />
              </div>
            </m.div>

            <m.div variants={itemVariants}>
              <m.button
                whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                disabled={loading}
                onClick={handleSignIn}
                className="mx-auto flex w-full max-w-md items-center justify-center gap-3 rounded-xl bg-[#22c55e] px-6 py-4 font-semibold text-[#052e16] shadow-lg shadow-[#22c55e]/20 transition-all duration-300 hover:bg-[#4ade80] hover:shadow-[#22c55e]/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#052e16]/30 border-t-[#052e16]" />
                ) : (
                  <>
                    <FaGoogle className="h-5 w-5" />
                    <span>Continue with Google</span>
                  </>
                )}
              </m.button>
              <p className="mt-4 text-center text-sm text-[#7c8798]">
                Free · No credit card · Takes 10 seconds
              </p>
            </m.div>
          </m.section>

          <m.div
            variants={sectionVariants}
            {...animationProps}
            className="mx-auto mt-8 mb-16 w-full max-w-4xl"
          >
            <m.h2 variants={itemVariants} className="mb-10 text-center text-2xl font-bold text-[#f3f4f6] md:text-3xl">
              Everything you need
            </m.h2>

            <m.div
              variants={itemVariants}
              className="grid grid-cols-1 gap-6 md:grid-cols-3"
            >
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  style={
                    prefersReducedMotion
                      ? undefined
                      : { transitionDelay: `${index * 50}ms` }
                  }
                  className="rounded-2xl border border-[#3f4758] bg-[#161c18] p-6 transition-all duration-300 hover:border-[#6b7280]"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#fb923c]/15">
                    <feature.icon className="h-6 w-6 text-[#fb923c]" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-[#f3f4f6]">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[#9aa4b2]">{feature.description}</p>
                </div>
              ))}
            </m.div>
          </m.div>

          <m.div
            variants={sectionVariants}
            {...animationProps}
            className="mb-16 text-center"
          >
            <m.h3 variants={itemVariants} className="mb-3 text-2xl font-bold text-[#f3f4f6]">
              Ready to start?
            </m.h3>
            <m.p variants={itemVariants} className="mb-6 text-[#9aa4b2]">
              Takes 10 seconds to sign in.
            </m.p>
            <m.button
              variants={itemVariants}
              whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
              onClick={handleSignIn}
              className="rounded-xl bg-[#22c55e] px-8 py-4 font-semibold text-[#052e16] shadow-lg shadow-[#22c55e]/20 transition-all duration-300 hover:bg-[#4ade80] hover:shadow-[#22c55e]/30"
            >
              Get Started Free
            </m.button>
          </m.div>

          <m.footer
            variants={sectionVariants}
            {...animationProps}
            className="pb-8 text-center"
          >
            <p className="text-sm text-[#7c8798]">
              Habits Aura · Build habits. Grow your aura.
            </p>
          </m.footer>
        </main>
      </div>
    </LazyMotion>
  );
}
