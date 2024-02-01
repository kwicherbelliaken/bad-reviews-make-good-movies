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

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError) || isZodValidationError(maybeError))
    return maybeError;

  return new Error(JSON.stringify(maybeError));
}

export function getErrorMessage(error: unknown) {
  return toErrorWithMessage(error).message;
}
