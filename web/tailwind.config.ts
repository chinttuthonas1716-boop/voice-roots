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
        // Netflix Cinematic Palette
        "netflix-black": "#141414",
        "netflix-dark": "#0B0B0B",
        "netflix-surface": "#181818",
        "netflix-card": "#1F1F1F",
        "netflix-card-hover": "#262626",
        
        // Netflix Iconic Red & Accents
        "netflix-red": "#E50914",
        "netflix-red-hover": "#F40612",
        "netflix-red-dark": "#B81D24",
        "netflix-red-glow": "rgba(229, 9, 20, 0.4)",
        
        // Secondary Accents & Contrast
        "netflix-white": "#FFFFFF",
        "netflix-light": "#E5E5E5",
        "netflix-gray": "#AAAAAA",
        "netflix-muted": "#6D6D6E",
        "netflix-dark-gray": "#333333",

        // Cultural Heritage Warmth
        "cultural-gold": "#E5A93C",
        "cultural-amber": "#F59E0B",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Netflix Sans",
          "SF Pro Display",
          "Helvetica Neue",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: ["SF Mono", "ui-monospace", "Menlo", "monospace"],
      },
      boxShadow: {
        "netflix-glow": "0 0 30px -5px rgba(229, 9, 20, 0.55)",
        "netflix-card-hover": "0 20px 45px -10px rgba(0, 0, 0, 0.95), 0 0 25px -4px rgba(229, 9, 20, 0.35)",
        "ios27-glass": "0 20px 50px -10px rgba(0, 0, 0, 0.8), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)",
      },
      animation: {
        "equalizer-1": "equalizer 1.1s ease-in-out infinite alternate",
        "equalizer-2": "equalizer 0.8s ease-in-out infinite alternate 0.2s",
        "equalizer-3": "equalizer 1.4s ease-in-out infinite alternate 0.4s",
        "equalizer-4": "equalizer 0.9s ease-in-out infinite alternate 0.1s",
      },
      keyframes: {
        equalizer: {
          "0%": { height: "15%" },
          "50%": { height: "100%" },
          "100%": { height: "35%" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
