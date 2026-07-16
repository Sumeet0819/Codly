import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        palette: {
          dark: "var(--color-dark)",
          surface: "var(--color-surface)",
          surfaceHover: "var(--color-surfaceHover)",
          border: "var(--color-border)",
          teal: "var(--color-teal)",
          mint: "var(--color-mint)",
          light: "var(--color-light)",
          muted: "var(--color-muted)",
          terminal: "var(--color-terminal)",
          terminalSurface: "var(--color-terminalSurface)",
          terminalLight: "var(--color-terminalLight)",
          terminalBorder: "var(--color-terminalBorder)"
        },
        ink: {
          950: "#111111",
          900: "#1a1a1a",
          850: "#1f1f1f",
          800: "#242424",
          700: "#333333",
          600: "#444444",
          500: "#999999",
          300: "#cccccc",
          200: "#e0e0e0",
          100: "#F9F9F9",
        },
        accent: {
          blue: "#D97757", // remapped to Claude orange
          green: "#788C5D", // Claude green
          amber: "#D97757", // Use orange for amber
          red: "#C15041", // Claude red
          teal: "#D97757",
          mint: "#EAE8DF"
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["Lora", "ui-serif", "Georgia", "serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Consolas", "monospace"]
      },
      boxShadow: {
        focus: "0 0 0 1px rgba(217, 119, 87, 0.85), 0 0 0 5px rgba(217, 119, 87, 0.14)",
        glow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        "glow-sm": "0 2px 8px rgba(0, 0, 0, 0.04)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
