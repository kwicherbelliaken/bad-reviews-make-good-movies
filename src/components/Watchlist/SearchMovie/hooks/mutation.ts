import { useMutation } from "@tanstack/react-query";
import type { BffListResponse } from "../../../../../packages/core/tmdb/types";
import { queryClient } from "../../query";

import { authStoreAPI } from "../../../../../lib/authStore";

const api = import.meta.env.PUBLIC_API_URL;

const _getUsernameAndWatchlistId = async (): Promise<{
  username: string;
  watchlistId: string;
}> => {
  // [ ] get the current clerk user
  let currentUserId;

  const auth = authStoreAPI.get();

  auth.subscribe((clerk) => {
    if (clerk && clerk.user) {
      currentUserId = clerk.user.id;
    }
  });

  const getUserResponse = await fetch(
    `${api}/users/${currentUserId}?resolveWatchlist=true`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const body = await getUserResponse.json();

  if (getUserResponse.status !== 200 || !getUserResponse.ok) {
    throw new Error(body.error);
  }

  // Figure out a better way to have type support for my fetch calls.
  // @ts-ignore
  return body;
};

const addMovieToWatchlist = async (payload: any) => {
  const api = import.meta.env.PUBLIC_API_URL;

  //! This is so fucking clumsy. Calling '/get-user' each time I add a movie to my watchlist. But, I needed
  //! a way to resolve the 'watchlistId' which we use in the path.
  //!
  //! I settled on modifying the '/get-user' endpoint to return the 'watchlistId' if passed an appropriate flag.
  //!
  //! My other alternative was to return it from the `create-user` call and then set it against an equivalent Clerk
  //! user and thereby sync them up. But then I didn't want to set any more information than I need to into Clerk.
  //! Watchlist "stuff" feels relevant to my data store. Not Clerks.
  //!
  //! I suppose another approach would be to modify the endpoint below to not expect a 'watchlistId' and instead to resolve
  //! it server side, similar to what I am doing in the '/get-user' endpoint.

  const { username, watchlistId } = await _getUsernameAndWatchlistId();

  const response = await fetch(`${api}/movies/${watchlistId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      payload,
    }),
  });

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
