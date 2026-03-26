/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0b14',
          800: '#111320',
          700: '#161827',
          600: '#1a1d2e',
          500: '#252840',
          400: '#343750',
          300: '#4a4d6a',
        },
        accent: {
          DEFAULT: '#6c63ff',
          hover: '#5b52d4',
          light: '#8b84ff',
        },
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          500: '#8b5cf6',
          600: '#6c63ff',
          700: '#5b52d4',
          900: '#2e1065',
        }
      },
    },
  },
  plugins: [],
}
