/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./resources/**/*.blade.php",
      "./resources/**/*.{js,ts,jsx,tsx}",
      "./resources/**/*.vue",
    ],
    theme: {
      extend: {
        screens: {
          'tablet': '800px',
        }
      }
    },
    plugins: [],
  }
