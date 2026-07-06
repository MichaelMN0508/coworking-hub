import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        "primary-dark": "#1d4ed8",
        accent: "#f59e0b",
        surface: "#ffffff",
        canvas: "#f4f6fb",
        ink: "#0f172a",
        muted: "#64748b",
      },
    },
  },
  plugins: [],
} satisfies Config;
