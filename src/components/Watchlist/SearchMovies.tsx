import { SearchInput } from "./SearchMovie/SearchInput";
import { SearchResults } from "./SearchMovie/SearchResult";
import { useSearchMovies } from "./SearchMovie/hooks/query";

interface SearchMoviesProps {}

export const SearchMovies = ({}: SearchMoviesProps) => {
  const { value, result, search } = useSearchMovies();

  return (
    <div className="w-[30%] h-full p-4 flex flex-col gap-4">
      <h1>Search</h1>

      <SearchInput value={value} search={search} />
      <SearchResults result={result} />
    </div>
  );
};
