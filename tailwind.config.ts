import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        umang: {
          purple: '#b579d2',
          cyan: '#33ccbf',
          green: '#7dd24a',
        },
      },
      fontFamily: {
        sans: ['"Source Sans 3"', 'sans-serif'],
        heading: ['Quicksand', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
