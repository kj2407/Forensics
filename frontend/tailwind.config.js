/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    darkMode: "class",
    theme: {
      extend: {
        colors: {
          primary:  { DEFAULT: "#00d4ff", 50: "#e0faff", 100: "#b3f4ff", 200: "#66e9ff", 300: "#1adfff", 400: "#00d4ff", 500: "#00b8e0", 600: "#008fad", 700: "#006680", 800: "#003d52", 900: "#001a24" },
          surface:  { DEFAULT: "#0d1117", 50: "#1c2333", 100: "#161b27", 200: "#0d1117", 300: "#090d13", 400: "#060a0f" },
          accent:   { DEFAULT: "#7c3aed", light: "#a855f7" },
          success:  "#10b981",
          warning:  "#f59e0b",
          danger:   "#ef4444",
          muted:    "#6b7280",
        },
        fontFamily: { sans: ["'Inter'", "system-ui", "sans-serif"], mono: ["'JetBrains Mono'", "monospace"] },
        boxShadow: {
          glow:    "0 0 20px rgba(0,212,255,0.15)",
          "glow-lg": "0 0 40px rgba(0,212,255,0.2)",
          card:    "0 4px 24px rgba(0,0,0,0.4)",
        },
        backdropBlur: { xs: "2px" },
        animation: { "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite", shimmer: "shimmer 2s infinite" },
        keyframes: { shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } } },
      },
    },
    plugins: [],
  };