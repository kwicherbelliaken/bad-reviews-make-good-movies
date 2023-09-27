import { default as handlerWrapper } from "../../packages/core/handler";
import { Movie, createMovie } from "../../packages/schema/Movie";

//! The typing is wonky. I need to attend to it.
// @ts-ignore
export const handler = handlerWrapper(async (event) => {
  if (event.body == null) {
    throw new Error("The request is missing a body");
  }

  // [ ]: add validation for the body
  const data = JSON.parse(event.body);

  // [ ] figure out how we can get the watchlistId

  const movie = await createMovie(
    new Movie(data.username, data.watchlistId, data.payload)
  );

  return movie;
});
