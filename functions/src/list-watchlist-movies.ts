import { z } from "zod";
import { default as handlerWrapper } from "../../packages/core/handler";
import { Watchlist, getWatchlistMovies } from "../../packages/schema/Watchlist";

const eventSchema = z.object({
  pathParameters: z.object({
    username: z.string(),
    watchlistId: z.string(),
  }),
});

export type ListWatchlistMoviesEvent = z.infer<typeof eventSchema>;

export const rawHandler = async (event: ListWatchlistMoviesEvent) => {
  const {
    pathParameters: { username, watchlistId },
  } = event;

  const watchlist = new Watchlist(watchlistId, username);

  const response = await getWatchlistMovies(watchlist);

  return response;
};

export const handler = handlerWrapper(rawHandler, eventSchema);
