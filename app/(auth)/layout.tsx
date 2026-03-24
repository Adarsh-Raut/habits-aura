"use client";

import { motion } from "framer-motion";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#1E2330] flex flex-col overflow-hidden relative">
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 0%, rgba(71, 85, 105, 0.28) 0%, transparent 52%),
            radial-gradient(ellipse at 80% 100%, rgba(22, 163, 74, 0.09) 0%, transparent 48%),
            radial-gradient(ellipse at 50% 50%, rgba(15, 23, 42, 0.22) 0%, transparent 60%)
          `,
        }}
        animate={{
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {children}
    </div>
  );
}
