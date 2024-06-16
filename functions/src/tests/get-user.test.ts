import { rawHandler as getUserHandler, type GetUserEvent } from "../get";

import "aws-sdk-client-mock-jest";
import { describe, test, expect, beforeEach, vi } from "vitest";

import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

import type { APIGatewayEventRequestContextV2 } from "aws-lambda";
import { User } from "../../../packages/schema/User";
import { Watchlist } from "../../../packages/schema/Watchlist";

vi.stubEnv("BRMGM_TABLE_NAME", "unified-test-table");

const ddbMock = mockClient(DynamoDBDocumentClient);

const mockBaseEvent: GetUserEvent = {
  pathParameters: {
    username: "trial-user",
  },
};

// @ts-ignore: I don't use this currently. So, why mock it?
const mockBaseContext: APIGatewayEventRequestContextV2 = {};

describe("[handlers - GET /users/{username}]: get a user", () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  const getResponse = async (event: GetUserEvent = mockBaseEvent) =>
    // @ts-ignore: This is a PITA. Yes, the handler will receive a legitimate APIGatewayProxyEventV2, but it only makes use of some of it (pathParameters), so it's not worth the effort to mock the entire thing.
    await getUserHandler(event, mockBaseContext);

  test("should successfully return the user when passed a `username` for an existing user", async () => {
    const mockUser = new User(mockBaseEvent.pathParameters.username);

    ddbMock
      .on(GetCommand, {
        TableName: "unified-test-table",
        Key: mockUser.keys(),
      })
      .resolves({
        Item: {
          pk: "USER#trial-user",
          sk: "USER#trial-user",
          username: "trial-user",
        },
      });

    const response = await getResponse();

    expect(response).toEqual(mockUser);

    expect(ddbMock).toHaveReceivedCommandTimes(GetCommand, 1);

    expect(ddbMock).toHaveReceivedCommandWith(GetCommand, {
      TableName: "unified-test-table",
      Key: mockUser.keys(),
    });
  });

  test("successfully returns a user and watchlist details when appropriate flag is passed", async () => {
    const mockUser = new User(mockBaseEvent.pathParameters.username);
    const mockAssociatedWatchlist = new Watchlist(
      "placeholder-id",
      mockUser.username
    );

    const mockExpectedResponse = {
      ...mockUser,
      // NB: The watchlistId is generated on the fly, so we can't predict it.
      watchlistId: expect.any(String),
    };

    ddbMock
      .on(GetCommand, {
        TableName: "unified-test-table",
        Key: mockUser.keys(),
      })
      .resolves({
        Item: {
          pk: "USER#trial-user",
          sk: "USER#trial-user",
          username: "trial-user",
        },
      })
      .on(GetCommand, {
        TableName: "unified-test-table",
        Key: mockAssociatedWatchlist.keys(),
      })
      .resolves({
        Item: {
          pk: "USER#trial-user",
          sk: "WATCHLIST#trial-user",
          username: "trial-user",
          id: "72a72e6e-eb8d-492f-b2dd-12169fe2c5c8",
          gsi1pk:
            "USER#trial-user#WATCHLIST#72a72e6e-eb8d-492f-b2dd-12169fe2c5c8",
        },
      });

    const response = await getResponse({
      ...mockBaseEvent,
      queryStringParameters: { resolveWatchlist: "true" },
    });

    expect(response).toEqual(mockExpectedResponse);

    expect(ddbMock).toHaveReceivedCommandTimes(GetCommand, 2);

    expect(ddbMock).toHaveReceivedNthCommandWith(1, GetCommand, {
      TableName: "unified-test-table",
      Key: mockUser.keys(),
    });

    expect(ddbMock).toHaveReceivedNthCommandWith(2, GetCommand, {
      TableName: "unified-test-table",
      Key: mockAssociatedWatchlist.keys(),
    });
  });

  test.todo(
    "should fail to return a user because of error with DynamoDB client"
  );
});
