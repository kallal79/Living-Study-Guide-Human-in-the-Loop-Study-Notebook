/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#FDFCF9',
          100: '#FBF9F5',
          200: '#F5F2EB',
          300: '#EBE6DC',
          400: '#DCD4C5',
          500: '#BDB19C',
        },
        ink: {
          900: '#1A1815',
          800: '#2C2824',
          700: '#464039',
          600: '#696257',
          500: '#928B7E',
        },
        sage: {
          50: '#F3F7F4',
          100: '#E4EDE7',
          700: '#2B5738',
          800: '#1C3B2B',
          900: '#13281D',
        },
        terracotta: {
          50: '#FCF6F0',
          100: '#F7E7D7',
          600: '#C05621',
          700: '#9C4215',
          800: '#7B3410',
        }
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

