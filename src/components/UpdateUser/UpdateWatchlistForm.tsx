import { useMemo, useState } from "react";
import debounce from "debounce";
import { match } from "ts-pattern";
import type { BffListResponse } from "../../../packages/core/tmdb/types";

interface UpdateWatchlistFormProps {}

// [ ]: implement proper error handling
const searchMovies = async (query: string) => {
  const queryParams = new URLSearchParams({
    query,
  });

  const response = await fetch(
    "https://dz76rj93fd.execute-api.ap-southeast-2.amazonaws.com/search?" +
      queryParams,
    {
      method: "GET",
    }
  );

  const results = await response.json();

  return results;
};

const useSearchMovies = () => {
  const [value, setValue] = useState("");

  const [result, setResult] = useState<
    | { status: "success"; data: BffListResponse }
    | { status: "error"; error: Error }
    | { status: "idle" }
    | { status: "loading" }
  >({
    status: "idle",
  });

  const handleOnChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);

    debouncedSearch(event.target.value);
  };

  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        // [ ]: use dev tools to return an error
        setResult({ status: "loading" });

        try {
          const results = await searchMovies(query);

          setResult({ status: "success", data: results });
        } catch (error) {
          setResult({ status: "error", error: error as unknown as Error });
        }
      }, 500),
    []
  );

  return {
    value,
    result: result,
    search: handleOnChange,
  };
};

const useAddMovieToWatchlist = () => {
  const [result, setResult] = useState<
    | { status: "success" }
    | { status: "error"; error: Error }
    | { status: "idle" }
    | { status: "loading" }
  >({
    status: "idle",
  });

  const addMovieToWatchlist = async (payload: any) => {
    setResult({ status: "loading" });

    try {
      const response = await fetch(
        "https://hh2877m7a0.execute-api.ap-southeast-2.amazonaws.com/movies",
        {
          method: "POST",
          body: JSON.stringify({
            username: "trial-user",
            watchlistId: "8JWw9ZPsUtkD-14h0Fnzs",
            payload,
          }),
        }
      );

      // NB: Critically important to actually read the response body. If we don't
      // Node Fetch leaks connections: https://github.com/node-fetch/node-fetch/issues/499
      const body = await response.json();

      if (response.status !== 200 || !response.ok) {
        throw new Error(body.error);
      }

      setResult({ status: "success" });
    } catch (error) {
      setResult({ status: "error", error: error as unknown as Error });
    }
  };

  return {
    result: result,
    addMovieToWatchlist,
  };
};

export const UpdateWatchlistForm = ({}: UpdateWatchlistFormProps) => {
  const { value, result, search } = useSearchMovies();

  return (
    <>
      <div>
        <input type="text" value={value} onChange={search} />
      </div>
      <div>
        {match(result)
          .with({ status: "loading" }, () => <div>loading...</div>)
          .with({ status: "success" }, ({ data: movies }) => (
            <Movies movies={movies} />
          ))
          .with({ status: "error" }, ({ error }) => <div>{error.message}</div>)
          .otherwise(() => null)}
      </div>
    </>
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

    await addMovieToWatchlist(payload);
  };

  return (
    <>
      {match(result)
        .with({ status: "loading" }, () => <div>loading...</div>)
        .with({ status: "error" }, ({ error }) => (
          <div id={movie.title} className="p-6" onClick={handleOnClick}>
            <div className="text-white bg-red-400">{error.message}</div>
            <div>{movie.title}</div>
            <div>{movie.release_date}</div>
            <div>{movie.overview}</div>
            {movie.cast.map((cast) => {
              return (
                <div>
                  <div>
                    {cast.name} as {cast.character}
                  </div>
                </div>
              );
            })}
          </div>
        ))
        .otherwise(() => (
          <div id={movie.title} className="p-6" onClick={handleOnClick}>
            <div>{movie.title}</div>
            <div>{movie.release_date}</div>
            <div>{movie.overview}</div>
            {movie.cast.map((cast) => {
              return (
                <div>
                  <div>
                    {cast.name} as {cast.character}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
    </>
  );
};

const Movies = ({ movies }: { movies: BffListResponse }) => {
  return (
    <div>
      {movies?.map((movie, index) => (
        <div
          key={`${movie.title}-${index}`}
          className="flex flex-col bg-slate-50 gap-4 border border-l-stone-400 hover:bg-slate-400 cursor-pointer"
        >
          <Movie movie={movie} movies={movies} />
        </div>
      ))}
    </div>
  );
};
