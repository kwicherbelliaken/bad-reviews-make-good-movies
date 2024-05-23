import { z } from "zod";
import { default as handlerWrapper } from "../../packages/core/handler";
import { Watchlist, getWatchlistMovies } from "../../packages/schema/Watchlist";

const eventSchema = z.object({});

export type ListWatchlistMoviesEvent = z.infer<typeof eventSchema>;

export const watchlist = new Watchlist("8JWw9ZPsUtkD-14h0Fnzs", "trial-user");

export const rawHandler = async (event: ListWatchlistMoviesEvent) => {
  const response = await getWatchlistMovies(watchlist);

  return response;
};

export const handler = handlerWrapper(rawHandler, eventSchema);
