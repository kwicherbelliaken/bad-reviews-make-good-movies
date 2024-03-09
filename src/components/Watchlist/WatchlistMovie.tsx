import { useQuery } from "@tanstack/react-query";
import { queryClient } from "./query";

import { MoviePoster } from "./MoviePoster";
import { RemoveWatchlist } from "./RemoveWatchlist";
import { LoadingSpinner } from "../LoadingSpinner/LoadingSpinner";

import type { Movie } from "../../../packages/schema/Movie";

const TMDB_API_ENDPOINT =
  "https://2ojnkh774c.execute-api.ap-southeast-2.amazonaws.com";

interface WatchlistMovieProps {
  movie: Movie;
}

const getWatchlistMovieImage = async (posterPath: string) => {
  const width = 500;
  const height = 750;

  const response = await fetch(
    `${TMDB_API_ENDPOINT}/image?fileSize=w${width}&posterPath=${posterPath}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const imageUrl = await response.json();

  return imageUrl;
};

const useGetWatchlistMovieImage = (posterPath: string) => {
  return useQuery(
    {
      queryKey: ["watchlistMovieImage", posterPath],
      queryFn: () => getWatchlistMovieImage(posterPath),
    },
    queryClient
  );
};

export const WatchlistMovie = ({ movie }: WatchlistMovieProps) => {
  const { data: imageUrl, isLoading } = useGetWatchlistMovieImage(
    movie.movieDetails.poster_path
  );

  // [ ] better handle the different possible states
  if (imageUrl == null) {
    return null;
  } else if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-wrap bg-grey-50 rounded-lg border p-4 gap-4 [&>div]:basis-96 [&>div]:flex-grow bg-purple-500">
      <div className="bg-green-500">
        <MoviePoster imageUrl={imageUrl} />
      </div>

      <div className="bg-red-500">
        <RemoveWatchlist movieId={movie.id} />
        <h1>{movie.movieDetails.title}</h1>
        <h2 className="font-afterAllBoldSerif font-bold text-2xl tracking-wide">
          {movie.movieDetails.release_date}
        </h2>
        <p className="indent-7">{movie.movieDetails.overview}</p>
        <div className="py-10">
          {(movie.movieDetails.cast ?? []).map((cast) => (
            <p className="indent-7" key={`${cast.name} as ${cast.character}`}>
              {cast.name} as {cast.character}
            </p>
          ))}
        </div>
        {movie.movieDetails.genres.length > 0 && (
          <div className="border-t-[1px] border-b-[1px] border-black flex flex-row gap-4 justify-center py-6">
            {movie.movieDetails.genres.map((genre) => (
              //@ts-ignore: not entirely sure what the issue here is.
              <p>{genre}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
