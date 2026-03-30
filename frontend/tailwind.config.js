/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#6366f1', dark: '#4f46e5', light: '#818cf8' },
        accent:  { DEFAULT: '#8b5cf6', dark: '#7c3aed' },
        surface: { DEFAULT: '#1e293b', card: '#0f172a', border: '#334155' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      animation: {
        'fade-in':  'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:   { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        pulseGlow: { '0%,100%': { boxShadow: '0 0 5px #6366f1' }, '50%': { boxShadow: '0 0 20px #6366f1, 0 0 40px #6366f155' } },
      },
    },
  },
  plugins: [],
};
