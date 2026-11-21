import type { Config } from "tailwindcss";
const themes = require("daisyui/src/theming/themes");

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        // Landing palette: emerald = done, amber = aura/streak, red = skipped.
        ink: {
          950: "#0a0e14",
          900: "#0f141b",
          800: "#151b24",
          700: "#1c2430",
          600: "#27313f",
        },
        mist: { 100: "#e8ecf2", 300: "#aab4c3", 500: "#7b8798" },
        done: "#22c55e",
        gold: "#ffbf46",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        habits: {
          ...themes.dark,
          neutral: "#2a303c",
        },
      },
    ],
  },
};
export default config;
