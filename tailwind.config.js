/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0D1B2A',
        'navy-dark': '#050F1F',
        'navy-light': '#1A2A3A',
        gold: '#FFD700',
        'gold-dark': '#FFC107',
        'text-light': '#F8F9FA'
      }
    }
  },
  plugins: []
};
