/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hopecare': {
          blue: '#2B8ACB',    // Primary blue from logo
          orange: '#F7941D',  // Primary orange from logo
          'blue-dark': '#1E6CA3',
          'orange-dark': '#D97B06',
          'blue-light': '#4BA3E3',
          'orange-light': '#FFA94D'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}