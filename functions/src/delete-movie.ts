import { z } from "zod";
import { default as handlerWrapper } from "../../packages/core/handler";
import { deleteMovie } from "../../packages/schema/Movie";
import type { APIGatewayProxyEventV2 } from "aws-lambda";

const eventSchema = z.object({
  queryStringParameters: z.object({
    movieId: z.string(),
  }),
});

export type DeleteMovieEvent = Pick<
  APIGatewayProxyEventV2,
  "queryStringParameters"
> &
  z.infer<typeof eventSchema>;

export const rawHandler = async (event: DeleteMovieEvent) => {
  const {
    queryStringParameters: { movieId },
  } = event;

  await deleteMovie(movieId);
};

export const handler = handlerWrapper(rawHandler, eventSchema);
