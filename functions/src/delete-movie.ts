import { default as handlerWrapper } from "../../packages/core/handler";
import { deleteMovie } from "../../packages/schema/Movie";

//! The typing is wonky. I need to attend to it.
// @ts-ignore
export const handler = handlerWrapper(async (event) => {
  console.log("invoked the delete movie handler");

  const {
    queryStringParameters: { movieId },
  } = event;

  // ghost dog
  // showdown at the grand
  // anatomy of a fall
  // dream scenario
  // napoleon

  await deleteMovie(movieId);
});
