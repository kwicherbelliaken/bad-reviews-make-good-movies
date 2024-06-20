import { useQuery } from "@tanstack/react-query";
import { queryClient } from "./query";
import { LoadingSpinner } from "../LoadingSpinner/LoadingSpinner";
import { WatchlistMovie } from "./WatchlistMovie";
import { getSessionUserDetails } from "./SearchMovie/hooks/utilities";
import type { Movie } from "../../../packages/schema/Movie";

interface WatchlistMoviesProps {}

const getWatchlistMovies = async () => {
  const { username, watchlistId } = await getSessionUserDetails();

  // [ ] these parameters need to be dynamica

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

const gridClassNames = "col-span-3";

export const WatchlistMovies = ({}: WatchlistMoviesProps) => {
  const { data, isLoading, isFetching, isRefetching, isError, error } =
    useGetWatchlistMovies();

  // [ ] better handle the different possible states

  if (data == null) {
    return null;
  } else if (isLoading || isFetching || isRefetching) {
    return (
      <div className="flex flex-col h-full align-middle items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full gap-4 ${gridClassNames}`}>
      {data.map((movie) => (
        <WatchlistMovie
          key={`${movie.movieDetails.title}-${movie.movieDetails.release_date}`}
          movie={movie}
        />
      ))}
    </div>
  );
};
