/// <reference types="astro/client" />

import { string } from "yargs";

interface ImportMetaEnv {
  readonly PUBLIC_API_URL: string;
  readonly PUBLIC_TMDB_API_URL: string;
  readonly PUBLIC_WATCHLIST_ID: string;
  readonly PUBLIC_USERNAME: string;

}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
