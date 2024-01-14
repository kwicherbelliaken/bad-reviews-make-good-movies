import { z } from "zod";
import { default as handlerWrapper } from "../../packages/core/handler";
import { Movie, createMovie } from "../../packages/schema/Movie";
import type { APIGatewayProxyEventV2 } from "aws-lambda";

const payloadSchema = z.object({
  title: z.string(),
  poster_path: z.string(),
  overview: z.string(),
  release_date: z.string(),
  genres: z.array(
    z.object({
      name: z.string(),
    })
  ),
  cast: z.array(
    z.object({
      name: z.string(),
      character: z.string(),
    })
  ),
});

const eventSchema = z.object({
  body: z.object({
    username: z.string(),
    payload: payloadSchema,
  }),
  pathParameters: z.object({
    watchlistId: z.string(),
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

  const movie = await createMovie(new Movie(username, watchlistId, payload));

  return movie;
};

export const handler = handlerWrapper(rawHandler, eventSchema, {
  httpJsonBodyParserEnabled: true,
});
