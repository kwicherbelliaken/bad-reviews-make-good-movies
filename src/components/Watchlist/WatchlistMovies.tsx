import { useQuery } from "@tanstack/react-query";
import { queryClient } from "./query";
import { LoadingSpinner } from "../LoadingSpinner/LoadingSpinner";
import { WatchlistMovie } from "./WatchlistMovie";
import type { Movie } from "../../../packages/schema/Movie";

interface WatchlistMoviesProps {}

const getWatchlistMovies = async () => {
  const username = "trial-user";
  const watchlistId = "8JWw9ZPsUtkD-14h0Fnzs";

  const response = await fetch(
    `https://hh2877m7a0.execute-api.ap-southeast-2.amazonaws.com/users/${username}/watchlist/${watchlistId}`,
    {
      method: "GET",
    }
  );

  // [ ] type the response

  const data = (await response.json()) as Movie[];

  return data;
};

const useGetWatchlistMovies = () => {
  return useQuery(
    {
      queryKey: ["watchlistMovies"],
      queryFn: () => getWatchlistMovies(),
    },
    queryClient
  );
};

export const WatchlistMovies = ({}: WatchlistMoviesProps) => {
  const { data, isLoading, isError, error } = useGetWatchlistMovies();

  if (data == null) {
    return null;
  } else if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col w-[70%] h-full gap-4">
      {data.map((movie) => (
        <WatchlistMovie movie={movie} />
      ))}
    </div>
  );
};
