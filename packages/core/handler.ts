import type {
  Handler,
  APIGatewayProxyHandlerV2,
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
  APIGatewayEventRequestContextV2,
} from "aws-lambda";
import { getErrorMessage } from "./helper";

import { ApiHandler } from "sst/node/api";

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
  >
) => {
  const handlerWrapper = ApiHandler(async (event, context) => {
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
  });

  return handlerWrapper;
};

export default handler;
