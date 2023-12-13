import { z } from "zod";

type ErrorWithMessage = {
  message: string;
};

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  );
}

function isZodValidationError(error: unknown): error is z.ZodError {
  return error instanceof z.ZodError;
}

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
        message: `Uh oh, encountered a validation error. Expected '${impactedVariable}' to be a ${issue.expected} but got ${issue.received}`,
      };
    }
  }

  return { message: ctx.defaultError };
};

// [ ] that custom error map should be set somewhere else
z.setErrorMap(customErrorMap);

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isZodValidationError(maybeError)) {
    const validationErrors = maybeError.flatten(({ message }) => message);

    // [ ] there must be a better way to post process validation errors
    return {
      message: validationErrors.fieldErrors["pathParameters"]?.join("\n")!,
    };
  }

  if (isErrorWithMessage(maybeError)) return maybeError;

  return new Error(JSON.stringify(maybeError));
}

export function getErrorMessage(error: unknown) {
  return toErrorWithMessage(error).message;
}
