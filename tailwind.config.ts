import type { Config } from "tailwindcss";

/**
 * Colour tokens match spec §27.1. Accent is a single Ink-inspired violet.
 * Contrast of muted (#8F8F9B) on background (#0B0B0E) exceeds 4.5:1.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          bg: "#0B0B0E",
          surface: "#121217",
          raised: "#17171D",
          text: "#F6F6F8",
          muted: "#8F8F9B",
          border: "#27272F",
          accent: "#7C6CFF",
          success: "#3DDC97",
          warning: "#E8B84A",
          danger: "#F07178",
        },
      },
      fontFamily: {
        // All-mono: a stray font-sans must not introduce a second typeface.
        sans: ["var(--font-mono)", "ui-monospace", "Menlo", "monospace"],
        mono: ["var(--font-mono)", "ui-monospace", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
