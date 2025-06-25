/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'beatmm-card': '#1F2937',
        'gradient-primary-from': '#7F1DFF',
        'gradient-primary-to': '#3B82F6',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to right, #7F1DFF, #3B82F6)',
      }
    },
  },
  plugins: [],
};
