/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#9D4400",
        primaryLight: "#E6F4F1",
        primaryDark: "#003E56",
        secondary: "#63E2FF",
        success: "#5cb85c",
        warning: "#f0ad4e",
        danger: "#d9534f",
      },
    },
  },
  plugins: [],
};
