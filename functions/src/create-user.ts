import { z } from "zod";
import { default as handlerWrapper } from "../../packages/core/handler";
import { User, createUser } from "../../packages/schema/User";

import type { APIGatewayProxyEventV2 } from "aws-lambda";

const eventSchema = z.object({
  body: z.object({
    username: z.string(),
  }),
});

export type CreateUserEvent = Pick<APIGatewayProxyEventV2, "body"> &
  z.infer<typeof eventSchema>;

export const rawHandler = async (event: CreateUserEvent) => {
  const {
    body: { username },
  } = event;

  const user = await createUser(new User(username));

  return user;
};

export const handler = handlerWrapper(rawHandler, eventSchema, {
  httpJsonBodyParserEnabled: true,
});
