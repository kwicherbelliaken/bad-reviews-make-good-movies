import type { APIGatewayEventRequestContextV2 } from "aws-lambda";
import { handler as getUserHandler, type GetUserEvent } from "../get";

import { describe, test, expect } from "vitest";

const mockBaseEvent: GetUserEvent = {
  pathParameters: {
    username: "trial-user",
  },
};

// @ts-ignore: I don't use this currently. So, why mock it?
const mockBaseContext: APIGatewayEventRequestContextV2 = {};

describe("[handlers - GET /users/{username}]: get a user", () => {
  const getResponse = async (event: GetUserEvent = mockBaseEvent) =>
    // @ts-ignore: This is a PITA. Yes, the handler will receive a legitimate APIGatewayProxyEventV2, but it only makes use of some of it (pathParameters), so it's not worth the effort to mock the entire thing.
    await getUserHandler(event, mockBaseContext);

  test.skip("should successfully return the user", async () => {
    const response = await getResponse();

    expect(response.statusCode).toBe(200);
  });

  test("should fail to return a user because it does not pass validation", async () => {
    const response = await getResponse({
      // @ts-ignore: Think "runtime". It is possible that this handler be invoked without any path parameters.
      pathParameters: {},
    });

    expect(response.statusCode).toBe(500);

    if (response.body != null) {
      expect(JSON.parse(response.body).error).toBe(
        "Uh oh, encountered a validation error. Expected 'username' to be a string but got undefined"
      );
    }
  });
});
