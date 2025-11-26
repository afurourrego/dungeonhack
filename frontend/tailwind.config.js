/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dungeon: {
          dark: '#1a1625',
          purple: '#6b46c1',
          gold: '#fbbf24',
          red: '#dc2626',
          green: '#10b981',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'slide-down-center': 'slideDownCenter 0.4s ease-out',
        'bounce-slow': 'bounce 2s infinite',
        'flip-3d': 'flip-3d 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
        'shine': 'shine 2s ease-in-out infinite',
        'shake': 'shake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        'glow-red': 'glow-red 1.5s ease-in-out infinite',
        'bubble': 'bubble 2s ease-in-out infinite',
        'particle-burst': 'particle-burst 0.8s ease-out forwards',
        'hover-float': 'hover-float 2s ease-in-out infinite',
        'energy-pulse': 'energy-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDownCenter: {
          '0%': { transform: 'translate(-50%, -20px)', opacity: '0' },
          '100%': { transform: 'translate(-50%, 0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
