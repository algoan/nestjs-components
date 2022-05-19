import { ValidationError } from 'class-validator';
import { snakeCase, toUpper } from 'lodash';
/**
 *
 * Extract the stringified error code
 *
 * @param exResponse - exception response
 * @returns - string that describes the error
 */
export function getCode(exResponse: ExceptionResponse | string): string {
  if (typeof exResponse === 'string') {
    return formatErrorCode(exResponse);
  }

  if ('error' in exResponse && typeof exResponse.error === 'string') {
    return formatErrorCode(exResponse.error);
  }

  if ('code' in exResponse && typeof exResponse.code === 'string') {
    return exResponse.code;
  }

  return '';
}

/*
    Extract the error messages
  */
export function getErrorMessage(exResponse: ExceptionResponse | string): string {
  if (typeof exResponse === 'string') {
    return exResponse;
  }

  if (typeof exResponse.message === 'string') {
    return exResponse.message;
  }

  if (Array.isArray(exResponse.message)) {
    // process the first error message
    const error: ValidationError | string = exResponse.message[0];
    if (typeof error === 'string') {
      return error;
    }
    const validationError: string = parseErrorMessage(error);
    if (validationError) {
      return validationError;
    }
  }

  return 'INTERNAL_SERVER_ERROR';
}

/**
 * Format a string to uppercase and snakeCase
 *
 * @param error - string
 * @returns - ex `Bad Request` become `BAD_REQUEST`
 */
function formatErrorCode(error: string): string {
  return toUpper(snakeCase(error));
}

/*
    Aggregation of error messages for a given ValidationError
  */
function parseErrorMessage(error: ValidationError): string {
  let message: string = '';
  const messages: Constraint | undefined = findConstraints(error);

  if (messages === undefined) {
    return 'Invalid parameter';
  }

  Object.keys(messages).forEach((key: string): void => {
    message += `${message === '' ? '' : ' -- '}${messages[key]}`;
  });

  return message;
}

/**
 * Find contraints in an error oject
 */
function findConstraints(error: ValidationError): Constraint | undefined {
  let objectToIterate: ValidationError = error;
  while (objectToIterate.children !== undefined) {
    objectToIterate = objectToIterate.children[0];
  }

  return objectToIterate.constraints;
}

/**
 * Contraints of the validation
 */
interface Constraint {
  [type: string]: string;
}

/**
 * Exception response
 */
interface ExceptionResponse {
  code?: string;
  error?: string;
  message?: string | string[] | ValidationError[];
}
