/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bakery: {
          cream: '#FDF5E6',
          brown: '#8B4513',
          golden: '#DAA520',
          wheat: '#F5DEB3',
          chocolate: '#3E2723',
          beige: '#F5F5DC',
        }
      }
    },
  },
  plugins: [],
}
