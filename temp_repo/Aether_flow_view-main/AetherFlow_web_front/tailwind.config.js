/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(139, 92, 246, 0.5)',
        'glow-md': '0 0 15px rgba(139, 92, 246, 0.6)',
        'glow-lg': '0 0 25px rgba(139, 92, 246, 0.7)',
      },
    },
  },
  plugins: [],
};