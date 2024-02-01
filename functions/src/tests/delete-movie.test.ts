import { rawHandler as deleteMovieFromWatchlistHandler } from "../delete-movie";

import { describe, test, expect, beforeEach, vi } from "vitest";

import "aws-sdk-client-mock-jest";
import { mockClient } from "aws-sdk-client-mock";

import { DeleteCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

import { Movie } from "../../../packages/schema/Movie";
import { nanoid } from "nanoid";

import type { DeleteMovieEvent } from "../delete-movie";
import type { APIGatewayEventRequestContextV2 } from "aws-lambda";

vi.stubEnv("BRMGM_TABLE_NAME", "unified-test-table");

const ddbMock = mockClient(DynamoDBDocumentClient);

const mockMovieToBeDeleted = new Movie(nanoid(), "test-user", nanoid(), {
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
});

const mockBaseEvent: DeleteMovieEvent = {
  queryStringParameters: {
    movieId: mockMovieToBeDeleted.id,
  },
};

// @ts-ignore: I don't use this currently. So, why mock it?
const mockBaseContext: APIGatewayEventRequestContextV2 = {};

describe("[handlers - DELETE /movies/{watchlistId}]: remove a movie from a users' watchlist", () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  const createResponse = async (event: DeleteMovieEvent = mockBaseEvent) =>
    // @ts-ignore: This is a PITA. Yes, the handler will receive a legitimate APIGatewayProxyEventV2, but it only makes use of some of it (pathParameters), so it's not worth the effort to mock the entire thing.
    await deleteMovieFromWatchlistHandler(event, mockBaseContext);

  test("should successfully delete a movie from a users' watchlist", async () => {
    ddbMock
      .on(DeleteCommand, {
        TableName: "unified-test-table",
        Key: {
          pk: mockMovieToBeDeleted.pk,
          sk: mockMovieToBeDeleted.sk,
        },
      })
      .resolves({});

    await createResponse();

    expect(ddbMock).toHaveReceivedCommandTimes(DeleteCommand, 1);
    expect(ddbMock).toHaveReceivedCommandWith(DeleteCommand, {
      TableName: "unified-test-table",
      Key: {
        pk: mockMovieToBeDeleted.pk,
        sk: mockMovieToBeDeleted.sk,
      },
    });
  });

  test("should throw an error if the movie does not exist", async () => {
    ddbMock
      .on(DeleteCommand, {
        TableName: "unified-test-table",
        Key: {
          pk: mockMovieToBeDeleted.pk,
          sk: mockMovieToBeDeleted.sk,
        },
      })
      .rejects(
        new Error(`No Movie with id: ${mockMovieToBeDeleted.id} found!`)
      );

    await expect(() => createResponse()).rejects.toThrow(
      `No Movie with id: ${mockMovieToBeDeleted.id} found!`
    );
  });
});
