import { handler as createUserHandler } from "../create";

import { describe, test, expect, beforeEach } from "vitest";

import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

import type { APIGatewayEventRequestContextV2 } from "aws-lambda";
import type { CreateUserEvent } from "../create";
import type { User } from "../../../packages/schema/User";
import type { Watchlist } from "../../../packages/schema/Watchlist";

const ddbMock = mockClient(DynamoDBDocumentClient);

const mockBaseEvent: CreateUserEvent = {
  // @ts-ignore: Typing for APIGatewayProxyEventV2 "body" is string.
  body: {
    username: "trial-user",
  },
};

// @ts-ignore: I don't use this currently. So, why mock it?
const mockBaseContext: APIGatewayEventRequestContextV2 = {};

describe("[handlers - POST /users/{username}]: create a user", () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  const createResponse = async (event: CreateUserEvent = mockBaseEvent) =>
    // @ts-ignore: This is a PITA. Yes, the handler will receive a legitimate APIGatewayProxyEventV2, but it only makes use of some of it (pathParameters), so it's not worth the effort to mock the entire thing.
    await createUserHandler(event, mockBaseContext);

  test("should successfully create the user (as well as associated watchlist)", async () => {
    ddbMock
      .on(PutCommand, {
        TableName: "unified-test-table",
        Item: {} as User,
        ConditionExpression: "attribute_not_exists(PK)",
      })
      .resolvesOnce({
        Attributes: {
          username: "trial-user",
        },
      })
      .on(PutCommand, {
        TableName: "unified-test-table",
        Item: {} as Watchlist,
        ConditionExpression: "attribute_not_exists(PK)",
      })
      .resolvesOnce({
        Attributes: {
          username: "trial-user",
        },
      });

    const response = await createResponse();

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body!)).toStrictEqual({
      username: "trial-user",
    });
  });

  test("should fail to create a user because it does not pass validation", async () => {
    const response = await createResponse({
      // @ts-ignore: Think "runtime". It is possible that this handler be invoked without any path parameters.
      body: {},
    });

    expect(response.statusCode).toBe(500);

    expect(JSON.parse(response.body!).error).toBe(
      "Uh oh, encountered a validation error. Error in 'body': 'username' should have been string, but got undefined."
    );
  });

  //   test.todo(
  //     "should fail to create a user because of error with DynamoDB client"
  //   );
});
