/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        shield: {
          safe: '#0D9488',
          warning: '#F59E0B',
          blocked: '#EF4444',
          bg: '#F8FAFC',
        },
      },
    },
  },
  plugins: [],
};
