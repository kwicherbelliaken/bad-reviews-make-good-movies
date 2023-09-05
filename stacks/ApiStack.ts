import { Api, use, type StackContext } from "sst/constructs";
import { StorageStack } from "./StorageStack";

export function ApiStack({ stack }: StackContext) {
  const usersDb = use(StorageStack);

  // [ ]: perhaps declare this in another stack and import the StorageStack to it

  const api = new Api(stack, "api", {
    defaults: {
      function: {
        permissions: [usersDb],
        environment: {
          USERS_TABLE_NAME: usersDb.tableName,
        },
      },
    },
    routes: {
      "POST /users": "functions/src/create.handler",
      "GET /users/{id}": "functions/src/get.handler",
      "PUT /users/{id}": "functions/src/update.handler",
    },
  });

  // Show the URLs in the output
  stack.addOutputs({
    ApiEndpoint: api.url,
  });

  return api;
}
