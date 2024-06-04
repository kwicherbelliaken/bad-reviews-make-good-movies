import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import glsl from "vite-plugin-glsl";
import aws from "astro-sst";

import react from "@astrojs/react";
import clerk from "astro-clerk-auth";

// https://astro.build/config
export default defineConfig({
  output: "server",
  site: "https://www.badreviewsmakegoodmovies.com",
  base: "/",
  adapter: aws(),
  integrations: [
    tailwind({
      // Example: Disable injecting a basic `base.css` import on every page.
      // Useful if you need to define and/or import your own custom `base.css`.
      applyBaseStyles: false,
    }),
    react(),
    clerk({
      afterSignInUrl: "/",
      afterSignUpUrl: "/",
    }),
  ],
  vite: {
    plugins: [glsl()],
  },
});
