/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    './src/**/*.{html,ts}',
    './node_modules/@foliokit/**/*.{js,mjs}',
  ],
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
