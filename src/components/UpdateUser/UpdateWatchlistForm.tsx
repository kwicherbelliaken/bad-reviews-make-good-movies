import { useState } from "react";

interface UpdateWatchlistFormProps {}

// [ ]: typing in here should make a request to the movie api
export const UpdateWatchlistForm = ({}: UpdateWatchlistFormProps) => {
  const [value, setValue] = useState("");
  const [movies, setMovies] = useState([]);

  const handleOnChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);

    if (event.target.value === "transformers") {
      const queryParams = new URLSearchParams({
        query: event.target.value,
      });

      // [ ]: make a request to the movie api

      const response = await fetch(
        "https://dz76rj93fd.execute-api.ap-southeast-2.amazonaws.com/search?" +
          queryParams,
        {
          method: "GET",
        }
      );

      // [ ]: do some error handling
      setMovies(await response.json());
    }
  };

  return (
    <>
      <div>
        <input type="text" value={value} onChange={handleOnChange} />
      </div>
      <div>
        {movies.map((movie) => (
          <div
            key={movie.id}
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
      </div>
    </>
  );
};
