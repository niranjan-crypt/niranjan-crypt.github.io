/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkBg: '#030509',
        darkCard: 'rgba(10, 12, 20, 0.60)',
        cyanGlow: '#00f0ff',
        electricCyan: '#38bdf8',
        neonPink: '#f43f5e',
        deepPurple: '#a855f7',
      },
      fontFamily: {
        sans: ['"Inter"', '"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 35px -5px rgba(56, 189, 248, 0.3)',
        'glow-pink': '0 0 35px -5px rgba(244, 63, 94, 0.35)',
        'card-dark': '0 20px 50px -10px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(255, 255, 255, 0.08)',
      },
    },
  },
  plugins: [],
};
