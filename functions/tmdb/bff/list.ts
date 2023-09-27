import { default as handlerWrapper } from "../../../packages/core/handler";
import tmdb from "../../../packages/core/tmdb/tmdb";

//! The typing is wonky. I need to attend to it.
// @ts-ignore
export const handler = handlerWrapper(async (event) => {
  const response = await tmdb.bffEndpoints.list(
    event.queryStringParameters?.query!
  );

  return response;
});
