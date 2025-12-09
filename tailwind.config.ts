// tailwind.config.ts


const config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./index.html",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.2s ease-out",
        scaleIn: "scaleIn 0.2s ease-out",
      },
      screens: {
        "xxs": "380px",
        "xs": "576px",
        sm: "768px",
        md: "992px",
        lg: "1350px",
        "lg-xl": "1290px",
        xl: "1440px",
      },
      container: {
        center: true,
        padding: "1rem",
        screens: {
          "xxs": "380px",
          "xs": "576px",
          sm: "768px",
          md: "992px",
          lg: "1350px",
          xl: "1440px",
        }
      },
      borderImage: {
        "border-blue-gradient": "linear-gradient(180deg, #092CA2 0%, #003BFF 100%)"
      },
      backgroundImage: {
        "blue-gradient": "linear-gradient(180deg, #092CA2 0%, #003BFF 100%)"
      },
      colors: {
        blue: {
          default: "#1556D4",
        },
        dark: {
          default: "#1D2530",
          "default-dark": "#2C2D34",
          "dark-bg": "#1A1B20",
          "dark-text": "#1A1B20",
        },
        gray: {
          default: "#1D253080"
        },
        orange: {
        },
        pink: {

        },
        red: {
          default: "#FF0000"
        },
        green: {
        }
      },
      fontFamily: {
        manrope: ["Manrope", "sans-serif"],
        archivo: "var(--font-archivo)",
        inter: "var(--font-inter)",
        poppins: "var(--font-poppins)",
      },
      boxShadow: {
        md: "0px 1px 2px 0px #1018280D",
        lg: "0px 4px 25px 0px #0000000D"
      }
    },
  },
  darkMode: "class",
  plugins: [],
};

export default config;
