import type { DynamoDB } from "aws-sdk";
import { Item } from "./Base";

import client from "../core/dynamodb";

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
        ConditionExpression: "attribute_not_exists(PK)",
      }),
      client.put({
        TableName: process.env.BRMGM_TABLE_NAME!,
        Item: {
          PK: `USER#${user.username}`,
          SK: `WATCHLIST#${user.username}`,
          username: user.username,
        },
        ConditionExpression: "attribute_not_exists(PK)",
      }),
    ]);

    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getUser = async (username: string): Promise<User> => {
  const user = new User(username);

  try {
    const resp = await client.get({
      TableName: process.env.BRMGM_TABLE_NAME!,
      Key: user.keys(),
    });

    return User.fromItem(resp.Item);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
