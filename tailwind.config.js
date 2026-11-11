module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      screens: {
        // Simple string value only! Object syntax ({ max: ... }) disables ALL
        // arbitrary min-[...] / max-[...] variants project-wide.
        // Usage: "996:flex"  => @media (min-width: 996px)
        //        "max-996:hidden" => @media (max-width: 995.98px)
        996: "996px",
        // Custom — Tailwind has no built-in `xxl` (use `2xl` or this)
        xxl: "1440px",
      },
      css: {
        h1: {
          color: "#1F0060 !important",
        },
        h2: {
          color: "#1F0060 !important",
        },
        h4: {
          fontSize: "18px !important",
          color: "#1F0060",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        inter: ["var(--font-inter)", "Inter", "sans-serif"],
        // Legacy aliases kept so existing font-quicksand / font-gloock classes render Inter
        quicksand: ["var(--font-inter)", "Inter", "sans-serif"],
        gloock: ["var(--font-inter)", "Inter", "sans-serif"],
        poppins: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      colors: {
        primary: "#5CACC4",
        primaryHover: "#4ea0b8",
        secondary: "#1F0060",
        tertiary: "#5CACC4",
        secondaryHover: "#16004a",
        white: "#FFFFFF",
        dark: "#000000",
        grayText: "#4C4C4C",
        dealBorder: "rgba(255, 255, 255, 0.9)",
      },
      fontSize: {
        52: "52px",
        32: "32px",
        28: "28px",
        26: "26px",
        20: "20px",
        18: "18px",
        base: "16px",
        sm: "14px",
      },
      borderRadius: {
        5: "5px",
        10: "10px",
        12: "12px",
        40: "40px",
      },
      height: {
        626: "626px",
        120: "120px",
      },
      width: {
        174: "174px",
      },
      borderWidth: {
        9: "9px",
      },
      animation: {
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-15px)" },
        },
      },
      backgroundImage: {
        "home-image": "url('/images/HomeImage1.png')",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
