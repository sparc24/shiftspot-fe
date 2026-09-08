/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#1b2a41',
          muted: '#55677e',
          amber: '#c99a2e',
          'amber-bg': '#f3dfa4',
          'amber-dark': '#7a5d12',
          border: '#e2e4e8',
          bg: '#ecedef',
        },
      },
      fontFamily: {
        serif: ['Arvo', 'Georgia', 'serif'],
        sans: ['"Inter Tight"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
