/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Shadowrun Barren theme colors
        'sr-dark': '#0a0a0a', // Dark background
        'sr-green': '#1EEB4B', // Neon green for prompt
        'sr-red': '#FF3333',  // Red accents
      },
    },
  },
  plugins: [],
}
