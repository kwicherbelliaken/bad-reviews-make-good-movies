import { useQuery } from "@tanstack/react-query";
import { queryClient } from "./query";
import { LoadingSpinner } from "../LoadingSpinner/LoadingSpinner";
import { WatchlistMovie } from "./WatchlistMovie";
import type { Movie } from "../../../packages/schema/Movie";

interface WatchlistMoviesProps {}

const getWatchlistMovies = async () => {
  const username = "trial-user";
  const watchlistId = "8JWw9ZPsUtkD-14h0Fnzs";

  const api = import.meta.env.PUBLIC_API_URL;

  const response = await fetch(
    `${api}/users/${username}/watchlist/${watchlistId}`,
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
  const { data, isLoading, isFetching, isRefetching, isError, error } =
    useGetWatchlistMovies();

  // [ ] better handle the different possible states

  if (data == null) {
    return null;
  } else if (isLoading || isFetching || isRefetching) {
    return (
      <div className="flex flex-col w-[70%] h-full align-middle items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-[70%] h-full gap-4">
      {data.map((movie) => (
        <WatchlistMovie
          key={`${movie.movieDetails.title}-${movie.movieDetails.release_date}`}
          movie={movie}
        />
      ))}
    </div>
  );
};
