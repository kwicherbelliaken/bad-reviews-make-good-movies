import { useState } from "react";
import { match } from "ts-pattern";
import { LoadingSpinner } from "../LoadingSpinner/LoadingSpinner";
import { queryClient } from "./query";
import { useMutation } from "@tanstack/react-query";

interface RemoveWatchlistProps {
  movieId: string;
}

// [ ] convert to using react query mutation

const removeFromWatchlist = async (movieId: string) => {
  const queryParams = new URLSearchParams({
    movieId: movieId.toString(),
  });

  const response = await fetch(
    "https://97ogx4wg9c.execute-api.ap-southeast-2.amazonaws.com/movies?" +
      queryParams,
    {
      method: "DELETE",
    }
  );

  type JSONResponse = {
    error: string;
  };

  if (response.status !== 204 || !response.ok) {
    // NB: Critically important to actually read the response body. If we don't
    // Node Fetch leaks connections: https://github.com/node-fetch/node-fetch/issues/499
    const { error }: JSONResponse = (await response.json()) as JSONResponse;

    throw new Error(error);
  }
};

const useRemoveFromWatchlist = () => {
  const { mutate, isPending, isError, error, data } = useMutation(
    {
      mutationFn: removeFromWatchlist,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["watchlistMovies"] });
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
    remove: mutate,
    result,
  };
};

export const RemoveWatchlist = ({ movieId }: RemoveWatchlistProps) => {
  const { remove, result } = useRemoveFromWatchlist();

  const handleRemove = () => remove(movieId);

  return (
    <div
      id="tester"
      className="absolute right-0 top-0 flex gap-4"
      onClick={handleRemove}
    >
      {match(result)
        .with({ status: "success" }, () => (
          <span
            className="text-4xl cursor-pointer before:content-[' '] before:hover:shadow-[18px_0_40px_20px_#defe56]"
            role="img"
            aria-label="eyes"
          >
            ✅
          </span>
        ))
        .with({ status: "error" }, ({ error }) => (
          <span
            className="text-4xl cursor-pointer before:content-[' '] before:hover:shadow-[18px_0_40px_20px_#E65438] after:content-[attr(data-hover)] after:opacity-0 after:bg-red-400 after:bg-opacity-30 after:outline after:outline-red-500 after:rounded-lg after:p-1 after:px-2 hover:after:visible hover:after:opacity-100 after:text-sm after:whitespace-nowrap after:text-white after:transition-opacity after:duration-750 after:ease-in-out after:delay-75 after:invisible after:absolute after:top-8"
            data-hover={error.message}
            role="img"
            aria-label="eyes"
          >
            ❌
          </span>
        ))
        .with({ status: "loading" }, () => <LoadingSpinner />)
        .otherwise(() => (
          <span
            className="text-4xl cursor-pointer before:content-[' '] before:hover:shadow-[18px_0_40px_20px_#defe56]"
            role="img"
            aria-label="eyes"
          >
            🗑️
          </span>
        ))}
    </div>
  );
};
