import fetch from "node-fetch";
import type {
  BffEndpoints,
  ConfigurationDetails,
  Movie,
  MovieCredits,
  MovieDetails,
  SearchResult,
} from "./types";
import { Config } from "sst/node/config";

// @ts-ignore: We know that we set this secret on the Config in the ApiStack.
const ACCESS_KEY = Config.TMDB_API_READ_ACCESS_TOKEN;

const movieApi = {
  details: async (movieId: string): Promise<MovieDetails> => {
    const response = await fetch(
      `${process.env.TMDB_API_BASE_URL}/movie/${movieId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ACCESS_KEY}`,
        },
      }
    );

    const result = (await response.json()) as unknown as MovieDetails;

    return result;
  },
  credits: async (movieId: string): Promise<MovieCredits> => {
    const response = await fetch(
      `${process.env.TMDB_API_BASE_URL}/movie/${movieId}/credits`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ACCESS_KEY}`,
        },
      }
    );

    const result = (await response.json()) as unknown as MovieCredits;

    return result;
  },
};

const searchApi = {
  movies: async (query: string, page = 1): Promise<Movie[]> => {
    const response = await fetch(
      `${process.env.TMDB_API_BASE_URL}/search/movie?query=${query}&page=${page}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ACCESS_KEY}`,
        },
      }
    );

    const { results } =
      (await response.json()) as unknown as SearchResult<Movie>;

    return results;
  },
};

const imageApi = {
  poster: async (
    fileSize: `w${string}`,
    posterPath: string
  ): Promise<unknown> => {
    const {
      images: { base_url: imageUrl, poster_sizes },
    } = await configurationApi.details();

    if (!poster_sizes.includes(fileSize)) {
      throw new Error(
        `Invalid file size ${fileSize}. Valid file sizes are: ${poster_sizes.join(
          ", "
        )}`
      );
    }

    const posterUrl = `${imageUrl}/t/p/${fileSize}/${posterPath}`;

    return posterUrl;
  },
};

const configurationApi = {
  details: async (): Promise<ConfigurationDetails> => {
    // @ts-ignore: We know that we set this secret on the Config in the ApiStack.
    const ACCESS_KEY = Config.TMDB_API_READ_ACCESS_TOKEN;

    const response = await fetch(
      `${process.env.TMDB_API_BASE_URL}/configuration`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ACCESS_KEY}`,
        },
      }
    );

    const result = (await response.json()) as unknown as ConfigurationDetails;

    return result;
  },
};

const bffEndpoints: BffEndpoints = {
  list: async (query) => {
    // [x]: search for movies
    // [x]: get the credits for each movie
    // [ ]: get the images for each movie?

    const movies = await searchApi.movies(query);

    //! off of movies
    // we want the "title"
    // we want the "release_date"
    // we want the "overview"
    // we want the "poster_path"

    //! off of credits
    // first two entries for cast

    // [ ] figure out how I can make this more performant

    // [ ] use Theos video on Promise.allSettled
    const movieCredits = await Promise.all(
      movies.map(async (movie) => {
        const credits = await movieApi.credits(movie.id.toString());
        const details = await movieApi.details(movie.id.toString());

        return credits;
      })
    );

    const movieGenres = await Promise.all(
      movies.map(async (movie) => {
        const details = await movieApi.details(movie.id.toString());

        return details.genres.map((genre) => genre.name);
      })
    );

    const response = movies.map((movie, index) => ({
      title: movie.title,
      release_date: movie.release_date,
      overview: movie.overview,
      poster_path: movie.poster_path,
      cast: movieCredits[index].cast.slice(0, 2).map((cast) => ({
        name: cast.name,
        character: cast.character,
      })),
      genres: movieGenres[index],
    }));

    return response;
  },
  image: async (fileSize, posterPath) => {
    const imageUrl = await imageApi.poster(fileSize, posterPath);

    return imageUrl;
  },
};

export default {
  bffEndpoints,
};
