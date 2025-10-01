import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.mdx"
  ],
  darkMode: "class",
  theme: { extend: {} },
  plugins: [],
} satisfies Config;
