import { z } from "zod";
import { default as handlerWrapper } from "../../packages/core/handler";
import { Movie, createMovie } from "../../packages/schema/Movie";
import type { APIGatewayProxyEventV2 } from "aws-lambda";

//? this is actually 'add movie to watchlist'.

// [ ] create a new lambda
// [ ] add clerk to resolve username
// [ ] update dynamo client to support transactions

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

const validateEvent = (event: AddMovieToWatchlistEvent) =>
  eventSchema.parse(event);

export const handler = handlerWrapper<AddMovieToWatchlistEvent, Movie>(
  async (event) => {
    const {
      body: { username, payload },
      pathParameters: { watchlistId },
    } = validateEvent(event);

    // const movie = await createMovie(new Movie(username, watchlistId, payload));

    // return movie;

    return {} as Movie;
  },
  {
    httpJsonBodyParserEnabled: true,
  }
);
