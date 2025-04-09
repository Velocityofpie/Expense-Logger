// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Enables dark mode with class="dark"
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        dark: {
          bg: '#121212',
          card: '#1e1e1e',
          nav: '#272727',
          border: '#383838',
          text: {
            primary: '#f3f4f6',
            secondary: '#d1d5db',
            muted: '#9ca3af',
          },
        },
      },
      // Width mode configurations
      padding: {
        'standard-sm': '16px',   // px-16 for small screens
        'standard-md': '24px',   // px-24 for medium screens
        'standard-lg': '32px',   // px-32 for large screens
        'standard-xl': '40px',   // px-40 for extra large screens
        'compact': '6px',        // px-6 for compact mode
        'full': '4px',           // px-4 for full width mode
      },
      maxWidth: {
        'standard': '1536px',    // max-w-screen-2xl for standard mode
        'compact': '1024px',     // max-w-screen-lg for compact mode
      },
      boxShadow: {
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}