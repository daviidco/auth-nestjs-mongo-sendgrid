/**
 * Error handling utilities for type-safe error processing
 */

/**
 * Type guard to check if a value is an Error instance
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Type guard to check if a value has a message property
 */
export function hasMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  );
}

/**
 * Safely extracts an error message from an unknown error value
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }

  if (hasMessage(error)) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (typeof error === 'object' && error !== null) {
    // Try to stringify the object
    try {
      return JSON.stringify(error);
    } catch {
      return 'Unknown error object';
    }
  }

  return 'Unknown error';
}

/**
 * Safely extracts error stack trace
 */
export function getErrorStack(error: unknown): string | undefined {
  if (isError(error)) {
    return error.stack;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'stack' in error &&
    typeof (error as any).stack === 'string'
  ) {
    return (error as any).stack;
  }

  return undefined;
}

/**
 * Creates a normalized error object from unknown input
 */
export function normalizeError(error: unknown): {
  message: string;
  stack?: string;
  originalError: unknown;
} {
  return {
    message: getErrorMessage(error),
    stack: getErrorStack(error),
    originalError: error,
  };
}

/**
 * Type guard to check if error is a MongoDB error
 */
export function isMongoError(
  error: unknown,
): error is Error & { code?: number } {
  return (
    isError(error) && 'code' in error && typeof (error as any).code === 'number'
  );
}

/**
 * Type guard to check if error is a validation error
 */
export function isValidationError(error: unknown): error is Error & {
  errors?: Record<string, any>;
} {
  return (
    isError(error) &&
    'errors' in error &&
    typeof (error as any).errors === 'object'
  );
}

/**
 * Extracts validation error messages
 */
export function getValidationErrors(error: unknown): string[] {
  if (!isValidationError(error)) {
    return [];
  }

  const errors: string[] = [];
  const validationErrors = error.errors || {};

  for (const field in validationErrors) {
    const fieldError = validationErrors[field];
    if (fieldError?.message) {
      errors.push(`${field}: ${fieldError.message}`);
    }
  }

  return errors;
}
