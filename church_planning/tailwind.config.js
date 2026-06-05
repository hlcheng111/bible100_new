/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "Noto Sans TC", "system-ui", "sans-serif"],
        serif: ["Noto Serif TC", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
