import { useMutation } from "@tanstack/react-query";
import type { BffListResponse } from "../../../../../packages/core/tmdb/types";
import { queryClient } from "../../query";

const addMovieToWatchlist = async (payload: any) => {
  const response = await fetch(
    "https://97ogx4wg9c.execute-api.ap-southeast-2.amazonaws.com/movies/8JWw9ZPsUtkD-14h0Fnzs",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "trial-user",
        payload,
      }),
    }
  );

  // [ ] think about returning the movie from the server so I can return it here

  // NB: Critically important to actually read the response body. If we don't
  // Node Fetch leaks connections: https://github.com/node-fetch/node-fetch/issues/499
  const body = await response.json();

  if (response.status !== 200 || !response.ok) {
    throw new Error(body.error);
  }

  return payload;
};

export const useAddMovieToWatchlist = () => {
  const { mutate, isPending, isError, error, data } = useMutation(
    {
      mutationFn: addMovieToWatchlist,
      onSuccess: (response: BffListResponse[0]) => {
        // 1. We refresh the list of Watchlist Movies.
        queryClient.invalidateQueries({ queryKey: ["watchlistMovies"] });

        // 2. We remove the Movie we just added to the Watchlist from the list of Searched Movies.
        const queryCache = queryClient.getQueryCache();

        const activeSearchedMoviesQueryKeys = queryCache
          .findAll({
            queryKey: ["searchedMovies"],
          })
          .map(({ queryKey }) => queryKey);

        // [ ] https://github.com/slackermorris/bad-reviews-make-good-movies/issues/76

        const mostRecentSearchedMoviesQueryKey =
          activeSearchedMoviesQueryKeys[
            activeSearchedMoviesQueryKeys.length - 1
          ];

        queryClient.setQueryData(
          mostRecentSearchedMoviesQueryKey,
          (oldData: any) => {
            return oldData.filter(
              (movie: any) =>
                movie.title.toLowerCase() !== response.title.toLowerCase()
            );
          }
        );
      },
    },
    queryClient
  );

  let result:
    | { status: "success" }
    | { status: "error"; error: Error }
    | { status: "idle" }
    | { status: "loading" } = { status: "idle" };

  if (isPending) {
    result = { status: "loading" };
  } else if (isError) {
    result = { status: "error", error: error as Error };
  } else if (data) {
    result = { status: "success" };
  }

  return {
    result: result,
    addMovieToWatchlist: mutate,
  };
};
