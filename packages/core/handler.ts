import type { Handler, APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getErrorMessage } from "./helper";

import { ApiHandler } from "sst/node/api";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpHeaderNormalizer from "@middy/http-header-normalizer";

type AsyncHandler<
  T extends Handler,
  CustomAPIGatewayProxyEvent,
  LambdaResultType
> = (
  event: CustomAPIGatewayProxyEvent,
  context: Parameters<T>[1]
) => Promise<LambdaResultType>;

type AsyncAPIGatewayProxyHandler<CustomAPIGatewayProxyEvent, LambdaResultType> =
  AsyncHandler<
    APIGatewayProxyHandlerV2,
    CustomAPIGatewayProxyEvent,
    LambdaResultType
  >;

const _reportError = (message: string) => {
  console.error(message);
};

/**
 * This wrapper allows us to centrally handle any errors that occur in our lambda functions.
 * @returns HTTP response (our lambdas handle API endpoints).
 */
const handler = <CustomAPIGatewayProxyEvent, LambaResultType>(
  lambda: AsyncAPIGatewayProxyHandler<
    CustomAPIGatewayProxyEvent,
    LambaResultType
  >,
  middyMiddlewares: {
    httpJsonBodyParserEnabled: boolean;
  } = {
    httpJsonBodyParserEnabled: false,
  }
) => {
  const middyHandlerWrapper = middy().handler(
    ApiHandler(async (event, context) => {
      console.log("🚀 ~ file: handler.ts:39 ~ handlerWrapper ~ event:", event);
      let body, statusCode;

      try {
        // [ ] I don't like the casting here
        body = await lambda(event as CustomAPIGatewayProxyEvent, context);
        statusCode = 200;
      } catch (e) {
        const errorMessage = getErrorMessage(e);
        _reportError(errorMessage);

        body = { error: errorMessage };
        statusCode = 500;
      }

      return {
        statusCode,
        body: JSON.stringify(body),
      };
    })
  );

  const { httpJsonBodyParserEnabled } = middyMiddlewares;

  middyHandlerWrapper.use(httpHeaderNormalizer());

  httpJsonBodyParserEnabled && middyHandlerWrapper.use(httpJsonBodyParser());

  return middyHandlerWrapper;
};

export default handler;
