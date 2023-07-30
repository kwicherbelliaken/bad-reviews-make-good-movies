/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {},
    fontFamily: {
      mono450Regular: ["Commit-Mono-450-Regular"],
      mono700Regular: ["Commit-Mono-700-Regular"],
    },
  },
  plugins: [],
};
