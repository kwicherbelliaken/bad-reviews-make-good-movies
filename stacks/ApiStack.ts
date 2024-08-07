import { Api, use, Config, type StackContext } from "sst/constructs";
import { StorageStack } from "./StorageStack";

export function ApiStack({ stack, app }: StackContext) {
  const brmgmDb = use(StorageStack);

  const SSM_TMDB_API_KEY = new Config.Secret(stack, "TMDB_API_KEY");
  const TMDB_API_READ_ACCESS_TOKEN = new Config.Secret(
    stack,
    "TMDB_API_READ_ACCESS_TOKEN"
  );

  const tmdbApiBaseUrl = process.env.TMDB_API_BASE_URL;

  const api = new Api(stack, "api", {
    customDomain: `api-${app.stage}.badreviewsmakegoodmovies.com`,
    defaults: {
      function: {
        permissions: [brmgmDb],
        environment: {
          BRMGM_TABLE_NAME: brmgmDb.tableName,
          TMDB_API_BASE_URL: tmdbApiBaseUrl!,
          WATCHLIST_ID: "8JWw9ZPsUtkD-14h0Fnzs",
          USERNAME: "trial-user",
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

  api.bind([TMDB_API_READ_ACCESS_TOKEN]);

  const tmdbApi = new Api(stack, "tmdbApi", {
    customDomain: `api-${app.stage}-tmdb.badreviewsmakegoodmovies.com`,
    defaults: {
      function: {
        environment: {
          TMDB_API_BASE_URL: tmdbApiBaseUrl!,
        },
      },
    },
    routes: {
      "GET /search": "functions/tmdb/bff/list.handler",
      "GET /image": "functions/tmdb/bff/get-movie-poster-url.handler",
    },
  });

  tmdbApi.bind([TMDB_API_READ_ACCESS_TOKEN]);

  stack.addOutputs({
    baseApiEndpoint: api.customDomainUrl || api.url,
    tmdbApiEndpoint: tmdbApi.customDomainUrl || tmdbApi.url,
  });

  return { api, tmdbApi };
}
