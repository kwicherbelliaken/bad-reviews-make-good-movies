import { z } from "zod";
import { default as handlerWrapper } from "../../packages/core/handler";
import { Movie, createMovie, movieSchema } from "../../packages/schema/Movie";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { nanoid } from "nanoid";

const eventSchema = z.object({
  body: z.object({
    username: movieSchema.shape.username,
    payload: movieSchema.shape.movieDetails,
  }),
  pathParameters: z.object({
    watchlistId: movieSchema.shape.watchlistId,
  }),
});

export type AddMovieToWatchlistEvent = Pick<
  APIGatewayProxyEventV2,
  "body" | "pathParameters"
> &
  z.infer<typeof eventSchema>;

export const rawHandler = async (event: AddMovieToWatchlistEvent) => {
  const {
    body: { username, payload },
    pathParameters: { watchlistId },
  } = event;

  const movie = await createMovie(
    new Movie(nanoid(), username, watchlistId, payload)
  );

  return movie;
};

export const handler = handlerWrapper(rawHandler, eventSchema, {
  httpJsonBodyParserEnabled: true,
});
