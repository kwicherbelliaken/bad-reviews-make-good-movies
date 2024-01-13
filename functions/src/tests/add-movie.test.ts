import { handler as addMovieToWatchlistHandler } from "../add-movie";

import { describe, test, expect, beforeEach } from "vitest";

import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

import type { APIGatewayEventRequestContextV2 } from "aws-lambda";
import type { AddMovieToWatchlistEvent } from "../add-movie";

const ddbMock = mockClient(DynamoDBDocumentClient);

const mockBaseEvent: AddMovieToWatchlistEvent = {
  // @ts-ignore: Typing for APIGatewayProxyEventV2 "body" is string.
  body: {
    username: "trial-user",
    payload: {
      title: "The Trial",
      poster_path: "/trial-poster-path",
      overview: "trial-overview",
      release_date: "trial-release-date",
      genres: [
        {
          name: "trial-genre",
        },
      ],
      cast: [
        {
          name: "trial-cast",
          character: "trial-character",
        },
      ],
    },
  },
  pathParameters: {
    watchlistId: "trial-watchlist",
  },
};

// @ts-ignore: I don't use this currently. So, why mock it?
const mockBaseContext: APIGatewayEventRequestContextV2 = {};

describe("[handlers - POST /movies/{watchlistId}]: add a movie to users' watchlist", () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  const createResponse = async (
    event: AddMovieToWatchlistEvent = mockBaseEvent
  ) =>
    // @ts-ignore: This is a PITA. Yes, the handler will receive a legitimate APIGatewayProxyEventV2, but it only makes use of some of it (pathParameters), so it's not worth the effort to mock the entire thing.
    await addMovieToWatchlistHandler(event, mockBaseContext);

  describe("should fail to add a movie to watchlist because ...", () => {
    test("... body and pathParameters are undefined", async () => {
      const response = await createResponse(
        // @ts-ignore: Think "runtime". It is possible that this handler be invoked without any path parameters.
        {}
      );

      expect(response.statusCode).toBe(500);

      expect(JSON.parse(response.body!).error).toBe(
        "Uh oh, encountered a validation error. Error in 'body': Required. Error in 'pathParameters': Required."
      );
    });

    test.only("... no 'watchlistId' is provided", async () => {
      const response = await createResponse({
        ...mockBaseEvent,
        // @ts-ignore: Think "runtime". It is possible that this handler be invoked without any path parameters.
        pathParameters: {},
      });

      expect(response.statusCode).toBe(500);

      expect(JSON.parse(response.body!).error).toBe(
        "Uh oh, encountered a validation error. Error in 'body': Required. Error in 'pathParameters': Required."
      );
    });
  });
});
