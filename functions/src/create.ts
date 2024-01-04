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

const validateEvent = (event: CreateUserEvent) => eventSchema.parse(event);

export const handler = handlerWrapper<CreateUserEvent, User>(
  async (event) => {
    console.log("🚀 ~ file: create.ts:19 ~ handler ~ event:", event);
    const {
      body: { username },
    } = validateEvent(event);

    const user = await createUser(new User(username));

    return user;
  },
  {
    httpJsonBodyParserEnabled: true,
  }
);
