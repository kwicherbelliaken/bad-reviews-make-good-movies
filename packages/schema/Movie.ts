import type { DynamoDB } from "aws-sdk";
import { Item } from "./Base";

import client from "../core/dynamodb";
import { nanoid } from "nanoid";
import type { BffListResponse } from "../core/tmdb/types";

// [ ]: add support for a 'created date'
// [ ]: add support for an 'updated date'
// [ ]: write in a GSI1PK that extends to the user

export class Movie extends Item {
  id: string;
  username: string;
  watchlistId: string;
  movieDetails: BffListResponse;

  constructor(
    username: string,
    watchlistId: string,
    movieDetails: BffListResponse
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

    return new Movie(item.username, item.watchlistId, {} as BffListResponse);
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

// [ ] want to ensure that I can't add the same movie to the watchlist
// [ ] want to ensure that I can search by genre

export const createMovie = async (movie: Movie): Promise<Movie> => {
  try {
    await client.put({
      TableName: process.env.BRMGM_TABLE_NAME!,
      Item: movie.toItem(),
      ConditionExpression: "attribute_not_exists(PK)",
    });

    return movie;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
