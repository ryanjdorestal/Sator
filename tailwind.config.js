/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#204D36',
        accent: '#E0A622',
        'accent-hover': '#E3B341',
        offwhite: '#F5F5F3',
        'dark-overlay': '#0C0C0C',
        brand: {
          green: '#204D36',
          gold: '#E0A622',
          goldAccent: '#E3B341',
          offWhite: '#F5F5F3',
          white: '#FFFFFF',
          darkGray: '#2A2A2A',
        },
        shadow: {
          gray: 'rgba(12, 12, 12, 0.35)',
        },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

