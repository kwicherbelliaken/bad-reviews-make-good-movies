import { default as handlerWrapper } from "../../packages/core/handler";

import tmdb from "../../packages/core/tmdb/tmdb";
import {
  Watchlist,
  findMovieInWatchlist,
} from "../../packages/schema/Watchlist";

//! The typing is wonky. I need to attend to it.
// @ts-ignore
export const handler = handlerWrapper(async (event) => {
  const {
    queryStringParameters: { title },
  } = event;

  // [ ] support authenticated sessions and resolving user data some other way
  //! to be honest, I think the better version of this would be to resolve the current user server side
  //! so, like, support authenticated sessions because otherwise I have to repeatedly pass "session" data over the wire
  //! so, this shit below remains hardcoded until I sort that out

  const movieInWatchlist = await findMovieInWatchlist(
    title,
    new Watchlist("trial-user", "8JWw9ZPsUtkD-14h0Fnzs")
  );

  const searchedMovies = await tmdb.bffEndpoints.list(title);

  if (movieInWatchlist.length > 0) {
    console.info(
      `Movie titled ${title} is already in the watchlist. Removing it from the list of searched movies.`
    );

    return searchedMovies.filter(
      ({ title: movieTitle }) => movieTitle != title
    );
  }

  return searchedMovies;
});
