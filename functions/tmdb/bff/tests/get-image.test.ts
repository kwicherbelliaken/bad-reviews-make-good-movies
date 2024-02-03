import {
  rawHandler as getMoviePosterUrl,
  type GetMoviePosterEvent,
} from "../image";

import fetch from "node-fetch";

import { describe, test, expect, vi, beforeEach } from "vitest";

import type { APIGatewayEventRequestContextV2 } from "aws-lambda";

vi.mock("node-fetch");

const mockBaseEvent: GetMoviePosterEvent = {
  queryStringParameters: {
    fileSize: "w500",
    posterPath: "/some-path.jpg",
  },
};

// @ts-ignore: I don't use this currently. So, why mock it?
const mockBaseContext: APIGatewayEventRequestContextV2 = {};

describe("[handlers - GET /users/{username}]: get a user", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const getResponse = async (event: GetMoviePosterEvent = mockBaseEvent) =>
    // @ts-ignore: This is a PITA. Yes, the handler will receive a legitimate APIGatewayProxyEventV2, but it only makes use of some of it (pathParameters), so it's not worth the effort to mock the entire thing.
    await getMoviePosterUrl(event, mockBaseContext);

  test("should successfully return a url for a movie poster image", async () => {
    const mockConfigurationResponse = {
      images: {
        ["base_url"]: "some-url-to-movie-poster-image",
        ["poster_sizes"]: ["w500"],
      },
    };

    const mockExpectedMoviePosterUrl = `${mockConfigurationResponse.images.base_url}/t/p/${mockBaseEvent.queryStringParameters.fileSize}/${mockBaseEvent.queryStringParameters.posterPath}`;

    vi.mocked(fetch).mockResolvedValueOnce({
      json: () => Promise.resolve(mockConfigurationResponse),
    });

    const response = await getResponse();

    expect(response).toEqual(mockExpectedMoviePosterUrl);
  });
});
