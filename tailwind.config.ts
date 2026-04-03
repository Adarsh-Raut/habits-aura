import type { Config } from "tailwindcss";
const themes = require("daisyui/src/theming/themes");

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
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
