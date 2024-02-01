import { zodValidate } from "./zodValidate";

import { describe, test, expect } from "vitest";

import { z } from "zod";

const baseEvent = {
  body: {
    username: "trial-user",
  },
};

describe("[middleware] - zod validation", () => {
  test("should fail zod validation because no schema is provided", () => {
    expect(() => zodValidate(null)).toThrow(
      "You must provide an event schema to zodValidate middleware."
    );
  });

  test("should pass validation because event matches schema", async () => {
    const schema = z.object({
      body: z.object({
        username: z.string(),
      }),
    });

    const response = zodValidate(schema).before(
      // @ts-ignore: we aren't concerned with mocking the entire Request out.
      {
        event: baseEvent,
      }
    );
  });

  test("should fail validation because event does not match schema", () => {
    const errorSchema = z.object({
      body: z.object({
        username: z.number(),
      }),
    });

    expect(
      zodValidate(errorSchema).before(
        // @ts-ignore: we aren't concerned with mocking the entire Request out.
        { event: baseEvent }
      )
    ).rejects.toThrow(
      "Uh oh, encountered a validation error. Error in 'body': Expected number, received string."
    );
  });
});
