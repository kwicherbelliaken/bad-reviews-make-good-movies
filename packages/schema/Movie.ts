import type { DynamoDB } from "aws-sdk";
import { GSIItem } from "./Base";

import client from "../core/dynamodb";
import type { BffListResponse } from "../core/tmdb/types";
import { z } from "zod";

export type MovieDetails = BffListResponse[0];

const movieDetailsSchema = z.object({
  title: z.string(),
  poster_path: z.string(),
  overview: z.string(),
  release_date: z.string(),
  genres: z.array(
    z.object({
      name: z.string(),
    })
  ),
  cast: z.array(
    z.object({
      name: z.string(),
      character: z.string(),
    })
  ),
});

export const movieSchema = z.object({
  id: z.string(),
  username: z.string(),
  watchlistId: z.string(),
  movieDetails: movieDetailsSchema,
});

export class Movie extends GSIItem {
  id: string;
  username: string;
  watchlistId: string;
  movieDetails: MovieDetails;

  constructor(
    id: string,
    username: string,
    watchlistId: string,
    movieDetails: MovieDetails
  ) {
    super();
    this.id = id;
    this.username = username;
    this.watchlistId = watchlistId;
    this.movieDetails = movieDetails;
  }

  static fromItem(item?: DynamoDB.DocumentClient.AttributeMap): Movie {
    if (!item) throw new Error("No Movie item resolved!");

    try {
      movieSchema.parse(item);

      const { id, username, watchlistId, movieDetails } = item;

      return new Movie(id, username, watchlistId, movieDetails);
    } catch (error) {
      throw new Error(
        `There was an error resolving Movie from DynamoDB: ${error}`
      );
    }
  }

  get pk(): string {
    return `MOVIE#${this.id}`;
  }

  get sk(): string {
    return `MOVIE#${this.id}`;
  }

  get gsi1pk(): string {
    return `USER#${this.username}#WATCHLIST#${this.watchlistId}`;
  }

  get gsi1sk(): string {
    return `MOVIE#${this.id}`;
  }

  toItem(): Record<string, unknown> {
    return {
      ...this.keys(),
      ...this.gsiKeys(),
      id: this.id,
      username: this.username,
      watchlistId: this.watchlistId,
      movieDetails: this.movieDetails,
    };
  }
}

export const deleteMovie = async (movieId: string) => {
  try {
    // [ ] figure out how I can resolve the keys without needing to establish a Movie item

    await client.delete({
      TableName: process.env.BRMGM_TABLE_NAME!,
      Key: {
        PK: `MOVIE#${movieId}`,
        SK: `MOVIE#${movieId}`,
      },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createMovie = async (movie: Movie): Promise<Movie> => {
  try {
    const existingMovieEntry = await client.query({
      TableName: process.env.BRMGM_TABLE_NAME!,
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1PK = :gsi1pk",
      FilterExpression: "movieDetails.title = :title",
      ExpressionAttributeValues: {
        ":title": movie.movieDetails.title,
        ":gsi1pk": movie.gsi1pk,
      },
      ProjectionExpression: "pk",
    });

    // [ ] figure out a better way to handle this validation
    if (existingMovieEntry.Count !== 0) {
      throw new Error(`The Movie ${movie.movieDetails.title} already exists!`);
    }

    await client.put({
      TableName: process.env.BRMGM_TABLE_NAME!,
      Item: movie.toItem(),
      ConditionExpression: "attribute_not_exists(pk)",
    });

    return movie;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const isMovie = (
  item: DynamoDB.DocumentClient.AttributeMap
): item is Movie => {
  return item.pk.startsWith("MOVIE#");
};
