import {
  rawHandler as listWatchlistMoviesHandler,
  watchlist as mockWatchlist,
  type ListWatchlistMoviesEvent,
} from "../list-watchlist-movies";

import { describe, test, expect, beforeEach, vi } from "vitest";

import "aws-sdk-client-mock-jest";
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

import { Movie } from "../../../packages/schema/Movie";
import { nanoid } from "nanoid";

const mockBaseEvent: ListWatchlistMoviesEvent = {};

vi.stubEnv("BRMGM_TABLE_NAME", "unified-test-table");

const ddbMock = mockClient(DynamoDBDocumentClient);

describe("[handlers - GET /watchlist]: list watchlist movies", () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  const createResponse = async (
    event: ListWatchlistMoviesEvent = mockBaseEvent
  ) => await listWatchlistMoviesHandler(event);

  test("it should return a list of watchlisted movies", async () => {
    const mockExistingMovieOnWatchlist = new Movie(
      nanoid(),
      "trial-user",
      "8JWw9ZPsUtkD-14h0Fnzs",
      {
        title: "mock movie title",
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

    const response = await createResponse();

    expect(response).toEqual([mockExistingMovieOnWatchlist]);

    expect(ddbMock).toHaveReceivedCommandTimes(QueryCommand, 1);

    expect(ddbMock).toHaveReceivedCommandWith(QueryCommand, {
      TableName: "unified-test-table",
      IndexName: "GSI1",
      KeyConditionExpression: "gsi1pk = :gsi1pk",
      ExpressionAttributeValues: {
        ":gsi1pk": mockWatchlist.gsi1pk,
      },
    });
  });
});
