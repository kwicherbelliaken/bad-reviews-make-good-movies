import { type StackContext, Table } from "sst/constructs";

// [ ]: this should be single table design

export function StorageStack({ stack }: StackContext) {
  const brmgmTable = new Table(stack, "BRMGMTable", {
    fields: {
      pk: "string",
      sk: "string",
      gsi1pk: "string",
      gsi1sk: "string",
    },
    primaryIndex: { partitionKey: "pk", sortKey: "sk" },
    globalIndexes: {
      GSI1: { partitionKey: "gsi1pk", sortKey: "gsi1sk", projection: "all" },
    },
  });

  return brmgmTable;
}
