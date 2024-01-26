import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { default as handlerWrapper } from "../../packages/core/handler";

import tmdb from "../../packages/core/tmdb/tmdb";
import {
  Watchlist,
  findMovieInWatchlist,
} from "../../packages/schema/Watchlist";
import { z } from "zod";

const eventSchema = z.object({
  queryStringParameters: z.object({
    title: z.string(),
  }),
});

export type SearchMoviesEvent = Pick<
  APIGatewayProxyEventV2,
  "queryStringParameters"
> &
  z.infer<typeof eventSchema>;

export const rawHandler = async (event: SearchMoviesEvent) => {
  const {
    queryStringParameters: { title },
  } = event;

  const movieInWatchlist = await findMovieInWatchlist(
    title,
    new Watchlist("trial-user", "8JWw9ZPsUtkD-14h0Fnzs")
  );

  let searchedMovies = await tmdb.bffEndpoints.list(title);

  if (movieInWatchlist.length > 0) {
    console.info(
      `Movie titled ${title} is already in the watchlist. Removing it from the list of searched movies.`
    );

    return searchedMovies.filter(
      ({ title: movieTitle }) => movieTitle != title
    );
  }

  return searchedMovies;
};

export const handler = handlerWrapper(rawHandler, eventSchema);
