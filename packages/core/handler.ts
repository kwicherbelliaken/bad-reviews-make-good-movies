import type { Handler, APIGatewayProxyHandlerV2 } from "aws-lambda";

import { ApiHandler } from "sst/node/api";

type AsyncHandler<T extends Handler> = (
  event: Parameters<T>[0],
  context: Parameters<T>[1]
) => Promise<
  Parameters<Parameters<T>[2]>[1] extends void
    ? void
    : NonNullable<Parameters<Parameters<T>[2]>[1]>
>;

type AsyncAPIGatewayProxyHandler = AsyncHandler<APIGatewayProxyHandlerV2>;

const _reportError = (message: string) => {
  console.error(message);
};

/**
 * This wrapper allows us to centrally handle any errors that occur in our lambda functions.
 * @returns HTTP response (our lambdas handle API endpoints).
 */
const handler = (lambda: AsyncAPIGatewayProxyHandler) => {
  const handlerWrapper = ApiHandler(async (event, context) => {
    let body, statusCode;

    try {
      body = await lambda(event, context);
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
