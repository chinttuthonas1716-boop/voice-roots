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
        // Voice Roots Forest Green + Natural Earth Master Identity 🌲
        "deep-forest": "#102B20",
        "forest-green": "#1F5138",
        "leaf-green": "#477A50",
        "sage-green": "#A6C48A",
        "mist-green": "#E8EFE1",
        "warm-ivory": "#F5F3E9",
        "earth-text": "#203329",

        // Backward compatibility mappings mapped to Forest Green palette
        midnight: "#102B20", // Shift default base to Deep Forest
        "midnight-indigo": "#102B20",
        "heritage-amber": "#1F5138", // Primary button / accent Forest Green
        "warm-amber": "#1F5138",
        "soft-violet": "#477A50", // Leaf Green
        "ai-violet": "#477A50",
        "heritage-teal": "#A6C48A", // Sage Green
        "trans-teal": "#A6C48A",
        obsidian: "#102B20",
        surface: "#163B2C",
        "primary-text": "#F5F3E9", // Warm Ivory
        "secondary-text": "#A6C48A", // Sage Green
        "root-green": "#1F5138", // Forest Green
        "forest-surface": "#163B2C",
        earth: "#A6C48A", // Sage Green
      },
      boxShadow: {
        glow: "0 8px 28px -10px rgba(166, 196, 138, .55)",
        "amber-glow": "0 8px 28px -10px rgba(31, 81, 56, .55)",
        "forest-glow": "0 8px 28px -10px rgba(31, 81, 56, .45)",
      },
    },
  },
  plugins: [],
};

export default config;
