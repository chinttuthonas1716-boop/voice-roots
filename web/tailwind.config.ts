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
        // Deep Space & Spatial Obsidian
        obsidian: "#060807",
        "obsidian-deep": "#040504",
        "surface-dark": "#0D110F",
        "surface-glass": "rgba(18, 24, 21, 0.7)",
        "surface-card": "rgba(255, 255, 255, 0.04)",
        
        // Ethereal Luminescent Emerald & Jade (Voice Roots Signature)
        "root-emerald": "#10B981",
        "root-glow": "#34D399",
        "leaf-mint": "#6EE7B7",
        "jade-deep": "#047857",
        
        // Astral AI Violet & Prismatic Cyan
        "ai-spectral": "#818CF8",
        "ai-violet": "#A78BFA",
        "ai-cyan": "#22D3EE",
        "ai-glow": "rgba(167, 139, 250, 0.35)",

        // Earthen Amber & Champagne Heritage Gold
        earth: "#D97706",
        "earth-gold": "#F59E0B",
        "champagne-light": "#FDE68A",
        "sand-stone": "#A89F91",

        // Typography
        "text-primary": "#F8FAFC",
        "text-secondary": "#94A3B8",
        "text-muted": "#64748B",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "system-ui",
          "sans-serif",
        ],
        mono: ["SF Mono", "ui-monospace", "Menlo", "monospace"],
      },
      boxShadow: {
        "ios27-glass": "0 20px 50px -10px rgba(0, 0, 0, 0.7), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)",
        "ios27-pill": "0 10px 30px -5px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.25)",
        "netflix-hover": "0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 25px -5px rgba(16, 185, 129, 0.25)",
        "emerald-glow": "0 0 35px -5px rgba(16, 185, 129, 0.45)",
        "violet-glow": "0 0 35px -5px rgba(167, 139, 250, 0.45)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "equalizer-1": "equalizer 1.1s ease-in-out infinite alternate",
        "equalizer-2": "equalizer 0.8s ease-in-out infinite alternate 0.2s",
        "equalizer-3": "equalizer 1.4s ease-in-out infinite alternate 0.4s",
        "equalizer-4": "equalizer 0.9s ease-in-out infinite alternate 0.1s",
        "shimmer": "shimmer 2.5s linear infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        equalizer: {
          "0%": { height: "15%" },
          "50%": { height: "100%" },
          "100%": { height: "35%" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
