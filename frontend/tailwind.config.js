/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // dark mode is the default look — toggled via the "dark" class on <html>
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Vibrant accent palette — Uber/Stripe-style bold color on a dark canvas.
        // Swap/extend these as the brand identity solidifies.
        accent: {
          DEFAULT: '#00E5A0', // signature vibrant green
          purple: '#7C3AED',
          orange: '#FF5A1F',
        },
      },
    },
  },
  plugins: [],
};
