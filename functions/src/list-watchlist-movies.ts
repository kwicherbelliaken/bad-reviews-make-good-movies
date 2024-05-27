import { z } from "zod";
import { default as handlerWrapper } from "../../packages/core/handler";
import { Watchlist, getWatchlistMovies } from "../../packages/schema/Watchlist";

const USERNAME = process.env.USERNAME!;
const WATCHLIST_ID = process.env.WATCHLIST_ID!;

const eventSchema = z.object({});

export type ListWatchlistMoviesEvent = z.infer<typeof eventSchema>;

export const watchlist = new Watchlist(WATCHLIST_ID, USERNAME);

export const rawHandler = async (event: ListWatchlistMoviesEvent) => {
  const response = await getWatchlistMovies(watchlist);

  return response;
};

export const handler = handlerWrapper(rawHandler, eventSchema);
