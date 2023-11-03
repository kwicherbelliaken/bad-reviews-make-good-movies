import { useMemo, useState } from "react";
import debounce from "debounce";
import { match } from "ts-pattern";
import type { BffListResponse } from "../../../packages/core/tmdb/types";
import { Casette } from "./VHSCasette/Casette";

const mockPayload = [
  {
    title: "Bee Movie",
    release_date: "2007-10-28",
    overview:
      "Barry B. Benson, a bee who has just graduated from college, is disillusioned at his lone career choice: making honey. On a special trip outside the hive, Barry's life is saved by Vanessa, a florist in New York City. As their relationship blossoms, he discovers humans actually eat honey, and subsequently decides to sue us.",
    poster_path: "/1xlHV0AMoXQAOPAZXLQgq39tRCJ.jpg",
    cast: [
      { name: "Jerry Seinfeld", character: "Barry B. Benson (voice)" },
      { name: "Renée Zellweger", character: "Vanessa Bloome (voice)" },
    ],
    genres: ["Family", "Animation", "Adventure", "Comedy"],
  },
  {
    title: "Maya the Bee Movie",
    release_date: "2014-09-11",
    overview:
      "Freshly hatched bee Maya is a little whirlwind and won't follow the rules of the hive. One of these rules is not to trust the hornets that live beyond the meadow. When the Royal Jelly is stolen, the hornets are suspected and Maya is thought to be their accomplice. No one believes that she is the innocent victim and no one will stand by her except for her good-natured and best friend Willy. After a long and eventful journey to the hornets hive Maya and Willy soon discover the true culprit and the two friends finally bond with the other residents of the opulent meadow.",
    poster_path: "/pMQ88CvnQroSjxk4IhM7YNbcjTx.jpg",
    cast: [
      { name: "Coco Jack Gillies", character: "Maya (voice)" },
      { name: "Kodi Smit-McPhee", character: "Willy (voice)" },
    ],
    genres: ["Family", "Animation"],
  },
];

interface SearchMoviesProps {}

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

export const SearchMovies = ({}: SearchMoviesProps) => {
  const { value, result, search } = useSearchMovies();

  return (
    <div className="flex flex-col gap-4 h-full">
      <div>
        <input
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          type="text"
          value={value}
          onChange={search}
        />
      </div>
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
          .with({ status: "idle" }, ({ data }) => (
            <Movies movies={mockPayload} />
          ))
          .with({ status: "error" }, ({ error }) => <div>{error.message}</div>)
          .otherwise(() => null)}
      </>
    </div>
  );
};

//? the movie content should remain unchanged whether we click on something or not
//? MovieDetails
//? Buttons
//? if it has children then it cannot be memoised

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

    await addMovieToWatchlist(payload);
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
          <div id={movie.title} className="p-6">
            <div>{error.message}</div>
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
          <MovieContent movie={movie} onClick={handleOnClick}>
            <div
              id={movie.title}
              className="absolute right-0 top-0 flex gap-4"
              onClick={handleOnClick}
            >
              <span
                className="text-4xl cursor-pointer before:content-[' '] before:hover:shadow-[18px_0_40px_20px_#defe56]"
                role="img"
                aria-label="eyes"
              >
                👀
              </span>
            </div>
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

const LoadingSpinner = () => (
  <div role="status">
    <svg
      aria-hidden="true"
      className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
      viewBox="0 0 100 101"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
        fill="currentColor"
      />
      <path
        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
        fill="currentFill"
      />
    </svg>
    <span className="sr-only">Loading...</span>
  </div>
);
