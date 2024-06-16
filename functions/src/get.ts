import { z } from "zod";
import { default as handlerWrapper } from "../../packages/core/handler";
import { User, getUser } from "../../packages/schema/User";

import type { APIGatewayProxyEventV2 } from "aws-lambda";

const eventSchema = z.object({
  pathParameters: z.object({
    username: z.string(),
  }),
  queryStringParameters: z
    .object({
      resolveWatchlist: z.enum(["true", "false"]),
    })
    .optional()
    .nullable(),
});

// [ ] update the test

export type GetUserEvent = Pick<APIGatewayProxyEventV2, "pathParameters"> &
  z.infer<typeof eventSchema>;

export const rawHandler = async (event: GetUserEvent): Promise<User> => {
  const {
    pathParameters: { username },
    queryStringParameters: {
      resolveWatchlist: resolveWatchlistQueryStringParameter,
    } = {},
  } = event;

  const resolveWatchlist =
    (resolveWatchlistQueryStringParameter ?? "").match(/true/i) != null;

  const response = await getUser(username, resolveWatchlist);

  return response;
};

export const handler = handlerWrapper(rawHandler, eventSchema);
