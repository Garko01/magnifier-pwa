// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontSize: {
        base: "20px", // larger default text
        xl: "24px",   // big headings for seniors
      },
    },
  },
  plugins: [],
};
