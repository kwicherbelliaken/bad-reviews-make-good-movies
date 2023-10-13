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

export abstract class GSIItem extends Item {
  abstract get gsi1pk(): string;
  abstract get gsi1sk(): string;

  public gsiKeys(): DynamoDB.DocumentClient.Key {
    return {
      GSI1PK: this.gsi1pk,
      GSI1SK: this.gsi1sk,
    };
  }
}
