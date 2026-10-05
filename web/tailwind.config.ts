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
        obsidian: "#0B0D0C",
        "soft-black": "#111413",
        surface: "#171B19",
        "surface-raised": "#222724",
        "primary-text": "#F5F6F3",
        "secondary-text": "#A9B0AB",
        "root-green": "#6FAF8F",
        "leaf-green": "#A7D7B5",
        earth: "#B89A72",
        "ai-violet": "#8F86D9",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "SF Pro Text", "Segoe UI", "sans-serif"],
        display: ["system-ui", "-apple-system", "BlinkMacSystemFont", "SF Pro Display", "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
        glass: "20px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        glow: "0 0 24px -4px rgba(111, 175, 143, 0.4)",
        "glow-violet": "0 0 24px -4px rgba(143, 134, 217, 0.4)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "wave-live": "wave 1.2s ease-in-out infinite alternate",
      },
      keyframes: {
        wave: {
          "0%": { height: "20%" },
          "100%": { height: "100%" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
