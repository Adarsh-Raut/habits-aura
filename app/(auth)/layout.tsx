"use client";

import { motion } from "framer-motion";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#1E2330] flex items-center justify-center overflow-hidden relative">
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(5, 194, 106, 0.08) 0%, transparent 60%)",
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
