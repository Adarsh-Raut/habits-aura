import type { Config } from "tailwindcss";
const themes = require("daisyui/src/theming/themes");

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-figtree)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "var(--font-geist-mono)",
          "ui-monospace",
          "monospace",
        ],
      },
      colors: {
        // Brand palette: paper + ink, with one signal colour.
        paper: "#f5f5f2",
        ink: { DEFAULT: "#0b0b0c", soft: "#1a1a1c", line: "#2a2a2d" },
        signal: {
          DEFAULT: "#ff4d1a", // fills, big numerals, buttons
          hover: "#ff6a3a",
          text: "#b5290a", // small text on light backgrounds (AA)
        },
        ember: "#ffb199",
        ash: "#d9d9d4",
        graphite: "#4a4a4f", // body text on paper
        fog: "#9a9aa0", // muted text on ink
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        habits: {
          ...themes.light,
          primary: "#ff4d1a",
          "primary-content": "#0b0b0c",
          secondary: "#0b0b0c",
          "secondary-content": "#f5f5f2",
          accent: "#ffb199",
          "accent-content": "#0b0b0c",
          neutral: "#0b0b0c",
          "neutral-content": "#f5f5f2",
          "base-100": "#f5f5f2",
          "base-200": "#ededE9",
          "base-300": "#d9d9d4",
          "base-content": "#0b0b0c",
          info: "#0b0b0c",
          success: "#16a34a",
          "success-content": "#ffffff",
          warning: "#f59e0b",
          error: "#d92d20",
          "error-content": "#ffffff",
          "--rounded-box": "1rem",
          "--rounded-btn": "0.75rem",
          "--rounded-badge": "999px",
          "--btn-focus-scale": "0.98",
        },
      },
    ],
  },
};
export default config;
