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
        // Voice Roots Reference Palette (Dark Indigo + Soft Peach)
        "vr-bg": "#2D3250",
        "vr-dark": "#242942",
        "vr-indigo": "#42476C",
        "vr-periwinkle": "#6F76A0",
        "vr-surface": "#F5F5F2",
        "vr-accent": "#F9B17A",
        "vr-accent-soft": "#F6A875",
        "vr-text": "#FFFFFF",
        "vr-text-secondary": "#D9D9E2",
        "vr-text-muted": "#A9AEC5",

        // 60% Dominant (Main Backgrounds & Structural Space)
        ivory: "#F7F7F2",
        "warm-ivory": "#F7F7F2",
        obsidian: "#F7F7F2", // alias for compatibility
        "deep-obsidian": "#F7F7F2",

        // 30% Secondary (Surfaces, Cards, Sidebars, Containers)
        surface: "#FFFFFF",
        "primary-surface": "#FFFFFF",
        "secondary-surface": "#F0F0EA",
        "stone-surface": "#F0F0EA",
        "terracotta-slate": "#FFFFFF",
        "royal-indigo": "#FFFFFF",

        // Text Hierarchy (High-contrast typography)
        charcoal: "#171717",
        "primary-text": "#171717",
        "secondary-text": "#686861",
        "soft-lavender": "#686861",
        "muted-stone": "#686861",

        // 10% Accent Colors (Buttons, Active States, Key Actions)
        // Heritage Accent (Bronze / Earth)
        "heritage-accent": "#8B6F47",
        "heritage-bronze": "#8B6F47",
        "deep-heritage": "#3F3428",
        "heritage-gold": "#8B6F47", // alias
        gold: "#8B6F47",
        terracotta: "#8B6F47",
        ochre: "#8B6F47",

        // Soft Sage (Success, Preserved, Verification)
        "soft-sage": "#879B87",
        sage: "#879B87",
        "heritage-teal": "#879B87", // alias
        "root-green": "#879B87",
        teal: "#879B87",

        // Subtle Violet (AI Features — Calm, not neon)
        "subtle-violet": "#7C6DAF",
        "ai-violet": "#7C6DAF",
        "electric-violet": "#7C6DAF", // alias

        // Legacy compatibility aliases
        midnight: "#F7F7F2",
        linen: "#F7F7F2",
        sand: "#686861",
      },
      boxShadow: {
        soft: "0 2px 12px -2px rgba(30, 30, 30, 0.05)",
        card: "0 4px 20px -2px rgba(30, 30, 30, 0.06)",
        dropdown: "0 10px 30px -4px rgba(30, 30, 30, 0.10)",
        "gold-glow": "0 4px 16px -2px rgba(139, 111, 71, 0.25)",
        "teal-glow": "0 4px 16px -2px rgba(135, 155, 135, 0.25)",
        glow: "0 4px 16px -2px rgba(139, 111, 71, 0.20)",
      },
      borderRadius: {
        "2xl": "20px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};

export default config;
