/** @type {import('tailwindcss').Config} */


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
      colors: {
        black: {
          800: "#14141C",
          700:"#000"
        },
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
      backgroundImage: {
        "blue-gradient":
          "linear-gradient(123.22deg, #D4368E 15.32%, #9333C8 85.26%)",
        "text-gradient":
          "linear-gradient(303.22deg, #D4368E 15.32%, #9333C8 85.26%)",
        "dark-gradient": "linear-gradient(180deg, #171724 0%, #07070C 100%)",
      },
      fontFamily: {
        urbanist: ["Urbanist", "sans-serif"],
      },

    },
  },
  plugins: [],
};

export default config;
