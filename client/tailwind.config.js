/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/renderer/index.html",
    "./app/renderer/src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // GitHub dark theme colors
        bg: {
          primary: '#0d1117',
          secondary: '#161b22',
          elevated: '#21262d',
        },
        text: {
          primary: '#c9d1d9',
          secondary: '#8b949e',
          muted: '#6e7681',
        },
        accent: {
          blue: '#58a6ff',
          purple: '#bc8cff',
          red: '#f85149',
          green: '#3fb950',
          yellow: '#d29922',
        },
        border: {
          default: '#30363d',
          hover: '#484f58',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        spotlight: "spotlight 2s ease .75s 1 forwards",
        shimmer: "shimmer 2s linear infinite",
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        spotlight: {
          "0%": {
            opacity: 0,
            transform: "translate(-72%, -62%) scale(0.5)",
          },
          "100%": {
            opacity: 1,
            transform: "translate(-50%,-40%) scale(1)",
          },
        },
        shimmer: {
          from: {
            backgroundPosition: "0 0",
          },
          to: {
            backgroundPosition: "-200% 0",
          },
        },
      },
    },
  },
  plugins: [],
};
