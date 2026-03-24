import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "bg-base": "#0b0f0c",
        "bg-surface-1": "#101512",
        "bg-surface-2": "#161c18",
        "bg-surface-3": "#1d2420",
        "border-subtle": "#232b26",
        "green-primary": "#22c55e",
        "green-hover": "#4ade80",
        "green-active": "#16a34a",
        "text-primary": "#ecfdf5",
        "text-secondary": "#9ca3af",
        "text-muted": "#6b7280",
        "streak-yellow": "#facc15",
        "energy-orange": "#fb923c",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        habits: {
          primary: "#22c55e",
          secondary: "#4ade80",
          accent: "#86efac",
          neutral: "#161c18",
          "base-100": "#0b0f0c",
          "base-200": "#101512",
          "base-300": "#161c18",
          info: "#38bdf8",
          success: "#22c55e",
          warning: "#facc15",
          error: "#ef4444",
        },
      },
    ],
    darkTheme: "habits",
    base: true,
    styled: true,
    utils: true,
    logs: false,
  },
};
export default config;
