import { StackContext, Table } from "sst/constructs";

// [ ]: this should be single table design

export function StorageStack({ stack }: StackContext) {
  const usersTable = new Table(stack, "Users", {
    fields: {
      userId: "string",
      username: "string",
    },
    primaryIndex: { partitionKey: "userId", sortKey: "username" },
  });

  return usersTable;
}
