import type { DynamoDB } from "aws-sdk";
import { GSIItem } from "./Base";

import client from "../core/dynamodb";
import { nanoid } from "nanoid";
import type { BffListResponse } from "../core/tmdb/types";

export type MovieDetails = BffListResponse[0];

export class Movie extends GSIItem {
  id: string;
  username: string;
  watchlistId: string;
  movieDetails: MovieDetails;

  constructor(
    username: string,
    watchlistId: string,
    movieDetails: MovieDetails,
    id?: string
  ) {
    super();
    this.id = id ?? nanoid();
    this.username = username;
    this.watchlistId = watchlistId;
    this.movieDetails = movieDetails;
  }

  static fromItem(item?: DynamoDB.DocumentClient.AttributeMap): Movie {
    if (!item) throw new Error("No item!");
    if (item.username == null) throw new Error("No username!");
    if (item.watchlistId == null) throw new Error("No watchlistId!");
    if (item.movieDetails == null) throw new Error("No movieDetails!");

    return new Movie(
      item.username,
      item.watchlistId,
      item.movieDetails,
      item.id
    );
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
  return item.PK.startsWith("MOVIE#");
};
