import { rawHandler as searchMoviesHandler } from "../search-movies";

import { describe, test, expect, beforeEach, vi } from "vitest";

import "aws-sdk-client-mock-jest";
import { mockClient } from "aws-sdk-client-mock";

import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

import type { SearchMoviesEvent } from "../search-movies";
import type { APIGatewayEventRequestContextV2 } from "aws-lambda";
import { Watchlist } from "../../../packages/schema/Watchlist";
import { Movie } from "../../../packages/schema/Movie";
import { nanoid } from "nanoid";

const mocks = vi.hoisted(() => {
  return {
    mockTMDBListEndpoint: vi.fn(),
  };
});

vi.mock("@tmdb", () => {
  return {
    // If you are mocking a module with default export, you will need to provide a default key within the returned factory function object. This is an ES module-specific caveat.
    // https://arc.net/l/quote/gdoefcqn.
    default: {
      bffEndpoints: {
        list: mocks.mockTMDBListEndpoint,
      },
    },
  };
});

vi.stubEnv("BRMGM_TABLE_NAME", "unified-test-table");

const ddbMock = mockClient(DynamoDBDocumentClient);

const mockBaseEvent: SearchMoviesEvent = {
  queryStringParameters: {
    title: "mock-title",
  },
};

// @ts-ignore: I don't use this currently. So, why mock it?
const mockBaseContext: APIGatewayEventRequestContextV2 = {};

const mockWatchlist = new Watchlist("8JWw9ZPsUtkD-14h0Fnzs", "trial-user");

describe("[handlers - GET /movies]: search for movies", () => {
  beforeEach(() => {
    ddbMock.reset();
    mocks.mockTMDBListEndpoint.mockReset();
  });

  const createResponse = async (event: SearchMoviesEvent = mockBaseEvent) =>
    // @ts-ignore: This is a PITA. Yes, the handler will receive a legitimate APIGatewayProxyEventV2, but it only makes use of some of it (pathParameters), so it's not worth the effort to mock the entire thing.
    await searchMoviesHandler(event, mockBaseContext);

  test("it should return an empty list of movies because none match the search query", async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [],
      Count: 0,
    });

    mocks.mockTMDBListEndpoint.mockResolvedValueOnce([]);

    const response = await createResponse();

    expect(response).toEqual([]);

    expect(ddbMock).toHaveReceivedCommandTimes(QueryCommand, 1);
    expect(ddbMock).toHaveReceivedCommandWith(QueryCommand, {
      TableName: "unified-test-table",
      IndexName: "GSI1",
      KeyConditionExpression: "gsi1pk = :gsi1pk",
      FilterExpression: "movieDetails.title = :title",
      ExpressionAttributeValues: {
        ":gsi1pk": mockWatchlist.gsi1pk,
        ":title": mockBaseEvent.queryStringParameters.title,
      },
    });

    expect(mocks.mockTMDBListEndpoint).toHaveBeenCalledTimes(1);
    expect(mocks.mockTMDBListEndpoint).toHaveBeenCalledWith(
      mockBaseEvent.queryStringParameters.title
    );
  });

  test("it should return an empty list of movies because the searched for movie is already in the watchlist", async () => {
    const mockExistingMovieOnWatchlist = new Movie(
      nanoid(),
      "trial-user",
      "8JWw9ZPsUtkD-14h0Fnzs",
      {
        title: mockBaseEvent.queryStringParameters.title,
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
      }
    );

    ddbMock.on(QueryCommand).resolves({
      Items: [mockExistingMovieOnWatchlist],
      Count: 1,
    });

    mocks.mockTMDBListEndpoint.mockResolvedValueOnce([
      {
        title: mockBaseEvent.queryStringParameters.title,
      },
    ]);

    const response = await createResponse();

    expect(response).toEqual([]);

    expect(ddbMock).toHaveReceivedCommandTimes(QueryCommand, 1);

    expect(mocks.mockTMDBListEndpoint).toHaveBeenCalledTimes(1);
  });

  test("it should return a list of movies because some match the seatch query and none exist in watchlist", async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [],
      Count: 0,
    });

    mocks.mockTMDBListEndpoint.mockResolvedValueOnce([
      {
        title: mockBaseEvent.queryStringParameters.title,
      },
    ]);

    const response = await createResponse();

    expect(response).toEqual([
      {
        title: mockBaseEvent.queryStringParameters.title,
      },
    ]);

    expect(ddbMock).toHaveReceivedCommandTimes(QueryCommand, 1);

    expect(mocks.mockTMDBListEndpoint).toHaveBeenCalledTimes(1);
  });
});
