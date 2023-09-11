import { default as handlerWrapper } from "../../packages/core/handler";
import { getUser } from "../../packages/schema/User";

//! The typing is wonky. I need to attend to it.
// @ts-ignore
export const handler = handlerWrapper(async (event) => {
  const params = {
    TableName: process.env.BRMGM_TABLE_NAME!,
    Key: {
      S: "USER#slackermorris",
      SK: "USER#slackermorris",
    },
  };

  const response = await getUser(event.pathParameters?.username!);

  return response;
});
