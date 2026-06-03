import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-body)", ...defaultTheme.fontFamily.sans],
        display: ["var(--font-display)", "var(--font-body)", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        brand: {
          ink: "#0d0b10",
          midnight: "#0b1220",
          plum: "#1a0f1f",
          card: "#11111a",
          accent: "#f43f5e",
          accentSoft: "#fb7185",
          neon: "#34f5c5",
          neutral: "#f5f5f7",
        },
      },
      boxShadow: {
        glow: "0 10px 40px rgba(244,63,94,0.35)",
        neon: "0 0 25px rgba(52,245,197,0.35)",
        innerGlass: "inset 0 1px 0 rgba(255,255,255,0.12)",
      },
      borderRadius: {
        glass: "1.75rem",
      },
      backgroundImage: {
        "hero-grid": "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)",
        "neon-gradient": "linear-gradient(120deg, #ef4444, #f97316, #f43f5e)",
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "30%": { transform: "translate3d(0,-10px,0) scale(1.01)" },
          "70%": { transform: "translate3d(0,6px,0) scale(0.99)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.35", boxShadow: "0 0 0 0 rgba(244,63,94,0.35)" },
          "50%": { opacity: "0.8", boxShadow: "0 0 0 8px rgba(244,63,94,0)" },
        },
      },
      animation: {
        floaty: "floaty 12s ease-in-out infinite",
        pulseSoft: "pulseSoft 2.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
