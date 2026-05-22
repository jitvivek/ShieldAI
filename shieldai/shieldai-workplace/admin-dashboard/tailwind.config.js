/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        shield: { DEFAULT: '#0D9488', light: '#14B8A6', dark: '#0F766E' },
      },
    },
  },
  plugins: [],
};
