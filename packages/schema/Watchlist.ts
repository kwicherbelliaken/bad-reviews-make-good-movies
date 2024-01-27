import type { DynamoDB } from "aws-sdk";
import { GSIItem } from "./Base";

import client from "../core/dynamodb";
import { Movie, isMovie } from "./Movie";

// [ ]: add support for a 'created date'
// [ ]: add support for an 'updated date'
// [ ]: write in a GSI1PK that extends to the user

export class Watchlist extends GSIItem {
  id: string;
  username: string;
  createdDate: string;

  constructor(id: string, username: string) {
    super();
    this.id = id;
    this.username = username;
    this.createdDate = new Date().toISOString();
  }

  static fromItem(item?: DynamoDB.DocumentClient.AttributeMap): Watchlist {
    if (!item) throw new Error("No item!");
    if (item.username == null) throw new Error("No username!");

    return new Watchlist(item.id, item.username);
  }

  get pk(): string {
    return `USER#${this.username}`;
  }

  get sk(): string {
    return `WATCHLIST#${this.username}`;
  }

  get gsi1pk(): string {
    return `USER#${this.username}#WATCHLIST#${this.id}`;
  }

  get gsi1sk(): string {
    return `WATCHLIST#${this.id}`;
  }

  toItem(): Record<string, unknown> {
    return {
      ...this.keys(),
      ...this.gsiKeys(),
      id: this.id,
      username: this.username,
      createdDate: this.createdDate,
    };
  }
}

export const createWatchlist = async (
  watchlist: Watchlist
): Promise<Watchlist> => {
  try {
    await client.put({
      TableName: process.env.BRMGM_TABLE_NAME!,
      Item: watchlist.toItem(),
      ConditionExpression: "attribute_not_exists(PK)",
    });

    return watchlist;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getWatchlistMovies = async (
  watchlist: Watchlist
): Promise<Movie[]> => {
  try {
    const result = await client.query({
      TableName: process.env.BRMGM_TABLE_NAME!,
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1PK = :gsi1pk",
      ExpressionAttributeValues: {
        ":gsi1pk": watchlist.gsi1pk,
      },
    });

    if (result.Items == null || result.Count === 0) {
      console.info(
        `No movies were found for user ${watchlist.username} with watchlist ${watchlist.id}`
      );

      return [];
    }

    return result.Items.filter(isMovie).map((item) => Movie.fromItem(item));
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const findMovieInWatchlist = async (
  movieTitle: string,
  watchlist: Watchlist
) => {
  try {
    const result = await client.query({
      TableName: process.env.BRMGM_TABLE_NAME!,
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1PK = :gsi1pk",
      FilterExpression: "movieDetails.title = :title",
      ExpressionAttributeValues: {
        ":gsi1pk": watchlist.gsi1pk,
        ":title": movieTitle,
      },
    });

    if (result.Items == null || result.Count === 0) {
      console.info(
        `No movie titled ${movieTitle} was found for user ${watchlist.username} with watchlist ${watchlist.id}`
      );

      return [];
    }

    return result.Items.filter(isMovie).map((item) => Movie.fromItem(item));
  } catch (error) {
    console.error(error);
    throw error;
  }
};
