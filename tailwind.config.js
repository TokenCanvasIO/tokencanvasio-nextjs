// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // This content array tells Tailwind to scan every file in your src folder.
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};