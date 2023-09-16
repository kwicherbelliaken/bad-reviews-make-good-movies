import { useMemo, useState } from "react";
import debounce from "debounce";
import { match } from "ts-pattern";
import type { BffListResponse } from "../../../packages/core/tmdb/types";

interface UpdateWatchlistFormProps {}

// 1. notes for CONQA
// 2. sailing notes
// 3. plan runs in hamner
// 4. plan run in taupo
// 5. plan tramp
// 6. plan cape brett tramp
// 7. drive down to kaiokoura for tramp

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
            <>
              {movies?.map((movie) => (
                <div
                  key={movie.title}
                  className="flex flex-col bg-slate-50 p-6 gap-4 border border-l-stone-400 hover:bg-slate-400"
                >
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
          ))
          .with({ status: "error" }, ({ error }) => <div>{error.message}</div>)
          .otherwise(() => null)}
      </div>
    </>
  );
};
