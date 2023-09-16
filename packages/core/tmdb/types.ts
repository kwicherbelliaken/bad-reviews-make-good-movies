//!I should use something like this: https://blog.ah.technology/auto-generate-typescript-d-ts-from-your-api-requests-responses-4d44b9f2d138 to generate the types
type Collection = {
  id: number;
  backdrop_path: string;
  name: string;
  poster_path: string;
};

type Genre = {
  id: number;
  name: string;
};

type Company = {
  id: number;
  logo_path: string;
  name: string;
};

type Country = {
  iso_3166_1: string;
  name: string;
};

type Language = {
  iso_639_1: string;
  name: string;
};

export type Movie = {
  id: number;
  title: string;
  original_title: string;
  poster_path: string;
  adult: boolean;
  overview: string;
  release_date: string;
  genre_ids: Array<number>;
  original_language: string;
  backdrop_path: string;
  popularity: number;
  vote_count: number;
  video: boolean;
  vote_average: number;
};

export type SearchResult<T> = {
  page: number;
  results: Array<T>;
  total_results: number;
  total_pages: number;
};

export type MovieDetails = Movie & {
  belongs_to_collection: Collection;
  budget: number;
  genres: Array<Genre>;
  homepage: string;
  imdb_id: string;
  production_companies: Array<Company>;
  production_countries: Array<Country>;
  revenue: number;
  runtime: number;
  spoken_languages: Array<Language>;
  status: string;
  tagline: string;
};

/* MovieCredits Schema 
   API > https://developer.themoviedb.org/reference/movie-credits
*/

type BaseCrewOrCast = {
  adult: false;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  credit_id: string;
};

type Crew = BaseCrewOrCast & {
  department: string;
  job: string;
};

type Cast = BaseCrewOrCast & {
  cast_id: number;
  character: string;
  order: number;
};

export type MovieCredits = {
  id: number;
  cast: Array<Cast>;
  crew: Array<Crew>;
};

/* Configuration Schema 

*/

export type ConfigurationDetails = {
  images: {
    base_url: string;
    secure_base_url: string;
    backdrop_sizes: Array<`w${string}` | "original">;
    logo_sizes: Array<`w${string}` | "original">;
    poster_sizes: Array<`w${string}` | "original">;
    profile_sizes: Array<`w${string}` | `h${string}` | "original">;
    still_sizes: Array<`w${string}` | "original">;
  };
  change_keys: Array<string>;
};

export type BffListResponse = Array<
  Pick<Movie, "title" | "release_date" | "overview" | "poster_path"> & {
    cast: Array<Pick<Cast, "name" | "character">>;
  }
>;

export type BffEndpoints = {
  list: (query: string) => Promise<BffListResponse>;
};
