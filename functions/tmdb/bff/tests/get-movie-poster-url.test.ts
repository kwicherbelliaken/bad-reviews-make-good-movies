import {
  rawHandler as getMoviePosterUrl,
  type GetMoviePosterEvent,
} from "../get-movie-poster-url";

import fetch from "node-fetch";

import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("node-fetch");

const mockBaseEvent: GetMoviePosterEvent = {
  queryStringParameters: {
    fileSize: "w500",
    posterPath: "/some-path.jpg",
  },
};

describe("[handlers - GET /users/{username}]: get a user", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const getResponse = async (event: GetMoviePosterEvent = mockBaseEvent) =>
    await getMoviePosterUrl(event);

  test("should successfully return a url for a movie poster image", async () => {
    const mockConfigurationResponse = {
      images: {
        ["base_url"]: "some-url-to-movie-poster-image",
        ["poster_sizes"]: ["w500"],
      },
    };

    const mockExpectedMoviePosterUrl = `${mockConfigurationResponse.images.base_url}/t/p/${mockBaseEvent.queryStringParameters.fileSize}/${mockBaseEvent.queryStringParameters.posterPath}`;

    vi.mocked(fetch, { partial: true }).mockResolvedValueOnce({
      json: () => Promise.resolve(mockConfigurationResponse),
    });

    const response = await getResponse();

    expect(response).toEqual(mockExpectedMoviePosterUrl);
  });
});
