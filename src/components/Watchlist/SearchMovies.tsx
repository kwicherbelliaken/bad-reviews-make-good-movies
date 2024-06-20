import { SearchInput } from "./SearchMovie/SearchInput";
import { SearchResults } from "./SearchMovie/SearchResult";
import { useSearchMovies } from "./SearchMovie/hooks/query";

interface SearchMoviesProps {}

const gridClassNames = "col-span-2";

export const SearchMovies = ({}: SearchMoviesProps) => {
  const { value, result, search } = useSearchMovies();

  return (
    <div
      className={`h-full p-4 flex flex-col gap-4 col-span-2 ${gridClassNames}`}
    >
      <h1>Search</h1>

      <SearchInput value={value} search={search} />
      <SearchResults result={result} />
    </div>
  );
};
