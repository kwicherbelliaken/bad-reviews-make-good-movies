import { StackContext, Table } from "sst/constructs";

// [ ]: this should be single table design

export function StorageStack({ stack }: StackContext) {
  const brmgmTable = new Table(stack, "BRMGMTable", {
    fields: {
      PK: "string",
      SK: "string",
      GSI1PK: "string",
      GSI1SK: "string",
    },
    primaryIndex: { partitionKey: "PK", sortKey: "SK" },
    globalIndexes: {
      GSI1: { partitionKey: "GSI1PK", sortKey: "GSI1SK", projection: "all" },
    },
  });

  return brmgmTable;
}
