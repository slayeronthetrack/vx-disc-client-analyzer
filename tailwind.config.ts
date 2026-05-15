import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'vx-dark': '#0B0F14',
        'vx-secondary': '#111821',
        'vx-orange': '#F7971E',
        'vx-orange-hover': '#FF8C1A',
        'vx-white': '#FFFFFF',
        'vx-gray': '#A0A0A0',
      },
      fontFamily: {
        sans: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'title': ['48px', { lineHeight: '1.2', fontWeight: '700' }],
        'title-mobile': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'subtitle': ['20px', { lineHeight: '1.5', fontWeight: '400' }],
        'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
      },
      maxWidth: {
        'container': '1200px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(247, 151, 30, 0.25)',
        'glow-lg': '0 0 40px rgba(247, 151, 30, 0.3)',
      },
    },
  },
  plugins: [],
};

export default config;
