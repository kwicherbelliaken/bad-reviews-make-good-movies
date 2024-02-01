/// <reference types="vitest" />
import { getViteConfig } from "astro/config";
import path from "path";

export default getViteConfig({
  test: {
    /* for example, use global to avoid globals imports (describe, test, expect): */
    globals: true,
  },
  resolve: {
    alias: {
      "@tmdb": path.resolve(__dirname, "packages/core/tmdb/tmdb.ts"),
    },
  },
});
