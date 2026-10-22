/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1a2744",
          light: "#2a3a5e",
          dark: "#0f1a30",
        },
        cream: {
          DEFAULT: "#faf8f3",
          dark: "#f3efe6",
        },
        teal: {
          DEFAULT: "#2c7d7b",
          light: "#3a9d9b",
          dark: "#1f5e5c",
        },
        amber: {
          DEFAULT: "#b45309",
          light: "#d97706",
          dark: "#92400e",
        },
        neutral: {
          DEFAULT: "#6b7280",
          light: "#9ca3af",
          dark: "#4b5563",
        },
        border: {
          DEFAULT: "#e2ddd0",
          light: "#ebe7dc",
        },
        ink: "#1c1c1c",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};
