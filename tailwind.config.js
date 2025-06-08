/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
      },
      colors: {
        pastel: {
          pink: '#FFB5C2',
          blue: '#A7C7E7',
          green: '#C1E1C1',
          yellow: '#FFE5B4',
          purple: '#E0BBE4',
          orange: '#FFDAB9',
          mint: '#C4E4D4',
          peach: '#FFDAB9',
        }
      }
    },
  },
  plugins: [],
} 