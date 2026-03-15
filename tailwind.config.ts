import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bb-black': '#0A0A0A',
        'bb-red': '#DC2626',
        'bb-red-dark': '#991B1B',
        'bb-gray': {
          100: '#F5F5F5',
          300: '#D4D4D4',
          500: '#737373',
          700: '#404040',
          900: '#171717',
        },
        'bb-white': '#FAFAFA',
        'bb-success': '#16A34A',
        'bb-warning': '#CA8A04',
        'bb-error': '#DC2626',
        'bb-info': '#2563EB',
        'belt-white': '#FAFAFA',
        'belt-gray': '#9CA3AF',
        'belt-yellow': '#EAB308',
        'belt-orange': '#EA580C',
        'belt-green': '#16A34A',
        'belt-blue': '#2563EB',
        'belt-purple': '#9333EA',
        'belt-brown': '#92400E',
        'belt-black': '#0A0A0A',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        pill: '9999px',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
    },
  },
  plugins: [],
};

export default config;
