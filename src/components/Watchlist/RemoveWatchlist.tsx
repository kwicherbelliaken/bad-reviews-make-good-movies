import { useState } from "react";
import { match } from "ts-pattern";
import { LoadingSpinner } from "../LoadingSpinner/LoadingSpinner";

interface RemoveWatchlistProps {
  movieId: number;
}

export const RemoveWatchlist = ({ movieId }: RemoveWatchlistProps) => {
  const [result, setResult] = useState<
    | { status: "success" }
    | { status: "error"; error: Error }
    | { status: "idle" }
    | { status: "loading" }
  >({
    status: "idle",
  });

  const handleRemove = async () => {
    setResult({ status: "loading" });

    try {
      const queryParams = new URLSearchParams({
        movieId: movieId.toString(),
      });

      const response = await fetch(
        "https://hh2877m7a0.execute-api.ap-southeast-2.amazonaws.com/movies?" +
          queryParams,
        {
          method: "DELETE",
        }
      );

      if (response.status !== 200 || !response.ok) {
        // NB: Critically important to actually read the response body. If we don't
        // Node Fetch leaks connections: https://github.com/node-fetch/node-fetch/issues/499
        const body = await response.json();

        throw new Error(body.error);
      }

      setResult({ status: "success" });
    } catch (error) {
      setResult({ status: "error", error: error as unknown as Error });
    }
  };

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
