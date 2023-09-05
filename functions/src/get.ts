import { default as handlerWrapper } from "../../packages/core/handler";
import dynamoDb from "../../packages/core/dynamodb";

//! The typing is wonky. I need to attend to it.
// @ts-ignore
export const handler = handlerWrapper(async (event) => {
  const params = {
    TableName: process.env.USERS_TABLE_NAME!,
    Key: {
      userId: event.pathParameters?.id,
      username: "slackermorris",
    },
  };

  const response = await dynamoDb.get(params);

  return response.Item;
});
