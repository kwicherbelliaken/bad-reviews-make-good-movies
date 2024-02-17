import type { SSTConfig } from "sst";
import { AstroSite, use, type StackContext } from "sst/constructs";
import { StorageStack } from "./stacks/StorageStack";
import { ApiStack } from "./stacks/ApiStack";
import { IAMStack } from "./stacks/IAMStack";

export default {
  config(_input) {
    return {
      name: "bad-reviews-make-good-movies",
      region: "ap-southeast-2",
    };
  },
  stacks(app) {
    // remove all resources when non-prod stages are removed
    if (app.stage !== "production") {
      app.setDefaultRemovalPolicy("destroy");
    }

    app
      .stack(IAMStack)
      .stack(StorageStack)
      .stack(ApiStack)
      .stack(function Site({ stack }: StackContext) {
        const api = use(ApiStack);

        const site = new AstroSite(stack, "site", {
          environment: {
            API_URL: api.url,
          },
        });

        stack.addOutputs({
          url: site.url,
        });

        return api;
      });
  },
} satisfies SSTConfig;
