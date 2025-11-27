/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0EA5E9",     // Neon Blue (Buttons, Highlights)
        secondary: "#1E293B",   // Slate Blue (Cards / Sections)
        dark: "#0F172A",        // Deep Navy Background
        light: "#38BDF8",       // Light Neon Blue (Accents)
      },
    },
  },
  plugins: [],
};
