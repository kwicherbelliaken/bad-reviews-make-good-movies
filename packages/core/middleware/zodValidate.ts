import { z } from "zod";
import type { MiddlewareObj } from "@middy/core";
import createHttpError from "http-errors";

const baseEventSchema = z
  .object({
    httpMethod: z.any(),
    headers: z.object({}).passthrough(),
    requestContext: z.object({}).passthrough(),
  })
  .partial();

export const zodValidate = (
  schema: z.SomeZodObject | null
): Required<Pick<MiddlewareObj, "before">> => {
  if (schema == null) {
    throw new Error(
      "You must provide an event schema to zodValidate middleware."
    );
  }

  const fullSchema = baseEventSchema.merge(schema);

  return {
    before: async (request) => {
      try {
        fullSchema.parse(request.event);
      } catch (error) {
        throw createHttpError.BadRequest(collapseZodError(error as z.ZodError));
      }
    },
  };
};

const collapseZodError = (error: z.ZodError) => {
  const validationErrors = error.flatten(({ message }) => message);

  // [ ] there must be a better way to post process validation errors

  return Object.entries(validationErrors.fieldErrors).reduce(
    (errorMessage, [key, value]) => {
      errorMessage =
        errorMessage + ` Error in '${key}': ` + value!.join(". ") + ".";

      return errorMessage;
    },
    "Uh oh, encountered a validation error."
  );
};

/**
 * https://zod.dev/ERROR_HANDLING?id=formatting-errors#:~:text=You%20can%20customize%20all%20error,code%20%3D%3D%3D%20z.
 * @param issue
 * @param ctx
 * @returns
 */
const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.expected === "string") {
      const impactedVariable = issue.path[issue.path.length - 1];

      return {
        message: `'${impactedVariable}' should have been ${issue.expected}, but got ${issue.received}`,
      };
    }
  }

  return { message: ctx.defaultError };
};

z.setErrorMap(customErrorMap);
