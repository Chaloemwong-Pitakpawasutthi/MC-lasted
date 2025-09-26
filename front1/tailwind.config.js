// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Kanit", "sans-serif"], // ✅ ใช้ Kanit เป็น default
      },
    },
  },
  plugins: [],
};
