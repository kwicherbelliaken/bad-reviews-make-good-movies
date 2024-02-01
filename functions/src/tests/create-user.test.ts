import { rawHandler as createUserHandler } from "../create-user";

import "aws-sdk-client-mock-jest";
import { describe, test, expect, beforeEach, vi, expectTypeOf } from "vitest";

import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

import { User } from "../../../packages/schema/User";

import type { APIGatewayEventRequestContextV2 } from "aws-lambda";
import type { CreateUserEvent } from "../create-user";
import { Watchlist } from "../../../packages/schema/Watchlist";
import { nanoid } from "nanoid";

vi.stubEnv("BRMGM_TABLE_NAME", "unified-test-table");

const ddbMock = mockClient(DynamoDBDocumentClient);

const mockBaseEvent: CreateUserEvent = {
  headers: {
    "Content-Type": "application/json",
  },
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
    const newUser = new User(mockBaseEvent.body.username);
    const newWatchlist = new Watchlist(nanoid(), mockBaseEvent.body.username);

    ddbMock
      .on(PutCommand, {
        TableName: "unified-test-table",
        Item: newUser.toItem(),
        ConditionExpression: "attribute_not_exists(pk)",
      })
      .resolvesOnce({
        Attributes: {
          username: "trial-user",
        },
      })
      .on(PutCommand, {
        TableName: "unified-test-table",
        Item: newWatchlist.toItem(),
        ConditionExpression: "attribute_not_exists(pk)",
      })
      .resolvesOnce({
        Attributes: {
          username: "trial-user",
        },
      });

    const response = await createResponse();

    expect(response).toStrictEqual(newUser);

    expect(ddbMock).toHaveReceivedCommandTimes(PutCommand, 2);

    expect(ddbMock).toHaveReceivedNthCommandWith(1, PutCommand, {
      TableName: "unified-test-table",
      Item: newUser.toItem(),
      ConditionExpression: "attribute_not_exists(pk)",
    });

    expect(ddbMock).toHaveReceivedNthCommandWith(2, PutCommand, {
      TableName: "unified-test-table",
      //? I wonder why I haven't been able to get this to work for the specific Watchlist item.
      Item: expect.any(Object),
      ConditionExpression: "attribute_not_exists(pk)",
    });
  });

  //   test.todo(
  //     "should fail to create a user because of error with DynamoDB client"
  //   );
});
