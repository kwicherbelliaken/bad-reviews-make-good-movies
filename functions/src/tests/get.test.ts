import type { APIGatewayEventRequestContextV2 } from "aws-lambda";
import { handler as getUserHandler, type GetUserEvent } from "../get";

const mockBaseEvent: GetUserEvent = {
  pathParameters: {
    username: "trial-user",
  },
};

// @ts-ignore: I don't use this currently. So, why mock it?
const mockBaseContext: APIGatewayEventRequestContextV2 = {};

describe("[handlers - GET /users/{username}]: get a user", () => {
  const getResponse = async () =>
    // @ts-ignore: This is a PITA. Yes, the handler will receive a legitimate APIGatewayProxyEventV2, but it only makes use of some of it (pathParameters), so it's not worth the effort to mock the entire thing.
    await getUserHandler(mockBaseEvent, mockBaseContext);

  it("should successfully return the user", async () => {
    const response = await getResponse();

    expect(response.statusCode).toBe(200);
  });
});
