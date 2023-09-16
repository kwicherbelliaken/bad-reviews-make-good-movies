import fetch from "node-fetch";
import type {
  BffEndpoints,
  ConfigurationDetails,
  Movie,
  MovieCredits,
  MovieDetails,
  SearchResult,
} from "./types";

const movieApi = {
  details: async (movieId: string): Promise<MovieDetails> => {
    const response = await fetch(
      `${process.env.TMDB_API_BASE_URL}/movie/${movieId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.TMDB_API_READ_ACCESS_TOKEN}`,
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
          Authorization: `Bearer ${process.env.TMDB_API_READ_ACCESS_TOKEN}`,
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
          Authorization: `Bearer ${process.env.TMDB_API_READ_ACCESS_TOKEN}`,
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
    baseUrl: string,
    fileSize: string,
    posterPath: string
  ): Promise<unknown> => {
    const response = await fetch(`${baseUrl}${fileSize}/${posterPath}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TMDB_API_READ_ACCESS_TOKEN}`,
      },
    });

    // [ ]: what do I get back?
    const result = await response.json();

    return result;
  },
};

const configurationApi = {
  details: async (): Promise<ConfigurationDetails> => {
    const response = await fetch(
      `${process.env.TMDB_API_BASE_URL}/configuration`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.TMDB_API_READ_ACCESS_TOKEN}`,
        },
      }
    );

    const result = (await response.json()) as unknown as ConfigurationDetails;

    return result;
  },
};

const bffEndpoints: BffEndpoints = {
  list: async (query: string) => {
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

    //! use Theos video on Promise.allSettled
    const movieCredits = await Promise.all(
      movies.map(async (movie) => {
        const credits = await movieApi.credits(movie.id.toString());

        return credits;
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
    }));

    return response;
  },
};

export default {
  bffEndpoints,
};
