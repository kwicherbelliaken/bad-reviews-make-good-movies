import { rawHandler as addMovieToWatchlistHandler } from "../add-movie";

import { describe, test, expect, beforeEach, vi } from "vitest";

import "aws-sdk-client-mock-jest";
import { mockClient } from "aws-sdk-client-mock";

import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

import type { APIGatewayEventRequestContextV2 } from "aws-lambda";
import type { AddMovieToWatchlistEvent } from "../add-movie";

import { Movie } from "../../../packages/schema/Movie";
import { nanoid } from "nanoid";

vi.stubEnv("BRMGM_TABLE_NAME", "unified-test-table");

const ddbMock = mockClient(DynamoDBDocumentClient);

const mockBaseEvent: AddMovieToWatchlistEvent = {
  headers: {
    "Content-Type": "application/json",
  },
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

  test("should successfully add the movie to the watchlist", async () => {
    const newWatchlistMovie = new Movie(
      nanoid(),
      mockBaseEvent.body.username,
      mockBaseEvent.pathParameters.watchlistId,
      mockBaseEvent.body.payload
    );

    // [ ] we want to return nothing from the query command
    ddbMock
      .on(QueryCommand, {
        TableName: "unified-test-table",
        IndexName: "GSI1",
        KeyConditionExpression: "GSI1PK = :gsi1pk",
        FilterExpression: "movieDetails.title = :title",
        ExpressionAttributeValues: {
          ":title": newWatchlistMovie.movieDetails.title,
          ":gsi1pk": newWatchlistMovie.gsi1pk,
        },
      })
      .resolves({
        $metadata: {},
        Items: [],
        Count: 0,
      })
      .on(PutCommand, {
        TableName: "unified-test-table",
        Item: newWatchlistMovie.toItem(),
        ConditionExpression: "attribute_not_exists(PK)",
      })
      .resolves({
        // [ ] return the movie
        Attributes: {
          username: "trial-user",
        },
      });

    const response = await createResponse();

    expect(ddbMock).toHaveReceivedCommandTimes(QueryCommand, 1);
    expect(ddbMock).toHaveReceivedCommandWith(QueryCommand, {
      TableName: "unified-test-table",
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1PK = :gsi1pk",
      FilterExpression: "movieDetails.title = :title",
    });

    expect(ddbMock).toHaveReceivedCommandTimes(PutCommand, 1);

    // NB: A 'different' Movie is created in the handler, so we can't use toStrictEqual.
    expect(response).toEqual({ ...newWatchlistMovie, id: expect.any(String) });
  });
});
