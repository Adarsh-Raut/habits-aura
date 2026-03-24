"use client";

import { signIn } from "next-auth/react";
import { DiAtom } from "react-icons/di";
import { FaGoogle, FaFireAlt, FaBolt } from "react-icons/fa";
import { BsGrid3X3Gap } from "react-icons/bs";
import { motion } from "framer-motion";
import { useState } from "react";

const features = [
  {
    icon: FaFireAlt,
    title: "Build streaks that actually stick",
  },
  {
    icon: BsGrid3X3Gap,
    title: "Visualize your consistency",
  },
  {
    icon: FaBolt,
    title: "Earn aura points",
  },
];

export default function SignIn() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="relative z-10 w-full max-w-md px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="bg-[#1a1d26] border border-white/[0.08] rounded-2xl p-10 shadow-2xl shadow-black/20">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5, type: "spring" }}
            className="flex flex-col items-center mb-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="relative mb-6"
            >
              <div className="absolute inset-0 bg-[#05C26A]/20 blur-2xl rounded-full" />
              <DiAtom className="w-14 h-14 text-[#05C26A] relative z-10" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-white tracking-tight mb-2"
            >
              Habits Aura
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-base text-gray-400 text-center"
            >
              Build habits. Track consistency.{" "}
              <span className="text-[#05C26A]">Grow your aura.</span>
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3 mb-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + index * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] transition-colors cursor-default"
              >
                <div className="w-10 h-10 rounded-lg bg-[#05C26A]/15 flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5 text-[#05C26A]" />
                </div>
                <span className="text-sm text-gray-300">{feature.title}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            disabled={loading}
            onClick={() => {
              setLoading(true);
              signIn("google", {
                callbackUrl: "/",
                prompt: "select_account",
              });
            }}
            className="w-full py-4 bg-[#05C26A] hover:bg-[#04a85a] text-white font-semibold rounded-xl shadow-lg shadow-[#05C26A]/20 hover:shadow-[#05C26A]/30 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
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
            transition={{ delay: 0.75 }}
            className="text-xs text-center text-gray-500 mt-6"
          >
            No spam. No fuss. Just habits.
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
