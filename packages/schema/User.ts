import type { DynamoDB } from "aws-sdk";
import { Item } from "./Base";

import client from "../core/dynamodb";
import { Watchlist } from "./Watchlist";
import { nanoid } from "nanoid";

export class User extends Item {
  username: string;

  constructor(username: string) {
    super();
    this.username = username;
  }

  static fromItem(item?: DynamoDB.DocumentClient.AttributeMap): User {
    if (!item) throw new Error("No item!");
    if (item.username == null) throw new Error("No username!");

    return new User(item.username);
  }

  get pk(): string {
    return `USER#${this.username}`;
  }

  get sk(): string {
    return `USER#${this.username}`;
  }

  toItem(): Record<string, unknown> {
    return {
      ...this.keys(),
      username: this.username,
    };
  }
}

export const createUser = async (user: User): Promise<User> => {
  try {
    await Promise.all([
      client.put({
        TableName: process.env.BRMGM_TABLE_NAME!,
        Item: user.toItem(),
        ConditionExpression: "attribute_not_exists(pk)",
      }),
      client.put({
        TableName: process.env.BRMGM_TABLE_NAME!,
        Item: new Watchlist(nanoid(), user.username).toItem(),
        ConditionExpression: "attribute_not_exists(pk)",
      }),
    ]);

    return user;
  } catch (error) {
    // [ ] improve the error handling, this happened when trying to add a user of the same username.
    // {
    //   "error": "The conditional request failed"
    // }
    console.log(error);
    throw error;
  }
};

export const getUser = async (
  username: string,
  resolveWatchlist: boolean
): Promise<User & { watchlistId?: Pick<Watchlist, "id"> }> => {
  const user = new User(username);

  try {
    let response;

    const resp = await client.get({
      TableName: process.env.BRMGM_TABLE_NAME!,
      Key: user.keys(),
    });

    const userResponse = User.fromItem(resp.Item);

    if (resolveWatchlist) {
      const watchlistResponse = await client.get({
        TableName: process.env.BRMGM_TABLE_NAME!,
        Key: new Watchlist("", username).keys(),
      });

      console.log("logging here", JSON.stringify(watchlistResponse.Item));

      const watchlist = Watchlist.fromItem(watchlistResponse.Item);

      response = { ...userResponse, watchlistId: watchlist.id };
    } else {
      response = userResponse;
    }

    return response;

    // [ ] filter out the watchlist from the actual user
  } catch (error) {
    console.error(error);
    throw error;
  }
};
