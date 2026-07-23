import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        "surface-warm": "var(--color-surface-warm)",
        fg: "var(--color-fg)",
        "fg-2": "var(--color-fg-2)",
        muted: "var(--color-muted)",
        border: "var(--color-border)",
        "border-soft": "var(--color-border-soft)",
        accent: {
          DEFAULT: "var(--color-accent)",
          on: "var(--color-accent-on)",
          hover: "var(--color-accent-hover)",
          active: "var(--color-accent-active)",
        },
        success: "var(--color-success)",
        warn: "var(--color-warn)",
        danger: "var(--color-danger)",
      },
      fontFamily: {
        display: ['"Press Start 2P"', '"Arial Black"', "system-ui", "sans-serif"],
        body: ['"Press Start 2P"', '"Arial Black"', "system-ui", "sans-serif"],
        mono: ['"Press Start 2P"', "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        ring: "var(--elev-ring)",
        raised: "var(--elev-raised)",
        focus: "var(--focus-ring)",
      },
      transitionTimingFunction: {
        standard: "steps(2, end)",
      },
      transitionDuration: {
        fast: "var(--motion-fast)",
        base: "var(--motion-base)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
