/// <reference types="astro/client" />

import { string } from "yargs";

interface ImportMetaEnv {
  readonly PUBLIC_API_URL: string;
  readonly TMDB_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
