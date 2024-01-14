import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  type GetCommandInput,
  type PutCommandInput,
  type QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";

const dynamodb = new DynamoDBClient({});

const client = DynamoDBDocumentClient.from(dynamodb);

export default {
  get: async (params: GetCommandInput) => {
    const command = new GetCommand(params);

    // [ ] what about error handling around this
    //? I think there is appropriate handling around the lambda handler itself

    const response = await client.send(command);

    return response;
  },
  put: async (params: PutCommandInput) => {
    const command = new PutCommand(params);

    const response = await client.send(command);

    return response;
  },
  query: async (params: QueryCommandInput) => {
    const command = new QueryCommand(params);

    const response = await client.send(command);

    return response;
  },
  // query: (params: AWS.DynamoDB.DocumentClient.QueryInput) =>
  //   client.query(params).promise(),
  // update: (params: AWS.DynamoDB.DocumentClient.UpdateItemInput) =>
  //   client.update(params).promise(),
  // delete: (params: AWS.DynamoDB.DocumentClient.DeleteItemInput) =>
  //   client.delete(params).promise(),
  // transaction: (params: AWS.DynamoDB.DocumentClient.TransactWriteItemsInput) =>
  //   client.transactWrite(params).promise(),
  // batchWrite: (params: AWS.DynamoDB.DocumentClient.BatchWriteItemInput) =>
  //   client.batchWrite(params).promise(),
  // scan: (params: AWS.DynamoDB.DocumentClient.ScanInput) =>
  //   client.scan(params).promise(),
};
