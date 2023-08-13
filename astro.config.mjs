import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import glsl from "vite-plugin-glsl";
import aws from "astro-sst/lambda";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: aws(),
  integrations: [tailwind(), react()],
  vite: {
    plugins: [glsl()],
  },
});
