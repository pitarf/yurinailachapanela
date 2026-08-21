/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          black: "#0A0A0A",
          white: "#FFFFFF",
          neutral: "#F4F4F5",
          border: "#E4E4E7",
          muted: "#71717A",
        }
      },
      fontFamily: {
        serif: ['var(--font-vogue)', 'Didot', 'Bodoni MT', 'serif'],
        script: ['var(--font-nautica)', 'cursive'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      borderRadius: {
        'popyn': '2.5rem',
      }
    },
  },
  plugins: [],
}
