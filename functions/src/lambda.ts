import AWS from "aws-sdk";
import * as uuid from "uuid";

import { ApiHandler } from "sst/node/api";

// [ ]: move this into its own service file
// [ ]: how to add type support for this event
// [ ]: have a look at the context API for API Gateway

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const handler = ApiHandler(async (event) => {
  const data = JSON.parse(event.body);

  const params = {
    TableName: process.env.USERS_TABLE_NAME!,
    Item: {
      userId: uuid.v1(),
      username: data.username,
    },
  };

  try {
    await dynamoDb.put(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(params.Item),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
});
