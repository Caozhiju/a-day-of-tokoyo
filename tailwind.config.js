/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'rice-paper': '#F8F2E8',
        'aged-cream': '#E8DCCB',
        'scroll-dark': '#1A1A1A',
        'ink-light': '#5C5C5C',
        'gold-accent': '#B8872B',
        'gold-light': '#D4AF37',
        'border-warm': '#D8C8A8',
        'bg-card': 'rgba(255,250,240,0.95)',
        'text-primary': '#1A1A1A',
        'text-secondary': '#8B6B2E',
      },
      fontFamily: {
        'serif': ['Georgia', 'serif'],
        'chinese': ['"Noto Serif SC"', 'serif'],
      },
      backgroundImage: {
        'texture': "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\"><filter id=\"noise\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"4\" seed=\"2\"/></filter><rect width=\"100\" height=\"100\" fill=\"%23F5EFE0\" filter=\"url(%23noise)\" opacity=\"0.3\"/></svg>')",
      },
    },
  },
  plugins: [],
}
