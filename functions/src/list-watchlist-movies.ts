import { default as handlerWrapper } from "../../packages/core/handler";
import { Watchlist, getWatchlistMovies } from "../../packages/schema/Watchlist";

//! The typing is wonky. I need to attend to it.
// @ts-ignore
export const handler = handlerWrapper(async (event) => {
  const response = await getWatchlistMovies(
    new Watchlist(
      event.pathParameters?.username!,
      event.pathParameters?.watchlistId!
    )
  );

  return response;
});
