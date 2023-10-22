const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {},
    fontFamily: {
      mono450Regular: ["Commit-Mono-450-Regular"],
      mono700Regular: ["Commit-Mono-700-Regular"],
      afterAllBold: ["After-All-Bold"],
      afterAllBoldSerif: ["After-All-Bold-Serif"],
      afterAllRegular: ["After-All-Regular"],
    },
    colors: {
      ...colors,
      grey: {
        50: "#FAFAF9",
        100: "#EAECEA",
        200: "#DADDDB",
        300: "#CBCFCC",
        400: "#BBC0BD",
        500: "#ABB2AD",
        600: "#9BA39E",
        700: "#8C958F",
        800: "#7C8680",
        900: "#6C7871",
      },
    },
  },
  plugins: [],
};
