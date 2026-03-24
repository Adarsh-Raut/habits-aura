"use client";

import { motion } from "framer-motion";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0b0f0c] flex flex-col overflow-hidden relative">
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 30% 0%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 100%, rgba(74, 222, 128, 0.05) 0%, transparent 50%)
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
