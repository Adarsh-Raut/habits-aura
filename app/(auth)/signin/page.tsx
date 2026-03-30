"use client";

import { signIn } from "next-auth/react";
import { DiAtom } from "react-icons/di";
import { FaGoogle, FaFireAlt, FaBolt } from "react-icons/fa";
import { BsGrid3X3Gap } from "react-icons/bs";
import { IoRocketOutline } from "react-icons/io5";
import { motion } from "framer-motion";
import { useState } from "react";

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

function HabitPreview({
  status,
  title,
  streak,
  delay,
}: {
  status: "completed" | "none" | "skipped";
  title: string;
  streak: number;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-[#161c18] border border-[#3f4758] rounded-xl p-4 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg font-bold ${
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
        <span className="text-[#e5e7eb] font-medium">{title}</span>
      </div>
      {streak > 0 ? (
        <span className="flex items-center gap-1 text-sm text-[#fb923c] bg-[#fb923c]/15 px-2 py-1 rounded-full">
          <FaFireAlt className="w-3 h-3" />
          {streak}
        </span>
      ) : (
        <IoRocketOutline className="w-5 h-5 text-[#6b7280]" />
      )}
    </motion.div>
  );
}

export default function SignIn() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex-1 flex flex-col relative z-10">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between w-full max-w-6xl mx-auto px-6 py-6"
      >
        <div className="flex items-center gap-2">
          <DiAtom className="w-8 h-8 text-[#d1d5db]" />
          <span className="text-xl font-bold text-[#f3f4f6]">Habits Aura</span>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            signIn("google", {
              callbackUrl: "/",
              prompt: "select_account",
            });
          }}
          className="px-5 py-2.5 bg-[#22c55e] hover:bg-[#4ade80] text-[#052e16] font-medium rounded-lg shadow-lg shadow-[#22c55e]/20 hover:shadow-[#22c55e]/30 transition-all duration-300"
          aria-label="Sign in with Google"
        >
          Sign in
        </button>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl text-center mb-12"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#f3f4f6] leading-tight mb-6"
          >
            Build habits. Track consistency.{" "}
            <span className="text-[#22c55e]">Grow your aura.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg md:text-xl text-[#9aa4b2] mb-10"
          >
            Stay consistent, earn aura points, and compete on the leaderboard.
          </motion.p>

          {/* Habit Cards Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-full max-w-md mx-auto mb-10"
          >
            <div className="space-y-3">
              <HabitPreview
                status="completed"
                title="Exercise"
                streak={7}
                delay={0.4}
              />
              <HabitPreview
                status="completed"
                title="Read"
                streak={12}
                delay={0.5}
              />
              <HabitPreview
                status="none"
                title="Meditate"
                streak={0}
                delay={0.6}
              />
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              onClick={() => {
                setLoading(true);
                signIn("google", {
                  callbackUrl: "/",
                  prompt: "select_account",
                });
              }}
              className="w-full max-w-md mx-auto py-4 px-6 bg-[#22c55e] hover:bg-[#4ade80] text-[#052e16] font-semibold rounded-xl shadow-lg shadow-[#22c55e]/20 hover:shadow-[#22c55e]/30 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-5 h-5 border-2 border-[#052e16]/30 border-t-[#052e16] rounded-full"
                />
              ) : (
                <>
                  <FaGoogle className="w-5 h-5" />
                  <span>Continue with Google</span>
                </>
              )}
            </motion.button>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center text-[#7c8798] text-sm mt-4"
            >
              Free · No credit card · Takes 10 seconds
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="w-full max-w-4xl mx-auto mt-8 mb-16"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold text-[#f3f4f6] text-center mb-10"
          >
            Everything you need
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + index * 0.1, duration: 0.5 }}
                whileHover={{ y: -4 }}
                className="bg-[#161c18] border border-[#3f4758] rounded-2xl p-6 hover:border-[#6b7280] transition-all duration-300"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 1.3 + index * 0.1,
                    type: "spring",
                    stiffness: 200,
                  }}
                  className="w-12 h-12 rounded-xl bg-[#fb923c]/15 flex items-center justify-center mb-4"
                >
                  <feature.icon className="w-6 h-6 text-[#fb923c]" />
                </motion.div>
                <h3 className="text-lg font-semibold text-[#f3f4f6] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#9aa4b2]">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="text-center mb-16"
        >
          <h3 className="text-2xl font-bold text-[#f3f4f6] mb-3">
            Ready to start?
          </h3>
          <p className="text-[#9aa4b2] mb-6">Takes 10 seconds to sign in.</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setLoading(true);
              signIn("google", {
                callbackUrl: "/",
                prompt: "select_account",
              });
            }}
            className="py-4 px-8 bg-[#22c55e] hover:bg-[#4ade80] text-[#052e16] font-semibold rounded-xl shadow-lg shadow-[#22c55e]/20 hover:shadow-[#22c55e]/30 transition-all duration-300"
          >
            Get Started Free
          </motion.button>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.5 }}
          className="text-center pb-8"
        >
          <p className="text-[#7c8798] text-sm">
            Habits Aura · Build habits. Grow your aura.
          </p>
        </motion.footer>
      </main>
    </div>
  );
}
