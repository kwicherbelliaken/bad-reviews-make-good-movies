import { Api, use, type StackContext } from "sst/constructs";
import { StorageStack } from "./StorageStack";

export function ApiStack({ stack }: StackContext) {
  const brmgmDb = use(StorageStack);

  // [ ]: perhaps declare this in another stack and import the StorageStack to it

  const api = new Api(stack, "api", {
    defaults: {
      function: {
        permissions: [brmgmDb],
        environment: {
          BRMGM_TABLE_NAME: brmgmDb.tableName,
        },
      },
    },
    routes: {
      "POST /users": "functions/src/create.handler",
      "GET /users/{username}": "functions/src/get.handler",
      "PUT /users/{id}": "functions/src/update.handler",
    },
  });

  // Show the URLs in the output
  stack.addOutputs({
    ApiEndpoint: api.url,
  });

  return api;
}
