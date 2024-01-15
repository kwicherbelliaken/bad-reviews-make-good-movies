import { rawHandler as getUserHandler, type GetUserEvent } from "../get";

import "aws-sdk-client-mock-jest";
import { describe, test, expect, beforeEach, vi } from "vitest";

import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

import type { APIGatewayEventRequestContextV2 } from "aws-lambda";
import { User } from "../../../packages/schema/User";

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
    const expectedNewUser = new User(mockBaseEvent.pathParameters.username);

    ddbMock
      .on(GetCommand, {
        TableName: "unified-test-table",
        Key: expectedNewUser.keys(),
      })
      .resolves({
        Item: {
          PK: "USER#trial-user",
          SK: "USER#trial-user",
          username: "trial-user",
        },
      });

    const response = await getResponse();

    expect(response).toEqual(expectedNewUser);

    expect(ddbMock).toHaveReceivedCommandTimes(GetCommand, 1);

    expect(ddbMock).toHaveReceivedCommandWith(GetCommand, {
      TableName: "unified-test-table",
      Key: expectedNewUser.keys(),
    });
  });

  test.todo(
    "should fail to return a user because of error with DynamoDB client"
  );
});
