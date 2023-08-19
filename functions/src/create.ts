import { default as handlerWrapper } from "../../packages/core/handler";
import dynamoDb from "../../packages/core/dynamodb";

import * as uuid from "uuid";

// [x]: perform validation on the body
// [x]: move this into its own service file
// [x]: how to add type support for this event
// [ ]: have a look at the context API for API Gateway
// [ ]: think about adding zod validation for these endpoints

//! The typing is wonky. I need to attend to it.
// @ts-ignore
export const handler = handlerWrapper(async (event) => {
  if (event.body == null) {
    throw new Error("The request is missing a body");
  }

  const data = JSON.parse(event.body);

  const params = {
    TableName: process.env.USERS_TABLE_NAME!,
    Item: {
      userId: uuid.v1(),
      username: data.username,
    },
  };

  await dynamoDb.put(params);

  return params.Item;
});
