import { z } from "zod";
import { default as handlerWrapper } from "../../packages/core/handler";
import { User, getUser } from "../../packages/schema/User";

import type { APIGatewayProxyEventV2 } from "aws-lambda";

const eventSchema = z.object({
  pathParameters: z.object({
    username: z.string(),
  }),
});

export type GetUserEvent = Pick<APIGatewayProxyEventV2, "pathParameters"> &
  z.infer<typeof eventSchema>;

export const handler = handlerWrapper<GetUserEvent, User>(async (event) => {
  // const validatedEvent = eventSchema.parse(event);
  // [ ] what does parse do?

  const response = await getUser(event.pathParameters.username);

  return response;
});
