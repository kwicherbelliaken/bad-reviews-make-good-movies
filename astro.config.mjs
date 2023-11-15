import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import glsl from "vite-plugin-glsl";
import aws from "astro-sst";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: aws(),
  integrations: [
    tailwind({
      // Example: Disable injecting a basic `base.css` import on every page.
      // Useful if you need to define and/or import your own custom `base.css`.
      applyBaseStyles: false,
    }),
    react(),
  ],
  vite: {
    plugins: [glsl()],
  },
});
