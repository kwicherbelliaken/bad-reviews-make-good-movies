import { default as handlerWrapper } from "../../packages/core/handler";
import dynamoDb from "../../packages/core/dynamodb";

//! The typing is wonky. I need to attend to it.
// @ts-ignore
export const handler = handlerWrapper(async (event) => {
  if (event.body == null) {
    throw new Error("The request is missing a body");
  }

  const data = JSON.parse(event.body);

  const params = {
    TableName: process.env.USERS_TABLE_NAME!,
    Key: {
      userId: event.pathParameters?.id,
      username: data.username,
    },
    UpdateExpression: "SET wishlist = :wishlist",
    ExpressionAttributeValues: {
      ":wishlist": data.wishlist || null,
    },
    ReturnValues: "ALL_NEW",
  };

  await dynamoDb.update(params);

  // [ ]: I think it would be better if the update  call return the recently updated item

  return { status: true };
});
