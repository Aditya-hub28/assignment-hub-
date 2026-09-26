/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6C63FF",
        "primary-container": "#8B7CFF",
        "on-primary": "#FFFFFF",
        "on-primary-container": "#FFFFFF",
        secondary: "#FFB84D",
        "secondary-container": "#FFF3DD",
        "on-secondary": "#FFFFFF",
        "on-secondary-container": "#6D4400",
        tertiary: "#FF6584",
        "tertiary-container": "#FFE5EB",
        "tertiary-fixed-dim": "#FF8A9F",
        "on-tertiary-fixed": "#3E0011",
        surface: "#FAF8FF",
        "surface-container-lowest": "#FFFFFF",
        "surface-container-low": "#F3F0FF",
        "surface-container": "#EBE5FF",
        "surface-container-high": "#E2DCFF",
        "surface-container-highest": "#D4CCFF",
        "on-surface": "#25233A",
        "on-surface-variant": "#6E6A8A",
        outline: "#C8C2EA",
        "outline-variant": "#DCD6F7",
        success: "#55C595",
        "success-container": "#E8F8F0",
        error: "#BA1A1A",
        "error-container": "#FFDAD6",
        "on-error-container": "#410002"
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
