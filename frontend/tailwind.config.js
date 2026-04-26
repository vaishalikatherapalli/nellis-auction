/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Open Sans", "system-ui", "sans-serif"],
      },
      colors: {
        primary: "#ED213A",
        burgundy: {
          900: "#7B0003",
          800: "#8A090E",
          600: "#A71B18",
          100: "#EBC1C4",
          50:  "#F7E6E8",
        },
        brand: {
          900: "#212427",
          800: "#424549",
          700: "#616568",
          600: "#75797C",
          500: "#9EA2A6",
          400: "#BDC1C5",
          300: "#DFE3E8",
          200: "#EDF1F5",
          100: "#F2F6FA",
        },
      },
      boxShadow: {
        header:   "0px 4px 8px 0px rgba(33,36,39,0.15)",
        itemCard: "0px 1px 3px 0px rgba(0,0,0,0.3)",
        paper:    "5px 5px 15px 0px rgba(0,0,0,0.2)",
      },
      borderRadius: {
        cta: "3px",
      },
      backgroundImage: {
        "cta-gradient": "linear-gradient(to right, #ED213A, #93291E)",
      },
    },
  },
  plugins: [],
}
