/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "100%",
        md: "100%",
        lg: "1024px",
        xl: "1280px",
      },
    },
    extend: {
      fontFamily: {
        primary: "'Montserrat', sans-serif",
        title: "'Concert One', sans-serif",
      },
      colors: {
        primary: "#003E56",
        primaryLight: "#E6F4F1",
        secondary: "#9D4400",
        bodyTextColor: "#002838",
        success: "#5cb85c",
        warning: "#f0ad4e",
        danger: "#d9534f",
        bgYellow: "#e1f58a",
        bgPurple: "#ceb7f3",
        bgBlue: "#b2ddf1",
        bgRed: "#ffeee6",
      },
    },
  },
  plugins: [],
};
