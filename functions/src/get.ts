import { default as handlerWrapper } from "../../packages/core/handler";
import { getUser } from "../../packages/schema/User";

//! The typing is wonky. I need to attend to it.
// @ts-ignore
export const handler = handlerWrapper(async (event) => {
  const response = await getUser(event.pathParameters?.username!);

  return response;
});
