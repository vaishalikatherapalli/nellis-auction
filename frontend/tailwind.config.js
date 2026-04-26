/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        primary: "#1e40af",
        teal: {
          700: "#0e7490",
          600: "#0891b2",
          500: "#06b6d4",
          200: "#a5f3fc",
          100: "#cffafe",
          50:  "#ecfeff",
        },
        orange: {
          700: "#c2410c",
          600: "#ea580c",
          500: "#f97316",
          100: "#ffedd5",
          50:  "#fff7ed",
        },
        brand: {
          900: "#0f172a",
          800: "#1e293b",
          700: "#334155",
          600: "#475569",
          500: "#64748b",
          400: "#94a3b8",
          300: "#cbd5e1",
          200: "#e2e8f0",
          100: "#f1f5f9",
          50:  "#f8fafc",
        },
      },
      boxShadow: {
        card:     "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        elevated: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        header:   "0 1px 3px 0 rgb(0 0 0 / 0.1)",
      },
      borderRadius: {
        card: "12px",
        btn:  "8px",
      },
      backgroundImage: {
        "cta-gradient":  "linear-gradient(to right, #f97316, #ea580c)",
        "hero-gradient": "linear-gradient(135deg, #1e3a8a 0%, #0891b2 100%)",
        "blue-gradient": "linear-gradient(to right, #1e40af, #1d4ed8)",
      },
    },
  },
  plugins: [],
}
