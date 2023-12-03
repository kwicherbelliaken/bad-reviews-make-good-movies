import { match } from "ts-pattern";
import { LoadingSpinner } from "../../LoadingSpinner/LoadingSpinner";
import { Casette } from "../VHSCasette/Casette";

import type { BffListResponse } from "../../../../packages/core/tmdb/types";
import { useAddMovieToWatchlist } from "./hooks/mutation";
import type { useSearchMovies } from "./hooks/query";

const MovieContent = ({
  movie,
  children,
  onClick,
}: React.PropsWithChildren<{
  movie: BffListResponse[0];
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
}>) => {
  return (
    <div className="p-6 bg-slate-50 border rounded-lg">
      <div className="flex flex-row relative">
        <div id={movie.title} className="flex flex-col">
          <div className="flex flex-row justify-between">
            <h2>{movie.title}</h2>

            <div
              id={movie.title}
              className="absolute right-0 top-0 flex gap-4"
              onClick={onClick}
            >
              {children}
            </div>
          </div>

          <h4>{movie.release_date}</h4>
          <p>{movie.overview}</p>
          <div className="flex flex-col py-10 gap-2">
            {movie.cast.map((cast) => {
              return (
                <p>
                  <strong>{cast.name}</strong> as {cast.character}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const Movie = ({
  movie,
  movies,
}: {
  movie: BffListResponse[0];
  movies: BffListResponse;
}) => {
  const { result, addMovieToWatchlist } = useAddMovieToWatchlist();

  const handleOnClick = async (event: React.MouseEvent<HTMLElement>) => {
    const payload = movies.find(
      (movie) => movie.title === event.currentTarget.id
    );

    if (payload == null) {
      throw new Error(
        "Weirdly, the movie you clicked on is not in the list of movies."
      );
    }

    // [ ] I need proper error handling in the event that the movie is already on the watchlist

    addMovieToWatchlist(payload);
  };

  return (
    <>
      {match(result)
        .with({ status: "loading" }, () => (
          <MovieContent movie={movie} onClick={handleOnClick}>
            <LoadingSpinner />
          </MovieContent>
        ))
        .with({ status: "error" }, ({ error }) => (
          <MovieContent movie={movie} onClick={handleOnClick}>
            <span
              className="text-4xl cursor-pointer before:content-[' '] before:hover:shadow-[18px_0_40px_20px_#E65438] after:content-[attr(data-hover)] after:opacity-0 after:bg-red-400 after:bg-opacity-30 after:outline after:outline-red-500 after:rounded-lg after:p-1 after:px-2 hover:after:visible hover:after:opacity-100 after:text-sm after:whitespace-nowrap after:text-white after:transition-opacity after:duration-750 after:ease-in-out after:delay-75 after:invisible after:absolute after:top-8"
              data-hover={error.message}
              role="img"
              aria-label="eyes"
            >
              🥹
            </span>
          </MovieContent>
        ))
        .otherwise(() => (
          <MovieContent movie={movie} onClick={handleOnClick}>
            <span
              className="text-4xl cursor-pointer before:content-[' '] before:hover:shadow-[18px_0_40px_20px_#defe56]"
              role="img"
              aria-label="eyes"
            >
              👀
            </span>
          </MovieContent>
        ))}
    </>
  );
};

const Movies = ({ movies }: { movies: BffListResponse }) => {
  return (
    <div className="flex flex-col gap-4 drop-shadow-md">
      {movies?.map((movie, index) => (
        <Movie key={`${movie.title}-${index}`} movie={movie} movies={movies} />
      ))}
    </div>
  );
};

interface SearchResultsProps {
  result: ReturnType<typeof useSearchMovies>["result"];
}

export const SearchResults = ({ result }: SearchResultsProps) => (
  <>
    {match(result)
      .with({ status: "loading" }, () => (
        <div className="h-full w-full text-center relative overflow-hidden">
          <div className="absolute top-[50%] left-[50%] -translate-y-1/2 -translate-x-1/2">
            <Casette />
          </div>
          <div className="h-full animate-ping bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-100 to-teal-100" />
        </div>
      ))
      .with({ status: "success" }, ({ data }) => <Movies movies={data} />)
      .with({ status: "error" }, ({ error }) => <div>{error.message}</div>)
      .otherwise(() => null)}
  </>
);
