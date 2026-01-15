/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f172a",
        card: "#1e293b",
        input: "#020617",
        primary: "#3b82f6",
        "primary-hover": "#2563eb",
      }
    },
  },
  plugins: [],
}
