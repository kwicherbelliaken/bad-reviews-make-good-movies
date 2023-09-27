import type { DynamoDB } from "aws-sdk";
import { Item } from "./Base";

import client from "../core/dynamodb";
import { nanoid } from "nanoid";

// [ ]: add support for a 'created date'
// [ ]: add support for an 'updated date'
// [ ]: write in a GSI1PK that extends to the user


export class Watchlist extends Item {
  id: string;
  username: string;
  createdDate: string;

  constructor(username: string) {
    super();
    this.id = nanoid();
    this.username = username;
    this.createdDate = new Date().toISOString();
  }

  static fromItem(item?: DynamoDB.DocumentClient.AttributeMap): Watchlist {
    if (!item) throw new Error("No item!");
    if (item.username == null) throw new Error("No username!");

    return new Watchlist(item.username);
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
      id: this.id,
      gsi1pk: this.gsi1pk,
      gsi1sk: this.gsi1sk,
      createdDate: this.createdDate,
    };
  }
}




export const createWatchlist = async (watchlist: Watchlist): Promise<Watchlist> => {
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
}
