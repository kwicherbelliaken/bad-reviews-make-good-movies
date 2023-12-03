import { SearchInput } from "./SearchMovie/SearchInput";
import { SearchResults } from "./SearchMovie/SearchResult";
import { useSearchMovies } from "./SearchMovie/hooks/query";

interface SearchMoviesProps {}

export const SearchMovies = ({}: SearchMoviesProps) => {
  const { value, result, search } = useSearchMovies();

  return (
    <div className="min-w-[30%] h-full p-4">
      <h1>Search</h1>
      <div className="flex flex-col gap-4 h-full">
        <SearchInput value={value} search={search} />
        <SearchResults result={result} />
      </div>
    </div>
  );
};
