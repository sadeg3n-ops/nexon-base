/** @type {import('tailwindcss').Config} */
/* Tailwind Config for Nexo Base System */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './public/**/*.html'],
  theme: {
    extend: {
      borderRadius: {
        'b2b': 'var(--radius-sm)',
      },
      colors: {
        'page-bg': 'var(--page-bg)',
        'card-bg': 'var(--card-bg)',
        'card-hover': 'var(--card-hover)',
        'ai-blue': '#2563EB',
        'ai-purple': '#7C3AED',
        'ai-dark': 'var(--page-bg)',
        'border-soft': 'var(--border-soft)',
        'border-strong': 'var(--border-strong)',
      },
      animation: {
        'blob': 'blob 10s infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
