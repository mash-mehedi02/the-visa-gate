/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        // Small-phone breakpoint used across the portal, console and public site.
        xs: '400px',
      },
      colors: {
        brand: {
          navy: '#062B57',         // Official Logo Imperial Navy
          'navy-deep': '#031B38',    // Midnight Navy for rich contrasts
          'navy-light': '#0A3B73',   // Elevated Interactive Navy
          azure: '#3874B4',          // Logo Secondary Accent Azure
          'azure-light': '#88B2DC',  // Logo Soft Cyan / Sky Blue
          'azure-sky': '#E2EEF8',    // Very Soft Azure tint for cards
          gold: '#D6B66E',           // Official Gold Prestige
          'gold-light': '#E8D49E',
          'gold-dark': '#8A6D2B',
          bg: '#F8FAFC',             // Ultra-clean high-end slate background
          'light-grey': '#E9EDF3',
          success: '#16856A',
          warning: '#D99A30',
          error: '#DC4545',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'brand': '0 4px 20px -2px rgba(6, 43, 87, 0.12)',
        'brand-gold': '0 4px 20px -2px rgba(214, 182, 110, 0.25)',
      }
    },
  },
  plugins: [],
}
