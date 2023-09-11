import type { DynamoDB } from "aws-sdk";

export abstract class Item {
  abstract get pk(): string;
  abstract get sk(): string;

  public keys(): DynamoDB.DocumentClient.Key {
    return {
      PK: this.pk,
      SK: this.sk,
    };
  }

  abstract toItem(): Record<string, unknown>;
}
