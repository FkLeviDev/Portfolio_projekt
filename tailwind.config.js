/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#FAF9F6',          // Warm paper white
        'bg-card': '#FFFFFF',     // Pure white
        'bg-hover': '#F4F3EF',    // Soft sand / light gray
        border: '#EAE8E4',        // Minimal warm gray border
        text: '#1C1917',          // Stone-900 (deep warm charcoal)
        muted: '#6E6A66',         // Stone-600 (muted warm gray)
        dim: '#A8A29E',           // Stone-400 (very soft gray)
        accent: '#B07D62',        // Muted terracotta / warm clay
      },
      gridTemplateColumns: {
        'skills': 'repeat(auto-fit, minmax(280px, 1fr))',
        'projects': 'repeat(auto-fit, minmax(300px, 1fr))',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        }
      },
      animation: {
        blink: 'blink 1s step-end infinite',
      }
    },
  },
  plugins: [],
}
