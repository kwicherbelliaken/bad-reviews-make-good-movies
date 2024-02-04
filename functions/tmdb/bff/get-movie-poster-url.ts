import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { default as handlerWrapper } from "../../../packages/core/handler";
import tmdb from "../../../packages/core/tmdb/tmdb";
import { z } from "zod";

const eventSchema = z.object({
  queryStringParameters: z.object({
    fileSize: z.custom<`w${string}`>((val) =>
      /^[a-z]\d{3}$/g.test(val as string)
    ),
    posterPath: z.string(),
  }),
});

export type GetMoviePosterEvent = Pick<
  APIGatewayProxyEventV2,
  "queryStringParameters"
> &
  z.infer<typeof eventSchema>;

export const rawHandler = async (event: GetMoviePosterEvent) => {
  const {
    queryStringParameters: { fileSize, posterPath },
  } = event;

  const response = await tmdb.bffEndpoints.image(fileSize, posterPath);

  return response;
};

export const handler = handlerWrapper(rawHandler, eventSchema);
