import type { DynamoDB } from "aws-sdk";

export abstract class Item {
  abstract get pk(): string;
  abstract get sk(): string;

  public keys(): DynamoDB.DocumentClient.Key {
    return {
      pk: this.pk,
      sk: this.sk,
    };
  }

  abstract toItem(): Record<string, unknown>;
}

export abstract class GSIItem extends Item {
  abstract get gsi1pk(): string;
  abstract get gsi1sk(): string;

  public gsiKeys(): DynamoDB.DocumentClient.Key {
    return {
      gsi1pk: this.gsi1pk,
      gsi1sk: this.gsi1sk,
    };
  }
}
