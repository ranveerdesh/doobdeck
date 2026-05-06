import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#131313",
        surface: {
          DEFAULT: "#131313",
          raised: "#1c1b1b",
          overlay: "#242323",
        },
        border: {
          DEFAULT: "#353534",
          subtle: "#242323",
          strong: "#554336",
        },
        text: {
          primary: "#e5e2e1",
          secondary: "#dbc2b0",
          muted: "#a38c7c",
          disabled: "#6f6259",
        },
        accent: {
          DEFAULT: "#ffb77d",
          dim: "#d97707",
          subtle: "#2f1a08",
          foreground: "#4d2600",
        },
        danger: {
          DEFAULT: "#ffb4ab",
          dim: "#ff8f84",
          subtle: "#3b1616",
        },
        success: {
          DEFAULT: "#b2f2cf",
          subtle: "#10231a",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: [
          "var(--font-plex-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
      borderRadius: {
        sm: "0.125rem",
        md: "0.25rem",
        lg: "0.375rem",
        xl: "0.5rem",
      },
      boxShadow: {
        card: "0 1px 0 rgba(255,255,255,0.04), 0 12px 40px rgba(0,0,0,0.22)",
        "card-hover":
          "0 1px 0 rgba(255,255,255,0.06), 0 18px 60px rgba(0,0,0,0.3)",
        modal: "0 24px 80px rgba(0,0,0,0.55)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "spin-slow": "spin 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
