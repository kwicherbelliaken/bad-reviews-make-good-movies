import { Api, use, type StackContext } from "sst/constructs";
import { StorageStack } from "./StorageStack";

export function ApiStack({ stack }: StackContext) {
  const brmgmDb = use(StorageStack);

  // [ ]: get SST to manage these env vars
  const accessToken = process.env.TMDB_API_READ_ACCESS_TOKEN;
  const tmdbApiBaseUrl = process.env.TMDB_API_BASE_URL;

  const api = new Api(stack, "api", {
    defaults: {
      function: {
        permissions: [brmgmDb],
        environment: {
          BRMGM_TABLE_NAME: brmgmDb.tableName,
          TMDB_API_BASE_URL: tmdbApiBaseUrl!,
          TMDB_API_READ_ACCESS_TOKEN: accessToken!,
        },
      },
    },
    routes: {
      "POST /users": "functions/src/create-user.handler",
      "POST /movies/{watchlistId}": "functions/src/add-movie.handler",
      "GET /movies": "functions/src/search-movies.handler",
      "DELETE /movies": "functions/src/delete-movie.handler",
      "GET /users/{username}": "functions/src/get.handler",
      "GET /users/{username}/watchlist/{watchlistId}":
        "functions/src/list-watchlist-movies.handler",
      "PUT /users/{id}": "functions/src/update.handler",

    },
  });

  const tmdbApi = new Api(stack, "tmdbApi", {
    defaults: {
      function: {
        environment: {
          TMDB_API_BASE_URL: tmdbApiBaseUrl!,
          TMDB_API_READ_ACCESS_TOKEN: accessToken!,
        },
      },
    },
    routes: {
      "GET /search": "functions/tmdb/bff/list.handler",
      "GET /image": "functions/tmdb/bff/get-movie-poster-url.handler",
    },
  });

  // Show the URLs in the output
  stack.addOutputs({
    ApiEndpoint: api.url,
    tmdbApiEndpoint: tmdbApi.url,
  });

  return api;
}
