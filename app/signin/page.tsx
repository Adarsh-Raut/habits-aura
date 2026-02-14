"use client";

import { signIn } from "next-auth/react";
import { FaGoogle } from "react-icons/fa";
import { motion } from "framer-motion";

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-200 via-base-300 to-base-200 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="card bg-base-100 shadow-2xl border border-base-300">
          <div className="card-body space-y-6">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="text-4xl">⚛️</div>
              <h1 className="text-2xl font-bold tracking-tight">Habits Aura</h1>
              <p className="text-sm text-base-content/60 text-center">
                Build habits. Track consistency. Grow your aura.
              </p>
            </motion.div>

            <ul className="space-y-2 text-sm text-base-content/80">
              <li>🔥 Build streaks that actually stick</li>
              <li>📅 Visualize progress like GitHub</li>
              <li>⚡ Earn aura points for consistency</li>
            </ul>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="btn btn-primary btn-block gap-2 text-base"
            >
              <FaGoogle size={18} />
              Continue with Google
            </motion.button>

            <p className="text-xs text-center text-base-content/50">
              No spam. No fuss. Just habits.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
