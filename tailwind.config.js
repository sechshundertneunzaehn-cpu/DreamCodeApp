/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Cinzel', 'serif'],
        body: ['Nunito', 'sans-serif'],
      },
      colors: {
        dream: {
          bg: '#0a0a1a',
          card: '#111128',
          surface: '#1a1a3e',
          primary: '#a855f7',     // Violet
          secondary: '#f59e0b',   // Gold/Amber
          accent: '#6366f1',      // Indigo
          cyan: '#22d3ee',        // Cyan highlight
          rose: '#f43f5e',        // Rose accent
        }
      },
      backgroundImage: {
        'stars': "radial-gradient(2px 2px at 20px 30px, #eee, transparent), radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.3), transparent), radial-gradient(1px 1px at 90px 40px, #fff, transparent), radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.4), transparent), radial-gradient(2px 2px at 160px 30px, #ddd, transparent)",
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
      },
    }
  },
  plugins: [],
}
