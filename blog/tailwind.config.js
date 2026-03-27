/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        navy: '#0C2340',
        green: '#00843D',
        gold: '#C99700',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
