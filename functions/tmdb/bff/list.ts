// we almost want a bff endpoint to
// 1. search the movies
// 2. return movies with details and images or is this a really heavy request?
// make the image request in a follow up request?

//! movie name
//! movie release date
//! actors involved
//! movie description
//! movie poster

import { default as handlerWrapper } from "../../../packages/core/handler";
import tmdb from "../../../packages/core/tmdb/tmdb";

//! The typing is wonky. I need to attend to it.
// @ts-ignore
export const handler = handlerWrapper(async (event) => {
  console.log("tmdb > bff > list invoked");

  const response = await tmdb.bffEndpoints.list(
    event.queryStringParameters?.query!
  );

  return response;
});
