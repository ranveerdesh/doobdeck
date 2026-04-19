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
        background: "#0a0a0a",
        surface: {
          DEFAULT: "#111111",
          raised: "#1a1a1a",
          overlay: "#222222",
        },
        border: {
          DEFAULT: "#2a2a2a",
          subtle: "#1e1e1e",
          strong: "#3a3a3a",
        },
        text: {
          primary: "#f0f0f0",
          secondary: "#bbbbbb",
          muted: "#888888",
          disabled: "#555555",
        },
        accent: {
          DEFAULT: "#e8c87a",
          dim: "#c4a558",
          subtle: "#2a2310",
          foreground: "#0a0a0a",
        },
        danger: {
          DEFAULT: "#e05252",
          dim: "#b03f3f",
          subtle: "#2a1010",
        },
        success: {
          DEFAULT: "#4caf82",
          subtle: "#0d2318",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      borderRadius: {
        sm: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.6)",
        "card-hover":
          "0 4px 12px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.6)",
        modal: "0 20px 60px rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.6)",
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
