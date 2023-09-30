import type { DynamoDB } from "aws-sdk";
import { Item } from "./Base";

import client from "../core/dynamodb";
import { nanoid } from "nanoid";
import type { BffListResponse } from "../core/tmdb/types";

type MovieDetails = BffListResponse[0];

export class Movie extends Item {
  id: string;
  username: string;
  watchlistId: string;
  movieDetails: MovieDetails;

  constructor(
    username: string,
    watchlistId: string,
    movieDetails: MovieDetails
  ) {
    super();
    this.id = nanoid();
    this.username = username;
    this.watchlistId = watchlistId;

    this.movieDetails = movieDetails;
  }

  static fromItem(item?: DynamoDB.DocumentClient.AttributeMap): Movie {
    if (!item) throw new Error("No item!");
    if (item.username == null) throw new Error("No username!");
    if (item.watchlistId == null) throw new Error("No watchlistId!");

    return new Movie(item.username, item.watchlistId, {} as MovieDetails);
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
      id: this.id,
      gsi1pk: this.gsi1pk,
      gsi1sk: this.gsi1sk,
      movieDetails: this.movieDetails,
    };
  }
}

export const createMovie = async (movie: Movie): Promise<Movie> => {
  try {
    const existingMovieEntry = await client.scan({
      TableName: process.env.BRMGM_TABLE_NAME!,
      FilterExpression: "movieDetails.title = :title AND gsi1pk = :gsi1pk",
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
