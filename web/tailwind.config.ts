import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Voice Roots New Visual Identity
        midnight: "#11152E",
        "midnight-indigo": "#11152E",
        "heritage-amber": "#D9A441",
        "warm-amber": "#D9A441",
        "soft-violet": "#8B7CFF",
        "ai-violet": "#8B7CFF",
        "heritage-teal": "#35B7A5",
        "trans-teal": "#35B7A5",
        "warm-ivory": "#F7F3EA",

        // Backward compatibility mappings for existing dark surfaces
        obsidian: "#11152E", // Shift default base to Midnight Indigo
        surface: "#181D3B",
        "primary-text": "#F7F3EA", // Shift primary text to Warm Ivory
        "secondary-text": "#9DA7C9",
        "root-green": "#35B7A5", // Shift root green to Heritage Teal
        "leaf-green": "#5EEAD4",
        earth: "#D9A441", // Heritage Amber
      },
      boxShadow: {
        glow: "0 8px 28px -10px rgba(53, 183, 165, .55)",
        "amber-glow": "0 8px 28px -10px rgba(217, 164, 65, .55)",
        "violet-glow": "0 8px 28px -10px rgba(139, 124, 255, .55)",
      },
    },
  },
  plugins: [],
};

export default config;
