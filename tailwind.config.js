/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./popup.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        background: '#0a0a0a',
        cyan: {
          DEFAULT: '#00f3ff',
          glow: 'rgba(0, 243, 255, 0.5)',
        },
        magenta: {
          DEFAULT: '#ff00aa',
          glow: 'rgba(255, 0, 170, 0.5)',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
