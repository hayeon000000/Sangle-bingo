/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#08090a',
          900: '#0e1013',
          800: '#16191e',
          700: '#1e2229',
          600: '#272d36',
          500: '#353d4a',
        },
        acid: {
          DEFAULT: '#c8f135',
          dim: '#a3c828',
          glow: 'rgba(200, 241, 53, 0.15)',
        },
        coral: {
          DEFAULT: '#ff6b6b',
          dim: '#cc5555',
        },
        sky: {
          bingo: '#38bdf8',
        }
      },
      animation: {
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.3s ease',
        'bingo-flash': 'bingoFlash 0.6s ease',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'confetti-fall': 'confettiFall 1s ease-in forwards',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bingoFlash: {
          '0%': { transform: 'scale(1)', filter: 'brightness(1)' },
          '50%': { transform: 'scale(1.05)', filter: 'brightness(1.5)' },
          '100%': { transform: 'scale(1)', filter: 'brightness(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(200, 241, 53, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(200, 241, 53, 0.6)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      }
    },
  },
  plugins: [],
}
