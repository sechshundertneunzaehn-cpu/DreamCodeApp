/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./types.ts",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./config/**/*.{js,ts,jsx,tsx}",
    "./data/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // === DARK MODE ===
        dream: {
          'bg': '#05020a',
          'surface': '#0f0b1a',
          'card': '#0f0518',
          'elevated': '#150b25',
          'deep': '#1a0b2e',
        },
        // === LIGHT MODE ===
        mystic: {
          'bg': '#f0eefc',
          'surface': '#ffffff',
          'card': '#fdfbff',
          'text': '#2a1a3a',
          'text-secondary': '#4a3a5d',
          'border': '#c4bce6',
          'border-light': '#e0dcf5',
          'glass': 'rgba(255, 255, 255, 0.7)',
          'glass-border': 'rgba(196, 188, 230, 0.6)',
        },
        // === ACCENTS (beide Modi) ===
        accent: {
          'primary': '#8b5cf6',
          'secondary': '#6366f1',
          'tertiary': '#d946ef',
          'glow': 'rgba(139, 92, 246, 0.3)',
        },
        // === THEME: Feminine ===
        feminine: {
          'primary': '#f472b6',
          'secondary': '#ec4899',
          'tertiary': '#db2777',
          'bg-light': '#fdf2f8',
          'border': '#fbcfe8',
        },
        // === THEME: Masculine ===
        masculine: {
          'primary': '#60a5fa',
          'secondary': '#3b82f6',
          'tertiary': '#2563eb',
          'bg-light': '#eff6ff',
          'border': '#bfdbfe',
        },
        // === THEME: Nature ===
        nature: {
          'primary': '#4ade80',
          'secondary': '#22c55e',
          'tertiary': '#16a34a',
          'bg-light': '#f0fdf4',
          'border': '#bbf7d0',
        },
        // === STATUS FARBEN ===
        status: {
          'success': '#0d9488',
          'error': '#b91c1c',
          'warning': '#ca8a04',
          'info': '#6366f1',
        },
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Montserrat', 'sans-serif'],
      },
      animation: {
        blob: "blob 7s infinite",
      },
      keyframes: {
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.05)',
        'glass-lg': '0 8px 40px rgba(0, 0, 0, 0.08)',
        'mystic': '0 4px 20px rgba(139, 92, 246, 0.15)',
        'mystic-lg': '0 8px 40px rgba(139, 92, 246, 0.25)',
      },
    },
  },
  plugins: [],
}
